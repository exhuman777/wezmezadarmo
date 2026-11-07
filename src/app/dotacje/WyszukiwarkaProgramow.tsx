'use client';

import { useMemo, useState } from 'react';
import { PROGRAMS, type B2BProgram, type ProgramStatus } from '@/data/programs-b2b';

/**
 * Publiczna wyszukiwarka programów z bazy src/data/programs-b2b.ts: bez konta, bez e-maila i bez API.
 * Filtr tekstowy (nazwa, instytucja, opis kwoty, notatki; bez polskich znaków też działa) i filtr statusu.
 * Przy każdym programie link do strony instytucji i data ostatniego sprawdzenia w bazie.
 */

const STATUS: Record<ProgramStatus, string> = {
  open: 'nabór otwarty',
  continuous: 'nabór ciągły',
  expected: 'nabór planowany',
  closed: 'nabór zamknięty',
};

const FILTRY: { id: 'wszystkie' | 'trwajace' | ProgramStatus; nazwa: string }[] = [
  { id: 'wszystkie', nazwa: 'Wszystkie' },
  { id: 'trwajace', nazwa: 'Otwarte i ciągłe' },
  { id: 'expected', nazwa: 'Planowane' },
  { id: 'closed', nazwa: 'Zamknięte' },
];

function bezZnakow(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
}

function pasuje(p: B2BProgram, fraza: string): boolean {
  if (!fraza) return true;
  const tekst = bezZnakow([p.name, p.institution, p.maxAmountDesc, p.notes, p.category].join(' '));
  return bezZnakow(fraza).split(/\s+/).filter(Boolean).every(slowo => tekst.includes(slowo));
}

export function WyszukiwarkaProgramow() {
  const [fraza, setFraza] = useState('');
  const [filtr, setFiltr] = useState<(typeof FILTRY)[number]['id']>('trwajace');

  const wyniki = useMemo(() => PROGRAMS.filter(p => {
    if (filtr === 'trwajace' && p.status !== 'open' && p.status !== 'continuous') return false;
    if (filtr !== 'wszystkie' && filtr !== 'trwajace' && p.status !== filtr) return false;
    return pasuje(p, fraza.trim());
  }), [fraza, filtr]);

  return (
    <div data-testid="wyszukiwarka-programow">
      <div className="pole" style={{ marginTop: 16 }}>
        <label htmlFor="szukaj-programu">Szukaj programu</label>
        <input
          id="szukaj-programu"
          className="pole-wejscie"
          type="search"
          value={fraza}
          onChange={e => setFraza(e.target.value)}
          placeholder="np. szkolenia, PFRON, mazowieckie"
          autoComplete="off"
        />
      </div>
      <div className="filtry" role="group" aria-label="Status naboru">
        {FILTRY.map(f => (
          <button key={f.id} type="button" className="filtr" aria-pressed={filtr === f.id} onClick={() => setFiltr(f.id)}>{f.nazwa}</button>
        ))}
      </div>
      <p className="mala" role="status" style={{ marginTop: 12 }}>Programów: {wyniki.length} z {PROGRAMS.length}</p>
      <ul className="lista">
        {wyniki.map(p => (
          <li key={p.id} className="lista-para">
            <span className="lista-nazwa"><b>{p.name}</b></span>
            <span className="lista-opis">{p.institution} · {STATUS[p.status]}{p.closeDate ? `, do ${p.closeDate}` : ''}</span>
            <span className="lista-opis">{p.maxAmountDesc}</span>
            <span className="mala">
              <a href={p.url} target="_blank" rel="noopener noreferrer">Strona programu</a> · sprawdzone w bazie {p.lastVerified}
            </span>
          </li>
        ))}
      </ul>
      {wyniki.length === 0 && <p className="pod" style={{ marginTop: 12 }}>Nic nie pasuje. Zmień frazę albo wybierz „Wszystkie”.</p>}
    </div>
  );
}
