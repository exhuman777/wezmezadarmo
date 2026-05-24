'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROGRAMS, type B2BProgram, type EligibilityFlag } from '@/data/programs-b2b';
import { getPkdName, dominantSection } from '@/data/pkd-codes';

interface CeidgData {
  aktywna: boolean;
  nazwa: string | null;
  dataRejestracji: string | null;
  pkd: string[];
  status: string | null;
  wojewodztwo: string | null;
  vat?: { status: string | null; registeredAt: string | null; removedAt: string | null } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'OTWARTY', color: '#22A06B' },
  continuous: { label: 'CIĄGŁY', color: '#0d5036' },
  expected: { label: 'PLANOWANY', color: '#c4841a' },
  closed: { label: 'ZAMKNIĘTY', color: '#999' },
};

const CATEGORY_LABELS: Record<string, string> = {
  kfs: 'KFS', pup: 'PUP', pfron: 'PFRON', kpo: 'KPO', samorzad: 'Samorząd',
  nfz: 'NFZ', parp: 'PARP', feng: 'FENG', ncbr: 'NCBR', arimir: 'ARiMR',
};

// Heurystyka: PKD -> sektor + eligibility flags
function inferFlagsFromPkd(pkd: string[]): EligibilityFlag[] {
  const flags = new Set<EligibilityFlag>();
  flags.add('msp');
  for (const code of pkd) {
    const prefix = code.slice(0, 2);
    if (prefix >= '10' && prefix <= '33') flags.add('sektor_produkcja');
    if (prefix === '62' || prefix === '63') { flags.add('sektor_it'); flags.add('cyfryzacja'); }
    if ((prefix >= '69' && prefix <= '82') || (prefix >= '85' && prefix <= '93')) flags.add('sektor_usluga');
    if (prefix >= '45' && prefix <= '47') flags.add('sektor_handel');
    if (prefix >= '01' && prefix <= '03') flags.add('sektor_rolnictwo');
  }
  return Array.from(flags);
}

function matchPrograms(flags: EligibilityFlag[], voivodeship: string | null) {
  const matched: B2BProgram[] = [];
  const partial: B2BProgram[] = [];
  const unmatched: B2BProgram[] = [];

  for (const program of PROGRAMS) {
    const wojOk = program.voivodeships.includes('all')
      || (voivodeship ? program.voivodeships.includes(voivodeship.toLowerCase()) : false);

    if (!wojOk) { unmatched.push(program); continue; }

    if (program.eligibilityFlags.length === 0) { partial.push(program); continue; }
    const overlap = program.eligibilityFlags.filter(f => flags.includes(f));
    const ratio = overlap.length / program.eligibilityFlags.length;

    if (ratio >= 0.5) matched.push(program);
    else if (overlap.length > 0) partial.push(program);
    else unmatched.push(program);
  }
  return { matched, partial, unmatched };
}

function fmtPLN(n: number | null): string {
  if (!n) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} mln zł`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} tys. zł`;
  return `${n} zł`;
}

