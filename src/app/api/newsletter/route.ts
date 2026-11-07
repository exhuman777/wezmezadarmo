import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateToken, sendConfirmEmail } from '@/lib/newsletter';
import { rateLimit } from '@/lib/sources/_helpers';
import { powiadomKamila } from '@/lib/powiadomienia';
import { ZGODA_NEWSLETTER, odczytajZgody } from '@/lib/zgody';
import { zapiszZgody } from '@/lib/zgodyZapis';

interface NewsletterPayload {
  email: string;
  profileType: 'private' | 'jdg';
  zgody?: unknown;
}

// Rate limit: 5 zapisow per IP per 24h (anty-spam)
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  const limitIp = rateLimit('newsletter', request, 5, 60 * 60_000);
  if (!limitIp.ok) return limitIp.response;
  try {
    const body = (await request.json()) as Partial<NewsletterPayload>;
    const email = body.email?.trim().toLowerCase() ?? '';
    const profileType = body.profileType === 'jdg' ? 'jdg' : 'private';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Nieprawidłowy adres e-mail' }, { status: 400 });
    }

    // Wymagana tylko zgoda na newsletter e-mailem; oferty i kontakt przez AI dobrowolne (src/lib/zgody.ts).
    const zgody = odczytajZgody(body.zgody, false);
    if (!zgody.email) {
      return NextResponse.json({ error: 'Zaznacz zgodę na newsletter e-mailem. Pozostałe zgody są dobrowolne.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    if (!checkRate(ip)) {
      return NextResponse.json({ error: 'Przekroczono dzienny limit zapisów' }, { status: 429 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error('[newsletter] missing Supabase credentials');
      return NextResponse.json({ error: 'Konfiguracja serwera niepełna' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    await zapiszZgody({ formularz: 'newsletter', email, zgody, zTelefonem: false, trescEmail: ZGODA_NEWSLETTER }).catch(() => {
      console.error('[newsletter] zapis zgód nieudany (migracja 20261106_zgody_formularzy.sql?)');
    });

    // Sprawdz czy email juz zapisany i potwierdzony
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('confirmed, unsubscribed_at, confirmation_token')
      .eq('email', email)
      .maybeSingle();

    // Jesli juz potwierdzony i nie wypisany -- nic nie rob, ale udawaj sukces
    if (existing?.confirmed && !existing.unsubscribed_at) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    // Generuj nowy token i upsert
    const token = generateToken();
    const { error: upsertError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          profile_type: profileType,
          confirmed: false,
          confirmation_token: token,
          confirmed_at: null,
          unsubscribed_at: null, // re-subscribe gdyby byl unsubscribed
          ip,
        },
        { onConflict: 'email' },
      );

    if (upsertError) {
      console.error('[newsletter] supabase upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Nie udało się zapisać. Spróbuj później.' },
        { status: 500 },
      );
    }

    await powiadomKamila({
      strona: 'wezmezadarmo.com',
      formularz: 'zapis na newsletter',
      pola: { 'E-mail': email, Profil: profileType },
    });

    // Wyslij email potwierdzajacy (Resend)
    try {
      await sendConfirmEmail(email, token, profileType);
    } catch (emailErr) {
      console.error('[newsletter] email send failed:', emailErr);
      // Nie blokuj zapisu z powodu emaila -- mozna ponownie wyslac
      return NextResponse.json({
        ok: true,
        warning: 'Zapisano, ale email potwierdzajacy nie poszedl. Skontaktuj sie z nami.',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] exception:', err);
    return NextResponse.json(
      { error: 'Nie udało się zapisać. Spróbuj później.' },
      { status: 500 },
    );
  }
}
