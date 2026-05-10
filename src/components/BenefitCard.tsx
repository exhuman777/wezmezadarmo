'use client';

import { MatchResult } from '@/engine/types';

interface BenefitCardProps {
  result: MatchResult;
  onGuide: (benefitId: string) => void;
}

const STATUS_CONFIG = {
  PRZYSLUGUJE: {
    borderVar: 'var(--color-green-border)',
    bgVar: 'var(--color-green-bg)',
    label: 'Przysługuje',
    colorVar: 'var(--color-green)',
  },
  MOZLIWE: {
    borderVar: 'var(--color-amber-border)',
    bgVar: 'var(--color-amber-bg)',
    label: 'Do weryfikacji',
    colorVar: 'var(--color-accent)',
  },
  NIE_PRZYSLUGUJE: {
    borderVar: 'var(--color-border)',
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
      className="w-full rounded-xl p-3.5 sm:p-4 mb-2.5 cursor-pointer transition-all active:scale-[0.99] hover:shadow-sm"
      style={{
        background: 'var(--color-bg-1)',
        border: `1.5px solid ${s.borderVar}`,
      }}
      onClick={() => onGuide(b.id)}
    >
      {/* Header: status + amount */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-text-1 leading-snug mb-1">
            {b.nazwa}
          </h3>
          <div className="text-[18px] sm:text-[20px] font-bold text-text-1">
            {b.kwota}
            <span className="text-[12px] font-normal text-text-3 ml-1.5">
              {b.czestotliwosc}
            </span>
          </div>
        </div>
        <span
          className="text-[11px] sm:text-[12px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
          style={{ background: s.bgVar, color: s.colorVar }}
        >
          {s.label}
        </span>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mt-2 text-[12px] sm:text-[13px] text-red leading-relaxed">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="shrink-0">!</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border">
        <a
          href={b.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] sm:text-[12px] text-text-3 hover:text-accent transition-colors truncate max-w-[50%]"
        >
          Źródło: {b.zrodloNazwa}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGuide(b.id);
          }}
          className="text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
