'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';

const PROBLEMY = [
  { obszar: 'Faktury zagraniczne', opis: 'Polskie faktury trafiają do KSeF. Ale rachunki z USA i spoza UE (Stripe, OpenAI, AWS, Notion) przychodzą mailem i można je przegapić. Trzeba je ręcznie przepisywać do ewidencji.' },
  { obszar: 'Oferty', opis: 'Kopiowanie szablonu, ręczna edycja kwot, wysyłka. Każda oferta to 20-40 minut pracy.' },
  { obszar: 'Raporty', opis: 'Zbieranie danych z arkuszy na koniec miesiąca, formatowanie, wysyłka do zarządu lub księgowej.' },
  { obszar: 'Maile do klientów', opis: 'Potwierdzenia zamówień, przypomnienia o płatnościach, follow-up po spotkaniu. Pisane od nowa za każdym razem.' },
  { obszar: 'Dane z ZUS/US', opis: 'Pilnowanie terminów, generowanie druków, przepisywanie do arkusza ewidencji.' },
];

const KROKI = [
  { tytul: 'Bezpłatna rozmowa', opis: 'Opowiadasz nam, co w Twojej firmie zajmuje za dużo czasu. 30 minut. Bez prezentacji, bez handlowania.' },
  { tytul: 'Konkretna wycena', opis: 'W ciągu 2 dni roboczych dostajesz propozycję: co zautomatyzujemy, ile to kosztuje, ile czasu zaoszczędzisz miesięcznie.' },
  { tytul: 'Wdrożenie i test', opis: 'Budujemy system. Testujesz go na swoich danych. Jeśli nie działa tak jak uzgodniliśmy, nie płacisz.' },
];

const PRODUKT_FEATURES = [
  'Skanuje wskazaną skrzynkę mailową w poszukiwaniu faktur i rachunków spoza UE (PDF, e-mail od Stripe, AWS, OpenAI, Notion i innych)',
  'Wyciąga z nich: datę, kwotę, walutę, nazwę dostawcy i numer dokumentu',
  'Wpisuje dane do arkusza Google lub Excela, który wskazujesz',
  'Wysyła powiadomienie, gdy pojawi się nowy dokument do zaksięgowania',
  'Nie obsługuje polskich faktur krajowych: te trafiają do KSeF automatycznie i nie wymagają osobnego narzędzia',
  'Wdrożenie zajmuje do 1 dnia roboczego, dostajesz instrukcję obsługi',
];

const CENNIK = [
  {
    nazwa: 'Automatyzacja mailowa',
    cena: '399 PLN',
    szczegoly: 'wdrożenie w 1 dzień roboczy',
    opis: 'Gotowy system podłączany do Twojej skrzynki mailowej. Jeśli nie działa zgodnie z ustaleniami, nie płacisz.',
  },
  {
    nazwa: 'Automatyzacja na zamówienie',
    cena: 'od 599 PLN',
    szczegoly: 'po wcześniejszym ustaleniu zakresu',
    opis: 'Zakres i wycena ustalane indywidualnie. Jeśli nie działa zgodnie z ustaleniami, nie płacisz.',
  },
  {
    nazwa: 'Custom agent + utrzymanie',
    cena: 'od 1 499 PLN',
    szczegoly: '+99 zł/mc',
    opis: 'Dedykowany agent + miesięczne aktualizacje, monitoring i wsparcie.',
  },
];

const PRZYKLADY = [
  {
    tytul: 'Faktury zagraniczne',
    opis: 'Agent skanuje skrzynkę mailową, wyciąga dane z rachunków od Stripe, AWS i OpenAI, wpisuje je do arkusza i wysyła powiadomienie o każdym nowym dokumencie.',
  },
  {
    tytul: 'Automatyzacja wniosków',
    opis: 'Agent monitoruje dostępne dofinansowania, wypełnia wniosek na podstawie profilu firmy, a następnie przekazuje go do weryfikacji osobie decyzyjnej przed złożeniem w urzędzie lub instytucji państwowej. Agenci systemu WezmeZaDarmo nigdy nie składają dokumentów samodzielnie. Zawsze czekają na akceptację człowieka.',
  },
];

