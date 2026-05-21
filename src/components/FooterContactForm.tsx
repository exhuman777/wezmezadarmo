'use client';

import { useState } from 'react';

export function FooterContactForm() {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    fontSize: 13,
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: 'var(--ink-700)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  if (status === 'ok') {
    return (
      <div style={{ fontSize: 13, color: 'var(--ink-500)', padding: '12px 0' }}>
        Wiadomość wysłana. Odpiszemy wkrótce.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-500)', marginBottom: 5 }}>Imię i nazwisko</label>
        <input
          type="text"
          required
          placeholder="Jan Kowalski"
          autoComplete="name"
          value={form.imie}
          onChange={e => setForm(prev => ({ ...prev, imie: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-500)', marginBottom: 5 }}>E-mail</label>
        <input
          type="email"
          required
          placeholder="jan@firma.pl"
          autoComplete="email"
          value={form.email}
          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-500)', marginBottom: 5 }}>Wiadomość</label>
        <textarea
          required
          rows={3}
          placeholder="Opisz krótko czego szukasz..."
          value={form.wiadomosc}
          onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 12, color: 'var(--red-400)', margin: 0 }}>{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          padding: '9px 18px',
          background: status === 'sending' ? 'var(--ink-300)' : 'var(--ink-900)',
          color: 'var(--paper)',
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 8,
          border: 'none',
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        {status === 'sending' ? 'Wysyłanie...' : 'Wyślij'}
      </button>
    </form>
  );
}
