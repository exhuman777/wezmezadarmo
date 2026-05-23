'use client';

import { useEffect, useState } from 'react';

interface Warning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export function ImgwAlertWidget() {
  const [data, setData] = useState<Warning[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/imgw')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { if (!cancelled) { setData(json.warnings ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <div style={{
      padding: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          OSTRZEŻENIA · RCB
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-muted-2)', fontFamily: 'var(--font-mono)' }}>
          {data?.length ?? 0} aktywnych
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data ?? []).slice(0, 3).map(w => (
            <a key={w.link} href={w.link} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                textDecoration: 'none', color: 'var(--color-text-1)',
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{w.title}</div>
              {w.pubDate && (
                <div style={{ fontSize: 10, color: 'var(--color-muted-2)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                  {new Date(w.pubDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <a href="/centrum-obywatela/pogoda" style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}>
        Wszystkie ostrzeżenia: /centrum-obywatela/pogoda
      </a>
    </div>
  );
}
