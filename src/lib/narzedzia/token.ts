/** Jednorazowy token potwierdzenia e-maila: losowy, w bazie tylko SHA-256, ważny 7 dni. */
import { createHash, randomBytes } from 'crypto';

export const TOKEN_DNI = 7;

export function nowyToken(): string {
  return randomBytes(24).toString('hex');
}

export function hashTokenu(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function terminTokenu(teraz = Date.now()): Date {
  return new Date(teraz + TOKEN_DNI * 24 * 3600 * 1000);
}

export function poprawnyFormat(token: string | null | undefined): token is string {
  return typeof token === 'string' && /^[0-9a-f]{48}$/.test(token);
}

export function wygasl(wygasa: string | Date | null | undefined, teraz = Date.now()): boolean {
  if (!wygasa) return true;
  return new Date(wygasa).getTime() <= teraz;
}
