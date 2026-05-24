import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin: Newsletter | wezmezadarmo',
  robots: { index: false, follow: false },
};

interface Subscriber {
  id: string;
  email: string;
  profile_type: 'private' | 'jdg';
  confirmed: boolean;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

/**
 * Basic Auth check przez header (z .env ADMIN_PASSWORD).
 * Production: rozważ dodatkową warstwę przez middleware lub IP whitelist.
 */
async function checkAuth(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const h = await headers();
  const auth = h.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const [, pass] = decoded.split(':');
    return pass === password;
  } catch {
    return false;
  }
}

async function fetchSubscribers(): Promise<{ all: Subscriber[]; stats: { total: number; confirmed: number; private: number; jdg: number; unsubscribed: number } }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { all: [], stats: { total: 0, confirmed: 0, private: 0, jdg: 0, unsubscribed: 0 } };

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, profile_type, confirmed, confirmed_at, unsubscribed_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const all = (data ?? []) as Subscriber[];
  const active = all.filter(s => !s.unsubscribed_at);
  const stats = {
    total: all.length,
    confirmed: active.filter(s => s.confirmed).length,
    private: active.filter(s => s.profile_type === 'private' && s.confirmed).length,
    jdg: active.filter(s => s.profile_type === 'jdg' && s.confirmed).length,
    unsubscribed: all.filter(s => s.unsubscribed_at).length,
  };

  return { all, stats };
}

export default async function NewsletterAdminPage() {
  const ok = await checkAuth();
  if (!ok) {
    // 401 zwraca next/navigation nie obsluguje bezposrednio -- redirect na 404
    redirect('/api/admin/auth-required');
  }

  const { all, stats } = await fetchSubscribers();

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>
          Newsletter -- subskrybenci
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
        <Stat label="Łącznie zapisów" value={String(stats.total)} />
        <Stat label="Potwierdzone (aktywne)" value={String(stats.confirmed)} color="#22A06B" />
        <Stat label="Prywatne" value={String(stats.private)} />
        <Stat label="JDG/Firma" value={String(stats.jdg)} />
        <Stat label="Wypisani" value={String(stats.unsubscribed)} color="#c0392b" />
      </div>

      {/* Eksport CSV */}
      <div style={{ marginBottom: 24 }}>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(all))}`}
          download={`newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`}
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'var(--color-text-1)',
            color: 'var(--color-bg-0)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Eksport CSV ({all.length})
        </a>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-2)' }}>
              <Th>Email</Th>
              <Th>Typ</Th>
              <Th>Status</Th>
              <Th>Zapisany</Th>
              <Th>Potwierdzony</Th>
              <Th>Wypisany</Th>
            </tr>
          </thead>
          <tbody>
            {all.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <Td><code style={{ fontSize: 12 }}>{s.email}</code></Td>
                <Td>{s.profile_type === 'jdg' ? 'JDG' : 'Prywatny'}</Td>
                <Td>
                  {s.unsubscribed_at ? (
                    <Pill tone="red">Wypisany</Pill>
                  ) : s.confirmed ? (
                    <Pill tone="green">Aktywny</Pill>
                  ) : (
                    <Pill tone="amber">Niepotwierdzony</Pill>
                  )}
                </Td>
                <Td>{formatDate(s.created_at)}</Td>
                <Td>{s.confirmed_at ? formatDate(s.confirmed_at) : '-'}</Td>
                <Td>{s.unsubscribed_at ? formatDate(s.unsubscribed_at) : '-'}</Td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>
                    Brak subskrybentów. Pierwszy zapis pojawi się tutaj po wypełnieniu formularza w stopce strony.
                  </div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? 'var(--color-text-1)' }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return <td colSpan={colSpan} style={{ padding: '10px 16px', color: 'var(--color-text-2)', verticalAlign: 'middle' }}>{children}</td>;
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'green' | 'amber' | 'red' }) {
  const colors = {
    green: { bg: '#d4ecc8', fg: '#1e4d1c' },
    amber: { bg: '#fff4e0', fg: '#a05a1a' },
    red: { bg: '#fce4e6', fg: '#8b1f24' },
  };
  const c = colors[tone];
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function toCsv(subs: Subscriber[]): string {
  const headers = ['email', 'profile_type', 'confirmed', 'confirmed_at', 'unsubscribed_at', 'created_at'];
  const rows = subs.map(s => [
    s.email,
    s.profile_type,
    String(s.confirmed),
    s.confirmed_at ?? '',
    s.unsubscribed_at ?? '',
    s.created_at,
  ].map(v => `"${v.replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}
