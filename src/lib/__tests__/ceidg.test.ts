import { describe, it, expect } from 'vitest';
import { validateNip, parseCeidgResponse } from '../ceidg';

describe('validateNip', () => {
  it('rejects non-10-digit strings', () => {
    expect(validateNip('123')).toBe(false);
    expect(validateNip('abcdefghij')).toBe(false);
  });

  it('rejects invalid checksum', () => {
    expect(validateNip('1234567890')).toBe(false);
  });

  it('accepts valid NIP', () => {
    expect(validateNip('5261040828')).toBe(true);
  });
});

describe('parseCeidgResponse', () => {
  it('extracts business data from CEIDG response', () => {
    const mockResponse = {
      firma: [
        {
          nazwa: 'TEST FIRMA JAN KOWALSKI',
          dataRozpoczeciaDzialalnosci: '2024-01-15',
          dataZawieszeniaDzialalnosci: null,
          dataZakonczeniaDzialalnosci: null,
          pkd: [{ kod: '62.01.Z', opis: 'Dzialalnosc zwiazana z oprogramowaniem' }],
          status: 'AKTYWNY',
        },
      ],
    };
    const result = parseCeidgResponse(mockResponse);
    expect(result.aktywna).toBe(true);
    expect(result.nazwa).toBe('TEST FIRMA JAN KOWALSKI');
    expect(result.dataRejestracji).toBe('2024-01-15');
    expect(result.pkd).toEqual(['62.01.Z']);
  });

  it('returns not found for empty response', () => {
    const result = parseCeidgResponse({ firma: [] });
    expect(result.aktywna).toBe(false);
    expect(result.nazwa).toBeNull();
  });
});
