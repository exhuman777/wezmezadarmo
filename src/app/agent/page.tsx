'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const CECHY = [
  { label: 'Czat AI, który zna Twoją sytuację', desc: 'Zadajesz pytanie o świadczenie, ZUS, podatki lub formularz. Asystent zna Twój profil (wiek, dochód, dzieci, firma czy osoba prywatna, województwo) i odpowiada konkretnie pod Twoją sytuację.', icon: 'C' },
  { label: '133 świadczeń dopasowanych', desc: 'Po wypełnieniu profilu system przelicza 133 świadczenia (ZUS, NFZ, PFRON, KRUS, MOPS, ulgi PIT) i pokazuje te pewne oraz możliwe, z linkami do źródeł.', icon: 'S' },
  { label: 'Aktualne dane z instytucji', desc: 'Pytasz o kurs euro, a asystent sprawdza go w NBP. Pytasz o kolejkę do kardiologa - sprawdza w NFZ. Podajesz NIP - sprawdza firmę na Białej Liście VAT. Pytasz o smog - podaje pomiar z GIOŚ. Wszystko w jednej rozmowie.', icon: 'L' },
  { label: 'Świeże aktualności urzędowe', desc: 'Asystent śledzi 8 polskich instytucji (ZUS, GUS, NBP, UOKiK, Fundusze UE, e-Zdrowie, Sejm, ARiMR), odświeżane dwa razy dziennie. Cytuje konkretne wiadomości z linkiem do źródła.', icon: 'R' },
  { label: 'Wnioski ZUS krok po kroku', desc: '7 formularzy z pomocą asystenta (Z-15a, Z-15b, Z-3, PEL, ZAS-53, ERPO, ERSU). Podpowiada co wpisać w pola i przygotowuje gotowy do wysyłki PDF.', icon: 'W' },
  { label: 'Alerty na e-mail', desc: 'Wybierasz źródła (ZUS, Sejm, UOKiK...) i tematy (świadczenia, podatki, dotacje), a asystent wysyła e-mail najwyżej dwa razy dziennie z nowymi pasującymi wiadomościami. Bez powtórek.', icon: 'E' },
  { label: 'Centrum Obywatela', desc: '11 darmowych narzędzi urzędowych w jednym miejscu: NFZ, NBP, GIOŚ, Biała Lista VAT, IMGW, akty prawne z Sejmu, dane GUS, mapy działek ARiMR, ulgi PKP.', icon: 'O' },
  { label: 'Bez zmyślania', desc: 'Asystent nigdy nie wymyśla kwot, dat ani formularzy. Podaje dokładnie to, co ma w bazie. Jeśli czegoś nie wie, mówi to wprost i odsyła do właściwego urzędu.', icon: 'X' },
];

const PRZYKŁADY = [
  'Jakie świadczenia mi przysługują?',
  'Czy mogę dostać 800+ na dziecko?',
  'Ile dziś kosztuje euro?',
  'Sprawdź NIP 7342867148',
  'Ile czekam do kardiologa?',
  'Jakie powietrze jest dziś w Warszawie?',
  'Co nowego w ZUS?',
  'Jak złożyć wniosek o zasiłek chorobowy?',
  'Jakie ulgi podatkowe mam jako JDG?',
  'Pomóż mi wypełnić formularz Z-15a',
  'Ile wynosi becikowe?',
  'Bon ciepłowniczy 2026 - czy się kwalifikuję?',
  'KSeF dla JDG - od kiedy obowiązkowy?',
  'Mały ZUS Plus - kiedy mogę skorzystać?',
];

function onTiltEnter(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transition = 'box-shadow 0.2s ease';
}
function onTiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const tX = (y - 0.5) * -7;
  const tY = (x - 0.5) * 7;
  e.currentTarget.style.transform = `perspective(700px) rotateX(${tX}deg) rotateY(${tY}deg) translateY(-4px)`;
  e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.4), 0 4px 16px rgba(34,160,107,0.12)';
  e.currentTarget.style.transition = 'box-shadow 0.15s ease';
}
function onTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  e.currentTarget.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease';
}

function AgentContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Auth-aware: zalogowany -> /panel, niezalogowany -> /rejestracja.
  // Linkujemy wprost do glownych stron auth (/rejestracja, /logowanie), a nie do
  // starych /agent/* ktore i tak robia trwaly redirect - oszczedzamy skok 308.
  const primaryHref = loggedIn ? '/panel' : '/rejestracja';
  const secondaryHref = loggedIn ? '/panel/chat' : '/logowanie';
  const primaryLabel = loggedIn ? 'Przejdź do panelu' : 'Zacznij za darmo';
  const secondaryLabel = loggedIn ? 'Otwórz Czat AI' : 'Mam już konto';

  return (
    <main style={{ background: '#0a1f14', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%)  skewX(-12deg); }
        }

        .btn-agent-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #25b278 0%, #22A06B 50%, #1b8a5b 100%);
          box-shadow: 0 4px 18px rgba(34,160,107,0.45), 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          text-decoration: none;
        }
        .btn-agent-primary::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .btn-agent-primary:hover::before { animation: shimmer 0.55s ease-out; }
        .btn-agent-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(34,160,107,0.55), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn-agent-primary:active { transform: translateY(0) scale(0.97); }

        .btn-agent-secondary {
          position: relative; overflow: hidden;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.18s, border-color 0.18s, box-shadow 0.18s;
          text-decoration: none;
        }
        .btn-agent-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.45) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .btn-agent-secondary:active { transform: translateY(0) scale(0.97); }

        .agent-card {
          position: relative;
          transform-style: preserve-3d;
          will-change: transform;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .agent-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(90deg, transparent 0%, rgba(142,234,173,0.6) 30%, #8EEAAD 60%, rgba(142,234,173,0.6) 80%, transparent 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .agent-card:hover::after { opacity: 1; }

        .example-chip {
          position: relative; overflow: hidden;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.18s, background 0.18s, box-shadow 0.18s;
          text-decoration: none;
        }
        .example-chip::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(142,234,173,0.12), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .example-chip:hover::before { animation: shimmer 0.5s ease-out; }
        .example-chip:hover {
          transform: translateY(-2px) !important;
          border-color: rgba(142,234,173,0.55) !important;
          background: rgba(142,234,173,0.14) !important;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25), 0 2px 8px rgba(34,160,107,0.1);
        }
        .example-chip:active { transform: translateY(0) scale(0.98) !important; }
      `}</style>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(32px, 4vw, 56px) 24px clamp(20px, 2vw, 28px)', position: 'relative' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: '#8EEAAD',
              boxShadow: '0 0 10px rgba(142,234,173,0.7)',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: 'rgba(142,234,173,0.6)',
            }}>
              Asystent AI
            </span>
          </div>

          <h1 className="agent-hero-title" style={{ fontSize: 'clamp(28px, 5.5vw, 64px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 20px', maxWidth: 700 }}>
            Twój agent AI.<br />
            <span style={{ color: '#8EEAAD' }}>Pilnuje spraw, gdy Ty żyjesz.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', maxWidth: 560 }}>
            Dla firm i osób prywatnych. Asystent zna 133 świadczenia, śledzi 8 instytucji państwowych,
            sprawdza dane na żywo (NBP, NFZ, GIOŚ, Biała Lista VAT, CEIDG) i wysyła Ci alerty dopasowane do Ciebie na e-mail.
          </p>
          <div className="cta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href={primaryHref}
              className="btn-agent-primary"
              style={{ fontSize: 15, fontWeight: 600, color: '#fff', padding: '14px 28px', borderRadius: 12, display: 'inline-block' }}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="btn-agent-secondary"
              style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 12, display: 'inline-block' }}
            >
              {secondaryLabel}
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: '16px 0 0', fontFamily: 'var(--font-mono)' }}>
            {loggedIn ? 'Witaj z powrotem. Pełen dostęp do Asystenta AI.' : 'Bez karty kredytowej. 3 pytania dziennie za darmo.'}
          </p>
        </div>
      </section>

      {/* Query banner */}
      {q && (
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 24px' }}>
          <div style={{
            background: 'rgba(34,160,107,0.1)',
            border: '1px solid rgba(142,234,173,0.22)',
            borderRadius: 18,
            padding: '28px 32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(142,234,173,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* subtle top glow line */}
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(142,234,173,0.4), transparent)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <span style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #25b278, #22A06B)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(34,160,107,0.4)',
              }}>?</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 10px', lineHeight: 1.35 }}>
                  &ldquo;{q}&rdquo;
                </p>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>
                  {loggedIn
                    ? 'Otwieram Czat AI z Twoim pytaniem...'
                    : 'Zaloguj się żeby Asystent AI odpowiedział z dostępem do Twojego profilu, świadczeń i dotacji. Albo sprawdź bez logowania w bazie.'}
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link
                    href={loggedIn ? `/panel/chat?q=${encodeURIComponent(q!)}` : `/logowanie?next=${encodeURIComponent('/panel/chat?q=' + q)}`}
                    className="btn-agent-primary"
                    style={{ fontSize: 15, fontWeight: 600, color: '#fff', padding: '12px 24px', borderRadius: 12, display: 'inline-block' }}
                  >
                    {loggedIn ? 'Otwórz Czat AI →' : 'Zaloguj się i zapytaj AI'}
                  </Link>
                  {!loggedIn && (
                    <>
                      <Link
                        href={`/swiadczenia?q=${encodeURIComponent(q!)}`}
                        className="btn-agent-secondary"
                        style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 20px', borderRadius: 12, display: 'inline-block' }}
                      >
                        Sprawdź w bazie (bez logowania)
                      </Link>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                        lub{' '}
                        <Link href="/rejestracja" style={{ color: '#8EEAAD', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                          załóż konto
                        </Link>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Przykłady pytań */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 16px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(142,234,173,0.1)',
          borderRadius: 20,
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(142,234,173,0.04)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* top glow */}
          <div style={{
            position: 'absolute', top: 0, left: '5%', right: '5%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(142,234,173,0.2), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: '#8EEAAD',
              boxShadow: '0 0 8px rgba(142,234,173,0.6)',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: 'rgba(142,234,173,0.5)',
            }}>
              Co może Asystent AI
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Co może Asystent AI
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PRZYKŁADY.map((text) => {
              // Zalogowany -> bezposrednio do chatu z pytaniem
              // Niezalogowany -> banner na /agent z opcjami (login / sprawdz bez logowania)
              const href = loggedIn
                ? `/panel/chat?q=${encodeURIComponent(text)}`
                : `/agent?q=${encodeURIComponent(text)}`;
              return (
                <Link
                  key={text}
                  href={href}
                  className="example-chip"
                  style={{
                    fontSize: 15,
                    color: '#fff',
                    background: 'rgba(142,234,173,0.07)',
                    border: '1px solid rgba(142,234,173,0.18)',
                    borderRadius: 12,
                    padding: '12px 20px',
                    lineHeight: 1.4,
                    display: 'inline-block',
                  }}
                >
                  {text}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cechy */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: '#8EEAAD',
            boxShadow: '0 0 8px rgba(142,234,173,0.6)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: 'rgba(142,234,173,0.5)',
          }}>
            Funkcje
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 14 }}>
          {CECHY.map(({ label, desc, icon }) => (
            <div
              key={label}
              className="agent-card"
              onMouseEnter={onTiltEnter}
              onMouseMove={onTiltMove}
              onMouseLeave={onTiltLeave}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(142,234,173,0.1)',
                borderRadius: 16,
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(145deg, rgba(34,160,107,0.25) 0%, rgba(34,160,107,0.1) 100%)',
                  border: '1px solid rgba(142,234,173,0.2)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(142,234,173,0.1)',
                  color: '#8EEAAD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                }}>{icon}</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{label}</div>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px 40px' }}>
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, maxWidth: 640,
          fontFamily: 'var(--font-mono)',
        }}>
          Asystent AI ma charakter wyłącznie informacyjny. Korzysta z regularnie weryfikowanej bazy 133 świadczeń oraz danych na żywo z instytucji państwowych.
          Nie składa wniosków bez Twojej akceptacji. Żaden dokument nie idzie do urzędu bez Twojej wiedzy i zgody.
          Powered by OpenRouter (Google Gemini 2.0 Flash) - dane zapytania nie są używane do treningu modeli.
        </p>
      </section>
    </main>
  );
}

export default function AgentLanding() {
  return (
    <Suspense>
      <AgentContent />
    </Suspense>
  );
}
