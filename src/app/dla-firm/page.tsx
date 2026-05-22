'use client';

import { useState } from 'react';

/* ── VIA logo SVG ── */
function VIALogo({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.52)} viewBox="0 0 52 27" fill="none">
      <path d="M3 4L12 23L21 9L30 23L39 4" stroke="#1a1525" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 4L49 23" stroke="#1a1525" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── VIA dotacje mini-grid ── */
const SPRAWDZONE_IDX = new Set([5, 20, 33, 41]);
const DOPASOWANE_IDX  = new Set([2, 8, 13, 17, 24, 28, 35, 38, 43, 46, 50, 53]);

function VIAGrid() {
  const COLS = 9, ROWS = 6;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 4, marginBottom: 18 }}>
      {Array.from({ length: COLS * ROWS }).map((_, i) => (
        <div key={i} style={{
          aspectRatio: '1',
          borderRadius: 3,
          background: SPRAWDZONE_IDX.has(i) ? '#5248cc'
            : DOPASOWANE_IDX.has(i) ? '#d87c68'
            : '#cac5dc',
          transition: 'opacity 200ms',
        }} />
      ))}
    </div>
  );
}

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

const AUTOMATYZACJE = [
  {
    ikona: 'F',
    nazwa: 'Faktury z zagranicy',
    opis: 'Automatyczna ekstrakcja danych z faktur mailowych z UE i spoza UE (Stripe, AWS, OpenAI). Kategoryzacja, wpis do ewidencji, alerty o nowych dokumentach.',
    tagi: ['JDG', 'import', 'księgowość'],
  },
  {
    ikona: 'K',
    nazwa: 'KSeF automatyczny',
    opis: 'Automatyczne przesyłanie faktur sprzedażowych do Krajowego Systemu e-Faktur. Bez ręcznego logowania, bez przepisywania danych.',
    tagi: ['KSeF', 'faktury', 'compliance'],
  },
  {
    ikona: 'Z',
    nazwa: 'Raport ZUS miesięczny',
    opis: 'Generowanie miesięcznego raportu składek i zobowiązań ZUS dla pracowników. Gotowy arkusz do przekazania księgowej.',
    tagi: ['ZUS', 'kadry', 'raporty'],
  },
  {
    ikona: 'O',
    nazwa: 'Onboarding pracownika',
    opis: 'Automatyczne sprawdzanie świadczeń przysługujących nowemu pracownikowi. HR dostaje gotową listę zamiast odsyłać na rządowe strony.',
    tagi: ['HR', 'onboarding', 'świadczenia'],
  },
  {
    ikona: 'R',
    nazwa: 'Rozliczenie delegacji',
    opis: 'Ekstrakcja danych z paragonów i faktur delegacyjnych. OCR, kategoryzacja, wpis do arkusza kosztów.',
    tagi: ['delegacje', 'koszty', 'OCR'],
  },
  {
    ikona: 'W',
    nazwa: 'Windykacja należności',
    opis: 'Monitoring przeterminowanych faktur i automatyczne przypomnienia: po 7 dniach mail, po 14 dniach gotowy dokument wezwania do zapłaty. Wezwanie wymagane prawnie przed windykacją sądową.',
    tagi: ['faktury', 'windykacja', 'cash flow'],
  },
  {
    ikona: 'T',
    nazwa: 'Terminarz compliance',
    opis: 'Automatyczne przypomnienia o polskich terminach firmowych: DRA ZUS (25. każdego miesiąca), JPK-VAT, zaliczki PIT, raporty GUS. Kary za spóźnienie zaczynają się od 500 PLN.',
    tagi: ['ZUS', 'VAT', 'terminy'],
  },
  {
    ikona: 'P',
    nazwa: 'Paragony i koszty OCR',
    opis: 'Zdjęcie paragonu z telefonu trafia do skrzynki lub folderu. System odczytuje kwotę, datę i sprzedawcę, wpisuje do arkusza kosztów. Bez ręcznego przepisywania.',
    tagi: ['OCR', 'koszty', 'JDG'],
  },
  {
    ikona: 'U',
    nazwa: 'Alerty wygaśnięcia umów',
    opis: 'Skanujesz bazę umów, kontraktów i subskrypcji SaaS. System czyta daty i wysyła alerty 60, 30 i 7 dni przed wygaśnięciem. Koniec z nieświadomym auto-odnawianiem na starych warunkach.',
    tagi: ['umowy', 'SaaS', 'koszty'],
  },
];

