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
  },
  MOZLIWE: {
    border: 'var(--color-accent)',
    bgVar: 'var(--color-amber-bg)',
    label: 'Do weryfikacji',
    colorVar: 'var(--color-accent)',
  },
  NIE_PRZYSLUGUJE: {
    border: 'var(--color-text-3)',
    bgVar: 'transparent',
    label: 'Nie przysługuje',
    colorVar: 'var(--color-text-3)',
  },
} as const;

export function BenefitCard({ result, onGuide }: BenefitCardProps) {
  const s = STATUS_CONFIG[result.status];
  const b = result.benefit;

  return (
    <div
      className="w-full rounded-lg mb-2 cursor-pointer transition-all active:scale-[0.99] hover:shadow-sm overflow-hidden"
      style={{
        background: 'var(--color-bg-1)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${s.border}`,
      }}
      onClick={() => onGuide(b.id)}
    >
      <div className="p-3 sm:p-3.5">
        {/* Top row: name + status badge */}
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-text-1 leading-snug flex-1 min-w-0">
            {b.nazwa}
          </h3>
          <span
            className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shrink-0"
            style={{ background: s.bgVar, color: s.colorVar }}
          >
            {s.label}
          </span>
        </div>

        {/* Amount */}
        <div className="text-[17px] sm:text-[19px] font-bold text-text-1 mb-1">
          {b.kwota}
          <span className="text-[11px] sm:text-[12px] font-normal text-text-3 ml-1.5">
            {b.czestotliwosc}
          </span>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="text-[11px] sm:text-[12px] text-red leading-relaxed mb-1.5">
            {result.warnings.map((w, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="shrink-0 font-bold">!</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border mt-1.5">
          <span className="text-[10px] sm:text-[11px] text-text-3 truncate max-w-[45%]">
            {b.zrodloNazwa}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGuide(b.id);
            }}
            className="text-[12px] sm:text-[13px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
              color: '#fff',
            }}
          >
            Jak złożyć &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
