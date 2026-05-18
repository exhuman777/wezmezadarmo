import { describe, it, expect } from 'vitest';
import { parseCeidgResponse, validateNip } from '../ceidg';

describe('parseCeidgResponse', () => {
  it('parsuje wojewodztwo z adresDzialalnosci', () => {
    const raw = {
      firma: [{
        nazwa: 'Jan Kowalski',
        status: 'AKTYWNY',
        pkd: [{ kod: '62.01.Z' }],
        dataRozpoczeciaDzialalnosci: '2020-01-15',
        dataZawieszeniaDzialalnosci: null,
        dataZakonczeniaDzialalnosci: null,
        adresDzialalnosci: { wojewodztwo: 'MAZOWIECKIE' },
      }],
    };
    const result = parseCeidgResponse(raw);
    expect(result.wojewodztwo).toBe('mazowieckie');
    expect(result.nazwa).toBe('Jan Kowalski');
    expect(result.pkd).toEqual(['62.01.Z']);
  });

  it('zwraca null gdy brak adresu', () => {
    const raw = { firma: [{ nazwa: 'Test', status: 'AKTYWNY', pkd: [] }] };
    const result = parseCeidgResponse(raw);
    expect(result.wojewodztwo).toBeNull();
  });

  it('zwraca pusty obiekt gdy brak firmy', () => {
    const result = parseCeidgResponse({});
    expect(result.aktywna).toBe(false);
    expect(result.wojewodztwo).toBeNull();
  });

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

describe('validateNip', () => {
  it('rejects non-10-digit strings', () => {
    expect(validateNip('123')).toBe(false);
    expect(validateNip('abcdefghij')).toBe(false);
  });

  it('rejects invalid checksum', () => {
    expect(validateNip('1234567890')).toBe(false);
  });

  it('waliduje poprawny NIP', () => {
    expect(validateNip('5260250274')).toBe(true);
  });

  it('odrzuca NIP z litera', () => {
    expect(validateNip('526025027X')).toBe(false);
  });
});
