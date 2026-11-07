import { NextRequest, NextResponse } from 'next/server';
import { powiadomKamila } from '@/lib/powiadomienia';
import { rateLimit } from '@/lib/sources/_helpers';
import { BLAD_ZGODY, odczytajZgody } from '@/lib/zgody';
import { zapiszZgody } from '@/lib/zgodyZapis';
import { domenaJednorazowa } from '@/lib/narzedzia/walidacja';

export async function POST(req: NextRequest) {
  const limit = rateLimit('contact', req, 5, 60 * 60_000); // 5 wiadomości / h / IP
  if (!limit.ok) return limit.response;

  let body: { imie?: string; firma?: string; email?: string; wiadomosc?: string; zgody?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format danych.' }, { status: 400 });
  }

  const { firma, email, wiadomosc } = body;
  // Imię opcjonalne: formularz kontaktowy potrzebuje tylko adresu do odpowiedzi i treści.
  const imie = typeof body.imie === 'string' && body.imie.trim() ? body.imie.trim() : 'nie podano';

  if (!email || !wiadomosc) {
    return NextResponse.json({ error: 'Uzupełnij wymagane pola.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Podaj poprawny adres e-mail.' }, { status: 400 });
  }

  if (domenaJednorazowa(email)) {
    return NextResponse.json({ error: 'Adresy jednorazowe nie działają. Podaj stały adres e-mail, na który odpowiemy.' }, { status: 400 });
  }

  if (typeof imie !== 'string' || typeof email !== 'string' || typeof wiadomosc !== 'string' || (firma !== undefined && typeof firma !== 'string')) {
    return NextResponse.json({ error: 'Nieprawidłowy format danych.' }, { status: 400 });
  }

  if (imie.length > 200 || email.length > 254 || (firma?.length ?? 0) > 200) {
    return NextResponse.json({ error: 'Za długie dane w formularzu.' }, { status: 400 });
  }

  if (wiadomosc.length > 5000) {
    return NextResponse.json({ error: 'Wiadomość jest za długa.' }, { status: 400 });
  }

  // Osobne zgody (src/lib/zgody.ts): wymagana tylko zgoda na kontakt e-mailem w sprawie zgłoszenia.
  const zgody = odczytajZgody(body.zgody, false);
  if (!zgody.email) return NextResponse.json({ error: BLAD_ZGODY }, { status: 400 });
  await zapiszZgody({ formularz: 'kontakt', email, zgody, zTelefonem: false }).catch(() => {
    console.error('[contact] zapis zgód nieudany (migracja 20261106_zgody_formularzy.sql?)');
  });
  const opisZgod = [zgody.email && 'e-mail w sprawie zgłoszenia', zgody.emailOferty && 'oferty e-mailem', zgody.ai && 'kontakt przez AI'].filter(Boolean).join(', ');

  // Formularz nie ma własnej bazy: mail do Kamila jest zapisem zgłoszenia, więc przy błędzie prosimy o ponowienie.
  const wynik = await powiadomKamila({
    strona: 'wezmezadarmo.com',
    formularz: 'Napisz do nas',
    pola: { 'Imię': imie, Firma: firma, 'E-mail': email, 'Wiadomość': wiadomosc, Zgody: opisZgod },
    odpowiedzDo: email,
  });
  if (!wynik.wyslane) {
    return NextResponse.json({ error: 'Błąd wysyłania. Spróbuj ponownie.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
