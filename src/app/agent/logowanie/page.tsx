'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const inputStyle = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '10px 14px', fontSize: 14,
  background: 'var(--color-bg-1)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-1)',
  outline: 'none',
};

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
      const res = await fetch('/api/agent/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Nieprawidłowy email lub hasło.');
        return;
      }
      router.push('/agent/panel');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        Logowanie
      </div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 32 }}>
        Zaloguj się do panelu
      </h1>
      {linkError && (
        <p style={{ fontSize: 13, color: '#e05c5c', marginBottom: 16, lineHeight: 1.5 }}>
          Link wygasł lub jest nieprawidłowy. Skontaktuj się z nami lub zarejestruj się ponownie.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', marginBottom: 6 }}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="jan@kowalski.pl" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', marginBottom: 6 }}>Hasło</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required style={inputStyle} />
        </div>
        {error && <p style={{ fontSize: 13, color: '#e05c5c', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          padding: '11px', background: loading ? 'var(--color-border)' : 'var(--color-accent)',
          color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
        <Link href="/agent/reset-hasla" style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--color-accent)', textDecoration: 'none',
          textAlign: 'center' as const,
        }}>
          Nie pamiętasz hasła?
        </Link>
      </form>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 20, textAlign: 'center' }}>
        Nie masz konta?{' '}
        <Link href="/agent/rejestracja" style={{ color: 'var(--color-accent)' }}>Zarejestruj się</Link>
      </p>
    </div>
  );
}

export default function AgentLogowanie() {
  return (
    <main>
      <Suspense fallback={null}>
        <LogowanieForm />
      </Suspense>
    </main>
  );
}
