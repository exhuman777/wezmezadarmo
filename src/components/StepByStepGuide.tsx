'use client';

import { Benefit } from '@/engine/types';

interface StepByStepGuideProps {
  benefit: Benefit;
  onClose: () => void;
}

export function StepByStepGuide({ benefit, onClose }: StepByStepGuideProps) {
  const w = benefit.wniosek;

  return (
    <div className="w-full rounded-[10px] p-4 mb-3" style={{
      background: 'var(--color-bg-1)',
      border: '1px solid var(--color-border)',
    }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[10px] font-bold tracking-[1.5px] text-accent mb-1 uppercase">
            Jak zlozyc wniosek
          </div>
          <h3 className="text-[14px] font-bold text-text-1">{benefit.nazwa}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-3 hover:text-text-1 text-[16px] leading-none px-1"
        >
          x
        </button>
      </div>

      {/* Dokumenty */}
      <Section title="CO POTRZEBUJESZ">
        <ul className="list-none space-y-1">
          {w.dokumenty.map((doc, i) => (
            <li key={i} className="text-[11px] text-text-2 flex gap-2">
              <span className="text-accent font-bold shrink-0">{i + 1}.</span>
              {doc}
            </li>
          ))}
        </ul>
      </Section>

      {/* Gdzie zlozyc */}
      <Section title="GDZIE ZLOZYC">
        <div className="flex flex-wrap gap-1.5">
          {w.kanal.map((k) => (
            <span
              key={k}
              className="text-[10px] font-bold tracking-[0.5px] px-2 py-1 rounded"
              style={{ background: 'rgba(240,168,96,0.12)', color: '#f0a860' }}
            >
              {k.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        {w.formularz && (
          <p className="text-[10px] text-text-3 mt-1.5">Formularz: {w.formularz}</p>
        )}
      </Section>

      {/* Kroki */}
      <Section title="KROK PO KROKU">
        <ol className="list-none space-y-2">
          {w.kroki.map((krok, i) => (
            <li key={i} className="flex gap-2 text-[11px] text-text-2">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(240,168,96,0.15)', color: '#f0a860' }}
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
        <p className="text-[11px] text-text-2">{w.terminRealizacji}</p>
      </Section>

      {/* Pulapki */}
      {w.pulapki.length > 0 && (
        <Section title="NA CO UWAZAC">
          <ul className="list-none space-y-1">
            {w.pulapki.map((p, i) => (
              <li key={i} className="text-[11px] text-red flex gap-2">
                <span className="shrink-0 font-bold">!</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Odwolanie */}
      <Section title="CO DALEJ">
        <p className="text-[11px] text-text-2">{w.odwolanie}</p>
      </Section>

      {/* Source */}
      <div className="mt-3 pt-2 text-[10px] text-text-3" style={{ borderTop: '1px dashed rgba(240,168,96,0.15)' }}>
        Zweryfikuj na:{' '}
        <a
          href={benefit.zrodloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {benefit.zrodloNazwa}
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div
        className="text-[10px] font-bold tracking-[1.5px] text-accent mb-1.5 pb-1"
        style={{ borderBottom: '1px dashed rgba(240,168,96,0.2)' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
