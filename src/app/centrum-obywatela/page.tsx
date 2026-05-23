import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Centrum Obywatela - darmowe narzędzia urzędowe | wezmezadarmo',
  description: '11 narzędzi z oficjalnych polskich API: NFZ, NBP, GIOŚ, Biała Lista VAT, IMGW/RCB, ELI/Sejm, BDL GUS, ARiMR, PKP. Bez logowania.',
};

interface Tool {
  href: string;
  icon: string;
  label: string;
  desc: string;
  badge: string;
  color: string;
  audiences: string[];
}

const TOOLS: Tool[] = [
  { href: '/nfz', icon: 'N', label: 'NFZ - kolejki i lekarze', desc: 'Czasy oczekiwania, najbliższy lekarz, refundacja leków', badge: 'na żywo', color: '#1B5E20',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/kursy', icon: 'K', label: 'Kursy walut NBP', desc: 'Aktualne kursy + konwerter na PLN', badge: 'codziennie', color: '#CC0000',
    audiences: ['firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/powietrze', icon: 'A', label: 'Jakość powietrza GIOŚ', desc: 'Indeks PM10/PM2.5 dla Twojej lokalizacji', badge: 'na żywo', color: '#00695C',
    audiences: ['senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/biala-lista', icon: 'V', label: 'Biała Lista VAT', desc: 'Sprawdź kontrahenta po NIP. Status VAT, konta, KRS', badge: 'na żywo', color: '#4527A0',
    audiences: ['firma'] },
  { href: '/centrum-obywatela/pogoda', icon: 'P', label: 'Ostrzeżenia IMGW/RCB', desc: 'Burze, powodzie, mróz, smog. Alerty RCB co 15 min', badge: 'na żywo', color: '#c4841a',
    audiences: ['rolnik', 'senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/prawo', icon: 'L', label: 'Zmiany w prawie (ELI/Sejm)', desc: 'Tracker ustaw i rozporządzeń o świadczeniach', badge: 'co 30 min', color: '#003874',
    audiences: ['senior', 'firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/gus', icon: 'G', label: 'Dane gminy (BDL GUS)', desc: 'Ludność, bezrobocie, wynagrodzenia w Twojej gminie', badge: 'wyszukiwarka', color: '#004B8D',
    audiences: ['rolnik', 'firma', 'wszyscy'] },
  { href: '/centrum-obywatela/dzialki', icon: 'D', label: 'Geoportal ARiMR', desc: 'Mapy działek rolnych, dopłaty bezpośrednie', badge: 'link + instrukcja', color: '#5d7c1f',
    audiences: ['rolnik'] },
  { href: '/centrum-obywatela/transport', icon: 'T', label: 'Ulgi PKP', desc: 'Tabela ulg dla studenta, seniora, KDR, niepełnosprawnych', badge: 'tabela', color: '#a01818',
    audiences: ['senior', 'student', 'rodzina'] },
  { href: '/aktualnosci', icon: 'R', label: 'Aktualności RSS', desc: 'Agregator z 8 instytucji państwowych, odświeżany 2x/dzień', badge: '2x/dzień', color: '#003874',
    audiences: ['firma', 'wszyscy'] },
  { href: '/swiadczenia', icon: 'S', label: 'Świadczenia i ulgi', desc: '118 świadczeń ZUS, NFZ, PFRON, KRUS, MOPS - przeszukiwalna baza', badge: 'baza wiedzy', color: '#22A06B',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
];

interface Audience {
  slug: string;
  label: string;
  marker: string;
  desc: string;
  benefit: string;
  accent: string;
}

const AUDIENCES: Audience[] = [
  {
    slug: 'rolnik',
    label: 'Rolnik (KRUS)',
    marker: '01',
    desc: 'Jeśli prowadzisz gospodarstwo i jesteś ubezpieczony w KRUS - sprawdź pogodę przed pracą polową, dane swojej gminy, mapy działek i świadczenia dla rolników.',
    benefit: 'Mniej wizyt w urzędzie, więcej czasu na pracę.',
    accent: '#5d7c1f',
  },
  {
    slug: 'senior',
    label: 'Senior i pacjent',
    marker: '02',
    desc: 'Po 60. roku życia, na emeryturze albo z przewlekłą chorobą - czas oczekiwania do specjalisty, ulgi transportowe, zmiany w prawie o emeryturach i jakość powietrza.',
    benefit: 'Wszystko co potrzebujesz przed wizytą u lekarza i podróżą.',
    accent: '#1B5E20',
  },
  {
    slug: 'rodzina',
    label: 'Rodzina z dziećmi',
    marker: '03',
    desc: 'Świadczenia rodzinne, smog dla dziecka z astmą, ulgi PKP dla Karty Dużej Rodziny i wizyty u pediatry. Wszystko czego potrzebujesz w jednym miejscu.',
    benefit: 'Mniej formalności, więcej czasu z dziećmi.',
    accent: '#c4841a',
  },
  {
    slug: 'student',
    label: 'Student',
    marker: '04',
    desc: 'Ulga studencka 51% na PKP, kolejki NFZ przy długich miesięcznych przerwach na badania, kursy walut dla stypendiów zagranicznych i tracker zmian w przepisach.',
    benefit: 'Codzienne narzędzia studenckie bez zbędnej rejestracji.',
    accent: '#4527A0',
  },
  {
    slug: 'firma',
    label: 'Przedsiębiorca / JDG',
    marker: '05',
    desc: 'Sprawdzenie kontrahenta na Białej Liście VAT, kursy NBP do faktur zagranicznych, dane GUS o rynku w Twojej gminie i monitoring zmian w przepisach podatkowych.',
    benefit: 'Solidarna odpowiedzialność za VAT i ryzyko - pod kontrolą.',
    accent: '#003874',
  },
  {
    slug: 'wszyscy',
    label: 'Wszyscy obywatele',
    marker: '06',
    desc: 'Baza 118 świadczeń, codzienne aktualności rządowe, kursy walut, jakość powietrza, tracker zmian w prawie - narzędzia dla każdego, niezależnie od sytuacji.',
    benefit: 'Najczęściej używane narzędzia w jednym miejscu.',
    accent: '#22A06B',
  },
];

const STATS = [
  { num: '11', label: 'darmowych narzędzi' },
  { num: '9', label: 'oficjalnych API rządowych' },
  { num: '8', label: 'źródeł danych live w czacie AI' },
  { num: '0 PLN', label: 'koszt, bez rejestracji' },
];

const SOURCES = [
  { name: 'api.nfz.gov.pl', purpose: 'kolejki, lekarze, refundacja' },
  { name: 'api.nbp.pl', purpose: 'kursy walut Tabela A' },
  { name: 'api.gios.gov.pl', purpose: 'indeks powietrza PM10/PM2.5' },
  { name: 'wl-api.mf.gov.pl', purpose: 'Biała Lista VAT' },
  { name: 'rcb.gov.pl', purpose: 'ostrzeżenia meteo i kryzysowe' },
  { name: 'api.sejm.gov.pl/eli', purpose: 'zmiany w przepisach' },
  { name: 'bdl.stat.gov.pl', purpose: 'dane demograficzne GUS' },
  { name: 'geoportal.arimr.gov.pl', purpose: 'mapy działek rolnych' },
  { name: 'portalpasazera.pl', purpose: 'rozkład i ulgi PKP' },
];

export default function CentrumObywatelaPage() {
  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Centrum Obywatela
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(26px, 3.8vw, 38px)', fontWeight: 700, marginBottom: 14, color: 'var(--ink-900)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
        11 darmowych narzędzi urzędowych w jednym miejscu
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-500)', marginBottom: 28, lineHeight: 1.55, maxWidth: 780 }}>
        Pogrupowane po grupach docelowych - wejdź w sekcję dla siebie i sprawdź czego potrzebujesz.
        Dane z oficjalnych polskich API (NFZ, NBP, GIOŚ, MF, GUS, Sejm). Bez logowania, bez plików cookie, bez profilowania.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10,
        marginBottom: 32,
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            padding: '14px 16px',
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
              background: 'linear-gradient(180deg, #22A06B, transparent)',
            }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', fontFamily: 'var(--f-mono)', lineHeight: 1.1 }}>
              {s.num}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4, lineHeight: 1.35 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {AUDIENCES.map(aud => {
          const tools = TOOLS.filter(t => t.audiences.includes(aud.slug));
          if (tools.length === 0) return null;
          return (
            <section key={aud.slug} style={{
              padding: '20px 22px',
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                background: aud.accent,
                opacity: 0.85,
              }} />
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 16, flexWrap: 'wrap', marginBottom: 14, paddingLeft: 4,
              }}>
                <div style={{ flex: '1 1 360px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600,
                      color: aud.accent, letterSpacing: '0.08em',
                      padding: '3px 8px', borderRadius: 6,
                      background: `${aud.accent}15`,
                      border: `1px solid ${aud.accent}30`,
                    }}>
                      {aud.marker}
                    </span>
                    <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink-900)', margin: 0, letterSpacing: '-0.01em' }}>
                      {aud.label}
                    </h2>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--ink-500)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 999,
                      background: 'var(--ink-100, #f0f0f0)',
                      border: '1px solid var(--line)',
                    }}>
                      {tools.length} {tools.length === 1 ? 'narzędzie' : tools.length < 5 ? 'narzędzia' : 'narzędzi'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-600)', margin: 0, lineHeight: 1.55, maxWidth: 720 }}>
                    {aud.desc}
                  </p>
                </div>
                <div style={{
                  flex: '0 0 auto',
                  padding: '8px 12px',
                  background: `${aud.accent}08`,
                  border: `1px dashed ${aud.accent}40`,
                  borderRadius: 8,
                  fontSize: 11.5, color: 'var(--ink-600)', fontStyle: 'italic',
                  maxWidth: 260,
                }}>
                  {aud.benefit}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                gap: 10,
              }}>
                {tools.map(t => (
                  <Link key={t.href + aud.slug} href={t.href} className="card-hover"
                    style={{
                      display: 'block', textDecoration: 'none',
                      padding: 14,
                      background: 'var(--green-25, #fafaf7)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      position: 'relative', overflow: 'hidden',
                      transition: 'transform 180ms, border-color 180ms',
                    }}>
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                      opacity: 0.6,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 7,
                        background: t.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}>{t.icon}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: t.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>
                          {t.badge}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.45, margin: 0 }}>
                      {t.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-400)' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
            Źródła danych
          </span>
        </div>
        <div style={{
          padding: '18px 22px',
          background: 'var(--green-50)',
          border: '1px solid var(--green-200)',
          borderRadius: 14,
        }}>
          <div style={{ fontSize: 13, color: 'var(--green-900)', lineHeight: 1.55, marginBottom: 14 }}>
            <strong>9 oficjalnych API rządowych</strong> - dane pobierane na żądanie, nigdzie nie przechowywane.
            Bez profilowania, bez plików cookie, bez śledzenia.
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 8,
          }}>
            {SOURCES.map(s => (
              <div key={s.name} style={{
                padding: '8px 12px',
                background: 'var(--white)',
                border: '1px solid var(--green-200)',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <code style={{
                  fontSize: 11.5, fontFamily: 'var(--f-mono)', color: 'var(--green-900)',
                  fontWeight: 600, letterSpacing: '-0.005em',
                }}>
                  {s.name}
                </code>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                  {s.purpose}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
