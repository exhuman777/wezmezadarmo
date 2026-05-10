'use client';

import { useState } from 'react';
import { decodePesel, validatePesel } from '@/engine/pesel';

interface IntakeFormProps {
  onSubmit: (data: { pesel: string; wiek: number; plec: 'K' | 'M'; nip?: string }) => void;
  isLoading: boolean;
}

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [pesel, setPesel] = useState('');
  const [nip, setNip] = useState('');
  const [peselError, setPeselError] = useState('');
  const [decoded, setDecoded] = useState<{ wiek: number; plec: 'K' | 'M' } | null>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 sm:space-y-5">
      {/* PESEL */}
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

      {/* NIP */}
      <div>
        <label className="block text-[13px] sm:text-[14px] font-semibold text-text-2 mb-1.5">
          NIP <span className="font-normal text-text-3 text-[12px]">(opcjonalnie -- dla świadczeń firmowych)</span>
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
        disabled={isLoading || !decoded}
        className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        style={{
          background: decoded ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))' : 'var(--color-bg-3)',
          color: decoded ? '#fff' : 'var(--color-text-3)',
          border: '1px solid transparent',
          boxShadow: decoded ? '0 2px 12px var(--color-amber-border)' : 'none',
        }}
      >
        {isLoading ? 'Sprawdzam...' : 'Sprawdź co Ci się należy'}
      </button>
    </form>
  );
}
