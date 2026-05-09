import { describe, it, expect } from 'vitest';
import { decodePesel, validatePesel } from '../pesel';

describe('validatePesel', () => {
  it('rejects non-11-digit strings', () => {
    expect(validatePesel('123')).toBe(false);
    expect(validatePesel('123456789012')).toBe(false);
    expect(validatePesel('abcdefghijk')).toBe(false);
  });

  it('rejects invalid checksum', () => {
    expect(validatePesel('44051401358')).toBe(false);
  });

  it('accepts valid PESEL', () => {
    expect(validatePesel('44051401359')).toBe(true);
  });
});

describe('decodePesel', () => {
  it('decodes 1900s male PESEL', () => {
    const result = decodePesel('44051401359');
    expect(result.valid).toBe(true);
    expect(result.plec).toBe('M');
    expect(result.dataUrodzenia).toBe('1944-05-14');
  });

  it('decodes 2000s female PESEL', () => {
    const result = decodePesel('03271501467');
    expect(result.valid).toBe(true);
    expect(result.plec).toBe('K');
    expect(result.dataUrodzenia).toBe('2003-07-15');
  });

  it('calculates age correctly', () => {
    const result = decodePesel('44051401359');
    expect(result.wiek).toBeGreaterThanOrEqual(81);
  });

  it('returns invalid for bad PESEL', () => {
    const result = decodePesel('00000000000');
    expect(result.valid).toBe(false);
  });
});
