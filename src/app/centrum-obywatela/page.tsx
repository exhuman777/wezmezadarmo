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
  { href: '/centrum-obywatela/prawo', icon: 'P', label: 'Zmiany w prawie (ELI/Sejm)', desc: 'Tracker ustaw i rozporządzeń o świadczeniach', badge: 'co 30 min', color: '#003874',
    audiences: ['senior', 'firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/gus', icon: 'G', label: 'Dane gminy (BDL GUS)', desc: 'Ludność, bezrobocie, wynagrodzenia w Twojej gminie', badge: 'wyszukiwarka', color: '#004B8D',
    audiences: ['rolnik', 'firma', 'wszyscy'] },
  { href: '/centrum-obywatela/dzialki', icon: 'D', label: 'Geoportal ARiMR', desc: 'Mapy działek rolnych, dopłaty bezpośrednie', badge: 'link + instrukcja', color: '#5d7c1f',
    audiences: ['rolnik'] },
  { href: '/centrum-obywatela/transport', icon: 'T', label: 'Ulgi PKP', desc: 'Tabela ulg dla studenta, seniora, KDR, niepełnosprawnych', badge: 'tabela', color: '#a01818',
    audiences: ['senior', 'student', 'rodzina'] },
  { href: '/aktualnosci', icon: 'R', label: 'Aktualności RSS', desc: 'Agregator z 8 instytucji państwowych', badge: '2x/dzień', color: '#003874',
    audiences: ['firma', 'wszyscy'] },
  { href: '/swiadczenia', icon: 'S', label: 'Świadczenia i ulgi', desc: '117+ świadczeń ZUS, NFZ, PFRON, KRUS, MOPS', badge: 'baza wiedzy', color: '#22A06B',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
];

interface Audience { slug: string; label: string; desc: string }
const AUDIENCES: Audience[] = [
  { slug: 'rolnik', label: 'Rolnik (KRUS)', desc: 'Pogoda, działki, dane gminy, świadczenia KRUS' },
  { slug: 'senior', label: 'Senior i pacjent', desc: 'NFZ, GIOŚ, zmiany w przepisach, ulgi PKP' },
  { slug: 'rodzina', label: 'Rodzina z dziećmi', desc: 'NFZ dla dziecka, smog, ulgi PKP, aktualności' },
  { slug: 'student', label: 'Student', desc: 'Ulgi PKP, NFZ, kursy walut, zmiany w prawie' },
  { slug: 'firma', label: 'Przedsiębiorca / JDG', desc: 'Biała Lista, kursy NBP, dane rynku, aktualności' },
  { slug: 'wszyscy', label: 'Wszyscy obywatele', desc: 'Świadczenia, aktualności, NBP, GIOŚ' },
];

export default function CentrumObywatelaPage() {
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Centrum Obywatela
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, marginBottom: 10, color: 'var(--ink-900)', lineHeight: 1.2 }}>
        11 darmowych narzędzi urzędowych
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-500)', marginBottom: 36, lineHeight: 1.6, maxWidth: 760 }}>
        Pogrupowane po grupach docelowych - znajdź narzędzia, których potrzebujesz. Wszystko z oficjalnych polskich API,
        bez logowania, bez opłat.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {AUDIENCES.map(aud => {
          const tools = TOOLS.filter(t => t.audiences.includes(aud.slug));
          if (tools.length === 0) return null;
          return (
            <section key={aud.slug}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-900)', margin: 0, marginBottom: 4 }}>{aud.label}</h2>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: 0 }}>{aud.desc}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 12 }}>
                {tools.map(t => (
                  <Link key={t.href + aud.slug} href={t.href} className="card card-hover"
                    style={{ display: 'block', textDecoration: 'none', padding: 18, position: 'relative', overflow: 'hidden' }}>
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                      opacity: 0.5,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: t.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700, flexShrink: 0,
                      }}>{t.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>{t.label}</div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: t.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{t.badge}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div style={{ marginTop: 40, padding: '18px 22px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--green-900)', lineHeight: 1.6 }}>
          <strong>Wszystkie dane z oficjalnych API rządowych:</strong> api.nfz.gov.pl, api.nbp.pl, api.gios.gov.pl, wl-api.mf.gov.pl, rcb.gov.pl, api.sejm.gov.pl/eli, bdl.stat.gov.pl, geoportal.arimr.gov.pl, portalpasazera.pl.
          Bez profilowania, bez plików cookie. Dane pobierane na żądanie.
        </div>
      </div>
    </main>
  );
}
