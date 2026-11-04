import { NextRequest, NextResponse } from 'next/server';
import { bezpiecznyNext, walidujLead } from '@/lib/narzedzia/walidacja';
import { hashTokenu, nowyToken, terminTokenu } from '@/lib/narzedzia/token';
import { magazyn } from '@/lib/narzedzia/leady';
import { linkPotwierdzenia, powiadomWlasciciela, wyslijLink } from '@/lib/narzedzia/mail';
import { COOKIE_DOSTEP, DOSTEP_DNI, trybTestowy, wydajDostep } from '@/lib/narzedzia/dostep';
import { hashIp, ipZadania, limitOk } from '@/lib/narzedzia/limit';

/**
 * Formularz dostępu do narzędzi dla firm (e-mail, telefon, zgoda).
 * Zapis leada, ciasteczko dostępu od razu w odpowiedzi (30 dni), potem mail z linkiem jako potwierdzenie
 * (otwiera narzędzia na innym urządzeniu) i powiadomienie dla Kamila. Błąd maila nie blokuje dostępu.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane formularza.' }, { status: 400 });
  }

  const next = bezpiecznyNext((body as { next?: unknown } | null)?.next);
  const wynik = walidujLead(body);
  // Bot w pułapce: udajemy sukces, nic nie zapisujemy i nie dajemy dostępu.
  if (!wynik.ok && wynik.pulapka) return NextResponse.json({ ok: true, next });
  if (!wynik.ok) return NextResponse.json({ error: wynik.blad }, { status: 400 });

  const ip = ipZadania(request.headers);
  if (!limitOk(ip)) {
    return NextResponse.json({ error: 'Za dużo prób. Spróbuj ponownie za godzinę.' }, { status: 429 });
  }

  const token = nowyToken();
  let idLeada: string;
  try {
    idLeada = await magazyn().zapiszOczekujacy(wynik.dane, hashTokenu(token), terminTokenu(), `dla-firm/narzedzia${next === '/dla-firm/narzedzia' ? '' : ` -> ${next}`}`.slice(0, 120), hashIp(ip));
  } catch {
    console.error('[narzedzia/lead] zapis nieudany');
    return NextResponse.json({ error: 'Nie udało się zapisać. Spróbuj za chwilę.' }, { status: 500 });
  }

  const wartosc = await wydajDostep(idLeada);
  if (!wartosc) {
    console.error('[narzedzia/lead] brak sekretu dostępu (NARZEDZIA_SECRET albo SUPABASE_SERVICE_ROLE_KEY)');
    return NextResponse.json({ error: 'Coś poszło nie tak po naszej stronie. Spróbuj za chwilę.' }, { status: 500 });
  }

  const tryb = trybTestowy();
  const res = NextResponse.json(tryb ? { ok: true, next, linkTestowy: linkPotwierdzenia(token, new URL(request.url).origin) } : { ok: true, next });
  res.cookies.set(COOKIE_DOSTEP, wartosc, {
    httpOnly: true,
    secure: !tryb,
    sameSite: 'lax',
    path: '/',
    maxAge: DOSTEP_DNI * 24 * 3600,
  });
  if (tryb) return res;

  // Maile nie blokują dostępu: ciasteczko jest już w odpowiedzi.
  await Promise.allSettled([
    wyslijLink(wynik.dane.email, linkPotwierdzenia(token), wynik.dane.imie).catch(() => {
      console.error('[narzedzia/lead] wysyłka maila nieudana');
    }),
    powiadomWlasciciela(wynik.dane).catch(() => {
      console.error('[narzedzia/lead] powiadomienie właściciela nieudane');
    }),
  ]);
  return res;
}
