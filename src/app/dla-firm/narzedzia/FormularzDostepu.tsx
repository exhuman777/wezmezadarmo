'use client';

import { useState } from 'react';
import { ZgodyKontaktu } from '@/components/ZgodyKontaktu';
import { BLAD_ZGODY, ZGODY_PUSTE, type Zgody } from '@/lib/zgody';
import { normalizujTelefon } from '@/lib/narzedzia/telefon';

type Stan = 'idle' | 'wysylam' | 'gotowe' | 'blad';

const pole: React.CSSProperties = {
  width: '100%', minHeight: 48, padding: '10px 14px', fontSize: 16,
  border: '2px solid var(--tusz)', background: 'var(--surface, #fff)', color: 'var(--tusz)',
};
const etykieta: React.CSSProperties = { display: 'block', fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700, marginBottom: 6 };

interface Props {
  /** Dokąd przejść po wysłaniu (ścieżka wewnętrzna, serwer i tak ją sprawdza). */
  next?: string;
  /** Tekst przycisku. */
  przycisk?: string;
}

/**
 * Formularz przy sprawdzeniu firmy po NIP: e-mail i telefon (polski numer) wymagane, imię opcjonalne, zgoda.
 * Double opt-in: po wysłaniu prosi o kliknięcie linku z maila, wynik otwiera się dopiero po nim.
 */
export function FormularzDostepu({ next = '/dla-firm/narzedzia/dofinansowania', przycisk = 'Sprawdź firmę po NIP' }: Props) {
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [imie, setImie] = useState('');
  const [zgody, setZgody] = useState<Zgody>(ZGODY_PUSTE);
  const [www, setWww] = useState('');
  const [stan, setStan] = useState<Stan>('idle');
  const [blad, setBlad] = useState('');
  const [linkTestowy, setLinkTestowy] = useState('');

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    setBlad('');
    if (!email.includes('@')) { setBlad('Podaj adres e-mail.'); return; }
    // Domeny jednorazowe sprawdza serwer (lista jest za duża dla przeglądarki).
    if (email.slice(0, email.lastIndexOf('@')).includes('+')) { setBlad('Podaj adres bez znaku plus (np. jan@firma.pl zamiast jan+1@firma.pl).'); return; }
    if (!normalizujTelefon(telefon)) { setBlad('Podaj polski numer telefonu: 9 cyfr, np. 600 100 200.'); return; }
    if (!zgody.email) { setBlad(BLAD_ZGODY); return; }
    setStan('wysylam');
    try {
      const r = await fetch('/api/narzedzia/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telefon, imie, zgody, www, next }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; linkTestowy?: string };
      if (!r.ok) { setBlad(d.error ?? 'Nie udało się wysłać. Spróbuj za chwilę.'); setStan('blad'); return; }
      setLinkTestowy(d.linkTestowy ?? '');
      setStan('gotowe');
    } catch {
      setBlad('Brak połączenia. Spróbuj ponownie.');
      setStan('blad');
    }
  }

  if (stan === 'gotowe') {
    return (
      <div role="status" style={{ border: '2px solid var(--tusz)', padding: 20, background: 'var(--surface, #fff)' }}>
        <h3 style={{ fontFamily: 'var(--f-mono)', fontSize: 20, margin: '0 0 8px' }}>Sprawdź skrzynkę</h3>
        <p style={{ margin: 0 }}>Wysłaliśmy link na {email}. Kliknij go, a wyszukiwarka po NIP otworzy się na 30 dni. Link działa 7 dni. Nie widzisz maila? Zajrzyj do spamu.</p>
        {linkTestowy && <p className="mala" style={{ margin: '8px 0 0' }}><a href={linkTestowy} data-testid="link-testowy">Link testowy (tylko tryb testowy)</a></p>}
      </div>
    );
  }

  return (
    <form onSubmit={wyslij} noValidate data-testid="formularz-narzedzia" style={{ display: 'grid', gap: 14, border: '2px solid var(--tusz)', padding: 20, background: 'var(--surface, #fff)' }}>
      <div>
        <label htmlFor="n-email" style={etykieta}>E-mail</label>
        <input id="n-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} style={pole} />
      </div>
      <div>
        <label htmlFor="n-tel" style={etykieta}>Telefon</label>
        <input id="n-tel" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} placeholder="600 100 200" value={telefon} onChange={(e) => setTelefon(e.target.value)} style={pole} />
      </div>
      <div>
        <label htmlFor="n-imie" style={etykieta}>Imię (opcjonalnie)</label>
        <input id="n-imie" autoComplete="given-name" maxLength={80} value={imie} onChange={(e) => setImie(e.target.value)} style={pole} />
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="n-www">Strona www</label>
        <input id="n-www" tabIndex={-1} autoComplete="off" value={www} onChange={(e) => setWww(e.target.value)} />
      </div>
      <ZgodyKontaktu telefon wartosci={zgody} onChange={setZgody} prefiks="n" />
      {blad && <p role="alert" style={{ margin: 0, color: 'var(--rdza)', fontWeight: 600 }}>{blad}</p>}
      <button type="submit" className="btn btn-rdza btn-lg" disabled={stan === 'wysylam'}>
        {stan === 'wysylam' ? 'Otwieram...' : przycisk}
      </button>
    </form>
  );
}
