'use client';

import { useState } from 'react';
import Link from 'next/link';

const inputStyle = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '10px 14px', fontSize: 14,
  background: 'var(--color-bg-1)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-1)',
  outline: 'none',
  fontFamily: 'var(--font-mono)',
};

export default function ResetHasla() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/agent/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd wysyłania e-maila.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-text-3)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 8,
        }}>
          Reset hasła
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
          Resetowanie hasła
        </h1>

        {success ? (
          <div>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6, marginBottom: 24 }}>
              Wysłaliśmy link do resetowania hasła na podany adres e-mail.
            </p>
            <Link href="/agent/logowanie" style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--color-green)', textDecoration: 'none',
            }}>
              Wróć do logowania
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-text-3)', marginBottom: 6,
              }}>
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="jan@kowalski.pl"
                style={inputStyle}
              />
            </div>
            {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              padding: '10px 24px', background: loading ? 'var(--color-border)' : 'var(--color-green)',
              color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Wysyłanie...' : 'Wyślij link do resetowania'}
            </button>
            <Link href="/agent/logowanie" style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--color-green)', textDecoration: 'none',
              textAlign: 'center' as const,
            }}>
              Wróć do logowania
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
