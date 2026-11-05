'use client';

import { useState } from 'react';

/** Przycisk „Kopiuj”: tekst do schowka, komunikat obok (bez animacji). */
export function Kopiuj({ tekst, etykieta }: { tekst: string; etykieta: string }) {
  const [stan, setStan] = useState<'nic' | 'ok' | 'blad'>('nic');

  async function kopiuj() {
    try {
      await navigator.clipboard.writeText(tekst);
      setStan('ok');
    } catch {
      setStan('blad');
    }
  }

  return (
    <div className="press-kopiuj">
      <button type="button" className="btn btn-primary" onClick={kopiuj} aria-label={`Kopiuj: ${etykieta}`}>
        Kopiuj
      </button>
      <span role="status" className="mala">
        {stan === 'ok' ? 'Skopiowano do schowka.' : stan === 'blad' ? 'Przeglądarka zablokowała schowek. Zaznacz tekst i skopiuj ręcznie.' : ''}
      </span>
    </div>
  );
}

/** Rozwija formularz „Napisz do nas” ze stopki i przewija do niego. Bez JS działa sam link do kotwicy. */
export function OtworzKontakt() {
  function otworz(e: React.MouseEvent<HTMLAnchorElement>) {
    const sekcja = document.getElementById('napisz-do-nas');
    if (!(sekcja instanceof HTMLDetailsElement)) return;
    e.preventDefault();
    sekcja.open = true;
    sekcja.scrollIntoView({ block: 'start' });
    sekcja.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }

  return (
    <a href="#napisz-do-nas" className="btn btn-rdza" onClick={otworz}>
      Otwórz formularz kontaktu
    </a>
  );
}
