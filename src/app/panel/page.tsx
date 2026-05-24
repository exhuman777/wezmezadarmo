'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import WelcomeTour from '@/components/WelcomeTour';

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
    tour: 'swiadczenia',
  },
  {
    href: '/panel/dotacje',
    icon: 'D',
    label: 'Dotacje i dofinansowania',
    desc: 'Monitoring naborów, dopasowanie do profilu firmy, powiadomienia',
    color: 'var(--green-700)',
    tour: 'dotacje',
  },
  {
    href: '/panel/chat',
    icon: 'C',
    label: 'Czat z asystentem AI',
    desc: 'Zadaj pytanie o świadczenia, wnioski, terminy lub przepisy',
    color: 'var(--green-650)',
    tour: 'chat',
  },
  {
    href: '/panel/aktualnosci',
    icon: 'A',
    label: 'Aktualności',
    desc: 'Zmiany w prawie, nowe programy, ważne terminy z RSS',
    color: 'var(--green-600)',
    tour: 'aktualnosci',
  },
  {
    href: '/panel/wnioski',
    icon: 'W',
    label: 'Wnioski',
    desc: 'Wypełnianie formularzy ZUS z pomocą AI i eksport do PDF',
    color: 'var(--green-550)',
    tour: undefined,
  },
  {
    href: '/panel/powiadomienia',
    icon: 'N',
    label: 'Powiadomienia',
    desc: 'Ustawienia dziennego digestu e-mail i kategorii',
    color: 'var(--green-500)',
    tour: undefined,
  },
];

export default function PanelDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profileEmpty, setProfileEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/logowanie');
        return;
      }
      setUser({ email: data.session.user.email ?? '' });

      // Sprawdź czy profil agenta jest uzupełniony
      try {
        const res = await fetch('/api/agent/profile');
        if (res.ok) {
          const { profile } = await res.json();
          const isEmpty = !profile?.wiek && !profile?.zatrudnienie && !profile?.nip;
          setProfileEmpty(isEmpty);
        }
      } catch { /* ignoruj */ }

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
      <WelcomeTour />

      {/* Baner dla nowych użytkowników z pustym profilem */}
      {profileEmpty && (
        <div data-tour="profile" style={{
          marginBottom: 28,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(34,160,107,0.1) 0%, rgba(34,160,107,0.05) 100%)',
          border: '1px solid rgba(34,160,107,0.3)',
          borderLeft: '3px solid #22A06B',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-900)', marginBottom: 4 }}>
              Uzupełnij profil, żeby agent AI mógł dopasować wyniki
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
              Wystarczy wiek, forma zatrudnienia i dochód - zajmie to 2 minuty.
            </div>
          </div>
          <Link href="/panel/profil" style={{
            flexShrink: 0, padding: '10px 20px',
            background: '#22A06B', color: '#fff',
            fontSize: 13, fontWeight: 600,
            borderRadius: 'var(--r-sm)', textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(34,160,107,0.3)',
          }}>
            Uzupełnij profil →
          </Link>
        </div>
      )}

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
        {MODULES.map(({ href, icon, label, desc, color, tour }) => (
          <Link
            key={href}
            href={href}
            data-tour={tour}
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
