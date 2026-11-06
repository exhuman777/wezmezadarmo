'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { ZgodyKontaktu } from '@/components/ZgodyKontaktu';
import { ZGODA_NEWSLETTER, ZGODY_PUSTE, type Zgody } from '@/lib/zgody';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [profileType, setProfileType] = useState<'private' | 'jdg'>('private');
  const [zgody, setZgody] = useState<Zgody>(ZGODY_PUSTE);
  const accepted = zgody.email;
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || !accepted) {
      setErrorMsg('Podaj poprawny e-mail i zaznacz zgodę na newsletter.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profileType, zgody }),
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
      <p role="status" style={{ margin: 0, padding: '12px 0', fontSize: 15, color: 'var(--ink-700)' }}>
        Dziękujemy! Sprawdź skrzynkę, żeby potwierdzić zapis.
      </p>
    );
  }

  const zablokowany = status === 'sending' || !email || !accepted;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="pole-etykieta" style={{ margin: 0 }}>Newsletter wezmezadarmo</p>
      <p style={{ fontSize: 14, color: 'var(--szary)', margin: 0, lineHeight: 1.5 }}>
        Co tydzień: nowe świadczenia, terminy naborów, zmiany w prawie. Bez spamu, wypisanie 1 klik.
      </p>

      <div className="filtry" role="group" aria-label="Dla kogo" style={{ marginTop: 0 }}>
        <button type="button" className="filtr" aria-pressed={profileType === 'private'} onClick={() => setProfileType('private')}>
          Osoba prywatna
        </button>
        <button type="button" className="filtr" aria-pressed={profileType === 'jdg'} onClick={() => setProfileType('jdg')}>
          Firma / JDG
        </button>
      </div>

      <label htmlFor="newsletter-email" className="sr-only">Adres e-mail</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="twoj@email.pl"
        disabled={status === 'sending'}
        required
        autoComplete="email"
        className="pole-wejscie"
      />

      <ZgodyKontaktu telefon={false} wartosci={zgody} onChange={setZgody} prefiks="newsletter" trescEmail={ZGODA_NEWSLETTER} />

      <div>
        <button type="submit" disabled={zablokowany} className="btn btn-primary">
          {status === 'sending' ? 'Zapisuję...' : 'Zapisz się'}
        </button>
      </div>

      {status === 'error' && errorMsg && (
        <p role="alert" style={{ fontSize: 14, color: 'var(--rdza)', margin: 0 }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
