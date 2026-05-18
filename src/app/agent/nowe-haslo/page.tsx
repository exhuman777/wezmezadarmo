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
        router.replace('/agent/logowanie');
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
      router.push('/agent/panel');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) {
    return null;
  }

  return (
    <main>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-text-3)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 8,
        }}>
          Nowe hasło
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
          Ustaw nowe hasło
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--color-text-3)', marginBottom: 6,
            }}>
              Nowe hasło (min. 8 znaków)
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{
              display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--color-text-3)', marginBottom: 6,
            }}>
              Powtórz hasło
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            padding: '10px 24px', background: loading ? 'var(--color-border)' : 'var(--color-accent)',
            color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
          </button>
        </form>
      </div>
    </main>
  );
}
