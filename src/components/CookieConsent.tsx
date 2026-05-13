'use client';

import { useState, useEffect } from 'react';

const COOKIE_KEY = 'wzd_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function grantAnalytics() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  function denyAnalytics() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-57R2TFXNH7';
    w[`ga-disable-${gaId}`] = true;
    document.cookie.split(';').forEach(c => {
      const name = c.trim().split('=')[0];
      if (name.startsWith('_ga') || name.startsWith('_gid')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  }

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    grantAnalytics();
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    denyAnalytics();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '16px 24px',
      }}>
        {!showDetails ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ flex: 1, minWidth: 260, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
              Serwis korzysta z plików cookie Google Analytics do zbierania anonimowych statystyk odwiedzin.{' '}
              <button
                onClick={() => setShowDetails(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Szczegoly
              </button>
              {' '}|{' '}
              <a href="/polityka-prywatnosci" style={{ color: 'var(--color-accent)', fontSize: 13, textDecoration: 'underline' }}>
                Polityka prywatnosci
              </a>
            </p>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={reject}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 500,
                  borderRadius: 10, border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-2)', cursor: 'pointer',
                }}
              >
                Odrzuc
              </button>
              <button
                onClick={accept}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 500,
                  borderRadius: 10, border: 'none',
                  background: 'var(--color-text-1)', color: 'var(--color-bg-0)', cursor: 'pointer',
                }}
              >
                Akceptuje
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', margin: 0 }}>Ustawienia cookies</p>
              <button
                onClick={() => setShowDetails(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <CookieRow
                title="Niezbedne (techniczne)"
                desc="Wymagane do prawidlowego dzialania serwisu. Nie moga byc wylaczone."
                locked
              />
              <CookieRow
                title="Analityczne -- Google Analytics"
                desc="Anonimowe statystyki odwiedzin: liczba wejsc, czas na stronie, typ urzadzenia. Dane nie sa laczone z formularzem i nie sa sprzedawane."
              />
            </div>

            <p style={{ fontSize: 11, color: 'var(--color-text-3)', margin: '0 0 12px' }}>
              Serwis nie stosuje cookies reklamowych, piksel sledzacych ani fingerprintingu.{' '}
              <a href="/polityka-prywatnosci" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
                Pelna polityka prywatnosci
              </a>
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={reject}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 500,
                  borderRadius: 10, border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-2)', cursor: 'pointer',
                }}
              >
                Tylko niezbedne
              </button>
              <button
                onClick={accept}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 500,
                  borderRadius: 10, border: 'none',
                  background: 'var(--color-text-1)', color: 'var(--color-bg-0)', cursor: 'pointer',
                }}
              >
                Akceptuje wszystkie
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CookieRow({ title, desc, locked }: { title: string; desc: string; locked?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
      padding: '10px 14px', borderRadius: 10,
      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-3)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        {locked ? (
          <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Zawsze wlaczone</span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 500 }}>Wlaczone po zgodzie</span>
        )}
      </div>
    </div>
  );
}
