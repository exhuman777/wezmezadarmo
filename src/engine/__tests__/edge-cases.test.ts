import { describe, it, expect } from 'vitest';
import { matchBenefits } from '../matcher';
import { UserProfile } from '../types';

const base: UserProfile = {
  wiek: 35, plec: 'M', stanCywilny: 'wolny', liczbaDzieci: 0,
  wiekDzieci: [], dochodMiesiecznie: 5000, dochodNaOsobe: 5000,
  zatrudnienie: 'umowa_o_prace', niepelnosprawnosc: 'brak',
  wlasnosc: 'wynajem', wojewodztwo: 'mazowieckie',
  prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
};

describe('edge cases from spec', () => {
  it('edge 1: ulga na start -- pierwszaDzialalnosc required', () => {
    const withBiz = { ...base, prowadzDzialalnosc: true, pierwszaDzialalnosc: false };
    const results = matchBenefits(withBiz);
    const ulga = results.find(r => r.benefit.id === 'ulga-na-start');
    expect(ulga).toBeUndefined();
  });

  it('edge 2: becikowe -- income just above threshold', () => {
    const above = { ...base, liczbaDzieci: 1, wiekDzieci: [0], dochodNaOsobe: 1923 };
    const results = matchBenefits(above);
    const becikowe = results.find(r => r.benefit.id === 'becikowe');
    expect(becikowe).toBeUndefined();
  });

  it('edge 2: becikowe -- income just below threshold', () => {
    const below = { ...base, liczbaDzieci: 1, wiekDzieci: [0], dochodNaOsobe: 1922 };
    const results = matchBenefits(below);
    const becikowe = results.find(r => r.benefit.id === 'becikowe');
    expect(becikowe).toBeDefined();
    expect(becikowe!.status).toBe('PRZYSLUGUJE');
  });

  it('edge 5: ulga termomodernizacyjna -- only for dom_jednorodzinny', () => {
    const flat = { ...base, wlasnosc: 'mieszkanie' };
    const results = matchBenefits(flat);
    const termo = results.find(r => r.benefit.id === 'ulga-termomodernizacyjna');
    expect(termo).toBeUndefined();
  });

  it('edge 5: ulga termomodernizacyjna -- matches for dom_jednorodzinny', () => {
    const house = { ...base, wlasnosc: 'dom_jednorodzinny' };
    const results = matchBenefits(house);
    const termo = results.find(r => r.benefit.id === 'ulga-termomodernizacyjna');
    expect(termo).toBeDefined();
  });

  it('edge 9: kosiniakowe -- matches unemployed pregnant woman', () => {
    const mama = { ...base, plec: 'K' as const, zatrudnienie: 'bezrobotny', ciaza: true };
    const results = matchBenefits(mama);
    const kos = results.find(r => r.benefit.id === 'kosiniakowe');
    expect(kos).toBeDefined();
  });

  it('edge 9: kosiniakowe -- does not match employed woman', () => {
    const employed = { ...base, plec: 'K' as const, zatrudnienie: 'umowa_o_prace', ciaza: true };
    const results = matchBenefits(employed);
    const kos = results.find(r => r.benefit.id === 'kosiniakowe');
    expect(kos).toBeUndefined();
  });

  it('universal benefits match everyone', () => {
    const results = matchBenefits(base);
    const opp = results.find(r => r.benefit.id === 'opp-1-5-procent');
    expect(opp).toBeDefined();
  });

  it('disability benefits require disability status', () => {
    const results = matchBenefits(base);
    const sw = results.find(r => r.benefit.id === 'swiadczenie-wspierajace');
    expect(sw).toBeUndefined();
  });

  it('disability benefits match with correct status', () => {
    const disabled = { ...base, niepelnosprawnosc: 'znaczny' };
    const results = matchBenefits(disabled);
    const sw = results.find(r => r.benefit.id === 'swiadczenie-wspierajace');
    expect(sw).toBeDefined();
  });
});
