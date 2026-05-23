'use client';

import Link from 'next/link';
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
  borderRadius: 8,
  marginBottom: 16,
  lineHeight: 1.45,
};

export function PrefillBanner({ status, count, isLoggedIn, english = false }: Props) {
  if (status === 'loading') return null;

  if (status === 'profile' || status === 'mixed') {
    const msg = english
      ? `Filled ${count} ${count === 1 ? 'field' : 'fields'} from your profile.`
      : `Wypelniono ${count} ${count === 1 ? 'pole' : count < 5 ? 'pola' : 'pol'} z Twojego profilu.`;
    // Polskie znaki w komentarzu, ale UI musi miec poprawne diakrytyki:
    const msgPl = `Wypełniono ${count} ${count === 1 ? 'pole' : count < 5 ? 'pola' : 'pól'} z Twojego profilu.`;
    return (
      <div style={{
        ...baseStyle,
        color: 'var(--color-text-2)',
        background: 'rgba(34,160,107,0.08)',
        border: '1px solid rgba(34,160,107,0.3)',
      }}>
        {english ? msg : msgPl}{' '}
        <Link href="/agent/panel/profil" style={{ color: '#22A06B', textDecoration: 'underline' }}>
          {english ? 'Manage data' : 'Zarządzaj danymi'}
        </Link>
      </div>
    );
  }

  if (status === 'localStorage') {
    return (
      <div style={{
        ...baseStyle,
        color: 'var(--color-text-2)',
        background: 'var(--color-bg-2)',
        border: '1px solid var(--color-border)',
      }}>
        {english ? 'Restored data from previous session.' : 'Przywrócono dane z poprzedniej sesji.'}
      </div>
    );
  }

  // status === 'idle'
  if (!isLoggedIn) {
    return (
      <div style={{
        ...baseStyle,
        color: 'var(--color-text-2)',
        background: 'var(--color-bg-2)',
        border: '1px dashed var(--color-border)',
      }}>
        {english ? (
          <><Link href="/logowanie" style={{ color: '#22A06B', textDecoration: 'underline' }}>Sign in</Link> to auto-fill the form from your profile.</>
        ) : (
          <><Link href="/logowanie" style={{ color: '#22A06B', textDecoration: 'underline' }}>Zaloguj się</Link> aby auto-wypełnić formularz z Twojego profilu.</>
        )}
      </div>
    );
  }

  return null;
}
