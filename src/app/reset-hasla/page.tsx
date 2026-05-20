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
          <div className="card card-glass" style={{ padding: '40px 36px' }}>
            <div className="eyebrow green" style={{ marginBottom: 16 }}>Reset hasła</div>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 8 }}>
              Resetowanie hasła
            </h3>
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
                  <label style={{
                    display: 'block', fontFamily: 'var(--f-mono)', fontSize: 11,
                    color: 'var(--ink-500)', letterSpacing: '0.06em',
                    textTransform: 'uppercase', marginBottom: 6,
                  }}>Adres e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="jan@kowalski.pl"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', fontSize: 15,
                      background: 'var(--white)',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--ink-900)',
                    }}
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
