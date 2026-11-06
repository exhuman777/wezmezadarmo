'use client';

import { useState } from 'react';

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
      <div role="status">
        <h3 style={{ fontSize: 20, margin: '0 0 8px', color: 'var(--zielen)' }}>Wiadomość wysłana</h3>
        <p style={{ margin: 0 }}>Odpiszemy w ciągu 1-2 dni roboczych.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="pola-2">
        <div className="pole">
          <label htmlFor="dotacje-imie">Imię i nazwisko</label>
          <input
            id="dotacje-imie"
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
          <label htmlFor="dotacje-email">E-mail firmowy</label>
          <input
            id="dotacje-email"
            type="email"
            required
            placeholder="jan@firma.pl"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="pole-wejscie"
          />
        </div>
      </div>
      <div className="pole">
        <label htmlFor="dotacje-wiadomosc">Opisz, czego szukasz</label>
        <textarea
          id="dotacje-wiadomosc"
          required
          rows={4}
          placeholder="Branża firmy, liczba pracowników, co chcesz zautomatyzować..."
          value={form.wiadomosc}
          onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
          className="pole-wejscie"
        />
      </div>
      {status === 'error' && (
        <p role="alert" style={{ fontSize: 15, color: 'var(--rdza)', margin: 0 }}>{errorMsg}</p>
      )}
      <div>
        <button type="submit" disabled={status === 'sending'} className="btn btn-rdza btn-lg">
          {status === 'sending' ? 'Wysyłanie...' : 'Wyślij zapytanie'}
        </button>
        <p className="mala" style={{ marginTop: 10 }}>Bezpłatnie. Odpowiemy po poznaniu potrzeb.</p>
      </div>
    </form>
  );
}
