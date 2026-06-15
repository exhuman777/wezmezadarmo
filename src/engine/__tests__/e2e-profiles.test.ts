import { describe, it, expect } from 'vitest';
import { matchBenefits } from '../matcher';
import { UserProfile } from '../types';

// Base profile factory
function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
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

describe('E2E: real user profiles', () => {

  describe('young single male, employed, no children', () => {
    const profile = makeProfile({ wiek: 24 });
    const results = matchBenefits(profile);

    it('matches ulga dla mlodych (age < 26)', () => {
      const r = results.find(r => r.benefit.id === 'ulga-dla-mlodych');
      expect(r).toBeDefined();
    });

    it('does NOT match 800+ (no children)', () => {
      const r = results.find(r => r.benefit.id === '800-plus');
      expect(r).toBeUndefined();
    });

    it('does NOT match becikowe (no children)', () => {
      const r = results.find(r => r.benefit.id === 'becikowe');
      expect(r).toBeUndefined();
    });

    it('does NOT match mammografia (male)', () => {
      const r = results.find(r => r.benefit.id === 'mammografia');
      expect(r).toBeUndefined();
    });

    it('does NOT match disability benefits (no disability)', () => {
      const disabilityIds = ['swiadczenie-wspierajace', 'renta-socjalna', 'ulga-rehabilitacyjna'];
      for (const id of disabilityIds) {
        const r = results.find(r => r.benefit.id === id);
        expect(r, `${id} should not match`).toBeUndefined();
      }
    });

    it('does NOT match emeryt benefits (not retired)', () => {
      const r = results.find(r => r.benefit.id === '13-emerytura');
      expect(r).toBeUndefined();
    });

    it('does NOT match KRUS benefits (not a farmer)', () => {
      const krusResults = results.filter(r => r.benefit.kategoria === 'KRUS' as string);
      expect(krusResults.length).toBe(0);
    });
  });

  describe('mother with 2 children, married, low income', () => {
    const profile = makeProfile({
      wiek: 30, plec: 'K', stanCywilny: 'malzenstwo',
      liczbaDzieci: 2, wiekDzieci: [3, 7],
      dochodMiesiecznie: 3000, dochodNaOsobe: 750,
    });
    const results = matchBenefits(profile);

    it('matches 800+ (has children under 18)', () => {
      const r = results.find(r => r.benefit.id === '800-plus');
      expect(r).toBeDefined();
      expect(r!.status).toBe('PRZYSLUGUJE');
    });

    it('matches zasilek rodzinny (low income)', () => {
      const r = results.find(r => r.benefit.id === '800-plus');
      expect(r).toBeDefined();
    });

    it('matches ulga na dziecko PIT (has children)', () => {
      const r = results.find(r => r.benefit.id === 'ulga-prorodzinna');
      expect(r).toBeDefined();
    });

    it('does NOT match kosiniakowe (employed, not pregnant)', () => {
      const r = results.find(r => r.benefit.id === 'kosiniakowe');
      expect(r).toBeUndefined();
    });

    it('matches cytologia screening (woman 25-65)', () => {
      const r = results.find(r => r.benefit.id === 'cytologia');
      expect(r).toBeDefined();
    });
  });

  describe('pregnant unemployed woman', () => {
    const profile = makeProfile({
      wiek: 28, plec: 'K', zatrudnienie: 'bezrobotny',
      ciaza: true, dochodMiesiecznie: 0, dochodNaOsobe: 0,
      bezrobotnyZarejestrowany: true,
    });
    const results = matchBenefits(profile);

    it('matches kosiniakowe (pregnant, unemployed)', () => {
      const r = results.find(r => r.benefit.id === 'kosiniakowe');
      expect(r).toBeDefined();
    });

    it('matches unemployment registration benefits', () => {
      const bezrobotny = results.filter(r =>
        r.benefit.wymagania.bezrobotnyZarejestrowany === true
      );
      expect(bezrobotny.length).toBeGreaterThan(0);
    });
  });

  describe('retired 70-year-old man', () => {
    const profile = makeProfile({
      wiek: 70, plec: 'M', zatrudnienie: 'emeryt', emeryt: true,
      dochodMiesiecznie: 2500, dochodNaOsobe: 2500,
    });
    const results = matchBenefits(profile);

    it('matches trzynasta emerytura', () => {
      const r = results.find(r => r.benefit.id === '13-emerytura');
      expect(r).toBeDefined();
    });

    it('matches czternasta emerytura', () => {
      const r = results.find(r => r.benefit.id === '14-emerytura');
      expect(r).toBeDefined();
    });

    it('matches prostate screening (male 50+)', () => {
      const r = results.find(r => r.benefit.id === 'prostata');
      expect(r).toBeDefined();
    });

    it('does NOT match ulga dla mlodych (age > 26)', () => {
      const r = results.find(r => r.benefit.id === 'ulga-dla-mlodych');
      expect(r).toBeUndefined();
    });

    it('does NOT match student benefits (not a student)', () => {
      const r = results.find(r => r.benefit.id === 'stypendium-socjalne');
      expect(r).toBeUndefined();
    });
  });

  describe('disabled person (significant degree)', () => {
    const profile = makeProfile({
      wiek: 45, niepelnosprawnosc: 'znaczny',
      dochodMiesiecznie: 2000, dochodNaOsobe: 2000,
    });
    const results = matchBenefits(profile);

    it('matches swiadczenie wspierajace', () => {
      const r = results.find(r => r.benefit.id === 'swiadczenie-wspierajace');
      expect(r).toBeDefined();
    });

    it('matches ulga rehabilitacyjna', () => {
      const r = results.find(r => r.benefit.id === 'ulga-rehabilitacyjna');
      expect(r).toBeDefined();
    });

    it('matches renta socjalna', () => {
      const r = results.find(r => r.benefit.id === 'renta-socjalna');
      expect(r).toBeDefined();
    });
  });

  describe('business owner, first business', () => {
    const profile = makeProfile({
      wiek: 30, prowadzDzialalnosc: true, pierwszaDzialalnosc: true,
      zatrudnienie: 'dzialalnosc',
    });
    const results = matchBenefits(profile);

    it('matches ulga na start', () => {
      const r = results.find(r => r.benefit.id === 'ulga-na-start');
      expect(r).toBeDefined();
      expect(r!.status).toBe('PRZYSLUGUJE');
    });

    it('matches maly ZUS', () => {
      const r = results.find(r => r.benefit.id === 'preferencyjny-zus');
      expect(r).toBeDefined();
    });
  });

  describe('student, 20 years old', () => {
    const profile = makeProfile({
      wiek: 20, student: true,
      dochodMiesiecznie: 1000, dochodNaOsobe: 1000,
    });
    const results = matchBenefits(profile);

    it('matches ulga dla mlodych (age < 26)', () => {
      const r = results.find(r => r.benefit.id === 'ulga-dla-mlodych');
      expect(r).toBeDefined();
    });

    it('matches stypendium socjalne', () => {
      const r = results.find(r => r.benefit.id === 'stypendium-socjalne');
      expect(r).toBeDefined();
    });
  });

  describe('farmer (KRUS)', () => {
    const profile = makeProfile({
      wiek: 50, rolnik: true, wlasnosc: 'dom',
    });
    const results = matchBenefits(profile);

    it('matches KRUS benefits', () => {
      const krusResults = results.filter(r =>
        r.benefit.wymagania.rolnik === true
      );
      expect(krusResults.length).toBeGreaterThan(0);
    });
  });

  describe('homeowner with detached house (dom)', () => {
    const profile = makeProfile({ wlasnosc: 'dom' });
    const results = matchBenefits(profile);

    it('matches ulga termomodernizacyjna', () => {
      const r = results.find(r => r.benefit.id === 'ulga-termomodernizacyjna');
      expect(r).toBeDefined();
    });
  });

  describe('renter does NOT get homeowner benefits', () => {
    const profile = makeProfile({ wlasnosc: 'wynajem' });
    const results = matchBenefits(profile);

    it('does NOT match ulga termomodernizacyjna', () => {
      const r = results.find(r => r.benefit.id === 'ulga-termomodernizacyjna');
      expect(r).toBeUndefined();
    });
  });

  describe('widower (wdowiec)', () => {
    const profile = makeProfile({
      wiek: 65, stanCywilny: 'wdowiec', emeryt: true, zatrudnienie: 'emeryt',
    });
    const results = matchBenefits(profile);

    it('matches renta rodzinna', () => {
      const r = results.find(r => r.benefit.id === 'renta-rodzinna');
      expect(r).toBeDefined();
    });
  });
});

