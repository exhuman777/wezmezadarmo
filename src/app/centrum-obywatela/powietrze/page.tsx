'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AqiData {
  station: { id: number; name: string; distanceKm?: number };
  index: {
    stCalcDate: string;
    stIndexLevel: { indexLevelName: string } | null;
    pm10IndexLevel: { indexLevelName: string } | null;
    pm25IndexLevel: { indexLevelName: string } | null;
    so2IndexLevel: { indexLevelName: string } | null;
    no2IndexLevel: { indexLevelName: string } | null;
    o3IndexLevel: { indexLevelName: string } | null;
  };
}

const LEVEL_COLOR: Record<string, string> = {
  'Bardzo dobry': '#22A06B',
  'Dobry': '#5cb85c',
  'Umiarkowany': '#f0ad4e',
  'Dostateczny': '#ff8c00',
  'Zły': '#d9534f',
  'Bardzo zły': '#8b0000',
};

function Pill({ label, level }: { label: string; level: string | null }) {
  const color = level ? (LEVEL_COLOR[level] ?? '#777') : '#aaa';
  return (
    <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10 }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)' }}>{level ?? '—'}</span>
      </div>
    </div>
  );
}

export default function PowietrzePage() {
  const [aqi, setAqi] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkGeo() {
    setError(null); setLoading(true); setAqi(null);
    if (!navigator.geolocation) { setError('Brak wsparcia geolokalizacji'); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`/api/public/gios?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        if (!res.ok) { setError(`Błąd API: ${res.status}`); setLoading(false); return; }
        setAqi(await res.json());
      } catch (e) { setError((e as Error).message); }
      setLoading(false);
    }, err => { setError(`Geolokalizacja: ${err.message}`); setLoading(false); });
  }

  async function checkCity(lat: number, lon: number) {
    setError(null); setLoading(true); setAqi(null);
    try {
      const res = await fetch(`/api/public/gios?lat=${lat}&lon=${lon}`);
      if (!res.ok) { setError(`Błąd API: ${res.status}`); setLoading(false); return; }
      setAqi(await res.json());
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00695C' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          GIOŚ · Jakość powietrza
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Jakość powietrza GIOŚ</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24 }}>
        Indeks jakości powietrza ze stacji pomiarowej najbliżej Twojej lokalizacji.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={checkGeo} disabled={loading} className="btn btn-primary btn-sm">
          {loading ? 'Sprawdzam...' : 'Użyj mojej lokalizacji'}
        </button>
        <button onClick={() => checkCity(52.2297, 21.0122)} disabled={loading} style={btnStyle}>Warszawa</button>
        <button onClick={() => checkCity(50.0647, 19.9450)} disabled={loading} style={btnStyle}>Kraków</button>
        <button onClick={() => checkCity(50.2649, 19.0238)} disabled={loading} style={btnStyle}>Katowice</button>
        <button onClick={() => checkCity(51.7592, 19.4560)} disabled={loading} style={btnStyle}>Łódź</button>
        <button onClick={() => checkCity(54.3520, 18.6466)} disabled={loading} style={btnStyle}>Gdańsk</button>
      </div>

      {error && <p style={{ color: '#dc5050', marginBottom: 16 }}>{error}</p>}

      {aqi && (
        <>
          <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 6 }}>
              Stacja pomiarowa {aqi.station.distanceKm != null && `· ${aqi.station.distanceKm} km od Ciebie`}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-900)' }}>{aqi.station.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>Pomiar: {new Date(aqi.index.stCalcDate).toLocaleString('pl-PL')}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <Pill label="Indeks ogólny" level={aqi.index.stIndexLevel?.indexLevelName ?? null} />
            <Pill label="PM10" level={aqi.index.pm10IndexLevel?.indexLevelName ?? null} />
            <Pill label="PM2.5" level={aqi.index.pm25IndexLevel?.indexLevelName ?? null} />
            <Pill label="SO₂" level={aqi.index.so2IndexLevel?.indexLevelName ?? null} />
            <Pill label="NO₂" level={aqi.index.no2IndexLevel?.indexLevelName ?? null} />
            <Pill label="O₃" level={aqi.index.o3IndexLevel?.indexLevelName ?? null} />
          </div>
        </>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://powietrze.gios.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>powietrze.gios.gov.pl</a> · API GIOŚ.
      </p>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'var(--white)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  fontSize: 13,
  cursor: 'pointer',
  color: 'var(--ink-700)',
};
