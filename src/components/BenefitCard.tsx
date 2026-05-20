'use client';

import { MatchResult } from '@/engine/types';

interface BenefitCardProps {
  result: MatchResult;
  onGuide: (benefitId: string) => void;
}

const STATUS_CONFIG = {
  PRZYSLUGUJE: {
    border: 'var(--color-green)',
    bgVar: 'var(--color-green-bg)',
    label: 'Przysługuje',
    colorVar: 'var(--color-green)',
    dot: 'var(--color-green)',
  },
  MOZLIWE: {
    border: 'var(--color-accent)',
    bgVar: 'var(--color-accent-soft)',
    label: 'Do weryfikacji',
    colorVar: 'var(--color-accent)',
    dot: 'var(--color-accent)',
  },
  NIE_PRZYSLUGUJE: {
    border: 'var(--color-text-3)',
    bgVar: 'transparent',
    label: 'Nie przysługuje',
    colorVar: 'var(--color-text-3)',
    dot: 'var(--color-text-3)',
  },
} as const;

const CONFIDENCE_LABELS: Record<string, string> = {
  WYSOKA: 'Pewność: wysoka',
  SREDNIA: 'Pewność: średnia',
  NISKA: 'Pewność: niska',
};

export function BenefitCard({ result, onGuide }: BenefitCardProps) {
  const s = STATUS_CONFIG[result.status];
  const b = result.benefit;

  return (
    <div
      className="hover-lift"
      onClick={() => onGuide(b.id)}
      style={{
        width: '100%',
        marginBottom: 6,
        cursor: 'pointer',
        overflow: 'hidden',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${s.border}`,
        borderRadius: 'var(--radius-lg)',
        transition: 'all 320ms cubic-bezier(.2,.7,.1,1)',
      }}
    >
      <div style={{ padding: '12px 14px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', lineHeight: 1.3, flex: 1, minWidth: 0, letterSpacing: '-0.01em', wordBreak: 'break-word', overflow: 'hidden' }}>
            {b.nazwa}
          </h3>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 10, fontWeight: 500, padding: '3px 8px',
            borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
            background: s.bgVar, color: s.colorVar,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}>
            {s.label}
          </span>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 6 }}>
          <span className="mono" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>
            {b.kwota}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-3)', marginLeft: 6 }}>
            {b.czestotliwosc}
          </span>
        </div>

        {/* Confidence */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: 'var(--color-text-3)' }}>
          <span className="mono" style={{ letterSpacing: '0.04em' }}>{CONFIDENCE_LABELS[result.confidence] ?? result.confidence}</span>
          <span>Dopasowanie: algorytm + weryfikacja AI</span>
        </div>

        {/* Matched criteria */}
        {result.matchedCriteria.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {result.matchedCriteria.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--color-green)', fontWeight: 600, flexShrink: 0 }}>[v]</span>
                <span style={{ wordBreak: 'break-word', minWidth: 0 }}>{c}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {result.warnings.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--color-red)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>!</span>
                <span style={{ wordBreak: 'break-word', minWidth: 0 }}>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--color-border)', marginTop: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, marginRight: 10 }}>
            <a
              href={b.zrodloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="link-u"
              style={{ fontSize: 11, color: 'var(--color-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              Źródło: {b.zrodloNazwa}
            </a>
            <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.04em' }}>
              {b.dataWeryfikacji}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onGuide(b.id); }}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--color-text-1)',
              color: 'var(--color-bg-0)',
              fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 200ms',
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-text-1)'}
          >
            Jak złożyć
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
