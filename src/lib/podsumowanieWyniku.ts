import type { MatchResult } from '@/engine/types';
import { NA_KONIEC } from '@/engine/matcher';

/**
 * Podsumowanie wyniku kalkulatora: liczba pasujących świadczeń i suma stałych kwot z bazy.
 * Sumujemy tylko pewne świadczenia (PRZYSLUGUJE) pieniężne o jednej, stałej kwocie (kwotaMin === kwotaMax > 0)
 * wypłacane miesięcznie albo jednorazowo lub raz w roku. Widełki, kwoty „do”, oszczędności,
 * wartość usług, świadczenia zawieszone i świadczenia po śmierci bliskiej osoby (NA_KONIEC)
 * pomijamy, więc suma nigdy nie jest zawyżona.
 */
export interface PodsumowanieWyniku {
  liczba: number;
  pewne: number;
  miesiecznie: number;
  /** jednorazowo albo raz w roku */
  jednorazowo: number;
  /** ile świadczeń weszło do sumy */
  zKwota: number;
}

const POMIN_KWOTE = /zawieszon|nie przysługuje|zamiast|oszczędn|wartość|wartości|refundacj|^\s*do\s/i;

export function podsumujWynik(wyniki: MatchResult[]): PodsumowanieWyniku {
  let miesiecznie = 0;
  let jednorazowo = 0;
  let zKwota = 0;
  for (const { benefit: b, status } of wyniki) {
    if (status !== 'PRZYSLUGUJE') continue;
    if (b.kwotaMin === undefined || b.kwotaMin !== b.kwotaMax || b.kwotaMin <= 0) continue;
    if (POMIN_KWOTE.test(b.kwota) || NA_KONIEC.has(b.id)) continue;
    const czest = b.czestotliwosc.trim().toLowerCase();
    if (czest.startsWith('miesięcznie')) miesiecznie += b.kwotaMin;
    else if (czest.startsWith('jednorazowo') || czest.startsWith('rocznie')) jednorazowo += b.kwotaMin;
    else continue;
    zKwota++;
  }
  return {
    liczba: wyniki.length,
    pewne: wyniki.filter((w) => w.status === 'PRZYSLUGUJE').length,
    miesiecznie: Math.round(miesiecznie),
    jednorazowo: Math.round(jednorazowo),
    zKwota,
  };
}

export function zlote(kwota: number): string {
  return `${kwota.toLocaleString('pl-PL').replace(/[\u00a0\u202f]/g, ' ')} zł`;
}

/** Polska odmiana słowa „świadczenie” po liczbie. */
export function swiadczenOdmiana(n: number): string {
  if (n === 1) return 'świadczenie';
  const r10 = n % 10;
  const r100 = n % 100;
  if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return 'świadczenia';
  return 'świadczeń';
}

/** „może” albo „mogą” zgodnie z liczbą (3 świadczenia mogą, 5 świadczeń może). */
export function mozeOdmiana(n: number): string {
  return swiadczenOdmiana(n) === 'świadczenia' ? 'mogą' : 'może';
}

/** Adres do udostępnienia: strona główna bez danych osobowych. */
export const LINK_UDOSTEPNIJ = 'https://www.wezmezadarmo.com/?ref=wynik';

/** Tekst do udostępnienia: tylko liczba świadczeń, bez odpowiedzi i bez kwot osoby. */
export function tekstUdostepnienia(liczba: number): string {
  if (liczba <= 0) return 'Sprawdź, co Ci się należy od państwa. Bez konta i za darmo.';
  return `Sprawdzam na wezmezadarmo.com: ${mozeOdmiana(liczba)} mi przysługiwać ${liczba} ${swiadczenOdmiana(liczba)}. Sprawdź, co należy się Tobie. Bez konta i za darmo.`;
}
