'use client';

interface QuestionChoiceProps {
  question: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuestionChoice({ question, options, onSelect, disabled }: QuestionChoiceProps) {
  return (
    <div className="mb-3">
      <div className="bg-bg-2 border border-border rounded-lg px-3.5 py-2.5 mb-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-[9px] font-bold tracking-[1px] text-accent uppercase">
            wezmezadarmo
          </span>
        </div>
        <p className="text-[12px] text-text-2 leading-relaxed">{question}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className="px-3 py-2 rounded-md text-[11px] font-semibold tracking-[0.5px] border transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(240,168,96,0.06)',
              borderColor: 'rgba(240,168,96,0.2)',
              color: '#ececec',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(240,168,96,0.5)';
              e.currentTarget.style.background = 'rgba(240,168,96,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(240,168,96,0.2)';
              e.currentTarget.style.background = 'rgba(240,168,96,0.06)';
            }}
          >
            <span className="text-accent mr-1.5 font-bold">
              {String.fromCharCode(97 + i)})
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
