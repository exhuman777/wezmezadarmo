'use client';

import { useState } from 'react';

/* ── Terminal code window ── */
function TerminalWindow() {
  const C = {
    cmd:    '#e06c75',
    flag:   '#56b6c2',
    method: '#e5c07b',
    url:    '#61afef',
    str:    '#98c379',
    key:    '#e06c75',
    num:    '#d19a66',
    dim:    '#6b7280',
    base:   '#abb2bf',
  };
  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
      margin: '0 0 28px',
      border: '1px solid rgba(0,0,0,0.12)',
    }}>
      {/* Title bar */}
      <div style={{
        background: 'linear-gradient(180deg, #3a3a3a 0%, #2d2d2d 100%)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c841', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
        </div>
        <span style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888',
          letterSpacing: '0.02em',
        }}>
          api-request.sh
        </span>
      </div>
      {/* Code area */}
      <div style={{
        background: '#1a1a1a',
        padding: '20px 22px',
        overflowX: 'auto',
      }}>
        <pre style={{
          margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5,
          lineHeight: 1.75, whiteSpace: 'pre',
        }}>
          <span style={{ color: C.cmd }}>curl</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.flag }}>-X</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.method }}>POST</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.url }}>https://wezmezadarmo.com/api/verify</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-H</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.str }}>&quot;Content-Type: application/json&quot;</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-H</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.str }}>&quot;X-API-Key: TWOJ_KLUCZ_API&quot;</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-d</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.dim }}>&apos;{'{ '}</span>
          <span style={{ color: C.key }}>&quot;profile&quot;</span>
          <span style={{ color: C.dim }}>: {'{ '}</span>
          <span style={{ color: C.key }}>&quot;wiek&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>35</span>
          <span style={{ color: C.dim }}>, </span>
          <span style={{ color: C.key }}>&quot;plec&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.str }}>&quot;K&quot;</span>
          <span style={{ color: C.dim }}>,{'\n'}    </span>
          <span style={{ color: C.key }}>&quot;liczbaDzieci&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>2</span>
          <span style={{ color: C.dim }}>, </span>
          <span style={{ color: C.key }}>&quot;dochodNaOsobe&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>1500</span>
          <span style={{ color: C.dim }}>{' } }'}&apos;</span>
        </pre>
      </div>
    </div>
  );
}

