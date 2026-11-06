'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PROVINCE_LABELS } from '@/lib/sources/nfz';
import { BENEFIT_GROUPS, POPULAR_CITIES, PROVIDER_TYPES } from '@/lib/sources/nfz-presets';
import { track } from '@/lib/analytics';

type SearchMode = 'queues' | 'providers';
type SortMode = 'fastest' | 'slowest' | 'name' | 'demand';

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
  street: string | null;
  place: string | null;
  postCode: string | null;
  phone: string | null;
}

const PROVINCE_KEYS = Object.keys(PROVINCE_LABELS);

const RECENT_KEY = 'wzd_nfz_recent';
const MAX_RECENT = 5;

function loadRecent(mode: SearchMode): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`${RECENT_KEY}_${mode}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(mode: SearchMode, value: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = loadRecent(mode);
    const next = [value, ...list.filter(v => v !== value)].slice(0, MAX_RECENT);
    window.localStorage.setItem(`${RECENT_KEY}_${mode}`, JSON.stringify(next));
  } catch {
    // storage full
  }
}

export default function NFZSearchClient() {
  const [mode, setMode] = useState<SearchMode>('queues');

  // Queues state
  const [benefit, setBenefit] = useState('PORADNIA KARDIOLOGICZNA');
  const [activeGroup, setActiveGroup] = useState<string>('specjalisci');
  const [province, setProvince] = useState('');
  const [locality, setLocality] = useState('');
  const [caseType, setCaseType] = useState<'1' | '2'>('1');
  const [benefitSuggestions, setBenefitSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentBenefits, setRecentBenefits] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('fastest');

  // Providers state
  const [providerName, setProviderName] = useState('');
  const [providerProvince, setProviderProvince] = useState('');
  const [recentProviders, setRecentProviders] = useState<string[]>([]);

  // Common
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueResults, setQueueResults] = useState<QueueResult[] | null>(null);
  const [providerResults, setProviderResults] = useState<ProviderResult[] | null>(null);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    setRecentBenefits(loadRecent('queues'));
    setRecentProviders(loadRecent('providers'));
  }, []);

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
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [benefit, showSuggestions]);

  const runQueueSearch = useCallback(async () => {
    if (!benefit) return;
    track.nfzSearch('queues', benefit, province);
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
      saveRecent('queues', benefit);
      setRecentBenefits(loadRecent('queues'));
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
    track.nfzSearch('providers', providerName, providerProvince);
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
      if (providerName.trim()) {
        saveRecent('providers', providerName);
        setRecentProviders(loadRecent('providers'));
      }
    } catch {
      setError('Nie udało się pobrać świadczeniodawców.');
    } finally {
      setLoading(false);
    }
  }, [providerName, providerProvince]);

  // Stats from queue results
  const queueStats = useMemo(() => {
    if (!queueResults || queueResults.length === 0) return null;
    const days = queueResults.map(r => r.averageDays).filter((d): d is number => d != null);
    if (days.length === 0) return null;
    const sorted = [...days].sort((a, b) => a - b);
    return {
      fastest: sorted[0],
      slowest: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      withData: days.length,
      total: queueResults.length,
    };
  }, [queueResults]);

  // Sort queue results
  const sortedQueues = useMemo(() => {
    if (!queueResults) return null;
    const sorted = [...queueResults];
    switch (sortMode) {
      case 'fastest':
        sorted.sort((a, b) => (a.averageDays ?? 9999) - (b.averageDays ?? 9999));
        break;
      case 'slowest':
        sorted.sort((a, b) => (b.averageDays ?? -1) - (a.averageDays ?? -1));
        break;
      case 'name':
        sorted.sort((a, b) => a.provider.localeCompare(b.provider));
        break;
      case 'demand':
        sorted.sort((a, b) => (b.awaiting ?? -1) - (a.awaiting ?? -1));
        break;
    }
    return sorted;
  }, [queueResults, sortMode]);

  return (
    <main className="nfz-strona" style={{ minHeight: '100vh' }}>
      <Hero />

      <section style={{ padding: '8px 16px 72px', maxWidth: 680, margin: '0 auto' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {([
            { id: 'queues', label: 'Kolejki', desc: 'Czas oczekiwania' },
            { id: 'providers', label: 'Świadczeniodawcy', desc: 'Znajdź lekarza' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setMode(t.id); setError(null); }}
              aria-pressed={mode === t.id}
              style={{
                padding: '12px 16px',
                background: mode === t.id ? 'var(--tusz)' : 'transparent',
                color: mode === t.id ? 'var(--papier)' : 'var(--tusz)',
                border: '2px solid var(--tusz)',
                borderRadius: 0,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                flex: '1 1 200px', textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 16, fontWeight: 700 }}>{t.label}</span>
              <span style={{ fontSize: 14 }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ============ KOLEJKI ============ */}
        {mode === 'queues' && (
          <>
            {/* Preset categories */}
            <div style={{ marginBottom: 24 }}>
              <p className="pole-etykieta" style={{ margin: '0 0 10px' }}>
                Popularne kategorie
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {BENEFIT_GROUPS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    aria-pressed={activeGroup === g.id}
                    className="filtr"
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(BENEFIT_GROUPS.find(g => g.id === activeGroup)?.benefits ?? []).map(p => (
                  <button
                    key={p}
                    onClick={() => { setBenefit(p); setShowSuggestions(false); }}
                    aria-pressed={benefit === p}
                    style={miniPillStyle(benefit === p)}
                  >{p}</button>
                ))}
              </div>
            </div>

            {/* Recent searches */}
            {recentBenefits.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                <span className="pole-etykieta">Ostatnio:</span>
                {recentBenefits.map(r => (
                  <button
                    key={r}
                    onClick={() => setBenefit(r)}
                    style={miniPillStyle(false)}
                  >{r}</button>
                ))}
              </div>
            )}

            {/* Search form */}
            <div style={formBlockStyle}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <label style={labelStyle}>Świadczenie</label>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => { setBenefit(e.target.value.toUpperCase()); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="np. PORADNIA KARDIOLOGICZNA"
                  style={inputStyle}
                />
                {showSuggestions && benefitSuggestions.length > 0 && (
                  <div style={suggestStyle}>
                    {benefitSuggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setBenefit(s); setShowSuggestions(false); }}
                        style={suggestItemStyle}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Województwo</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} style={inputStyle}>
                    <option value="">Wszystkie</option>
                    {PROVINCE_KEYS.map(k => (
                      <option key={k} value={k}>{PROVINCE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Miasto</label>
                  <input type="text" value={locality} onChange={(e) => setLocality(e.target.value.toUpperCase())} placeholder="np. WARSZAWA" style={inputStyle} />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {POPULAR_CITIES.slice(0, 5).map(c => (
                      <button key={c} onClick={() => setLocality(c)}
                        style={miniPillStyle(locality === c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tryb przyjęcia</label>
                  <select value={caseType} onChange={(e) => setCaseType(e.target.value as '1' | '2')} style={inputStyle}>
                    <option value="1">Stabilny</option>
                    <option value="2">Pilny</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={runQueueSearch} disabled={loading || !benefit} style={primaryButton(loading || !benefit)}>
                  {loading ? 'Szukam...' : 'Sprawdź kolejki'}
                </button>
                {(province || locality || caseType !== '1') && (
                  <button onClick={() => { setProvince(''); setLocality(''); setCaseType('1'); }}
                    className="btn btn-ghost btn-sm">
                    Wyczyść filtry
                  </button>
                )}
              </div>
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            {/* Loading skeleton */}
            {loading && <SkeletonRows />}

            {/* Stats bar */}
            {queueStats && !loading && (
              <div style={statsBarStyle}>
                <Stat label="Najszybciej" value={`${queueStats.fastest} dni`} color="var(--zielen)" />
                <Stat label="Średnio" value={`${queueStats.median} dni`} color="var(--color-text-1)" />
                <Stat label="Najdłużej" value={`${queueStats.slowest} dni`} color="var(--rdza)" />
                <Stat label="Wyników" value={`${queueStats.total}`} color="var(--tusz)" />
              </div>
            )}

            {/* Sort controls + results */}
            {sortedQueues && !loading && (
              <>
                {sortedQueues.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontSize: 15, color: 'var(--color-text-2)' }}>
                      Znaleziono <strong style={{ color: 'var(--color-text-1)', fontSize: 16 }}>{resultCount}</strong> placówek
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {([
                        { id: 'fastest' as const, label: 'Najszybciej' },
                        { id: 'slowest' as const, label: 'Najdłużej' },
                        { id: 'demand' as const, label: 'Najwięcej oczekujących' },
                        { id: 'name' as const, label: 'A–Z' },
                      ]).map(s => (
                        <button key={s.id} onClick={() => setSortMode(s.id)}
                          style={miniPillStyle(sortMode === s.id)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                {sortedQueues.length === 0 ? (
                  <EmptyState mode={mode} />
                ) : (
                  <div style={{ borderBottom: '1px solid var(--linia)' }}>
                    {sortedQueues.map((r, i) => <QueueCard key={i} r={r} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ============ ŚWIADCZENIODAWCY ============ */}
        {mode === 'providers' && (
          <>
            {/* Provider type presets */}
            <div style={{ marginBottom: 16 }}>
              <p className="pole-etykieta" style={{ margin: '0 0 10px' }}>Typ placówki</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PROVIDER_TYPES.map(t => (
                  <button key={t.q} onClick={() => setProviderName(t.q)} style={miniPillStyle(providerName === t.q)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {recentProviders.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                <span className="pole-etykieta">Ostatnio:</span>
                {recentProviders.map(r => (
                  <button key={r} onClick={() => setProviderName(r)} style={miniPillStyle(false)}>{r}</button>
                ))}
              </div>
            )}

            <div style={formBlockStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Nazwa lub typ</label>
                  <input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="np. szpital wojewódzki" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Województwo</label>
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

            {error && <ErrorBox>{error}</ErrorBox>}
            {loading && <SkeletonRows />}

            {providerResults && !loading && (
              <>
                <div style={{ fontSize: 15, color: 'var(--color-text-2)', marginBottom: 16 }}>
                  Znaleziono <strong style={{ color: 'var(--color-text-1)', fontSize: 16 }}>{resultCount}</strong> świadczeniodawców
                </div>
                {providerResults.length === 0 ? (
                  <EmptyState mode={mode} />
                ) : (
                  <div style={{ borderBottom: '1px solid var(--linia)' }}>
                    {providerResults.map((p) => <ProviderCard key={p.code} p={p} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Source attribution */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid var(--linia)', fontSize: 14, color: 'var(--szary)' }}>
          Źródło: <a href="https://api.nfz.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tusz)', textDecoration: 'underline', textUnderlineOffset: 3 }}>api.nfz.gov.pl</a> · Dane orientacyjne, weryfikuj na nfz.gov.pl
        </div>
      </section>
    </main>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  return (
    <section className="prosta" style={{ paddingBottom: 24 }}>
      <div className="prosta-blok">
        <p className="etykieta">Wyszukiwarka NFZ</p>
        <h1>Kolejki i świadczeniodawcy NFZ</h1>
        <p className="pod">Czas oczekiwania do specjalisty, szpitale i przychodnie. Dane na żywo z api.nfz.gov.pl.</p>
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function QueueCard({ r }: { r: QueueResult }) {
  const wait = r.averageDays;
  const waitColor = wait == null ? 'var(--szary)' : wait > 90 ? 'var(--rdza)' : wait > 30 ? 'var(--color-warn)' : 'var(--zielen)';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.provider} ${r.address} ${r.locality}`)}`;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--tusz)', flex: 1, lineHeight: 1.35 }}>{r.provider}</div>
        {wait != null && (
          <span style={{
            padding: '4px 10px',
            color: waitColor, fontFamily: 'var(--f-mono)',
            fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
            border: `2px solid ${waitColor}`,
          }}>~{wait} dni</span>
        )}
      </div>
      <div style={{ fontSize: 14, color: 'var(--szary)', marginBottom: 6, lineHeight: 1.5 }}>{r.benefit}</div>
      <div style={{ fontSize: 15, color: 'var(--color-text-1)', marginBottom: 12, lineHeight: 1.5, fontWeight: 500 }}>{r.address}, {r.locality}</div>

      <div style={{ display: 'flex', gap: 18, marginBottom: 12, fontSize: 14, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
        {r.firstAvailable && <span>Najwcześniej: <strong style={{ color: 'var(--color-text-1)' }}>{r.firstAvailable}</strong></span>}
        {r.awaiting != null && <span>Oczekujących: <strong style={{ color: 'var(--color-text-1)' }}>{r.awaiting}</strong></span>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
        {r.phone && (
          <a href={`tel:${r.phone.replace(/\s/g, '')}`} style={actionLinkStyle}>
            Zadzwoń: {r.phone}
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionLinkStyle, background: 'transparent', color: 'var(--tusz)' }}>
          Pokaż na mapie
        </a>
      </div>
    </div>
  );
}

function ProviderCard({ p }: { p: ProviderResult }) {
  const addressLine = [p.street, p.postCode, p.place].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${addressLine}`)}`;
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--tusz)', marginBottom: 6, lineHeight: 1.35 }}>{p.name}</div>
      {addressLine && <div style={{ fontSize: 15, color: 'var(--color-text-1)', marginBottom: 8, lineHeight: 1.5, fontWeight: 500 }}>{addressLine}</div>}
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 14, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
        {p.nip && <span>NIP: <strong style={{ color: 'var(--color-text-1)' }}>{p.nip}</strong></span>}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
        {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`} style={actionLinkStyle}>Zadzwoń: {p.phone}</a>}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionLinkStyle, background: 'transparent', color: 'var(--tusz)' }}>Pokaż na mapie</a>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 13, color: 'var(--szary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          ...cardStyle,
          height: 100,
          background: 'var(--color-bg-2)',
        }} />
      ))}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '12px 16px', marginBottom: 20,
      color: 'var(--rdza)', fontSize: 15, fontWeight: 600,
      border: '2px solid var(--rdza)',
    }} role="alert">{children}</div>
  );
}

