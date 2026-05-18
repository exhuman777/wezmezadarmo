'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  type: 'jdg' | 'private';
  company_name?: string;
  nip?: string;
  wiek?: number;
  plec?: string;
}

interface Prefs {
  digest_enabled: boolean;
  last_digest_sent_at: string | null;
}

const QUICK_LINKS = [
  { href: '/agent/panel/swiadczenia', label: 'Świadczenia i ulgi', desc: 'Co Ci przysługuje' },
  { href: '/agent/panel/aktualnosci', label: 'Aktualności', desc: 'Zmiany w prawie' },
  { href: '/agent/panel/powiadomienia', label: 'Powiadomienia', desc: 'Ustawienia e-mail' },
  { href: '/agent/panel/profil', label: 'Profil', desc: 'Edytuj dane' },
];

export default function AgentPanel() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, prefsRes] = await Promise.all([
        fetch('/api/agent/profile'),
        fetch('/api/digest/preferences'),
      ]);

      if (profileRes.status === 401) {
        router.push('/agent/logowanie');
        return;
      }
      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.profile);
      }
      if (prefsRes.ok) {
        const d = await prefsRes.json();
        setPrefs(d.prefs);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie...</div>;
  }

  const name = profile?.type === 'jdg' ? profile.company_name : undefined;
  const lastDigest = prefs?.last_digest_sent_at
    ? new Date(prefs.last_digest_sent_at).toLocaleDateString('pl-PL')
    : null;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Panel agenta
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
          {name ? `Witaj, ${name}` : 'Twój agent AI'}
        </h1>
        {prefs?.digest_enabled && (
          <p style={{ fontSize: 13, color: 'var(--color-text-3)' }}>
            Digest e-mail: aktywny{lastDigest ? ` -- ostatni ${lastDigest}` : ' -- jeszcze nie wysłany'}
          </p>
        )}
        {!prefs?.digest_enabled && (
          <p style={{ fontSize: 13, color: 'var(--color-accent)' }}>
            Digest e-mail jest wyłączony.{' '}
            <Link href="/agent/panel/powiadomienia" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Włącz</Link>
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {QUICK_LINKS.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{
            display: 'block', textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '20px',
            background: 'var(--color-bg-1)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
