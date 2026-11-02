import { NextRequest, NextResponse } from 'next/server';
import { walidujLead } from '@/lib/narzedzia/walidacja';
import { hashTokenu, nowyToken, terminTokenu } from '@/lib/narzedzia/token';
import { magazyn } from '@/lib/narzedzia/leady';
import { linkPotwierdzenia, wyslijLink } from '@/lib/narzedzia/mail';
import { trybTestowy } from '@/lib/narzedzia/dostep';
import { hashIp, ipZadania, limitOk } from '@/lib/narzedzia/limit';

/** Formularz dostępu do narzędzi dla firm: zapis leada (oczekujący) i mail z jednorazowym linkiem. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane formularza.' }, { status: 400 });
  }

  const wynik = walidujLead(body);
  // Bot w pułapce: udajemy sukces, nic nie zapisujemy.
  if (!wynik.ok && wynik.pulapka) return NextResponse.json({ ok: true });
  if (!wynik.ok) return NextResponse.json({ error: wynik.blad }, { status: 400 });

  const ip = ipZadania(request.headers);
  if (!limitOk(ip)) {
    return NextResponse.json({ error: 'Za dużo prób. Spróbuj ponownie za godzinę.' }, { status: 429 });
  }

  const token = nowyToken();
  try {
    await magazyn().zapiszOczekujacy(wynik.dane, hashTokenu(token), terminTokenu(), 'dla-firm/narzedzia', hashIp(ip));
  } catch {
    console.error('[narzedzia/lead] zapis nieudany');
    return NextResponse.json({ error: 'Nie udało się zapisać. Spróbuj za chwilę.' }, { status: 500 });
  }

  if (trybTestowy()) {
    const baza = new URL(request.url).origin;
    return NextResponse.json({ ok: true, linkTestowy: linkPotwierdzenia(token, baza) });
  }

  try {
    await wyslijLink(wynik.dane.email, linkPotwierdzenia(token), wynik.dane.imie);
  } catch {
    console.error('[narzedzia/lead] wysyłka maila nieudana');
    return NextResponse.json({ error: 'Zapisaliśmy adres, ale mail nie wyszedł. Spróbuj ponownie za chwilę.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
