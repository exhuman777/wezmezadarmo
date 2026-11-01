import Link from 'next/link';
import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/wnioski'),
  title: 'Pomoc w wypełnieniu wniosku z AI | wezmezadarmo',
  description: 'Wypełniaj wnioski ZUS, granty i dofinansowania krok po kroku z pomocą AI. Twoje dane zapisywane lokalnie w przeglądarce, prefill z profilu dla zalogowanych.',
};

interface Form {
  slug: string;
  symbol?: string;
  name: string;
  institution: string;
  amount: string;
  deadline?: string;
  deadlineUrgent?: boolean;
  description: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  forms: Form[];
}

const CATEGORIES: Category[] = [
  {
    id: 'zus',
    label: 'ZUS',
    icon: '01',
    forms: [
      {
        slug: 'zus-z15a',
        symbol: 'Z-15a',
        name: 'Zasiłek opiekuńczy: opieka nad chorym dzieckiem',
        institution: 'ZUS / pracodawca',
        amount: '80% wynagrodzenia',
        description: 'Przysługuje gdy nie możesz pracować bo opiekujesz się chorym dzieckiem do 14 lat lub gdy zamknięto żłobek/przedszkole/szkołę.',
      },
      {
        slug: 'zus-z15b',
        symbol: 'Z-15b',
        name: 'Zasiłek opiekuńczy: opieka nad chorym dorosłym',
        institution: 'ZUS / pracodawca',
        amount: '80% wynagrodzenia',
        description: 'Przysługuje gdy opiekujesz się chorym małżonkiem, rodzicem lub innym dorosłym członkiem rodziny powyżej 14 lat.',
      },
      {
        slug: 'zus-zas53',
        symbol: 'ZAS-53',
        name: 'Zasiłek chorobowy: wniosek bezpośrednio do ZUS',
        institution: 'ZUS',
        amount: '80% wynagrodzenia (100% w ciąży)',
        description: 'Gdy pracodawca nie wypłaca zasiłku chorobowego lub jesteś osobą prowadzącą działalność.',
      },
      {
        slug: 'zus-z3',
        symbol: 'Z-3',
        name: 'Zaświadczenie płatnika składek: przewodnik dla pracownika',
        institution: 'ZUS / pracodawca',
        amount: 'narzędzie informacyjne',
        description: 'Zaświadczenie wypełnia pracodawca. Ten kreator pomaga sprawdzić dokument i przygotować pismo do działu kadr.',
      },
      {
        slug: 'zus-erpo',
        symbol: 'ERPO',
        name: 'Wniosek o emeryturę',
        institution: 'ZUS',
        amount: 'indywidualnie',
        description: 'Kreator przygotowuje dane do wniosku ERPO. Można złożyć online przez PUE ZUS z profilem zaufanym.',
      },
      {
        slug: 'zus-pel',
        symbol: 'PEL',
        name: 'Pełnomocnictwo do ZUS',
        institution: 'ZUS',
        amount: 'pełnomocnictwo',
        description: 'Upoważnij kogoś do reprezentowania Cię przed ZUS: w sprawach ubezpieczeniowych, PIT lub w eZUS.',
      },
      {
        slug: 'zus-ersu',
        symbol: 'ERSU + ERU',
        name: 'Mama 4+ / Tata 4+: rodzicielskie świadczenie uzupełniające',
        institution: 'ZUS',
        amount: '1901 PLN / mies.',
        description: 'Dla rodziców 4+ dzieci którzy zrezygnowali z pracy by wychowywać dzieci i nie mają prawa do emerytury lub mają ją poniżej minimum.',
      },
    ],
  },
  {
    id: 'granty',
    label: 'Granty',
    icon: '02',
    forms: [
      {
        slug: 'nlnet',
        name: 'NLnet NGI Zero Commons Fund',
        institution: 'NLnet Foundation / UE Horizon Europe',
        amount: 'do 50 000 EUR',
        deadline: '1 czerwca 2026, 12:00',
        deadlineUrgent: true,
        description: 'Grant dla projektów open-source z impaktem społecznym. Dla civic tech, narzędzi AI, infrastruktury cyfrowej. Bez wymogu spółki, solo-founder OK.',
      },
    ],
  },
];

interface RoadmapItem {
  category: string;
  symbol?: string;
  name: string;
  amount: string;
}