export default function PanelDotacjePage() {
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ceidg, setCeidg] = useState<CeidgData | null>(null);
  const [showAll, setShowAll] = useState(false);

  async function checkNip(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setCeidg(null);
    const clean = nip.replace(/\D/g, '');
    if (clean.length !== 10) { setError('NIP musi mieć 10 cyfr'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/ceidg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip: clean }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `Błąd ${res.status}`); setLoading(false); return; }
      setCeidg(data);
      // Vercel Analytics
      try {
        const { track } = await import('@/lib/track');
        const flags = inferFlagsFromPkd(data.pkd ?? []);
        const matched = matchPrograms(flags, data.wojewodztwo ?? null);
        track('nip_checked', { matched: matched.matched.length, pkd_count: (data.pkd ?? []).length });
      } catch { /* ignore */ }
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  }

  const matchResult = useMemo(() => {
    if (!ceidg) return null;
    const flags = inferFlagsFromPkd(ceidg.pkd);
    return matchPrograms(flags, ceidg.wojewodztwo);
  }, [ceidg]);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Dotacje dla firm
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, marginBottom: 8, color: 'var(--ink-900)' }}>
        Dofinansowania dopasowane do Twojej firmy
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Wpisz NIP firmy - pobierzemy dane z CEIDG (PKD, województwo, status VAT) i dopasujemy
        23 programy dotacyjne: KFS, PUP, PFRON, KPO, PARP FENG, NCBR, ARiMR, programy regionalne.
      </p>

      <form onSubmit={checkNip} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text" inputMode="numeric" placeholder="NIP - 10 cyfr (np. 7342867148)"
          value={nip} onChange={e => setNip(e.target.value)}
          style={{
            flex: 1, minWidth: 240, padding: '11px 16px',
            border: '1px solid var(--line)', borderRadius: 10,
            fontSize: 15, fontFamily: 'var(--f-mono)',
          }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Sprawdzam...' : 'Sprawdź dotacje'}
        </button>
      </form>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {ceidg && (
        <>
          <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>
                  {ceidg.nazwa ?? 'Brak nazwy'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>NIP: {nip}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ceidg.aktywna && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'rgba(34,160,107,0.12)', color: '#22A06B', fontWeight: 600, fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>
                    Aktywna
                  </span>
                )}
                {ceidg.vat?.status && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: ceidg.vat.status === 'Czynny' ? 'rgba(34,160,107,0.12)' : 'rgba(200,130,40,0.12)', color: ceidg.vat.status === 'Czynny' ? '#22A06B' : '#c4841a', fontWeight: 600, fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>
                    VAT {ceidg.vat.status}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {ceidg.wojewodztwo && <div><div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: 3 }}>Województwo</div><div style={{ fontSize: 13, color: 'var(--ink-700)' }}>{ceidg.wojewodztwo}</div></div>}
              {ceidg.dataRejestracji && <div><div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: 3 }}>Zarejestrowana</div><div style={{ fontSize: 13, color: 'var(--ink-700)' }}>{ceidg.dataRejestracji}</div></div>}
              {ceidg.pkd.length > 0 && (() => {
                const section = dominantSection(ceidg.pkd);
                return (
                  <div style={{ gridColumn: '1 / -1' }}>
                    {section && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 8 }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: 3 }}>Branża (główna sekcja PKD)</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{section.label}</div>
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: 8 }}>Kody PKD ({ceidg.pkd.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {ceidg.pkd.slice(0, 12).map(code => {
                        const name = getPkdName(code);
                        return (
                          <div key={code} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', fontSize: 12 }}>
                            <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600, color: '#22A06B', flexShrink: 0, minWidth: 60 }}>{code}</span>
                            <span style={{ color: 'var(--ink-700)', lineHeight: 1.4 }}>{name ?? <span style={{ color: 'var(--ink-400)', fontStyle: 'italic' }}>brak opisu w słowniku</span>}</span>
                          </div>
                        );
                      })}
                      {ceidg.pkd.length > 12 && (
                        <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4 }}>... i {ceidg.pkd.length - 12} więcej</div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {matchResult && (
            <>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', fontSize: 13 }}>
                <span><strong style={{ color: '#22A06B' }}>{matchResult.matched.length}</strong> pasujące</span>
                <span><strong style={{ color: '#c4841a' }}>{matchResult.partial.length}</strong> potencjalne</span>
                <span><strong style={{ color: 'var(--ink-500)' }}>{matchResult.unmatched.length}</strong> niedostępne</span>
              </div>

              {matchResult.matched.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
                    Pasujące dla Twojej firmy ({matchResult.matched.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {matchResult.matched.map((p, i) => (
                      <div key={p.id}>
                        <ProgramCard program={p} />
                        {i === 0 && <ViaPromoCard />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.partial.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
                    Potencjalnie pasujące ({matchResult.partial.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {matchResult.partial.map(p => <ProgramCard key={p.id} program={p} />)}
                  </div>
                </div>
              )}

              {matchResult.unmatched.length > 0 && (
                <div>
                  <button onClick={() => setShowAll(!showAll)} style={{ fontSize: 13, color: 'var(--ink-500)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginBottom: 12 }}>
                    {showAll ? 'Ukryj' : 'Pokaż'} niedostępne dla Twojego województwa ({matchResult.unmatched.length})
                  </button>
                  {showAll && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.65 }}>
                      {matchResult.unmatched.map(p => <ProgramCard key={p.id} program={p} />)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {!ceidg && !error && (
        <div style={{ padding: 32, background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 12, textAlign: 'center', color: 'var(--green-900)' }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Wpisz NIP firmy żeby zobaczyć dopasowane dotacje.</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
            Dane z CEIDG (rejestr firm) + Białej Listy VAT. Limit: 10 zapytań/dzień/IP.
            <Link href="/dotacje" style={{ color: '#22A06B', marginLeft: 6 }}>Zobacz wszystkie 23 programy bez personalizacji →</Link>
          </div>
        </div>
      )}
    </main>
  );
}

function ProgramCard({ program }: { program: B2BProgram }) {
  const status = STATUS_LABELS[program.status] ?? { label: program.status, color: '#666' };
  return (
    <div style={{ padding: 16, background: 'var(--white)', border: '1px solid var(--line)', borderLeft: `3px solid ${status.color}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: status.color, color: '#fff', fontWeight: 700, fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' }}>
              {status.label}
            </span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'var(--green-50)', color: 'var(--ink-700)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {CATEGORY_LABELS[program.category] ?? program.category}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', lineHeight: 1.35, marginBottom: 3 }}>{program.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{program.institution}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#22A06B', fontFamily: 'var(--f-mono)' }}>{fmtPLN(program.maxAmountPLN)}</div>
          {program.openDate && program.closeDate && (
            <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>
              {program.openDate} → {program.closeDate}
            </div>
          )}
          {!program.openDate && program.nextOpenExpected && (
            <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>Planowany: {program.nextOpenExpected}</div>
          )}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.5, margin: '6px 0' }}>{program.maxAmountDesc}</p>
      {program.notes && (
        <p style={{ fontSize: 11, color: 'var(--ink-500)', lineHeight: 1.5, margin: '6px 0 8px', paddingTop: 6, borderTop: '1px solid var(--line)' }}>{program.notes}</p>
      )}
      <a href={program.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#22A06B', textDecoration: 'none' }}>
        Szczegóły programu →
      </a>
    </div>
  );
}

function ViaPromoCard() {
  return (
    <div style={{
      marginTop: 10,
      padding: 18,
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      border: '1px solid #c4b5fd',
      borderLeft: '3px solid #7c3aed',
      borderRadius: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: 9, padding: '2px 7px', borderRadius: 3,
        background: '#7c3aed', color: '#fff', fontWeight: 700,
        fontFamily: 'var(--f-mono)', letterSpacing: '0.06em',
      }}>
        PROMOWANE
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: '#7c3aed', color: '#fff', fontWeight: 700, fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' }}>
          AI AGENT
        </span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(124,58,237,0.1)', color: '#5b21b6', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          27 KRAJÓW UE
        </span>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: '#2e1065', lineHeight: 1.3, marginBottom: 4, letterSpacing: '-0.01em' }}>
        VIA - autonomiczny agent dla Twojego biznesu
      </div>
      <div style={{ fontSize: 12, color: '#5b21b6', marginBottom: 10, fontFamily: 'var(--f-mono)' }}>
        Sourcing przetargów + B+R + zatrudnienia + regulacji w 27 krajach UE
      </div>

      <p style={{ fontSize: 13, color: '#3b0764', lineHeight: 1.6, margin: '0 0 12px' }}>
        VIA czyta przetargi w 27 krajach UE, rundy finansowania, aktywność rekrutacyjną
        i zmiany regulacyjne — następnie krzyżuje każdy sygnał z Twoim profilem kompetencji,
        pozycją konkurencyjną i celami, zanim trafi do Ciebie. Nigdy nie przeglądasz surowego
        feedu; otwierasz krótką listę okazji już ocenionych pod kątem tego, jak dobrze pasują
        do tego, co możesz wygrać.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <a href="https://www.tryvia.eu/#" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600,
          padding: '8px 16px', borderRadius: 8,
          background: '#7c3aed', color: '#fff', textDecoration: 'none',
          boxShadow: '0 3px 10px rgba(124,58,237,0.3)',
          transition: 'transform 150ms, box-shadow 150ms',
        }}>
          Sprawdź VIA →
        </a>
        <span style={{ fontSize: 11, color: '#7c3aed', fontFamily: 'var(--f-mono)' }}>tryvia.eu · poza wezmezadarmo</span>
      </div>
    </div>
  );
}
