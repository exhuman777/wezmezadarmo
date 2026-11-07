import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import { PixelIcon } from '@/components/PixelIcon';
import Link from 'next/link';
import { NARZEDZIA } from '@/lib/narzedzia/lista';

export const metadata: Metadata = metadaneStrony('/dla-firm/narzedzia');

/** Narzędzia dla firm: KPiR i JPK otwierają się od razu, e-mail pada tylko przy sprawdzeniu firmy po NIP. */
export default function NarzedziaPage() {
  return (
    <div className="prosta">
      <StronaJsonLd sciezka="/dla-firm/narzedzia" />
      <section className="prosta-blok">
        <h1><PixelIcon nazwa="dokument" />Narzędzia dla firm za darmo</h1>
        <p className="pod">Sprawdź księgę KPiR i plik JPK_V7 od razu, bez konta i bez formularza. Pliki czyta tylko Twoja przeglądarka, nie wysyłamy ich na serwer.</p>
      </section>

      <section className="prosta-blok">
        <h2>Wybierz narzędzie</h2>
        <ul className="linki">
          {NARZEDZIA.map((n) => (
            <li key={n.slug}>
              {n.email ? (
                <Link href={n.adres}><span>{n.nazwa}<small>{n.opis}</small></span><span aria-hidden="true">→</span></Link>
              ) : (
                <a href={n.cel}><span>{n.nazwa}<small>{n.opis}</small></span><span aria-hidden="true">→</span></a>
              )}
            </li>
          ))}
        </ul>
        <p className="mala" style={{ marginTop: 12 }}>Tylko dofinansowania po NIP proszą o e-mail. Reszta działa od razu.</p>
      </section>

      <section className="prosta-blok">
        <h2>Po sprawdzeniu</h2>
        <p className="pod">Faktury z KSeF i wpłaty od klientów w jednym widoku daje <a href="https://doginvoice.com" target="_blank" rel="noopener">DogInvoice</a>: widzisz, czy zapłacili Ci za fakturę. Telefon w firmie odbierze <a href="https://doganswer.com" target="_blank" rel="noopener">DogAnswer</a>, asystent AI, także wieczorem i w święta.</p>
      </section>

      <section className="prosta-blok">
        <p className="mala">Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki. To nie jest doradztwo podatkowe: decyzję podejmuje księgowa. <Link href="/dla-firm">Wróć do strony dla firm</Link>.</p>
      </section>
    </div>
  );
}
