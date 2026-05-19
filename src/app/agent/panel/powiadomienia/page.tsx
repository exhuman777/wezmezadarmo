'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const KATEGORIE = [
  { value: 'dofinansowania', label: 'Dofinansowania' },
  { value: 'zus', label: 'ZUS i ubezpieczenia' },
  { value: 'podatki', label: 'Podatki' },
  { value: 'prawo', label: 'Zmiany w prawie' },
  { value: 'inne', label: 'Inne' },
];

export default function AgentPowiadomienia() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    fetch('/api/digest/preferences').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const { prefs } = await res.json();
      setEnabled(prefs.digest_enabled ?? false);
      setCategories(prefs.categories ?? []);
      setLastSent(prefs.last_digest_sent_at);
      setLoading(false);
    });
  }, [router]);

  async function sendTest() {
    setTesting(true);
    const res = await fetch('/api/digest/test', { method: 'POST' });
    setTesting(false);
    if (res.ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 5000);
    }
  }

  async function save() {
    setSaving(true);
    await fetch('/api/digest/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digest_enabled: enabled, categories }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ładowanie...</div>;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Ustawienia powiadomień</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Dzienny raport e-mail</h1>

      {lastSent && <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 20 }}>Ostatni digest: {new Date(lastSent).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', fontSize: 14, color: 'var(--color-text-1)' }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          Włącz dzienny raport na e-mail (wysyłany o 8:00)
        </label>

        {enabled && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Śledzone kategorie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {KATEGORIE.map(({ value, label }) => (
                <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                  <input type="checkbox"
                    checked={categories.includes(value)}
                    onChange={e => {
                      setCategories(prev => e.target.checked
                        ? [...prev, value]
                        : prev.filter(c => c !== value));
                    }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving} style={{
          padding: '10px 24px', background: saved ? 'var(--color-border)' : 'var(--color-green)',
          color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer', width: 'fit-content',
        }}>
          {saved ? 'Zapisano' : saving ? 'Zapisuję...' : 'Zapisz ustawienia'}
        </button>

        <div>
          {testSent ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', fontFamily: 'var(--font-mono)' }}>
              Wysłano. Sprawdź skrzynkę.
            </p>
          ) : (
            <button onClick={sendTest} disabled={testing} style={{
              padding: '10px 24px', background: 'var(--color-bg-2)',
              color: 'var(--color-text-1)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              cursor: testing ? 'not-allowed' : 'pointer', width: 'fit-content',
            }}>
              {testing ? 'Wysyłam...' : 'Wyślij testowy e-mail'}
            </button>
          )}
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 6 }}>
            Wyśle próbny raport na Twój adres e-mail. Może zawierać starsze wiadomości.
          </p>
        </div>
      </div>
    </main>
  );
}
