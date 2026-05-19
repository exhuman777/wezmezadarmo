'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FeedItem {
  id: string; title: string; link: string; description: string;
  pubDate: string | null; source: string;
}

export default function AgentAktualnosci() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aktualnosci').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const data = await res.json();
      setItems((data.items ?? []).slice(0, 20));
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie aktualności...</div>;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Aktualności</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Zmiany w prawie i przepisach</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {items.map(item => (
          <div key={item.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-1)' }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', textDecoration: 'none', display: 'block', marginBottom: 4 }}>
              {item.title}
            </a>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-3)' }}>
              <span>{item.source}</span>
              {item.pubDate && <span>{new Date(item.pubDate).toLocaleDateString('pl-PL')}</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
