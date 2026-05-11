import { describe, it, expect } from 'vitest';
import { getAllBenefits } from '../benefits';

describe('benefits database integrity', () => {
  const allBenefits = getAllBenefits();

  it('has at least 50 benefits', () => {
    expect(allBenefits.length).toBeGreaterThanOrEqual(50);
  });

  it('every benefit has a unique id', () => {
    const ids = allBenefits.map(b => b.id);
    const unique = new Set(ids);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates, `Duplicate IDs: ${duplicates.join(', ')}`).toHaveLength(0);
    expect(ids.length).toBe(unique.size);
  });

  it('every benefit has required fields', () => {
    for (const b of allBenefits) {
      expect(b.id, `Missing id`).toBeTruthy();
      expect(b.nazwa, `${b.id}: missing nazwa`).toBeTruthy();
      expect(b.kategoria, `${b.id}: missing kategoria`).toBeTruthy();
      expect(b.kwota, `${b.id}: missing kwota`).toBeTruthy();
      expect(b.czestotliwosc, `${b.id}: missing czestotliwosc`).toBeTruthy();
      expect(b.zrodloUrl, `${b.id}: missing zrodloUrl`).toBeTruthy();
      expect(b.zrodloNazwa, `${b.id}: missing zrodloNazwa`).toBeTruthy();
    }
  });

  it('every benefit has valid application guide', () => {
    for (const b of allBenefits) {
      const w = b.wniosek;
      expect(w.kanal.length, `${b.id}: empty kanal`).toBeGreaterThan(0);
      expect(w.dokumenty.length, `${b.id}: empty dokumenty`).toBeGreaterThan(0);
      expect(w.kroki.length, `${b.id}: empty kroki`).toBeGreaterThan(0);
      expect(w.terminRealizacji, `${b.id}: missing terminRealizacji`).toBeTruthy();
      expect(w.odwolanie, `${b.id}: missing odwolanie`).toBeTruthy();
    }
  });

  it('every zrodloUrl is a valid URL', () => {
    for (const b of allBenefits) {
      expect(b.zrodloUrl, `${b.id}: invalid URL "${b.zrodloUrl}"`).toMatch(/^https?:\/\//);
    }
  });

  it('no benefit text contains "--" double dashes', () => {
    for (const b of allBenefits) {
      const textsToCheck = [
        b.nazwa, b.kwota, b.czestotliwosc,
        ...b.wniosek.dokumenty, ...b.wniosek.kroki,
        ...b.wniosek.pulapki, b.wniosek.odwolanie,
        b.wniosek.terminRealizacji,
        ...(b.wniosek.formularz ? [b.wniosek.formularz] : []),
      ];
      for (const text of textsToCheck) {
        expect(text, `"${b.id}" has "--" in: "${text}"`).not.toContain(' -- ');
      }
    }
  });

  it('every benefit has valid category', () => {
    const validCategories = [
      'ZDROWIE', 'RODZINA', 'PODATKI', 'BIZNES', 'MIESZKANIE',
      'NIEPELNOSPRAWNOSC', 'ENERGIA', 'ZUS', 'PRACA', 'EDUKACJA',
      'SENIOR', 'POMOC_SPOLECZNA', 'EKOLOGIA',
    ];
    for (const b of allBenefits) {
      expect(validCategories, `${b.id}: invalid category "${b.kategoria}"`).toContain(b.kategoria);
    }
  });

  it('kwotaMin <= kwotaMax when both are defined', () => {
    for (const b of allBenefits) {
      if (b.kwotaMin !== undefined && b.kwotaMax !== undefined) {
        expect(b.kwotaMin, `${b.id}: kwotaMin > kwotaMax`).toBeLessThanOrEqual(b.kwotaMax);
      }
    }
  });

  it('dataWeryfikacji and dataWaznosci are valid date strings', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const b of allBenefits) {
      expect(b.dataWeryfikacji, `${b.id}: invalid dataWeryfikacji`).toMatch(dateRegex);
      expect(b.dataWaznosci, `${b.id}: invalid dataWaznosci`).toMatch(dateRegex);
    }
  });
});
