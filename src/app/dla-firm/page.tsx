'use client';

import { useState } from 'react';

const EXAMPLE_REQUEST = `curl -X POST https://wezmezadarmo.com/api/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: TWOJ_KLUCZ_API" \\
  -d '{ "profile": { "wiek": 35, "plec": "K",
    "liczbaDzieci": 2, "dochodNaOsobe": 1500 } }'`;

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
    ikona: 'D',
    nazwa: 'Monitoring dotacji',
    opis: 'AI agent sprawdza nowe dotacje i dofinansowania pasujące do profilu firmy. Powiadomienie, gdy pojawi się coś dla Ciebie.',
    tagi: ['dotacje', 'PARP', 'NCBiR'],
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
            <a href="#automatyzacje" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#fff', background: '#22A06B', padding: '12px 22px', borderRadius: 10, textDecoration: 'none' }}>
              Zobacz automatyzacje
            </a>
            <a href="#api" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 22px', borderRadius: 10, textDecoration: 'none' }}>
              Dokumentacja API
            </a>
          </div>
        </div>
      </section>

      {/* ── AUTOMATYZACJE ── */}
      <section id="automatyzacje" style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-text-3)', marginBottom: 12 }}>
          Automatyzacje
        </div>
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
            <div key={a.nazwa} style={{
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: 24,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                  background: 'var(--green-950)', color: '#8EEAAD', flexShrink: 0,
                }}>
                  {a.ikona}
                </span>
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
                    padding: '2px 8px', borderRadius: 999,
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-3)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── API ── */}
      <section id="api" style={{
        background: 'var(--color-bg-2)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-text-3)', marginBottom: 12 }}>
            REST API
          </div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
            API bazy świadczeń
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 28px', maxWidth: 540 }}>
            117 zweryfikowanych świadczeń socjalnych, ulg i dotacji. Jeden endpoint REST, odpowiedź w &lt;200ms, aktualizowana baza.
          </p>

          <pre style={{
            background: 'var(--color-bg-0)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, padding: 20,
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--color-text-2)',
            overflowX: 'auto', whiteSpace: 'pre',
            lineHeight: 1.6, margin: '0 0 28px',
          }}>
            {EXAMPLE_REQUEST}
          </pre>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '117 świadczeń w 13 kategoriach',
              'Odpowiedź <200ms',
              'Brak przechowywania danych (RODO)',
              'Dokumentacja dla AI: wezmezadarmo.com/llm.md',
            ].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--color-text-2)' }}>
                <span style={{ color: '#22A06B', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
                {item}
              </li>
            ))}
          </ul>

          <a href="#kontakt" style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
            color: '#fff', background: '#22A06B',
            padding: '12px 22px', borderRadius: 10, textDecoration: 'none',
          }}>
            Napisz po klucz API
          </a>
        </div>
      </section>

      {/* ── DLA KOGO ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-text-3)', marginBottom: 12 }}>
          Dla kogo
        </div>
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
            <div key={k.tytul} style={{
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: 24,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                background: 'var(--green-950)', color: '#8EEAAD',
                marginBottom: 14,
              }}>
                {k.ikona}
              </span>
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-text-3)', marginBottom: 12 }}>
            Kontakt
          </div>
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
                      }}
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
                    }}
                  />
                </div>
                {status === 'error' && (
                  <p style={{ fontSize: 14, color: 'var(--red-400)', margin: 0 }}>{errorMsg}</p>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{
                      padding: '13px 28px',
                      background: status === 'sending' ? 'var(--color-border)' : '#22A06B',
                      color: '#fff',
                      fontWeight: 600, fontSize: 16, borderRadius: 10,
                      border: 'none', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
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
