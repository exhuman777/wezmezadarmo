'use client';

import { useState } from 'react';

interface IntakeFormProps {
  onSubmit: (data: { wiek: number; plec: 'K' | 'M'; nip?: string }) => void;
  isLoading: boolean;
}

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
      <Field label="Wiek" htmlFor="kalk-wiek">
        <input
          id="kalk-wiek"
          type="text"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
          placeholder="np. 34"
          className="pole-wejscie"
          disabled={isLoading}
        />
      </Field>

      <Field label="Płeć">
        <div role="group" aria-label="Płeć" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'K' as const, label: 'Kobieta' },
            { id: 'M' as const, label: 'Mężczyzna' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setPlec(id)}
              disabled={isLoading}
              aria-pressed={plec === id}
              className="filtr"
              style={{ minHeight: 48, justifyContent: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: 16, fontWeight: 500 }}
            >{label}</button>
          ))}
        </div>
      </Field>

      <Field label="NIP firmy" hint="Opcjonalnie, dla JDG i przedsiębiorców" htmlFor="kalk-nip">
        <input
          id="kalk-nip"
          type="text"
          inputMode="numeric"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="NIP (10 cyfr)"
          className="pole-wejscie"
          disabled={isLoading}
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
          style={{ marginTop: 2, accentColor: 'var(--tusz)', flexShrink: 0, width: 20, height: 20, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.5 }}>
          Korzystając z serwisu akceptuję{' '}
          <a href="/regulamin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tusz)', textDecoration: 'underline' }}>
            regulamin
          </a>{' '}i zapoznałem/am się z{' '}
          <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tusz)', textDecoration: 'underline' }}>
            polityką prywatności
          </a>.
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="btn btn-rdza btn-lg"
        style={{ width: '100%', minHeight: 56, marginTop: 8 }}
      >
        {isLoading ? 'Sprawdzam...' : 'Sprawdź co Ci się należy'}
        {!isLoading && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '2px 12px', marginBottom: 6 }}>
        {htmlFor
          ? <label htmlFor={htmlFor} className="pole-etykieta">{label}</label>
          : <span className="pole-etykieta">{label}</span>}
        {hint && <span style={{ fontSize: 13, color: 'var(--szary)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
