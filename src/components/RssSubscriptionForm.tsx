'use client';

import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  source_ids: string[];
  audiences: string[];
  keywords: string[];
  active: boolean;
  last_sent_at: string | null;
}

const SOURCES = [
  { id: 'zus', name: 'ZUS', desc: 'Składki, świadczenia, emerytury' },
  { id: 'gus', name: 'GUS', desc: 'Statystyki gospodarcze' },
  { id: 'nbp', name: 'NBP', desc: 'Kursy walut, stopy, polityka pieniężna' },
  { id: 'sejm', name: 'Sejm RP', desc: 'Nowe ustawy, przepisy' },
  { id: 'uokik', name: 'UOKiK', desc: 'Ochrona konsumentów, konkurencja' },
  { id: 'fundusze', name: 'Fundusze EU', desc: 'Dotacje, KPO, granty' },
  { id: 'ezdrowie', name: 'e-Zdrowie', desc: 'NFZ, e-recepta, leczenie' },
  { id: 'arimr', name: 'ARiMR', desc: 'Rolnictwo, dopłaty' },
];

const AUDIENCES = [
  { id: 'wszyscy', label: 'Osoby prywatne' },
  { id: 'jdg', label: 'JDG / Samozatrudnieni' },
  { id: 'firmy', label: 'Firmy' },
];

export default function RssSubscriptionForm() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/rss/subscription').then(async res => {
      if (!res.ok) { setLoading(false); return; }
      const { subscription } = await res.json();
      if (subscription) {
        setSub(subscription);
        setSourceIds(subscription.source_ids || []);
        setAudiences(subscription.audiences || []);
        setKeywordsInput((subscription.keywords || []).join(', '));
        setActive(subscription.active);
      }
      setLoading(false);
    });
  }, []);

  function toggle(arr: string[], setter: (v: string[]) => void, value: string) {
    setter(arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]);
  }

  async function save() {
    setSaving(true);
    const keywords = keywordsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length >= 2);

    const res = await fetch('/api/rss/subscription', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_ids: sourceIds, audiences, keywords, active }),
    });
    setSaving(false);
    if (res.ok) {
      const { subscription } = await res.json();
      setSub(subscription);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return <div style={{ padding: 16, fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ padding: '14px 16px', background: 'rgba(34,160,107,0.06)', border: '1px solid rgba(34,160,107,0.18)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
        Alerty wysyłane <strong>maks. 2x dziennie</strong> (~10:00 i ~15:00) po automatycznym pobraniu źródeł.
        Nie można wywołać ręcznie. Bez duplikatów: każdy artykuł wysłany tylko raz.
      </div>

      <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 14, color: 'var(--color-text-1)' }}>
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
        <span>Włącz alerty e-mail</span>
      </label>

      {active && (
        <>
          {/* Sources */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Źródła ({sourceIds.length === 0 ? 'wszystkie' : `wybrane: ${sourceIds.length}`})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 6 }}>
              {SOURCES.map(s => {
                const checked = sourceIds.includes(s.id);
                return (
                  <label key={s.id} style={{
                    display: 'flex', gap: 9, alignItems: 'flex-start',
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: checked ? 'rgba(34,160,107,0.08)' : 'var(--color-bg-1)',
                    border: `1px solid ${checked ? 'rgba(34,160,107,0.3)' : 'var(--color-border)'}`,
                    transition: 'all 120ms',
                  }}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(sourceIds, setSourceIds, s.id)} style={{ marginTop: 2 }} />
                    <span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', display: 'block' }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{s.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>
              Nic nie zaznaczone = wszystkie źródła.
            </p>
          </div>

          {/* Audiences */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Grupa docelowa
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AUDIENCES.map(a => {
                const checked = audiences.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(audiences, setAudiences, a.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12, fontWeight: 500,
                      background: checked ? 'rgba(34,160,107,0.12)' : 'var(--color-bg-1)',
                      color: checked ? '#22A06B' : 'var(--color-text-2)',
                      border: `1px solid ${checked ? 'rgba(34,160,107,0.35)' : 'var(--color-border)'}`,
                    }}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>
              Nic nie zaznaczone = wszystkie grupy.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Słowa kluczowe (opcjonalne)
            </div>
            <input
              type="text"
              value={keywordsInput}
              onChange={e => setKeywordsInput(e.target.value)}
              placeholder="np. emerytura, KSeF, dotacja"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--color-bg-0)', border: '1px solid var(--color-border)',
                borderRadius: 8, fontSize: 13, color: 'var(--color-text-1)',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>
              Oddzielone przecinkami. Pusty = bez filtra. Filtruje po tytule i opisie.
            </p>
          </div>
        </>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          padding: '10px 24px', alignSelf: 'flex-start',
          background: saved ? 'var(--color-border)' : '#22A06B',
          color: '#fff', border: 'none', borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saved ? 'Zapisano' : saving ? 'Zapisuję...' : 'Zapisz subskrypcję'}
      </button>

      {sub?.last_sent_at && (
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
          Ostatni alert: {new Date(sub.last_sent_at).toLocaleString('pl-PL')}
        </div>
      )}
    </div>
  );
}
