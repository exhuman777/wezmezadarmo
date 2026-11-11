'use client';

import { useState } from 'react';
import type { MatchResult } from '@/engine/types';
import { LINK_UDOSTEPNIJ, mozeOdmiana, podsumujWynik, swiadczenOdmiana, tekstUdostepnienia, zlote } from '@/lib/podsumowanieWyniku';

/**
 * Góra wyniku: ile świadczeń pasuje, suma stałych kwot z bazy (tylko tam, gdzie kwota jest podana)
 * i „Udostępnij” (Web Share API, inaczej kopiowanie). Link prowadzi na stronę główną bez danych osoby.
 */
export function WynikPodsumowanie({ results }: { results: MatchResult[] }) {
  const [stan, setStan] = useState<'' | 'skopiowano' | 'blad'>('');
  const p = podsumujWynik(results);
  const kwoty: string[] = [];
  if (p.miesiecznie > 0) kwoty.push(`${zlote(p.miesiecznie)} co miesiąc`);
  if (p.jednorazowo > 0) kwoty.push(`${zlote(p.jednorazowo)} jednorazowo lub raz w roku`);

  async function udostepnij() {
    const tekst = tekstUdostepnienia(p.liczba);
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: 'wezmezadarmo.com', text: tekst, url: LINK_UDOSTEPNIJ });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await nav?.clipboard.writeText(`${tekst} ${LINK_UDOSTEPNIJ}`);
      setStan('skopiowano');
    } catch {
      setStan('blad');
    }
    setTimeout(() => setStan(''), 2500);
  }

  return (
    <div className="wynik-podsumowanie" data-testid="wynik-podsumowanie">
      <div className="wynik-podsumowanie-tekst">
        <p className="wynik-podsumowanie-liczba">
          {mozeOdmiana(p.liczba) === 'mogą' ? 'Mogą' : 'Może'} Ci przysługiwać <strong>{p.liczba}</strong> {swiadczenOdmiana(p.liczba)}{p.pewne > 0 && p.pewne < p.liczba ? `, w tym ${p.pewne} ${swiadczenOdmiana(p.pewne) === 'świadczeń' ? 'pewnych' : 'pewne'}` : ''}
        </p>
        {kwoty.length > 0 && (
          <p className="wynik-podsumowanie-kwoty">
            Stałe kwoty z pewnych świadczeń ({p.zKwota}): co najmniej {kwoty.join(' i ')}.
          </p>
        )}
        <p className="wynik-podsumowanie-uwaga">Kwoty orientacyjne, ostatecznie decyduje urząd.</p>
      </div>
      <button type="button" className="btn btn-primary" onClick={udostepnij} aria-live="polite">
        {stan === 'skopiowano' ? 'Skopiowano link' : stan === 'blad' ? 'Nie udało się skopiować' : 'Udostępnij'}
      </button>
    </div>
  );
}
