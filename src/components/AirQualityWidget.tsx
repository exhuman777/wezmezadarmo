'use client';

import { useEffect, useState } from 'react';

interface AirQuality {
  stationName?: string;
  distanceKm?: number;
  overall: string | null;
  pollutants: { pm10: string | null; pm25: string | null; so2: string | null; no2: string | null; o3: string | null };
  measuredAt: string;
}

const LEVEL_COLOR: Record<string, string> = {
  'Bardzo dobry': '#22A06B',
  'Dobry': '#4DB97A',
  'Umiarkowany': '#FFB020',
  'Dostateczny': '#FF8A1F',
  'Zły': '#E0432B',
  'Bardzo zły': '#992018',
};

const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: 'Warszawa', lat: 52.2297, lon: 21.0122 },
  { name: 'Kraków', lat: 50.0647, lon: 19.945 },
  { name: 'Wrocław', lat: 51.1079, lon: 17.0385 },
  { name: 'Poznań', lat: 52.4064, lon: 16.9252 },
  { name: 'Gdańsk', lat: 54.352, lon: 18.6466 },
  { name: 'Łódź', lat: 51.7592, lon: 19.4559 },
  { name: 'Katowice', lat: 50.2649, lon: 19.0238 },
  { name: 'Lublin', lat: 51.2465, lon: 22.5684 },
  { name: 'Szczecin', lat: 53.4289, lon: 14.5530 },
  { name: 'Bydgoszcz', lat: 53.1235, lon: 18.0084 },
  { name: 'Białystok', lat: 53.1325, lon: 23.1688 },
  { name: 'Rzeszów', lat: 50.0413, lon: 21.9990 },
  { name: 'Toruń', lat: 53.0138, lon: 18.5985 },
  { name: 'Olsztyn', lat: 53.7784, lon: 20.4801 },
  { name: 'Kielce', lat: 50.8661, lon: 20.6286 },
  { name: 'Opole', lat: 50.6751, lon: 17.9213 },
  { name: 'Zielona Góra', lat: 51.9356, lon: 15.5062 },
  { name: 'Gorzów Wielkopolski', lat: 52.7368, lon: 15.2288 },
];

function colorFor(level: string | null): string {
  if (!level) return 'var(--color-muted-2)';
  return LEVEL_COLOR[level] ?? 'var(--color-muted-2)';
}

const STORAGE_KEY = 'wzd_air_city';

export function AirQualityWidget() {
  const [city, setCity] = useState<string>('Warszawa');
  const [data, setData] = useState<AirQuality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved city preference (no geolocation, no permissions)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && CITIES.find(c => c.name === saved)) setCity(saved);
  }, []);

  // Fetch on city change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const selected = CITIES.find(c => c.name === city) ?? CITIES[0];
    fetch(`/api/public/gios?lat=${selected.lat}&lon=${selected.lon}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(json => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Nie udało się pobrać danych GIOŚ');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [city]);

  function handleCity(next: string) {
    setCity(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next);
  }

  const main = data?.overall ?? null;
  const mainColor = colorFor(main);

  return (
    <div style={{
      padding: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          JAKOŚĆ POWIETRZA · GIOŚ
        </span>
        <select
          value={city}
          onChange={(e) => handleCity(e.target.value)}
          style={{
            fontSize: 12, fontFamily: 'var(--font-mono)',
            padding: '4px 8px', borderRadius: 6,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-2)',
            color: 'var(--color-text-1)',
            cursor: 'pointer',
          }}
        >
          {CITIES.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', padding: '8px 0' }}>
          Ładowanie...
        </div>
      ) : error ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', padding: '8px 0' }}>
          {error}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: mainColor, boxShadow: `0 0 10px ${mainColor}` }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.02em' }}>
              {main ?? 'brak danych'}
            </span>
            {data?.distanceKm != null && (
              <span style={{ fontSize: 10, color: 'var(--color-muted-2)', marginLeft: 'auto' }}>
                {data.stationName} · {data.distanceKm} km
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
            {data && (['pm10', 'pm25', 'no2', 'o3', 'so2'] as const).map((key) => {
              const level = data.pollutants[key];
              if (!level) return null;
              const labels: Record<typeof key, string> = { pm10: 'PM10', pm25: 'PM2.5', no2: 'NO₂', o3: 'O₃', so2: 'SO₂' };
              return (
                <div key={key} style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'var(--color-bg-2)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.06em' }}>{labels[key]}</div>
                  <div style={{ fontSize: 12, color: colorFor(level), fontWeight: 500, marginTop: 2 }}>{level}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <a
        href="https://powietrze.gios.gov.pl"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}
      >
        Dane: powietrze.gios.gov.pl
      </a>
    </div>
  );
}
