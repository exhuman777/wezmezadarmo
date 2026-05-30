'use client';

import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px',
  fontSize: 14,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  color: 'var(--color-text-1)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 200ms',
};

export function DotacjeContactForm() {
  const [form, setForm] = useState({ imie: '', email: '', wiadomosc: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Błąd wysyłania.');
        setStatus('error');
      } else {
        setStatus('ok');
      }
    } catch {
      setErrorMsg('Błąd połączenia.');
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div style={{
        padding: '24px',
        background: 'var(--color-green-bg)',
        border: '1px solid var(--color-green-border)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✓</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 2 }}>Wiadomość wysłana</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-3)' }}>Odpiszemy w ciągu 1-2 dni roboczych.</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 6 }}>Imię i nazwisko</label>
          <input
            type="text"
            required
            placeholder="Jan Kowalski"
            autoComplete="name"
            value={form.imie}
            onChange={e => setForm(prev => ({ ...prev, imie: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 6 }}>E-mail firmowy</label>
          <input
            type="email"
            required
            placeholder="jan@firma.pl"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 6 }}>Opisz czego szukasz</label>
        <textarea
          required
          rows={4}
          placeholder="Branża firmy, liczba pracowników, co chcesz zautomatyzować..."
          value={form.wiadomosc}
          onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: 'var(--color-red, #e06c75)', margin: 0 }}>{errorMsg}</p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            padding: '12px 28px',
            background: status === 'sending' ? 'var(--color-surface-2)' : 'var(--color-text-1)',
            color: status === 'sending' ? 'var(--color-text-3)' : 'var(--color-bg-0)',
            fontWeight: 500,
            fontSize: 14,
            borderRadius: 12,
            border: 'none',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            transition: 'all 200ms',
            letterSpacing: '-0.01em',
          }}
        >
          {status === 'sending' ? 'Wysyłanie...' : 'Wyślij zapytanie'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Bezpłatnie - odpowiemy po poznaniu potrzeb</span>
      </div>
    </form>
  );
}
