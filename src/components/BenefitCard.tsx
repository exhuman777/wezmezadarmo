'use client';

import { MatchResult } from '@/engine/types';

interface BenefitCardProps {
  result: MatchResult;
  onGuide: (benefitId: string) => void;
}

const STATUS_STYLES = {
  PRZYSLUGUJE: {
    border: 'rgba(22,163,74,0.4)',
    bg: 'linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02))',
    label: 'PRZYSLUGUJE',
    labelColor: '#16a34a',
    labelBg: 'rgba(22,163,74,0.12)',
  },
  MOZLIWE: {
    border: 'rgba(230,153,58,0.4)',
    bg: 'linear-gradient(135deg, rgba(230,153,58,0.06), rgba(230,153,58,0.02))',
    label: 'MOZLIWE',
    labelColor: '#b87a1e',
    labelBg: 'rgba(230,153,58,0.12)',
  },
  NIE_PRZYSLUGUJE: {
    border: 'rgba(0,0,0,0.1)',
    bg: 'rgba(0,0,0,0.02)',
    label: 'NIE PRZYSLUGUJE',
    labelColor: '#888',
    labelBg: 'rgba(0,0,0,0.06)',
  },
} as const;

export function BenefitCard({ result, onGuide }: BenefitCardProps) {
  const s = STATUS_STYLES[result.status];
  const b = result.benefit;

  return (
    <div
      className="w-full rounded-xl p-4 mb-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
      }}
      onClick={() => onGuide(b.id)}
    >
      {/* Top row: category + status */}
      <div className="flex justify-between items-center text-[12px] font-bold tracking-[1px]">
        <span
          className="px-2 py-0.5 rounded"
          style={{ background: 'rgba(230,153,58,0.12)', color: '#b87a1e' }}
        >
          {b.kategoria}
        </span>
        <span
          className="px-2 py-0.5 rounded"
          style={{ background: s.labelBg, color: s.labelColor }}
        >
          {s.label}
        </span>
      </div>

      {/* Benefit name */}
      <h3 className="text-[17px] font-semibold text-text-1 mt-2.5 mb-1.5 leading-snug">
        {b.nazwa}
      </h3>

      {/* Amount */}
      <div className="text-[24px] font-bold text-text-1 mb-2.5">
        {b.kwota}
        <span className="text-[13px] font-normal text-text-3 ml-2">
          {b.czestotliwosc}
        </span>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="text-[12px] text-red mb-2.5 leading-relaxed">
          {result.warnings.map((w, i) => (
            <div key={i}>! {w}</div>
          ))}
        </div>
      )}

      {/* Footer: source + guide button */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <a
          href={b.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-text-3 hover:text-accent transition-colors"
        >
          Źródło: {b.zrodloNazwa}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGuide(b.id);
          }}
          className="text-[13px] font-bold tracking-[0.5px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #e6993a, #f5b04a)',
            color: '#fff',
          }}
        >
          Jak złożyć wniosek
        </button>
      </div>
    </div>
  );
}
