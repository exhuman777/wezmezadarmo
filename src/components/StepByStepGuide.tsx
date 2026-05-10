'use client';

import { Benefit } from '@/engine/types';

interface StepByStepGuideProps {
  benefit: Benefit;
  onClose: () => void;
}

export function StepByStepGuide({ benefit, onClose }: StepByStepGuideProps) {
  const w = benefit.wniosek;

  return (
    <div className="w-full rounded-xl p-4 sm:p-5 mb-4 bg-bg-1 border border-border" style={{
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[12px] font-semibold tracking-wide mb-1 uppercase text-accent">
            Jak złożyć wniosek
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-text-1">{benefit.nazwa}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-3 hover:text-text-1 text-[18px] leading-none px-2 py-1 cursor-pointer rounded-lg hover:bg-bg-2 transition-colors"
        >
          x
        </button>
      </div>

      <Section title="Co potrzebujesz">
        <ul className="space-y-1.5">
          {w.dokumenty.map((doc, i) => (
            <li key={i} className="text-[14px] sm:text-[15px] text-text-2 flex gap-2">
              <span className="font-semibold shrink-0 text-accent">{i + 1}.</span>
              {doc}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gdzie złożyć">
        <div className="flex flex-wrap gap-1.5">
          {w.kanal.map((k) => (
            <span
              key={k}
              className="text-[12px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'var(--color-amber-bg)', color: 'var(--color-accent)' }}
            >
              {k.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        {w.formularz && (
          <p className="text-[12px] text-text-3 mt-1.5">Formularz: {w.formularz}</p>
        )}
      </Section>

      <Section title="Krok po kroku">
        <ol className="space-y-2.5">
          {w.kroki.map((krok, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] sm:text-[15px] text-text-2">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold"
                style={{ background: 'var(--color-amber-bg)', color: 'var(--color-accent)' }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{krok}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Termin realizacji">
        <p className="text-[14px] sm:text-[15px] text-text-2">{w.terminRealizacji}</p>
      </Section>

      {w.pulapki.length > 0 && (
        <Section title="Na co uważać">
          <ul className="space-y-1.5">
            {w.pulapki.map((p, i) => (
              <li key={i} className="text-[14px] sm:text-[15px] text-red flex gap-2">
                <span className="shrink-0 font-semibold">!</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Co dalej">
        <p className="text-[14px] sm:text-[15px] text-text-2">{w.odwolanie}</p>
      </Section>

      <div className="mt-3 pt-2.5 text-[12px] text-text-3 border-t border-border">
        Źródło:{' '}
        <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          {benefit.zrodloNazwa}
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-[12px] sm:text-[13px] font-semibold tracking-wide mb-1.5 pb-1 text-accent border-b border-border" style={{ borderBottomStyle: 'dashed' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
