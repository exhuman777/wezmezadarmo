'use client';

import { useState } from 'react';
import Link from 'next/link';

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
      const res = await fetch('/api/auth/reset-password', {
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
      <section style={{ padding: '80px 0', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ padding: '24px 20px', border: '2px solid var(--tusz)', background: 'var(--surface)' }}>
            <p className="etykieta">Reset hasła</p>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', marginBottom: 8 }}>
              Resetowanie hasła
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 28 }}>
              Podaj adres e-mail powiązany z kontem
            </p>

            {success ? (
              <div>
                <div style={{
                  padding: '16px', borderRadius: 'var(--r-sm)',
                  background: 'var(--green-50)', border: '1px solid var(--green-200)',
                  marginBottom: 24,
                }}>
                  <p style={{ fontSize: 14, color: 'var(--green-900)', lineHeight: 1.6 }}>
                    Wysłaliśmy link do resetowania hasła na podany adres e-mail.
                    Sprawdź skrzynkę (i folder spam).
                  </p>
                </div>
                <Link href="/logowanie" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                  Wróć do logowania
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="pole-etykieta" style={{ display: 'block', marginBottom: 6 }}>Adres e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="jan@kowalski.pl"
                    className="pole-wejscie"
                  />
                </div>

                {error && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 'var(--r-sm)',
                    background: 'var(--red-50)', border: '1px solid var(--red-100)',
                    fontSize: 13, color: 'var(--red-700)',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Wysyłanie...' : 'Wyślij link'}
                </button>

                <Link href="/logowanie" style={{
                  fontFamily: 'var(--f-mono)', fontSize: 12,
                  color: 'var(--green-700)', textDecoration: 'none',
                  textAlign: 'center',
                }}>
                  Wróć do logowania
                </Link>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
