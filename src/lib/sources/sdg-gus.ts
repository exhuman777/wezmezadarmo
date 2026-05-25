/**
 * GUS SDG (Sustainable Development Goals) Polska API.
 *
 * Publiczne API bez rejestracji - dane via GitHub raw.
 * https://sdg.gov.pl/api/ - 17 celow SDG, 200+ wskaznikow krajowych i globalnych.
 *
 * Aktualizacja: dane roczne, najczesciej do 2024.
 */

const SDG_BASE = 'https://api.github.com/repos/statisticspoland/sdg-indicators-pl/contents/api/v1';

export interface SdgMetadata {
  nazwa: string;
  cel: string;
  priorytet: string;
  definicja: string;
  jednostka: string;
  wymiary: string;
  metodologia: string;
  zrodlo: string;
  czestotliwosc: string;
  uwagi: string;
  data_aktualizacji_danych: string;
  data_aktualizacji_metadanych: string;
}

export interface SdgDataPoint {
  rok: string;
  wartosc: number;
}

export interface SdgIndicator {
  id: string;          // np. '11-5-a'
  cel: number;         // 11
  metadane: SdgMetadata;
  dane: SdgDataPoint[];
}

/**
 * Pobierz pojedynczy wskaznik SDG po ID (np. '11-5-a').
 */
export async function getSdgIndicator(id: string, type: 'krajowe' | 'globalne' = 'krajowe'): Promise<SdgIndicator | null> {
  const [cel] = id.split('-');
  const url = `${SDG_BASE}/${type}/${cel}/${id}.json`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const raw = await res.json();
    const indicator = raw[id]?.[0];
    if (!indicator) return null;

    const meta = indicator.metadane?.[0];
    const dataRaw = indicator.dane?.[0]?.['ogółem']?.[0] ?? {};

    const dane: SdgDataPoint[] = Object.entries(dataRaw)
      .map(([rok, wartosc]) => ({ rok, wartosc: Number(wartosc) }))
      .filter(d => !isNaN(d.wartosc))
      .sort((a, b) => a.rok.localeCompare(b.rok));

    return {
      id,
      cel: Number(cel),
      metadane: meta,
      dane,
    };
  } catch (e) {
    console.error('[sdg-gus] fetch error:', id, e);
    return null;
  }
}

/**
 * Lista najwazniejszych wskaznikow do dashboardu wezmezadarmo.
 * Wybor: dotyczace zycia obywateli (mieszkania, edukacja, zdrowie, srodowisko).
 */
export const FEATURED_INDICATORS = [
  { id: '11-5-a', label: 'Nowe mieszkania w miastach na 1000 mieszkancow', category: 'mieszkania' },
  { id: '4-3-g', label: 'Dzieci 3-5 lat objete wychowaniem przedszkolnym (%)', category: 'edukacja' },
  { id: '3-2-a', label: 'Lekarze na 10 tys. mieszkancow', category: 'zdrowie' },
  { id: '3-2-b', label: 'Pielegniarki na 10 tys. mieszkancow', category: 'zdrowie' },
  { id: '13-1-a', label: 'Dynamika emisji CO2 (2010=100)', category: 'klimat' },
  { id: '13-2-a', label: 'Udzial OZE w koncowym zuzyciu energii brutto (%)', category: 'klimat' },
  { id: '5-1-a', label: 'Luka placowa kobiety vs mezczyzni (%)', category: 'rownosc' },
  { id: '8-3-a', label: 'Wskaznik zatrudnienia osob 15-89 lat (%)', category: 'praca' },
] as const;
