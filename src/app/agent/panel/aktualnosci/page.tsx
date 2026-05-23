'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  source: string;
  sourceId: string;
  audiences: string[];
}

interface Subscription {
  source_ids: string[];
  audiences: string[];
  keywords: string[];
  active: boolean;
}

const SOURCE_META: Record<string, { name: string; color: string }> = {
  zus:      { name: 'ZUS',         color: '#003874' },
  gus:      { name: 'GUS',         color: '#004B8D' },
  nbp:      { name: 'NBP',         color: '#CC0000' },
  uokik:    { name: 'UOKiK',       color: '#1B5E20' },
  fundusze: { name: 'Fundusze EU', color: '#6A0DAD' },
  ezdrowie: { name: 'e-Zdrowie',   color: '#00695C' },
  sejm:     { name: 'Sejm RP',     color: '#8B0000' },
  arimr:    { name: 'ARiMR',       color: '#4E342E' },
};

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'teraz';
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h temu`;
  if (diff < 86400 * 2) return 'wczoraj';
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

function nextScheduledRun(): string {
  const now = new Date();
  const today10 = new Date(); today10.setHours(10, 0, 0, 0);
  const today15 = new Date(); today15.setHours(15, 0, 0, 0);
  const tomorrow10 = new Date(today10); tomorrow10.setDate(tomorrow10.getDate() + 1);

  let next: Date;
  if (now < today10) next = today10;
  else if (now < today15) next = today15;
  else next = tomorrow10;

  const isToday = next.toDateString() === now.toDateString();
  return `${isToday ? 'dzisiaj' : 'jutro'} ${next.getHours()}:00`;
}

export default function AgentAktualnosci() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string>('');
  const [filterOverride, setFilterOverride] = useState<Set<string> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/aktualnosci'),
      fetch('/api/rss/subscription'),
    ]).then(async ([feedRes, subRes]) => {
      if (feedRes.status === 401) { router.push('/logowanie'); return; }
      const feedData = await feedRes.json();
      setItems(feedData.items ?? []);
      setFetchedAt(feedData.fetchedAt || '');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSub(subData.subscription);
      }
      setLoading(false);
    });
  }, [router]);

  const activeSourceIds = useMemo(() => {
    if (filterOverride !== null) return filterOverride;
    if (sub?.active && sub.source_ids?.length > 0) return new Set(sub.source_ids);
    return new Set(Object.keys(SOURCE_META));
  }, [filterOverride, sub]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (!activeSourceIds.has(item.sourceId)) return false;
      // Audience filter z subskrypcji
      if (sub?.active && sub.audiences?.length > 0 && filterOverride === null) {
        const ok = (item.audiences || []).some(a => sub.audiences.includes(a));
        if (!ok) return false;
      }
      // Keyword filter z subskrypcji
      if (sub?.active && sub.keywords?.length > 0 && filterOverride === null) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        const ok = sub.keywords.some(kw => text.includes(kw.toLowerCase()));
        if (!ok) return false;
      }
      return true;
    });
  }, [items, activeSourceIds, sub, filterOverride]);

  function toggleSource(id: string) {
    setFilterOverride(prev => {
      const base = prev ?? new Set(activeSourceIds);
      const next = new Set(base);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie...</div>;
  }

  const hasSubscription = sub?.active && (sub.source_ids?.length > 0 || sub.audiences?.length > 0 || sub.keywords?.length > 0);
  const allSourcesInData = Array.from(new Set(items.map(i => i.sourceId))).filter(id => SOURCE_META[id]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`
        .akt-card {
          padding: 14px 18px;
          background: var(--color-bg-1);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          transition: transform 150ms, box-shadow 150ms, border-color 150ms;
          text-decoration: none;
          display: block;
        }
        .akt-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          border-color: rgba(34,160,107,0.3);
        }
      `}</style>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        Aktualności
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-1)' }}>
        Twoje aktualności
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 20, lineHeight: 1.6 }}>
        Automatyczna aktualizacja 2x dziennie (~10:00 i ~15:00 PL).
        Ostatnio: {fetchedAt ? new Date(fetchedAt).toLocaleString('pl-PL') : '-'} ·
        Następna: {nextScheduledRun()}
      </p>

      {/* Subscription banner */}
      {!hasSubscription ? (
        <div style={{ padding: '12px 16px', background: 'rgba(34,160,107,0.06)', border: '1px solid rgba(34,160,107,0.2)', borderRadius: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.5 }}>
            Widzisz <strong>wszystkie</strong> aktualności. Możesz wybrać tylko interesujące Cię źródła.
          </div>
          <Link href="/panel/powiadomienia" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Ustaw subskrypcję →
          </Link>
        </div>
      ) : (
        <div style={{ padding: '10px 16px', background: 'rgba(34,160,107,0.05)', border: '1px solid rgba(34,160,107,0.15)', borderRadius: 10, marginBottom: 20, fontSize: 12, color: 'var(--color-text-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>
            Filtruję wg Twojej subskrypcji
            {sub!.source_ids.length > 0 && ` · źródła: ${sub!.source_ids.length}`}
            {sub!.audiences.length > 0 && ` · grupy: ${sub!.audiences.join(', ')}`}
            {sub!.keywords.length > 0 && ` · słowa: ${sub!.keywords.join(', ')}`}
          </span>
          <Link href="/panel/powiadomienia" style={{ fontSize: 12, color: '#22A06B', textDecoration: 'none' }}>
            Edytuj →
          </Link>
        </div>
      )}

      {/* Source toggle pillsy (per-session override) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {allSourcesInData.map(id => {
          const meta = SOURCE_META[id];
          const checked = activeSourceIds.has(id);
          return (
            <button
              key={id}
              onClick={() => toggleSource(id)}
              style={{
                padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontWeight: 500,
                background: checked ? meta.color : 'var(--color-bg-1)',
                color: checked ? '#fff' : 'var(--color-text-3)',
                border: `1px solid ${checked ? meta.color : 'var(--color-border)'}`,
                opacity: checked ? 1 : 0.7,
                transition: 'all 120ms',
              }}
            >
              {meta.name}
            </button>
          );
        })}
        {filterOverride !== null && (
          <button
            onClick={() => setFilterOverride(null)}
            style={{
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 500,
              background: 'transparent', color: 'var(--color-text-3)',
              border: '1px dashed var(--color-border)',
            }}
          >
            Resetuj filtr
          </button>
        )}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--color-text-3)' }}>
          Brak aktualności pasujących do filtra.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.slice(0, 50).map(item => {
            const meta = SOURCE_META[item.sourceId];
            return (
              <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="akt-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 4,
                    background: meta?.color ?? '#666', color: '#fff',
                    fontWeight: 600, letterSpacing: '0.03em',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {item.source}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                    {relativeTime(item.pubDate)}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', lineHeight: 1.4, marginBottom: item.description ? 4 : 0 }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>
                    {item.description.slice(0, 180)}{item.description.length > 180 ? '…' : ''}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
        Dane z oficjalnych źródeł rządowych. Aktualizacja: ZUS i GUS - live; pozostałe - 2x dziennie z cache.
        Subskrypcja w <Link href="/panel/powiadomienia" style={{ color: '#22A06B' }}>powiadomieniach</Link>.
      </div>
    </div>
  );
}
