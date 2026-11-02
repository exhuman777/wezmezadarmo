import { NextRequest, NextResponse } from 'next/server';
import { hashTokenu, poprawnyFormat } from '@/lib/narzedzia/token';
import { magazyn } from '@/lib/narzedzia/leady';
import { COOKIE_DOSTEP, DOSTEP_DNI, trybTestowy, wydajDostep } from '@/lib/narzedzia/dostep';

/** Kliknięcie linku z maila: jednorazowy token → ciasteczko dostępu (30 dni) → narzędzia. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const baza = trybTestowy() ? url.origin : 'https://www.wezmezadarmo.com';
  const wroc = (stan: string) => NextResponse.redirect(`${baza}/dla-firm/narzedzia?dostep=${stan}`);

  const token = url.searchParams.get('token');
  if (!poprawnyFormat(token)) return wroc('zly-link');

  let wynik;
  try {
    wynik = await magazyn().potwierdz(hashTokenu(token));
  } catch {
    console.error('[narzedzia/potwierdz] błąd bazy');
    return wroc('blad');
  }
  if (!wynik.ok) return wroc(wynik.powod === 'wygasl' ? 'wygasl' : 'zly-link');

  const wartosc = await wydajDostep(wynik.id);
  if (!wartosc) {
    console.error('[narzedzia/potwierdz] brak NARZEDZIA_SECRET');
    return wroc('blad');
  }
  const res = wroc('ok');
  res.cookies.set(COOKIE_DOSTEP, wartosc, {
    httpOnly: true,
    secure: !trybTestowy(),
    sameSite: 'lax',
    path: '/',
    maxAge: DOSTEP_DNI * 24 * 3600,
  });
  return res;
}
