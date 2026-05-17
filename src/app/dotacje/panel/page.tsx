import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { matchPrograms } from '@/lib/dotacje/programMatcher';
import type { EligibilityFlag } from '@/data/programs-b2b';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel -- Dotacje dla firm | wezmezadarmo',
};

const STATUS_LABEL: Record<string, string> = {
  trial: 'Okres próbny',
  active: 'Aktywna',
  inactive: 'Nieaktywna',
};

const STATUS_COLOR: Record<string, string> = {
  trial: 'var(--color-accent)',
  active: '#4ade80',
  inactive: 'var(--color-text-3)',
};

export default async function PanelPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/dotacje/logowanie');
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const { data: profile } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const matchedCount = profile
    ? matchPrograms(
        Object.entries(profile.flags as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k as EligibilityFlag),
        profile.voivodeship,
        profile.size,
      ).length
    : 0;

  const trialEnds = user?.trial_ends_at
    ? new Date(user.trial_ends_at).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const quickActions = [
    {
      href: '/dotacje/panel/agent',
      label: 'Czat z agentem',
      desc: 'Zadaj pytanie o dotacje dla Twojej firmy',
      icon: '>>',
    },
    {
      href: '/dotacje/panel/monitoring',
      label: 'Monitoring',
      desc: 'Zarządzaj kategoriami powiadomień',
      icon: '[]',
    },
    {
      href: '/dotacje/panel/subskrypcja',
      label: 'Subskrypcja',
      desc: user?.subscription_status === 'active' ? 'Zarządzaj subskrypcją' : 'Aktywuj pełen dostęp',
      icon: '$',
    },
  ] as const;

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Panel firmy
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--color-text-1)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {profile?.name ?? session.user.email}
          </h1>
          {profile?.nip && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-text-3)',
                marginTop: '4px',
              }}
            >
              NIP: {profile.nip}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {user?.subscription_status && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: STATUS_COLOR[user.subscription_status] ?? 'var(--color-text-3)',
                border: `1px solid ${STATUS_COLOR[user.subscription_status] ?? 'var(--color-border)'}`,
                borderRadius: '3px',
                padding: '3px 8px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {STATUS_LABEL[user.subscription_status] ?? user.subscription_status}
            </span>
          )}
          {user?.subscription_status === 'trial' && trialEnds && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-3)',
              }}
            >
              Próba do: {trialEnds}
            </p>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            Dopasowane programy
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              lineHeight: 1,
            }}
          >
            {matchedCount}
          </p>
        </div>
        {profile && (
          <>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                }}
              >
                Województwo
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-1)',
                }}
              >
                {profile.voivodeship}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                }}
              >
                Wielkość firmy
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-1)',
                }}
              >
                {profile.size}
              </p>
            </div>
          </>
        )}
      </div>

      {/* No profile warning */}
      {!profile && (
        <div
          style={{
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-accent)',
            borderRadius: '6px',
            padding: '20px 24px',
            marginBottom: '32px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Profil firmy nie jest skonfigurowany
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-text-2)',
              marginBottom: '14px',
            }}
          >
            Aby dopasować programy dotacyjne, uzupełnij profil swojej firmy.
          </p>
          <Link
            href="/dotacje/rejestracja"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-bg-0)',
              background: 'var(--color-accent)',
              padding: '7px 14px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Uzupełnij profil
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        Szybkie działania
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            style={{
              display: 'block',
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '20px',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  minWidth: '20px',
                }}
              >
                {action.icon}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-1)',
                }}
              >
                {action.label}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--color-text-3)',
                lineHeight: 1.5,
                margin: 0,
                paddingLeft: '30px',
              }}
            >
              {action.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
          marginTop: '48px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '16px',
        }}
      >
        Zalogowany jako: {session.user.email}
      </p>
    </div>
  );
}
