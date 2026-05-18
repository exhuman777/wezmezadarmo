import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomoc w wypełnieniu wniosku z AI | wezmezadarmo',
  description: 'Wypełniaj wnioski ZUS, PFRON, MOPS, granty i dofinansowania krok po kroku z pomocą AI. Twoje dane nie wychodzą poza przeglądarkę.',
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
  available: boolean;
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
        available: true,
      },
      {
        slug: 'zus-z15b',
        symbol: 'Z-15b',
        name: 'Zasiłek opiekuńczy: opieka nad chorym dorosłym',
        institution: 'ZUS / pracodawca',
        amount: '80% wynagrodzenia',
        description: 'Przysługuje gdy opiekujesz się chorym małżonkiem, rodzicem lub innym dorosłym członkiem rodziny powyżej 14 lat.',
        available: true,
      },
      {
        slug: 'zus-zas53',
        symbol: 'ZAS-53',
        name: 'Zasiłek chorobowy: wniosek bezpośrednio do ZUS',
        institution: 'ZUS',
        amount: '80% wynagrodzenia (100% w ciąży)',
        description: 'Gdy pracodawca nie wypłaca zasiłku chorobowego lub jesteś osobą prowadzącą działalność.',
        available: true,
      },
      {
        slug: 'zus-z3',
        symbol: 'Z-3',
        name: 'Zaświadczenie płatnika składek: przewodnik dla pracownika',
        institution: 'ZUS / pracodawca',
        amount: '--',
        description: 'Zaświadczenie wypełnia pracodawca. Ten kreator pomaga sprawdzić dokument i przygotować pismo do działu kadr.',
        available: true,
      },
      {
        slug: 'zus-erpo',
        symbol: 'ERPO',
        name: 'Wniosek o emeryturę',
        institution: 'ZUS',
        amount: 'indywidualnie',
        description: 'Kreator przygotowuje dane do wniosku ERPO. Można złożyć online przez PUE ZUS z profilem zaufanym.',
        available: true,
      },
      {
        slug: 'zus-pel',
        symbol: 'PEL',
        name: 'Pełnomocnictwo do ZUS',
        institution: 'ZUS',
        amount: '--',
        description: 'Upoważnij kogoś do reprezentowania Cię przed ZUS: w sprawach ubezpieczeniowych, PIT lub w eZUS.',
        available: true,
      },
      {
        slug: 'zus-ersu',
        symbol: 'ERSU + ERU',
        name: 'Mama 4+ / Tata 4+: rodzicielskie świadczenie uzupełniające',
        institution: 'ZUS',
        amount: '1901 PLN / mies.',
        description: 'Dla rodziców 4+ dzieci którzy zrezygnowali z pracy by wychowywać dzieci i nie mają prawa do emerytury lub mają ją poniżej minimum.',
        available: true,
      },
      {
        slug: 'zus-ern',
        symbol: 'ERN',
        name: 'Renta z tytułu niezdolności do pracy',
        institution: 'ZUS',
        amount: 'od 1901 PLN',
        description: 'Dla osób które stały się niezdolne do pracy w wyniku choroby lub wypadku i mają odpowiedni staż składkowy.',
        available: false,
      },
      {
        slug: 'zus-esun',
        symbol: 'ESUN',
        name: 'Świadczenie uzupełniające dla osób niezdolnych do samodzielnej egzystencji',
        institution: 'ZUS',
        amount: 'do 1901 PLN',
        description: 'Dla osób ze znacznym stopniem niepełnosprawności lub orzeczeniem lekarskim o niezdolności do samodzielnej egzystencji.',
        available: false,
      },
    ],
  },
  {
    id: 'pfron',
    label: 'PFRON',
    icon: '02',
    forms: [
      {
        slug: 'pfron-as1',
        name: 'Aktywny Samorząd Moduł I: sprzęt rehabilitacyjny i elektryczny wózek',
        institution: 'PFRON / PCPR',
        amount: 'do 10 000 PLN',
        description: 'Dofinansowanie do wózka elektrycznego, protezy, urządzenia lektorskiego, utrzymania sprawności technicznej wózka.',
        available: false,
      },
      {
        slug: 'pfron-as2',
        name: 'Aktywny Samorząd Moduł II: dofinansowanie do studiów',
        institution: 'PFRON / PCPR',
        amount: 'do 1100 PLN/mies.',
        description: 'Dofinansowanie kosztów nauki dla studentów ze znacznym lub umiarkowanym stopniem niepełnosprawności.',
        available: false,
      },
      {
        slug: 'pfron-turnusy',
        name: 'Dofinansowanie do turnusu rehabilitacyjnego',
        institution: 'PFRON / PCPR',
        amount: 'do 2079 PLN',
        description: 'Jednorazowe dofinansowanie rocznego udziału w turnusie rehabilitacyjnym dla osób z orzeczeniem.',
        available: false,
      },
    ],
  },
  {
    id: 'mops',
    label: 'MOPS / Gmina',
    icon: '03',
    forms: [
      {
        slug: 'mops-800plus',
        name: 'Świadczenie wychowawcze 800+',
        institution: 'ZUS (od 2024) / gmina',
        amount: '800 PLN / mies. na dziecko',
        description: 'Dla każdego dziecka do 18 roku życia bez progu dochodowego. Składany przez PUE ZUS lub bankowość elektroniczną.',
        available: false,
      },
      {
        slug: 'mops-becikowe',
        name: 'Becikowe: jednorazowa zapomoga z tytułu urodzenia dziecka',
        institution: 'Gmina / MOPS',
        amount: '1000 PLN',
        description: 'Jednorazowe świadczenie dla rodzin z dochodem do 1922 PLN netto na osobę. Złożyć w ciągu 12 miesięcy od urodzenia.',
        available: false,
      },
      {
        slug: 'mops-dobrystart',
        name: 'Dobry Start 300+',
        institution: 'ZUS',
        amount: '300 PLN / rok na dziecko',
        description: 'Jednorazowe świadczenie na wyprawkę szkolną dla dzieci uczących się do 20 lat (24 lata przy niepełnosprawności).',
        available: false,
      },
      {
        slug: 'mops-zasilekokresowyStaly',
        name: 'Zasiłek stały i zasiłek okresowy',
        institution: 'MOPS / OPS',
        amount: 'do 1901 PLN',
        description: 'Dla osób w trudnej sytuacji materialnej: zasiłek stały dla niezdolnych do pracy, okresowy dla bezrobotnych w trakcie trudności.',
        available: false,
      },
      {
        slug: 'mops-pomoc-mieszkaniowa',
        name: 'Dodatek mieszkaniowy i energetyczny',
        institution: 'Gmina',
        amount: 'do 1500 PLN / mies.',
        description: 'Dopłata do czynszu i rachunków za energię dla osób z niskim dochodem. Składany w urzędzie gminy.',
        available: false,
      },
    ],
  },
  {
    id: 'pracagov',
    label: 'Urząd Pracy',
    icon: '04',
    forms: [
      {
        slug: 'pup-jednorazowe',
        name: 'Jednorazowe środki na podjęcie działalności gospodarczej',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 45 000 PLN',
        description: 'Dla zarejestrowanych bezrobotnych chcących założyć firmę. Bezzwrotna dotacja z Funduszu Pracy.',
        available: false,
      },
      {
        slug: 'pup-bon-szkoleniowy',
        name: 'Bon szkoleniowy',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 16 000 PLN',
        description: 'Dofinansowanie szkoleń i kursów dla bezrobotnych do 30 roku życia. Pokrywa koszty szkolenia, przejazdu, zakwaterowania.',
        available: false,
      },
      {
        slug: 'pup-bon-zasiedlenie',
        name: 'Bon na zasiedlenie',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 15 669 PLN',
        description: 'Dla bezrobotnych do 30 lat którzy znajdą pracę lub założą firmę w odległości ponad 80 km od miejsca zamieszkania.',
        available: false,
      },
      {
        slug: 'pup-staz',
        name: 'Wniosek o staż z urzędu pracy',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'stypendium ok. 1901 PLN',
        description: 'Dla pracodawców i bezrobotnych chcących zorganizować staż finansowany przez PUP. Czas trwania: 3-6 miesięcy.',
        available: false,
      },
    ],
  },
  {
    id: 'nfz',
    label: 'NFZ',
    icon: '05',
    forms: [
      {
        slug: 'nfz-okulary',
        name: 'Refundacja okularów i soczewek kontaktowych',
        institution: 'NFZ',
        amount: '50-700 PLN na okulary / do 600 PLN na soczewki',
        description: 'Co 2 lata (częściej u dzieci). Wymagane zlecenie od okulisty z NFZ. Realizowane w optykach z umową.',
        available: false,
      },
      {
        slug: 'nfz-aparat-sluchowy',
        name: 'Dofinansowanie aparatu słuchowego',
        institution: 'NFZ',
        amount: 'do 2700 PLN / 5 lat',
        description: 'Dla osób z ubytkiem słuchu potwierdzonym badaniem audiologicznym. Wymagane skierowanie od laryngologa z NFZ.',
        available: false,
      },
    ],
  },
  {
    id: 'granty',
    label: 'Granty',
    icon: '06',
    forms: [
      {
        slug: 'nlnet',
        name: 'NLnet NGI Zero Commons Fund',
        institution: 'NLnet Foundation / UE Horizon Europe',
        amount: 'do 50 000 EUR',
        deadline: '1 czerwca 2026, 12:00',
        deadlineUrgent: true,
        description: 'Grant dla projektów open-source z impaktem społecznym. Dla civic tech, narzędzi AI, infrastruktury cyfrowej. Bez wymogu spółki, solo-founder OK.',
        available: true,
      },
      {
        slug: 'step',
        name: 'NCBiR STEP Sciezka A',
        institution: 'NCBiR / FENG 2021-2027',
        amount: 'do 18 mln PLN',
        deadline: '17 czerwca 2026',
        description: 'Dofinansowanie na projekty B+R w obszarze technologii cyfrowych i krytycznych.',
        available: false,
      },
      {
        slug: 'eic',
        name: 'EIC Accelerator',
        institution: 'European Innovation Council',
        amount: 'do 2,5 mln EUR',
        deadline: '8 lipca 2026',
        description: 'Europejski program dla startupów z przełomowymi innowacjami i globalnym potencjałem.',
        available: false,
      },
      {
        slug: 'parp-startup',
        name: 'PARP Startup Booster Tech Impact',
        institution: 'PARP / FENG',
        amount: 'do 400 000 PLN',
        description: 'Dla startupów realizujących Cele Zrównoważonego Rozwoju ONZ. Przez akredytowane akceleratory.',
        available: false,
      },
    ],
  },
];

