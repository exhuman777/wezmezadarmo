import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { canonical } from '@/lib/seo';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { NARZEDZIA } from '@/lib/narzedzia/lista';
import { bezpiecznyNext } from '@/lib/narzedzia/walidacja';
import { FormularzDostepu } from './FormularzDostepu';

export const metadata: Metadata = {
  title: 'Narzędzia dla firm za darmo: KPiR, JPK_V7, dofinansowania | wezmezadarmo',
  description: 'Sprawdź za darmo księgę KPiR, plik JPK_V7 przed 2027 i dofinansowania dla firmy po NIP. Bez zakładania konta: wystarczy e-mail i telefon.',
  alternates: canonical('/dla-firm/narzedzia'),
};

const KOMUNIKATY: Record<string, string> = {
  ok: 'Adres potwierdzony. Narzędzia są otwarte na tym urządzeniu przez 30 dni.',
  wygasl: 'Link wygasł. Wypełnij formularz jeszcze raz, narzędzia otworzą się od razu.',
  'zly-link': 'Ten link jest nieprawidłowy albo został już użyty. Wypełnij formularz jeszcze raz, narzędzia otworzą się od razu.',
  blad: 'Coś poszło nie tak po naszej stronie. Spróbuj za chwilę.',
};

interface Props {
  searchParams: Promise<{ dostep?: string; wymagany?: string; next?: string }>;
}

export default async function NarzedziaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const jar = await cookies();
  const maDostep = await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value);
  const komunikat = sp.dostep ? KOMUNIKATY[sp.dostep] : sp.wymagany && !maDostep ? 'Narzędzia otwierają się po krótkim formularzu: e-mail i telefon.' : null;
  const next = bezpiecznyNext(sp.next);

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
              <li key={n.slug}>
                <a href={n.cel}><span>{n.nazwa}<small>{n.opis}</small></span><span aria-hidden="true">→</span></a>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="linki">
            {NARZEDZIA.map((n) => (
              <li key={n.slug}>
                <Link href={n.adres}><span>{n.nazwa}<small>{n.opis}</small></span><span aria-hidden="true">→</span></Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!maDostep && (
        <section className="prosta-blok" id="dostep">
          <h2>Otwórz wszystkie narzędzia</h2>
          <p className="pod">Podaj e-mail i telefon, narzędzia otworzą się od razu na 30 dni. Bez zakładania konta.</p>
          <div style={{ marginTop: 16 }}><FormularzDostepu next={next} /></div>
        </section>
      )}

      <section className="prosta-blok">
        <p className="mala">Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki. To nie jest doradztwo podatkowe: decyzję podejmuje księgowa. <Link href="/dla-firm">Wróć do strony dla firm</Link>.</p>
      </section>
    </div>
  );
}
