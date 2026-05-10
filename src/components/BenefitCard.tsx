'use client';

import { MatchResult } from '@/engine/types';

interface BenefitCardProps {
  result: MatchResult;
  onGuide: (benefitId: string) => void;
}

const STATUS_STYLES = {
  PRZYSLUGUJE: {
    border: 'rgba(63,185,80,0.45)',
    glow: '0 4px 24px rgba(63,185,80,0.15), inset 0 0 40px rgba(63,185,80,0.05)',
    label: 'PRZYSLUGUJE',
    labelColor: '#3fb950',
    labelBg: 'rgba(63,185,80,0.18)',
  },
  MOZLIWE: {
    border: 'rgba(240,168,96,0.45)',
    glow: '0 4px 24px rgba(240,168,96,0.15), inset 0 0 40px rgba(240,168,96,0.05)',
    label: 'MOZLIWE',
    labelColor: '#f0a860',
    labelBg: 'rgba(240,168,96,0.18)',
  },
  NIE_PRZYSLUGUJE: {
    border: 'rgba(100,100,100,0.3)',
    glow: 'none',
    label: 'NIE PRZYSLUGUJE',
    labelColor: '#777',
    labelBg: 'rgba(100,100,100,0.18)',
  },
} as const;

export function BenefitCard({ result, onGuide }: BenefitCardProps) {
  const s = STATUS_STYLES[result.status];
  const b = result.benefit;

  return (
    <div
      className="w-full rounded-xl p-4 mb-3 cursor-pointer transition-transform hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(40,28,16,0.95), rgba(20,14,8,0.95))',
        border: `2px solid ${s.border}`,
        boxShadow: s.glow,
      }}
      onClick={() => onGuide(b.id)}
    >
      {/* Top row: category + status */}
      <div className="flex justify-between items-center text-[12px] font-bold tracking-[1px]">
        <span
          className="px-2 py-0.5 rounded"
          style={{ background: 'rgba(240,168,96,0.2)', color: '#f0a860' }}
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

      {/* Confidence + warnings */}
      {result.warnings.length > 0 && (
        <div className="text-[12px] text-red mb-2.5 leading-relaxed">
          {result.warnings.map((w, i) => (
            <div key={i}>! {w}</div>
          ))}
        </div>
      )}

      {/* Footer: source + guide button */}
      <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'rgba(240,168,96,0.15)' }}>
        <a
          href={b.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-text-3 hover:text-accent transition-colors"
        >
          Zrodlo: {b.zrodloNazwa}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGuide(b.id);
          }}
          className="text-[13px] font-bold tracking-[0.5px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{
            background: 'rgba(240,168,96,0.15)',
            color: '#f0a860',
            border: '1px solid rgba(240,168,96,0.3)',
          }}
        >
          Jak zlozyc wniosek
        </button>
      </div>
    </div>
  );
}
