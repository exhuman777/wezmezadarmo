'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WhitelistResult {
  found: boolean;
  name?: string;
  nip?: string;
  statusVat?: string;
  regon?: string | null;
  krs?: string | null;
  address?: string | null;
  registeredAt?: string | null;
  removedAt?: string | null;
  accounts?: string[];
}

export default function BialaListaPage() {
  const [nip, setNip] = useState('');
  const [result, setResult] = useState<WhitelistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setResult(null);
    const clean = nip.replace(/\D/g, '');
    if (clean.length !== 10) { setError('NIP musi mieć 10 cyfr'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/public/whitelist?nip=${clean}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Błąd API: ${res.status}`);
        setLoading(false);
        return;
      }
      setResult(await res.json());
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  }

  const statusColor = result?.statusVat === 'Czynny' ? '#22A06B'
    : result?.statusVat === 'Zwolniony' ? '#c4841a'
    : '#dc5050';

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4527A0' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          MF · Biała Lista VAT
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Sprawdź kontrahenta po NIP</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Wykaz podatników VAT Ministerstwa Finansów. Wymagana weryfikacja przy płatnościach B2B powyżej 15&thinsp;000 PLN -
        brak sprawdzenia = solidarna odpowiedzialność za VAT kontrahenta.
      </p>

      <form onSubmit={check} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text" inputMode="numeric" placeholder="NIP - 10 cyfr"
          value={nip} onChange={e => setNip(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15, fontFamily: 'var(--f-mono)' }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Sprawdzam...' : 'Sprawdź'}
        </button>
      </form>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {result && !result.found && (
        <div style={{ padding: '14px 18px', background: 'rgba(220,80,80,0.04)', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 10 }}>
          <div style={{ fontWeight: 600, color: '#dc5050', marginBottom: 4 }}>Nie znaleziono</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Podmiot o NIP {nip} nie figuruje w wykazie podatników VAT.</div>
        </div>
      )}

      {result && result.found && (
        <div style={{ padding: 20, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{result.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>NIP: {result.nip}</div>
            </div>
            <span style={{ padding: '5px 12px', borderRadius: 6, background: `${statusColor}15`, color: statusColor, fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {result.statusVat}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
            {result.regon && <Field label="REGON" value={result.regon} />}
            {result.krs && <Field label="KRS" value={result.krs} />}
            {result.address && <Field label="Adres" value={result.address} />}
            {result.registeredAt && <Field label="Zarejestrowany" value={result.registeredAt} />}
            {result.removedAt && <Field label="Wykreślony" value={result.removedAt} />}
          </div>

          {result.accounts && result.accounts.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                Konta bankowe ({result.accounts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.accounts.map(acc => (
                  <code key={acc} style={{ padding: '6px 10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 6, fontSize: 12, color: 'var(--ink-900)', fontFamily: 'var(--f-mono)' }}>
                    {acc.match(/.{1,4}/g)?.join(' ')}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://wl-api.mf.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>wl-api.mf.gov.pl</a> · Limit: 10 zapytań / min / IP.
      </p>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-700)', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}
