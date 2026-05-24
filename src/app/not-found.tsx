import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strona nie znaleziona | wezmezadarmo',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text-3)', letterSpacing: '0.1em', marginBottom: 14 }}>
          404 · STRONA NIE ZNALEZIONA
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--color-text-1)', margin: '0 0 16px' }}>
          Tej strony tu nie ma
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '0 0 32px' }}>
          Adres mógł się zmienić, link może być stary, albo strona została usunięta. Spróbuj jednej z poniższych:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { href: '/', label: 'Kalkulator świadczeń', desc: 'Sprawdź co Ci się należy' },
            { href: '/swiadczenia', label: 'Baza 118 świadczeń', desc: 'Przeglądaj wszystkie' },
            { href: '/nfz', label: 'Wyszukiwarka NFZ', desc: 'Kolejki, lekarze' },
            { href: '/centrum-obywatela', label: 'Centrum Obywatela', desc: '11 publicznych narzędzi' },
            { href: '/wnioski', label: 'Kreator wniosków ZUS', desc: 'Z-15a, ERPO, ZAS-53...' },
            { href: '/aktualnosci', label: 'Aktualności urzędowe', desc: 'RSS z 8 instytucji' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', padding: '14px 16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              textDecoration: 'none',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{item.desc}</div>
            </Link>
          ))}
        </div>

        <Link href="/" style={{
          display: 'inline-block',
          padding: '12px 28px',
          background: 'var(--color-text-1)',
          color: 'var(--color-bg-0)',
          borderRadius: 10,
          fontSize: 15, fontWeight: 500,
          textDecoration: 'none',
        }}>
          ← Strona główna
        </Link>
      </div>
    </div>
  );
}
