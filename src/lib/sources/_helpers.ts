/**
 * Wspolne helpery dla publicznych endpointow integracji.
 * Rate limit per IP + sanitized errors.
 */

import { NextRequest, NextResponse } from 'next/server';

const buckets: Map<string, Map<string, number[]>> = new Map();

export function rateLimit(
  bucketName: string,
  request: NextRequest,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; response: NextResponse } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const now = Date.now();
  if (!buckets.has(bucketName)) buckets.set(bucketName, new Map());
  const bucket = buckets.get(bucketName)!;
  const hits = (bucket.get(ip) ?? []).filter(t => now - t < windowMs);
  if (hits.length >= max) {
    bucket.set(ip, hits);
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Przekroczono limit zapytań. Spróbuj później.' },
        { status: 429 },
      ),
    };
  }
  hits.push(now);
  bucket.set(ip, hits);
  return { ok: true };
}

export function publicError(err: unknown, label: string): NextResponse {
  console.error(`[${label}]`, err);
  return NextResponse.json(
    { error: 'Źródło danych chwilowo niedostępne. Spróbuj później.' },
    { status: 502 },
  );
}
