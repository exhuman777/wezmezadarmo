import { describe, it, expect } from 'vitest';
import { normalizePolish, searchBenefits } from '../search';
import { getAllBenefits } from '../benefits';

const ALL = getAllBenefits();
const ids = (q: string) => searchBenefits(ALL, q).map(b => b.id);

describe('normalizePolish', () => {
  it('strips Polish diacritics including ł', () => {
    expect(normalizePolish('Świadczenie pielęgnacyjne')).toBe('swiadczenie pielegnacyjne');
    expect(normalizePolish('ŁÓŻKO żłobek')).toBe('lozko zlobek');
    expect(normalizePolish('zaśćźńó')).toBe('zasczno');
  });
  it('lowercases and trims', () => {
    expect(normalizePolish('  RODZINA  ')).toBe('rodzina');
  });
});

describe('searchBenefits', () => {
  it('returns all benefits for empty query', () => {
    expect(searchBenefits(ALL, '').length).toBe(ALL.length);
    expect(searchBenefits(ALL, '   ').length).toBe(ALL.length);
  });

  it('matches without diacritics (user types ascii)', () => {
    expect(ids('swiadczenie wychowawcze')).toContain('800-plus');
    expect(ids('pielegnacyjne')).toContain('swiadczenie-pielegnacyjne');
  });

  it('matches well-known nicknames via aliases', () => {
    expect(ids('kuroniowka')).toContain('zasilek-dla-bezrobotnych');
    expect(ids('trzynastka')).toContain('13-emerytura');
    expect(ids('czternastka')).toContain('14-emerytura');
    expect(ids('800 plus')).toContain('800-plus');
    expect(ids('wyprawka')).toContain('dobry-start');
  });

  it('token AND-matching: all words must match somewhere', () => {
    const r = ids('leki seniorzy');
    expect(r).toContain('leki-senior-65plus');
  });

  it('searches the opis/description text', () => {
    // "empatia" appears in opis of 800+, not in nazwa
    expect(ids('empatia').length).toBeGreaterThan(0);
  });

  it('ranks exact-name matches above description-only matches', () => {
    const r = searchBenefits(ALL, 'becikowe');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].id).toBe('becikowe');
  });

  it('returns empty for nonsense query', () => {
    expect(searchBenefits(ALL, 'xyzqwkjhgf').length).toBe(0);
  });
});
