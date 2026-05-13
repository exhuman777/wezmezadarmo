'use client';

import { useState } from 'react';

interface IntakeFormProps {
  onSubmit: (data: { wiek: number; plec: 'K' | 'M'; nip?: string }) => void;
  isLoading: boolean;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  padding: '0 16px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 15,
  letterSpacing: '0.02em',
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-mono)',
  transition: 'border-color 200ms, box-shadow 200ms',
};

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [age, setAge] = useState('');
  const [plec, setPlec] = useState<'K' | 'M' | ''>('');
  const [nip, setNip] = useState('');
  const [accepted, setAccepted] = useState(false);

  const canSubmit = age && parseInt(age, 10) > 0 && plec !== '' && accepted;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wiek = parseInt(age, 10);
    if (!wiek || !plec) return;
    const cleanNip = nip.replace(/[\s-]/g, '');
    onSubmit({
      wiek,
      plec: plec as 'K' | 'M',
      nip: cleanNip.length === 10 ? cleanNip : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Wiek">
        <input
          type="text"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
          placeholder="np. 34"
          style={fieldStyle}
          disabled={isLoading}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
      </Field>

      <Field label="Plec">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'K' as const, label: 'Kobieta' },
            { id: 'M' as const, label: 'Mezczyzna' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setPlec(id)}
              disabled={isLoading}
              style={{
                ...fieldStyle,
                padding: '14px 12px', height: 50,
                textAlign: 'left' as const,
                background: plec === id ? 'var(--color-text-1)' : 'var(--color-surface)',
                color: plec === id ? 'var(--color-bg-0)' : 'var(--color-text-1)',
                borderColor: plec === id ? 'var(--color-text-1)' : 'var(--color-border)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                fontFamily: 'var(--font-sans)',
              }}>{label}</button>
          ))}
        </div>
      </Field>

      <Field label="NIP" hint="Opcjonalnie, dla swiadczen firmowych">
        <input
          type="text"
          inputMode="numeric"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="0000000000"
          style={fieldStyle}
          disabled={isLoading}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
      </Field>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
        marginBottom: 14, marginTop: 4,
      }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          disabled={isLoading}
          style={{ marginTop: 3, accentColor: 'var(--color-accent)', flexShrink: 0, width: 15, height: 15, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>
          Korzystając z serwisu akceptuję{' '}
          <a href="/regulamin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            regulamin
          </a>{' '}i zapoznałem/am się z{' '}
          <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            polityką prywatności
          </a>.
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        style={{
          width: '100%',
          height: 56,
          marginTop: 8,
          background: canSubmit ? 'var(--color-text-1)' : 'var(--color-surface-2)',
          color: canSubmit ? 'var(--color-bg-0)' : 'var(--color-muted-2)',
          border: 'none',
          borderRadius: 14,
          fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'all 220ms cubic-bezier(.2,.7,.1,1)',
        }}
        onMouseEnter={e => canSubmit && (e.currentTarget.style.background = 'var(--color-accent)')}
        onMouseLeave={e => canSubmit && (e.currentTarget.style.background = 'var(--color-text-1)')}
      >
        {isLoading ? 'Sprawdzam...' : 'Sprawdz co Ci sie nalezy'}
        {!isLoading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        )}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', letterSpacing: '-0.005em' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
