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
    <div className="ciastka" role="region" aria-label="Pliki cookie">
      <div className="ciastka-in">
        {!showDetails ? (
          <>
            <p className="ciastka-tekst">
              Serwis korzysta z plików cookie Google Analytics do zbierania anonimowych statystyk odwiedzin.{' '}
              <button type="button" className="ciastka-link" onClick={() => setShowDetails(true)}>Szczegóły</button>
              {' · '}
              <a href="/polityka-prywatnosci" className="ciastka-link">Polityka prywatności</a>
            </p>
            <div className="ciastka-przyciski">
              <button type="button" className="btn btn-ghost btn-sm" onClick={reject}>Odrzuć</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={accept}>Akceptuję</button>
            </div>
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <p className="pole-etykieta" style={{ margin: 0 }}>Ustawienia cookies</p>
              <button type="button" className="przycisk-ikona" aria-label="Zamknij szczegóły" onClick={() => setShowDetails(false)}>
                <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>&times;</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
              <CookieRow
                title="Niezbędne (techniczne)"
                desc="Wymagane do prawidłowego działania serwisu. Nie mogą być wyłączone."
                locked
              />
              <CookieRow
                title="Analityczne - Google Analytics"
                desc="Anonimowe statystyki odwiedzin: liczba wejść, czas na stronie, typ urządzenia. Dane nie są łączone z formularzem i nie są sprzedawane."
              />
            </div>

            <p className="ciastka-tekst" style={{ margin: '0 0 12px' }}>
              Serwis nie stosuje cookies reklamowych, pikseli śledzących ani fingerprintingu.{' '}
              <a href="/polityka-prywatnosci" className="ciastka-link">Pełna polityka prywatności</a>
            </p>

            <div className="ciastka-przyciski">
              <button type="button" className="btn btn-ghost btn-sm" onClick={reject}>Tylko niezbędne</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={accept}>Akceptuję wszystkie</button>
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
      padding: '10px 0', borderTop: '1px solid var(--linia)',
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--tusz)', margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: 14, color: 'var(--szary)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
      <span style={{ flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: 12, color: locked ? 'var(--szary)' : 'var(--zielen)' }}>
        {locked ? 'Zawsze włączone' : 'Włączone po zgodzie'}
      </span>
    </div>
  );
}