const STEPS = [
  { n: '01', text: 'Wybierz formularz i wpisz swoje dane. AI wyjaśni co znaczy każde pole.' },
  { n: '02', text: 'AI automatycznie generuje treść wszystkich pól na podstawie tego co podałeś.' },
  { n: '03', text: 'Przechodzisz pole po polu, czytasz, poprawiasz i akceptujesz.' },
  { n: '04', text: 'Pobierasz gotowy PDF z wypełnionymi danymi, instrukcją złożenia i wskazówkami. Drukujesz, podpisujesz i składasz.' },
];

export default function WnioskiPage() {
  const totalForms = CATEGORIES.reduce((s, c) => s + c.forms.length, 0);
  const availableForms = CATEGORIES.reduce((s, c) => s + c.forms.filter(f => f.available).length, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,248,242,0.85)',
        backdropFilter: 'saturate(140%) blur(14px)',
        WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{
              display: 'inline-block', width: 9, height: 9,
              background: 'var(--color-pl-red)', borderRadius: '50%',
            }} />
            <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>
              wezmezadarmo
              <span className="mono" style={{ color: 'var(--color-text-3)', fontWeight: 400, fontSize: 11 }}>.com</span>
            </span>
          </Link>
          <Link href="/" style={{
            fontSize: 13, color: 'var(--color-text-2)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6"/>
            </svg>
            Strona główna
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', paddingTop: 64, paddingBottom: 64, overflow: 'hidden' }}>
        <div className="grain-bg" />
        <div className="container" style={{ position: 'relative' }}>

          <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <span className="label-eyebrow">Narzędzie obywatelskie</span>
            <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span className="label-eyebrow" style={{ color: 'var(--color-muted-2)' }}>Beta: bezpłatne</span>
          </div>

          <div style={{ maxWidth: 720 }}>
            <h1 className="display rise" style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 24, animationDelay: '60ms' }}>
              Wypełnij wniosek<br />
              <span style={{ color: 'var(--color-accent)' }}>z pomocą AI</span>
            </h1>
            <p className="rise" style={{
              fontSize: 18, lineHeight: 1.6,
              color: 'var(--color-text-2)',
              marginBottom: 20,
              maxWidth: 580,
              animationDelay: '120ms',
            }}>
              Podaj swoje dane. AI automatycznie wypełnia formularz.
              Ty przeglądasz pole po polu i pobierasz gotowy tekst.
              {' '}<span className="serif" style={{ fontSize: 19 }}>Twoje dane nie wychodzą poza przeglądarkę.</span>
            </p>

            {/* Stats row */}
            <div className="rise" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, auto)',
              gap: 0, marginTop: 40, marginBottom: 0,
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              padding: '20px 0',
              animationDelay: '180ms',
              width: 'fit-content',
              minWidth: 480,
            }}>
              {[
                { n: totalForms, label: 'formularzy w bazie' },
                { n: availableForms, label: 'dostępnych teraz' },
                { n: 6, label: 'kategorii wniosków' },
              ].map((s, i) => (
                <div key={i} style={{ paddingLeft: i ? 36 : 0, paddingRight: 36, borderLeft: i ? '1px solid var(--color-border)' : 'none' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--color-text-1)', fontVariantNumeric: 'tabular-nums' }}>
                    {s.n}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Beta notice */}
      <div className="container" style={{ paddingBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          background: 'var(--color-accent-soft)',
          border: '1px solid var(--color-amber-border)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--color-text-2)',
          lineHeight: 1.6,
        }}>
          <span style={{ color: 'var(--color-accent)', fontSize: 16, lineHeight: 1 }}>i</span>
          <span>
            Usługa w fazie beta: aktualnie bezpłatna. Generujemy PDF z Twoimi danymi, instrukcją złożenia i wskazówkami.
            Ty podpisujesz i składasz wniosek samodzielnie. Serwis nie działa jako pełnomocnik ani kancelaria.
          </span>
        </div>
      </div>

      {/* Form categories */}
      <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {CATEGORIES.map((cat) => (
            <section key={cat.id}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.1em' }}>
                  {cat.icon}
                </span>
                <h2 className="label-eyebrow" style={{ color: 'var(--color-text-2)', letterSpacing: '0.06em' }}>
                  {cat.label}
                </h2>
                <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                  {cat.forms.length} {cat.forms.length === 1 ? 'formularz' : 'formularzy'}
                </span>
              </div>

              {/* Form cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cat.forms.map((form) => (
                  <FormCard key={form.slug} form={form} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* How it works */}
        <div style={{
          marginTop: 80,
          paddingTop: 48,
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ marginBottom: 40 }}>
            <span className="label-eyebrow">Jak to działa</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{
                padding: '24px 20px',
                background: 'var(--color-bg-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-card)',
              }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.1em', marginBottom: 16 }}>
                  {s.n}
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.65 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div style={{
          marginTop: 40,
          padding: '24px 28px',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Prywatność
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
            Twoje dane osobowe (PESEL, imię, adres) trafiają tylko do serwera w momencie generowania PDF, wyłącznie do wypełnienia dokumentu.
            Nie są zapisywane, nie są przetwarzane do celów marketingowych. PDF generowany jest jednorazowo i nie jest archiwizowany.
          </p>
        </div>

        {/* Contact */}
        <div style={{ marginTop: 24, fontSize: 13, color: 'var(--color-text-3)' }}>
          Brakuje wniosku który potrzebujesz? Napisz:{' '}
          <a href="mailto:sobkowicz.kamil@gmail.com" style={{ color: 'var(--color-accent)' }}>sobkowicz.kamil@gmail.com</a>
        </div>
      </main>

    </div>
  );
}

function FormCard({ form }: { form: Form }) {
  const isAvailable = form.available;

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    padding: '20px 24px',
    borderRadius: 12,
    border: `1px solid ${isAvailable ? 'var(--color-accent)' : 'var(--color-border)'}`,
    background: isAvailable ? 'var(--color-bg-1)' : 'var(--color-bg-0)',
    boxShadow: isAvailable ? 'var(--shadow-card)' : 'none',
    transition: 'transform 320ms cubic-bezier(.2,.7,.1,1), box-shadow 320ms cubic-bezier(.2,.7,.1,1)',
    opacity: isAvailable ? 1 : 0.75,
  };

  return (
    <div style={cardStyle} className={isAvailable ? 'hover-lift' : ''}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          {form.symbol && (
            <span className="mono" style={{
              fontSize: 11, color: 'var(--color-accent)',
              background: 'var(--color-accent-soft)',
              padding: '3px 8px', borderRadius: 6,
              fontWeight: 500,
            }}>
              {form.symbol}
            </span>
          )}
          <h3 style={{
            fontSize: 15, fontWeight: 500,
            color: isAvailable ? 'var(--color-text-1)' : 'var(--color-text-2)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}>
            {form.name}
          </h3>
          {!isAvailable && (
            <span style={{
              fontSize: 10, color: 'var(--color-text-3)',
              border: '1px solid var(--color-border)',
              padding: '2px 7px', borderRadius: 4,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              wkrótce
            </span>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 8 }}>
          {form.institution}
        </p>

        <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.65 }}>
          {form.description}
        </p>

        {form.deadline && (
          <p style={{ marginTop: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-text-3)' }}>Termin:</span>
            <span style={{
              color: form.deadlineUrgent ? 'var(--color-warn)' : 'var(--color-text-2)',
              fontWeight: form.deadlineUrgent ? 600 : 400,
            }}>
              {form.deadline}
            </span>
            {form.deadlineUrgent && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: 'var(--color-warn)',
                background: 'rgba(184,116,26,0.1)',
                padding: '2px 7px', borderRadius: 4,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                Pilne
              </span>
            )}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
        <span className="mono" style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--color-accent)',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          {form.amount}
        </span>

        {isAvailable ? (
          <Link
            href={`/wnioski/${form.slug}`}
            className="btn btn-primary"
            style={{ height: 38, padding: '0 16px', borderRadius: 999, fontSize: 13 }}
          >
            Wypełnij z AI
          </Link>
        ) : (
          <span style={{
            fontSize: 12, color: 'var(--color-text-3)',
            padding: '6px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 999,
          }}>
            Wkrótce
          </span>
        )}
      </div>
    </div>
  );
}
