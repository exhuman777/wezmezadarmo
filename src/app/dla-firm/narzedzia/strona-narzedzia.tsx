import type { Metadata } from 'next';
import Link from 'next/link';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import { narzedzie, type Narzedzie } from '@/lib/narzedzia/lista';

/** Metadane z rejestru stron (title, opis, słowa kluczowe, canonical, OG z adresem). Obraz OG z opengraph-image.tsx w folderze narzędzia. */
export function metadaneNarzedzia(slug: Narzedzie['slug']): Metadata {
  return metadaneStrony(narzedzie(slug).adres);
}

/** Strona statycznego narzędzia (KPiR, JPK): krótki opis i jeden przycisk prosto do narzędzia. Bez formularza i konta. */
export function StronaNarzedzia({ slug }: { slug: 'kpir' | 'jpk' }) {
  const n = narzedzie(slug);
  return (
    <div className="prosta">
      <StronaJsonLd sciezka={n.adres} />
      <section className="prosta-blok">
        <p className="mala"><Link href="/dla-firm/narzedzia">Narzędzia dla firm</Link> / {n.nazwa}</p>
        <h1>{n.nazwa}</h1>
        <p className="pod">{n.opis}</p>
        <div className="przyciski">
          <a href={n.cel} className="btn btn-rdza btn-lg" data-testid="otworz-narzedzie">Otwórz narzędzie</a>
        </div>
        <p className="mala" style={{ marginTop: 12 }}>Za darmo, bez konta i bez podawania danych. Plik zostaje w Twojej przeglądarce.</p>
      </section>
      <section className="prosta-blok">
        <h2>Więcej dla firm</h2>
        <ul className="linki">
          <li><Link href="/dla-firm/narzedzia/dofinansowania"><span>Dofinansowania po NIP<small>Programy dopasowane do PKD i województwa firmy.</small></span><span aria-hidden="true">→</span></Link></li>
          <li><a href="https://doginvoice.com" target="_blank" rel="noopener"><span>DogInvoice<small>Faktury z KSeF wpadają same, a wpłaty dopasowują się do faktur.</small></span><span aria-hidden="true">→</span></a></li>
        </ul>
        <p className="mala" style={{ marginTop: 16 }}>Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki. To nie jest doradztwo podatkowe: decyzję podejmuje księgowa.</p>
      </section>
    </div>
  );
}