export default function AutomatyzacjePage() {
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
      <SiteHeader />

      <section style={{ position: 'relative', paddingTop: 48, paddingBottom: 80 }}>
        <div className="grain-bg" />
        <div className="container" style={{ position: 'relative', maxWidth: 960 }}>

          {/* Eyebrow */}
          <div className="rise" style={{ marginBottom: 20 }}>
            <span className="label-eyebrow">Automatyzacje AI dla firm i JDG</span>
          </div>

          {/* HERO */}
          <h1 className="display rise" style={{
            fontSize: 'clamp(32px, 5vw, 60px)',
            marginBottom: 24,
            animationDelay: '60ms',
          }}>
            Faktury spoza UE przychodzą mailem.<br />
            <span className="serif" style={{ color: 'var(--color-pl-red)' }}>Łatwo je przegapić.</span>
          </h1>

          <p className="rise" style={{
            fontSize: 18, lineHeight: 1.65,
            color: 'var(--color-text-2)',
            maxWidth: 620, marginBottom: 40,
            animationDelay: '120ms',
          }}>
            Polskie faktury trafiają do KSeF automatycznie. Ale rachunki z USA i spoza UE
            przychodzą mailem i łatwo je przegapić. Budujemy system, który czyta skrzynkę
            i wpisuje te dokumenty do Twojego arkusza, zanim trafią do szuflady.
          </p>

          <div className="rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 64, animationDelay: '180ms' }}>
            <a href="#kontakt" style={{
              padding: '13px 28px',
              background: 'var(--color-accent)', color: 'var(--color-bg-0)',
              fontWeight: 600, fontSize: 16, borderRadius: 10,
              textDecoration: 'none',
            }}>
              Umów bezpłatną rozmowę
            </a>
            <a href="#jak-dzialamy" style={{
              padding: '13px 28px',
              border: '1px solid var(--color-border)', color: 'var(--color-text-2)',
              fontWeight: 500, fontSize: 16, borderRadius: 10,
              textDecoration: 'none',
            }}>
              Jak to działa?
            </a>
          </div>

          {/* PROBLEMY */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '220ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-pl-red)', flexShrink: 0 }} />
              <span className="label-eyebrow">Gdzie ucieka czas w Twojej firmie?</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 40,
              alignItems: 'start',
            }}>
              {/* Left: heading + table */}
              <div>
                <h2 style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  marginBottom: 32,
                  color: 'var(--color-text-1)',
                }}>
                  To jest norma.<br />
                  <span className="serif" style={{ color: 'var(--color-pl-red)' }}>Nie musi tak być.</span>
                </h2>

                <div style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}>
                  {PROBLEMY.map((p, i) => (
                    <div key={p.obszar} style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr',
                      gap: 24,
                      padding: '18px 24px',
                      borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                      background: 'var(--color-surface)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-pl-red)' }}>{p.obszar}</div>
                      <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{p.opis}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: stat */}
              <div style={{
                padding: '36px 28px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                marginTop: 80,
              }}>
                <div className="mono" style={{
                  fontSize: 56,
                  fontWeight: 500,
                  letterSpacing: '-0.04em',
                  color: 'var(--color-pl-red)',
                  lineHeight: 1,
                  marginBottom: 12,
                }}>
                  ~6h
                </div>
                <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.65 }}>
                  Tyle tygodniowo traci przeciętna mała firma na ręczne przepisywanie dokumentów, faktur i danych do arkuszy.
                </div>
              </div>
            </div>
          </div>

          {/* PRZYKŁADY */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '240ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Przykłady automatyzacji</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PRZYKLADY.map((p) => (
                <div key={p.tytul} style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '22px 28px',
                  background: 'var(--color-surface)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-green)', marginBottom: 10 }}>{p.tytul}</div>
                  <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{p.opis}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUKT */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '260ms' }}>
            <div style={{
              borderRadius: 20,
              padding: '36px 40px',
              background: '#0F1F14',
              color: '#E8F0E8',
            }}>
              <span className="label-eyebrow" style={{ color: '#6DC08A', marginBottom: 16, display: 'block' }}>Flagship: gotowy produkt</span>
              <h2 style={{ fontSize: 36, letterSpacing: '-0.025em', marginBottom: 12, color: '#E8F0E8' }}>
                Automat Fakturowy
              </h2>
              <p style={{ fontSize: 16, color: '#C2D4C2', lineHeight: 1.7, maxWidth: 560, marginBottom: 32 }}>
                System, który skanuje wskazaną skrzynkę mailową i wyciąga dane z faktur
                od zagranicznych dostawców (spoza UE). Wpisuje je do arkusza, który wskazujesz.
                Polskich faktur krajowych nie obsługuje, bo te trafiają do KSeF automatycznie.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {PRODUKT_FEATURES.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 15, color: '#C2D4C2', lineHeight: 1.6 }}>
                    <span style={{ color: '#6DC08A', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid rgba(109, 192, 138, 0.2)',
                paddingTop: 28,
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24,
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', color: '#6DC08A', lineHeight: 1 }}>
                    399 PLN
                  </div>
                  <div style={{ fontSize: 13, color: '#8BA88B', marginTop: 6 }}>
                    jednorazowo &bull; bez abonamentu &bull; wdrożenie 1 dzień roboczy
                  </div>
                </div>
                <a href="#kontakt" style={{
                  padding: '13px 28px',
                  background: '#2E7D4F', color: '#ffffff',
                  fontWeight: 600, fontSize: 16, borderRadius: 10,
                  textDecoration: 'none', flexShrink: 0,
                }}>
                  Zamów wdrożenie
                </a>
              </div>
            </div>
          </div>

          {/* CENNIK */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '280ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-pl-red)', flexShrink: 0 }} />
              <span className="label-eyebrow">Cennik</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              letterSpacing: '-0.025em',
              marginBottom: 8,
              color: 'var(--color-text-1)',
            }}>
              Płacisz raz. <strong>Bez abonamentu.</strong>
            </h2>
            <p style={{
              fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.65,
              maxWidth: 600, marginBottom: 32,
            }}>
              Gwarancja: jeśli wdrożony agent nie działa zgodnie z tym, co ustaliliśmy, nie płacisz.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {CENNIK.map((c, i) => {
                const isDark = i === 0;
                const isGreen = i === 2;
                return (
                  <div key={c.nazwa} style={{
                    border: isDark ? 'none' : '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: '28px 28px',
                    background: isDark ? '#0F1F14' : 'var(--color-surface)',
                    color: isDark ? '#E8F0E8' : undefined,
                  }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: isDark ? '#8BA88B' : 'var(--color-text-2)',
                      marginBottom: 16, lineHeight: 1.4,
                    }}>{c.nazwa}</div>
                    <div className="mono" style={{
                      fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em',
                      color: isDark ? '#6DC08A' : isGreen ? 'var(--color-green)' : 'var(--color-accent)',
                      lineHeight: 1, marginBottom: 6,
                    }}>
                      {c.cena}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: isDark ? '#6B8D6B' : 'var(--color-text-3)',
                      marginBottom: 16,
                    }}>{c.szczegoly}</div>
                    <div style={{
                      fontSize: 14, lineHeight: 1.65,
                      color: isDark ? '#C2D4C2' : 'var(--color-text-2)',
                      marginBottom: 20,
                    }}>{c.opis}</div>
                    <a href="#kontakt" style={{
                      display: 'inline-block',
                      padding: '10px 22px',
                      background: (isDark || isGreen) ? '#2E7D4F' : 'var(--color-accent)',
                      color: (isDark || isGreen) ? '#ffffff' : 'var(--color-bg-0)',
                      fontWeight: 600, fontSize: 14, borderRadius: 10,
                      textDecoration: 'none',
                    }}>
                      Zamów
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* JAK DZIAŁAMY */}
          <div id="jak-dzialamy" className="rise" style={{ marginBottom: 64, animationDelay: '300ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
              <span className="label-eyebrow">Jak wygląda współpraca</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              letterSpacing: '-0.025em',
              marginBottom: 32,
              color: 'var(--color-text-1)',
            }}>
              3 kroki, <span className="serif">1 tydzień</span>, gotowe.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {KROKI.map((k, i) => (
                <div key={i} style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: 28,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 20,
                  }}>
                    <span className="mono" style={{
                      fontSize: 24, fontWeight: 700, color: 'var(--color-pl-red)',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '2px solid var(--color-pl-red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: 'var(--color-pl-red)',
                    }}>
                      {i + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 10 }}>{k.tytul}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{k.opis}</div>
                </div>
              ))}
            </div>
          </div>

          {/* JAK ROZLICZAMY */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '340ms' }}>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '28px 32px',
            }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 12 }}>
                Jak wygląda wdrożenie
              </h3>
              <p style={{ fontSize: 16, color: 'var(--color-text-2)', lineHeight: 1.75 }}>
                Przed startem omawiamy dokładnie, jakie dokumenty mają być zbierane i gdzie mają
                trafiać. Testujesz system na realnych danych przed finalnym odbiorem.
                Faktura wystawiana jest po potwierdzeniu, że wszystko działa zgodnie z ustaleniami.
              </p>
            </div>
          </div>

          {/* Cross-link: dotacje */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '360ms' }}>
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '28px 32px',
              background: 'var(--color-surface)',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
                Kompleksowy system dla firmy
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, letterSpacing: '-0.015em' }}>
                Połącz automatyzacje z monitorowaniem dofinansowań
              </h3>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7, maxWidth: 560, marginBottom: 20 }}>
                Panel WezmeZaDarmo łączy automatyzacje biurowe z agentem śledzącym KFS, PUP, PFRON i KPO.
                Agent przygotowuje wnioski do Twojej akceptacji. Jeden system, dwa moduły.
              </p>
              <a href="/dotacje" style={{
                display: 'inline-block',
                padding: '10px 22px',
                background: 'var(--color-accent)', color: 'var(--color-bg-0)',
                fontWeight: 600, fontSize: 14, borderRadius: 10,
                textDecoration: 'none',
              }}>
                Sprawdź monitoring dotacji
              </a>
            </div>
          </div>

          {/* KONTAKT */}
          <div id="kontakt" className="rise" style={{ marginBottom: 80, animationDelay: '380ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Porozmawiajmy</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <p style={{ fontSize: 17, color: 'var(--color-text-2)', lineHeight: 1.75, maxWidth: 540, marginBottom: 32 }}>
              Opisz krótko, co w Twojej firmie zajmuje za dużo czasu.
              Odpiszemy w ciągu jednego dnia roboczego. Pierwsza rozmowa jest bezpłatna.
            </p>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '28px 32px',
            }}>
              <span className="label-eyebrow" style={{ marginBottom: 20, display: 'block' }}>Wyślij zapytanie</span>

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
                    { key: 'email', label: 'Adres e-mail (do odpowiedzi)', placeholder: 'jan@kowalski.pl', type: 'email', autocomplete: 'email', required: true },
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
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 8 }}>Co w Twojej firmie zajmuje za dużo czasu?</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Np. co miesiąc ręcznie wystawiam 80 faktur, każda zajmuje mi 15 minut..."
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
                    <p style={{ fontSize: 14, color: '#e05c5c', margin: 0 }}>{errorMsg}</p>
                  )}
                  <div>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      style={{
                        padding: '13px 28px',
                        background: status === 'sending' ? 'var(--color-border)' : 'var(--color-accent)',
                        color: 'var(--color-bg-0)',
                        fontWeight: 600, fontSize: 16, borderRadius: 10,
                        border: 'none', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      {status === 'sending' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                    </button>
                    <p className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 10 }}>
                      Wiadomość trafia bezpośrednio do autora. Nie sprzedajemy danych. Odpiszemy tylko w sprawie zapytania.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
