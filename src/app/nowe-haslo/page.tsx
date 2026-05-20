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
          <div className="card card-glass" style={{ padding: '40px 36px' }}>
            <div className="eyebrow green" style={{ marginBottom: 16 }}>Nowe hasło</div>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 28 }}>
              Ustaw nowe hasło
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--f-mono)', fontSize: 11,
                  color: 'var(--ink-500)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Nowe hasło (min. 8 znaków)</label>
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
              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--f-mono)', fontSize: 11,
                  color: 'var(--ink-500)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Powtórz hasło</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
