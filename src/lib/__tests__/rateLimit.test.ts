import { describe, it, expect } from 'vitest';
import { checkRateLimit, checkRateLimitDurable } from '../rateLimit';

describe('checkRateLimit (in-memory)', () => {
  it('pozwala na 3 zapytania, blokuje 4.', () => {
    const ip = '203.0.113.7';
    expect(checkRateLimit(ip)).toEqual({ allowed: true, remaining: 2 });
    expect(checkRateLimit(ip)).toEqual({ allowed: true, remaining: 1 });
    expect(checkRateLimit(ip)).toEqual({ allowed: true, remaining: 0 });
    expect(checkRateLimit(ip)).toEqual({ allowed: false, remaining: 0 });
  });

  it('liczy osobno per IP', () => {
    expect(checkRateLimit('203.0.113.8').allowed).toBe(true);
    expect(checkRateLimit('203.0.113.9').allowed).toBe(true);
  });
});

describe('checkRateLimitDurable', () => {
  it('bez env Supabase spada do limitu w pamieci i egzekwuje 3/24h', async () => {
    // W srodowisku testowym brak SUPABASE_SERVICE_ROLE_KEY -> fallback.
    const ip = '203.0.113.50';
    expect((await checkRateLimitDurable(ip)).allowed).toBe(true);
    expect((await checkRateLimitDurable(ip)).allowed).toBe(true);
    expect((await checkRateLimitDurable(ip)).allowed).toBe(true);
    const fourth = await checkRateLimitDurable(ip);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });
});
