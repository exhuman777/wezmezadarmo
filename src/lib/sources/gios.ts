/**
 * GIOŚ (Główny Inspektorat Ochrony Środowiska) Air Quality API
 * Public, no auth. Source: powietrze.gios.gov.pl/pjp/content/api
 * Use cases: air quality alerts for asthma sufferers, smog warnings.
 */

const BASE = 'https://api.gios.gov.pl/pjp-api/rest';

export interface GiosStation {
  id: number;
  stationName: string;
  gegrLat: string;
  gegrLon: string;
  city: { id: number; name: string; commune: { communeName: string; districtName: string; provinceName: string } };
  addressStreet: string | null;
}

export interface GiosSensor {
  id: number;
  stationId: number;
  param: { paramName: string; paramFormula: string; paramCode: string; idParam: number };
}

export interface GiosIndexLevel {
  id: number;
  indexLevelName: string; // e.g. "Dobry", "Bardzo dobry", "Umiarkowany"
}

export interface GiosAqi {
  id: number;
  stCalcDate: string;
  stIndexLevel: GiosIndexLevel | null;
  pm10IndexLevel: GiosIndexLevel | null;
  pm25IndexLevel: GiosIndexLevel | null;
  so2IndexLevel: GiosIndexLevel | null;
  no2IndexLevel: GiosIndexLevel | null;
  o3IndexLevel: GiosIndexLevel | null;
}

export async function getAllStations(): Promise<GiosStation[]> {
  const res = await fetch(`${BASE}/station/findAll`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // stations rarely change; cache 24h
  });
  if (!res.ok) throw new Error(`GIOŚ stations error: ${res.status}`);
  return res.json();
}

export async function getAirIndex(stationId: number): Promise<GiosAqi> {
  const res = await fetch(`${BASE}/aqindex/getIndex/${stationId}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 1800 }, // 30 min cache; data updates hourly
  });
  if (!res.ok) throw new Error(`GIOŚ AQI error: ${res.status}`);
  return res.json();
}

/**
 * Find nearest GIOŚ station by Haversine distance.
 * Citizen passes lat/lon (no PII), returns closest station id.
 */
export async function findNearestStation(lat: number, lon: number): Promise<{ station: GiosStation; distanceKm: number } | null> {
  const stations = await getAllStations();
  if (!stations.length) return null;
  let best: { station: GiosStation; distanceKm: number } | null = null;
  for (const s of stations) {
    const sLat = parseFloat(s.gegrLat);
    const sLon = parseFloat(s.gegrLon);
    if (!Number.isFinite(sLat) || !Number.isFinite(sLon)) continue;
    const d = haversineKm(lat, lon, sLat, sLon);
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
