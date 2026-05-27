import type { Metadata } from 'next';
import { DotacjeContactForm } from '@/components/DotacjeContactForm';

export const metadata: Metadata = {
  title: 'AI dla Twojej firmy | Automatyzacja i monitoring dotacji | wezmezadarmo',
  description: 'Agent AI monitorujący dotacje, automatyzujący procesy biurowe i przygotowujący wnioski. Dla IT, influencerów, content creatorów, firm medycznych i każdej branży.',
};

const PROGRAMS = [
  {
    cat: 'KFS',
    name: 'Krajowy Fundusz Szkoleniowy',
    max: 'do 300% przeciętnego wynagrodzenia',
    desc: 'Dofinansowanie kształcenia ustawicznego pracowników i pracodawcy. Nabory przez PUP, kalkulowanie wg liczby zatrudnionych.',
  },
  {
    cat: 'PUP',
    name: 'Refundacja kosztów zatrudnienia',
    max: 'do 6x średnia krajowa',
    desc: 'Refundacja wynagrodzenia i składek ZUS przy zatrudnieniu osoby bezrobotnej. Obowiązek zachowania zatrudnienia przez 12-18 miesięcy.',
  },
  {
    cat: 'PFRON',
    name: 'Dofinansowanie zatrudnienia ON',
    max: '2400 PLN / miesiąc / osobę',
    desc: 'Miesięczne dofinansowanie do wynagrodzeń pracowników z orzeczeniem o niepełnosprawności. Wnioski przez SODiR.',
  },
  {
    cat: 'KPO',
    name: 'Krajowy Plan Odbudowy',
    max: 'do 2 mln PLN',
    desc: 'Inwestycje w cyfryzację, zieloną transformację i odporność przedsiębiorstw. Nabory prowadzone przez PARP i BGK.',
  },
  {
    cat: 'Samorządy',
    name: 'Programy samorządowe',
    max: 'różne, od 5 tys. PLN',
    desc: 'Dotacje z urzędów marszałkowskich, gmin i powiatów. Różne kryteria, częste nabory lokalne. Monitoring 16 województw.',
  },
  {
    cat: 'PARP',
    name: 'Polska Agencja Rozwoju Przedsiębiorczości',
    max: 'do 10 mln PLN',
    desc: 'Programy B+R, innowacje, eksport, digitalizacja. Środki z funduszy europejskich FEP 2021-2027.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Podaj NIP',
    desc: 'Agent pobiera dane z CEIDG i Białej Listy VAT: nazwa, PKD, województwo, status VAT. Nie wpisujesz ręcznie.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    num: '02',
    title: 'Skonfiguruj profil',
    desc: 'Zaznacz co Cię interesuje: szkolenia, zatrudnienie, innowacje, zielona transformacja, eksport.',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  {
    num: '03',
    title: 'Rozmawiaj z agentem',
    desc: 'Agent pokazuje co pasuje do Twojego profilu i wyjaśnia dlaczego inne programy nie spełniają kryteriów. Pyta o kwoty, terminy, procedury.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    num: '04',
    title: 'Dostaj powiadomienia',
    desc: 'Email gdy otworzy się nowy nabór pasujący do profilu firmy. Jedno miejsce zamiast 40 stron instytucji.',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
];

const INDUSTRIES = [
  { icon: '💻', label: 'IT i software house', desc: 'Dofinansowania B+R, cyfryzacja, fundusze EU na innowacje i eksport.' },
  { icon: '📱', label: 'Influencerzy i content creatorzy', desc: 'Dofinansowanie szkoleń, wsparcie dla JDG, ulgi i programy dla kreatywnych.' },
  { icon: '🏥', label: 'Zarządzanie odpadami medycznymi', desc: 'Programy zielonej transformacji, ekologia, KPO dla firm z branży medycznej.' },
  { icon: '🏭', label: 'Produkcja i przemysł', desc: 'KFS dla szkoleń, PFRON, dotacje na modernizację i zieloną transformację.' },
  { icon: '🛒', label: 'E-commerce i retail', desc: 'Cyfryzacja, automatyzacja logistyki, programy wsparcia dla MŚP.' },
  { icon: '🎓', label: 'Edukacja i szkolenia', desc: 'KFS, projekty unijne, dofinansowanie platform e-learningowych.' },
];

export default function DotacjePage() {
  return (
    <main style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: 'clamp(40px, 6vw, 80px) 0 clamp(32px, 4vw, 56px)',
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(800px 500px at 80% 20%, rgba(34,160,107,.2), transparent 60%), radial-gradient(600px 400px at 20% 80%, rgba(78,196,138,.12), transparent 60%), var(--green-950)`,
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent 0%, #f0f6f1 100%)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(142,234,173,0.7)', marginBottom: 20 }}>
            AI DLA TWOJEJ FIRMY
          </div>
          <h1 style={{ maxWidth: 720, color: '#fff', marginBottom: 20 }}>
            Dotacje, monitoring i automatyzacja.<br />
            <span style={{ color: 'var(--green-300)', fontSize: '0.82em', fontWeight: 400 }}>Agent AI, który zna Twoją firmę.</span>
          </h1>
          <p style={{ maxWidth: 540, fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: 32 }}>
            Monitoruje KFS, PUP, PFRON, KPO i programy samorządowe. Śledzi RSS instytucji rządowych.
            Powiadamia gdy otworzy się nabór pasujący do profilu Twojej firmy.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href="#kontakt" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10,
              background: 'var(--green-500)', color: '#fff',
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              transition: 'opacity 200ms',
            }}>
              Zapytaj o wdrożenie
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a href="#jak-dziala" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)',
              fontSize: 15, textDecoration: 'none',
            }}>
              Jak to działa
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginTop: 32,
          }}>
            {[
              { num: '57+', label: 'programów w bazie' },
              { num: '16', label: 'województw' },
              { num: 'co tydz.', label: 'aktualizacje naborów' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '24px 28px',
                borderRight: i < 2 ? '1px solid var(--color-border)' : undefined,
              }}>
                <div className="mono" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 500, color: 'var(--color-green)', lineHeight: 1, marginBottom: 6 }}>
                  {stat.num}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section id="jak-dziala" style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Jak to działa</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 'clamp(24px, 4vw, 40px)', color: 'var(--color-text-1)' }}>
            Cztery kroki do pierwszego powiadomienia
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 0 }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{
                borderRight: i < STEPS.length - 1 ? '1px solid var(--color-border)' : 'none',
                padding: '0 clamp(12px, 2vw, 28px) 32px',
              }}>
                <div style={{ height: 3, background: i === 0 ? 'var(--color-green)' : 'var(--color-border)', borderRadius: 2, marginBottom: 24 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span className="mono" style={{ fontSize: 13, color: 'var(--color-text-3)', fontWeight: 500 }}>{step.num}</span>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-950)', color: 'var(--green-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={step.icon} />
                    </svg>
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10, color: 'var(--color-text-1)' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programy */}
      <section id="programy" style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Programy</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: 8, marginBottom: 0, color: 'var(--color-text-1)' }}>Co monitoruje agent</h2>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>6 źródeł</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 12 }}>
            {PROGRAMS.map((prog) => (
              <div key={prog.cat} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: '22px',
                display: 'flex', flexDirection: 'column', gap: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 200ms',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--green-950)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>
                    {prog.cat.charAt(0)}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>{prog.name}</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--color-green)', marginTop: 2 }}>{prog.max}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0, flex: 1 }}>{prog.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mono" style={{
                    fontSize: 10, padding: '3px 10px',
                    border: '1px solid var(--color-green-border)',
                    background: 'var(--color-green-bg)',
                    color: 'var(--color-green)',
                    borderRadius: 999, letterSpacing: '0.06em',
                  }}>{prog.cat}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green)' }} /> monitorowane
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aktualności i monitoring */}
      <section style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-green)', fontWeight: 600 }}>Aktualności i monitoring</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)' }}>RSS co 30 min</span>
            </div>
            <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '-0.025em', marginBottom: 16, color: 'var(--color-text-1)' }}>
              Agent, który czyta zamiast Ciebie
            </h3>
            <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.65, marginBottom: 24, maxWidth: 680 }}>
              Twój agent śledzi rządowe i branżowe RSS, wychwytuje istotne zmiany i przygotowuje
              wstępne wnioski do Twojej weryfikacji. Żaden dokument nie jest składany bez Twojej akceptacji.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['ZUS', 'GUS', 'NBP', 'UOKiK', 'Fundusze EU', 'e-Zdrowie', 'Sejm', 'ARiMR'].map(src => (
                <span key={src} className="mono" style={{
                  fontSize: 11, padding: '5px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 999, color: 'var(--color-text-2)',
                  background: 'var(--color-surface-2)',
                }}>{src}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dla jakich firm */}
      <section style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c44', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Dla jakich firm</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 8, color: 'var(--color-text-1)' }}>
            Współpracujemy z firmami z wielu branż
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, maxWidth: 620, marginBottom: 32 }}>
            Od IT, przez influencerów i content creatorów, po zarządzanie odpadami medycznymi.
            Zakres automatyzacji dostosowujemy do konkretnych potrzeb.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 12 }}>
            {INDUSTRIES.map((ind) => (
              <div key={ind.label} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--green-950)', color: 'var(--green-300)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{ind.icon}</span>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>{ind.label}</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 'clamp(48px, 6vw, 96px)' }}>
        <div className="wrap">
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: 'clamp(24px, 4vw, 48px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'start' }}>

              <div>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-green)', fontWeight: 600 }}>Kontakt</span>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: 12, marginBottom: 16, color: 'var(--color-text-1)' }}>
                  Chcesz taki system?
                </h2>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.65, marginBottom: 28 }}>
                  Cena do ustalenia po poznaniu konkretnych potrzeb.
                  Napisz nam o swojej firmie i branży, odezwiemy się z propozycją.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Bezpłatna konsultacja wstępna',
                    'Wdrożenie dostosowane do branży',
                    'Monitoring bez limitów zapytań',
                    'Żaden dokument bez Twojej akceptacji',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-2)' }}>
                      <span style={{ color: 'var(--color-green)', display: 'inline-flex', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <DotacjeContactForm />

            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 16, lineHeight: 1.6 }}>
            Agent AI ma charakter wyłącznie informacyjny. Nie prowadzimy doradztwa prawnego ani finansowego.
            Decyzja o przyznaniu dofinansowania należy do instytucji zarządzającej programem.
          </p>
        </div>
      </section>

    </main>
  );
}
