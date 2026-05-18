import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dotacje dla firm -- Agent AI monitorujący nabory | wezmezadarmo',
  description: 'AI agent znający profil Twojej firmy. Monitoruje KFS, PUP, PFRON, KPO i programy samorządowe. Powiadamia gdy otworzy się nabór. 25 PLN miesięcznie.',
};

const PROGRAMS = [
  {
    category: 'KFS',
    name: 'Krajowy Fundusz Szkoleniowy',
    max: 'do 300% przeciętnego wynagrodzenia',
    description: 'Dofinansowanie kształcenia ustawicznego pracowników i pracodawcy. Nabory przez PUP, kalkulowanie wg liczby zatrudnionych.',
  },
  {
    category: 'PUP',
    name: 'Refundacja kosztów zatrudnienia',
    max: 'do 6x średnia krajowa',
    description: 'Refundacja wynagrodzenia i składek ZUS przy zatrudnieniu osoby bezrobotnej. Obowiązek zachowania zatrudnienia przez 12-18 miesięcy.',
  },
  {
    category: 'PFRON',
    name: 'Dofinansowanie zatrudnienia ON',
    max: '2400 PLN / miesiąc / osobę',
    description: 'Miesięczne dofinansowanie do wynagrodzeń pracowników z orzeczeniem o niepełnosprawności. Wnioski przez SODiR.',
  },
  {
    category: 'KPO',
    name: 'Krajowy Plan Odbudowy',
    max: 'do 2 mln PLN',
    description: 'Inwestycje w cyfryzację, zieloną transformację i odporność przedsiębiorstw. Nabory prowadzone przez PARP i BGK.',
  },
  {
    category: 'Samorządy',
    name: 'Programy samorządowe',
    max: 'różne -- od 5 tys. PLN',
    description: 'Dotacje z urzędów marszałkowskich, gmin i powiatów. Różne kryteria, częste nabory lokalne. Monitoring 16 województw.',
  },
  {
    category: 'PARP',
    name: 'Polska Agencja Rozwoju Przedsiębiorczości',
    max: 'do 10 mln PLN',
    description: 'Programy B+R, innowacje, eksport, digitalizacja. Środki z funduszy europejskich FEP 2021-2027.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Podaj NIP',
    desc: 'Agent pobiera dane firmy z CEIDG -- nazwa, adres, PKD, forma prawna. Nie wpisujesz ręcznie.',
  },
  {
    num: '02',
    title: 'Skonfiguruj profil',
    desc: 'Zaznacz co Cię interesuje: szkolenia, zatrudnienie, innowacje, zielona transformacja, eksport.',
  },
  {
    num: '03',
    title: 'Rozmawiaj z agentem',
    desc: 'Pytaj o konkretne programy, kwoty, procedury, wymagania. Agent zna Twoją firmę i odpowiada w kontekście.',
  },
  {
    num: '04',
    title: 'Dostaj powiadomienia',
    desc: 'Email gdy otworzy się nowy nabór pasujący do profilu firmy. Jedno miejsce zamiast 40 stron instytucji.',
  },
];

const FEATURES = [
  'Chat z agentem AI 24/7',
  'Monitoring programów dotacyjnych',
  'Email -- powiadomienia o naborach',
  'Profil firmy na podstawie NIP',
  'Filtry: branża, rozmiar, region',
  'Historia rozmów i eksport notatek',
];

