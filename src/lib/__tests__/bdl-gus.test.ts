import { describe, it, expect } from 'vitest';
import { mapUnitData } from '@/lib/sources/bdl-gus';

const RAW = {
  results: [
    {
      id: '60559',
      values: [{ year: '2024', val: 38500000 }],
    },
    {
      id: '60270',
      values: [{ year: '2024', val: 5.2 }],
    },
  ],
};

describe('mapUnitData', () => {
  it('extracts variable values into named fields', () => {
    const out = mapUnitData(RAW);
    expect(out.populationTotal).toBe(38500000);
    expect(out.unemploymentRate).toBe(5.2);
  });

  it('returns nulls when missing', () => {
    const out = mapUnitData({ results: [] });
    expect(out.populationTotal).toBeNull();
    expect(out.unemploymentRate).toBeNull();
  });
});
