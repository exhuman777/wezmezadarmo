'use client';

import type { PrefillStatus } from '@/lib/wnioski/useFormPrefill';

interface Props {
  status: PrefillStatus;
  count: number;
  isLoggedIn: boolean;
  /** "Wypelniono X pol z profilu" - jezeli english=true uzywa "Filled X fields from your profile." */
  english?: boolean;
}

const baseStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  borderRadius: 2,
  marginBottom: 16,
  lineHeight: 1.45,
};

/** Od 6.11.2026 bez kont: baner pokazuje tylko przywrócenie danych z tej przeglądarki. */
export function PrefillBanner({ status, english = false }: Props) {
  if (status !== 'localStorage') return null;
  return (
    <div style={{
      ...baseStyle,
      color: 'var(--color-text-2)',
      background: 'var(--color-bg-2)',
      border: '1px solid var(--color-border)',
    }}>
      {english ? 'Restored data from previous session in this browser.' : 'Przywrócono dane z poprzedniej sesji w tej przeglądarce.'}
    </div>
  );
}
