/**
 * Zgody na kontakt w formularzach, które zbierają e-mail (albo e-mail i telefon).
 * Osobne pola, domyślnie odznaczone. Wymagana jest tylko zgoda, bez której zgłoszenie nie ma sensu
 * (kontakt e-mailem w sprawie tego zgłoszenia). Oferty e-mailem, kontakt telefoniczny i kontakt przez
 * asystenta AI są dobrowolne i osobne (zasady wspólne tuKamil z 7.11.2026; numery przepisów celowo pominięte,
 * bo baza-prawa-pl nie ma zweryfikowanych wpisów o zgodach).
 * Zmiana treści = nowa ZGODY_WERSJA: w bazie (tabela zgody_formularzy) zapisujemy wersję, treść i datę.
 * Plik bez zależności serwerowych: używa go formularz w przeglądarce i API.
 */

export const ZGODY_WERSJA = '2026-11-06';

export type RodzajZgody = 'email' | 'emailOferty' | 'telefon' | 'ai';

export interface DefinicjaZgody {
  id: RodzajZgody;
  /** Krótkie zdanie przy polu wyboru. */
  tresc: string;
  wymagana: boolean;
  /** Pole pokazujemy tylko w formularzu, który pyta o telefon. */
  tylkoZTelefonem?: boolean;
}

export const ZGODY: DefinicjaZgody[] = [
  { id: 'email', wymagana: true, tresc: 'Zgadzam się na kontakt e-mailem w sprawie tego zgłoszenia (wymagane, bez tego nie odpowiemy).' },
  { id: 'emailOferty', wymagana: false, tresc: 'Zgadzam się na informacje i oferty tuKamil e-mailem (dobrowolnie).' },
  { id: 'telefon', wymagana: false, tylkoZTelefonem: true, tresc: 'Zgadzam się na kontakt telefoniczny w sprawie zgłoszenia i ofert tuKamil (dobrowolnie).' },
  { id: 'ai', wymagana: false, tresc: 'Zgadzam się na kontakt przez asystenta AI w imieniu tuKamil, np. wiadomość albo rozmowę prowadzoną przez AI (dobrowolnie).' },
];

export type Zgody = Record<RodzajZgody, boolean>;

export const ZGODY_PUSTE: Zgody = { email: false, emailOferty: false, telefon: false, ai: false };

/** Zgody z formularza: tylko pola z definicji, tylko wartość true liczy się jako zgoda. */
export function odczytajZgody(v: unknown, zTelefonem: boolean): Zgody {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return {
    email: o.email === true,
    emailOferty: o.emailOferty === true,
    telefon: zTelefonem && o.telefon === true,
    ai: o.ai === true,
  };
}

/** Treść zgód widocznych w formularzu (do zapisu razem z wersją). */
export function trescZgod(zTelefonem: boolean, trescEmail?: string): Record<string, string> {
  return Object.fromEntries(ZGODY.filter(z => zTelefonem || !z.tylkoZTelefonem).map(z => [z.id, z.id === 'email' && trescEmail ? trescEmail : z.tresc]));
}

/** Treść wymaganej zgody w newsletterze (zapis na newsletter jest celem formularza). */
export const ZGODA_NEWSLETTER = 'Zgadzam się na newsletter wezmezadarmo e-mailem, raz w tygodniu (wymagane do zapisu, wypisanie jednym kliknięciem).';

export const BLAD_ZGODY = 'Zaznacz zgodę na kontakt e-mailem w sprawie zgłoszenia. Pozostałe zgody są dobrowolne.';
