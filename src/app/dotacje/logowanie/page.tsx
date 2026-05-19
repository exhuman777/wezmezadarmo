'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LogowaniePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/dotacje/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Błąd logowania. Sprawdź dane i spróbuj ponownie.');
        return;
      }

      router.push('/dotacje/panel');
    } catch {
      setError('Błąd połączenia z serwerem. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            Zaloguj się
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--color-text-3)',
            margin: 0,
          }}>
            Dostęp do panelu agenta dotacyjnego
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              marginBottom: '6px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jan@firma.pl"
              className="input-focus"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--color-bg-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--color-text-1)',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              marginBottom: '6px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-focus"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--color-bg-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--color-text-1)',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(220, 60, 60, 0.1)',
              border: '1px solid rgba(220, 60, 60, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#e57373',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? 'var(--color-border)' : 'var(--color-green)',
              color: loading ? 'var(--color-text-3)' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginTop: '4px',
            }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-text-3)',
          textAlign: 'center',
        }}>
          Nie masz konta?{' '}
          <Link
            href="/dotacje/rejestracja"
            style={{
              color: 'var(--color-green)',
              textDecoration: 'none',
            }}
          >
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}
