import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O projekcie | wezmezadarmo',
  description: 'Dowiedz sie po co powstal wezmezadarmo, komu sluzy, jak dziala i kto za nim stoi.',
};

const MODULES = [
  {
    href: '/',
    label: 'Kalkulator świadczeń',
    badge: 'Bezpłatny',
    free: true,
    icon: 'S',
    desc: 'Wypełniasz formularz (wiek, płeć, 11 pytań) i dostajesz spersonalizowaną listę 118 świadczeń z ZUS, NFZ, PFRON, KRUS, MOPS. Żadnych danych osobowych na serwerze.',
  },
  {
    href: '/wnioski',
    label: 'Kreator wniosków ZUS',
    badge: 'Bezpłatny',
    free: true,
    icon: 'W',
    desc: 'AI prowadzi przez wypełnianie formularzy ZUS: Z-15a, Z-15b, Z-3, ERPO, ZAS-53, PEL. Na końcu generuje gotowy PDF do druku lub wysyłki pocztą.',
  },
  {
    href: '/aktualnosci',
    label: 'Aktualności z urzędów',
    badge: 'Bezpłatny',
    free: true,
    icon: 'A',
    desc: 'Agregator RSS z ZUS, GUS, NBP, NFZ, UOKiK, Sejmu i innych instytucji. Plus widget jakości powietrza GIOŚ i kursów walut NBP na żywo. Odświeżany co 30 minut.',
  },
  {
    href: '/centrum-obywatela',
    label: 'Centrum obywatela',
    badge: 'Bezpłatny',
    free: true,
    icon: 'C',
    desc: 'Hub 11 publicznych narzędzi: NFZ (kolejki, lekarze), NBP (kursy walut), GIOŚ (powietrze), Biała Lista VAT, IMGW/RCB (ostrzeżenia), ELI/Sejm (zmiany w prawie), BDL GUS (dane gminy), ARiMR (mapy działek), PKP (tabela ulg). Wszystko z oficjalnych polskich API, bez logowania.',
  },
  {
    href: '/statystyki',
    label: 'Polska w liczbach',
    badge: 'Bezpłatny',
    free: true,
    icon: 'ST',
    desc: 'Dashboard danych publicznych z GUS, NBP, NFZ. Wskaźniki SDG live, ceny mieszkań, status integracji API państwowych. Dane aktualizowane na bieżąco.',
  },
  {
    href: '/agent',
    label: 'Asystent AI',
    badge: 'Wymaga konta',
    free: false,
    icon: 'AI',
    desc: 'Osobisty agent AI dla JDG i osób prywatnych. Dopasowuje świadczenia do profilu, monitoruje zmiany w przepisach i wysyła dzienny e-mail digest.',
  },
  {
    href: '/dotacje',
    label: 'AI dla Twojej firmy',
    badge: 'Wycena indywidualna',
    free: false,
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
  { name: 'Google Gemini', note: 'via OpenRouter, asystent czatowy' },
  { name: 'Silnik dopasowań', note: 'autorski algorytm TypeScript' },
  { name: 'Supabase', note: 'baza danych, serwery w UE' },
  { name: 'Vercel', note: 'hosting serverless, edge deployment' },
  { name: 'Baza 118 świadczeń', note: 'ręcznie zweryfikowana, każda z datą i źródłem' },
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

const STATS = [
  { n: '118', label: 'świadczeń w bazie' },
  { n: '15', label: 'kategorii' },
  { n: '14', label: 'źródeł danych' },
  { n: '2 min', label: 'czas analizy' },
];

export default function OProjekciePage() {
  return (
    <main style={{ minHeight: '100vh' }}>

      {/* ────────────────────────── HERO ───────────────────── */}
      <section style={{
        padding: 'clamp(56px, 7vw, 96px) 0 0',
        background: `
          radial-gradient(900px 600px at 75% 25%, rgba(34,160,107,.28), transparent 60%),
          radial-gradient(500px 400px at 10% 75%, rgba(78,196,138,.15), transparent 55%),
          var(--green-950)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="grain-bg" />
        <div style={{ position: 'absolute', right: -100, top: -100, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, top: 40, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '55%', top: '30%', width: 1, height: '60%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)', pointerEvents: 'none' }} />

        <div className="wrap" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'center' }}>

            {/* text */}
            <div className="rise" style={{ paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
              <div className="eyebrow green" style={{ marginBottom: 20, color: 'rgba(142,234,173,0.75)' }}>
                O projekcie
              </div>
              <h1 style={{
                color: '#fff',
                marginBottom: 18,
                fontSize: 'clamp(38px, 5.5vw, 72px)',
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.0,
              }}>
                wezmezadarmo.com
              </h1>
              <p style={{ maxWidth: 520, fontSize: 'clamp(14px, 1.6vw, 16px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28 }}>
                Bezpłatne narzędzie do sprawdzania świadczeń, wniosków ZUS i aktualności rządowych.
                Projekt prywatny, nie rządowy.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/" className="btn btn-green">
                  Sprawdź kalkulator →
                </Link>
                <Link href="/swiadczenia" className="btn btn-ghost" style={{ fontSize: 15 }}>
                  Baza świadczeń
                </Link>
              </div>
            </div>

            {/* floating stats */}
            <div className="rise hide-mobile" style={{ animationDelay: '200ms', alignSelf: 'center', paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '24px 28px',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}>
                {STATS.map((s, i) => (
                  <div key={s.label} style={{
                    padding: '14px 0',
                    borderBottom: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(22px, 2.8vw, 30px)',
                      fontWeight: 600,
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      marginBottom: 3,
                      color: i === 0 ? '#4ec48a' : 'rgba(255,255,255,0.8)',
                    }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom fade to light */}
        <div style={{ height: 48, background: 'linear-gradient(to bottom, transparent, var(--color-bg-0))', pointerEvents: 'none' }} />
      </section>

      {/* ────────────────────── GENEZA ──────────────────────── */}
      <section style={{ padding: 'clamp(32px, 4vw, 56px) 0', background: 'var(--color-bg-0)' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'start' }}>

            {/* left: quote block */}
            <div className="rise" style={{ animationDelay: '100ms' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 12 }}>Geneza</div>
              <div style={{
                fontSize: 'clamp(48px, 8vw, 96px)',
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: 'var(--green-500)',
                opacity: 0.25,
                fontFamily: 'var(--font-serif)',
                marginBottom: -16,
                marginLeft: -4,
              }}>"</div>
              <p style={{
                fontSize: 'clamp(17px, 2vw, 22px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.35,
                color: 'var(--color-text-1)',
                marginBottom: 20,
              }}>
                Polska ma jeden z najszerszych systemów świadczeń w Europie. Większość ludzi nie wie, co im przysługuje.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'var(--color-green-bg)',
                border: '1px solid var(--color-green-border)',
                borderRadius: 999,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-green)',
                letterSpacing: '0.04em',
              }}>
                118 świadczeń z 15 kategorii
              </div>
            </div>

            {/* right: paragraphs */}
            <div className="rise" style={{ animationDelay: '180ms' }}>
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: 'clamp(20px, 3vw, 32px)',
                boxShadow: 'var(--shadow-1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--color-text-2)',
              }}>
                <p style={{ margin: 0 }}>
                  Polska ma jeden z najszerszych systemów świadczeń społecznych w Europie.
                  Problem polega na tym, że większość ludzi nie wie, co im przysługuje.
                  Informacje są rozproszone po dziesiątkach stron rządowych, urzędowych portali i aktów prawnych.
                </p>
                <p style={{ margin: 0 }}>
                  wezmezadarmo powstało, żeby zebrać w jednym miejscu{' '}
                  <strong style={{ color: 'var(--color-text-1)' }}>118 świadczeń z 15 kategorii</strong>{' '}
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

          </div>
        </div>
      </section>

      {/* ────────────────────── MODUŁY ──────────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--color-bg-0)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Moduły</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Co zawiera serwis</h2>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-2)' }}>{MODULES.length} narzędzi</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: 10 }}>
            {MODULES.map((mod) => (
              <Link key={mod.href} href={mod.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-lift" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderTop: `3px solid ${mod.free ? 'var(--green-500)' : 'var(--color-border)'}`,
                  borderRadius: '0 0 14px 14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  cursor: 'pointer',
                  height: '100%',
                  boxSizing: 'border-box',
                }}>
                  <span style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: mod.free
                      ? 'linear-gradient(135deg, var(--green-850), var(--green-700))'
                      : 'linear-gradient(135deg, var(--ink-800), var(--ink-700))',
                    color: mod.free ? 'rgba(240,250,243,0.9)' : 'rgba(240,246,241,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                  }}>{mod.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>{mod.label}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: `1px solid ${mod.free ? 'var(--color-green-border)' : 'var(--color-border)'}`,
                        background: mod.free ? 'var(--color-green-bg)' : 'var(--color-surface-2)',
                        color: mod.free ? 'var(--color-green)' : 'var(--color-text-2)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                        whiteSpace: 'nowrap' as const,
                      }}>{mod.badge}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>{mod.desc}</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-2)', flexShrink: 0, marginTop: 3, opacity: 0.5 }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── ODBIORCY ────────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--green-50)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Odbiorcy</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Komu może służyć</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 8 }}>
            {AUDIENCE.map((a, i) => (
              <div key={a.group} className="hover-lift" style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: 'var(--shadow-1)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--green-200)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>0{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.015em', paddingRight: 40 }}>{a.group}</div>
                <p style={{ fontSize: 11.5, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>{a.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── BEZPIECZEŃSTWO ─────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--color-bg-0)' }}>
        <div className="wrap">
          <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Prywatność</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Bezpieczeństwo danych</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 10 }}>
            {SECURITY.map((sec) => (
              <div key={sec.module} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-1)',
              }}>
                <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sec.items.every(i => i.ok) ? 'var(--green-500)' : 'var(--color-warn)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-2)', fontWeight: 500 }}>{sec.module}</span>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sec.items.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginTop: 1,
                        background: item.ok ? 'var(--color-green-bg)' : 'rgba(184,116,26,0.1)',
                        border: `1px solid ${item.ok ? 'var(--color-green-border)' : 'rgba(184,116,26,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        color: item.ok ? 'var(--color-green)' : 'var(--color-warn)',
                      }}>{item.ok ? '✓' : '!'}</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>, {item.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 12, lineHeight: 1.6 }}>
            Całe połączenie jest szyfrowane (HTTPS).{' '}
            <Link href="/polityka-prywatnosci" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Polityka prywatności</Link>.
          </p>
        </div>
      </section>

      {/* ─────────────────────── STACK ──────────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--green-50)' }}>
        <div className="wrap">
          <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Stack</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Technologia</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TECH.map((t) => (
              <div key={t.name} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '10px 16px',
                boxShadow: 'var(--shadow-1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.01em' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-2)', letterSpacing: '0.02em' }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── ŹRÓDŁA ────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--color-bg-0)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Dane</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Źródła danych</h2>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-2)' }}>14 instytucji</span>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-1)',
          }}>
            {SOURCES.map((src, i) => (
              <div key={src.id} className="row-hover" style={{
                padding: '11px 18px',
                display: 'grid',
                gridTemplateColumns: '170px 1fr',
                gap: 16,
                alignItems: 'center',
                borderBottom: i < SOURCES.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-green)' }}>{src.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{src.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 10, lineHeight: 1.6 }}>
            Dane są weryfikowane ręcznie. Jeśli zauważysz nieaktualną informację, zgłoś przez LinkedIn.
          </p>
        </div>
      </section>

      {/* ─────────────── AUTOR + KONTAKT ─────────────────────── */}
      <section style={{ padding: 'clamp(40px, 5vw, 64px) 0', background: 'var(--green-50)' }}>
        <div className="wrap">
          <div style={{ paddingLeft: 14, borderLeft: '3px solid var(--green-500)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Ludzie</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-text-1)', margin: 0 }}>Autor i kontakt</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 12, alignItems: 'start' }}>

            {/* author card */}
            <div style={{
              background: 'var(--green-950)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: 'var(--shadow-3)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div className="grain-bg" style={{ opacity: 0.018 }} />
              <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(142,234,173,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Autor</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 0, marginBottom: 14, color: '#fff' }}>Kto za tym stoi</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 20 }}>
                Projekt stworzył <strong style={{ color: '#fff' }}>Kamil Sobkowicz</strong>,
                programista i przedsiębiorca z Polski. Kalkulator świadczeń i kreator wniosków
                to projekt społeczny. Narzędzia dla firm rozwijane są oddzielnie.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--green-600), var(--green-400))',
                  color: 'var(--green-950)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}>KS</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Kamil Sobkowicz</div>
                  <a href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: 'rgba(142,234,173,0.7)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                    linkedin.com/in/kamil-sobkowicz →
                  </a>
                </div>
              </div>
            </div>

            {/* contact card */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: 'var(--shadow-1)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Kontakt</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 0, marginBottom: 14, color: 'var(--color-text-1)' }}>Zgłoszenia i błędy</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.65, marginBottom: 22 }}>
                Znalazłeś błąd w danych? Brakuje jakiegoś świadczenia? Masz pomysł na ulepszenie?
                Każde zgłoszenie jest czytane i brane pod uwagę.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', borderRadius: 10, fontSize: 13 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Napisz na LinkedIn
                </a>
                <Link href="/dla-firm" className="btn btn-outline" style={{ justifyContent: 'center', borderRadius: 10, fontSize: 13 }}>
                  Formularz kontaktowy →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA ────────────────────────── */}
      <section style={{
        padding: 'clamp(48px, 6vw, 80px) 0',
        background: `
          radial-gradient(800px 500px at 60% 50%, rgba(34,160,107,.22), transparent 65%),
          var(--green-950)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="grain-bg" />
        <div className="wrap" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(142,234,173,0.6)', marginBottom: 14 }}>Zacznij teraz</div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(24px, 3.5vw, 40px)', marginBottom: 14, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Sprawdź co Ci przysługuje za darmo
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 28, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
            2 minuty, bez rejestracji. 118 świadczeń z ZUS, NFZ, PFRON i innych instytucji.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-green btn-lg">
              Kalkulator świadczeń →
            </Link>
            <Link href="/centrum-obywatela" className="btn btn-ghost">
              Centrum obywatela
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
