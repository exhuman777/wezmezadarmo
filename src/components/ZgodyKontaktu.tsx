'use client';

import Link from 'next/link';
import { ZGODY, type RodzajZgody, type Zgody } from '@/lib/zgody';

interface Props {
  /** Formularz pyta o telefon: pokaż zgodę na kontakt telefoniczny. */
  telefon: boolean;
  wartosci: Zgody;
  onChange: (z: Zgody) => void;
  /** Prefiks id pól (kilka formularzy na jednej stronie). */
  prefiks: string;
  /** Inna treść wymaganej zgody e-mail (np. newsletter); zapisuje się w bazie jako treść tej wersji. */
  trescEmail?: string;
}

/** Osobne zgody na kontakt, domyślnie odznaczone; wymagana tylko zgoda e-mail w sprawie zgłoszenia. */
export function ZgodyKontaktu({ telefon, wartosci, onChange, prefiks, trescEmail }: Props) {
  const widoczne = ZGODY.filter(z => telefon || !z.tylkoZTelefonem);
  return (
    <fieldset data-testid="zgody-kontaktu" style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 10 }}>
      <legend className="pole-etykieta" style={{ marginBottom: 6 }}>Zgody na kontakt</legend>
      {widoczne.map(z => (
        <label key={z.id} htmlFor={`${prefiks}-zgoda-${z.id}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
          <input
            id={`${prefiks}-zgoda-${z.id}`}
            type="checkbox"
            name={`zgoda-${z.id}`}
            data-zgoda={z.id}
            required={z.wymagana}
            checked={wartosci[z.id as RodzajZgody]}
            onChange={e => onChange({ ...wartosci, [z.id]: e.target.checked })}
            style={{ width: 20, height: 20, marginTop: 2, flex: '0 0 auto' }}
          />
          <span>{z.id === 'email' && trescEmail ? trescEmail : z.tresc} <Link href="/polityka-prywatnosci#zgody">Polityka prywatności</Link>.</span>
        </label>
      ))}
    </fieldset>
  );
}