/* ── Eyebrow label ── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: '#22A06B',
        boxShadow: '0 0 8px rgba(34,160,107,0.6)',
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        color: 'var(--color-text-3)',
      }}>
        {children}
      </span>
    </div>
  );
}

/* ── Tilt helpers ── */
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
  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(34,160,107,0.08)`;
  e.currentTarget.style.transition = 'box-shadow 0.15s ease';
}
function onTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
  e.currentTarget.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease';
}

/* ── Kto korzysta z API: firmy, instytucje i organizacje wspierające ludzi ── */
const ODBIORCY = [
  {
    ikona: 'N', tytul: 'NGO i OPS',
    opis: 'Jedno zapytanie do API zamiast ręcznego przeszukiwania kilkudziesięciu rządowych stron. Doradca dostaje gotową listę świadczeń z instrukcją złożenia wniosku dla konkretnej osoby.',
  },
  {
    ikona: 'S', tytul: 'Pracownicy socjalni i doradcy obywatelscy',
    opis: 'Podczas rozmowy z podopiecznym system od razu pokazuje, co danej osobie przysługuje. Mniej biurokracji, więcej realnej pomocy, zero przechowywania danych klienta.',
  },
  {
    ikona: 'D', tytul: 'Organizacje osób z niepełnosprawnością',
    opis: 'Świadczenie wspierające, dofinansowania PFRON, ulgi i turnusy rehabilitacyjne w jednym miejscu. API pomaga dotrzeć z informacją do osób, które najczęściej zostają z niczym.',
  },
  {
    ikona: 'E', tytul: 'Organizacje senioralne i opiekunowie',
    opis: 'Trzynastka, czternastka, dodatek osłonowy, refundacja leków, opieka 75+. Wsparcie dla seniorów i osób, które na co dzień się nimi opiekują, bez konieczności znajomości przepisów.',
  },
  {
    ikona: 'M', tytul: 'Wsparcie migrantów i osób wykluczonych cyfrowo',
    opis: 'Dla ludzi, którzy nie poruszają się swobodnie po polskich portalach urzędowych. Prosty interfejs i jasna lista uprawnień zmniejszają barierę językową i cyfrową.',
  },
  {
    ikona: 'B', tytul: 'Biblioteki i punkty pomocy cyfrowej',
    opis: 'Punkty wsparcia obywatela mogą bezpłatnie sprawdzić uprawnienia osoby, której pomagają. Inkluzja cyfrowa zamiast odsyłania na dziesiątki różnych stron.',
  },
  {
    ikona: 'R', tytul: 'Uczelnie i badacze',
    opis: 'Otwarte dane (CC-BY-4.0) i otwarty silnik (AGPL-3.0) do badań nad nieskorzystaniem ze świadczeń (benefit take-up) oraz nad dostępnością wsparcia w różnych grupach.',
  },
  {
    ikona: 'H', tytul: 'HR, kadry i fintech',
    opis: 'Przy onboardingu lub wniosku kredytowym aplikacja w tle sprawdza, jakie regularne świadczenia przysługują osobie. Pracownik lub klient nie zostaje sam z biurokracją.',
  },
];

const FEATURES = [
  '118 świadczeń w 15 kategoriach, ręcznie zweryfikowanych',
  'Odpowiedź <200ms, aktualizowana baza',
  'Brak przechowywania danych (prywatność i RODO wbudowane)',
  'Otwarte: kod AGPL-3.0, dane CC-BY-4.0 - wolno reużywać',
  'Bezpłatne; klucz API także dla NGO i instytucji publicznych',
  'Dokumentacja dla AI: wezmezadarmo.com/llm.md',
];

export default function DlaFirmPage() {
  const [form, setForm] = useState({ imie: '', firma: '', email: '', wiadomosc: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Błąd wysyłania.');
        setStatus('error');
      } else {
        setStatus('ok');
      }
    } catch {
      setErrorMsg('Błąd połączenia. Spróbuj ponownie.');
      setStatus('error');
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Global animations ── */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%)  skewX(-12deg); }
        }
        .btn-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #25b278 0%, #22A06B 50%, #1b8a5b 100%);
          box-shadow: 0 2px 10px rgba(34,160,107,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          text-decoration: none;
        }
        .btn-primary::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .btn-primary:hover::before { animation: shimmer 0.55s ease-out; }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34,160,107,0.45), 0 2px 6px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn-primary:active {
          transform: translateY(0) scale(0.97);
          box-shadow: 0 2px 8px rgba(34,160,107,0.3);
        }

        .auto-card {
          position: relative;
          background: var(--color-bg-1);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 24px;
          transform-style: preserve-3d;
          will-change: transform;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .auto-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(90deg, transparent 0%, #22A06B 30%, #8EEAAD 60%, #22A06B 80%, transparent 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .auto-card:hover::after { opacity: 1; }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          background: rgba(34,160,107,0.05);
          border: 1px solid rgba(34,160,107,0.14);
          border-left: 2px solid #22A06B;
          border-radius: 9px;
          font-size: 14px;
          color: var(--color-text-2);
          backdrop-filter: blur(2px);
          transition: background 0.15s, transform 0.15s;
        }
        .feature-item:hover {
          background: rgba(34,160,107,0.09);
          transform: translateX(3px);
        }
        .feature-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(34,160,107,0.2) 0%, rgba(34,160,107,0.1) 100%);
          border: 1px solid rgba(34,160,107,0.25);
          display: flex; align-items: center; justify-content: center;
          color: #22A06B; font-size: 11px; font-weight: 700;
          flex-shrink: 0;
          font-family: var(--font-mono);
        }

        .card-icon {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 14px; font-weight: 700;
          background: linear-gradient(145deg, #0d2b1c 0%, #0a3820 50%, #123024 100%);
          box-shadow: 0 3px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(142,234,173,0.08), 0 0 0 1px rgba(142,234,173,0.08);
          color: #8EEAAD;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0a1f14 0%, #0f2e1a 40%, #122d1c 100%)',
        borderRadius: '0 0 24px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 20px clamp(48px, 6vw, 72px)', position: 'relative' }}>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(142,234,173,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Otwarte API · dla firm, NGO i instytucji
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px', maxWidth: 680 }}>
            Jedno API do świadczeń,<br />
            <span style={{ color: '#8EEAAD' }}>które należą się ludziom.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.62)', margin: '0 0 40px', maxWidth: 560 }}>
            Otwarta, bezpłatna baza 118 zweryfikowanych świadczeń jako REST API. Dla firm,
            organizacji pozarządowych, instytucji i każdego, kto pomaga ludziom znaleźć
            wsparcie, które im przysługuje. Prywatność wbudowana: nie przechowujemy danych.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="#api" className="btn-primary" style={{
              display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              color: '#fff', padding: '12px 22px', borderRadius: 10,
            }}>
              Zobacz API
            </a>
            <a href="#kontakt" style={{
              display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'rgba(255,255,255,0.85)', padding: '12px 22px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none',
            }}>
              Napisz po klucz API
            </a>
          </div>

        </div>
      </section>

      {/* ── API ── */}
      <section id="api" style={{
        background: 'var(--color-bg-2)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
          <Eyebrow>REST API</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
            API bazy świadczeń
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 28px', maxWidth: 560 }}>
            118 zweryfikowanych świadczeń socjalnych, ulg i dotacji. Jeden endpoint REST,
            odpowiedź w &lt;200ms, aktualizowana baza. Otwarte oprogramowanie i otwarte dane,
            bezpłatne także dla organizacji pozarządowych i instytucji publicznych.
          </p>

          <TerminalWindow />

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEATURES.map(item => (
              <li key={item} className="feature-item">
                <span className="feature-icon">+</span>
                {item}
              </li>
            ))}
          </ul>

          <a href="#kontakt" className="btn-primary" style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
            color: '#fff', padding: '12px 22px', borderRadius: 10,
          }}>
            Napisz po klucz API
          </a>
        </div>
      </section>

      {/* ── DLA KOGO ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
        <Eyebrow>Dla kogo</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
          Kto korzysta z API
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 28px', maxWidth: 560 }}>
          Przede wszystkim ci, którzy pomagają ludziom: organizacje pozarządowe, pracownicy
          socjalni, instytucje i punkty wsparcia. API ma zmniejszać wykluczenie - cyfrowe,
          informacyjne i społeczne.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: 16,
        }}>
          {ODBIORCY.map(k => (
            <div
              key={k.tytul}
              className="auto-card"
              onMouseEnter={onTiltEnter}
              onMouseMove={onTiltMove}
              onMouseLeave={onTiltLeave}
            >
              <span className="card-icon" style={{ marginBottom: 14, display: 'flex' }}>{k.ikona}</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8 }}>
                {k.tytul}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)', margin: 0 }}>
                {k.opis}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KONTAKT ── */}
      <section id="kontakt" style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-2)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
          <Eyebrow>Kontakt</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
            Porozmawiajmy o współpracy
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 28px' }}>
            Wszystkie funkcje wezmezadarmo.com są bezpłatne. Napisz, jeśli chcesz klucz do API,
            zintegrować bazę świadczeń albo wspólnie wspierać dostęp obywateli do należnego im wsparcia.
            Organizacje pozarządowe i instytucje publiczne mile widziane.
          </p>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16, padding: 'clamp(20px, 3vw, 28px) clamp(16px, 3vw, 32px)',
          }}>
            {status === 'ok' ? (
              <div style={{
                padding: '32px 24px', textAlign: 'center',
                border: '1px solid var(--color-accent)', borderRadius: 12,
                background: 'var(--color-bg-0)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 12 }}>Wiadomość wysłana</div>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                  Odpiszemy w ciągu jednego dnia roboczego na podany adres e-mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {([
                  { key: 'imie', label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', type: 'text', autocomplete: 'name', required: true },
                  { key: 'firma', label: 'Organizacja lub firma (opcjonalnie)', placeholder: 'Fundacja / firma', type: 'text', autocomplete: 'organization', required: false },
                  { key: 'email', label: 'Adres e-mail', placeholder: 'jan@przyklad.pl', type: 'email', autocomplete: 'email', required: true },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 8 }}>{f.label}</label>
                    <input
                      type={f.type}
                      autoComplete={f.autocomplete}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '11px 14px', fontSize: 15,
                        background: 'var(--color-bg-0)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10, color: 'var(--color-text-1)',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(34,160,107,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,160,107,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 8 }}>Opisz swój przypadek użycia</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Np. jesteśmy fundacją i chcemy sprawdzać uprawnienia podopiecznych przez API..."
                    value={form.wiadomosc}
                    onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '11px 14px', fontSize: 15,
                      background: 'var(--color-bg-0)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10, color: 'var(--color-text-1)',
                      outline: 'none', resize: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(34,160,107,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,160,107,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {status === 'error' && (
                  <p style={{ fontSize: 14, color: 'var(--red-400)', margin: 0 }}>{errorMsg}</p>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className={status !== 'sending' ? 'btn-primary' : ''}
                    style={{
                      padding: '13px 28px',
                      background: status === 'sending' ? 'var(--color-border)' : undefined,
                      color: '#fff',
                      fontWeight: 600, fontSize: 16, borderRadius: 10,
                      border: 'none', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {status === 'sending' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                  </button>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', marginTop: 10 }}>
                    Wiadomość trafia bezpośrednio do autora. Odpiszemy w ciągu jednego dnia roboczego.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
