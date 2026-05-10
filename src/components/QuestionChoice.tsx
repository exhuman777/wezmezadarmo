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
              background: 'rgba(240,168,96,0.06)',
              borderColor: 'rgba(240,168,96,0.2)',
              color: '#f0f0f0',
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