const ROADMAP: RoadmapItem[] = [
  { category: 'ZUS', symbol: 'ERN', name: 'Renta z tytułu niezdolności do pracy', amount: 'od 1901 PLN' },
  { category: 'ZUS', symbol: 'ESUN', name: 'Świadczenie uzupełniające dla niezdolnych do samodzielnej egzystencji', amount: 'do 1901 PLN' },
  { category: 'PFRON', name: 'Aktywny Samorząd Moduł I - wózek elektryczny, proteza', amount: 'do 10 000 PLN' },
  { category: 'PFRON', name: 'Aktywny Samorząd Moduł II - dofinansowanie do studiów', amount: 'do 1100 PLN/mies.' },
  { category: 'PFRON', name: 'Dofinansowanie do turnusu rehabilitacyjnego', amount: 'do 2079 PLN' },
  { category: 'MOPS', name: 'Świadczenie 800+ (już składane przez PUE ZUS)', amount: '800 PLN/mies. na dziecko' },
  { category: 'MOPS', name: 'Becikowe (gmina/MOPS)', amount: '1000 PLN' },
  { category: 'MOPS', name: 'Dobry Start 300+', amount: '300 PLN/rok na dziecko' },
  { category: 'MOPS', name: 'Zasiłek stały i okresowy', amount: 'zasiłek stały do 1229 PLN/mies.' },
  { category: 'MOPS', name: 'Dodatek mieszkaniowy', amount: 'zależnie od gminy' },
  { category: 'PUP', name: 'Jednorazowe środki na podjęcie działalności', amount: 'do 55 398 PLN' },
  { category: 'PUP', name: 'Bon na kształcenie ustawiczne', amount: 'do 9 233 PLN' },
  { category: 'PUP', name: 'Bon na zasiedlenie', amount: 'do 18 466 PLN' },
  { category: 'PUP', name: 'Wniosek o staż z urzędu pracy', amount: 'stypendium 2854 PLN/mies.' },
  { category: 'NFZ', name: 'Refundacja okularów i soczewek kontaktowych', amount: '50-700 PLN' },
  { category: 'NFZ', name: 'Dofinansowanie aparatu słuchowego', amount: 'do 2700 PLN / 5 lat' },
  { category: 'Granty', name: 'NCBiR STEP Ścieżka A', amount: 'do 18 mln PLN' },
  { category: 'Granty', name: 'EIC Accelerator', amount: 'do 2,5 mln EUR' },
  { category: 'Granty', name: 'PARP Startup Booster Tech Impact', amount: 'do 400 000 PLN' },
];

const STEPS = [
  { n: '01', text: 'Wybierz formularz. Zalogowanym auto-wypełniamy dane z profilu (PESEL, imię, adres, nr konta).' },
  { n: '02', text: 'AI generuje treść pól na podstawie kontekstu wniosku - Ty tylko czytasz i potwierdzasz.' },
  { n: '03', text: 'Dane zostają zapisane w Twojej przeglądarce - następnym razem wypełnisz wniosek w 2 minuty.' },
  { n: '04', text: 'Pobierasz gotowy PDF z wypełnionymi danymi, instrukcją złożenia i wskazówkami. Drukujesz, podpisujesz i składasz.' },
];

export default function WnioskiPage() {
  return (
    <main className="prosta">

      <section className="prosta-blok" style={{ padding: 0 }}>
        <p className="mono mala" style={{ margin: '0 0 8px' }}>Narzędzie obywatelskie, bezpłatne</p>
        <h1>Wypełnij wniosek z pomocą AI</h1>
        <p className="pod">AI tłumaczy każde pole i podpowiada treść. Pobierasz gotowy PDF do podpisania i złożenia.</p>
        <p className="mala" style={{ marginTop: 12 }}>
          Dane zostają w Twojej przeglądarce. Serwis nie składa wniosków za Ciebie.
        </p>
      </section>

      {CATEGORIES.map((cat) => (
        <section key={cat.id} className="prosta-blok" style={{ padding: '32px 0 0' }}>
          <h2>{cat.label}</h2>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
            {cat.forms.map((form) => (
              <FormCard key={form.slug} form={form} />
            ))}
          </ul>
        </section>
      ))}

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Jak to działa</h2>
        <ol style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
          {STEPS.map((s) => (
            <li key={s.n} style={{ padding: '12px 0', borderTop: '1px solid var(--linia)' }}>
              <span className="mono" style={{ color: 'var(--rdza)', fontWeight: 700, marginRight: 10 }}>{s.n}</span>
              {s.text}
            </li>
          ))}
        </ol>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Następne formularze</h2>
        <p className="pod">Kolejność ustalamy według potrzeb. <a href="/dla-firm#kontakt" style={{ textDecoration: 'underline' }}>Napisz, którego potrzebujesz</a>.</p>
        <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
          {ROADMAP.map((r, i) => (
            <li key={i} style={{ padding: '10px 0', borderTop: '1px solid var(--linia)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span><span className="mono mala" style={{ marginRight: 8 }}>{r.category}{r.symbol ? ` ${r.symbol}` : ''}</span>{r.name}</span>
              <span className="mono" style={{ color: 'var(--szary)', fontSize: 14 }}>{r.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Prywatność</h2>
        <p className="pod">PESEL, imię i adres zapisujemy w Twojej przeglądarce, a dla zalogowanych opcjonalnie w profilu. Do serwera trafiają tylko na chwilę, żeby wypełnić PDF.</p>
      </section>

    </main>
  );
}

function FormCard({ form }: { form: Form }) {
  return (
    <li style={{ padding: '16px 0', borderTop: '1px solid var(--linia)' }}>
      <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>
        {form.symbol && <span style={{ color: 'var(--rdza)', marginRight: 8 }}>{form.symbol}</span>}
        {form.name}
      </h3>
      <p className="mala" style={{ margin: '0 0 6px' }}>{form.institution} · <span className="mono">{form.amount}</span></p>
      <p style={{ margin: 0 }}>{form.description}</p>
      {form.deadline && (
        <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: form.deadlineUrgent ? 700 : 400, color: form.deadlineUrgent ? 'var(--red-600)' : 'var(--szary)' }}>
          Termin: {form.deadline}{form.deadlineUrgent ? ' (pilne)' : ''}
        </p>
      )}
      <div className="przyciski" style={{ marginTop: 12 }}>
        <Link href={`/wnioski/${form.slug}`} className="btn btn-primary" style={{ flex: '0 0 auto' }}>
          Wypełnij z AI
        </Link>
      </div>
    </li>
  );
}
