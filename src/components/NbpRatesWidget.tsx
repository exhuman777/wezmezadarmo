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
    <div style={{
      padding: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          KURSY WALUT · NBP
        </span>
        {data && (
          <span style={{ fontSize: 10, color: 'var(--color-muted-2)', fontFamily: 'var(--font-mono)' }}>
            {data.effectiveDate}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
          {shown.map(r => (
            <div key={r.code} style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--color-bg-2)',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '0.04em' }}>
                  {r.code}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-muted-2)' }}>PLN</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.02em', marginTop: 2, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {r.mid.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="https://api.nbp.pl"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}
      >
        Dane: api.nbp.pl · Tabela A
      </a>
    </div>
  );
}
