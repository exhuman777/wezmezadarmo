'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Benefit {
  id: string;
  nazwa: string;
  kategoria: string;
  kwota: string;
  wniosek?: { kanal: string[]; kroki: string[] };
  zrodloUrl?: string;
}

interface MatchResult {
  benefit: Benefit;
  status: 'PRZYSLUGUJE' | 'MOZLIWE' | 'NIE_PRZYSLUGUJE';
  confidence: string;
  matchedCriteria: string[];
  warnings: string[];
}

export default function AgentSwiadczenia() {
  const router = useRouter();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const profileRes = await fetch('/api/agent/profile');
      if (profileRes.status === 401) { router.push('/agent/logowanie'); return; }
      if (!profileRes.ok) { setError('Błąd ładowania profilu.'); setLoading(false); return; }

      const { profile } = await profileRes.json();
      if (profile.type !== 'private') {
        setLoading(false);
        return;
      }

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: {
          wiek: profile.wiek,
          plec: profile.plec,
          stanCywilny: profile.stan_cywilny,
          liczbaDzieci: profile.liczba_dzieci,
          wiekDzieci: profile.wiek_dzieci ?? [],
          dochodMiesiecznie: profile.dochod_miesiecznie,
          dochodNaOsobe: profile.dochod_na_osobe,
          zatrudnienie: profile.zatrudnienie,
          niepelnosprawnosc: profile.niepelnosprawnosc,
          wlasnosc: profile.wlasnosc,
          wojewodztwo: profile.wojewodztwo,
          prowadzDzialalnosc: false,
          pierwszaDzialalnosc: false,
          ciaza: profile.ciaza,
          student: profile.student,
          emeryt: profile.emeryt,
          rolnik: profile.rolnik,
          bezrobotnyZarejestrowany: profile.bezrobotny_zarejestrowany,
        }}),
      });

      if (!verifyRes.ok) { setError('Błąd obliczania świadczeń.'); setLoading(false); return; }
      const data = await verifyRes.json();
      const filtered = (data.results as MatchResult[])
        .filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE')
        .sort((a, b) => (a.status === 'PRZYSLUGUJE' ? -1 : 1));
      setResults(filtered);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Obliczam świadczenia...</div>;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Świadczenia i ulgi</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Co Ci przysługuje</h1>

      {error && <p style={{ color: '#e05c5c', fontSize: 14 }}>{error}</p>}

      {results.length === 0 && !error && (
        <p style={{ fontSize: 14, color: 'var(--color-text-3)' }}>
          Nie znaleziono świadczeń dla Twojego profilu lub konto jest typem JDG.{' '}
          <Link href="/agent/panel/profil" style={{ color: 'var(--color-green)' }}>Sprawdź profil</Link>
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map(({ benefit, status, matchedCriteria, warnings }) => (
          <div key={benefit.id} style={{
            border: `1px solid ${status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius)', padding: '20px',
            background: 'var(--color-bg-1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)' }}>{benefit.nazwa}</div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px',
                borderRadius: 3, border: '1px solid',
                color: status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-text-3)',
                borderColor: status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-border)',
              }}>
                {status === 'PRZYSLUGUJE' ? 'przysługuje' : 'możliwe'}
              </span>
            </div>
            {benefit.kwota && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-green)', marginBottom: 8 }}>{benefit.kwota}</div>}
            {matchedCriteria.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>
                {matchedCriteria.join(' - ')}
              </div>
            )}
            {warnings.length > 0 && (
              <div style={{ fontSize: 12, color: '#e0a830', marginTop: 4 }}>{warnings[0]}</div>
            )}
            {benefit.zrodloUrl && (
              <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginTop: 8 }}>
                Oficjalne źródło &rarr;
              </a>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
