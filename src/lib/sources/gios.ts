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

interface RawStation {
  'Identyfikator stacji': number;
  'Kod stacji': string;
  'Nazwa stacji': string;
  'WGS84 φ N': string;
  'WGS84 λ E': string;
  'Identyfikator miasta'?: number;
  'Nazwa miasta'?: string;
  'Gmina'?: string;
  'Powiat'?: string;
  'Województwo'?: string;
  'Ulica'?: string | null;
}

interface RawAqi {
  'Identyfikator stacji pomiarowej': number;
  'Data wykonania obliczeń indeksu': string;
  'Nazwa kategorii indeksu': string | null;
  'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st'?: string | null;
  'Nazwa kategorii indeksu dla wskażnika SO2'?: string | null;
  'Nazwa kategorii indeksu dla wskażnika NO2'?: string | null;
  'Nazwa kategorii indeksu dla wskażnika PM10'?: string | null;
  'Nazwa kategorii indeksu dla wskażnika PM2.5'?: string | null;
  'Nazwa kategorii indeksu dla wskażnika O3'?: string | null;
}

function parseStation(r: RawStation): GiosStation {
  return {
    id: r['Identyfikator stacji'],
    stationCode: r['Kod stacji'],
    stationName: r['Nazwa stacji'],
    lat: parseFloat(r['WGS84 φ N']),
    lon: parseFloat(r['WGS84 λ E']),
    city: r['Nazwa miasta'] ?? '',
    commune: r['Gmina'] ?? '',
    district: r['Powiat'] ?? '',
    province: r['Województwo'] ?? '',
    street: r['Ulica'] ?? null,
  };
}

export async function getAllStations(): Promise<GiosStation[]> {
  // v1 paginates; use size=500 to get most in one page (~1800 total stations)
  const stations: GiosStation[] = [];
  for (let page = 0; page < 5; page++) {
    const res = await fetch(`${BASE}/station/findAll?page=${page}&size=500`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`GIOŚ stations error: ${res.status}`);
    const data = await res.json();
    const list = (data['Lista stacji pomiarowych'] ?? []) as RawStation[];
    if (list.length === 0) break;
    stations.push(...list.map(parseStation));
    if (list.length < 500) break;
  }
  return stations;
}

export async function getAirIndex(stationId: number): Promise<GiosAqi> {
  const res = await fetch(`${BASE}/aqindex/getIndex/${stationId}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`GIOŚ AQI error: ${res.status}`);
  const data = await res.json();
  const aqi = (data.AqIndex ?? {}) as RawAqi;
  return {
    stationId: aqi['Identyfikator stacji pomiarowej'],
    calcDate: aqi['Data wykonania obliczeń indeksu'],
    sourceDate: aqi['Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st'] ?? null,
    overall: aqi['Nazwa kategorii indeksu'] ?? null,
    pm10: aqi['Nazwa kategorii indeksu dla wskażnika PM10'] ?? null,
    pm25: aqi['Nazwa kategorii indeksu dla wskażnika PM2.5'] ?? null,
    no2: aqi['Nazwa kategorii indeksu dla wskażnika NO2'] ?? null,
    so2: aqi['Nazwa kategorii indeksu dla wskażnika SO2'] ?? null,
    o3: aqi['Nazwa kategorii indeksu dla wskażnika O3'] ?? null,
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