function EmptyState({ mode }: { mode: SearchMode }) {
  const hints: Record<SearchMode, string> = {
    queues: 'Spróbuj zmienić województwo lub poszerzyć kategorię świadczenia.',
    providers: 'Spróbuj wpisać krótszą nazwę lub samo województwo.',
  };
  return (
    <div style={{
      padding: '20px 0',
      borderTop: '1px solid var(--linia)', borderBottom: '1px solid var(--linia)',
    }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--tusz)', marginBottom: 4 }}>Brak wyników</div>
      <div style={{ fontSize: 15, color: 'var(--szary)' }}>{hints[mode]}</div>
    </div>
  );
}

// ============================================================
// STYLES -- accessibility-first (WCAG AA): wieksze czcionki, mocniejsze kontrasty
// ============================================================
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700,
  color: 'var(--tusz)', display: 'block', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: 48, padding: '10px 14px',
  fontSize: 16, fontFamily: 'var(--f-sans)',
  background: 'var(--surface)',
  border: '2px solid var(--tusz)',
  borderRadius: 0,
  color: 'var(--tusz)',
  lineHeight: 1.4,
};

// Formularz wyszukiwania: bez karty, oddzielony cienką linią od wyników.
const formBlockStyle: React.CSSProperties = {
  paddingBottom: 24,
  marginBottom: 24,
  borderBottom: '1px solid var(--linia)',
};

