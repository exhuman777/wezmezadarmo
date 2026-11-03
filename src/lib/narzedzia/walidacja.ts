/** Walidacja formularza dostępu do narzędzi. E-mail i telefon wymagane, imię opcjonalne, zgoda wymagana. */

export const ZGODA_TRESC =
  'Zgadzam się, żeby wezmezadarmo.com (administrator danych wskazany w polityce prywatności) skontaktowało się ze mną e-mailem lub telefonicznie w sprawie narzędzi dla firm. Zgodę mogę wycofać w każdej chwili.';

export interface LeadWejscie {
  email: string;
  imie: string | null;
  telefon: string | null;
}

export type WynikWalidacji =
  | { ok: true; dane: LeadWejscie }
  | { ok: false; pulapka: true }
  | { ok: false; pulapka?: false; blad: string };

const txt = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '');

export function poprawnyEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Polski numer telefonu: 9 cyfr, opcjonalnie z +48 (albo 0048) na początku.
 * Spacje, myślniki, kropki i nawiasy są ignorowane. Zwraca postać „+48 600 100 200” albo null.
 */
export function normalizujTelefon(surowy: string): string | null {
  const s = surowy.trim();
  if (!/^[\d\s+().-]+$/.test(s)) return null;
  let cyfry = s.replace(/[\s().-]/g, '');
  if (cyfry.startsWith('+48')) cyfry = cyfry.slice(3);
  else if (cyfry.startsWith('0048')) cyfry = cyfry.slice(4);
  if (!/^\d{9}$/.test(cyfry)) return null;
  return `+48 ${cyfry.slice(0, 3)} ${cyfry.slice(3, 6)} ${cyfry.slice(6)}`;
}

export function walidujLead(body: unknown): WynikWalidacji {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  // Pułapka na boty: pole niewidoczne dla ludzi.
  if (txt(b.www, 200)) return { ok: false, pulapka: true };
  const email = txt(b.email, 254).toLowerCase();
  if (!email || !poprawnyEmail(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
  const telefonSurowy = txt(b.telefon, 30);
  if (!telefonSurowy) return { ok: false, blad: 'Podaj numer telefonu.' };
  const telefon = normalizujTelefon(telefonSurowy);
  if (!telefon) return { ok: false, blad: 'Podaj numer telefonu: 9 cyfr, np. 600 100 200.' };
  if (b.zgoda !== true) return { ok: false, blad: 'Zaznacz zgodę na kontakt, żeby otworzyć narzędzia.' };
  const imie = txt(b.imie, 80) || null;
  return { ok: true, dane: { email, imie, telefon } };
}

/** Domyślne miejsce po wysłaniu formularza. */
export const NEXT_DOMYSLNY = '/dla-firm/narzedzia';

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
    const ok = sciezka === NEXT_DOMYSLNY || sciezka.startsWith(`${NEXT_DOMYSLNY}/`) || sciezka.startsWith('/narzedzia/');
    if (!ok) return NEXT_DOMYSLNY;
    return `${sciezka}${u.search}`;
  } catch {
    return NEXT_DOMYSLNY;
  }
}
