'use client';

import { useState, useEffect } from 'react';

const COOKIE_KEY = 'wzd_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
    // Grant GA consent so cookies start working
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  function reject() {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    setVisible(false);
    // Disable GA tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-57R2TFXNH7';
    w[`ga-disable-${gaId}`] = true;
    // Remove existing GA cookies
    document.cookie.split(';').forEach(c => {
      const name = c.trim().split('=')[0];
      if (name.startsWith('_ga') || name.startsWith('_gid')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '16px 24px',
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <p style={{ flex: 1, minWidth: 280, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.5 }}>
          Używamy Google Analytics do zbierania anonimowych statystyk odwiedzin.
          Nie śledzimy Twoich danych z formularza. Szczegóły w{' '}
          <a href="/polityka-prywatnosci" className="link-u" style={{ color: 'var(--color-accent)' }}>
            polityce prywatności
          </a>.
        </p>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={reject}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-2)',
              cursor: 'pointer',
            }}
          >
            Odrzuć
          </button>
          <button
            onClick={accept}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  );
}
