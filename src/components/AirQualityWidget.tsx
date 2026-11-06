'use client';

import { useEffect, useState } from 'react';

interface AirQuality {
  stationName?: string;
  distanceKm?: number;
  overall: string | null;
  pollutants: { pm10: string | null; pm25: string | null; so2: string | null; no2: string | null; o3: string | null };
  measuredAt: string;
}

// Kolory z palety strony; każdy ma kontrast co najmniej 4,5:1 na papierze (WCAG AA).
const LEVEL_COLOR: Record<string, string> = {
  'Bardzo dobry': 'var(--zielen)',
  'Dobry': 'var(--zielen)',
  'Umiarkowany': 'var(--color-warn)',
  'Dostateczny': 'var(--color-warn)',
  'Zły': 'var(--rdza)',
  'Bardzo zły': 'var(--rdza)',
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
  if (!level) return 'var(--szary)';
  return LEVEL_COLOR[level] ?? 'var(--szary)';
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
    <section className="wid" aria-label="Jakość powietrza GIOŚ">
      <div className="wid-glowa">
        <span>Jakość powietrza · GIOŚ</span>
        <label className="sr-only" htmlFor="wid-miasto">Miasto</label>
        <select id="wid-miasto" className="pole-wejscie wid-wybor" value={city} onChange={(e) => handleCity(e.target.value)}>
          {CITIES.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="wid-mala">Ładowanie...</p>
      ) : error ? (
        <p className="wid-mala">{error}</p>
      ) : (
        <>
          <p className="wid-wynik">
            <span style={{ color: mainColor }}>{main ?? 'brak danych'}</span>
            {data?.distanceKm != null && <small>{data.stationName} · {data.distanceKm} km</small>}
          </p>
          <ul className="wid-lista">
            {data && (['pm10', 'pm25', 'no2', 'o3', 'so2'] as const).map((key) => {
              const level = data.pollutants[key];
              if (!level) return null;
              const labels: Record<typeof key, string> = { pm10: 'PM10', pm25: 'PM2.5', no2: 'NO₂', o3: 'O₃', so2: 'SO₂' };
              return (
                <li key={key}>
                  <span className="wid-nazwa">{labels[key]}</span>
                  <span style={{ color: colorFor(level), fontWeight: 600 }}>{level}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <a className="wid-zrodlo" href="https://powietrze.gios.gov.pl" target="_blank" rel="noopener noreferrer">Dane: powietrze.gios.gov.pl</a>
    </section>
  );
}