// Wynik: wiersz listy z cienką linią zamiast karty.
const cardStyle: React.CSSProperties = {
  padding: '16px 0',
  borderTop: '1px solid var(--linia)',
};

const suggestStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
  background: 'var(--surface)',
  border: '2px solid var(--tusz)',
  borderRadius: 0, marginTop: 4,
  maxHeight: 260, overflowY: 'auto',
};

const suggestItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  minHeight: 44, padding: '10px 14px', fontSize: 15, fontFamily: 'var(--f-sans)',
  background: 'transparent', border: 'none', borderBottom: '1px solid var(--linia)',
  color: 'var(--tusz)', cursor: 'pointer',
};

const statsBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '16px 0',
  borderTop: '1px solid var(--linia)',
  borderBottom: '1px solid var(--linia)',
  marginBottom: 18,
  flexWrap: 'wrap',
};

const actionLinkStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  minHeight: 44, padding: '8px 14px', borderRadius: 0,
  background: 'var(--tusz)',
  border: '2px solid var(--tusz)',
  fontSize: 14, fontWeight: 700, fontFamily: 'var(--f-mono)',
  color: 'var(--papier)',
  textDecoration: 'none',
};

function miniPillStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: 44, padding: '8px 12px', borderRadius: 0,
    background: active ? 'var(--tusz)' : 'transparent',
    color: active ? 'var(--papier)' : 'var(--tusz)',
    border: '2px solid var(--tusz)',
    fontSize: 14, fontWeight: 500, fontFamily: 'var(--f-sans)', cursor: 'pointer',
    textAlign: 'left',
  };
}

function primaryButton(disabled: boolean): React.CSSProperties {
  return {
    minHeight: 48, padding: '12px 24px',
    background: 'var(--tusz)',
    color: 'var(--papier)',
    border: '2px solid var(--tusz)', borderRadius: 0,
    fontFamily: 'var(--f-mono)', fontSize: 16, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
