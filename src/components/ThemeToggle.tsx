'use client';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
      style={{
        width: 40, height: 40,
        borderRadius: 999,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-1)',
        transition: 'background 200ms, border-color 200ms',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
