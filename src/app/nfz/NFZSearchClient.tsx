'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PROVINCE_LABELS } from '@/lib/sources/nfz';
import { BENEFIT_GROUPS, POPULAR_CITIES, PROVIDER_TYPES } from '@/lib/sources/nfz-presets';

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
    <main style={{ minHeight: '100vh' }}>
      <Hero />

      <section style={{ padding: 'clamp(24px, 4vw, 40px) 20px', maxWidth: 1080, margin: '0 auto' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {([
            { id: 'queues', label: 'Kolejki', desc: 'Czas oczekiwania' },
            { id: 'providers', label: 'Świadczeniodawcy', desc: 'Znajdź lekarza' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setMode(t.id); setError(null); }}
              style={{
                padding: '18px 26px',
                background: mode === t.id ? '#0d2b1c' : '#fff',
                color: mode === t.id ? '#fff' : 'var(--color-text-1)',
                border: '2px solid ' + (mode === t.id ? '#0d2b1c' : 'var(--color-border)'),
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                minWidth: 200, flex: 1, maxWidth: 280,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.label}</span>
              <span style={{ fontSize: 14, opacity: 0.85 }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ============ KOLEJKI ============ */}
        {mode === 'queues' && (
          <>
            {/* Preset categories */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: 22,
              marginBottom: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 14 }}>
                Popularne kategorie
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {BENEFIT_GROUPS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    style={{
                      padding: '10px 16px',
                      background: activeGroup === g.id ? '#0d2b1c' : '#f5f5f0',
                      color: activeGroup === g.id ? '#fff' : 'var(--color-text-1)',
                      border: '2px solid ' + (activeGroup === g.id ? '#0d2b1c' : 'transparent'),
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 14, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.7 }}>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(BENEFIT_GROUPS.find(g => g.id === activeGroup)?.benefits ?? []).map(p => (
                  <button
                    key={p}
                    onClick={() => { setBenefit(p); setShowSuggestions(false); }}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      background: benefit === p ? '#fce4e6' : '#fff',
                      color: benefit === p ? '#8b1f24' : 'var(--color-text-1)',
                      border: '1.5px solid ' + (benefit === p ? '#b3262e' : 'var(--color-border)'),
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>

            {/* Recent searches */}
            {recentBenefits.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)' }}>Ostatnio:</span>
                {recentBenefits.map(r => (
                  <button
                    key={r}
                    onClick={() => setBenefit(r)}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      background: '#fff', border: '1.5px solid var(--color-border)',
                      fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)',
                      cursor: 'pointer',
                    }}
                  >{r}</button>
                ))}
              </div>
            )}

            {/* Search form */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: 22,
              marginBottom: 26,
            }}>
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
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-1)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}>
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
                <Stat label="Najszybciej" value={`${queueStats.fastest} dni`} color="#22A06B" />
                <Stat label="Średnio" value={`${queueStats.median} dni`} color="var(--color-text-1)" />
                <Stat label="Najdłużej" value={`${queueStats.slowest} dni`} color="#c0392b" />
                <Stat label="Wyników" value={`${queueStats.total}`} color="var(--color-text-3)" />
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em', marginBottom: 8 }}>TYP PLACÓWKI</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PROVIDER_TYPES.map(t => (
                  <button key={t.q} onClick={() => setProviderName(t.q)} style={miniPillStyle(providerName === t.q)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {recentProviders.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)' }}>OSTATNIO:</span>
                {recentProviders.map(r => (
                  <button key={r} onClick={() => setProviderName(r)} style={miniPillStyle(false)}>{r}</button>
                ))}
              </div>
            )}

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 18, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
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
                <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 12 }}>
                  Znaleziono <strong style={{ color: 'var(--color-text-1)' }}>{resultCount}</strong> świadczeniodawców
                </div>
                {providerResults.length === 0 ? (
                  <EmptyState mode={mode} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {providerResults.map((p) => <ProviderCard key={p.code} p={p} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Source attribution */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-2)', textAlign: 'center' }}>
          Źródło: <a href="https://api.nfz.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>api.nfz.gov.pl</a> · Dane orientacyjne, weryfikuj na nfz.gov.pl
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
    <section style={{
      background: 'linear-gradient(160deg, #062418 0%, #0a3a26 100%)',
      borderRadius: '0 0 24px 24px',
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(36px, 4vw, 56px) 20px clamp(32px, 4vw, 48px)',
    }}>
      <div style={{ position: 'absolute', top: '20%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="wrap" style={{ position: 'relative', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(142,234,173,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 14 }}>
          Wyszukiwarka NFZ
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 10px', maxWidth: 720 }}>
          Kolejki i świadczeniodawcy NFZ
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: 560 }}>
          Sprawdź czas oczekiwania do specjalisty, znajdź szpital lub przychodnię. Dane na żywo z api.nfz.gov.pl.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function QueueCard({ r }: { r: QueueResult }) {
  const wait = r.averageDays;
  const waitColor = wait == null ? 'var(--color-muted-2)' : wait > 90 ? '#c0392b' : wait > 30 ? '#a05a1a' : '#2d6b2a';
  const waitBg = wait == null ? 'var(--color-bg-2)' : wait > 90 ? '#fce4e6' : wait > 30 ? '#fff4e0' : '#e0f0db';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.provider} ${r.address} ${r.locality}`)}`;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-1)', flex: 1, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{r.provider}</div>
        {wait != null && (
          <span style={{
            padding: '8px 14px', borderRadius: 999,
            background: waitBg, color: waitColor,
            fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
            border: `2px solid ${waitColor}`,
          }}>~{wait} dni</span>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8, lineHeight: 1.5 }}>{r.benefit}</div>
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
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionLinkStyle, background: '#fff', color: '#0d2b1c' }}>
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
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-1)', marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{p.name}</div>
      {addressLine && <div style={{ fontSize: 15, color: 'var(--color-text-1)', marginBottom: 8, lineHeight: 1.5, fontWeight: 500 }}>{addressLine}</div>}
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 14, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
        {p.nip && <span>NIP: <strong style={{ color: 'var(--color-text-1)' }}>{p.nip}</strong></span>}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
        {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`} style={actionLinkStyle}>Zadzwoń: {p.phone}</a>}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionLinkStyle, background: '#fff', color: '#0d2b1c' }}>Pokaż na mapie</a>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, letterSpacing: '-0.005em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
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
          background: 'linear-gradient(90deg, var(--color-bg-2) 0%, var(--color-surface) 50%, var(--color-bg-2) 100%)',
          backgroundSize: '200% 100%',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
      <style>{`@keyframes pulse { 0% { background-position: 0% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '16px 20px', marginBottom: 20,
      background: '#fce4e6', color: '#8b1f24',
      borderRadius: 10, fontSize: 15, fontWeight: 500,
      border: '2px solid #f5b3b8',
    }}>{children}</div>
  );
}

