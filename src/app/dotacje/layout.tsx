import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Dotacje dla firm -- Agent AI | wezmezadarmo',
  description: 'Agent AI monitorujący KFS, PUP, PFRON, KPO i programy samorządowe. Powiadamia gdy otworzy się nabór pasujący do Twojej firmy. 25 PLN / miesiąc.',
  openGraph: {
    title: 'Dotacje dla firm -- Agent AI | wezmezadarmo',
    description: 'Monitoring dotacji dla MŚP. KFS, PUP, PFRON, KPO, samorządy. Agent AI znający profil Twojej firmy.',
    siteName: 'wezmezadarmo',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function DotacjeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="dotacje-dark" strategy="beforeInteractive">
        {`document.documentElement.classList.add('dark');`}
      </Script>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
        <nav style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-0)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Link
              href="/dotacje"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-1)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              <span style={{ color: 'var(--color-text-3)' }}>wezmezadarmo</span>
              <span style={{ color: 'var(--color-border-light)', margin: '0 4px' }}>/</span>
              <span style={{ color: 'var(--color-accent)' }}>dotacje</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/dotacje/logowanie"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-text-3)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                Zaloguj się
              </Link>
              <Link
                href="/dotacje/rejestracja"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-bg-0)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                }}
              >
                Zarejestruj się
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </div>
    </>
  );
}
