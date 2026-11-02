import { describe, it, expect } from 'vitest';
import { matchBenefits } from '../matcher';
import { UserProfile } from '../types';

const SMUTNE = ['zasilek-pogrzebowy', 'renta-rodzinna', 'renta-wdowia'];

function profil(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    wiek: 35, plec: 'M', stanCywilny: 'wolny', liczbaDzieci: 0,
    wiekDzieci: [], dochodMiesiecznie: 5000, dochodNaOsobe: 5000,
    zatrudnienie: 'umowa_o_prace', niepelnosprawnosc: 'brak',
    wlasnosc: 'wynajem', wojewodztwo: 'mazowieckie',
    prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
    ciaza: false, student: false, emeryt: false,
    rolnik: false, bezrobotnyZarejestrowany: false,
    ...overrides,
  };
}

describe('kolejność wyników', () => {
  for (const [nazwa, p] of [
    ['pracownik', profil()],
    ['emerytka', profil({ wiek: 70, plec: 'K', emeryt: true, stanCywilny: 'wdowa' as UserProfile['stanCywilny'], dochodMiesiecznie: 2500, dochodNaOsobe: 2500 })],
    ['rodzina', profil({ liczbaDzieci: 2, wiekDzieci: [3, 9], stanCywilny: 'malzenstwo' as UserProfile['stanCywilny'], dochodNaOsobe: 1500 })],
  ] as const) {
    it(`${nazwa}: wyniki nie zaczynają się od świadczeń po śmierci bliskiej osoby`, () => {
      const ids = matchBenefits(p).map((r) => r.benefit.id);
      expect(ids.length).toBeGreaterThan(0);
      expect(SMUTNE).not.toContain(ids[0]);
      const pierwszy = ids.findIndex((id) => SMUTNE.includes(id));
      if (pierwszy >= 0) expect(ids.slice(pierwszy).every((id) => SMUTNE.includes(id))).toBe(true);
    });
  }
});
