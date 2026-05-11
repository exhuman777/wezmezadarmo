'use client';

import { useState } from 'react';
import { decodePesel, validatePesel } from '@/engine/pesel';

interface IntakeFormProps {
  onSubmit: (data: { pesel: string; wiek: number; plec: 'K' | 'M'; nip?: string }) => void;
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
  const [mode, setMode] = useState<'pesel' | 'manual'>('pesel');
  const [pesel, setPesel] = useState('');
  const [nip, setNip] = useState('');
  const [peselError, setPeselError] = useState('');
  const [decoded, setDecoded] = useState<{ wiek: number; plec: 'K' | 'M' } | null>(null);

  const [manualAge, setManualAge] = useState('');
  const [manualPlec, setManualPlec] = useState<'K' | 'M' | ''>('');

  function handlePeselChange(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    setPesel(clean);
    setPeselError('');
    setDecoded(null);

    if (clean.length === 11) {
      if (!validatePesel(clean)) {
        setPeselError('Nieprawidłowy numer PESEL');
        return;
      }
      setDecoded(decodePesel(clean));
    }
  }

  const manualReady = mode === 'manual' && manualAge && parseInt(manualAge, 10) > 0 && manualPlec !== '';
  const peselReady = mode === 'pesel' && decoded;
  const canSubmit = peselReady || manualReady;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'pesel') {
      if (!decoded) {
        setPeselError('Wpisz prawidłowy numer PESEL');
        return;
      }
      const cleanNip = nip.replace(/[\s-]/g, '');
      onSubmit({
        pesel,
        wiek: decoded.wiek,
        plec: decoded.plec,
        nip: cleanNip.length === 10 ? cleanNip : undefined,
      });
    } else {
      const age = parseInt(manualAge, 10);
      if (!age || !manualPlec) return;
      const cleanNip = nip.replace(/[\s-]/g, '');
      onSubmit({
        pesel: '',
        wiek: age,
        plec: manualPlec as 'K' | 'M',
        nip: cleanNip.length === 10 ? cleanNip : undefined,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Segmented control */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: 'var(--color-surface-2)',
        borderRadius: 999,
        padding: 4,
        marginBottom: 22,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 4, bottom: 4,
          left: mode === 'pesel' ? 4 : 'calc(50%)',
          width: 'calc(50% - 4px)',
          background: 'var(--color-text-1)',
          borderRadius: 999,
          transition: 'left 320ms cubic-bezier(.2,.7,.1,1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }} />
        {[
          { id: 'pesel' as const, label: 'Mam PESEL' },
          { id: 'manual' as const, label: 'Wiek i płeć' },
        ].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setMode(id)} style={{
            position: 'relative', zIndex: 1,
            background: 'none', border: 'none',
            padding: '10px 12px',
            fontWeight: 500, fontSize: 13,
            color: mode === id ? 'var(--color-bg-0)' : 'var(--color-text-2)',
            transition: 'color 280ms',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {mode === 'pesel' ? (
        <>
          <Field label="PESEL" hint="11 cyfr, dekodowane lokalnie">
            <input
              type="text"
              inputMode="numeric"
              value={pesel}
              onChange={(e) => handlePeselChange(e.target.value)}
              placeholder="00000000000"
              style={fieldStyle}
              disabled={isLoading}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </Field>
          {peselError && (
            <p style={{ fontSize: 13, color: 'var(--color-red)', marginTop: -8, marginBottom: 14 }}>{peselError}</p>
          )}
          {decoded && (
            <div style={{ display: 'flex', gap: 12, marginTop: -8, marginBottom: 14, fontSize: 14, fontWeight: 500 }}>
              <span style={{ color: 'var(--color-green)' }}>Wiek: {decoded.wiek} lat</span>
              <span style={{ color: 'var(--color-accent)' }}>{decoded.plec === 'K' ? 'Kobieta' : 'Mężczyzna'}</span>
            </div>
          )}
          <Field label="NIP" hint="Opcjonalnie, dla świadczeń firmowych">
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
        </>
      ) : (
        <>
          <Field label="Wiek">
            <input
              type="text"
              inputMode="numeric"
              value={manualAge}
              onChange={(e) => setManualAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="np. 34"
              style={fieldStyle}
              disabled={isLoading}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </Field>
          <Field label="Płeć">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: 'K' as const, label: 'Kobieta' },
                { id: 'M' as const, label: 'Mężczyzna' },
              ].map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setManualPlec(id)}
                  disabled={isLoading}
                  style={{
                    ...fieldStyle,
                    padding: '14px 12px', height: 50,
                    textAlign: 'left' as const,
                    background: manualPlec === id ? 'var(--color-text-1)' : 'var(--color-surface)',
                    color: manualPlec === id ? 'var(--color-bg-0)' : 'var(--color-text-1)',
                    borderColor: manualPlec === id ? 'var(--color-text-1)' : 'var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}>{label}</button>
              ))}
            </div>
          </Field>
        </>
      )}

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
        {isLoading ? 'Sprawdzam...' : 'Sprawdź co Ci się należy'}
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
