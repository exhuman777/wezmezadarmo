'use client';

import { useState, useEffect } from 'react';

interface MonitoringPrefs {
  categories: string[];
}

interface NotificationLog {
  id: string;
  category: string;
  message: string;
  sent_at: string;
}

const CATEGORIES = [
  { id: 'kfs', label: 'KFS: Krajowy Fundusz Szkoleniowy' },
  { id: 'pup', label: 'PUP: Powiatowe Urzędy Pracy' },
  { id: 'pfron', label: 'PFRON: Fundusz Rehabilitacji Niepełnosprawnych' },
  { id: 'kpo', label: 'KPO: Krajowy Plan Odbudowy' },
  { id: 'samorzad', label: 'Samorządy: programy lokalne' },
  { id: 'parp_feng', label: 'PARP / FENG: fundusze europejskie' },
  { id: 'ncbr', label: 'NCBR: badania i rozwój' },
  { id: 'nfz', label: 'NFZ: ochrona zdrowia' },
];

export default function MonitoringPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dotacje/monitoring');
        if (res.ok) {
          const data: { prefs: MonitoringPrefs; logs: NotificationLog[] } = await res.json();
          setSelected(new Set(data.prefs?.categories ?? []));
          setLogs(data.logs ?? []);
        }
      } catch {
        // silent -- user sees empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/dotacje/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: Array.from(selected) }),
      });
      if (res.ok) {
        setSaveMsg('Zapisano.');
      } else {
        setSaveMsg('Błąd zapisu. Spróbuj ponownie.');
      }
    } catch {
      setSaveMsg('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '6px',
        }}
      >
        Panel / Monitoring
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text-1)',
          margin: '0 0 8px',
        }}
      >
        Powiadomienia o naborach
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-text-3)',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}
      >
        Powiadomienia wysyłamy w każdy poniedziałek rano. Otrzymasz email gdy zmieni się status naboru w wybranych kategoriach.
      </p>

      {/* Category list */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-2)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            Kategorie do monitorowania
          </p>
        </div>
        {loading ? (
          <div style={{ padding: '20px 16px' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-text-3)',
              }}
            >
              Ładowanie preferencji...
            </p>
          </div>
        ) : (
          <div>
            {CATEGORIES.map((cat, idx) => (
              <label
                key={cat.id}
                className="row-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '13px 16px',
                  borderBottom:
                    idx < CATEGORIES.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(cat.id)}
                  onChange={() => toggle(cat.id)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: 'var(--color-accent)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: selected.has(cat.id)
                      ? 'var(--color-text-1)'
                      : 'var(--color-text-2)',
                    lineHeight: 1.4,
                  }}
                >
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <button
          onClick={save}
          disabled={saving || loading}
          style={{
            background: saving || loading ? 'var(--color-bg-2)' : 'var(--color-green)',
            color: saving || loading ? 'var(--color-text-3)' : '#FFFFFF',
            border: '1px solid var(--color-border-light)',
            borderRadius: '5px',
            padding: '9px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: saving || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Zapisywanie...' : 'Zapisz preferencje'}
        </button>
        {saveMsg && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: saveMsg.startsWith('Zapisano') ? '#4ade80' : 'var(--color-accent)',
            }}
          >
            {saveMsg}
          </span>
        )}
      </div>

      {/* Notification log */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
          }}
        >
          Ostatnie powiadomienia
        </p>

        {logs.length === 0 ? (
          <div
            style={{
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-text-3)',
                margin: 0,
              }}
            >
              Brak powiadomień. Pierwsze zostaną wysłane po włączeniu monitoringu.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-bg-1)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {logs.slice(0, 5).map((log, idx) => (
              <div
                key={log.id}
                style={{
                  padding: '12px 16px',
                  borderBottom:
                    idx < Math.min(logs.length, 5) - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-green)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '3px',
                    }}
                  >
                    {log.category}
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--color-text-2)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {log.message}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-text-3)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {new Date(log.sent_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
