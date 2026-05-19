'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/', label: 'Start', exact: true },
  { href: '/swiadczenia', label: 'Świadczenia', prefixes: ['/swiadczenia'] },
  { href: '/dla-firm', label: 'Dla firm', prefixes: ['/dla-firm', '/dotacje', '/automatyzacje'] },
  { href: '/wnioski', label: 'Wnioski', prefixes: ['/wnioski'] },
  { href: '/agent', label: 'Asystent AI', prefixes: ['/agent'] },
];

export function SiteNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  function isActive(item: typeof NAV_ITEMS[number]) {
    if (item.exact) return pathname === item.href;
    if (item.prefixes) return item.prefixes.some(p => pathname === p || pathname.startsWith(p + '/'));
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: theme === 'dark' ? 'rgba(10,18,10,0.92)' : 'rgba(245,248,245,0.94)',
      backdropFilter: 'saturate(140%) blur(14px)',
      WebkitBackdropFilter: 'saturate(140%) blur(14px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--color-green)',
            flexShrink: 0,
          }} />
          <span style={{
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-1)',
          }}>
            wezmezadarmo<span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: 11,
              color: 'var(--color-text-3)',
            }}>.com</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          justifyContent: 'center',
        }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? '#fff' : 'var(--color-text-3)',
                  textDecoration: 'none',
                  padding: '7px 18px',
                  borderRadius: 999,
                  background: active ? '#1B3326' : 'transparent',
                  transition: 'all 150ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <ThemeToggle theme={theme} onToggle={toggle} />
          <Link href="/agent/logowanie" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-text-2)',
            textDecoration: 'none',
            padding: '7px 18px',
            border: '1px solid var(--color-border)',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}>
            Zaloguj
          </Link>
          <Link href="/" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            textDecoration: 'none',
            padding: '7px 18px',
            borderRadius: 999,
            background: '#1B3326',
            whiteSpace: 'nowrap',
          }}>
            Sprawdź za darmo
          </Link>
        </div>
      </div>
    </header>
  );
}
