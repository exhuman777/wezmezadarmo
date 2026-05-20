'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LogowanieForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get('error') === 'link_wygasl';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Nieprawidłowy email lub hasło.');
        return;
      }
      router.push('/panel');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: '80px 0', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div className="card card-glass" style={{ padding: '40px 36px' }}>
          <div className="eyebrow green" style={{ marginBottom: 16 }}>Logowanie</div>
          <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 8 }}>
            Zaloguj się do konta
          </h3>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 28 }}>
            Jeden login, dostęp do wszystkich narzędzi
          </p>

          {linkError && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-sm)',
              background: 'var(--red-50)', border: '1px solid var(--red-100)',
              fontSize: 13, color: 'var(--red-700)', marginBottom: 16, lineHeight: 1.5,
            }}>
              Link wygasł lub jest nieprawidłowy. Spróbuj ponownie lub zarejestruj się.
            </div>
          )}

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
              }}>Hasło</label>
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
                marginTop: 4,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>

            <Link href="/reset-hasla" style={{
              fontFamily: 'var(--f-mono)', fontSize: 12,
              color: 'var(--green-700)', textDecoration: 'none',
              textAlign: 'center',
            }}>
              Nie pamiętasz hasła?
            </Link>
          </form>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 20, textAlign: 'center' }}>
          Nie masz konta?{' '}
          <Link href="/rejestracja" style={{ color: 'var(--green-800)', fontWeight: 500 }}>
            Załóż za darmo
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function Logowanie() {
  return (
    <main>
      <Suspense fallback={null}>
        <LogowanieForm />
      </Suspense>
    </main>
  );
}
