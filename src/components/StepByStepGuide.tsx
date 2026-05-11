'use client';

import { Benefit } from '@/engine/types';

interface StepByStepGuideProps {
  benefit: Benefit;
  onClose: () => void;
}

export function StepByStepGuide({ benefit, onClose }: StepByStepGuideProps) {
  const w = benefit.wniosek;

  return (
    <div style={{
      width: '100%',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      marginBottom: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-2)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="label-eyebrow" style={{ color: 'var(--color-accent)', marginBottom: 8 }}>
            Jak złożyć wniosek
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>{benefit.nazwa}</h3>
        </div>
        <button
          onClick={onClose}
          className="btn btn-outline"
          style={{ height: 36, padding: '0 14px', fontSize: 12 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
          Wróć
        </button>
      </div>

      <Section title="Co potrzebujesz">
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {w.dokumenty.map((doc, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--color-text-2)' }}>
              <span className="mono" style={{ fontWeight: 500, color: 'var(--color-accent)', flexShrink: 0, fontSize: 12, letterSpacing: '0.04em' }}>{String(i + 1).padStart(2, '0')}</span>
              {doc}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gdzie złożyć">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {w.kanal.map((k) => (
            <span key={k} className="mono" style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 11, fontWeight: 500, padding: '5px 10px',
              borderRadius: 999,
              background: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
              letterSpacing: '0.04em',
            }}>
              {k.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        {w.formularz && (
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 8 }}>Formularz: {w.formularz}</p>
        )}
      </Section>

      <Section title="Krok po kroku">
        <ol style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {w.kroki.map((krok, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'var(--color-text-2)' }}>
              <span style={{
                flexShrink: 0, width: 28, height: 28,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 500,
                background: 'var(--color-text-1)',
                color: 'var(--color-bg-0)',
              }}>
                {i + 1}
              </span>
              <span style={{ paddingTop: 4 }}>{krok}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Termin realizacji">
        <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{w.terminRealizacji}</p>
      </Section>

      {w.pulapki.length > 0 && (
        <Section title="Na co uważać">
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {w.pulapki.map((p, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--color-red)' }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>!</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Co dalej">
        <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{w.odwolanie}</p>
      </Section>

      <div style={{
        marginTop: 16, paddingTop: 16,
        borderTop: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', gap: 4,
        fontSize: 12, color: 'var(--color-text-3)',
      }}>
        <div>
          Źródło:{' '}
          <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: 'var(--color-accent)' }}>
            {benefit.zrodloNazwa}
          </a>
        </div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.04em' }}>
          Dane zweryfikowane: {benefit.dataWeryfikacji} | Ważne do: {benefit.dataWaznosci}
        </div>
        <div style={{ color: 'var(--color-text-3)', marginTop: 4 }}>
          Informacje pochodzą z ręcznie zweryfikowanej bazy danych, nie z AI. Zawsze sprawdź aktualność na stronie źródłowej.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="label-eyebrow" style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
