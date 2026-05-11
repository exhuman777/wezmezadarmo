'use client';

interface QuestionChoiceProps {
  question: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuestionChoice({ question, options, onSelect, disabled }: QuestionChoiceProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="red-dot" />
          <span className="label-eyebrow" style={{ color: 'var(--color-accent)' }}>wezmezadarmo</span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{question}</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className="hover-lift"
            style={{
              padding: '10px 16px',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-1)',
              fontSize: 14, fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
              transition: 'all 200ms cubic-bezier(.2,.7,.1,1)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-text-1)';
              e.currentTarget.style.background = 'var(--color-surface-2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-surface)';
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.04em' }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
