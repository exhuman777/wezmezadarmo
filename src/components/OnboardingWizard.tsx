'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';

interface Props {
  profileType: 'jdg' | 'private';
  isPanel?: boolean; // true = /panel/*, false = /agent/panel/*
}

const STORAGE_KEY = 'wzd_panel_onboarding_v1';

interface Step {
  num: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

const STEPS_PRIVATE: Step[] = [
  {
    num: '01',
    title: 'Witaj w swoim panelu',
    body: 'Personalny asystent AI dla osób prywatnych. Bezpłatny, bez ograniczeń. Pokażę Ci 3 najważniejsze funkcje w 30 sekund.',
  },
  {
    num: '02',
    title: 'Świadczenia dopasowane do Ciebie',
    body: 'Na podstawie Twojego profilu (wiek, dochód, sytuacja) AI dopasowuje świadczenia z bazy 133 programów. Przy każdym - kwota, kroki wnioskowania, źródło prawne.',
    cta: { label: 'Zobacz świadczenia', href: '/panel/swiadczenia' },
  },
  {
    num: '03',
    title: 'Dzienny digest e-mail',
    body: 'Włącz powiadomienia by codziennie rano dostawać krótki raport: nowe świadczenia, zmiany w prawie, otwarte nabory. Wszystko dopasowane do profilu.',
    cta: { label: 'Skonfiguruj powiadomienia', href: '/panel/powiadomienia' },
  },
  {
    num: '04',
    title: 'AI chat zna Twoją sytuację',
    body: 'Zapytaj asystenta o cokolwiek - wnioski, refundacje, ulgi, terminy. AI ma kontekst Twojego profilu, nie musisz powtarzać. Live dane z NFZ, NBP, GIOŚ, Sejmu.',
    cta: { label: 'Otwórz chat', href: '/panel/chat' },
  },
];

const STEPS_JDG: Step[] = [
  {
    num: '01',
    title: 'Witaj w panelu dla JDG',
    body: 'Personalny asystent AI dla jednoosobowych działalności. Bezpłatny. Pokażę Ci 3 najważniejsze funkcje w 30 sekund.',
  },
  {
    num: '02',
    title: 'Dotacje dopasowane do firmy',
    body: 'AI sprawdza otwarte nabory KFS, PUP, PFRON, KPO, PARP, NCBiR i programy regionalne. Filtr po NIP, PKD, województwie i wielkości firmy.',
    cta: { label: 'Zobacz dotacje', href: '/panel/dotacje' },
  },
  {
    num: '03',
    title: 'Aktualności + zmiany w prawie',
    body: 'RSS z 8 instytucji + ELI/Sejm (zmiany w przepisach). Wszystko filtrowane pod profil JDG. Włącz digest e-mail by dostawać raport codziennie.',
    cta: { label: 'Aktualności', href: '/panel/aktualnosci' },
  },
  {
    num: '04',
    title: 'AI chat zna kontekst Twojej firmy',
    body: 'Zapytaj o KSeF, biała lista VAT, CEIDG, terminy ZUS, faktury zagraniczne. AI ma profil firmy + live dane z polskich API.',
    cta: { label: 'Otwórz chat', href: '/panel/chat' },
  },
];

export function OnboardingWizard({ profileType, isPanel = false }: Props) {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'completed') return;
    if (localStorage.getItem(STORAGE_KEY) === 'skipped') return;
    // Mała pauza by user zobaczył panel zanim wyskoczy wizard
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  function close(reason: 'completed' | 'skipped') {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, reason);
    setOpen(false);
    track.navClick(`onboarding_${reason}`);
  }

  function next() {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      close('completed');
    }
  }

  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  const steps = profileType === 'jdg' ? STEPS_JDG : STEPS_PRIVATE;
  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  // Re-mapuje hrefy w zależności od kontekstu (/panel vs /agent/panel)
  const ctaHref = step.cta ? (isPanel ? step.cta.href : step.cta.href.replace('/panel/', '/agent/panel/')) : undefined;

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(8, 17, 13, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        maxWidth: 540, width: '100%',
        background: 'var(--color-surface, #fff)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--color-bg-2, #f0f0ec)' }}>
          <div style={{
            height: '100%',
            width: `${((stepIdx + 1) / steps.length) * 100}%`,
            background: 'var(--color-accent, #22A06B)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ padding: '32px 36px 28px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 18,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--color-text-3)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}>
              KROK {step.num} Z {String(steps.length).padStart(2, '0')}
            </span>
            <button
              onClick={() => close('skipped')}
              style={{
                background: 'none', border: 'none',
                color: 'var(--color-text-3)',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer', padding: 0,
                textDecoration: 'underline',
              }}
            >
              Pomiń
            </button>
          </div>

          <h2 style={{
            fontSize: 24, fontWeight: 700,
            color: 'var(--color-text-1)',
            margin: '0 0 14px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {step.title}
          </h2>

          <p style={{
            fontSize: 15, lineHeight: 1.6,
            color: 'var(--color-text-2)',
            margin: '0 0 24px',
          }}>
            {step.body}
          </p>

          {step.cta && ctaHref && (
            <Link
              href={ctaHref}
              onClick={() => { close('completed'); track.navClick(`onboarding_cta_${step.num}`); }}
              style={{
                display: 'inline-block',
                padding: '10px 18px',
                background: 'var(--color-bg-2, #f0f0ec)',
                color: 'var(--color-text-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                marginBottom: 24,
              }}
            >
              {step.cta.label} →
            </Link>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 18, borderTop: '1px solid var(--color-border)',
          }}>
            <button
              onClick={prev}
              disabled={stepIdx === 0}
              style={{
                background: 'none', border: 'none',
                color: stepIdx === 0 ? 'var(--color-muted-2, #ccc)' : 'var(--color-text-2)',
                fontSize: 14, fontWeight: 500,
                cursor: stepIdx === 0 ? 'default' : 'pointer',
                padding: 0,
              }}
            >
              ← Wstecz
            </button>

            {/* Dots indicator */}
            <div style={{ display: 'flex', gap: 6 }}>
              {steps.map((_, i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === stepIdx ? 'var(--color-accent, #22A06B)' : 'var(--color-border)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>

            <button
              onClick={next}
              style={{
                padding: '10px 20px',
                background: 'var(--color-accent, #22A06B)',
                color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Zakończ' : 'Dalej →'}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
      </div>
    </div>
  );
}
