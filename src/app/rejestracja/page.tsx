'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Rejestracja() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Uzupełnij wszystkie pola.');
      return;
    }
    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków.');
      return;
    }
    if (!acceptTerms) {
      setError('Zaakceptuj regulamin, aby kontynuować.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd rejestracji.');
        return;
      }
      router.push('/sprawdz-email');
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
            <div className="eyebrow green" style={{ marginBottom: 16 }}>Rejestracja</div>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 8 }}>
              Załóż darmowe konto
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 28 }}>
              Świadczenia, dotacje, wnioski, aktualności i asystent AI w jednym miejscu
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--f-mono)', fontSize: 11,
                  color: 'var(--ink-500)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>E-mail</label>
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
              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--f-mono)', fontSize: 11,
                  color: 'var(--ink-500)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Hasło (min. 8 znaków)</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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

              <label style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                cursor: 'pointer', fontSize: 13, color: 'var(--ink-700)',
                lineHeight: 1.5,
              }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: 3, flexShrink: 0 }}
                />
                <span>
                  Akceptuję{' '}
                  <a href="/regulamin" target="_blank" style={{ color: 'var(--green-700)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    regulamin serwisu
                  </a>
                  {' '}i{' '}
                  <a href="/polityka-prywatnosci" target="_blank" style={{ color: 'var(--green-700)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    politykę prywatności
                  </a>
                </span>
              </label>

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
                className="btn btn-green"
                style={{
                  width: '100%', justifyContent: 'center',
                  marginTop: 4,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Tworzę konto...' : 'Załóż konto'}
              </button>
            </form>

            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: '1px solid var(--line)',
            }}>
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 11,
                color: 'var(--ink-400)', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: 12,
              }}>
                Jedno konto daje Ci dostęp do
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Kalkulator świadczeń i ulg',
                  'Monitoring dotacji i dofinansowań',
                  'Asystent AI do wniosków',
                  'Aktualności prawne i RSS',
                  'Dzienny digest e-mail',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="var(--green-100)" />
                      <path d="M5 8l2 2 4-4" stroke="var(--green-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--ink-700)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 20, textAlign: 'center' }}>
            Masz już konto?{' '}
            <Link href="/logowanie" style={{ color: 'var(--green-800)', fontWeight: 500 }}>
              Zaloguj się
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
