import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { DotacjeContactForm } from '@/components/DotacjeContactForm';

export const metadata: Metadata = {
  alternates: canonical('/dotacje'),
  title: 'Dotacje dla firm 2026: monitoring naborów i agent AI | wezmezadarmo',
  description: 'Dotacje dla firm 2026 w jednym miejscu: KFS, PUP, PFRON, KPO i programy samorządowe. Agent AI dopasowuje nabory do profilu firmy i pomaga przygotować wniosek. Bezpłatnie.',
};

const PROGRAMS = [
  {
    cat: 'KFS',
    name: 'Krajowy Fundusz Szkoleniowy',
    max: 'do 300% przeciętnego wynagrodzenia',
    desc: 'Dofinansowanie kształcenia ustawicznego pracowników i pracodawcy. Nabory przez PUP, kalkulowanie wg liczby zatrudnionych.',
  },
  {
    cat: 'PUP',
    name: 'Refundacja kosztów zatrudnienia',
    max: 'do 6x średnia krajowa',
    desc: 'Refundacja wynagrodzenia i składek ZUS przy zatrudnieniu osoby bezrobotnej. Obowiązek zachowania zatrudnienia przez 12-18 miesięcy.',
  },
  {
    cat: 'PFRON',
    name: 'Dofinansowanie zatrudnienia ON',
    max: '2400 PLN / miesiąc / osobę',
    desc: 'Miesięczne dofinansowanie do wynagrodzeń pracowników z orzeczeniem o niepełnosprawności. Wnioski przez SODiR.',
  },
  {
    cat: 'KPO',
    name: 'Krajowy Plan Odbudowy',
    max: 'do 2 mln PLN',
    desc: 'Inwestycje w cyfryzację, zieloną transformację i odporność przedsiębiorstw. Nabory prowadzone przez PARP i BGK.',
  },
  {
    cat: 'Samorządy',
    name: 'Programy samorządowe',
    max: 'różne, od 5 tys. PLN',
    desc: 'Dotacje z urzędów marszałkowskich, gmin i powiatów. Różne kryteria, częste nabory lokalne. Monitoring 16 województw.',
  },
  {
    cat: 'PARP',
    name: 'Polska Agencja Rozwoju Przedsiębiorczości',
    max: 'do 10 mln PLN',
    desc: 'Programy B+R, innowacje, eksport, digitalizacja. Środki z funduszy europejskich FEP 2021-2027.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Podaj NIP',
    desc: 'Agent pobiera dane z CEIDG i Białej Listy VAT: nazwa, PKD, województwo, status VAT. Nie wpisujesz ręcznie.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    num: '02',
    title: 'Skonfiguruj profil',
    desc: 'Zaznacz co Cię interesuje: szkolenia, zatrudnienie, innowacje, zielona transformacja, eksport.',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  {
    num: '03',
    title: 'Rozmawiaj z agentem',
    desc: 'Agent pokazuje co pasuje do Twojego profilu i wyjaśnia dlaczego inne programy nie spełniają kryteriów. Pyta o kwoty, terminy, procedury.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    num: '04',
    title: 'Dostaj powiadomienia',
    desc: 'Email gdy otworzy się nowy nabór pasujący do profilu firmy. Jedno miejsce zamiast 40 stron instytucji.',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
];

const INDUSTRIES = [
  { icon: '💻', label: 'IT i software house', desc: 'Dofinansowania B+R, cyfryzacja, fundusze EU na innowacje i eksport.' },
  { icon: '📱', label: 'Influencerzy i content creatorzy', desc: 'Dofinansowanie szkoleń, wsparcie dla JDG, ulgi i programy dla kreatywnych.' },
  { icon: '🏥', label: 'Zarządzanie odpadami medycznymi', desc: 'Programy zielonej transformacji, ekologia, KPO dla firm z branży medycznej.' },
  { icon: '🏭', label: 'Produkcja i przemysł', desc: 'KFS dla szkoleń, PFRON, dotacje na modernizację i zieloną transformację.' },
  { icon: '🛒', label: 'E-commerce i retail', desc: 'Cyfryzacja, automatyzacja logistyki, programy wsparcia dla MŚP.' },
  { icon: '🎓', label: 'Edukacja i szkolenia', desc: 'KFS, projekty unijne, dofinansowanie platform e-learningowych.' },
];

export default function DotacjePage() {
  return (
    <main className="prosta">

      <section className="prosta-blok" style={{ padding: 0 }}>
        <p className="mono mala" style={{ margin: '0 0 8px' }}>Dla firm i JDG</p>
        <h1>Dotacje dla Twojej firmy</h1>
        <p className="pod">Agent AI śledzi KFS, PUP, PFRON, KPO i programy samorządowe. Daje znać, gdy otworzy się nabór dla Twojej firmy.</p>
        <div className="przyciski">
          <a href="/dotacje/rejestracja" className="btn btn-rdza btn-lg">Korzystaj za darmo</a>
          <a href="#jak-dziala" className="btn btn-lg">Jak to działa</a>
        </div>
      </section>

      <section id="jak-dziala" className="prosta-blok" style={{ padding: '32px 0 0', scrollMarginTop: 80 }}>
        <h2>Jak to działa</h2>
        <ol style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {STEPS.map((step) => (
            <li key={step.num} style={{ padding: '14px 0', borderTop: '1px solid var(--linia)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>
                <span style={{ color: 'var(--rdza)', marginRight: 10 }}>{step.num}</span>{step.title}
              </h3>
              <p className="pod" style={{ margin: 0 }}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="programy" className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Co monitoruje agent</h2>
        <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {PROGRAMS.map((prog) => (
            <li key={prog.cat} style={{ padding: '14px 0', borderTop: '1px solid var(--linia)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 2px' }}>{prog.name}</h3>
              <p className="mono" style={{ fontSize: 14, color: 'var(--green-800)', margin: '0 0 4px' }}>{prog.max}</p>
              <p className="pod" style={{ margin: 0 }}>{prog.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Agent czyta za Ciebie</h2>
        <p className="pod">Śledzi RSS instytucji i przygotowuje wstępne wnioski do Twojej weryfikacji. Nic nie jest składane bez Twojej zgody.</p>
        <p className="mono mala" style={{ marginTop: 8 }}>ZUS · GUS · NBP · UOKiK · Fundusze EU · e-Zdrowie · Sejm · ARiMR</p>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Dla jakich firm</h2>
        <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {INDUSTRIES.map((ind) => (
            <li key={ind.label} style={{ padding: '12px 0', borderTop: '1px solid var(--linia)' }}>
              <strong className="mono">{ind.label}</strong>
              <p className="pod" style={{ margin: '2px 0 0' }}>{ind.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="kontakt" className="prosta-blok" style={{ padding: '32px 0 0', scrollMarginTop: 80 }}>
        <h2>Chcesz korzystać?</h2>
        <p className="pod">Dostęp jest bezpłatny, z limitami uczciwego użycia. Napisz o swojej firmie, dobierzemy monitoring.</p>
        <div style={{ marginTop: 20, padding: 20, background: 'var(--surface)', border: '2px solid var(--tusz)' }}>
          <DotacjeContactForm />
        </div>
        <p className="mala" style={{ marginTop: 12 }}>
          Agent AI ma charakter informacyjny. Decyzja o dofinansowaniu należy do instytucji, która prowadzi program.
        </p>
      </section>

    </main>
  );
}
