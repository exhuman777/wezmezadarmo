/**
 * Dostęp do sprawdzenia firmy po NIP po potwierdzeniu e-maila (kliknięcie linku z maila, double opt-in).
 * Ciasteczko httpOnly: `<idLeada>.<wygasa_unix>.<podpis>`, podpis HMAC-SHA256 (Web Crypto: działa w middleware i w API).
 * Sekret: NARZEDZIA_SECRET, a bez niego klucz pochodny od SUPABASE_SERVICE_ROLE_KEY. Bez obu dostępu nie da się wydać ani sprawdzić: fail closed.
 */

// Nowa nazwa od 6.11.2026: stare ciasteczka wydawane przed potwierdzeniem adresu przestają działać.
export const COOKIE_DOSTEP = 'wzd_nip_potwierdzony';
export const DOSTEP_DNI = 30;
const TEST_SECRET = 'tylko-tryb-testowy-narzedzia';

export function trybTestowy(): boolean {
  return process.env.NARZEDZIA_TRYB_TESTOWY === '1' && process.env.VERCEL !== '1';
}

export function sekret(): string | null {
  const s = process.env.NARZEDZIA_SECRET;
  if (s && s.length >= 16) return s;
  // Bez osobnego sekretu: klucz pochodny od klucza serwisowego Supabase (tylko po stronie serwera),
  // z prefiksem, żeby podpis ciasteczka nie był tym samym kluczem co dostęp do bazy.
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (srk && srk.length >= 16) return `narzedzia-dostep:${srk}`;
  return trybTestowy() ? TEST_SECRET : null;
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function podpis(dane: string, klucz: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(klucz), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', k, enc.encode(dane)));
}

function rowne(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Wartość ciasteczka dla leada; null, gdy brak sekretu. */
export async function wydajDostep(idLeada: string, teraz = Date.now(), klucz = sekret()): Promise<string | null> {
  if (!klucz || !/^[0-9a-zA-Z-]{1,64}$/.test(idLeada)) return null;
  const wygasa = Math.floor(teraz / 1000) + DOSTEP_DNI * 24 * 3600;
  const dane = `${idLeada}.${wygasa}`;
  return `${dane}.${await podpis(dane, klucz)}`;
}

/** Czy ciasteczko jest ważne (podpis i termin). */
export async function sprawdzDostep(wartosc: string | undefined | null, teraz = Date.now(), klucz = sekret()): Promise<boolean> {
  if (!klucz || !wartosc) return false;
  const czesci = wartosc.split('.');
  if (czesci.length !== 3) return false;
  const [id, wygasa, sig] = czesci;
  const exp = Number(wygasa);
  if (!/^[0-9a-zA-Z-]{1,64}$/.test(id) || !Number.isFinite(exp)) return false;
  if (exp * 1000 <= teraz) return false;
  return rowne(sig, await podpis(`${id}.${wygasa}`, klucz));
}
