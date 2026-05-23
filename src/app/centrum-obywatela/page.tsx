import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Centrum Obywatela - darmowe narzędzia urzędowe | wezmezadarmo',
  description: 'Sprawdź kolejki NFZ, kursy NBP, jakość powietrza GIOS, NIP na Białej Liście VAT. Wszystko z oficjalnych źródeł rządowych, bez logowania.',
};

const TOOLS = [
  {
    href: '/nfz',
    icon: 'N',
    label: 'NFZ',
    desc: 'Czasy oczekiwania do specjalisty, najbliższy lekarz, refundacja leków',
    badge: 'na żywo',
    color: '#1B5E20',
  },
  {
    href: '/centrum-obywatela/kursy',
    icon: 'K',
    label: 'Kursy walut NBP',
    desc: 'Aktualne kursy średnie NBP, przelicznik do PLN',
    badge: 'aktualizacja codziennie',
    color: '#CC0000',
  },
  {
    href: '/centrum-obywatela/powietrze',
    icon: 'A',
    label: 'Jakość powietrza',
    desc: 'Indeks GIOŚ dla Twojej lokalizacji, PM10, PM2.5, smog',
    badge: 'na żywo',
    color: '#00695C',
  },
  {
    href: '/centrum-obywatela/biala-lista',
    icon: 'V',
    label: 'Biała Lista VAT',
    desc: 'Sprawdź kontrahenta po NIP. Status, konta bankowe, KRS',
    badge: 'na żywo',
    color: '#4527A0',
  },
  {
    href: '/aktualnosci',
    icon: 'R',
    label: 'Aktualności RSS',
    desc: 'Agregator wiadomości z 8 polskich instytucji, aktualizacja 2x/dzień',
    badge: '8 źródeł',
    color: '#003874',
  },
  {
    href: '/swiadczenia',
    icon: 'S',
    label: 'Świadczenia i ulgi',
    desc: '117+ świadczeń ZUS, NFZ, PFRON, KRUS, ulgi podatkowe',
    badge: 'baza wiedzy',
    color: '#22A06B',
  },
];

export default function CentrumObywatelaPage() {
  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Centrum Obywatela
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, marginBottom: 10, color: 'var(--ink-900)', lineHeight: 1.2 }}>
        Darmowe narzędzia urzędowe w jednym miejscu
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-500)', marginBottom: 32, lineHeight: 1.6, maxWidth: 700 }}>
        Sprawdź czasy oczekiwania w NFZ, aktualne kursy NBP, jakość powietrza, status VAT kontrahenta i aktualności z polskich instytucji.
        Wszystko z oficjalnych źródeł rządowych, bez logowania i bez opłat.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14 }}>
        {TOOLS.map(({ href, icon, label, desc, badge, color }) => (
          <Link
            key={href}
            href={href}
            className="card card-hover"
            style={{
              display: 'block', textDecoration: 'none',
              padding: 22, position: 'relative', overflow: 'hidden',
            }}
          >
            <span style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              opacity: 0.5,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 16, fontWeight: 700,
                flexShrink: 0,
              }}>
                {icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>
                  {label}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>
                  {badge}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5, margin: 0 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36, padding: '18px 22px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--green-900)', lineHeight: 1.6 }}>
          <strong>Wszystkie dane z oficjalnych API rządowych:</strong> api.nfz.gov.pl, api.nbp.pl, api.gios.gov.pl, wl-api.mf.gov.pl.
          Bez profilowania, bez plików cookie. Dane pobierane na żądanie.
        </div>
      </div>
    </main>
  );
}
