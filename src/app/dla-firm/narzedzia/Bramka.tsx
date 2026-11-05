import Link from 'next/link';
import type { Narzedzie } from '@/lib/narzedzia/lista';
import { FormularzDostepu } from './FormularzDostepu';
import { StronaJsonLd } from '@/components/JsonLd';

/** Strona pojedynczego narzędzia bez dostępu: krótki opis i formularz, po wysłaniu od razu narzędzie. */
export function Bramka({ n, next }: { n: Narzedzie; next: string }) {
  return (
    <div className="prosta">
      <StronaJsonLd sciezka={n.adres} />
      <section className="prosta-blok">
        <p className="mala"><Link href="/dla-firm/narzedzia">Narzędzia dla firm</Link> / {n.nazwa}</p>
        <h1>{n.nazwa}</h1>
        <p className="pod">{n.opis}</p>
      </section>
      <section className="prosta-blok" id="dostep">
        <h2>Otwórz za darmo</h2>
        <p className="pod">Podaj e-mail i telefon, narzędzie otworzy się od razu. Bez zakładania konta.</p>
        <div style={{ marginTop: 16 }}><FormularzDostepu next={next} przycisk="Otwórz narzędzie" /></div>
      </section>
      <section className="prosta-blok">
        <p className="mala">Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki. To nie jest doradztwo podatkowe: decyzję podejmuje księgowa.</p>
      </section>
    </div>
  );
}
