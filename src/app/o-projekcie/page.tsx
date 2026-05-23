import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O projekcie | wezmezadarmo',
  description: 'Dowiedz się po co powstał wezmezadarmo, komu służy, jak działa i kto za nim stoi.',
};

const MODULES = [
  {
    href: '/',
    label: 'Kalkulator świadczeń',
    badge: 'Bezpłatny',
    badgeTone: 'green',
    icon: 'S',
    desc: 'Wypełniasz formularz (wiek, płeć, 11 pytań) i dostajesz spersonalizowaną listę 117 świadczeń z ZUS, NFZ, PFRON, KRUS, MOPS. Żadnych danych osobowych na serwerze.',
  },
  {
    href: '/wnioski',
    label: 'Kreator wniosków ZUS',
    badge: 'Bezpłatny',
    badgeTone: 'green',
    icon: 'W',
    desc: 'AI prowadzi przez wypełnianie formularzy ZUS: Z-15a, Z-15b, Z-3, ERPO, ZAS-53, PEL. Na końcu generuje gotowy PDF do druku lub wysyłki pocztą.',
  },
  {
    href: '/aktualnosci',
    label: 'Aktualności z urzędów',
    badge: 'Bezpłatny',
    badgeTone: 'green',
    icon: 'A',
    desc: 'Agregator RSS z ZUS, GUS, NBP, NFZ, UOKiK, Sejmu i innych instytucji. Plus widget jakości powietrza GIOŚ i kursów walut NBP na żywo. Odświeżany co 30 minut.',
  },
  {
    href: '/nfz',
    label: 'Wyszukiwarka NFZ',
    badge: 'Bezpłatny',
    badgeTone: 'green',
    icon: 'N',
    desc: 'Sprawdź czas oczekiwania do specjalisty NFZ, znajdź świadczeniodawcę po nazwie i województwie, sprawdź refundację leków. Dane na żywo z api.nfz.gov.pl.',
  },
  {
    href: '/centrum-obywatela',
    label: 'Centrum obywatela',
    badge: 'Bezpłatny',
    badgeTone: 'green',
    icon: 'C',
    desc: 'Hub 11 publicznych narzędzi: NFZ (kolejki, lekarze), NBP (kursy walut), GIOŚ (powietrze), Biała Lista VAT, IMGW/RCB (ostrzeżenia), ELI/Sejm (zmiany w prawie), BDL GUS (dane gminy), ARiMR (mapy działek), PKP (tabela ulg). Wszystko z oficjalnych polskich API, bez logowania.',
  },
  {
    href: '/agent',
    label: 'Asystent AI',
    badge: 'Wymaga konta',
    badgeTone: 'default',
    icon: 'AI',
    desc: 'Osobisty agent AI dla JDG i osób prywatnych. Dopasowuje świadczenia do profilu, monitoruje zmiany w przepisach i wysyła dzienny e-mail digest.',
  },
  {
    href: '/dotacje',
    label: 'AI dla Twojej firmy',
    badge: 'Wycena indywidualna',
    badgeTone: 'default',
    icon: 'F',
    desc: 'Automatyzacje procesów firmowych i monitoring dofinansowań dla firm z wielu branż: IT, content creatorzy, przemysł medyczny i inne.',
  },
];

const SOURCES = [
  { id: 'gov', name: 'gov.pl (MRiPS)', desc: 'świadczenia rodzinne: 800+, becikowe, kosiniakowe, zasiłek rodzinny' },
  { id: 'zus', name: 'zus.pl', desc: 'zasiłki chorobowe, macierzyński, ojcowski, trzynasta i czternasta emerytura' },
  { id: 'pit', name: 'podatki.gov.pl', desc: 'ulgi: na dziecko, rehabilitacyjna, termomodernizacyjna, na internet' },
  { id: 'pfron', name: 'pfron.org.pl', desc: 'dofinansowania dla osób z niepełnosprawnością, turnusy rehabilitacyjne' },
  { id: 'nfz', name: 'nfz.gov.pl', desc: 'refundacja leków, bon na okulary, leczenie uzdrowiskowe, rehabilitacja' },
  { id: 'praca', name: 'praca.gov.pl', desc: 'zasiłek dla bezrobotnych, szkolenia, staże, bony, dotacje z PUP' },
  { id: 'nfos', name: 'nfosigw.gov.pl', desc: 'Czyste Powietrze, Mój Prąd, bon energetyczny, OZE' },
  { id: 'krus', name: 'krus.gov.pl', desc: 'świadczenia dla rolników, emerytura rolnicza, zasiłki KRUS' },
  { id: 'ceidg', name: 'biznes.gov.pl / CEIDG', desc: 'ulga na start, mały ZUS plus, preferencyjny ZUS dla nowych firm' },
  { id: 'rcb', name: 'rcb.gov.pl', desc: 'ostrzeżenia meteo i kryzysowe (powódź, burze, mróz, smog)' },
  { id: 'eli', name: 'api.sejm.gov.pl/eli', desc: 'zmiany w przepisach: Dziennik Ustaw, projekty ustaw' },
  { id: 'bdl', name: 'bdl.stat.gov.pl', desc: 'GUS - dane demograficzne, bezrobocie, wynagrodzenia per gmina' },
  { id: 'arimr', name: 'geoportal.arimr.gov.pl', desc: 'mapy działek rolnych, kontrole agrotechniczne, dopłaty' },
  { id: 'pkp', name: 'portalpasazera.pl', desc: 'rozkład jazdy PKP + tabela ulg ustawowych dla pasażerów' },
];

