import { describe, it, expect } from 'vitest';
import { matchBenefits } from '../matcher';
import { UserProfile } from '../types';
import { getAllBenefits } from '../benefits';

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

// Złe ścieżki i niezmienniki - matcher musi pozostać stabilny dla danych
// skrajnych/niespójnych, nigdy nie rzucać i nigdy nie zwracać NIE_PRZYSLUGUJE.
describe('matcher robustness (bad paths + invariants)', () => {
  it('never throws on extreme inputs', () => {
    const extremes: Partial<UserProfile>[] = [
      { wiek: 0 },
      { wiek: 150 },
      { wiek: -5 },
      { dochodNaOsobe: 0 },
      { dochodNaOsobe: -1000 },
      { dochodNaOsobe: 9_999_999 },
      { liczbaDzieci: 20, wiekDzieci: [] },          // niespójność: liczba vs lista
      { liczbaDzieci: 0, wiekDzieci: [3, 5, 7] },     // niespójność odwrotna
      { wiek: Number.NaN, dochodNaOsobe: Number.NaN },
    ];
    for (const o of extremes) {
      expect(() => matchBenefits(makeProfile(o))).not.toThrow();
    }
  });

  it('never returns a NIE_PRZYSLUGUJE result', () => {
    const results = matchBenefits(makeProfile({ wiek: 70, plec: 'K', liczbaDzieci: 3, wiekDzieci: [2, 5, 16], dochodNaOsobe: 800 }));
    expect(results.every(r => r.status !== 'NIE_PRZYSLUGUJE')).toBe(true);
  });

  it('does not return duplicate benefit ids', () => {
    const results = matchBenefits(makeProfile({ wiek: 67, emeryt: true }));
    const idsArr = results.map(r => r.benefit.id);
    expect(new Set(idsArr).size).toBe(idsArr.length);
  });

  it('results are sorted by kwotaMax descending', () => {
    const results = matchBenefits(makeProfile({ liczbaDzieci: 4, wiekDzieci: [1, 3, 6, 9], dochodNaOsobe: 600 }));
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].benefit.kwotaMax ?? 0;
      const cur = results[i].benefit.kwotaMax ?? 0;
      expect(prev).toBeGreaterThanOrEqual(cur);
    }
  });

  it('high earner with no qualifying traits gets no income-gated benefit as PRZYSLUGUJE', () => {
    const rich = matchBenefits(makeProfile({ dochodNaOsobe: 1_000_000 }));
    const incomeGated = rich.filter(r =>
      r.status === 'PRZYSLUGUJE' &&
      r.benefit.wymagania.dochodMax !== undefined &&
      r.benefit.wymagania.dochodMax < 1_000_000,
    );
    expect(incomeGated).toHaveLength(0);
  });

  it('confidence WYSOKA only when there are zero warnings', () => {
    const results = matchBenefits(makeProfile({ wiek: 30, plec: 'K', liczbaDzieci: 2, wiekDzieci: [1, 4], dochodNaOsobe: 1500 }));
    for (const r of results) {
      if (r.confidence === 'WYSOKA') {
        expect(r.status).toBe('PRZYSLUGUJE');
        expect(r.warnings).toHaveLength(0);
      }
    }
  });

  it('every benefit has a unique id across the whole dataset', () => {
    const all = getAllBenefits();
    const idsArr = all.map(b => b.id);
    expect(new Set(idsArr).size).toBe(idsArr.length);
  });
});
