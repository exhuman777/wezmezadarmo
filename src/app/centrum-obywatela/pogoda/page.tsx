'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Warning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export default function PogodaPage() {
  const [data, setData] = useState<Warning[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/imgw')
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(json => { setData(json.warnings ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c4841a' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          IMGW / RCB · ostrzeżenia
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Aktywne ostrzeżenia meteo i kryzysowe</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Oficjalne alerty Rządowego Centrum Bezpieczeństwa - opady, burze, mróz, powodzie, smog. Aktualizacja co 15 minut.
        Polecane dla rolników KRUS, alergików, planujących prace polowe lub wyjazdy.
      </p>

      {loading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Ładowanie...</div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13 }}>{error}</div>}

      {data && data.length === 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, color: 'var(--green-900)' }}>
          Brak aktywnych ostrzeżeń. Sytuacja meteorologiczna w normie.
        </div>
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map(w => (
            <a key={w.link} href={w.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: 16, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6, lineHeight: 1.4 }}>{w.title}</div>
              {w.description && (
                <div style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 6, lineHeight: 1.5 }}>{w.description}</div>
              )}
              {w.pubDate && (
                <div style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--f-mono)' }}>
                  {new Date(w.pubDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://rcb.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>rcb.gov.pl/feed</a>
      </p>
    </main>
  );
}
