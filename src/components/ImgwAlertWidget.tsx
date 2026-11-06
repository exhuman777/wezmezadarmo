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
    <section className="wid" aria-label="Ostrzeżenia RCB">
      <p className="wid-glowa"><span>Ostrzeżenia · RCB</span><span>{data?.length ?? 0} aktywnych</span></p>
      {loading ? (
        <p className="wid-mala">Ładowanie...</p>
      ) : (
        <ul className="wid-lista">
          {(data ?? []).slice(0, 3).map(w => (
            <li key={w.link}>
              <a href={w.link} target="_blank" rel="noopener noreferrer" className="wid-link">
                {w.title}
                {w.pubDate && (
                  <small>{new Date(w.pubDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</small>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
      <a className="wid-zrodlo" href="/centrum-obywatela/pogoda">Wszystkie ostrzeżenia</a>
    </section>
  );
}
