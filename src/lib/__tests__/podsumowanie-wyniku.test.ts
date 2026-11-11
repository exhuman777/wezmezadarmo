import { describe, it, expect } from 'vitest';
import { BENEFITS } from '@/engine/benefits';
import type { MatchResult } from '@/engine/types';
import { podsumujWynik, tekstUdostepnienia, swiadczenOdmiana, mozeOdmiana, LINK_UDOSTEPNIJ, zlote } from '../podsumowanieWyniku';

const wynik = (id: string, status: MatchResult['status'] = 'PRZYSLUGUJE'): MatchResult => {
  const benefit = BENEFITS.find((b) => b.id === id);
  if (!benefit) throw new Error(`brak ${id}`);
  return { benefit, status, confidence: 'WYSOKA', matchedCriteria: [], failedCriteria: [], warnings: [] };
};

describe('podsumowanie wyniku', () => {
  it('sumuje tylko stałe kwoty z bazy, osobno miesięcznie i jednorazowo', () => {
    const p = podsumujWynik([wynik('800-plus'), wynik('becikowe'), wynik('ulga-prorodzinna', 'MOZLIWE')]);
    expect(p.liczba).toBe(3);
    expect(p.pewne).toBe(2);
    expect(p.miesiecznie).toBe(800);
    expect(p.jednorazowo).toBe(1000);
    expect(p.zKwota).toBe(2); // ulga prorodzinna ma widełki i jest tylko możliwa, nie wchodzi do sumy
  });

  it('sumuje tylko pewne świadczenia (PRZYSLUGUJE)', () => {
    const p = podsumujWynik([wynik('800-plus', 'MOZLIWE'), wynik('becikowe')]);
    expect(p.miesiecznie).toBe(0);
    expect(p.jednorazowo).toBe(1000);
  });

  it('pomija kwoty „do”, oszczędności, wartość usług, świadczenia zawieszone i po śmierci bliskiej osoby', () => {
    const p = podsumujWynik(['dofinansowanie-wynagrodzenia-50-plus', 'ulga-na-start', 'szczepienia-hpv', 'dodatek-energetyczny', 'mammografia', 'zasilek-pogrzebowy', 'renta-rodzinna'].map((id) => wynik(id)));
    expect(p.miesiecznie + p.jednorazowo).toBe(0);
    expect(p.zKwota).toBe(0);
  });

  it('każda kwota w sumie jest dokładnie kwotą z bazy (nic nie dopisujemy)', () => {
    const wszystkie = BENEFITS.map((b) => wynik(b.id));
    const p = podsumujWynik(wszystkie);
    const zrodlo = BENEFITS.filter((b) => b.kwotaMin !== undefined && b.kwotaMin === b.kwotaMax && b.kwotaMin > 0).reduce((s, b) => s + (b.kwotaMin ?? 0), 0);
    expect(p.miesiecznie + p.jednorazowo).toBeLessThanOrEqual(Math.round(zrodlo));
  });

  it('tekst do udostępnienia ma tylko liczbę i link bez danych osoby', () => {
    expect(tekstUdostepnienia(12)).toContain('może mi przysługiwać 12 świadczeń');
    expect(tekstUdostepnienia(3)).toContain('mogą mi przysługiwać 3 świadczenia');
    expect(tekstUdostepnienia(0)).not.toMatch(/\d/);
    expect(LINK_UDOSTEPNIJ).toBe('https://www.wezmezadarmo.com/?ref=wynik');
  });

  it('odmiana i format kwot po polsku', () => {
    expect([1, 2, 5, 12, 22, 25].map(swiadczenOdmiana)).toEqual(['świadczenie', 'świadczenia', 'świadczeń', 'świadczeń', 'świadczenia', 'świadczeń']);
    expect(mozeOdmiana(4)).toBe('mogą');
    expect(mozeOdmiana(1)).toBe('może');
    expect(zlote(800)).toBe('800 zł');
    expect(zlote(12800)).toBe('12 800 zł');
  });
});
