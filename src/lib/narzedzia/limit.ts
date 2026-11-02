/** Limit zgłoszeń formularza dostępu: 5 na IP na godzinę (w pamięci instancji, jak inne formularze). */
import { createHash } from 'crypto';

const LIMIT = 5;
const OKNO_MS = 60 * 60 * 1000;
const trafienia = new Map<string, number[]>();

export function limitOk(ip: string, teraz = Date.now()): boolean {
  const h = (trafienia.get(ip) ?? []).filter((t) => teraz - t < OKNO_MS);
  if (h.length >= LIMIT) { trafienia.set(ip, h); return false; }
  h.push(teraz);
  trafienia.set(ip, h);
  return true;
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(`narzedzia:${ip}`).digest('hex').slice(0, 32);
}

export function ipZadania(h: Headers): string {
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'nieznany';
}