const AUDIENCE = [
  { group: 'Rodziny z dziećmi', examples: '800+, becikowe, ulga na dziecko, kosiniakowe, zasiłek rodzinny' },
  { group: 'Seniorzy i emeryci', examples: 'trzynastka, czternastka, dodatek osłonowy, ulgi podatkowe, refundacja leków' },
  { group: 'Osoby z niepełnosprawnością', examples: 'świadczenie wspierające, dofinansowanie rehabilitacji, ulga rehabilitacyjna' },
  { group: 'Przedsiębiorcy i JDG', examples: 'ulga na start, mały ZUS plus, dotacje z PUP, preferencyjny ZUS' },
  { group: 'Osoby bezrobotne', examples: 'zasiłek dla bezrobotnych, szkolenia, staże, bon na zasiedlenie' },
  { group: 'Studenci', examples: 'stypendium socjalne, naukowe, kredyt studencki, ulgi na transport' },
  { group: 'Rolnicy', examples: 'dopłaty KRUS, emerytura rolnicza, dotacje na modernizację' },
];

const TECH = [
  { name: 'Next.js 16', note: 'App Router, TypeScript' },
  { name: 'Google Gemini', note: 'via OpenRouter — asystent czatowy' },
  { name: 'Silnik dopasowań', note: 'autorski algorytm TypeScript' },
  { name: 'Supabase', note: 'baza danych, serwery w UE' },
  { name: 'Vercel', note: 'hosting serverless, edge deployment' },
  { name: 'Baza 117 świadczeń', note: 'ręcznie zweryfikowana, każda z datą i źródłem' },
];

const SECURITY = [
  {
    module: 'Kalkulator świadczeń (/)',
    items: [
      { ok: true, label: 'PESEL dekodowany lokalnie', note: 'wiek i płeć odczytywane w przeglądarce, numer nie trafia na serwer' },
      { ok: true, label: 'Brak bazy danych', note: 'kalkulator nie zapisuje danych osobowych ani historii' },
      { ok: true, label: 'NIP jednorazowo', note: 'tylko do sprawdzenia statusu firmy w CEIDG, nie przechowywany' },
    ],
  },
  {
    module: 'Kreator wniosków ZUS (/wnioski)',
    items: [
      { ok: false, label: 'PESEL trafia na serwer', note: 'do wygenerowania PDF. Przetwarzany jednorazowo w pamięci, nie zapisywany' },
    ],
  },
  {
    module: 'Asystent AI (/agent/panel)',
    items: [
      { ok: false, label: 'Wymaga rejestracji', note: 'dane profilu (wiek, dochód, zatrudnienie) przechowywane w Supabase (serwery w UE). PESEL nie jest zbierany' },
    ],
  },
];

