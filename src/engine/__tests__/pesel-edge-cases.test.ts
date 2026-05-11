import { describe, it, expect } from 'vitest';
import { decodePesel, validatePesel } from '../pesel';

describe('PESEL validation edge cases', () => {

  it('rejects empty string', () => {
    expect(validatePesel('')).toBe(false);
  });

  it('rejects whitespace', () => {
    expect(validatePesel('           ')).toBe(false);
  });

  it('rejects letters mixed with digits', () => {
    expect(validatePesel('4405140135a')).toBe(false);
  });

  it('rejects 10-digit string', () => {
    expect(validatePesel('4405140135')).toBe(false);
  });

  it('rejects 12-digit string', () => {
    expect(validatePesel('440514013590')).toBe(false);
  });

  it('all zeros passes checksum (mathematically valid)', () => {
    // 00000000000 has valid checksum (0), so it passes validation
    // The decode step catches it as invalid date
    expect(validatePesel('00000000000')).toBe(true);
  });

  it('accepts valid 1900s PESEL', () => {
    expect(validatePesel('44051401359')).toBe(true);
  });

  it('accepts valid 2000s PESEL', () => {
    expect(validatePesel('03271501467')).toBe(true);
  });
});

describe('PESEL decoding edge cases', () => {

  it('returns valid=false for invalid PESEL', () => {
    const result = decodePesel('12345678901');
    expect(result.valid).toBe(false);
  });

  it('correctly identifies male (odd 10th digit)', () => {
    const result = decodePesel('44051401359');
    expect(result.plec).toBe('M');
  });

  it('correctly identifies female (even 10th digit)', () => {
    const result = decodePesel('03271501467');
    expect(result.plec).toBe('K');
  });

  it('decodes 2000s birth year correctly (month + 20)', () => {
    const result = decodePesel('03271501467');
    expect(result.dataUrodzenia).toBe('2003-07-15');
  });

  it('age is a positive number for valid PESEL', () => {
    const result = decodePesel('44051401359');
    expect(result.wiek).toBeGreaterThan(0);
  });

  it('does not crash on all-zeros', () => {
    expect(() => decodePesel('00000000000')).not.toThrow();
  });

  it('does not crash on random garbage', () => {
    expect(() => decodePesel('abcdefghijk')).not.toThrow();
    expect(() => decodePesel('')).not.toThrow();
    expect(() => decodePesel('!@#$%^&*()')).not.toThrow();
  });
});