function VIADotacjeCard() {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        borderRadius: 20,
        padding: '32px 36px 28px',
        background: 'linear-gradient(145deg, rgba(242,238,252,0.72) 0%, rgba(232,225,248,0.72) 40%, rgba(222,214,242,0.72) 100%)',
        backdropFilter: 'blur(2px)',
        border: '1px solid rgba(82,72,204,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
          pointerEvents: 'none',
          opacity: 0.6,
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px', position: 'relative', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: '#5248cc', opacity: 0.7 }}>
                04 · MONITORING DOTACJI · PL
              </span>
            </div>
            <VIAGrid />
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5248cc' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#5248cc', flexShrink: 0 }} />
                SPRAWDZONE · 4
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#d87c68' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d87c68', flexShrink: 0 }} />
                DOPASOWANE · 12
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8c86a4' }}>
                KWALIFIKUJĄCE · 70
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 260 }}>
            <div style={{ marginBottom: 24 }}>
              <VIALogo size={48} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 700, lineHeight: 1.2,
                letterSpacing: '-0.025em',
                color: '#1a1525', margin: '0 0 14px',
              }}>
                Dofinansowania dla Twojej firmy, o których nie wiedziałeś.
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: '#3d3557', margin: '0 0 20px', maxWidth: 420 }}>
                Agenci AI pracują za Ciebie <strong>24h na dobę</strong>, monitorując internet
                w poszukiwaniu dotacji i dofinansowań dopasowanych do profilu Twojej firmy.
                Gdy pojawi się coś dla Ciebie, dostajesz alert.
              </p>
            </div>
            <div>
              <div style={{ height: 1, background: 'rgba(82,72,204,0.2)', marginBottom: 14 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#c0392b', fontWeight: 500 }}>
                  × nie widziałeś ich wszystkich
                </span>
                <a
                  href="https://www.tryvia.eu/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-via"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#5248cc', color: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
                    padding: '10px 20px', borderRadius: 10,
                    letterSpacing: '0.01em', textDecoration: 'none',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  Sprawdź VIA
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        @keyframes shimmerVia {
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

        .btn-hero-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #25b278 0%, #22A06B 50%, #1b8a5b 100%);
          box-shadow: 0 4px 16px rgba(34,160,107,0.4), 0 1px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        }
        .btn-hero-primary::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .btn-hero-primary:hover::before { animation: shimmer 0.55s ease-out; }
        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(34,160,107,0.5), 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn-hero-primary:active { transform: translateY(0) scale(0.97); }

        .btn-hero-secondary {
          position: relative; overflow: hidden;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.18s, border-color 0.18s;
        }
        .btn-hero-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.45) !important;
        }
        .btn-hero-secondary:active { transform: translateY(0) scale(0.97); }

        .btn-via {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #6055d8 0%, #5248cc 50%, #4840b8 100%) !important;
          box-shadow: 0 3px 12px rgba(82,72,204,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease !important;
        }
        .btn-via::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .btn-via:hover::before { animation: shimmerVia 0.55s ease-out; }
        .btn-via:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 22px rgba(82,72,204,0.5), inset 0 1px 0 rgba(255,255,255,0.15) !important;
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
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 20px clamp(40px, 5vw, 64px)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(142,234,173,0.5)', letterSpacing: '0.04em', marginBottom: 16 }}>
            {'// dla-firm.wezmezadarmo.v1'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 20px', maxWidth: 700 }}>
            Automatyzacje i API<br />
            <span style={{ color: '#8EEAAD' }}>dla firm</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: '0 0 32px', maxWidth: 540 }}>
            Gotowe automatyzacje procesów firmowych plus baza 117 polskich świadczeń jako REST API do Twojej aplikacji.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#automatyzacje" className="btn-hero-primary" style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              color: '#fff', padding: '12px 22px', borderRadius: 10, textDecoration: 'none',
              display: 'inline-block',
            }}>
              Zobacz automatyzacje
            </a>
            <a href="#api" className="btn-hero-secondary" style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.25)', padding: '12px 22px', borderRadius: 10,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Dokumentacja API
            </a>
          </div>
        </div>
      </section>

      {/* ── AUTOMATYZACJE ── */}
      <section id="automatyzacje" style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
        <Eyebrow>Automatyzacje</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
          Gotowe systemy dla firm
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 32px', maxWidth: 540 }}>
          Każda automatyzacja to działający system wdrażany w ciągu kilku dni. Bez miesięcznych subskrypcji za narzędzia, których nie używasz.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
          gap: 16,
        }}>
          {AUTOMATYZACJE.map(a => (
            <div
              key={a.nazwa}
              className="auto-card"
              onMouseEnter={onTiltEnter}
              onMouseMove={onTiltMove}
              onMouseLeave={onTiltLeave}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span className="card-icon">{a.ikona}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)' }}>
                  {a.nazwa}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '0 0 14px' }}>
                {a.opis}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {a.tagi.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    padding: '3px 9px', borderRadius: 999,
                    background: 'rgba(34,160,107,0.07)',
                    border: '1px solid rgba(34,160,107,0.15)',
                    color: 'var(--color-text-3)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <VIADotacjeCard />
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
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 28px', maxWidth: 540 }}>
            117 zweryfikowanych świadczeń socjalnych, ulg i dotacji. Jeden endpoint REST, odpowiedź w &lt;200ms, aktualizowana baza.
          </p>

          <TerminalWindow />

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              '117 świadczeń w 13 kategoriach',
              'Odpowiedź <200ms',
              'Brak przechowywania danych (RODO)',
              'Dokumentacja dla AI: wezmezadarmo.com/llm.md',
            ].map(item => (
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
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 28px' }}>
          Kto korzysta z naszego API
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: 16,
        }}>
          {[
            {
              ikona: 'H', tytul: 'HR / Kadry',
              opis: 'Przy onboardingu system sprawdza, jakie świadczenia przysługują pracownikowi. HR dostaje gotową listę zamiast odsyłać na rządowe strony.',
            },
            {
              ikona: 'F', tytul: 'Fintech / Bankowość',
              opis: 'Klient składa wniosek kredytowy, a aplikacja w tle sprawdza na jakie regularne świadczenia się kwalifikuje. Realny dochód do scoringu.',
            },
            {
              ikona: 'N', tytul: 'NGO / OPS',
              opis: 'Jedno zapytanie do API zamiast ręcznego sprawdzania kilkudziesięciu stron. Gotowa lista świadczeń z instrukcją złożenia wniosku.',
            },
          ].map(k => (
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
            Warunki współpracy ustalane indywidualnie. Dla NGO możliwy bezpłatny dostęp.
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
                  { key: 'firma', label: 'Nazwa firmy (opcjonalnie)', placeholder: 'Kowalski Sp. z o.o.', type: 'text', autocomplete: 'organization', required: false },
                  { key: 'email', label: 'Adres e-mail', placeholder: 'jan@kowalski.pl', type: 'email', autocomplete: 'email', required: true },
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
                    placeholder="Np. chcemy zintegrować API świadczeń z naszym systemem HR..."
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
