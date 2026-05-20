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
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 20px', maxWidth: 700 }}>
            Twój agent AI.<br />
            <span style={{ color: '#8EEAAD' }}>Pilnuje spraw, gdy Ty żyjesz.</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', maxWidth: 540 }}>
            Dla JDG i osób prywatnych. Agent sprawdza co Ci przysługuje, śledzi zmiany w prawie
            i wysyła Ci codzienny raport na e-mail.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/agent/rejestracja" style={{ fontSize: 15, fontWeight: 600, color: '#fff', background: '#22A06B', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', transition: 'opacity 200ms' }}>
              Zacznij za darmo
            </Link>
            <Link href="/agent/logowanie" style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 12, textDecoration: 'none' }}>
              Mam już konto
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '16px 0 0' }}>
            Bez karty kredytowej. 3 pytania dziennie za darmo.
          </p>
        </div>
      </section>

      {/* Query banner */}
      {q && (
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 24px' }}>
          <div style={{
            background: 'rgba(34,160,107,0.12)',
            border: '1px solid rgba(142,234,173,0.25)',
            borderRadius: 16,
            padding: '28px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <span style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: '#22A06B', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700,
              }}>?</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 10px', lineHeight: 1.35 }}>
                  &ldquo;{q}&rdquo;
                </p>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>
                  Zaloguj się, żeby Asystent AI odpowiedział na Twoje pytanie.
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/agent/logowanie" style={{
                    fontSize: 15, fontWeight: 600,
                    color: '#fff', background: '#22A06B', padding: '12px 24px',
                    borderRadius: 12, textDecoration: 'none',
                  }}>
                    Zaloguj się
                  </Link>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
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
      <section style={{ maxWidth: 960, margin: '0 auto', padding: q ? '0 24px' : '0 24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(142,234,173,0.1)',
          borderRadius: 20,
          padding: '32px',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Co może Asystent AI
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PRZYKŁADY.map((text) => (
              <Link
                key={text}
                href={`/agent/logowanie?q=${encodeURIComponent(text)}`}
                style={{
                  fontSize: 15,
                  color: '#fff',
                  background: 'rgba(142,234,173,0.08)',
                  border: '1px solid rgba(142,234,173,0.2)',
                  borderRadius: 12,
                  padding: '12px 20px',
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
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 14 }}>
          {CECHY.map(({ label, desc, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(142,234,173,0.1)',
              borderRadius: 16,
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(142,234,173,0.1)', color: '#8EEAAD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>{icon}</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{label}</div>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 48px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, maxWidth: 640 }}>
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
