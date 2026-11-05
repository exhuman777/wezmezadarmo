import { NextRequest, NextResponse } from 'next/server';
import { powiadomKamila } from '@/lib/powiadomienia';
import { rateLimit } from '@/lib/sources/_helpers';

export async function POST(req: NextRequest) {
  const limit = rateLimit('contact', req, 5, 60 * 60_000); // 5 wiadomości / h / IP
  if (!limit.ok) return limit.response;

  let body: { imie?: string; firma?: string; email?: string; wiadomosc?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format danych.' }, { status: 400 });
  }

  const { imie, firma, email, wiadomosc } = body;

  if (!imie || !email || !wiadomosc) {
    return NextResponse.json({ error: 'Uzupełnij wymagane pola.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Podaj poprawny adres e-mail.' }, { status: 400 });
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

  // Formularz nie ma własnej bazy: mail do Kamila jest zapisem zgłoszenia, więc przy błędzie prosimy o ponowienie.
  const wynik = await powiadomKamila({
    strona: 'wezmezadarmo.com',
    formularz: 'zapytanie o automatyzację',
    pola: { 'Imię i nazwisko': imie, Firma: firma, 'E-mail': email, 'Wiadomość': wiadomosc, Strona: '/automatyzacje' },
    odpowiedzDo: email,
  });
  if (!wynik.wyslane) {
    return NextResponse.json({ error: 'Błąd wysyłania. Spróbuj ponownie.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
