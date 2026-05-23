'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Unit { id: string; name: string; parentName?: string }
interface UnitData {
  populationTotal: number | null;
  populationPreproductive: number | null;
  populationPostproductive: number | null;
  unemploymentRate: number | null;
  averageGrossSalary: number | null;
  year: string | null;
}

export default function GusPage() {
  const [q, setQ] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [picked, setPicked] = useState<Unit | null>(null);
  const [data, setData] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(null); setUnits([]); setData(null); setPicked(null);
    try {
      const res = await fetch(`/api/public/bdl-gus?gmina=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUnits(json.units ?? []);
      if ((json.units ?? []).length === 0) {
        setError(`Nie znaleziono gminy "${q.trim()}". Spróbuj wpisać samą początkową część nazwy (np. "Łom" zamiast "Łomianki"). Niektóre miejscowości to nie samodzielne gminy - są częścią innej (np. Głusk to dzielnica Lublina).`);
      }
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function pickUnit(u: Unit) {
    setPicked(u); setData(null); setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/public/bdl-gus?terytId=${u.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#004B8D' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          GUS / BDL · dane gminy
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Dane demograficzne i ekonomiczne</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 20, lineHeight: 1.6 }}>
        Liczba mieszkańców, bezrobocie, średnie wynagrodzenie - dla Twojej gminy. Dane Banku Danych Lokalnych GUS.
      </p>

      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Nazwa gminy (np. Warszawa, Kraków, Łomianki)"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15 }} />
        <button type="submit" className="btn btn-primary" disabled={loading}>Szukaj</button>
      </form>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {units.length > 0 && !picked && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Wybierz gminę ({units.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {units.map(u => (
              <button key={u.id} onClick={() => pickUnit(u)}
                style={{ textAlign: 'left', padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <div style={{ fontSize: 14, color: 'var(--ink-900)', fontWeight: 500 }}>{u.name}</div>
                {u.parentName && <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{u.parentName}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {picked && data && (
        <div style={{ padding: 20, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 14, color: 'var(--ink-900)' }}>
            {picked.name}
            {picked.parentName && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-500)', marginLeft: 8 }}>· {picked.parentName}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Stat label="Ludność ogółem" value={data.populationTotal?.toLocaleString('pl-PL')} />
            <Stat label="Przedprodukcyjna" value={data.populationPreproductive?.toLocaleString('pl-PL')} />
            <Stat label="Poprodukcyjna" value={data.populationPostproductive?.toLocaleString('pl-PL')} />
            <Stat label="Bezrobocie" value={data.unemploymentRate != null ? `${data.unemploymentRate}%` : null} />
            <Stat label="Przeciętne wynagrodzenie" value={data.averageGrossSalary != null ? `${data.averageGrossSalary.toLocaleString('pl-PL')} PLN` : null} />
            <Stat label="Rok" value={data.year} />
          </div>
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://bdl.stat.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>bdl.stat.gov.pl</a>
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: 'var(--ink-900)', fontWeight: 500 }}>{value ?? 'brak danych'}</div>
    </div>
  );
}
