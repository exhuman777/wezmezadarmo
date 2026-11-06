'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function NoweHaslo() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/logowanie');
      } else {
        setSessionChecked(true);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message ?? 'Błąd zmiany hasła.');
        return;
      }
      router.push('/panel');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) return null;

  return (
    <main>
      <section style={{ padding: '80px 0', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ padding: '24px 20px', border: '2px solid var(--tusz)', background: 'var(--surface)' }}>
            <p className="etykieta">Nowe hasło</p>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', marginBottom: 28 }}>
              Ustaw nowe hasło
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="pole-etykieta" style={{ display: 'block', marginBottom: 6 }}>Nowe hasło (min. 8 znaków)</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pole-wejscie"
                />
              </div>
              <div>
                <label className="pole-etykieta" style={{ display: 'block', marginBottom: 6 }}>Powtórz hasło</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
