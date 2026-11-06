import Link from 'next/link';
import { Suspense } from 'react';
import { CzatPubliczny } from './CzatPubliczny';

const CECHY = [
  { label: 'Bez konta', desc: 'Pytasz od razu, bez logowania. Nic nie zapisujemy, rozmowa znika po zamknięciu karty.' },
  { label: '133 świadczenia', desc: 'Pokazuje te, które pasują, z linkiem do źródła.' },
  { label: 'Dane na żywo', desc: 'Kurs w NBP, kolejka w NFZ, NIP na Białej Liście VAT, powietrze z GIOŚ.' },
  { label: 'Komunikaty urzędów', desc: 'Cytuje komunikaty ZUS, PFRON, GUS, Sejmu i ministerstw, z linkiem.' },
  { label: 'Wnioski ZUS', desc: 'Podpowiada, co wpisać w 7 formularzach, i przygotowuje PDF.' },
  { label: 'Bez zmyślania', desc: 'Gdy czegoś nie ma w bazie, mówi to wprost i odsyła do urzędu.' },
];

const PRZYKLADY = [
  'Jakie świadczenia mi przysługują?',
  'Czy mogę dostać 800+ na dziecko?',
  'Ile czekam do kardiologa?',
  'Sprawdź NIP 7342867148',
  'Jak złożyć wniosek o zasiłek chorobowy?',
  'Jakie ulgi podatkowe mam jako JDG?',
];

export default function AgentLanding() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Asystent AI</p>
        <h1>Zapytaj o świadczenia, ZUS i urzędy</h1>
        <p className="pod">Asystent odpowiada z bazy świadczeń i danych urzędów. Działa od razu, bez konta: 3 pytania dziennie.</p>
        <Suspense fallback={null}>
          <CzatPubliczny />
        </Suspense>
      </section>

      <section className="prosta-blok">
        <h2>Przykładowe pytania</h2>
        <ul className="linki">
          {PRZYKLADY.map(text => (
            <li key={text}>
              <Link href={`/agent?q=${encodeURIComponent(text)}`}><span>{text}</span><span aria-hidden="true">→</span></Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Co potrafi</h2>
        <ul className="lista">
          {CECHY.map(c => <li key={c.label}><b>{c.label}.</b> {c.desc}</li>)}
        </ul>
        <p className="mala" style={{ marginTop: 16 }}>
          Asystent ma charakter informacyjny i nie składa wniosków za Ciebie. Działa na modelu Google Gemini przez OpenRouter, pytania nie służą do trenowania modeli.
        </p>
      </section>
    </main>
  );
}