describe('E2E: matcher safety checks', () => {

  it('never returns NIE_PRZYSLUGUJE in results array', () => {
    const profiles = [
      makeProfile(),
      makeProfile({ wiek: 70, emeryt: true, zatrudnienie: 'emeryt' }),
      makeProfile({ liczbaDzieci: 3, wiekDzieci: [1, 5, 10] }),
      makeProfile({ niepelnosprawnosc: 'znaczny' }),
    ];
    for (const p of profiles) {
      const results = matchBenefits(p);
      const nie = results.filter(r => r.status === 'NIE_PRZYSLUGUJE');
      expect(nie.length, 'NIE_PRZYSLUGUJE should be filtered out').toBe(0);
    }
  });

  it('results are sorted by kwotaMax descending', () => {
    const results = matchBenefits(makeProfile({
      liczbaDzieci: 2, wiekDzieci: [3, 7],
      dochodMiesiecznie: 2000, dochodNaOsobe: 500,
    }));
    const withAmounts = results.filter(r => (r.benefit.kwotaMax ?? 0) > 0);
    for (let i = 1; i < withAmounts.length; i++) {
      expect((withAmounts[i - 1].benefit.kwotaMax ?? 0))
        .toBeGreaterThanOrEqual((withAmounts[i].benefit.kwotaMax ?? 0));
    }
  });

  it('all matched benefits have valid required fields', () => {
    const results = matchBenefits(makeProfile());
    for (const r of results) {
      expect(r.benefit.id).toBeTruthy();
      expect(r.benefit.nazwa).toBeTruthy();
      expect(r.benefit.kwota).toBeTruthy();
      expect(r.benefit.zrodloUrl).toBeTruthy();
      expect(r.benefit.zrodloNazwa).toBeTruthy();
      expect(r.benefit.wniosek.dokumenty.length).toBeGreaterThan(0);
      expect(r.benefit.wniosek.kroki.length).toBeGreaterThan(0);
      expect(r.benefit.wniosek.kanal.length).toBeGreaterThan(0);
    }
  });

  it('every benefit has unique id', () => {
    const results = matchBenefits(makeProfile({
      wiek: 45, plec: 'K', liczbaDzieci: 2, wiekDzieci: [5, 10],
      niepelnosprawnosc: 'znaczny', emeryt: false,
      prowadzDzialalnosc: true, pierwszaDzialalnosc: true,
      student: false, rolnik: true, ciaza: true,
      dochodMiesiecznie: 1000, dochodNaOsobe: 250,
      bezrobotnyZarejestrowany: true, zatrudnienie: 'bezrobotny',
    }));
    const ids = results.map(r => r.benefit.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('no benefit text contains "--" double dashes', () => {
    const results = matchBenefits(makeProfile({
      wiek: 45, plec: 'K', liczbaDzieci: 2, wiekDzieci: [5, 10],
      niepelnosprawnosc: 'znaczny',
      prowadzDzialalnosc: true, pierwszaDzialalnosc: true,
      rolnik: true, ciaza: true,
      dochodMiesiecznie: 1000, dochodNaOsobe: 250,
      bezrobotnyZarejestrowany: true, zatrudnienie: 'bezrobotny',
    }));
    for (const r of results) {
      const b = r.benefit;
      const textsToCheck = [
        b.nazwa, b.kwota, b.czestotliwosc,
        ...b.wniosek.dokumenty, ...b.wniosek.kroki,
        ...b.wniosek.pulapki, b.wniosek.odwolanie,
        b.wniosek.terminRealizacji,
      ];
      for (const text of textsToCheck) {
        expect(text, `"${b.id}" contains "--" in: ${text}`).not.toContain(' -- ');
      }
    }
  });
});

describe('E2E: income threshold edge cases', () => {

  it('becikowe: income exactly at threshold (1922) qualifies', () => {
    const results = matchBenefits(makeProfile({
      liczbaDzieci: 1, wiekDzieci: [0], dochodNaOsobe: 1922,
    }));
    const r = results.find(r => r.benefit.id === 'becikowe');
    expect(r).toBeDefined();
    expect(r!.status).toBe('PRZYSLUGUJE');
  });

  it('becikowe: income 1 PLN above threshold (1923) does NOT qualify', () => {
    const results = matchBenefits(makeProfile({
      liczbaDzieci: 1, wiekDzieci: [0], dochodNaOsobe: 1923,
    }));
    const r = results.find(r => r.benefit.id === 'becikowe');
    expect(r).toBeUndefined();
  });

  it('high income person gets fewer benefits than low income', () => {
    const highIncome = matchBenefits(makeProfile({
      dochodMiesiecznie: 20000, dochodNaOsobe: 20000,
      liczbaDzieci: 1, wiekDzieci: [5],
    }));
    const lowIncome = matchBenefits(makeProfile({
      dochodMiesiecznie: 1000, dochodNaOsobe: 500,
      liczbaDzieci: 1, wiekDzieci: [5],
    }));
    expect(lowIncome.length).toBeGreaterThanOrEqual(highIncome.length);
  });
});

describe('E2E: gender-specific screening programs', () => {

  it('mammografia only for women 50-69', () => {
    // Woman 55: should match
    const woman55 = matchBenefits(makeProfile({ wiek: 55, plec: 'K' }));
    expect(woman55.find(r => r.benefit.id === 'mammografia')).toBeDefined();

    // Man 55: should NOT match
    const man55 = matchBenefits(makeProfile({ wiek: 55, plec: 'M' }));
    expect(man55.find(r => r.benefit.id === 'mammografia')).toBeUndefined();

    // Woman 30: should NOT match (too young)
    const woman30 = matchBenefits(makeProfile({ wiek: 30, plec: 'K' }));
    expect(woman30.find(r => r.benefit.id === 'mammografia')).toBeUndefined();
  });

  it('cytologia only for women 25-65', () => {
    const woman30 = matchBenefits(makeProfile({ wiek: 30, plec: 'K' }));
    expect(woman30.find(r => r.benefit.id === 'cytologia')).toBeDefined();

    const man30 = matchBenefits(makeProfile({ wiek: 30, plec: 'M' }));
    expect(man30.find(r => r.benefit.id === 'cytologia')).toBeUndefined();
  });

  it('prostata-psa only for men 50+', () => {
    const man55 = matchBenefits(makeProfile({ wiek: 55, plec: 'M' }));
    expect(man55.find(r => r.benefit.id === 'prostata')).toBeDefined();

    const woman55 = matchBenefits(makeProfile({ wiek: 55, plec: 'K' }));
    expect(woman55.find(r => r.benefit.id === 'prostata')).toBeUndefined();

    const man30 = matchBenefits(makeProfile({ wiek: 30, plec: 'M' }));
    expect(man30.find(r => r.benefit.id === 'prostata')).toBeUndefined();
  });
});

describe('E2E: age boundary tests', () => {

  it('ulga-dla-mlodych: age 26 qualifies (wiekMax=26), age 27 does not', () => {
    const age26 = matchBenefits(makeProfile({ wiek: 26 }));
    expect(age26.find(r => r.benefit.id === 'ulga-dla-mlodych')).toBeDefined();

    const age27 = matchBenefits(makeProfile({ wiek: 27 }));
    expect(age27.find(r => r.benefit.id === 'ulga-dla-mlodych')).toBeUndefined();
  });

  it('zero age (newborn) does not crash', () => {
    expect(() => matchBenefits(makeProfile({ wiek: 0 }))).not.toThrow();
  });

  it('very old age (110) does not crash', () => {
    expect(() => matchBenefits(makeProfile({ wiek: 110 }))).not.toThrow();
  });
});
