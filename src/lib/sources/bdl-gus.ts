/**
 * BDL GUS - Bank Danych Lokalnych Główny Urząd Statystyczny.
 * REST/JSON. Bez klucza: 10 req/min/IP. Z X-ClientId: 100 req/min.
 * Use case: dane demograficzne i ekonomiczne per gmina/powiat/województwo.
 */

const BASE = 'https://bdl.stat.gov.pl/api/v1';

export interface BdlUnit {
  id: string;       // terytId
  name: string;
  level: number;    // poziomy BDL: 6=gmina, 5=powiat, 2=województwo
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

// Wybrane variableId z BDL (sprawdzone 1.11.2026 przez /api/v1/variables/{id}).
// Ludność i grupy wieku są dostępne dla gmin (poziom 6).
// Stopa bezrobocia i wynagrodzenie GUS publikuje tylko dla powiatów (poziom 5),
// więc dla gminy pobieramy je z jej powiatu.
export const BDL_VARS = {
  populationTotal: '72305',          // ludność ogółem (osoby)
  populationPreproductive: '149',    // ludność w wieku przedprodukcyjnym (osoby)
  populationPostproductive: '155',   // ludność w wieku poprodukcyjnym (osoby)
  unemploymentRate: '60270',         // stopa bezrobocia rejestrowanego (%), powiat
  averageGrossSalary: '64428',       // przeciętne miesięczne wynagrodzenie brutto (zł), powiat
} as const;

const POWIAT_VARS: ReadonlyArray<string> = [BDL_VARS.unemploymentRate, BDL_VARS.averageGrossSalary];

/** Id powiatu dla jednostki BDL gminy (12 znaków, ostatnie 3 to typ gminy). */
export function powiatIdForGmina(terytId: string): string | null {
  return /^\d{12}$/.test(terytId) ? `${terytId.slice(0, 9)}000` : null;
}

interface RawResult {
  id: string | number;
  values: Array<{ year: string; val: number }>;
}

export function mapUnitData(raw: { results?: RawResult[] }): BdlUnitData {
  const byId = new Map((raw.results ?? []).map(r => [String(r.id), r]));
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

export async function searchUnit(name: string, level: number = 6): Promise<BdlUnit[]> {
  const params = new URLSearchParams({
    name, level: String(level), format: 'json', 'page-size': '20',
  });
  const res = await fetch(`${BASE}/units/search?${params}`, {
    signal: AbortSignal.timeout(10_000),
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

  // Dokładna nazwa na początku listy (BDL dopasowuje po prefiksie: "Lublin" daje też "Lubliniec")
  const lowerName = trimmed.toLocaleLowerCase('pl-PL');
  const exactFirst = (list: BdlUnit[]) => [...list].sort((a, b) =>
    Number(b.name.toLocaleLowerCase('pl-PL') === lowerName) - Number(a.name.toLocaleLowerCase('pl-PL') === lowerName));

  // 1. Gmina (level 6)
  let units = exactFirst(await searchUnit(capitalized, 6));
  if (units.length > 0) return units;

  // 2. Powiat (level 5), np. miasto na prawach powiatu
  units = exactFirst(await searchUnit(capitalized, 5));
  if (units.length > 0) return units;

  // 3. Prefix fallback dla dluzszych nazw (BDL match jest "starts with")
  //    "Łomianki" -> "Łom" -> znajduje "Łomianki gm. miejska"
  if (capitalized.length > 4) {
    const prefix = capitalized.slice(0, Math.min(5, capitalized.length));
    const prefixUnits = await searchUnit(prefix, 6);
    // Filter -- zostawiamy te ktore zawieraja oryginalna nazwe
    const lower = trimmed.toLocaleLowerCase('pl-PL');
    const filtered = prefixUnits.filter(u => u.name.toLocaleLowerCase('pl-PL').includes(lower));
    if (filtered.length > 0) return filtered;
    // Bez filtra: jesli i tak nic z prefix nie pasuje, pokaz najlepsze dopasowania
    if (prefixUnits.length > 0) return prefixUnits;
  }

  return [];
}

async function fetchVars(terytId: string, vars: ReadonlyArray<string>): Promise<{ results?: RawResult[] }> {
  const params = new URLSearchParams({ format: 'json' });
  for (const vid of vars) params.append('var-id', vid);
  const res = await fetch(`${BASE}/data/by-unit/${terytId}?${params}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`BDL data error: ${res.status}`);
  return res.json();
}

export async function fetchUnitData(terytId: string): Promise<BdlUnitData> {
  const own = await fetchVars(terytId, Object.values(BDL_VARS));
  // Dla gminy bezrobocie i wynagrodzenie bierzemy z powiatu (GUS nie liczy ich dla gmin)
  const powiat = powiatIdForGmina(terytId);
  const missing = POWIAT_VARS.filter(v => !(own.results ?? []).some(r => String(r.id) === v && r.values?.length));
  if (powiat && powiat !== terytId && missing.length) {
    try {
      const fromPowiat = await fetchVars(powiat, missing);
      own.results = [...(own.results ?? []), ...(fromPowiat.results ?? [])];
    } catch { /* bez danych powiatu pokazujemy to, co jest */ }
  }
  return mapUnitData(own);
}