export default function OProjekciePage() {
  return (
    <main style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: 'clamp(32px, 5vw, 64px) 0 clamp(24px, 3vw, 40px)',
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(700px 400px at 70% 20%, rgba(34,160,107,.22), transparent 60%), var(--green-950)`,
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, transparent 0%, #f0f6f1 100%)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(142,234,173,0.7)', marginBottom: 14 }}>
            O PROJEKCIE
          </div>
          <h1 style={{ maxWidth: 640, color: '#fff', marginBottom: 14 }}>
            wezmezadarmo.com
          </h1>
          <p style={{ maxWidth: 520, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Bezpłatne narzędzie do sprawdzania świadczeń, wniosków ZUS i aktualności rządowych.
            Projekt prywatny, nie rządowy.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginTop: 28,
          }}>
            {[
              { num: '117', label: 'świadczeń w bazie' },
              { num: '15', label: 'kategorii' },
              { num: '2 min', label: 'średni czas analizy' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < 2 ? '1px solid var(--color-border)' : undefined }}>
                <div className="mono" style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 500, color: 'var(--color-green)', lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Po co to powstało */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Geneza</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 20, color: 'var(--color-text-1)' }}>Po co to powstało</h2>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 14,
            fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-2)',
          }}>
            <p style={{ margin: 0 }}>
              Polska ma jeden z najszerszych systemów świadczeń społecznych w Europie.
              Problem polega na tym, że większość ludzi nie wie, co im przysługuje.
              Informacje są rozproszone po dziesiątkach stron rządowych, urzędowych portali i aktów prawnych.
            </p>
            <p style={{ margin: 0 }}>
              wezmezadarmo powstało, żeby zebrać w jednym miejscu{' '}
              <strong style={{ color: 'var(--color-text-1)' }}>117 świadczeń z 15 kategorii</strong>{' '}
              i dać każdemu możliwość sprawdzenia w 2 minuty, na co się kwalifikuje.
              Bez rejestracji, bez opłat, bez zbędnych kroków.
            </p>
            <p style={{ margin: 0 }}>
              Z czasem serwis rozrósł się o narzędzia dla firm i JDG: kreator wniosków ZUS,
              asystenta AI i automatyzacje procesów firmowych.
              Kalkulator świadczeń i wnioski pozostają darmowe.
            </p>
          </div>
        </div>
      </section>

      {/* Co zawiera */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Moduły</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, marginBottom: 0, color: 'var(--color-text-1)' }}>Co zawiera serwis</h2>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>5 narzędzi</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODULES.map((mod) => (
              <Link key={mod.href} href={mod.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '18px 22px',
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 200ms, border-color 200ms',
                  cursor: 'pointer',
                }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--green-950)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, flexShrink: 0,
                  }}>{mod.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>{mod.label}</span>
                      <span className="mono" style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        border: `1px solid ${mod.badgeTone === 'green' ? 'var(--color-green-border)' : 'var(--color-border)'}`,
                        background: mod.badgeTone === 'green' ? 'var(--color-green-bg)' : 'var(--color-surface-2)',
                        color: mod.badgeTone === 'green' ? 'var(--color-green)' : 'var(--color-text-3)',
                        letterSpacing: '0.04em',
                      }}>{mod.badge}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{mod.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-3)', flexShrink: 0, marginTop: 2 }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Komu służy */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c44', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Odbiorcy</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16, color: 'var(--color-text-1)' }}>Komu może służyć</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 10 }}>
            {AUDIENCE.map((a) => (
              <div key={a.group} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: 'var(--color-green)', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.01em' }}>{a.group}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{a.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bezpieczeństwo */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Prywatność</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16, color: 'var(--color-text-1)' }}>Bezpieczeństwo danych</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SECURITY.map((sec) => (
              <div key={sec.module} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-2)', fontWeight: 500 }}>{sec.module}</span>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sec.items.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        background: item.ok ? 'var(--color-green-bg)' : 'rgba(230,180,60,0.12)',
                        border: `1px solid ${item.ok ? 'var(--color-green-border)' : 'rgba(230,180,60,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        color: item.ok ? 'var(--color-green)' : '#b8860b',
                      }}>{item.ok ? '✓' : '!'}</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}> — {item.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 12, lineHeight: 1.6 }}>
            Całe połączenie jest szyfrowane (HTTPS).{' '}
            <Link href="/polityka-prywatnosci" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Polityka prywatności</Link>.
          </p>
        </div>
      </section>

      {/* Technologia */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-text-3)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Stack</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16, color: 'var(--color-text-1)' }}>Technologia</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
            {TECH.map((t) => (
              <div key={t.name} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 4, letterSpacing: '-0.01em' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Źródła */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Dane</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, marginBottom: 0, color: 'var(--color-text-1)' }}>Źródła danych</h2>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>14 instytucji</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 10 }}>
            {SOURCES.map((src) => (
              <div key={src.id} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <span style={{ color: 'var(--color-green)', flexShrink: 0, marginTop: 2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>{src.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>{src.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 12 }}>
            Dane są weryfikowane ręcznie. Jeśli zauważysz nieaktualną informację, zgłoś przez LinkedIn.
          </p>
        </div>
      </section>

      {/* Autor + kontakt */}
      <section style={{ paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'start' }}>

            {/* Kto za tym stoi */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Autor</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 12, color: 'var(--color-text-1)' }}>Kto za tym stoi</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.65, marginBottom: 16 }}>
                Projekt stworzył <strong style={{ color: 'var(--color-text-1)' }}>Kamil Sobkowicz</strong>,
                programista i przedsiębiorca z Polski. Kalkulator świadczeń i kreator wniosków
                to projekt społeczny. Narzędzia dla firm rozwijane są przez zespół theVelopers.
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-green), var(--green-600))',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                }}>KS</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)' }}>Kamil Sobkowicz</div>
                  <a href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
                    linkedin.com/in/kamil-sobkowicz →
                  </a>
                </div>
              </div>
            </div>

            {/* Kontakt */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', fontWeight: 600 }}>Kontakt</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 12, color: 'var(--color-text-1)' }}>Zgłoszenia i błędy</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.65, marginBottom: 20 }}>
                Znalazłeś błąd w danych? Brakuje jakiegoś świadczenia? Masz pomysł na ulepszenie?
                Każde zgłoszenie jest czytane i brane pod uwagę.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 18px', borderRadius: 12,
                    background: 'var(--color-text-1)', color: 'var(--color-bg-0)',
                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Napisz na LinkedIn
                </a>
                <Link href="/dla-firm" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 18px', borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-1)',
                  fontSize: 14, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                }}>
                  Formularz kontaktowy →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
