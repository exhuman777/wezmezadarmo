import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata: Metadata = metadaneStrony('/za-darmo-dla-biznesu');

// Opisy wyłącznie z inwentarzy funkcji produktów (12.09.2026) i z żywych stron doginvoice.com i doganswer.com.
const DOGINVOICE = [
  'Sam dopasowuje przelewy z banku do faktur z KSeF, więc od razu widzisz, co jest opłacone, a co nie.',
  'Zaznaczasz kilka faktur, a on sprawdza kontrahentów na białej liście VAT, wpisuje numery faktur w tytuły i robi jeden plik do banku: płacisz wszystkim naraz.',
  'Zapraszasz księgową i zespół, a miesiąc zamykasz jednym kliknięciem.',
];

const DOGANSWER = [
  'Asystent głosowy AI, który odbiera, kiedy Ty nie możesz, o każdej porze.',
  'Zna Twoją firmę i ofertę, odpowiada na pytania klientów i dopytuje o szczegóły jak dobra sekretarka.',
  'Umawia spotkania w Twoim Kalendarzu Google i zapisuje, o czym była rozmowa.',
];

export default function ZaDarmoDlaBiznesuPage() {
  return (
    <main className="prosta">
      <StronaJsonLd sciezka="/za-darmo-dla-biznesu" />
      <section className="prosta-blok">
        <p className="etykieta">Dla firm</p>
        <h1>Dwa narzędzia dla firm</h1>
        <p className="pod">
          wezmezadarmo.com jest darmowe. Tu są dwa płatne produkty Dogtronic Labs z Lublina, przy których pracuje autor serwisu.
        </p>
      </section>

      <section className="prosta-blok">
        <h2>DogInvoice</h2>
        <ul className="lista">
          {DOGINVOICE.map(t => <li key={t}>{t}</li>)}
        </ul>
        <div className="przyciski">
          <a href="https://doginvoice.com" target="_blank" rel="noopener" className="btn btn-primary btn-lg">doginvoice.com</a>
        </div>
      </section>

      <section className="prosta-blok">
        <h2>DogAnswer</h2>
        <ul className="lista">
          {DOGANSWER.map(t => <li key={t}>{t}</li>)}
        </ul>
        <div className="przyciski">
          <a href="https://doganswer.com" target="_blank" rel="noopener" className="btn btn-primary btn-lg">doganswer.com</a>
        </div>
      </section>

      <section className="prosta-blok">
        <h2>Coś na miarę</h2>
        <p>Jeśli potrzebujesz innej automatyzacji w firmie, napisz przez formularz „Napisz do nas” w stopce strony.</p>
        <p className="mala" style={{ marginTop: 16 }}>
          DogInvoice i DogAnswer to produkty Dogtronic Labs. Strona wezmezadarmo.com jest projektem prywatnym i niekomercyjnym.
        </p>
      </section>
    </main>
  );
}
