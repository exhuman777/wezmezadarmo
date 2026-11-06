'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div role="note" style={{
      padding: '8px 16px',
      background: 'var(--kafel)',
      borderBottom: '1px solid var(--linia)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <p style={{ fontSize: 14, color: 'var(--ink-700)', margin: 0, lineHeight: 1.5, flex: 1 }}>
        Ta usługa działa tylko na komputerze z uwagi na złożoność interfejsu. Na telefonie
        skorzystaj z{' '}
        <Link href="/" style={{ color: 'var(--tusz)', textDecoration: 'underline' }}>
          kalkulatora świadczeń
        </Link>{' '}
        lub{' '}
        <a href="/swiadczenia" style={{ color: 'var(--tusz)', textDecoration: 'underline' }}>
          bazy świadczeń
        </a>
        .
      </p>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Zamknij" className="przycisk-ikona" style={{ flexShrink: 0 }}>
        <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>&times;</span>
      </button>
    </div>
  );
}
