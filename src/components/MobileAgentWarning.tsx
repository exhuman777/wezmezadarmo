'use client';

import { useEffect, useState } from 'react';

export function MobileAgentWarning() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth < 920);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(184, 116, 26, 0.1)',
      borderBottom: '1px solid rgba(184, 116, 26, 0.35)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    }}>
      <svg
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(184,116,26,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <p style={{
        fontSize: 13,
        color: 'var(--color-text-2)',
        margin: 0,
        lineHeight: 1.5,
        flex: 1,
      }}>
        Ta usługa działa tylko na komputerze z uwagi na złożoność interfejsu. Na telefonie
        skorzystaj z{' '}
        <a href="/" style={{ color: 'var(--color-warn, #B8741A)', textDecoration: 'underline' }}>
          kalkulatora świadczeń
        </a>{' '}
        lub{' '}
        <a href="/swiadczenia" style={{ color: 'var(--color-warn, #B8741A)', textDecoration: 'underline' }}>
          bazy świadczeń
        </a>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Zamknij"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-3)',
          fontSize: 18,
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </div>
  );
}
