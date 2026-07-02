import { describe, it, expect } from 'vitest';
import { isSoftNotFound } from '../benefits-audit';

describe('isSoftNotFound (miekki 404)', () => {
  it('wykrywa przekierowanie glebokiego adresu na strone glowna', () => {
    expect(isSoftNotFound('https://www.gov.pl/', 'https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne')).toBe(true);
    expect(isSoftNotFound('https://www.zus.pl/', 'https://www.zus.pl/renta-szkoleniowa')).toBe(true);
  });

  it('nie flaguje gdy zostajemy na glebokiej stronie', () => {
    expect(isSoftNotFound(
      'https://www.gov.pl/web/rodzina/swiadczenie-wspierajace',
      'https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne',
    )).toBe(false);
  });

  it('nie flaguje przekierowania miedzy domenami (to REDIRECT, nie soft 404)', () => {
    expect(isSoftNotFound('https://www.gov.pl/', 'https://old.example.com/web/x')).toBe(false);
  });

  it('nie flaguje gdy zrodlo samo jest strona glowna', () => {
    expect(isSoftNotFound('https://www.gov.pl/', 'https://www.gov.pl/')).toBe(false);
  });

  it('odporny na bledne URL-e', () => {
    expect(isSoftNotFound('nie-url', 'tez-nie')).toBe(false);
  });
});
