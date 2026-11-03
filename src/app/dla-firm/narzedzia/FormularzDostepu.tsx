'use client';

import { useState } from 'react';
import Link from 'next/link';
import { normalizujTelefon, ZGODA_TRESC } from '@/lib/narzedzia/walidacja';

type Stan = 'idle' | 'wysylam' | 'gotowe' | 'blad';

const pole: React.CSSProperties = {
  width: '100%', minHeight: 44, padding: '10px 12px', fontSize: 16,
  border: '2px solid var(--tusz)', background: 'var(--surface, #fff)', color: 'var(--tusz)',
};
const etykieta: React.CSSProperties = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 };

interface Props {
  /** Dokąd przejść po wysłaniu (ścieżka wewnętrzna, serwer i tak ją sprawdza). */
  next?: string;
  /** Tekst przycisku. */
  przycisk?: string;
}

/** Formularz dostępu do narzędzi: e-mail i telefon wymagane, imię opcjonalne, zgoda. Dostęp od razu po wysłaniu. */
export function FormularzDostepu({ next = '/dla-firm/narzedzia', przycisk = 'Otwórz narzędzia' }: Props) {
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [imie, setImie] = useState('');
  const [zgoda, setZgoda] = useState(false);
  const [www, setWww] = useState('');
  const [stan, setStan] = useState<Stan>('idle');
  const [blad, setBlad] = useState('');
  const [cel, setCel] = useState('');

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    setBlad('');
    if (!email.includes('@')) { setBlad('Podaj adres e-mail.'); return; }
    if (!normalizujTelefon(telefon)) { setBlad('Podaj numer telefonu: 9 cyfr, np. 600 100 200.'); return; }
    if (!zgoda) { setBlad('Zaznacz zgodę na kontakt, żeby otworzyć narzędzia.'); return; }
    setStan('wysylam');
    try {
      const r = await fetch('/api/narzedzia/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telefon, imie, zgoda, www, next }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; next?: string };
      if (!r.ok) { setBlad(d.error ?? 'Nie udało się wysłać. Spróbuj za chwilę.'); setStan('blad'); return; }
      const dokad = d.next ?? next;
      setCel(dokad);
      setStan('gotowe');
      window.location.assign(dokad);
    } catch {
      setBlad('Brak połączenia. Spróbuj ponownie.');
      setStan('blad');
    }
  }

  if (stan === 'gotowe') {
    return (
      <div role="status" style={{ border: '2px solid var(--tusz)', padding: 20, background: 'var(--surface, #fff)' }}>
        <h3 style={{ fontFamily: 'var(--f-mono)', fontSize: 20, margin: '0 0 8px' }}>Gotowe, otwieram narzędzie</h3>
        <p style={{ margin: 0 }}>Dostęp działa na tym urządzeniu przez 30 dni. Nie otworzyło się? <a href={cel} data-testid="link-do-narzedzia">Przejdź do narzędzia</a>.</p>
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
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
        <input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flex: '0 0 auto' }} />
        <span>{ZGODA_TRESC} <Link href="/polityka-prywatnosci#narzedzia">Polityka prywatności</Link>.</span>
      </label>
      {blad && <p role="alert" style={{ margin: 0, color: 'var(--rdza)', fontWeight: 600 }}>{blad}</p>}
      <button type="submit" className="btn btn-rdza btn-lg" disabled={stan === 'wysylam'}>
        {stan === 'wysylam' ? 'Otwieram...' : przycisk}
      </button>
    </form>
  );
}
