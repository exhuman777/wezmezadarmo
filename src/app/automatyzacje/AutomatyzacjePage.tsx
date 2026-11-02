import Link from 'next/link';

// Strona informacyjna: co w małej firmie da się dziś zautomatyzować. Bez obietnic i bez cen.
const MOZLIWOSCI = [
  { obszar: 'Faktury spoza KSeF', opis: 'Rachunki z zagranicznych usług przychodzą mailem. Program może je odczytać i wpisać do arkusza.' },
  { obszar: 'Oferty', opis: 'Szablon, kwoty i wysyłka to powtarzalna praca, którą łatwo przyspieszyć.' },
  { obszar: 'Raporty', opis: 'Dane z arkuszy na koniec miesiąca mogą składać się same i trafiać do księgowej.' },
  { obszar: 'Maile do klientów', opis: 'Potwierdzenia, przypomnienia i odpowiedzi po spotkaniu mogą powstawać jako szkice do sprawdzenia.' },
  { obszar: 'Terminy ZUS i US', opis: 'Przypomnienia o terminach i przepisywanie danych do ewidencji.' },
];

export default function AutomatyzacjePage() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Automatyzacje</p>
        <h1>Co w firmie da się dziś zautomatyzować</h1>
        <p className="pod">Strona informacyjna. Każdą automatyzację przed wysłaniem czegokolwiek sprawdza człowiek.</p>
      </section>

      <section className="prosta-blok">
        <h2>Pięć przykładów</h2>
        <ul className="lista">
          {MOZLIWOSCI.map(m => (
            <li key={m.obszar}><b>{m.obszar}.</b> {m.opis}</li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Dotacje dla firm</h2>
        <p>Darmowy agent śledzi nabory dofinansowań i pokazuje te, które pasują do Twojej firmy.</p>
        <div className="przyciski">
          <Link href="/dotacje" className="btn btn-primary btn-lg">Zobacz dotacje</Link>
          <Link href="/za-darmo-dla-biznesu" className="btn btn-lg">Narzędzia dla firm</Link>
        </div>
        <p className="mala" style={{ marginTop: 16 }}>
          Więcej o serwisie: <Link href="/o-projekcie">O projekcie</Link>.
        </p>
      </section>
    </main>
  );
}
