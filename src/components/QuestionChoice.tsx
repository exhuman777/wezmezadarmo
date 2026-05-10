'use client';

interface QuestionChoiceProps {
  question: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuestionChoice({ question, options, onSelect, disabled }: QuestionChoiceProps) {
  return (
    <div className="mb-4">
      <div className="bg-bg-2 border border-border rounded-xl px-4 py-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-[12px] font-bold tracking-[1.5px] text-accent uppercase">
            wezmezadarmo
          </span>
        </div>
        <p className="text-[15px] text-text-2 leading-relaxed">{question}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className="px-4 py-2.5 rounded-lg text-[14px] font-semibold tracking-[0.5px] border transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: 'var(--color-amber-bg)',
              borderColor: 'var(--color-amber-border)',
              color: 'var(--color-text-1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.background = 'var(--color-amber-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-amber-border)';
              e.currentTarget.style.background = 'var(--color-amber-bg)';
            }}
          >
            <span className="text-accent mr-2 font-bold">
              {String.fromCharCode(97 + i)})
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
