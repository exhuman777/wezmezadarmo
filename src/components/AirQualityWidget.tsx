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

function colorFor(level: string | null): string {
  if (!level) return 'var(--color-muted-2)';
  return LEVEL_COLOR[level] ?? 'var(--color-muted-2)';
}

interface Props {
  /** Optional fixed station id; if not provided uses browser geolocation. */
  stationId?: number;
}

export function AirQualityWidget({ stationId }: Props) {
  const [data, setData] = useState<AirQuality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAir(url: string) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Błąd źródła');
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Nie udało się pobrać jakości powietrza.');
          setLoading(false);
        }
      }
    }

    if (stationId) {
      fetchAir(`/api/public/gios?station=${stationId}`);
      return () => { cancelled = true; };
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // Fallback: Warsaw centrum
      fetchAir('/api/public/gios?lat=52.2297&lon=21.0122');
      return () => { cancelled = true; };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchAir(`/api/public/gios?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
      () => fetchAir('/api/public/gios?lat=52.2297&lon=21.0122'),
      { timeout: 4000 },
    );

    return () => { cancelled = true; };
  }, [stationId]);

  if (loading) {
    return (
      <div style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          ŁADOWANIE JAKOŚCI POWIETRZA...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // silent failure - air quality is bonus, not core
  }

  const main = data.overall ?? 'brak danych';
  const mainColor = colorFor(data.overall);

  return (
    <div style={{
      padding: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          JAKOŚĆ POWIETRZA · GIOŚ
        </span>
        {data.distanceKm != null && (
          <span style={{ fontSize: 10, color: 'var(--color-muted-2)' }}>
            {data.stationName} · {data.distanceKm} km
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: mainColor, boxShadow: `0 0 10px ${mainColor}` }} />
        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.02em' }}>
          {main}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
        {(['pm10', 'pm25', 'no2', 'o3', 'so2'] as const).map((key) => {
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
