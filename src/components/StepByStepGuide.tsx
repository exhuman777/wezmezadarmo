'use client';

import { Benefit } from '@/engine/types';

interface StepByStepGuideProps {
  benefit: Benefit;
  onClose: () => void;
}

export function StepByStepGuide({ benefit, onClose }: StepByStepGuideProps) {
  const w = benefit.wniosek;

  return (
    <div className="w-full rounded-xl p-5 mb-4 bg-bg-1 border border-border-light" style={{
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[13px] font-bold tracking-[2px] mb-1.5 uppercase" style={{ color: '#b87a1e' }}>
            Jak złożyć wniosek
          </div>
          <h3 className="text-[18px] font-bold text-text-1">{benefit.nazwa}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-3 hover:text-text-1 text-[20px] leading-none px-2 py-1 cursor-pointer"
        >
          x
        </button>
      </div>

      {/* Dokumenty */}
      <Section title="CO POTRZEBUJESZ">
        <ul className="list-none space-y-1.5">
          {w.dokumenty.map((doc, i) => (
            <li key={i} className="text-[14px] text-text-2 flex gap-2.5">
              <span className="font-bold shrink-0" style={{ color: '#e6993a' }}>{i + 1}.</span>
              {doc}
            </li>
          ))}
        </ul>
      </Section>

      {/* Gdzie zlozyc */}
      <Section title="GDZIE ZŁOŻYĆ">
        <div className="flex flex-wrap gap-2">
          {w.kanal.map((k) => (
            <span
              key={k}
              className="text-[12px] font-bold tracking-[0.5px] px-2.5 py-1 rounded-md"
              style={{ background: 'rgba(230,153,58,0.12)', color: '#b87a1e' }}
            >
              {k.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        {w.formularz && (
          <p className="text-[12px] text-text-3 mt-2">Formularz: {w.formularz}</p>
        )}
      </Section>

      {/* Kroki */}
      <Section title="KROK PO KROKU">
        <ol className="list-none space-y-3">
          {w.kroki.map((krok, i) => (
            <li key={i} className="flex gap-3 text-[14px] text-text-2">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: 'rgba(230,153,58,0.15)', color: '#b87a1e' }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{krok}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Termin */}
      <Section title="TERMIN REALIZACJI">
        <p className="text-[14px] text-text-2">{w.terminRealizacji}</p>
      </Section>

      {/* Pulapki */}
      {w.pulapki.length > 0 && (
        <Section title="NA CO UWAŻAĆ">
          <ul className="list-none space-y-1.5">
            {w.pulapki.map((p, i) => (
              <li key={i} className="text-[14px] text-red flex gap-2.5">
                <span className="shrink-0 font-bold">!</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Odwolanie */}
      <Section title="CO DALEJ">
        <p className="text-[14px] text-text-2">{w.odwolanie}</p>
      </Section>

      {/* Source */}
      <div className="mt-4 pt-3 text-[12px] text-text-3 border-t border-border">
        Źródło:{' '}
        <a
          href={benefit.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: '#e6993a' }}
        >
          {benefit.zrodloNazwa}
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div
        className="text-[13px] font-bold tracking-[2px] mb-2 pb-1"
        style={{ borderBottom: '1px dashed rgba(0,0,0,0.1)', color: '#b87a1e' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
