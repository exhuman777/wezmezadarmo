'use client';

import { useEffect, useState, useCallback } from 'react';
import { PROVINCE_LABELS, POPULAR_BENEFITS } from '@/lib/sources/nfz';

type SearchMode = 'queues' | 'providers' | 'drugs';

interface QueueResult {
  provider: string;
  locality: string;
  address: string;
  phone: string | null;
  benefit: string;
  awaiting: number | null;
  averageDays: number | null;
  firstAvailable: string | null;
}

interface ProviderResult {
  code: string;
  name: string;
  nip: string | null;
  address: string | null;
  city: string | null;
  postCode: string | null;
  phone: string | null;
  www: string | null;
}

interface DrugResult {
  name: string;
  commonName: string | null;
  power: string | null;
  pack: string | null;
  refund: string | null;
  lumpSumFee: string | null;
  hundred: string | null;
  thirty: string | null;
  fifty: string | null;
  free: string | null;
}

const PROVINCE_KEYS = Object.keys(PROVINCE_LABELS);

export default function NFZSearchClient() {
  const [mode, setMode] = useState<SearchMode>('queues');

  // Queues state
  const [benefit, setBenefit] = useState('PORADNIA KARDIOLOGICZNA');
  const [province, setProvince] = useState('');
  const [locality, setLocality] = useState('');
  const [caseType, setCaseType] = useState<'1' | '2'>('1');
  const [benefitSuggestions, setBenefitSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Providers state
  const [providerName, setProviderName] = useState('');
  const [providerProvince, setProviderProvince] = useState('');

  // Drugs state
  const [drugName, setDrugName] = useState('');

  // Common
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueResults, setQueueResults] = useState<QueueResult[] | null>(null);
  const [providerResults, setProviderResults] = useState<ProviderResult[] | null>(null);
  const [drugResults, setDrugResults] = useState<DrugResult[] | null>(null);
  const [resultCount, setResultCount] = useState(0);

  // Autocomplete benefits as user types
  useEffect(() => {
    if (benefit.length < 3 || !showSuggestions) {
      setBenefitSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/nfz?type=benefits&q=${encodeURIComponent(benefit)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        setBenefitSuggestions(data.benefits ?? []);
      } catch {
        // aborted
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [benefit, showSuggestions]);

  const runQueueSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQueueResults(null);
    try {
      const params = new URLSearchParams({
        type: 'queues',
        benefit,
        case: caseType,
        limit: '25',
      });
      if (province) params.set('province', province);
      if (locality) params.set('locality', locality);
      const res = await fetch(`/api/public/nfz?${params}`);
      if (!res.ok) throw new Error('Błąd zapytania');
      const data = await res.json();
      setQueueResults(data.results ?? []);
      setResultCount(data.count ?? 0);
    } catch {
      setError('Nie udało się pobrać kolejek NFZ. Spróbuj później.');
    } finally {
      setLoading(false);
    }
  }, [benefit, caseType, province, locality]);

  const runProviderSearch = useCallback(async () => {
    if (!providerName.trim() && !providerProvince) {
      setError('Podaj nazwę lub województwo');
      return;
    }
    setLoading(true);
    setError(null);
    setProviderResults(null);
    try {
      const params = new URLSearchParams({ type: 'providers', limit: '25' });
      if (providerName) params.set('name', providerName);
      if (providerProvince) params.set('province', providerProvince);
      const res = await fetch(`/api/public/nfz?${params}`);
      if (!res.ok) throw new Error('Błąd');
      const data = await res.json();
      setProviderResults(data.providers ?? []);
      setResultCount(data.count ?? 0);
    } catch {
      setError('Nie udało się pobrać świadczeniodawców.');
    } finally {
      setLoading(false);
    }
  }, [providerName, providerProvince]);

  const runDrugSearch = useCallback(async () => {
    if (drugName.length < 3) {
      setError('Podaj nazwę leku (min 3 znaki)');
      return;
    }
    setLoading(true);
    setError(null);
    setDrugResults(null);
    try {
      const res = await fetch(`/api/public/nfz?type=drugs&name=${encodeURIComponent(drugName)}&limit=25`);
      if (!res.ok) throw new Error('Błąd');
      const data = await res.json();
      setDrugResults(data.drugs ?? []);
      setResultCount(data.count ?? 0);
    } catch {
      setError('Nie udało się pobrać refundacji leków.');
    } finally {
      setLoading(false);
    }
  }, [drugName]);

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #062418 0%, #0a3a26 100%)',
        borderRadius: '0 0 24px 24px',
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(40px, 5vw, 64px) 20px clamp(36px, 4vw, 56px)',
      }}>
        <div className="wrap" style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(142,234,173,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Wyszukiwarka NFZ
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 12px', maxWidth: 720 }}>
            Kolejki, lekarze, refundacja leków
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 560 }}>
            Sprawdź czas oczekiwania do specjalisty, znajdź świadczeniodawcę NFZ, sprawdź refundację leków. Dane na żywo z api.nfz.gov.pl.
          </p>
        </div>
      </section>

      <section style={{ padding: 'clamp(28px, 4vw, 48px) 20px', maxWidth: 1080, margin: '0 auto' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {([
            { id: 'queues', label: 'Kolejki', desc: 'Czas oczekiwania' },
            { id: 'providers', label: 'Świadczeniodawcy', desc: 'Znajdź lekarza' },
            { id: 'drugs', label: 'Refundacja leków', desc: 'Sprawdź dopłatę' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setMode(t.id); setError(null); }}
              style={{
                padding: '12px 18px',
                background: mode === t.id ? 'var(--color-text-1)' : 'var(--color-surface)',
                color: mode === t.id ? 'var(--color-bg-0)' : 'var(--color-text-2)',
                border: '1px solid ' + (mode === t.id ? 'var(--color-text-1)' : 'var(--color-border)'),
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                minWidth: 160,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{t.label}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Filter form */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16, padding: 20,
          marginBottom: 24,
        }}>
          {mode === 'queues' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>
                  Świadczenie (np. PORADNIA KARDIOLOGICZNA)
                </label>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => { setBenefit(e.target.value.toUpperCase()); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="np. PORADNIA OKULISTYCZNA"
                  style={inputStyle}
                />
                {showSuggestions && benefitSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8, marginTop: 4,
                    maxHeight: 240, overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}>
                    {benefitSuggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setBenefit(s); setShowSuggestions(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '8px 12px', fontSize: 13,
                          background: 'transparent', border: 'none',
                          color: 'var(--color-text-2)', cursor: 'pointer',
                        }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {POPULAR_BENEFITS.slice(0, 8).map(p => (
                  <button
                    key={p}
                    onClick={() => setBenefit(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: benefit === p ? 'var(--color-accent-soft)' : 'var(--color-bg-2)',
                      color: benefit === p ? 'var(--color-accent)' : 'var(--color-text-3)',
                      border: '1px solid ' + (benefit === p ? 'var(--color-accent)' : 'var(--color-border)'),
                      fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                    }}
                  >{p}</button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Województwo</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} style={inputStyle}>
                    <option value="">Wszystkie</option>
                    {PROVINCE_KEYS.map(k => (
                      <option key={k} value={k}>{PROVINCE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Miasto (opcjonalnie)</label>
                  <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="np. WARSZAWA" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Tryb</label>
                  <select value={caseType} onChange={(e) => setCaseType(e.target.value as '1' | '2')} style={inputStyle}>
                    <option value="1">Stabilny</option>
                    <option value="2">Pilny</option>
                  </select>
                </div>
              </div>

              <button onClick={runQueueSearch} disabled={loading || !benefit} style={primaryButton(loading || !benefit)}>
                {loading ? 'Szukam...' : 'Sprawdź kolejki'}
              </button>
            </div>
          )}

          {mode === 'providers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Nazwa świadczeniodawcy</label>
                  <input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="np. szpital wojewódzki" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Województwo</label>
                  <select value={providerProvince} onChange={(e) => setProviderProvince(e.target.value)} style={inputStyle}>
                    <option value="">Wszystkie</option>
                    {PROVINCE_KEYS.map(k => (
                      <option key={k} value={k}>{PROVINCE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={runProviderSearch} disabled={loading} style={primaryButton(loading)}>
                {loading ? 'Szukam...' : 'Znajdź świadczeniodawców'}
              </button>
            </div>
          )}

          {mode === 'drugs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', display: 'block', marginBottom: 6 }}>Nazwa leku</label>
                <input type="text" value={drugName} onChange={(e) => setDrugName(e.target.value)} placeholder="np. metformin" style={inputStyle} />
              </div>
              <button onClick={runDrugSearch} disabled={loading || drugName.length < 3} style={primaryButton(loading || drugName.length < 3)}>
                {loading ? 'Szukam...' : 'Sprawdź refundację'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: 14, marginBottom: 20,
            background: 'var(--color-red-bg, #fce4e6)',
            color: 'var(--color-red, #8b1f24)',
            borderRadius: 10, fontSize: 13,
          }}>{error}</div>
        )}

        {/* Results */}
        {mode === 'queues' && queueResults && (
          <ResultsList count={resultCount}>
            {queueResults.length === 0 && <Empty />}
            {queueResults.map((r, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-1)', flex: 1 }}>{r.provider}</div>
                  {r.averageDays != null && (
                    <span style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: r.averageDays > 90 ? '#fce4e6' : r.averageDays > 30 ? '#fff4e0' : '#e0f0db',
                      color: r.averageDays > 90 ? '#8b1f24' : r.averageDays > 30 ? '#a05a1a' : '#2d6b2a',
                      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>~{r.averageDays} dni</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>{r.benefit}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{r.address}, {r.locality}</div>
                {r.phone && <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 4 }}>Tel: {r.phone}</div>}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)' }}>
                  {r.firstAvailable && <span>Najwcześniej: {r.firstAvailable}</span>}
                  {r.awaiting != null && <span>Oczekujących: {r.awaiting}</span>}
                </div>
              </div>
            ))}
          </ResultsList>
        )}

        {mode === 'providers' && providerResults && (
          <ResultsList count={resultCount}>
            {providerResults.length === 0 && <Empty />}
            {providerResults.map((p) => (
              <div key={p.code} style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-1)', marginBottom: 6 }}>{p.name}</div>
                {p.address && <div style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{p.address}{p.postCode && `, ${p.postCode}`}{p.city && ` ${p.city}`}</div>}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', flexWrap: 'wrap' }}>
                  {p.phone && <span>Tel: {p.phone}</span>}
                  {p.nip && <span>NIP: {p.nip}</span>}
                  {p.www && <a href={p.www.startsWith('http') ? p.www : `https://${p.www}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>{p.www}</a>}
                </div>
              </div>
            ))}
          </ResultsList>
        )}

        {mode === 'drugs' && drugResults && (
          <ResultsList count={resultCount}>
            {drugResults.length === 0 && <Empty />}
            {drugResults.map((d, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-1)' }}>{d.name}</div>
                {d.commonName && <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Subst. czynna: {d.commonName}</div>}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
                  {d.power && <span>{d.power}</span>}
                  {d.pack && <span>{d.pack}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {d.refund && <Pill label="Kategoria" value={d.refund} />}
                  {d.lumpSumFee && <Pill label="Ryczałt" value={`${d.lumpSumFee} zł`} />}
                  {d.thirty && <Pill label="30%" value={`${d.thirty} zł`} />}
                  {d.fifty && <Pill label="50%" value={`${d.fifty} zł`} />}
                  {d.hundred && <Pill label="100%" value={`${d.hundred} zł`} />}
                  {d.free && <Pill label="bezpłatny" value="✓" tone="green" />}
                </div>
              </div>
            ))}
          </ResultsList>
        )}

        {/* Source attribution */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--color-border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-2)', textAlign: 'center' }}>
          Źródło: <a href="https://api.nfz.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>api.nfz.gov.pl</a> · Dane orientacyjne, weryfikuj na nfz.gov.pl
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  fontSize: 14, fontFamily: 'var(--font-mono)',
  background: 'var(--color-bg-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text-1)',
  outline: 'none',
};

const cardStyle: React.CSSProperties = {
  padding: 16,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
};

function primaryButton(disabled: boolean): React.CSSProperties {
  return {
    padding: '12px 24px',
    background: disabled ? 'var(--color-surface-2)' : 'var(--color-text-1)',
    color: disabled ? 'var(--color-muted-2)' : 'var(--color-bg-0)',
    border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    alignSelf: 'flex-start',
  };
}

function ResultsList({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
        Znaleziono: <strong style={{ color: 'var(--color-text-1)' }}>{count}</strong> wyników
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function Empty() {
  return <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-3)', fontSize: 13 }}>Brak wyników</div>;
}

function Pill({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 999,
      background: tone === 'green' ? '#e0f0db' : 'var(--color-bg-2)',
      color: tone === 'green' ? '#2d6b2a' : 'var(--color-text-2)',
      border: '1px solid ' + (tone === 'green' ? '#a5d6a7' : 'var(--color-border)'),
      fontSize: 11, fontFamily: 'var(--font-mono)',
    }}>
      <span style={{ opacity: 0.6 }}>{label}:</span> <strong>{value}</strong>
    </span>
  );
}
