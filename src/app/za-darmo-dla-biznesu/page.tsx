import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/za-darmo-dla-biznesu'),
  title: 'Narzędzia dla firm: DogInvoice i DogAnswer | wezmezadarmo',
  description: 'DogInvoice pobiera faktury z KSeF i pilnuje płatności. DogAnswer odbiera telefony, których nie zdążysz odebrać. Dwa narzędzia Dogtronic Labs z Lublina.',
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = 'kamil.sobkowicz@dogtronic.io';

// Opisy wyłącznie z inwentarzy funkcji produktów (12.09.2026) i z żywych stron doginvoice.com i doganswer.com.
const DOGINVOICE = [
  'Co godzinę pobiera faktury z KSeF i dzieli je na przychody, koszty i odrzucone.',
  'Faktury spoza KSeF wgrywasz jako PDF albo zdjęcie z telefonu, albo przesyłasz na własny adres e-mail w DogInvoice.',
  'Kalendarz pokazuje, która faktura jest opłacona, nieopłacona albo po terminie.',
  'Wyciąg z banku dopasowuje wpłaty do faktur. Można też połączyć bank, wtedy opłacone faktury przychodowe oznaczają się same.',
  'Dokumenty trafiają do folderów na Twoim Dysku Google.',
];

const DOGANSWER = [
  'Sam decydujesz, kiedy asystent odbiera: zawsze albo tylko wtedy, gdy Ty nie możesz.',
  'Włączasz go kodem przekierowania w telefonie, dzwoniący nadal wybiera Twój numer.',
  'W bazie wiedzy wpisujesz pytania, opisy usług i tabele, np. cennik i godziny. Asystent odpowiada z nich w rozmowie.',
  'Może umawiać wizyty w Twoim Kalendarzu Google.',
];

export default function ZaDarmoDlaBiznesuPage() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Dla firm</p>
        <h1>Dwa narzędzia dla firm</h1>
        <p className="pod">
          wezmezadarmo.com jest darmowe. Tu są dwa płatne produkty Dogtronic Labs z Lublina, przy których pracuje autor serwisu.
        </p>
      </section>

      <section className="prosta-blok">
        <h2>DogInvoice</h2>
        <p>Pilnuje finansów firmy: faktur, płatności i terminów. Nie jest programem do wystawiania faktur.</p>
        <ul className="lista">
          {DOGINVOICE.map(t => <li key={t}>{t}</li>)}
        </ul>
        <div className="przyciski">
          <a href="https://doginvoice.com" target="_blank" rel="noopener" className="btn btn-primary btn-lg">doginvoice.com</a>
        </div>
      </section>

      <section className="prosta-blok">
        <h2>DogAnswer</h2>
        <p>Asystent głosowy AI, który odbiera telefony, gdy Ty nie możesz.</p>
        <ul className="lista">
          {DOGANSWER.map(t => <li key={t}>{t}</li>)}
        </ul>
        <div className="przyciski">
          <a href="https://doganswer.com" target="_blank" rel="noopener" className="btn btn-primary btn-lg">doganswer.com</a>
        </div>
      </section>

      <section className="prosta-blok">
        <h2>Coś na miarę</h2>
        <p>Jeśli potrzebujesz innej automatyzacji w firmie, napisz.</p>
        <div className="przyciski">
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-lg">{CONTACT_EMAIL}</a>
        </div>
        <p className="mala" style={{ marginTop: 16 }}>
          DogInvoice i DogAnswer to produkty Dogtronic Labs. Strona wezmezadarmo.com jest projektem prywatnym i niekomercyjnym.
        </p>
      </section>
    </main>
  );
}
