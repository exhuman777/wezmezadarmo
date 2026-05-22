'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PRIVATE_FIELDS: { key: string; label: string; type: 'number' | 'text' | 'select' | 'boolean'; options?: string[] }[] = [
  { key: 'wiek', label: 'Wiek', type: 'number' },
  { key: 'plec', label: 'Plec', type: 'select', options: ['K', 'M'] },
  { key: 'stan_cywilny', label: 'Stan cywilny', type: 'select', options: ['wolny', 'malzenstwo', 'rozwiedziony', 'wdowiec'] },
  { key: 'liczba_dzieci', label: 'Liczba dzieci', type: 'number' },
  { key: 'dochod_miesiecznie', label: 'Dochod miesiecznie (PLN)', type: 'number' },
  { key: 'dochod_na_osobe', label: 'Dochod na osobe (PLN)', type: 'number' },
  { key: 'zatrudnienie', label: 'Forma zatrudnienia', type: 'select', options: ['umowa_o_prace', 'zlecenie', 'b2b', 'bezrobotny', 'emeryt'] },
  { key: 'niepelnosprawnosc', label: 'Niepelnosprawnosc', type: 'select', options: ['brak', 'lekki', 'umiarkowany', 'znaczny'] },
  { key: 'wlasnosc', label: 'Mieszkanie', type: 'select', options: ['mieszkanie', 'dom', 'wynajem', 'rodzina'] },
  { key: 'wojewodztwo', label: 'Wojewodztwo', type: 'select', options: [
    'dolnoslaskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
    'lodzkie', 'malopolskie', 'mazowieckie', 'opolskie',
    'podkarpackie', 'podlaskie', 'pomorskie', 'slaskie',
    'swietokrzyskie', 'warminsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
  ]},
  { key: 'ciaza', label: 'Ciaza', type: 'boolean' },
  { key: 'student', label: 'Student', type: 'boolean' },
  { key: 'emeryt', label: 'Emeryt', type: 'boolean' },
  { key: 'rolnik', label: 'Rolnik (KRUS)', type: 'boolean' },
  { key: 'bezrobotny_zarejestrowany', label: 'Bezrobotny zarejestrowany', type: 'boolean' },
];

const JDG_FIELDS: { key: string; label: string; type: 'text' | 'select'; options?: string[] }[] = [
  { key: 'nip', label: 'NIP', type: 'text' },
  { key: 'company_name', label: 'Nazwa firmy', type: 'text' },
  { key: 'company_voivodeship', label: 'Wojewodztwo', type: 'select', options: [
    'dolnoslaskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
    'lodzkie', 'malopolskie', 'mazowieckie', 'opolskie',
    'podkarpackie', 'podlaskie', 'pomorskie', 'slaskie',
    'swietokrzyskie', 'warminsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
  ]},
  { key: 'company_size', label: 'Wielkosc firmy', type: 'select', options: ['mikro', 'mala', 'srednia', 'duza'] },
];

const HIDDEN_KEYS = ['id', 'user_id', 'created_at', 'updated_at', 'type'];

export default function AgentProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/agent/profile').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const { profile: p } = await res.json();
      setProfile(p);
      setDraft({ ...p });
      setLoading(false);
    });
  }, [router]);

  async function save() {
    setSaving(true);
    setError('');
    const res = await fetch('/api/agent/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const { profile: updated } = await res.json();
      setProfile(updated);
      setDraft({ ...updated });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError('Blad zapisu profilu.');
    }
    setSaving(false);
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ladowanie...</div>;
  if (!profile) return null;

  const profileType = profile.type as string;
  const fields = profileType === 'jdg' ? JDG_FIELDS : PRIVATE_FIELDS;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Profil</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>Twoje dane</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '8px 16px', fontSize: 13,
              background: 'var(--color-green)', color: 'var(--color-bg-0)',
              border: 'none', borderRadius: 6,
              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 500,
            }}
          >
            Edytuj
          </button>
        )}
      </div>

      {saved && <div style={{ padding: '10px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-green)', borderRadius: 6, marginBottom: 16, fontSize: 13, color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>Zapisano.</div>}
      {error && <div style={{ padding: '10px 16px', background: 'var(--red-50)', border: '1px solid var(--red-400)', borderRadius: 6, marginBottom: 16, fontSize: 13, color: 'var(--red-400)' }}>{error}</div>}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '8px 12px', background: 'var(--color-bg-1)', borderRadius: 4, marginBottom: 16, color: 'var(--color-text-3)' }}>
        Typ konta: {profileType === 'jdg' ? 'JDG (dzialalnosc gospodarcza)' : 'Osoba prywatna'}
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 24 }}>
        {editing ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={String(draft[field.key] ?? '')}
                    onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 10px',
                      background: 'var(--color-bg-0)', color: 'var(--color-text-1)',
                      border: '1px solid var(--color-border)', borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    <option value="">(nie wybrano)</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!draft[field.key]}
                      onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.checked }))}
                      style={{ accentColor: 'var(--color-green)' }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
                      {draft[field.key] ? 'Tak' : 'Nie'}
                    </span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={String(draft[field.key] ?? '')}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      [field.key]: field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value,
                    }))}
                    style={{
                      width: '100%', padding: '8px 10px',
                      background: 'var(--color-bg-0)', color: 'var(--color-text-1)',
                      border: '1px solid var(--color-border)', borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          Object.entries(profile)
            .filter(([key]) => !HIDDEN_KEYS.includes(key))
            .map(([key, value], i) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-bg-1)' : 'var(--color-bg-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', paddingTop: 2 }}>{key}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-1)' }}>
                  {typeof value === 'boolean' ? (value ? 'Tak' : 'Nie') : Array.isArray(value) ? (value as unknown[]).join(', ') || '(brak)' : String(value ?? '(brak)')}
                </span>
              </div>
            ))
        )}
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '10px 24px', fontSize: 13,
              background: 'var(--color-green)', color: 'var(--color-bg-0)',
              border: 'none', borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)', fontWeight: 500,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Zapisuje...' : 'Zapisz'}
          </button>
          <button
            onClick={() => { setEditing(false); setDraft({ ...profile }); }}
            style={{
              padding: '10px 24px', fontSize: 13,
              background: 'var(--color-bg-2)', color: 'var(--color-text-2)',
              border: '1px solid var(--color-border)', borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Anuluj
          </button>
        </div>
      )}

      <Link href="/panel" style={{ fontSize: 13, color: 'var(--color-text-3)', textDecoration: 'none', display: 'block', marginTop: 24 }}>&larr; Wróć do panelu</Link>
    </div>
  );
}
