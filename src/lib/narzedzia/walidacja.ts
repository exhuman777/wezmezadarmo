/**
 * Walidacja formularza przy sprawdzeniu firmy po NIP. E-mail, telefon (polski numer) i zgoda wymagane, imię opcjonalne.
 * E-mail: bez aliasu z plusem (ktos+1@...) i bez domen jednorazowych (lista CC0 w domeny-jednorazowe.ts). Adres potwierdza link z maila.
 */
import { DOMENY_JEDNORAZOWE_TEKST } from './domeny-jednorazowe';
import { BLAD_ZGODY, odczytajZgody, type Zgody } from '@/lib/zgody';

export { ZGODA_TRESC } from './zgoda';

export interface LeadWejscie {
  email: string;
  imie: string | null;
  telefon: string | null;
  /** Zgody z formularza (osobne pola); brak = tylko wymagana zgoda e-mail. */
  zgody?: Zgody;
}

export type WynikWalidacji =
  | { ok: true; dane: LeadWejscie }
  | { ok: false; pulapka: true }
  | { ok: false; pulapka?: false; blad: string };

const txt = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '');

export function poprawnyEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

let jednorazowe: Set<string> | null = null;

/** Czy domena (albo jej domena nadrzędna, np. x.mailinator.com) jest na liście domen jednorazowych. */
export function domenaJednorazowa(email: string): boolean {
  jednorazowe ??= new Set(DOMENY_JEDNORAZOWE_TEKST.split('\n'));
  const czesci = email.slice(email.lastIndexOf('@') + 1).toLowerCase().split('.');
  for (let i = 0; i < czesci.length - 1; i++) if (jednorazowe.has(czesci.slice(i).join('.'))) return true;
  return false;
}

/** Alias z plusem (ktos+cokolwiek@domena) daje nieskończenie wiele adresów jednej skrzynki. */
export function aliasPlus(email: string): boolean {
  return email.slice(0, email.lastIndexOf('@')).includes('+');
}

export { normalizujTelefon } from './telefon';
import { normalizujTelefon } from './telefon';

export function walidujLead(body: unknown): WynikWalidacji {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  // Pułapka na boty: pole niewidoczne dla ludzi.
  if (txt(b.www, 200)) return { ok: false, pulapka: true };
  const email = txt(b.email, 254).toLowerCase();
  if (!email || !poprawnyEmail(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
  if (aliasPlus(email)) return { ok: false, blad: 'Podaj adres bez znaku plus (np. jan@firma.pl zamiast jan+1@firma.pl).' };
  if (domenaJednorazowa(email)) return { ok: false, blad: 'Adresy jednorazowe nie działają. Podaj stały adres e-mail, na który przyjdzie link.' };
  const telefonSurowy = txt(b.telefon, 30);
  if (!telefonSurowy) return { ok: false, blad: 'Podaj numer telefonu.' };
  const telefon = normalizujTelefon(telefonSurowy);
  if (!telefon) return { ok: false, blad: 'Podaj polski numer telefonu: 9 cyfr, np. 600 100 200.' };
  const zgody = odczytajZgody(b.zgody, true);
  if (!zgody.email) return { ok: false, blad: BLAD_ZGODY };
  const imie = txt(b.imie, 80) || null;
  return { ok: true, dane: { email, imie, telefon, zgody } };
}

/** Domyślne miejsce po wysłaniu formularza: sprawdzenie firmy po NIP (jedyne narzędzie z e-mailem). */
export const NEXT_DOMYSLNY = '/dla-firm/narzedzia/dofinansowania';

/**
 * Bezpieczny adres powrotu po formularzu: tylko ścieżki wewnętrzne narzędzi.
 * Odrzuca adresy absolutne, „//host”, ukośniki wsteczne, znaki sterujące i wszystko poza /narzedzia/ i /dla-firm/narzedzia.
 */
export function bezpiecznyNext(n: unknown): string {
  if (typeof n !== 'string' || n.length === 0 || n.length > 200) return NEXT_DOMYSLNY;
  if (!n.startsWith('/') || n.startsWith('//') || n.includes('\\') || /[\u0000-\u001f\s]/.test(n)) return NEXT_DOMYSLNY;
  let sciezka: string;
  try {
    const u = new URL(n, 'https://www.wezmezadarmo.com');
    if (u.origin !== 'https://www.wezmezadarmo.com') return NEXT_DOMYSLNY;
    sciezka = u.pathname;
    if (sciezka.split('/').includes('..')) return NEXT_DOMYSLNY;
    const ok = sciezka === '/dla-firm/narzedzia' || sciezka.startsWith('/dla-firm/narzedzia/') || sciezka.startsWith('/narzedzia/');
    if (!ok) return NEXT_DOMYSLNY;
    return `${sciezka}${u.search}`;
  } catch {
    return NEXT_DOMYSLNY;
  }
}
