/**
 * GIOŚ (Główny Inspektorat Ochrony Środowiska) Air Quality API v1
 * Public, no auth. Source: api.gios.gov.pl/pjp-api/v1/rest
 * NOTE: v1 API uses Polish field names in response (Lista stacji pomiarowych, AqIndex, etc.)
 */

const BASE = 'https://api.gios.gov.pl/pjp-api/v1/rest';

export interface GiosStation {
  id: number;
  stationCode: string;
  stationName: string;
  lat: number;
  lon: number;
  city: string;
  commune: string;
  district: string;
  province: string;
  street: string | null;
}

export interface GiosAqi {
  stationId: number;
  calcDate: string;            // when index was calculated
  sourceDate: string | null;   // when source data was measured
  overall: string | null;      // "Bardzo dobry", "Dobry", "Umiarkowany", "Dostateczny", "Zły", "Bardzo zły"
  pm10: string | null;
  pm25: string | null;
  no2: string | null;
  so2: string | null;
  o3: string | null;
}

type RawStation = Record<string, unknown>;
type RawAqi = Record<string, unknown>;

/** Find first object key matching a substring (case-insensitive). Defensive against
 *  Polish field-name encoding issues across runtimes / different Unicode normal forms. */
function pickKey(obj: Record<string, unknown>, ...substrings: string[]): unknown {
  const keys = Object.keys(obj);
  for (const k of keys) {
    const lower = k.toLowerCase();
    if (substrings.every(s => lower.includes(s.toLowerCase()))) {
      return obj[k];
    }
  }
  return undefined;
}

function parseStation(r: RawStation): GiosStation {
  const id = Number(pickKey(r, 'identyfikator stacji'));
  const code = String(pickKey(r, 'kod stacji') ?? '');
  const name = String(pickKey(r, 'nazwa stacji') ?? '');
  // lat/lon keys contain Greek letters phi/lambda; match by 'wgs84' + 'n'/'e'
  const latStr = pickKey(r, 'wgs84', 'n');
  const lonStr = pickKey(r, 'wgs84', 'e');
  return {
    id,
    stationCode: code,
    stationName: name,
    lat: parseFloat(String(latStr ?? '')),
    lon: parseFloat(String(lonStr ?? '')),
    city: String(pickKey(r, 'nazwa miasta') ?? ''),
    commune: String(pickKey(r, 'gmina') ?? ''),
    district: String(pickKey(r, 'powiat') ?? ''),
    province: String(pickKey(r, 'wojewodztwo') ?? pickKey(r, 'województwo') ?? ''),
    street: (pickKey(r, 'ulica') as string | null) ?? null,
  };
}

export async function getAllStations(): Promise<GiosStation[]> {
  const stations: GiosStation[] = [];
  for (let page = 0; page < 5; page++) {
    const res = await fetch(`${BASE}/station/findAll?page=${page}&size=500`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`GIOS stations error: ${res.status}`);
    const data = await res.json() as Record<string, unknown>;
    const list = (pickKey(data, 'lista stacji') ?? []) as RawStation[];
    if (!Array.isArray(list) || list.length === 0) break;
    stations.push(...list.map(parseStation));
    if (list.length < 500) break;
  }
  return stations;
}

/** Helper: get pollutant level from AqIndex by indicator name. */
function pollutantLevel(aqi: RawAqi, indicator: string): string | null {
  const value = pickKey(aqi, 'nazwa kategorii', indicator.toLowerCase());
  return value ? String(value) : null;
}

export async function getAirIndex(stationId: number): Promise<GiosAqi> {
  const res = await fetch(`${BASE}/aqindex/getIndex/${stationId}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`GIOS AQI error: ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  const aqi = (pickKey(data, 'aqindex') ?? {}) as RawAqi;
  return {
    stationId: Number(pickKey(aqi, 'identyfikator stacji')),
    calcDate: String(pickKey(aqi, 'data wykonania') ?? ''),
    sourceDate: (pickKey(aqi, 'data danych') as string | null) ?? null,
    // Overall: just "Nazwa kategorii indeksu" without indicator suffix
    overall: (() => {
      const keys = Object.keys(aqi);
      for (const k of keys) {
        const l = k.toLowerCase();
        if (l.includes('nazwa kategorii indeksu') && !l.includes('wsk')) {
          return String(aqi[k] ?? '') || null;
        }
      }
      return null;
    })(),
    pm10: pollutantLevel(aqi, 'pm10'),
    pm25: pollutantLevel(aqi, 'pm2.5'),
    no2: pollutantLevel(aqi, 'no2'),
    so2: pollutantLevel(aqi, 'so2'),
    o3: pollutantLevel(aqi, 'o3'),
  };
}

export async function findNearestStation(lat: number, lon: number): Promise<{ station: GiosStation; distanceKm: number } | null> {
  const stations = await getAllStations();
  if (!stations.length) return null;
  let best: { station: GiosStation; distanceKm: number } | null = null;
  for (const s of stations) {
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) continue;
    const d = haversineKm(lat, lon, s.lat, s.lon);
    if (!best || d < best.distanceKm) {
      best = { station: s, distanceKm: d };
    }
  }
  return best;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
