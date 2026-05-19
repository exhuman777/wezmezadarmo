'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'dark'
        ? 'rgba(10,18,10,0.85)'
        : 'rgba(236,242,236,0.85)',
      backdropFilter: 'saturate(140%) blur(14px)',
      WebkitBackdropFilter: 'saturate(140%) blur(14px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span className="red-dot" />
          <span style={{
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-1)',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 2,
          }}>
            wezmezadarmo
            <span className="mono" style={{ color: 'var(--color-text-3)', fontWeight: 400, fontSize: 12 }}>.com</span>
          </span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { href: '/automatyzacje', label: 'Automatyzacje' },
            { href: '/dotacje', label: 'Dotacje' },
            { href: '/aktualnosci', label: 'Aktualności' },
            { href: '/wnioski', label: 'Wnioski' },
            { href: '/agent', label: 'Agent AI' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="nav-link-hover" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-text-3)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
            }}>
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </div>
    </header>
  );
}
