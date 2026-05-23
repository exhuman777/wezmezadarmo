'use client';

import { useEffect, useState } from 'react';

interface SourceStatus {
  source_id: string;
  runs_7d: number;
  ok_7d: number;
  success_rate: number;
  last_run: string | null;
  last_status: string | null;
  last_count: number | null;
  last_source: string | null;
  last_error: string | null;
  cached_items: number;
  newest_cached: string | null;
  oldest_cached: string | null;
}

interface RunRow {
  run_id: string;
  started: string;
  sources: number;
  ok: number;
  total_items: number;
  total_duration_ms: number;
}

interface StatusResponse {
  sources: SourceStatus[];
  recent_runs: RunRow[];
  total_cached: number;
  window_days: number;
  generated_at: string;
}

function statusColor(rate: number) {
  if (rate >= 80) return { bg: 'rgba(34,160,107,0.12)', fg: '#22A06B', label: 'OK' };
  if (rate >= 50) return { bg: 'rgba(220,150,40,0.12)', fg: '#c4841a', label: 'WARN' };
  return { bg: 'rgba(220,80,80,0.1)', fg: '#dc5050', label: 'FAIL' };
}

function fmtAgo(iso: string | null) {
  if (!iso) return '-';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `${min} min temu`;
  if (min < 60 * 24) return `${Math.floor(min / 60)} h temu`;
  return `${Math.floor(min / 60 / 24)} dni temu`;
}

export default function RssAdminPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/rss-status').then(async res => {
      if (!res.ok) {
        const text = await res.text();
        setError(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        setLoading(false);
        return;
      }
      setData(await res.json());
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie...</div>;
  if (error) return <div style={{ padding: 40, color: '#dc5050', fontSize: 13 }}>Błąd: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        Admin / RSS
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-1)' }}>
        Status RSS cron
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>
        Ostatnie {data.window_days} dni · {data.total_cached} artykułów w cache · refresh: {new Date(data.generated_at).toLocaleTimeString('pl-PL')}
      </p>

      {/* Source status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 10, marginBottom: 32 }}>
        {data.sources.map(s => {
          const c = statusColor(s.success_rate);
          return (
            <div key={s.source_id} style={{
              padding: '16px 18px', borderRadius: 12,
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderLeft: `3px solid ${c.fg}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {s.source_id}
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.fg, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {c.label} {s.success_rate}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div>Runy: <strong>{s.ok_7d}/{s.runs_7d}</strong></div>
                <div>Cache: <strong>{s.cached_items}</strong></div>
                <div>Ost. run: <strong>{fmtAgo(s.last_run)}</strong></div>
                <div>Najnowsze: <strong>{fmtAgo(s.newest_cached)}</strong></div>
              </div>
              {s.last_status && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                  Ost: {s.last_status} · {s.last_source ?? '-'} · {s.last_count ?? 0} items
                </div>
              )}
              {s.last_error && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#dc5050', wordBreak: 'break-word' }}>
                  {s.last_error.slice(0, 200)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent runs */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-1)' }}>Ostatnie runy</h2>
      <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kiedy</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Run ID</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OK</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</th>
              <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Czas</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_runs.map(r => (
              <tr key={r.run_id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px 14px', color: 'var(--color-text-2)' }}>
                  {new Date(r.started).toLocaleString('pl-PL')}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)' }}>
                  {r.run_id.slice(0, 8)}...
                </td>
                <td style={{ padding: '10px 14px', color: r.ok === r.sources ? '#22A06B' : r.ok > 0 ? '#c4841a' : '#dc5050', fontWeight: 600 }}>
                  {r.ok}/{r.sources}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--color-text-1)' }}>{r.total_items}</td>
                <td style={{ padding: '10px 14px', color: 'var(--color-text-3)' }}>{(r.total_duration_ms / 1000).toFixed(1)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-3)' }}>
        Cron: 2x dziennie (~10:00 i ~15:00 PL). Failed/empty są normalne dla pojedynczych źródeł -- pipeline ma fallback Firecrawl, ale niektóre strony zmieniają strukturę DOM.
      </p>
    </div>
  );
}
