import { NextRequest, NextResponse } from 'next/server';
import { bezpiecznyNext, walidujLead } from '@/lib/narzedzia/walidacja';
import { hashTokenu, nowyToken, terminTokenu } from '@/lib/narzedzia/token';
import { magazyn } from '@/lib/narzedzia/leady';
import { linkPotwierdzenia, powiadomWlasciciela, wyslijLink } from '@/lib/narzedzia/mail';
import { trybTestowy } from '@/lib/narzedzia/dostep';
import { hashIp, ipZadania, limitOk } from '@/lib/narzedzia/limit';
import { zapiszZgody } from '@/lib/zgodyZapis';
import { ZGODY_PUSTE } from '@/lib/zgody';

/**
 * Formularz przy sprawdzeniu firmy po NIP (/dla-firm/narzedzia/dofinansowania): e-mail i zgoda, imię opcjonalnie.
 * To jedyne miejsce w serwisie, które prosi o e-mail. Double opt-in: zapis leada z jednorazowym tokenem
 * i mail z linkiem. Ciasteczko dostępu (30 dni) daje dopiero kliknięcie linku (/api/narzedzia/potwierdz),
 * więc wynik widzi tylko ktoś, kto ma dostęp do skrzynki. Bez wysłanego maila nie ma dostępu.
 * Tryb testowy (NARZEDZIA_TRYB_TESTOWY=1 poza Vercelem): nic nie wychodzi, odpowiedź zawiera linkTestowy.
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
  // Bot w pułapce: udajemy sukces, nic nie zapisujemy i nic nie wysyłamy.
  if (!wynik.ok && wynik.pulapka) return NextResponse.json({ ok: true, wyslano: true });
  if (!wynik.ok) return NextResponse.json({ error: wynik.blad }, { status: 400 });

  const ip = ipZadania(request.headers);
  if (!limitOk(ip)) {
    return NextResponse.json({ error: 'Za dużo prób. Spróbuj ponownie za godzinę.' }, { status: 429 });
  }

  const token = nowyToken();
  try {
    await magazyn().zapiszOczekujacy(wynik.dane, hashTokenu(token), terminTokenu(), `dofinansowania-po-nip${next === '/dla-firm/narzedzia/dofinansowania' ? '' : ` -> ${next}`}`.slice(0, 120), hashIp(ip));
  } catch {
    console.error('[narzedzia/lead] zapis nieudany');
    return NextResponse.json({ error: 'Nie udało się zapisać. Spróbuj za chwilę.' }, { status: 500 });
  }

  // Zgody (które, wersja, treść, data) w zgody_formularzy. Błąd zapisu logujemy, ale nie blokujemy: wymaganą zgodę ma też leady_narzedzia.
  await zapiszZgody({ formularz: 'dofinansowania-po-nip', email: wynik.dane.email, zgody: wynik.dane.zgody ?? { ...ZGODY_PUSTE, email: true }, zTelefonem: true }).catch(() => {
    console.error('[narzedzia/lead] zapis zgód nieudany (migracja 20261106_zgody_formularzy.sql?)');
  });

  if (trybTestowy()) {
    return NextResponse.json({ ok: true, wyslano: true, linkTestowy: linkPotwierdzenia(token, new URL(request.url).origin) });
  }

  // Dostęp zależy od maila, więc błąd wysyłki zwracamy użytkownikowi (bez szczegółów technicznych).
  try {
    await wyslijLink(wynik.dane.email, linkPotwierdzenia(token), wynik.dane.imie);
  } catch {
    console.error('[narzedzia/lead] wysyłka maila nieudana');
    return NextResponse.json({ error: 'Nie udało się wysłać maila z linkiem. Spróbuj za kilka minut.' }, { status: 502 });
  }
  await powiadomWlasciciela(wynik.dane).catch(() => {
    console.error('[narzedzia/lead] powiadomienie właściciela nieudane');
  });
  return NextResponse.json({ ok: true, wyslano: true });
}
