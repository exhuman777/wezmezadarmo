'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/profile').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const { profile } = await res.json();
      setProfile(profile);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie...</div>;
  if (!profile) return null;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Profil</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Twoje dane</h1>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 24 }}>
        {Object.entries(profile)
          .filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
          .map(([key, value], i) => (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-bg-1)' : 'var(--color-bg-2)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', paddingTop: 2 }}>{key}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-1)' }}>
                {Array.isArray(value) ? (value as unknown[]).join(', ') || '(brak)' : String(value ?? '(brak)')}
              </span>
            </div>
          ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 16 }}>
        Pełny edytor profilu będzie dostępny wkrótce.
      </p>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-text-3)', textDecoration: 'none' }}>&larr; Wróć do panelu</Link>
    </main>
  );
}
