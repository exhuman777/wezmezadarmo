'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

export function AgentNav() {
  const { theme, toggle } = useTheme();

  return (
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
        <Link href="/agent" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-1)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          <span style={{ color: 'var(--color-text-3)' }}>wezmezadarmo</span>
          <span style={{ color: 'var(--color-border-light)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--color-green)' }}>agent</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle theme={theme} onToggle={toggle} />
          <Link href="/logowanie" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
            padding: '6px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            Zaloguj się
          </Link>
          <Link href="/rejestracja" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '6px 12px',
            background: 'var(--color-green)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
          }}>
            Zacznij
          </Link>
        </div>
      </div>
    </nav>
  );
}