function EmptyState({ mode }: { mode: SearchMode }) {
  const hints: Record<SearchMode, string> = {
    queues: 'Spróbuj zmienić województwo lub poszerzyć kategorię świadczenia.',
    providers: 'Spróbuj wpisać krótszą nazwę lub samo województwo.',
  };
  return (
    <div style={{
      padding: 36, textAlign: 'center',
      background: '#fff',
      border: '2px dashed var(--color-border)',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8 }}>Brak wyników</div>
      <div style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{hints[mode]}</div>
    </div>
  );
}

function Pill({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' }) {
  return (
    <span style={{
      padding: '6px 12px', borderRadius: 999,
      background: tone === 'green' ? '#d4ecc8' : '#f0f0ec',
      color: tone === 'green' ? '#1e4d1c' : 'var(--color-text-1)',
      border: '1px solid ' + (tone === 'green' ? '#7cba6c' : 'var(--color-border)'),
      fontSize: 13, fontWeight: 500,
    }}>
      <span style={{ opacity: 0.75 }}>{label}:</span> <strong>{value}</strong>
    </span>
  );
}

// ============================================================
// STYLES -- accessibility-first (WCAG AA): wieksze czcionki, mocniejsze kontrasty
// ============================================================
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600,
  color: 'var(--color-text-1)', display: 'block', marginBottom: 8,
  letterSpacing: '-0.005em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  fontSize: 16, fontFamily: 'var(--font-sans)',
  background: '#fff',
  border: '2px solid var(--color-border)',
  borderRadius: 10,
  color: 'var(--color-text-1)',
  outline: 'none',
  lineHeight: 1.4,
};

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const suggestStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
  background: '#fff',
  border: '2px solid var(--color-border)',
  borderRadius: 10, marginTop: 6,
  maxHeight: 260, overflowY: 'auto',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
};

const suggestItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
  background: 'transparent', border: 'none',
  color: 'var(--color-text-1)', cursor: 'pointer',
};

const statsBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  padding: '18px 22px',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  marginBottom: 18,
  flexWrap: 'wrap',
};

const actionLinkStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '10px 16px', borderRadius: 8,
  background: '#0d2b1c',
  border: '1px solid #0d2b1c',
  fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)',
  color: '#fff',
  textDecoration: 'none',
};

function miniPillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 8,
    background: active ? '#0d2b1c' : '#fff',
    color: active ? '#fff' : 'var(--color-text-1)',
    border: '1.5px solid ' + (active ? '#0d2b1c' : 'var(--color-border)'),
    fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer',
    letterSpacing: '-0.005em',
    transition: 'all 0.15s',
  };
}

function primaryButton(disabled: boolean): React.CSSProperties {
  return {
    padding: '12px 24px',
    background: disabled ? 'var(--color-surface-2)' : 'var(--color-text-1)',
    color: disabled ? 'var(--color-muted-2)' : 'var(--color-bg-0)',
    border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
