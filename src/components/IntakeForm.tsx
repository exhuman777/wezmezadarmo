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
        setPeselError('Nieprawidlowy numer PESEL');
        return;
      }
      setDecoded(decodePesel(clean));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!decoded) {
      setPeselError('Wpisz prawidlowy numer PESEL');
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
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      {/* PESEL */}
      <div>
        <label className="block text-[10px] font-bold tracking-[1.5px] text-text-3 mb-1.5 uppercase">
          PESEL
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={pesel}
          onChange={(e) => handlePeselChange(e.target.value)}
          placeholder="00000000000"
          className="w-full px-3 py-2.5 bg-bg-2 border border-border rounded-md text-text-1 font-mono text-sm outline-none transition-colors focus:border-accent placeholder:text-text-3"
          disabled={isLoading}
        />
        {peselError && (
          <p className="mt-1 text-xs text-red">{peselError}</p>
        )}
        {decoded && (
          <div className="mt-1.5 flex gap-3 text-xs">
            <span className="text-green">
              Wiek: {decoded.wiek} lat
            </span>
            <span className="text-accent">
              {decoded.plec === 'K' ? 'Kobieta' : 'Mezczyzna'}
            </span>
          </div>
        )}
      </div>

      {/* NIP */}
      <div>
        <label className="block text-[10px] font-bold tracking-[1.5px] text-text-3 mb-1.5 uppercase">
          NIP <span className="font-normal tracking-normal">(opcjonalnie -- dla swiadczen firmowych)</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="0000000000"
          className="w-full px-3 py-2.5 bg-bg-2 border border-border rounded-md text-text-1 font-mono text-sm outline-none transition-colors focus:border-accent placeholder:text-text-3"
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !decoded}
        className="w-full py-3 rounded-md font-bold text-sm tracking-[1px] uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: decoded ? 'linear-gradient(135deg, #f0a860, #ffb56b)' : undefined,
          color: decoded ? '#1a1208' : undefined,
          backgroundColor: decoded ? undefined : 'rgba(255,255,255,0.04)',
          borderColor: decoded ? 'transparent' : 'rgba(255,255,255,0.06)',
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        {isLoading ? 'Sprawdzam...' : 'Sprawdz co Ci sie nalezy'}
      </button>
    </form>
  );
}
