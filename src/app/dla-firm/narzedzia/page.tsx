import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { canonical } from '@/lib/seo';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { FormularzDostepu } from './FormularzDostepu';

export const metadata: Metadata = {
  title: 'Narzędzia dla firm za darmo: KPiR, JPK_V7, dofinansowania | wezmezadarmo',
  description: 'Sprawdź za darmo księgę KPiR, plik JPK_V7 przed 2027 i dofinansowania dla firmy po NIP. Bez zakładania konta: link do narzędzi dostajesz mailem.',
  alternates: canonical('/dla-firm/narzedzia'),
};

const NARZEDZIA = [
  {
    href: '/narzedzia/kpir/kpir/',
    nazwa: 'Przegląd księgi KPiR',
    opis: 'Wgrywasz księgę (PDF z Optimy, JPK_PKPIR, XLSX albo CSV) i widzisz kondycję firmy, wpisy do sprawdzenia przed JPK_PKPIR, zaliczki PIT i zdrowotną oraz porównanie form opodatkowania na 2027.',
  },
  {
    href: '/narzedzia/jpk/',
    nazwa: 'Przegląd JPK_V7 przed 2027',
    opis: 'Wgrywasz plik JPK_V7M albo JPK_V7K (opcjonalnie faktury FA(3) z KSeF) i dostajesz listę pozycji do wyjaśnienia oraz kalendarz zmian do 2028.',
  },
  {
    href: '/dla-firm/narzedzia/dofinansowania',
    nazwa: 'Dofinansowania po NIP',
    opis: 'Wpisujesz NIP, pobieramy dane firmy z CEIDG i dopasowujemy programy dofinansowań z naszej bazy.',
  },
];

const KOMUNIKATY: Record<string, string> = {
  ok: 'Adres potwierdzony. Narzędzia są otwarte na tym urządzeniu przez 30 dni.',
  wygasl: 'Link wygasł. Wpisz e-mail jeszcze raz, wyślemy nowy.',
  'zly-link': 'Ten link jest nieprawidłowy albo został już użyty. Wpisz e-mail jeszcze raz, wyślemy nowy.',
  blad: 'Coś poszło nie tak po naszej stronie. Spróbuj za chwilę.',
};

interface Props {
  searchParams: Promise<{ dostep?: string; wymagany?: string }>;
}

export default async function NarzedziaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const jar = await cookies();
  const maDostep = await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value);
  const komunikat = sp.dostep ? KOMUNIKATY[sp.dostep] : sp.wymagany && !maDostep ? 'Narzędzia otwierają się po potwierdzeniu adresu e-mail. Wpisz go niżej.' : null;

  return (
    <div className="prosta">
      <section className="prosta-blok">
        <h1>Narzędzia dla firm za darmo</h1>
        <p className="pod">Sprawdź księgę KPiR, plik JPK_V7 i dofinansowania. Bez zakładania konta. Pliki czyta tylko Twoja przeglądarka, nie wysyłamy ich na serwer.</p>
        {komunikat && (
          <p role="status" style={{ marginTop: 16, padding: '12px 14px', border: '2px solid var(--tusz)', background: 'var(--kafel)', fontWeight: 600 }}>{komunikat}</p>
        )}
      </section>

      <section className="prosta-blok">
        <h2>{maDostep ? 'Wybierz narzędzie' : 'Co sprawdzisz'}</h2>
        {maDostep ? (
          <ul className="linki">
            {NARZEDZIA.map((n) => (
              <li key={n.href}>
                <a href={n.href}><span>{n.nazwa}<small>{n.opis}</small></span><span aria-hidden="true">→</span></a>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="lista">
            {NARZEDZIA.map((n) => (
              <li key={n.href}><b>{n.nazwa}</b>: {n.opis}</li>
            ))}
          </ul>
        )}
      </section>

      {!maDostep && (
        <section className="prosta-blok" id="dostep">
          <h2>Dostań link do narzędzi</h2>
          <p className="pod">Podaj e-mail, wyślemy link. Imię i telefon są opcjonalne, przydadzą się, jeśli chcesz, żebyśmy pomogli z wynikiem.</p>
          <div style={{ marginTop: 16 }}><FormularzDostepu /></div>
        </section>
      )}

      <section className="prosta-blok">
        <p className="mala">Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki. To nie jest doradztwo podatkowe: decyzję podejmuje księgowa. <Link href="/dla-firm">Wróć do strony dla firm</Link>.</p>
      </section>
    </div>
  );
}