export default function DotacjePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '72px 24px 56px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            letterSpacing: '0.04em',
          }}>
            {'// agent.dotacje.v1'}
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: 'var(--color-text-1)',
          margin: '0 0 20px',
          maxWidth: '780px',
        }}>
          Dotacje dla{' '}
          <span style={{ color: 'var(--color-accent)' }}>Twojej firmy.</span>
          <br />
          Agent, który nie śpi.
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.65,
          color: 'var(--color-text-2)',
          margin: '0 0 32px',
          maxWidth: '560px',
        }}>
          AI agent znający profil Twojej firmy. Monitoruje KFS, PUP, PFRON, KPO
          i programy samorządowe. Powiadamia gdy otworzy się nabór.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/dotacje/rejestracja"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-bg-0)',
              background: 'var(--color-accent)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Zacznij 7 dni za darmo
          </Link>
          <Link
            href="#jak-dziala"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--color-text-2)',
              border: '1px solid var(--color-border-light)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Zobacz jak działa
          </Link>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-amber-border)',
            background: 'var(--color-amber-bg)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
          }}>
            25 PLN / miesiąc
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
          marginTop: '16px',
          lineHeight: 1.5,
        }}>
          Agent AI ma charakter informacyjny. Nie gwarantujemy przyznania dofinansowania.
        </p>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-1)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {[
            { num: '20+', label: 'programów w bazie' },
            { num: '16', label: 'województw' },
            { num: 'co tydz.', label: 'aktualizacje naborów' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '20px 24px',
                borderRight: i < 2 ? '1px solid var(--color-border)' : undefined,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                fontWeight: 500,
                color: 'var(--color-accent)',
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--color-text-3)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="jak-dziala" style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '64px 24px',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            JAK TO DZIAŁA
          </span>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--color-text-1)',
            margin: '8px 0 0',
            letterSpacing: '-0.02em',
          }}>
            Cztery kroki do pierwszego powiadomienia
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'var(--color-border)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {STEPS.map((step) => (
            <div
              key={step.num}
              style={{
                background: 'var(--color-bg-1)',
                padding: '24px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-accent)',
                marginBottom: '10px',
                opacity: 0.8,
              }}>
                {step.num}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-1)',
                marginBottom: '8px',
              }}>
                {step.title}
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-text-3)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section id="programy" style={{
        background: 'var(--color-bg-1)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '64px 24px',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              PROGRAMY
            </span>
            <h2 style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--color-text-1)',
              margin: '8px 0 0',
              letterSpacing: '-0.02em',
            }}>
              Co monitoruje agent
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
          }}>
            {PROGRAMS.map((prog) => (
              <div
                key={prog.category}
                style={{
                  background: 'var(--color-bg-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--color-accent)',
                    background: 'var(--color-amber-bg)',
                    border: '1px solid var(--color-amber-border)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    letterSpacing: '0.04em',
                  }}>
                    {prog.category}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-1)',
                  marginBottom: '4px',
                }}>
                  {prog.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-accent)',
                  marginBottom: '10px',
                  opacity: 0.9,
                }}>
                  {prog.max}
                </div>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: 'var(--color-text-3)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {prog.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aktualnosci i monitoring */}
      <section id="aktualnosci" style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '64px 24px',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            AKTUALNOŚCI I MONITORING
          </span>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--color-text-1)',
            margin: '8px 0 0',
            letterSpacing: '-0.02em',
          }}>
            Agent, który czyta zamiast Ciebie
          </h2>
        </div>
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          background: 'var(--color-bg-1)',
          padding: '28px 32px',
          maxWidth: '720px',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.75,
            color: 'var(--color-text-2)',
            margin: '0 0 24px',
          }}>
            Monitorowanie aktualności. Twój agent śledzi rządowe i branżowe RSS, wychwytuje
            istotne zmiany i przygotowuje wstępne wnioski do Twojej weryfikacji.
            Żaden dokument nie jest składany bez Twojej akceptacji.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/dotacje/rejestracja"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-bg-0)',
                background: 'var(--color-accent)',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Skonfiguruj monitoring
            </Link>
            <Link
              href="/dotacje/rejestracja"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--color-text-2)',
                border: '1px solid var(--color-border-light)',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Załóż konto
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '64px 24px',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            CENNIK
          </span>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--color-text-1)',
            margin: '8px 0 0',
            letterSpacing: '-0.02em',
          }}>
            Jeden plan. Jeden koszt.
          </h2>
        </div>
        <div style={{
          maxWidth: '480px',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius)',
          background: 'var(--color-bg-1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '28px 28px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              marginBottom: '6px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '40px',
                fontWeight: 500,
                color: 'var(--color-text-1)',
                lineHeight: 1,
              }}>
                25 PLN
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--color-text-3)',
              }}>
                / miesiąc
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--color-text-3)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              7 dni trial -- karta wymagana po upływie okresu próbnego.
              Anuluj w dowolnym momencie.
            </p>
          </div>
          <div style={{ padding: '20px 28px' }}>
            <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none' }}>
              {FEATURES.map((f) => (
                <li
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 0',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--color-text-2)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-accent)',
                    minWidth: '12px',
                  }}>
                    +
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dotacje/rejestracja"
              style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-bg-0)',
                background: 'var(--color-accent)',
                padding: '11px 20px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              Zacznij za darmo
            </Link>
          </div>
          <div style={{
            padding: '14px 28px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-2)',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Doradca dotacyjny: 1000--3000 zł za jednorazową analizę.
              Ten agent: 25 zł miesięcznie, bez limitu zapytań.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link: automatyzacje */}
      <section style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-1)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-text-3)',
            margin: 0,
          }}>
            W ramach konta dostępne są również automatyzacje procesów biurowych.
          </p>
          <Link
            href="/automatyzacje"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              border: '1px solid var(--color-amber-border)',
              background: 'var(--color-amber-bg)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            Poznaj automatyzacje AI
          </Link>
        </div>
      </section>

      {/* Legal disclaimer */}
      <section style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-1)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 24px',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            lineHeight: 1.6,
            margin: '0 0 8px',
            maxWidth: '720px',
          }}>
            Agent AI ma charakter wyłącznie informacyjny. Nie prowadzimy doradztwa prawnego
            ani finansowego. Decyzja o przyznaniu dofinansowania należy wyłącznie do instytucji
            zarządzającej programem. Informacje mogą nie odzwierciedlać aktualnego stanu naborów.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { href: '/dotacje/regulamin', label: 'Regulamin' },
              { href: '/dotacje/polityka-ai', label: 'Polityka AI' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-3)',
                  textDecoration: 'underline',
                  textDecorationColor: 'var(--color-border-light)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-0)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
          }}>
            wezmezadarmo.com / dotacje &mdash; 2026
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/dotacje/regulamin', label: 'Regulamin' },
              { href: '/dotacje/polityka-ai', label: 'Polityka AI' },
              { href: '/dotacje/kontakt', label: 'Kontakt' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-3)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              opacity: 0.7,
            }}>
              Dane przetwarzamy zgodnie z RODO. Nie sprzedajemy danych.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
