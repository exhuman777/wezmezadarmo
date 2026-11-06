import Link from 'next/link';
import type { Narzedzie } from '@/lib/narzedzia/lista';
import { FormularzDostepu } from './FormularzDostepu';
import { StronaJsonLd } from '@/components/JsonLd';

/**
 * Sprawdzenie firmy po NIP bez podanego e-maila: krótki opis i formularz (e-mail, imię opcjonalnie, zgoda).
 * To jedyne miejsce w serwisie, które prosi o e-mail. Wynik otwiera link z maila (double opt-in).
 */
export function Bramka({ n, komunikat }: { n: Narzedzie; komunikat?: string | null }) {
  return (
    <div className="prosta">
      <StronaJsonLd sciezka={n.adres} />
      <section className="prosta-blok">
        <p className="mala"><Link href="/dla-firm/narzedzia">Narzędzia dla firm</Link> / {n.nazwa}</p>
        <h1>{n.nazwa}</h1>
        <p className="pod">{n.opis}</p>
        {komunikat && (
          <p role="status" style={{ marginTop: 16, padding: '12px 14px', border: '2px solid var(--tusz)', background: 'var(--kafel)', fontWeight: 600 }}>{komunikat}</p>
        )}
      </section>
      <section className="prosta-blok" id="dostep">
        <h2>Sprawdź firmę za darmo</h2>
        <p className="pod">Podaj e-mail i telefon. Wyślemy link, a wynik zobaczysz po jego kliknięciu. Bez zakładania konta.</p>
        <div style={{ marginTop: 16 }}><FormularzDostepu next={n.cel} przycisk="Sprawdź firmę po NIP" /></div>
      </section>
      <section className="prosta-blok">
        <h2>Bez e-maila</h2>
        <ul className="linki">
          <li><Link href="/dotacje#wyszukiwarka"><span>Wyszukiwarka programów<small>Wszystkie programy z bazy, filtr po nazwie i instytucji.</small></span><span aria-hidden="true">→</span></Link></li>
          <li><Link href="/blog/najwieksze-dotacje-dla-firm-2026"><span>Największe dotacje dla firm<small>10 naborów z listopada 2026 według budżetu.</small></span><span aria-hidden="true">→</span></Link></li>
        </ul>
        <p className="mala" style={{ marginTop: 16 }}>Wyniki są orientacyjne. Decyzję o dofinansowaniu podejmuje instytucja, która prowadzi nabór.</p>
      </section>
    </div>
  );
}
