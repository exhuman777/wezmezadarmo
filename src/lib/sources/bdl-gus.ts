/**
 * BDL GUS - Bank Danych Lokalnych Główny Urząd Statystyczny.
 * REST/JSON. Bez klucza: 10 req/min/IP. Z X-ClientId: 100 req/min.
 * Use case: dane demograficzne i ekonomiczne per gmina/powiat/województwo.
 */

const BASE = 'https://bdl.stat.gov.pl/api/v1';

export interface BdlUnit {
  id: string;       // terytId
  name: string;
  level: number;    // 5=gmina, 4=powiat, 2=województwo
  parentName?: string;
}

export interface BdlUnitData {
  populationTotal: number | null;
  populationPreproductive: number | null;
  populationPostproductive: number | null;
  unemploymentRate: number | null;
  averageGrossSalary: number | null;
  year: string | null;
}

// Wybrane variableId z BDL (znajdź własne w panelu BDL -> metadane -> zmienne)
export const BDL_VARS = {
  populationTotal: '60559',
  populationPreproductive: '60565',
  populationPostproductive: '60567',
  unemploymentRate: '60270',
  averageGrossSalary: '459163',
} as const;

interface RawResult {
  id: string;
  values: Array<{ year: string; val: number }>;
}

export function mapUnitData(raw: { results?: RawResult[] }): BdlUnitData {
  const byId = new Map((raw.results ?? []).map(r => [r.id, r]));
  const get = (id: string): { val: number; year: string } | null => {
    const r = byId.get(id);
    if (!r || !r.values || r.values.length === 0) return null;
    const latest = r.values[r.values.length - 1];
    return { val: latest.val, year: latest.year };
  };
  const pop = get(BDL_VARS.populationTotal);
  return {
    populationTotal: pop?.val ?? null,
    populationPreproductive: get(BDL_VARS.populationPreproductive)?.val ?? null,
    populationPostproductive: get(BDL_VARS.populationPostproductive)?.val ?? null,
    unemploymentRate: get(BDL_VARS.unemploymentRate)?.val ?? null,
    averageGrossSalary: get(BDL_VARS.averageGrossSalary)?.val ?? null,
    year: pop?.year ?? null,
  };
}

export async function searchUnit(name: string, level: number = 5): Promise<BdlUnit[]> {
  const params = new URLSearchParams({
    name, level: String(level), format: 'json', 'page-size': '20',
  });
  const res = await fetch(`${BASE}/units/search?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`BDL search error: ${res.status}`);
  const data = await res.json();
  return ((data.results ?? []) as Array<{ id: string; name: string; level?: number; parentName?: string }>)
    .map(u => ({ id: u.id, name: u.name, level: u.level ?? level, parentName: u.parentName }));
}

/**
 * Smart search z fallback'iem -- BDL wymaga capitalized prefix matchu.
 * "łomianki" -> 0 wynikow, "Łom" -> 3 wyniki (Łomianki, Łomża, Łomża m.).
 * Dlatego: capitalize + try gmina, potem powiat, potem prefix dla dluzszych nazw.
 */
export async function searchUnitSmart(rawName: string): Promise<BdlUnit[]> {
  const trimmed = rawName.trim();
  if (trimmed.length < 2) return [];

  // Capitalize 1st letter (locale-aware dla polskich znakow: ł, ą, ę itp.)
  const capitalized = trimmed.charAt(0).toLocaleUpperCase('pl-PL') + trimmed.slice(1);

  // 1. Exact gmina (level 5)
  let units = await searchUnit(capitalized, 5);
  if (units.length > 0) return units;

  // 2. Powiat (level 4) -- np. "Warszawa" jako miasto na prawach powiatu
  units = await searchUnit(capitalized, 4);
  if (units.length > 0) return units;

  // 3. Prefix fallback dla dluzszych nazw (BDL match jest "starts with")
  //    "Łomianki" -> "Łom" -> znajduje "Łomianki gm. miejska"
  if (capitalized.length > 4) {
    const prefix = capitalized.slice(0, Math.min(5, capitalized.length));
    const prefixUnits = await searchUnit(prefix, 5);
    // Filter -- zostawiamy te ktore zawieraja oryginalna nazwe
    const lower = trimmed.toLocaleLowerCase('pl-PL');
    const filtered = prefixUnits.filter(u => u.name.toLocaleLowerCase('pl-PL').includes(lower));
    if (filtered.length > 0) return filtered;
    // Bez filtra: jesli i tak nic z prefix nie pasuje, pokaz najlepsze dopasowania
    if (prefixUnits.length > 0) return prefixUnits;
  }

  return [];
}

export async function fetchUnitData(terytId: string): Promise<BdlUnitData> {
  const params = new URLSearchParams({ format: 'json' });
  for (const vid of Object.values(BDL_VARS)) {
    params.append('var-id', vid);
  }
  const res = await fetch(`${BASE}/data/by-unit/${terytId}?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`BDL data error: ${res.status}`);
  return mapUnitData(await res.json());
}
