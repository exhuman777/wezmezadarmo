'use client';

import { useEffect, useState } from 'react';

interface Act {
  eli: string;
  title: string;
  type: string;
  publisher: string;
  announcedAt: string;
  eliUrl: string;
}

export function EliChangesWidget() {
  const [data, setData] = useState<Act[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/eli-sejm')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { if (!cancelled) { setData(json.acts ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <div style={{
      padding: 16, background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          ZMIANY W PRAWIE · ELI/Sejm
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(data ?? []).slice(0, 5).map(a => (
            <a key={a.eli} href={a.eliUrl} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                textDecoration: 'none', color: 'var(--color-text-1)',
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted-2)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                {a.type} · {a.announcedAt}
              </div>
            </a>
          ))}
        </div>
      )}

      <a href="/centrum-obywatela/prawo" style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}>
        Wszystkie zmiany: /centrum-obywatela/prawo
      </a>
    </div>
  );
}
