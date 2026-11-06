/** Walidacja polskiego numeru telefonu (osobny plik: formularz w przeglądarce nie ładuje listy domen). */

/**
 * Polski numer telefonu: 9 cyfr, opcjonalnie z +48 (albo 0048) na początku.
 * Spacje, myślniki, kropki i nawiasy są ignorowane. Zwraca postać „+48 600 100 200” albo null.
 */
export function normalizujTelefon(surowy: string): string | null {
  const s = surowy.trim();
  if (!/^[\d\s+().-]+$/.test(s)) return null;
  let cyfry = s.replace(/[\s().-]/g, '');
  if (cyfry.startsWith('+48')) cyfry = cyfry.slice(3);
  else if (cyfry.startsWith('0048')) cyfry = cyfry.slice(4);
  if (!/^\d{9}$/.test(cyfry)) return null;
  return `+48 ${cyfry.slice(0, 3)} ${cyfry.slice(3, 6)} ${cyfry.slice(6)}`;
}
