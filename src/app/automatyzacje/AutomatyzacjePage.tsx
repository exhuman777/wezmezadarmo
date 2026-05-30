import Link from 'next/link';

const MOZLIWOSCI = [
  { obszar: 'Faktury zagraniczne', opis: 'Polskie faktury trafiają do KSeF. Rachunki spoza UE (Stripe, OpenAI, AWS, Notion) przychodzą mailem i łatwo je przegapić. Można je automatycznie odczytywać i wpisywać do ewidencji.' },
  { obszar: 'Oferty', opis: 'Przygotowanie szablonu, edycja kwot i wysyłka. Powtarzalna praca, którą można w dużej części zautomatyzować.' },
  { obszar: 'Raporty', opis: 'Zbieranie danych z arkuszy na koniec miesiąca, formatowanie i dystrybucja do zespołu lub księgowej.' },
  { obszar: 'Maile do klientów', opis: 'Potwierdzenia zamówień, przypomnienia, follow-up po spotkaniu. Szablony i wstępne wersje mogą powstawać automatycznie.' },
  { obszar: 'Terminy ZUS i US', opis: 'Pilnowanie terminów, generowanie druków i przepisywanie danych do ewidencji.' },
];

const PRZYKLADY = [
  {
    tytul: 'Faktury zagraniczne',
    opis: 'Agent skanuje skrzynkę mailową, odczytuje dane z rachunków spoza UE (data, kwota, waluta, dostawca, numer), wpisuje je do wskazanego arkusza i sygnalizuje każdy nowy dokument do zaksięgowania.',
  },
  {
    tytul: 'Automatyzacja wniosków',
    opis: 'Agent monitoruje dostępne dofinansowania i przygotowuje wstępny wniosek na podstawie profilu firmy, a następnie przekazuje go do weryfikacji osobie decyzyjnej. Agent nigdy nie składa dokumentów samodzielnie - zawsze czeka na akceptację człowieka.',
  },
];

export default function AutomatyzacjePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{ position: 'relative', paddingTop: 0, paddingBottom: 80 }}>
        <div className="grain-bg" />

        {/* Dark green hero */}
        <div style={{
          background: 'radial-gradient(800px 500px at 80% 20%, rgba(34,160,107,.25), transparent 60%), radial-gradient(600px 400px at 20% 80%, rgba(78,196,138,.18), transparent 60%), var(--green-950)',
          borderRadius: '0 0 24px 24px',
          padding: 'clamp(48px, 6vw, 80px) 0 clamp(40px, 5vw, 64px)',
          marginBottom: 'clamp(32px, 5vw, 64px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', maxWidth: 960 }}>
            <div className="rise" style={{ marginBottom: 20 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green-300)' }}>Automatyzacje AI - strona informacyjna</span>
            </div>
            <h1 className="display rise" style={{
              fontSize: 'clamp(32px, 5vw, 60px)',
              marginBottom: 24,
              animationDelay: '60ms',
              color: '#fff',
            }}>
              Takie automatyzacje są dziś możliwe<br />
              <span style={{ color: 'var(--green-300)' }}>i dostępne dla europejskich firm.</span>
            </h1>
            <p className="rise" style={{
              fontSize: 18, lineHeight: 1.65,
              color: 'var(--ink-400)',
              maxWidth: 640, marginBottom: 0,
              animationDelay: '120ms',
            }}>
              Codzienna biurokracja, faktury i powtarzalne maile pochłaniają czas. Narzędzia AI
              potrafią dziś czytać skrzynkę, porządkować dokumenty i przygotowywać wstępne wersje
              pism. Poniżej pokazujemy, co realnie da się zautomatyzować.
            </p>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', maxWidth: 960 }}>

          {/* Co-promocja / pro bono note */}
          <div className="rise" style={{ marginBottom: 56 }}>
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '24px 28px',
              background: 'var(--color-surface)',
            }}>
              <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Jak to się ma do wezmezadarmo.com</span>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7, margin: 0 }}>
                wezmezadarmo.com jest projektem prowadzonym pro bono dla obywateli, rodzin, osób
                wykluczonych cyfrowo i naukowców - i pozostaje bezpłatny. Ta strona ma charakter
                wyłącznie edukacyjny i informacyjny. Pokazuje prostą rzecz: Europa jest już mocno
                scyfryzowana, a z tej cyfryzacji można dalej korzystać z pomocą AI i kodu działającego
                na uporządkowanych, zweryfikowanych przez człowieka danych. Niczego tu nie sprzedajemy,
                a ewentualne wdrożenia realizują niezależni europejscy partnerzy.
              </p>
            </div>
          </div>

          {/* MOŻLIWOŚCI */}
          <div className="rise" style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
              <span className="label-eyebrow">Co można dziś zautomatyzować</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {MOZLIWOSCI.map((p, i) => {
                const icons = ['F', 'O', 'R', 'M', 'Z'];
                return (
                  <div key={p.obszar} style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(120px, 200px) 1fr',
                    gap: 24,
                    padding: '18px 24px',
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    background: 'var(--color-surface)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'var(--green-950)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, flexShrink: 0,
                      }}>{icons[i]}</span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-1)' }}>{p.obszar}</div>
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{p.opis}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRZYKŁADY */}
          <div className="rise" style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Przykłady automatyzacji</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PRZYKLADY.map((p, i) => {
                const icons = ['F', 'W'];
                return (
                  <div key={p.tytul} style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    padding: '22px 28px',
                    background: 'var(--color-surface)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--green-950)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, flexShrink: 0,
                      }}>{icons[i]}</span>
                      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-1)' }}>{p.tytul}</div>
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{p.opis}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-link: dotacje (bezpłatne) */}
          <div className="rise" style={{ marginBottom: 64 }}>
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '28px 32px',
              background: 'var(--color-surface)',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
                Bezpłatne w wezmezadarmo.com
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, letterSpacing: '-0.015em' }}>
                Monitoring dofinansowań dla firm
              </h3>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7, maxWidth: 560, marginBottom: 20 }}>
                Bezpłatny agent w wezmezadarmo.com śledzi KFS, PUP, PFRON i KPO i przygotowuje
                wnioski do Twojej akceptacji. Korzystanie jest darmowe, z limitami uczciwego użycia.
              </p>
              <Link href="/dotacje" style={{
                display: 'inline-block',
                padding: '10px 22px',
                background: 'var(--color-accent)', color: 'var(--color-bg-0)',
                fontWeight: 600, fontSize: 14, borderRadius: 10,
                textDecoration: 'none',
              }}>
                Zobacz monitoring dotacji
              </Link>
            </div>
          </div>

          {/* Closing note */}
          <div className="rise" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.7, maxWidth: 640 }}>
              Strona ma charakter informacyjny. Więcej o misji projektu przeczytasz na stronie{' '}
              <Link href="/o-projekcie" style={{ color: 'var(--color-green)', textDecoration: 'none' }}>O projekcie</Link>.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
