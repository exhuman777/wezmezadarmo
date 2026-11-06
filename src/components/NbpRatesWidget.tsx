'use client';

import { useEffect, useState } from 'react';

interface Rate {
  code: string;
  currency: string;
  mid: number;
}

interface RatesResponse {
  effectiveDate: string;
  rates: Rate[];
}

const SHOWN_CODES = ['EUR', 'USD', 'CHF', 'GBP'];

export function NbpRatesWidget() {
  const [data, setData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/nbp')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && !data) return null;

  const shown = data?.rates.filter(r => SHOWN_CODES.includes(r.code)) ?? [];

  return (
    <section className="wid" aria-label="Kursy walut NBP">
      <p className="wid-glowa"><span>Kursy walut · NBP</span>{data && <span>{data.effectiveDate}</span>}</p>
      {loading ? (
        <p className="wid-mala">Ładowanie...</p>
      ) : (
        <ul className="wid-lista">
          {shown.map(r => (
            <li key={r.code}>
              <span className="wid-nazwa">{r.code}</span>
              <span className="wid-liczba">{r.mid.toFixed(4)} PLN</span>
            </li>
          ))}
        </ul>
      )}
      <a className="wid-zrodlo" href="https://api.nbp.pl" target="_blank" rel="noopener noreferrer">Dane: api.nbp.pl, Tabela A</a>
    </section>
  );
}
