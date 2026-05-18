'use client';

import { useState, useEffect } from 'react';

interface SubscriptionData {
  subscription_status: 'trial' | 'active' | 'inactive';
  trial_ends_at: string | null;
  email: string;
}

const STATUS_LABEL: Record<string, string> = {
  trial: 'Okres próbny',
  active: 'Aktywna',
  inactive: 'Nieaktywna',
};

const STATUS_COLOR: Record<string, string> = {
  trial: 'var(--color-accent)',
  active: '#4ade80',
  inactive: 'var(--color-text-3)',
};

export default function SubskrypcjaPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dotacje/subscription');
        if (res.ok) {
          const json: SubscriptionData = await res.json();
          setData(json);
        } else {
          setError('Nie udało się załadować danych subskrypcji.');
        }
      } catch {
        setError('Błąd połączenia.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function exportData() {
    setActionLoading('export');
    setError(null);
    try {
      const res = await fetch('/api/dotacje/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'moje-dane-dotacje.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError('Nie udało się pobrać danych.');
      }
    } catch {
      setError('Błąd eksportu danych.');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        'Czy na pewno chcesz usunąć konto? Dane zostaną usunięte po 30 dniach. Tej operacji nie można cofnąć.',
      )
    ) {
      return;
    }
    setActionLoading('delete');
    setError(null);
    try {
      const res = await fetch('/api/dotacje/auth/delete', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/dotacje?deleted=1';
      } else {
        setError('Nie udało się usunąć konta. Skontaktuj się z pomocą techniczną.');
        setActionLoading(null);
      }
    } catch {
      setError('Błąd połączenia.');
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-3)' }}>
          Ładowanie...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' }}>
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
        Panel / Subskrypcja
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text-1)',
          margin: '0 0 32px',
        }}
      >
        Zarządzaj subskrypcją
      </h1>

      {error && (
        <div
          style={{
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-accent)',
            borderRadius: '5px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              margin: 0,
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Status card */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            Status
          </p>
          {data?.subscription_status && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: STATUS_COLOR[data.subscription_status] ?? 'var(--color-text-3)',
                border: `1px solid ${STATUS_COLOR[data.subscription_status] ?? 'var(--color-border)'}`,
                borderRadius: '3px',
                padding: '3px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {STATUS_LABEL[data.subscription_status] ?? data.subscription_status}
            </span>
          )}
        </div>

          <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--color-text-2)',
            margin: 0,
          }}
        >
          Masz pełen dostęp do agenta, monitoringu i powiadomień.
        </p>
      </div>

      {/* Platnosci w przygotowaniu */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '20px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-text-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Płatności zostaną uruchomione wkrótce. W fazie beta dostęp jest bezpłatny.
        </p>
      </div>

      {/* Data export */}
      <button
        onClick={exportData}
        disabled={actionLoading === 'export'}
        className={actionLoading !== 'export' ? 'panel-card' : undefined}
        style={{
          display: 'block',
          width: '100%',
          background: 'var(--color-bg-1)',
          color: actionLoading === 'export' ? 'var(--color-text-3)' : 'var(--color-text-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '11px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: actionLoading === 'export' ? 'not-allowed' : 'pointer',
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        {actionLoading === 'export' ? 'Pobieranie...' : 'Eksportuj moje dane (JSON)'}
      </button>

      {/* Disclaimer */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: '5px',
          padding: '14px 16px',
          marginBottom: '32px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-text-3)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Anulowanie nie usuwa danych. Dane zostaną usunięte 30 dni po zakończeniu subskrypcji lub na żądanie.
        </p>
      </div>

      {/* Danger zone */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Strefa niebezpieczna
        </p>
        <button
          onClick={deleteAccount}
          disabled={actionLoading === 'delete'}
          style={{
            background: 'transparent',
            color: actionLoading === 'delete' ? 'var(--color-text-3)' : '#f87171',
            border: '1px solid',
            borderColor: actionLoading === 'delete' ? 'var(--color-border)' : '#f87171',
            borderRadius: '5px',
            padding: '9px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: actionLoading === 'delete' ? 'not-allowed' : 'pointer',
          }}
        >
          {actionLoading === 'delete' ? 'Usuwanie...' : 'Usuń konto'}
        </button>
      </div>
    </div>
  );
}
