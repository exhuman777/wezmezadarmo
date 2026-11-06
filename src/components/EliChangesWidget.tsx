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
    <section className="wid" aria-label="Zmiany w prawie">
      <p className="wid-glowa"><span>Zmiany w prawie · ELI/Sejm</span></p>
      {loading ? (
        <p className="wid-mala">Ładowanie...</p>
      ) : (
        <ul className="wid-lista">
          {(data ?? []).slice(0, 5).map(a => (
            <li key={a.eli}>
              <a href={a.eliUrl} target="_blank" rel="noopener noreferrer" className="wid-link">
                {a.title}
                <small>{a.type} · {a.announcedAt}</small>
              </a>
            </li>
          ))}
        </ul>
      )}
      <a className="wid-zrodlo" href="/centrum-obywatela/prawo">Wszystkie zmiany w prawie</a>
    </section>
  );
}
