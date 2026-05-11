'use client';

import { useState } from 'react';
import { decodePesel, validatePesel } from '@/engine/pesel';

interface IntakeFormProps {
  onSubmit: (data: { pesel: string; wiek: number; plec: 'K' | 'M'; nip?: string }) => void;
  isLoading: boolean;
}

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [mode, setMode] = useState<'pesel' | 'manual'>('pesel');
  const [pesel, setPesel] = useState('');
  const [nip, setNip] = useState('');
  const [peselError, setPeselError] = useState('');
  const [decoded, setDecoded] = useState<{ wiek: number; plec: 'K' | 'M' } | null>(null);

  // Manual mode state
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
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 sm:space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('pesel')}
          className="flex-1 py-2 rounded-lg text-[13px] sm:text-[14px] font-semibold border cursor-pointer transition-all"
          style={mode === 'pesel' ? {
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            color: '#fff',
            borderColor: 'transparent',
          } : {
            background: 'var(--color-bg-2)',
            color: 'var(--color-text-2)',
            borderColor: 'var(--color-border)',
          }}
        >
          Mam PESEL
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className="flex-1 py-2 rounded-lg text-[13px] sm:text-[14px] font-semibold border cursor-pointer transition-all"
          style={mode === 'manual' ? {
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            color: '#fff',
            borderColor: 'transparent',
          } : {
            background: 'var(--color-bg-2)',
            color: 'var(--color-text-2)',
            borderColor: 'var(--color-border)',
          }}
        >
          Podam wiek i płeć
        </button>
      </div>

      {mode === 'pesel' ? (
        /* PESEL input */
        <div>
          <label className="block text-[13px] sm:text-[14px] font-semibold text-text-2 mb-1.5">
            PESEL
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={pesel}
            onChange={(e) => handlePeselChange(e.target.value)}
            placeholder="00000000000"
            className="w-full px-3.5 py-3 bg-bg-2 border border-border rounded-xl text-text-1 text-[16px] outline-none transition-colors focus:border-accent placeholder:text-text-3"
            disabled={isLoading}
          />
          {peselError && (
            <p className="mt-1.5 text-[13px] text-red">{peselError}</p>
          )}
          {decoded && (
            <div className="mt-2 flex gap-3 text-[14px] font-medium">
              <span className="text-green font-semibold">Wiek: {decoded.wiek} lat</span>
              <span className="text-accent font-semibold">{decoded.plec === 'K' ? 'Kobieta' : 'Mężczyzna'}</span>
            </div>
          )}
        </div>
      ) : (
        /* Manual age + gender */
        <div className="space-y-3">
          <div>
            <label className="block text-[13px] sm:text-[14px] font-semibold text-text-2 mb-1.5">
              Wiek (liczba lat)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={manualAge}
              onChange={(e) => setManualAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="np. 35"
              className="w-full px-3.5 py-3 bg-bg-2 border border-border rounded-xl text-text-1 text-[16px] outline-none transition-colors focus:border-accent placeholder:text-text-3"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-[13px] sm:text-[14px] font-semibold text-text-2 mb-1.5">
              Płeć
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setManualPlec('K')}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-[15px] font-semibold border cursor-pointer transition-all"
                style={manualPlec === 'K' ? {
                  background: 'var(--color-amber-bg)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-text-1)',
                } : {
                  background: 'var(--color-bg-2)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-2)',
                }}
              >
                Kobieta
              </button>
              <button
                type="button"
                onClick={() => setManualPlec('M')}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-[15px] font-semibold border cursor-pointer transition-all"
                style={manualPlec === 'M' ? {
                  background: 'var(--color-amber-bg)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-text-1)',
                } : {
                  background: 'var(--color-bg-2)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-2)',
                }}
              >
                Mężczyzna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NIP */}
      <div>
        <label className="block text-[13px] sm:text-[14px] font-semibold text-text-2 mb-1.5">
          NIP <span className="font-normal text-text-3 text-[12px]">(opcjonalnie, dla świadczeń firmowych)</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="0000000000"
          className="w-full px-3.5 py-3 bg-bg-2 border border-border rounded-xl text-text-1 text-[16px] outline-none transition-colors focus:border-accent placeholder:text-text-3"
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))' : 'var(--color-bg-3)',
          color: canSubmit ? '#fff' : 'var(--color-text-3)',
          border: '1px solid transparent',
          boxShadow: canSubmit ? '0 2px 12px var(--color-amber-border)' : 'none',
        }}
      >
        {isLoading ? 'Sprawdzam...' : 'Sprawdź co Ci się należy'}
      </button>
    </form>
  );
}
