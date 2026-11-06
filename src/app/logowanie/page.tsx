'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { bezpiecznaSciezkaPowrotu } from '@/lib/auth/sciezka';

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
      const next = searchParams.get('next');
      router.push(bezpiecznaSciezkaPowrotu(next, '/panel'));
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: '80px 0', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div style={{ padding: '24px 20px', border: '2px solid var(--tusz)', background: 'var(--surface)' }}>
          <p className="etykieta">Logowanie</p>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', marginBottom: 8 }}>
            Zaloguj się do konta
          </h1>
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
              <label className="pole-etykieta" style={{ display: 'block', marginBottom: 6 }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="jan@kowalski.pl"
                className="pole-wejscie"
              />
            </div>
            <div>
              <label className="pole-etykieta" style={{ display: 'block', marginBottom: 6 }}>Hasło</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
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
    // min. wysokość ekranu: stopka nie skacze, gdy formularz pojawia się po stronie przeglądarki
    <main style={{ minHeight: '100svh' }}>
      <Suspense fallback={null}>
        <LogowanieForm />
      </Suspense>
    </main>
  );
}
