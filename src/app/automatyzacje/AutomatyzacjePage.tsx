'use client';

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
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteHeader />

      <section style={{ position: 'relative', paddingTop: 48, paddingBottom: 80 }}>
        <div className="grain-bg" />
        <div className="container" style={{ position: 'relative', maxWidth: 860 }}>

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
            <span style={{ color: 'var(--color-accent)' }}>Łatwo je przegapić.</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Gdzie ucieka czas w Twojej firmie?</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
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
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-accent)' }}>{p.obszar}</div>
                  <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{p.opis}</div>
                </div>
              ))}
            </div>
            <p className="mono" style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-3)' }}>
              To jest norma. Większość firm w Polsce tak działa. Nie musi tak być.
            </p>
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
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-accent)', marginBottom: 10 }}>{p.tytul}</div>
                  <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{p.opis}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUKT */}
          <div className="rise" style={{ marginBottom: 64, animationDelay: '260ms' }}>
            <div style={{
              border: '1px solid var(--color-accent)',
              borderRadius: 20,
              padding: '36px 40px',
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-2)',
            }}>
              <span className="label-eyebrow" style={{ color: 'var(--color-accent)', marginBottom: 16, display: 'block' }}>Flagship: gotowy produkt</span>
              <h2 style={{ fontSize: 36, letterSpacing: '-0.025em', marginBottom: 12, color: 'var(--color-text-1)' }}>
                Automat Fakturowy
              </h2>
              <p style={{ fontSize: 16, color: 'var(--color-text-2)', lineHeight: 1.7, maxWidth: 560, marginBottom: 32 }}>
                System, który skanuje wskazaną skrzynkę mailową i wyciąga dane z faktur
                od zagranicznych dostawców (spoza UE). Wpisuje je do arkusza, który wskazujesz.
                Polskich faktur krajowych nie obsługuje, bo te trafiają do KSeF automatycznie.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {PRODUKT_FEATURES.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 28,
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24,
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--color-text-1)', lineHeight: 1 }}>
                    399 PLN
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 6 }}>
                    jednorazowo &bull; bez abonamentu &bull; wdrożenie 1 dzień roboczy
                  </div>
                </div>
                <a href="#kontakt" style={{
                  padding: '13px 28px',
                  background: 'var(--color-accent)', color: 'var(--color-bg-0)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Cennik</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {CENNIK.map((c) => (
                <div key={c.nazwa} style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '28px 28px',
                  background: 'var(--color-surface)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 16, lineHeight: 1.4 }}>{c.nazwa}</div>
                  <div className="mono" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--color-accent)', lineHeight: 1, marginBottom: 6 }}>
                    {c.cena}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 16 }}>{c.szczegoly}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.65 }}>{c.opis}</div>
                </div>
              ))}
            </div>
          </div>

          {/* JAK DZIAŁAMY */}
          <div id="jak-dzialamy" className="rise" style={{ marginBottom: 64, animationDelay: '300ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <span className="label-eyebrow">Jak wygląda współpraca</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {KROKI.map((k, i) => (
                <div key={i} style={{ display: 'flex', gap: 20 }}>
                  <div style={{
                    flexShrink: 0,
                    width: 44, height: 44, borderRadius: '50%',
                    border: '2px solid var(--color-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: 16 }}>{i + 1}</span>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8 }}>{k.tytul}</div>
                    <div style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{k.opis}</div>
                  </div>
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

          {/* KONTAKT */}
          <div id="kontakt" className="rise" style={{ marginBottom: 80, animationDelay: '380ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="label-eyebrow">Porozmawiajmy</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <p style={{ fontSize: 17, color: 'var(--color-text-2)', lineHeight: 1.75, maxWidth: 540, marginBottom: 32 }}>
              Opisz krótko, co w Twojej firmie zajmuje za dużo czasu.
              Odpiszę w ciągu jednego dnia roboczego. Pierwsza rozmowa jest bezpłatna.
            </p>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '28px 32px', marginBottom: 16,
            }}>
              <span className="label-eyebrow" style={{ marginBottom: 16, display: 'block' }}>Kontakt bezpośredni</span>
              <a
                href="mailto:sobkowicz.kamil@gmail.com?subject=Automatyzacja%20-%20zapytanie"
                style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 8 }}
              >
                sobkowicz.kamil@gmail.com
              </a>
              <p style={{ fontSize: 14, color: 'var(--color-text-3)' }}>
                Napisz maila. To najprostszy sposób. Podaj firmę, branżę i opis problemu.
              </p>
            </div>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '28px 32px',
            }}>
              <span className="label-eyebrow" style={{ marginBottom: 20, display: 'block' }}>Lub wyślij wiadomość tutaj</span>
              <form action="mailto:sobkowicz.kamil@gmail.com" method="post" encType="text/plain" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'imie', label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', type: 'text' },
                  { name: 'firma', label: 'Nazwa firmy', placeholder: 'Kowalski Sp. z o.o.', type: 'text' },
                  { name: 'email', label: 'Adres e-mail (do odpowiedzi)', placeholder: 'jan@kowalski.pl', type: 'email' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 8 }}>{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
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
                    name="wiadomosc"
                    rows={5}
                    placeholder="Np. co miesiąc ręcznie wystawiam 80 faktur, każda zajmuje mi 15 minut..."
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
                <div>
                  <button type="submit" style={{
                    padding: '13px 28px',
                    background: 'var(--color-accent)', color: 'var(--color-bg-0)',
                    fontWeight: 600, fontSize: 16, borderRadius: 10,
                    border: 'none', cursor: 'pointer',
                  }}>
                    Wyślij wiadomość
                  </button>
                  <p className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 10 }}>
                    Nie sprzedajemy danych. Odpiszemy tylko w sprawie zapytania.
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
