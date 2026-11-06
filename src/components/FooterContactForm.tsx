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

  if (status === 'ok') {
    return (
      <p role="status" style={{ fontSize: 15, color: 'var(--ink-700)', padding: '12px 0', margin: 0 }}>
        Wiadomość wysłana. Odpiszemy wkrótce.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="pole">
        <label htmlFor="stopka-imie">Imię i nazwisko</label>
        <input
          id="stopka-imie"
          type="text"
          required
          placeholder="Jan Kowalski"
          autoComplete="name"
          value={form.imie}
          onChange={e => setForm(prev => ({ ...prev, imie: e.target.value }))}
          className="pole-wejscie"
        />
      </div>
      <div className="pole">
        <label htmlFor="stopka-email">E-mail</label>
        <input
          id="stopka-email"
          type="email"
          required
          placeholder="jan@firma.pl"
          autoComplete="email"
          value={form.email}
          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="pole-wejscie"
        />
      </div>
      <div className="pole">
        <label htmlFor="stopka-wiadomosc">Wiadomość</label>
        <textarea
          id="stopka-wiadomosc"
          required
          rows={3}
          placeholder="Opisz krótko, czego szukasz..."
          value={form.wiadomosc}
          onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
          className="pole-wejscie"
        />
      </div>
      {status === 'error' && (
        <p role="alert" style={{ fontSize: 14, color: 'var(--rdza)', margin: 0 }}>{errorMsg}</p>
      )}
      <div>
        <button type="submit" disabled={status === 'sending'} className="btn btn-primary">
          {status === 'sending' ? 'Wysyłanie...' : 'Wyślij'}
        </button>
      </div>
    </form>
  );
}
