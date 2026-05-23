'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Act {
  eli: string;
  title: string;
  type: string;
  publisher: string;
  announcedAt: string;
  eliUrl: string;
}

export default function PrawoPage() {
  const [data, setData] = useState<Act[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  async function load(query?: string) {
    setLoading(true); setError(null);
    try {
      const url = query ? `/api/public/eli-sejm?q=${encodeURIComponent(query)}` : '/api/public/eli-sejm';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.acts ?? []);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#003874' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          ELI / Sejm · zmiany w prawie
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Ostatnie zmiany w przepisach o świadczeniach</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 20, lineHeight: 1.6 }}>
        Akty prawne z Dziennika Ustaw filtrowane po słowach: świadczenie, zasiłek, ulga, dodatek, emerytura, ZUS, KRUS, refundacja.
        Aktualizacja co 30 minut. Wpisz własne słowo kluczowe aby zawęzić.
      </p>

      <form onSubmit={e => { e.preventDefault(); load(q.trim() || undefined); }}
        style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Słowo kluczowe (np. KRUS, emerytura)"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15 }} />
        <button type="submit" className="btn btn-primary">Szukaj</button>
      </form>

      {loading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Ładowanie...</div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13 }}>{error}</div>}
      {data && data.length === 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, color: 'var(--green-900)' }}>
          Brak zmian pasujących do zapytania.
        </div>
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map(a => (
            <a key={a.eli} href={a.eliUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4, lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>
                {a.type} · {a.publisher} · {a.announcedAt} · ELI: {a.eli}
              </div>
            </a>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://api.sejm.gov.pl/eli" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>api.sejm.gov.pl/eli</a>
      </p>
    </main>
  );
}
