'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [profileType, setProfileType] = useState<'private' | 'jdg'>('private');
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || !accepted) {
      setErrorMsg('Podaj poprawny e-mail i zaakceptuj politykę.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profileType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Nie udało się zapisać. Spróbuj później.');
        setStatus('error');
        return;
      }
      setStatus('ok');
      setEmail('');
      track.digestEnabled();
    } catch {
      setErrorMsg('Błąd połączenia. Spróbuj ponownie.');
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div style={{
        padding: '14px 18px',
        background: 'rgba(47,125,90,0.08)',
        border: '1px solid rgba(47,125,90,0.3)',
        borderRadius: 2,
        fontSize: 13,
        color: 'var(--color-text-1)',
      }}>
        ✓ Dziękujemy! Sprawdź skrzynkę, żeby potwierdzić zapis.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 2 }}>
        Newsletter wezmezadarmo
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: 0, lineHeight: 1.5 }}>
        Co tydzień: nowe świadczenia, terminy naborów, zmiany w prawie. Bez spamu, wypisanie 1 klik.
      </p>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setProfileType('private')}
          style={{
            padding: '6px 10px', fontSize: 11,
            background: profileType === 'private' ? 'var(--ink-900)' : 'transparent',
            color: profileType === 'private' ? '#fff' : 'var(--ink-700)',
            border: '1px solid ' + (profileType === 'private' ? 'var(--ink-900)' : 'var(--line)'),
            borderRadius: 2, cursor: 'pointer',
          }}
        >
          Osoba prywatna
        </button>
        <button
          type="button"
          onClick={() => setProfileType('jdg')}
          style={{
            padding: '6px 10px', fontSize: 11,
            background: profileType === 'jdg' ? 'var(--ink-900)' : 'transparent',
            color: profileType === 'jdg' ? '#fff' : 'var(--ink-700)',
            border: '1px solid ' + (profileType === 'jdg' ? 'var(--ink-900)' : 'var(--line)'),
            borderRadius: 2, cursor: 'pointer',
          }}
        >
          Firma / JDG
        </button>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="twoj@email.pl"
        disabled={status === 'sending'}
        required
        style={{
          width: '100%', padding: '10px 12px',
          fontSize: 14,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 2,
          color: 'var(--ink-900)',
          outline: 'none',
        }}
      />

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: 'var(--ink-500)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{ marginTop: 2, accentColor: '#2b7353', flexShrink: 0 }}
        />
        <span>
          Zgadzam się na otrzymywanie newslettera. Mogę się wypisać w każdej chwili.{' '}
          <a href="/polityka-prywatnosci" style={{ color: 'var(--ink-700)', textDecoration: 'underline' }}>Polityka prywatności</a>.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === 'sending' || !email || !accepted}
        style={{
          padding: '10px 16px',
          background: (status === 'sending' || !email || !accepted) ? 'var(--line)' : 'var(--ink-900)',
          color: '#fff',
          border: 'none', borderRadius: 2,
          fontSize: 13, fontWeight: 500,
          cursor: (status === 'sending' || !email || !accepted) ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'sending' ? 'Zapisuję...' : 'Zapisz się'}
      </button>

      {status === 'error' && errorMsg && (
        <div style={{ fontSize: 11, color: '#b23d30', marginTop: 2 }}>
          {errorMsg}
        </div>
      )}
    </form>
  );
}
