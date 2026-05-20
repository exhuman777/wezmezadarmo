'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CECHY = [
  { label: 'Świadczenia i ulgi', desc: 'Agent dopasowuje 117 świadczeń do Twojego profilu: 800+, becikowe, zasiłki, ulgi podatkowe.', icon: 'S' },
  { label: 'Zmiany w prawie', desc: 'Śledzi ZUS, podatki.gov.pl i zmiany przepisów. Informuje Cię zanim musisz działać.', icon: 'Z' },
  { label: 'Dzienny raport e-mail', desc: 'Co rano dostaniesz zwięzłe podsumowanie co jest nowego. Bez logowania do panelu.', icon: 'D' },
  { label: 'JDG i osoby prywatne', desc: 'Dla prowadzących działalność (NIP + PKD) i dla osób prywatnych (profil rodzinny).', icon: 'J' },
];

const PRZYKŁADY = [
  'Jakie świadczenia mi przysługują?',
  'Czy mogę dostać 800+ na dziecko?',
  'Jak złożyć wniosek o zasiłek chorobowy?',
  'Jakie ulgi podatkowe mam jako JDG?',
  'Co się zmieniło w przepisach ZUS?',
  'Pomóż mi wypełnić formularz Z-15a',
  'Ile wynosi becikowe i jak je dostać?',
  'Czy przysługuje mi dodatek mieszkaniowy?',
];

function AgentContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  return (
    <main style={{ background: '#0a1f14', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 5vw, 72px) 24px clamp(32px, 4vw, 48px)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(142,234,173,0.4)', letterSpacing: '0.06em', marginBottom: 14 }}>
            {'// agent.wezmezadarmo.v1'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px', maxWidth: 700 }}>
            Twój agent AI.<br />
            <span style={{ color: '#8EEAAD' }}>Pilnuje spraw, gdy Ty żyjesz.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', maxWidth: 520 }}>
            Dla JDG i osób prywatnych. Agent sprawdza co Ci przysługuje, śledzi zmiany w prawie
            i wysyła Ci codzienny raport na e-mail.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/agent/rejestracja" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#fff', background: '#22A06B', padding: '11px 22px', borderRadius: 10, textDecoration: 'none', transition: 'opacity 200ms' }}>
              Zacznij za darmo
            </Link>
            <Link href="/agent/logowanie" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '11px 22px', borderRadius: 10, textDecoration: 'none' }}>
              Mam już konto
            </Link>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
              Bez karty kredytowej. 3 pytania dziennie za darmo.
            </span>
          </div>
        </div>
      </section>

      {/* Query banner */}
      {q && (
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: 'rgba(34,160,107,0.12)',
            border: '1px solid rgba(142,234,173,0.25)',
            borderRadius: 16,
            padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: '#22A06B', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
              }}>?</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: '#fff', margin: '0 0 8px', lineHeight: 1.4 }}>
                  &ldquo;{q}&rdquo;
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                  Zaloguj się, żeby Asystent AI odpowiedział na Twoje pytanie.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/agent/logowanie" style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
                    color: '#fff', background: '#22A06B', padding: '10px 20px',
                    borderRadius: 10, textDecoration: 'none',
                  }}>
                    Zaloguj się
                  </Link>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    Nie masz konta?{' '}
                    <Link href="/agent/rejestracja" style={{ color: '#8EEAAD', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      Zacznij za darmo
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Przykłady pytań */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: q ? '28px 24px 0' : '0 24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(142,234,173,0.1)',
          borderRadius: 20,
          padding: '28px 28px 24px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', letterSpacing: '0.02em' }}>
            Co może Asystent AI
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRZYKŁADY.map((text) => (
              <Link
                key={text}
                href={`/agent/logowanie?q=${encodeURIComponent(text)}`}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: '#fff',
                  background: 'rgba(142,234,173,0.08)',
                  border: '1px solid rgba(142,234,173,0.2)',
                  borderRadius: 12,
                  padding: '10px 18px',
                  textDecoration: 'none',
                  transition: 'border-color 200ms, background 200ms',
                  lineHeight: 1.4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(142,234,173,0.5)';
                  e.currentTarget.style.background = 'rgba(142,234,173,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(142,234,173,0.2)';
                  e.currentTarget.style.background = 'rgba(142,234,173,0.08)';
                }}
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cechy */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 12 }}>
          {CECHY.map(({ label, desc, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(142,234,173,0.1)',
              borderRadius: 14,
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(142,234,173,0.1)', color: '#8EEAAD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>{icon}</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#fff' }}>{label}</div>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 40px' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, maxWidth: 640 }}>
          Agent AI ma charakter wyłącznie informacyjny. Nie składamy wniosków bez Twojej akceptacji.
          Żaden dokument nie jest wysyłany do urzędu bez Twojej wiedzy i zgody.
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
