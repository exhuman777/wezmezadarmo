'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Rate { code: string; currency: string; mid: number }
interface NbpResponse { effectiveDate: string; rates: Rate[] }

const POPULAR = ['EUR', 'USD', 'GBP', 'CHF', 'CZK', 'NOK', 'SEK', 'JPY'];

export default function KursyPage() {
  const [data, setData] = useState<NbpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('EUR');

  useEffect(() => {
    fetch('/api/public/nbp').then(async res => {
      if (!res.ok) { setError(`Błąd API: ${res.status}`); return; }
      setData(await res.json());
    }).catch(e => setError(e.message));
  }, []);

  const popularRates = data?.rates.filter(r => POPULAR.includes(r.code)) ?? [];
  const filtered = search
    ? data?.rates.filter(r => r.code.includes(search.toUpperCase()) || r.currency.toLowerCase().includes(search.toLowerCase())) ?? []
    : data?.rates ?? [];

  const fromRate = data?.rates.find(r => r.code === from.toUpperCase());
  const result = fromRate && Number(amount) > 0 ? (Number(amount) * fromRate.mid).toFixed(2) : null;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC0000' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          NBP · Kursy walut
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Kursy średnie NBP</h1>
      {data && <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24 }}>Tabela A, kurs z dnia {data.effectiveDate}</p>}
      {error && <p style={{ color: '#dc5050' }}>{error}</p>}

      {/* Konwerter */}
      <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 10 }}>
          Przelicznik na PLN
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number" min="0" step="0.01" value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: 130, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15 }}
          />
          <select
            value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15, background: 'var(--white)' }}
          >
            {(data?.rates ?? []).map(r => (
              <option key={r.code} value={r.code}>{r.code} - {r.currency}</option>
            ))}
          </select>
          <span style={{ fontSize: 16, color: 'var(--ink-500)' }}>=</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22A06B', fontFamily: 'var(--f-mono)' }}>
            {result ? `${result} PLN` : '—'}
          </div>
        </div>
      </div>

      {/* Popularne */}
      {popularRates.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 10 }}>
            Popularne
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {popularRates.map(r => (
              <div key={r.code} style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-400)', marginBottom: 4 }}>{r.code}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-900)' }}>{r.mid.toFixed(4)}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>{r.currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wyszukiwarka pełna */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text" placeholder="Szukaj waluty... (np. EUR, dolar, korona)"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 14 }}
        />
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Kod</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Waluta</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Kurs (PLN)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.code} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--ink-900)' }}>{r.code}</td>
                <td style={{ padding: '10px 14px', color: 'var(--ink-600)' }}>{r.currency}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--ink-900)' }}>{r.mid.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://api.nbp.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>api.nbp.pl</a> · Tabela A. Cache 1h.
      </p>
    </main>
  );
}
