import { NextRequest, NextResponse } from 'next/server';
import { ciasteczkoPodgladu, polaTokenu, PRZEKAZNIK_PODGLAD, przezPrzekaznik } from '@/lib/powiadomienia';

// Test toru powiadomień: wyłącznie na podglądzie (VERCEL_ENV=preview), treść stała, odbiorcę ustala przekaźnik.
// Body: { przekaznik: adres /api/powiadomienie na podglądzie Cyfrowego Pomocnika, share: token linku udostępniania }.
// Na produkcji zawsze 404.
export async function POST(req: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') return new NextResponse('Not found', { status: 404 });
  const b = (await req.json().catch(() => ({}))) as { przekaznik?: string; share?: string };
  if (!b.przekaznik || !PRZEKAZNIK_PODGLAD.test(b.przekaznik) || !b.share) return NextResponse.json({ ok: false }, { status: 400 });
  const token = req.headers.get('x-vercel-oidc-token') || process.env.VERCEL_OIDC_TOKEN || '';
  const cookie = await ciasteczkoPodgladu(b.przekaznik, b.share);
  const w = await przezPrzekaznik({ strona: 'wezmezadarmo.com', formularz: 'test toru powiadomień', pola: { 'Treść': 'TEST powiadomienia tuKamil, proszę zignorować' } }, token, fetch, { url: b.przekaznik, cookie });
  return NextResponse.json({ wyslane: !!w?.wyslane, id: w?.id ?? null, oidc: polaTokenu(token) });
}
