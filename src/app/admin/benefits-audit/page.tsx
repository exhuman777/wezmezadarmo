import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin: Audyt zrodel swiadczen | wezmezadarmo',
  robots: { index: false, follow: false },
};

interface AuditRow {
  benefit_id: string;
  benefit_name: string;
  category: string;
  url: string;
  last_status: number | null;
  last_status_text: string | null;
  last_checked_at: string | null;
  last_changed_at: string | null;
  last_change_pct: number | null;
  needs_review: boolean;
  consecutive_errors: number;
}

async function requireAuth(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) notFound();
  const h = await headers();
  const auth = h.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) notFound();
  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const [, pass] = decoded.split(':');
    if (pass !== password) notFound();
  } catch {
    notFound();
  }
}

async function fetchAudit(): Promise<{ rows: AuditRow[]; stats: Record<string, number> }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { rows: [], stats: {} };

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('benefits_url_audit')
    .select('*')
    .order('needs_review', { ascending: false })
    .order('last_status_text', { ascending: true })
    .order('benefit_name', { ascending: true });

  const rows = (data ?? []) as AuditRow[];
  const stats = {
    total: rows.length,
    ok: rows.filter(r => r.last_status_text === 'OK').length,
    needsReview: rows.filter(r => r.needs_review).length,
    notFound: rows.filter(r => r.last_status_text === 'NOT_FOUND').length,
    changed: rows.filter(r => r.last_status_text === 'CHANGED').length,
    redirect: rows.filter(r => r.last_status_text === 'REDIRECT').length,
    timeout: rows.filter(r => r.last_status_text === 'TIMEOUT').length,
    blocked: rows.filter(r => r.last_status_text === 'BLOCKED').length,
    never: 0, // wypelnimy ponizej
  };

  return { rows, stats };
}

const STATUS_TONES: Record<string, { bg: string; fg: string; label: string }> = {
  OK: { bg: '#d4ecc8', fg: '#1e4d1c', label: 'OK' },
  NEW: { bg: '#e0e7ff', fg: '#1e3a8a', label: 'Nowy' },
  CHANGED: { bg: '#fff4e0', fg: '#a05a1a', label: 'Zmiana' },
  REDIRECT: { bg: '#fff4e0', fg: '#a05a1a', label: 'Redirect' },
  NOT_FOUND: { bg: '#fce4e6', fg: '#8b1f24', label: '404' },
  TIMEOUT: { bg: '#f0f0ec', fg: '#6b7a72', label: 'Timeout' },
  BLOCKED: { bg: '#f0f0ec', fg: '#6b7a72', label: 'Blocked' },
};

export default async function BenefitsAuditPage() {
  await requireAuth();
  const { rows, stats } = await fetchAudit();

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
          Audyt zrodel swiadczen
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-2)', margin: 0 }}>
          Cotygodniowy automatyczny audit 133 zrodloUrl. Cron: poniedzialek 4:00 UTC. Alerty na <code>sobkowicz.kamil@gmail.com</code>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Stat label="Razem" value={String(stats.total ?? 0)} />
        <Stat label="OK" value={String(stats.ok ?? 0)} color="#22A06B" />
        <Stat label="Wymaga sprawdzenia" value={String(stats.needsReview ?? 0)} color="#c0392b" />
        <Stat label="404" value={String(stats.notFound ?? 0)} color="#c0392b" />
        <Stat label="Zmiana tresci" value={String(stats.changed ?? 0)} color="#a05a1a" />
        <Stat label="Redirect" value={String(stats.redirect ?? 0)} color="#a05a1a" />
        <Stat label="Timeout" value={String(stats.timeout ?? 0)} color="#6b7a72" />
        <Stat label="Blocked" value={String(stats.blocked ?? 0)} color="#6b7a72" />
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href={`/api/cron/benefits-audit?secret=${process.env.CRON_SECRET ?? ''}`} style={{
          padding: '10px 18px', background: 'var(--color-text-1)', color: 'var(--color-bg-0)',
          borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
        }}>
          Uruchom audyt teraz
        </Link>
        <Link href="/admin/newsletter" style={{
          padding: '10px 18px', background: 'transparent', color: 'var(--color-text-1)',
          border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
        }}>
          Newsletter admin →
        </Link>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-2)' }}>
              <Th>Świadczenie</Th>
              <Th>Kategoria</Th>
              <Th>Status</Th>
              <Th>HTTP</Th>
              <Th>URL</Th>
              <Th>Sprawdzony</Th>
              <Th>Zmiana</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>
                    Brak danych audytu. Uruchom &quot;Audyt teraz&quot; lub poczekaj na cron (poniedzialek 4:00 UTC).
                  </div>
                </Td>
              </tr>
            )}
            {rows.map(r => {
              const tone = STATUS_TONES[r.last_status_text ?? 'OK'] ?? STATUS_TONES.OK;
              return (
                <tr key={r.benefit_id} style={{
                  borderTop: '1px solid var(--color-border)',
                  background: r.needs_review ? 'rgba(255,176,32,0.04)' : undefined,
                }}>
                  <Td>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>{r.benefit_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>{r.benefit_id}</div>
                  </Td>
                  <Td><code style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.category}</code></Td>
                  <Td>
                    <span style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: tone.bg, color: tone.fg,
                      fontSize: 11, fontWeight: 600,
                    }}>{tone.label}</span>
                    {r.consecutive_errors > 0 && (
                      <span style={{ fontSize: 10, color: '#c0392b', marginLeft: 6 }} title={`${r.consecutive_errors} bledow z rzedu`}>
                        {r.consecutive_errors} blad{r.consecutive_errors > 1 ? 'y' : ''}
                      </span>
                    )}
                  </Td>
                  <Td><code style={{ fontSize: 11 }}>{!r.last_status ? '-' : r.last_status}</code></Td>
                  <Td>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-block', maxWidth: 360,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
                    }}>{r.url}</a>
                  </Td>
                  <Td>{formatDate(r.last_checked_at)}</Td>
                  <Td>{r.last_changed_at ? formatDate(r.last_changed_at) : '-'}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 4, letterSpacing: '-0.005em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? 'var(--color-text-1)' }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return <td colSpan={colSpan} style={{ padding: '10px 14px', color: 'var(--color-text-2)', verticalAlign: 'middle' }}>{children}</td>;
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
