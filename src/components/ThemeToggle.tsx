'use client';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-3 hover:text-text-1 hover:border-border-light transition-colors cursor-pointer text-[14px]"
      title={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
      aria-label={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
    >
      {theme === 'light' ? 'D' : 'L'}
    </button>
  );
}
