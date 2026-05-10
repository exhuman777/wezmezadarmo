'use client';

import { MatchResult } from '@/engine/types';

interface BenefitCardProps {
  result: MatchResult;
  onGuide: (benefitId: string) => void;
}

const STATUS_STYLES = {
  PRZYSLUGUJE: {
    borderVar: 'var(--color-green-border)',
    bgVar: 'var(--color-green-bg)',
    label: 'PRZYSŁUGUJE',
    colorVar: 'var(--color-green)',
  },
  MOZLIWE: {
    borderVar: 'var(--color-amber-border)',
    bgVar: 'var(--color-amber-bg)',
    label: 'MOŻLIWE',
    colorVar: 'var(--color-accent)',
  },
  NIE_PRZYSLUGUJE: {
    borderVar: 'var(--color-border)',
    bgVar: 'transparent',
    label: 'NIE PRZYSŁUGUJE',
    colorVar: 'var(--color-text-3)',
  },
} as const;

export function BenefitCard({ result, onGuide }: BenefitCardProps) {
  const s = STATUS_STYLES[result.status];
  const b = result.benefit;

  return (
    <div
      className="w-full rounded-xl p-3.5 sm:p-4 mb-3 cursor-pointer transition-all active:scale-[0.99] hover:shadow-md"
      style={{
        background: s.bgVar,
        border: `2px solid ${s.borderVar}`,
      }}
      onClick={() => onGuide(b.id)}
    >
      {/* Top row */}
      <div className="flex justify-between items-center text-[11px] sm:text-[12px] font-bold tracking-[1px]">
        <span className="px-2 py-0.5 rounded" style={{ background: 'var(--color-amber-bg)', color: 'var(--color-accent)' }}>
          {b.kategoria}
        </span>
        <span className="px-2 py-0.5 rounded" style={{ background: s.bgVar, color: s.colorVar }}>
          {s.label}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-[15px] sm:text-[17px] font-semibold text-text-1 mt-2 sm:mt-2.5 mb-1 sm:mb-1.5 leading-snug">
        {b.nazwa}
      </h3>

      {/* Amount */}
      <div className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2 sm:mb-2.5">
        {b.kwota}
        <span className="text-[12px] sm:text-[13px] font-normal text-text-3 ml-2">
          {b.czestotliwosc}
        </span>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="text-[11px] sm:text-[12px] text-red mb-2.5 leading-relaxed">
          {result.warnings.map((w, i) => (
            <div key={i}>! {w}</div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2.5 sm:pt-3 border-t border-border">
        <a
          href={b.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] sm:text-[12px] text-text-3 hover:text-accent transition-colors"
        >
          Źródło: {b.zrodloNazwa}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGuide(b.id);
          }}
          className="text-[13px] font-bold tracking-[0.5px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            color: '#fff',
          }}
        >
          Jak złożyć wniosek
        </button>
      </div>
    </div>
  );
}
