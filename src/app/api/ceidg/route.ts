import { NextRequest, NextResponse } from 'next/server';
import { lookupNip, validateNip, type CeidgBusinessData } from '@/lib/ceidg';
import { searchByNip } from '@/lib/sources/whitelist';

interface EnrichedData extends CeidgBusinessData {
  vat: {
    status: 'Czynny' | 'Zwolniony' | 'Niezarejestrowany' | null;
    registeredAt: string | null;
    removedAt: string | null;
  } | null;
}

// Rate limit: 10 lookups per IP per 24h
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();

// Cache enriched lookups for 24h (CEIDG data rarely changes; saves API quota)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const nipCache = new Map<string, { data: EnrichedData; ts: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    ipHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return true;
}

function getCached(nip: string): EnrichedData | null {
  const entry = nipCache.get(nip);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    nipCache.delete(nip);
    return null;
  }
  return entry.data;
}

export async function POST(request: NextRequest) {
  try {
    const { nip } = await request.json();

    if (!nip || typeof nip !== 'string') {
      return NextResponse.json({ error: 'Brak numeru NIP' }, { status: 400 });
    }

    const cleanNip = nip.replace(/[\s-]/g, '');
    if (!validateNip(cleanNip)) {
      return NextResponse.json({ error: 'Nieprawidłowy numer NIP' }, { status: 400 });
    }

    // Cache check (no rate limit hit for cached lookups)
    const cached = getCached(cleanNip);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Rate limit per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    if (!checkRate(ip)) {
      return NextResponse.json(
        { error: 'Przekroczono dzienny limit zapytań. Spróbuj jutro.' },
        { status: 429 },
      );
    }

    // Fan-out: CEIDG + Biała Lista in parallel
    const [ceidgData, vatResult] = await Promise.allSettled([
      lookupNip(cleanNip),
      searchByNip(cleanNip),
    ]);

    if (ceidgData.status === 'rejected') {
      throw ceidgData.reason;
    }

    const enriched: EnrichedData = {
      ...ceidgData.value,
      vat: vatResult.status === 'fulfilled' && vatResult.value
        ? {
            status: vatResult.value.statusVat,
            registeredAt: vatResult.value.registrationLegalDate,
            removedAt: vatResult.value.removalDate,
          }
        : null,
    };

    // Fallback nazwy + adresu z Bialej Listy gdy CEIDG nie znalazl (spolki SA/sp.z.o.o nie sa w CEIDG)
    if (!enriched.nazwa && vatResult.status === 'fulfilled' && vatResult.value) {
      enriched.nazwa = vatResult.value.name ?? null;
    }

    nipCache.set(cleanNip, { data: enriched, ts: Date.now() });
    return NextResponse.json(enriched);
  } catch (error) {
    // Log full error server-side, send sanitized to client
    console.error('[ceidg] lookup failed:', error);
    return NextResponse.json(
      { error: 'Nie udało się sprawdzić NIP w rejestrze. Spróbuj później.' },
      { status: 500 },
    );
  }
}
