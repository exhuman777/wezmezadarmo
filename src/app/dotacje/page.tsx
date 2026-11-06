import type { Metadata } from 'next';
import Link from 'next/link';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import { DotacjeContactForm } from '@/components/DotacjeContactForm';
import { PROGRAMS } from '@/data/programs-b2b';
import { WyszukiwarkaProgramow } from './WyszukiwarkaProgramow';

export const metadata: Metadata = metadaneStrony('/dotacje');

const KROKI = [
  { num: '01', title: 'Szukaj bez konta', desc: `Wyszukiwarka poniżej przegląda ${PROGRAMS.length} programów z bazy. Bez logowania i bez e-maila.` },
  { num: '02', title: 'Sprawdź firmę po NIP', desc: 'Podajesz e-mail i NIP, pobieramy z CEIDG PKD i województwo, a program pokazuje pasujące nabory.' },
  { num: '03', title: 'Czytaj ogłoszenie naboru', desc: 'Przy każdym programie jest link do strony instytucji. Tam są regulamin, kryteria i termin.' },
];

export default function DotacjePage() {
  return (
    <main className="prosta">
      <StronaJsonLd sciezka="/dotacje" />

      <section className="prosta-blok">
        <p className="etykieta">Dla firm i JDG</p>
        <h1>Dotacje dla Twojej firmy</h1>
        <p className="pod">Wyszukiwarka programów dofinansowań działa od razu, bez konta i bez e-maila. Dopasowanie do firmy po NIP wymaga tylko adresu e-mail.</p>
        <div className="przyciski">
          <a href="#wyszukiwarka" className="btn btn-rdza btn-lg">Szukaj programu</a>
          <Link href="/dla-firm/narzedzia/dofinansowania" className="btn btn-lg">Sprawdź firmę po NIP</Link>
        </div>
      </section>

      <section id="wyszukiwarka" className="prosta-blok" style={{ scrollMarginTop: 80 }}>
        <h2>Wyszukiwarka programów</h2>
        <p className="pod">KFS, PUP, PFRON, FENG, PARP, NCBR, ARiMR i programy regionalne. Dane orientacyjne: termin i kwotę potwierdź w ogłoszeniu naboru.</p>
        <WyszukiwarkaProgramow />
      </section>

      <section className="prosta-blok">
        <h2>Największe nabory w listopadzie 2026</h2>
        <ul className="linki">
          <li><Link href="/blog/najwieksze-dotacje-dla-firm-2026"><span>10 największych dotacji dla firm<small>Ranking według budżetu naboru, z linkami do ogłoszeń.</small></span><span aria-hidden="true">→</span></Link></li>
          <li><Link href="/blog/sciezka-smart-2026-dotacja-dla-msp"><span>Ścieżka SMART dla MŚP<small>500 mln zł na prace B+R, wnioski do 29.12.2026.</small></span><span aria-hidden="true">→</span></Link></li>
          <li><Link href="/blog/kredyt-dual-use-bgk-2026"><span>Kredyt dual-use z BGK<small>400 mln zł dla MŚP, wnioski do 28.01.2027.</small></span><span aria-hidden="true">→</span></Link></li>
          <li><Link href="/blog/digit-arp-dotacja-na-cyfryzacje-2026"><span>Dig.IT na cyfryzację produkcji<small>Grant do 850 000 zł, wnioski do 30.11.2026.</small></span><span aria-hidden="true">→</span></Link></li>
        </ul>
      </section>

      <section id="jak-dziala" className="prosta-blok" style={{ scrollMarginTop: 80 }}>
        <h2>Jak to działa</h2>
        <ol style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {KROKI.map((step) => (
            <li key={step.num} style={{ padding: '14px 0', borderTop: '1px solid var(--linia)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>
                <span style={{ color: 'var(--rdza)', marginRight: 10 }}>{step.num}</span>{step.title}
              </h3>
              <p className="pod" style={{ margin: 0 }}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="prosta-blok">
        <h2>Po otrzymaniu dotacji</h2>
        <p className="pod">Dotacja to też faktury i rozliczenia. <a href="https://doginvoice.com" target="_blank" rel="noopener">DogInvoice</a> pobiera faktury z KSeF i dopasowuje wpłaty do faktur, więc widać, co jest opłacone.</p>
      </section>

      <section id="kontakt" className="prosta-blok" style={{ scrollMarginTop: 80 }}>
        <h2>Masz pytanie?</h2>
        <p className="pod">Formularz kontaktowy, nie bramka: wszystko powyżej działa bez niego. Napisz, jeśli brakuje programu albo dane są nieaktualne.</p>
        <div style={{ marginTop: 20, padding: 20, background: 'var(--surface)', border: '2px solid var(--tusz)' }}>
          <DotacjeContactForm />
        </div>
        <p className="mala" style={{ marginTop: 12 }}>
          Informacja orientacyjna. Decyzja o dofinansowaniu należy do instytucji, która prowadzi program.
        </p>
      </section>

    </main>
  );
}
