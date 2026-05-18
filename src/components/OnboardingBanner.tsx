'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OnboardingBannerProps {
  profileType: 'jdg' | 'private';
}

const STEPS_PRIVATE = [
  { label: 'Sprawdź jakie świadczenia Ci przysługują', href: '/agent/panel/swiadczenia' },
  { label: 'Skonfiguruj dzienny raport e-mail', href: '/agent/panel/powiadomienia' },
  { label: 'Przeglądaj aktualne zmiany prawne', href: '/agent/panel/aktualnosci' },
];

const STEPS_JDG = [
  { label: 'Sprawdź dostępne dofinansowania dla Twojej firmy', href: '/agent/panel/aktualnosci' },
  { label: 'Skonfiguruj dzienny raport o dotacjach', href: '/agent/panel/powiadomienia' },
  { label: 'Śledź zmiany przepisów podatkowych', href: '/agent/panel/aktualnosci' },
];

export default function OnboardingBanner({ profileType }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('agent_onboarding_dismissed') === '1';
  });

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem('agent_onboarding_dismissed', '1');
    setDismissed(true);
  }

  const steps = profileType === 'jdg' ? STEPS_JDG : STEPS_PRIVATE;

  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-sm)',
      padding: '20px 24px',
      marginBottom: 24,
      background: 'var(--color-bg-1)',
    }}>
      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          fontSize: 11,
          color: 'var(--color-text-3)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Zamknij
      </button>

      <div style={{
        fontSize: 16,
        fontWeight: 500,
        fontFamily: 'var(--font-mono)',
        marginBottom: 12,
        color: 'var(--color-text-1)',
      }}>
        Witaj w Agencie AI
      </div>

      <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, i) => (
          <li key={i} style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
            <Link href={step.href} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
              {step.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
