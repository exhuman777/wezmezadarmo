import { describe, it, expect } from 'vitest';
import { filterByKeywords, EliAct } from '@/lib/sources/eli-sejm';

const SAMPLE: EliAct[] = [
  { eli: 'DU/2026/100', title: 'Ustawa o świadczeniu 800+', publisher: 'Sejm', type: 'Ustawa', announcedAt: '2026-05-20', eliUrl: 'https://eli.gov.pl/100' },
  { eli: 'DU/2026/101', title: 'Rozporządzenie o gospodarce odpadami', publisher: 'Min. Klimatu', type: 'Rozporządzenie', announcedAt: '2026-05-21', eliUrl: 'https://eli.gov.pl/101' },
  { eli: 'DU/2026/102', title: 'Ustawa o zasiłku pogrzebowym', publisher: 'Sejm', type: 'Ustawa', announcedAt: '2026-05-22', eliUrl: 'https://eli.gov.pl/102' },
];

describe('filterByKeywords', () => {
  it('returns only acts matching any keyword (case-insensitive)', () => {
    const out = filterByKeywords(SAMPLE, ['świadczenie', 'zasiłek']);
    expect(out).toHaveLength(2);
    expect(out.map(a => a.eli)).toEqual(['DU/2026/100', 'DU/2026/102']);
  });

  it('returns all when keywords array empty', () => {
    expect(filterByKeywords(SAMPLE, [])).toHaveLength(3);
  });

  it('matches diacritics-insensitively', () => {
    const out = filterByKeywords(SAMPLE, ['swiadczenie']);
    expect(out).toHaveLength(1);
  });
});
