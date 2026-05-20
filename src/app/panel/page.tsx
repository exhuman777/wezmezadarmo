'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface UserInfo {
  email: string;
}

const MODULES = [
  {
    href: '/panel/swiadczenia',
    icon: 'S',
    label: 'Świadczenia i ulgi',
    desc: 'Sprawdź na co się kwalifikujesz: zasiłki, ulgi podatkowe, darmowe badania',
    color: 'var(--green-800)',
  },
  {
    href: '/panel/dotacje',
    icon: 'D',
    label: 'Dotacje i dofinansowania',
    desc: 'Monitoring naborów, dopasowanie do profilu firmy, powiadomienia',
    color: 'var(--green-700)',
  },
  {
    href: '/panel/chat',
    icon: 'C',
    label: 'Czat z asystentem AI',
    desc: 'Zadaj pytanie o świadczenia, wnioski, terminy lub przepisy',
    color: 'var(--green-650)',
  },
  {
    href: '/panel/aktualnosci',
    icon: 'A',
    label: 'Aktualności',
    desc: 'Zmiany w prawie, nowe programy, ważne terminy z RSS',
    color: 'var(--green-600)',
  },
  {
    href: '/panel/wnioski',
    icon: 'W',
    label: 'Wnioski',
    desc: 'Wypełnianie formularzy ZUS z pomocą AI i eksport do PDF',
    color: 'var(--green-550)',
  },
  {
    href: '/panel/powiadomienia',
    icon: 'N',
    label: 'Powiadomienia',
    desc: 'Ustawienia dziennego digestu e-mail i kategorii',
    color: 'var(--green-500)',
  },
];

export default function PanelDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/logowanie');
        return;
      }
      setUser({ email: data.session.user.email ?? '' });
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 24, margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: 300, height: 16, margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="eyebrow green" style={{ marginBottom: 12 }}>Panel</div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: 8 }}>
          Witaj w panelu
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-500)' }}>
          {user?.email}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
        gap: 16,
      }}>
        {MODULES.map(({ href, icon, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            className="card card-hover"
            style={{
              display: 'block',
              textDecoration: 'none',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <span style={{
                width: 40, height: 40, borderRadius: 'var(--r-sm)',
                background: color,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 15, fontWeight: 600,
                flexShrink: 0,
              }}>
                {icon}
              </span>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: 'var(--ink-900)',
                letterSpacing: '-0.01em',
              }}>
                {label}
              </div>
            </div>
            <p style={{
              fontSize: 13, color: 'var(--ink-500)',
              lineHeight: 1.5,
            }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 32, padding: '20px 24px',
        background: 'var(--green-50)',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--green-200)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="var(--green-200)" />
            <path d="M10 6v4m0 3h.01" stroke="var(--green-800)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: 'var(--green-900)', lineHeight: 1.5 }}>
            Uzupełnij{' '}
            <Link href="/panel/profil" style={{ color: 'var(--green-700)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              swój profil
            </Link>
            {' '}aby agent AI mógł lepiej dopasować świadczenia i dotacje do Twojej sytuacji.
          </p>
        </div>
      </div>
    </div>
  );
}
