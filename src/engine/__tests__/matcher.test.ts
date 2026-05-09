import { describe, it, expect } from 'vitest';
import { matchBenefits } from '../matcher';
import { UserProfile } from '../types';

const baseProfile: UserProfile = {
  wiek: 35, plec: 'M', stanCywilny: 'wolny', liczbaDzieci: 0,
  wiekDzieci: [], dochodMiesiecznie: 5000, dochodNaOsobe: 5000,
  zatrudnienie: 'umowa_o_prace', niepelnosprawnosc: 'brak',
  wlasnosc: 'wynajem', wojewodztwo: 'mazowieckie',
  prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
};

describe('matchBenefits', () => {
  it('matches Moje Zdrowie for adult', () => {
    const results = matchBenefits(baseProfile);
    const mojeZdrowie = results.find(r => r.benefit.id === 'moje-zdrowie');
    expect(mojeZdrowie).toBeDefined();
    expect(mojeZdrowie!.status).toBe('PRZYSLUGUJE');
  });

  it('does not match mammografia for men', () => {
    const results = matchBenefits(baseProfile);
    const mammo = results.find(r => r.benefit.id === 'mammografia');
    expect(mammo).toBeUndefined();
  });

  it('matches mammografia for woman 50', () => {
    const results = matchBenefits({ ...baseProfile, wiek: 50, plec: 'K' });
    const mammo = results.find(r => r.benefit.id === 'mammografia');
    expect(mammo).toBeDefined();
    expect(mammo!.status).toBe('PRZYSLUGUJE');
  });

  it('matches 800+ for parent with children', () => {
    const results = matchBenefits({ ...baseProfile, liczbaDzieci: 2, wiekDzieci: [5, 10] });
    const plus800 = results.find(r => r.benefit.id === '800-plus');
    expect(plus800).toBeDefined();
    expect(plus800!.status).toBe('PRZYSLUGUJE');
  });

  it('does not match 800+ without children', () => {
    const results = matchBenefits(baseProfile);
    const plus800 = results.find(r => r.benefit.id === '800-plus');
    expect(plus800).toBeUndefined();
  });

  it('matches Ulga na Start for new business owner', () => {
    const results = matchBenefits({
      ...baseProfile, prowadzDzialalnosc: true, pierwszaDzialalnosc: true,
    });
    const ulga = results.find(r => r.benefit.id === 'ulga-na-start');
    expect(ulga).toBeDefined();
    expect(ulga!.status).toBe('PRZYSLUGUJE');
  });

  it('matches ulga-dla-mlodych for person under 26', () => {
    const results = matchBenefits({ ...baseProfile, wiek: 24 });
    const ulga = results.find(r => r.benefit.id === 'ulga-dla-mlodych');
    expect(ulga).toBeDefined();
  });

  it('sorts results by kwotaMax descending', () => {
    const results = matchBenefits({
      ...baseProfile, liczbaDzieci: 1, wiekDzieci: [5],
      prowadzDzialalnosc: true, pierwszaDzialalnosc: true,
    });
    const withAmounts = results.filter(r => r.benefit.kwotaMax && r.benefit.kwotaMax > 0);
    for (let i = 1; i < withAmounts.length; i++) {
      expect((withAmounts[i - 1].benefit.kwotaMax ?? 0)).toBeGreaterThanOrEqual(
        (withAmounts[i].benefit.kwotaMax ?? 0)
      );
    }
  });
});
