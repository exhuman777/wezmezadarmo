import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
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
  { category: 'MOPS', name: 'Zasiłek stały i okresowy', amount: 'do 1901 PLN' },
  { category: 'MOPS', name: 'Dodatek mieszkaniowy i energetyczny', amount: 'do 1500 PLN/mies.' },
  { category: 'PUP', name: 'Jednorazowe środki na podjęcie działalności', amount: 'do 45 000 PLN' },
  { category: 'PUP', name: 'Bon szkoleniowy', amount: 'do 16 000 PLN' },
  { category: 'PUP', name: 'Bon na zasiedlenie', amount: 'do 15 669 PLN' },
  { category: 'PUP', name: 'Wniosek o staż z urzędu pracy', amount: 'stypendium ok. 1901 PLN' },
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
  const totalForms = CATEGORIES.reduce((s, c) => s + c.forms.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)' }}>

      <section style={{ position: 'relative', paddingTop: 48, paddingBottom: 48, overflow: 'hidden' }}>
        <div className="grain-bg" />
        <div className="container" style={{ position: 'relative' }}>

          <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <span className="label-eyebrow">Narzędzie obywatelskie</span>
            <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span className="label-eyebrow" style={{ color: 'var(--color-muted-2)' }}>Beta: bezpłatne</span>
          </div>

          <div style={{ maxWidth: 760 }}>
            <h1 className="display rise" style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 24, animationDelay: '60ms' }}>
              Wypełnij wniosek<br />
              <span style={{ color: 'var(--color-accent)' }}>z pomocą AI</span>
            </h1>
            <p className="rise" style={{
              fontSize: 18, lineHeight: 1.6,
              color: 'var(--color-text-2)',
              marginBottom: 20,
              maxWidth: 620,
              animationDelay: '120ms',
            }}>
              Zalogowanym auto-wypełniamy formularz z profilu (PESEL, imię, adres, konto).
              AI tłumaczy każde pole i generuje sugestie treści.
              Pobierasz gotowy PDF do podpisania i złożenia.
            </p>

            <div className="rise grid-stats" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, auto)',
              gap: 0, marginTop: 28, marginBottom: 0,
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              padding: '20px 0',
              animationDelay: '180ms',
              width: 'fit-content',
              minWidth: 0,
            }}>
              {[
                { n: totalForms, label: 'gotowych formularzy' },
                { n: 2, label: 'minuty na wypełnienie (z profilu)' },
                { n: 0, label: 'PLN, bez rejestracji' },
              ].map((s, i) => (
                <div key={i} style={{ paddingLeft: i ? 'clamp(12px, 2vw, 36px)' : 0, paddingRight: 'clamp(12px, 2vw, 36px)', borderLeft: i ? '1px solid var(--color-border)' : 'none' }}>
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

      <div className="container" style={{ paddingBottom: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px',
          background: 'var(--color-accent-soft)',
          border: '1px solid var(--color-amber-border)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--color-text-2)',
          lineHeight: 1.6,
        }}>
          <span style={{ color: 'var(--color-accent)', fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>i</span>
          <span>
            <strong>Beta - bezpłatne.</strong> Twoje dane zostają w Twojej przeglądarce (localStorage) plus opcjonalnie w Twoim profilu na koncie.
            PDF generowany jednorazowo, niezachowywany na serwerze. Serwis nie składa wniosków za Ciebie - generuje gotowy dokument, który Ty podpisujesz i składasz.
          </span>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {CATEGORIES.map((cat) => (
            <section key={cat.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.1em' }}>
                  {cat.icon}
                </span>
                <h2 className="label-eyebrow" style={{ color: 'var(--color-text-2)', letterSpacing: '0.06em' }}>
                  {cat.label}
                </h2>
                <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                  {cat.forms.length} {cat.forms.length === 1 ? 'formularz' : cat.forms.length < 5 ? 'formularze' : 'formularzy'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.forms.map((form) => (
                  <FormCard key={form.slug} form={form} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Roadmap section */}
        <div style={{
          marginTop: 56,
          padding: '24px 26px',
          background: 'var(--color-bg-1)',
          border: '1px dashed var(--color-border)',
          borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.1em' }}>
              ROADMAP
            </span>
            <h2 className="label-eyebrow" style={{ color: 'var(--color-text-2)', letterSpacing: '0.06em' }}>
              Następne formularze ({ROADMAP.length})
            </h2>
            <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 16, lineHeight: 1.6 }}>
            Te formularze są na liście do dodania. Kolejność ustalamy na podstawie zapotrzebowania -
            zgłoś którego potrzebujesz najpilniej.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8,
          }}>
            {ROADMAP.map((r, i) => (
              <div key={i} style={{
                padding: '10px 12px',
                background: 'var(--color-bg-0)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="mono" style={{
                    fontSize: 9, color: 'var(--color-text-3)', letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '2px 6px', borderRadius: 4,
                    background: 'var(--color-bg-1)',
                    border: '1px solid var(--color-border)',
                  }}>
                    {r.category}
                  </span>
                  {r.symbol && (
                    <span className="mono" style={{
                      fontSize: 10, color: 'var(--color-accent)',
                      background: 'var(--color-accent-soft)',
                      padding: '2px 6px', borderRadius: 4,
                    }}>
                      {r.symbol}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.4 }}>
                  {r.name}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                  {r.amount}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, padding: '12px 16px',
            background: 'var(--color-accent-soft)',
            border: '1px solid var(--color-amber-border)',
            borderRadius: 10,
            fontSize: 13, color: 'var(--color-text-2)',
          }}>
            <strong>Potrzebujesz któregoś?</strong>{' '}
            <a href="/dla-firm#kontakt" style={{ color: 'var(--color-accent)' }}>
              Napisz przez kontakt
            </a>
            {' '}- dodamy do priorytetów. Każde zgłoszenie liczy się jak głos.
          </div>
        </div>

        <div style={{
          marginTop: 48,
          paddingTop: 32,
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ marginBottom: 40 }}>
            <span className="label-eyebrow">Jak to działa</span>
          </div>
          <div className="grid-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            gap: 'clamp(12px, 2vw, 24px)',
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

        <div style={{
          marginTop: 24,
          padding: '18px 22px',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Prywatność
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
            Twoje dane osobowe (PESEL, imię, adres) są zapisywane w localStorage Twojej przeglądarki.
            Dla zalogowanych - opcjonalnie w profilu (szyfrowane na poziomie bazy Supabase, dostępne tylko dla Ciebie).
            Podczas generowania PDF dane trafiają tylko jednorazowo do serwera, do wypełnienia dokumentu.
            Nie są przekazywane stronom trzecim, nie służą marketingowi.
          </p>
        </div>

      </main>

    </div>
  );
}

function FormCard({ form }: { form: Form }) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    padding: '16px 20px',
    borderRadius: 12,
    border: '1px solid var(--color-accent)',
    background: 'var(--color-bg-1)',
    boxShadow: 'var(--shadow-card)',
    transition: 'transform 320ms cubic-bezier(.2,.7,.1,1), box-shadow 320ms cubic-bezier(.2,.7,.1,1)',
  };

  return (
    <div style={cardStyle} className="hover-lift">
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
            color: 'var(--color-text-1)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}>
            {form.name}
          </h3>
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
                background: 'var(--color-amber-bg)',
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

        <Link
          href={`/wnioski/${form.slug}`}
          className="btn btn-primary"
          style={{ height: 38, padding: '0 16px', borderRadius: 999, fontSize: 13 }}
        >
          Wypełnij z AI
        </Link>
      </div>
    </div>
  );
}
