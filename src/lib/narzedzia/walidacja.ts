/** Walidacja formularza dostępu do narzędzi. E-mail wymagany, imię i telefon opcjonalne, zgoda wymagana. */

export const ZGODA_TRESC =
  'Zgadzam się, żeby wezmezadarmo.com (Mooning Charts Research Kamil Sobkowicz) skontaktowało się ze mną e-mailem lub telefonicznie w sprawie narzędzi dla firm. Zgodę mogę wycofać w każdej chwili.';

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

export function walidujLead(body: unknown): WynikWalidacji {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  // Pułapka na boty: pole niewidoczne dla ludzi.
  if (txt(b.www, 200)) return { ok: false, pulapka: true };
  const email = txt(b.email, 254).toLowerCase();
  if (!email || !poprawnyEmail(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
  if (b.zgoda !== true) return { ok: false, blad: 'Zaznacz zgodę na kontakt, żeby dostać link.' };
  const imie = txt(b.imie, 80) || null;
  const telefonSurowy = txt(b.telefon, 30);
  const telefon = telefonSurowy ? telefonSurowy.replace(/[^\d+ ]/g, '').trim() : '';
  if (telefonSurowy && !/^\+?[\d ]{9,20}$/.test(telefon)) return { ok: false, blad: 'Numer telefonu wygląda na niepełny. Możesz go pominąć.' };
  return { ok: true, dane: { email, imie, telefon: telefon || null } };
}
