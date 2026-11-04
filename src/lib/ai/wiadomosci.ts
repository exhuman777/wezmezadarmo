/**
 * Czyszczenie historii czatu przysłanej przez przeglądarkę, zanim trafi do modelu.
 * - tylko role `user` i `assistant` (klient nie może dopisać własnej wiadomości `system`),
 * - tylko tekst, ostatnie MAX_WIADOMOSCI wiadomości, każda przycięta do MAX_ZNAKOW,
 * - łączny limit znaków, żeby jedno zapytanie nie kosztowało fortuny.
 */
export interface WiadomoscCzatu {
  role: 'user' | 'assistant';
  content: string;
}

export const MAX_WIADOMOSCI = 20;
export const MAX_ZNAKOW = 4000;
export const MAX_ZNAKOW_RAZEM = 24000;

export function oczyscWiadomosci(wejscie: unknown): WiadomoscCzatu[] {
  if (!Array.isArray(wejscie)) return [];
  const czyste: WiadomoscCzatu[] = [];
  for (const m of wejscie) {
    if (!m || typeof m !== 'object') continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string') continue;
    const tekst = content.trim().slice(0, MAX_ZNAKOW);
    if (tekst) czyste.push({ role, content: tekst });
  }
  const ostatnie = czyste.slice(-MAX_WIADOMOSCI);
  // Od najnowszych w tył, aż do łącznego limitu.
  let suma = 0;
  const wynik: WiadomoscCzatu[] = [];
  for (let i = ostatnie.length - 1; i >= 0; i--) {
    suma += ostatnie[i].content.length;
    if (suma > MAX_ZNAKOW_RAZEM) break;
    wynik.unshift(ostatnie[i]);
  }
  // Rozmowa musi kończyć się pytaniem użytkownika.
  while (wynik.length && wynik[wynik.length - 1].role !== 'user') wynik.pop();
  return wynik;
}
