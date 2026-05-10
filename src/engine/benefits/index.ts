import { Benefit } from '../types';
import { ZDROWIE } from './zdrowie';
import { RODZINA } from './rodzina';
import { PODATKI } from './podatki';
import { BIZNES } from './biznes';
import { MIESZKANIE } from './mieszkanie';
import { NIEPELNOSPRAWNOSC } from './niepelnosprawnosc';
import { ENERGIA } from './energia';
import { PRACA } from './praca';
import { ZUS } from './zus';
import { EKOLOGIA } from './ekologia';
import { SENIOR } from './senior';
import { KRUS } from './krus';
import { POMOC_SPOLECZNA } from './pomoc_spoleczna';
import { EDUKACJA } from './edukacja';
import { INNE } from './inne';

// Cross-listed benefits (referenced by ID, not duplicated)
import { PODATKI as PODATKI_REF } from './podatki';
const ulgaRehabilitacyjna = PODATKI_REF.find(b => b.id === 'ulga-rehabilitacyjna')!;
const ulgaTermomodernizacyjna = PODATKI_REF.find(b => b.id === 'ulga-termomodernizacyjna')!;

export const ALL_BENEFITS: Benefit[] = [
  ...ZDROWIE,
  ...RODZINA,
  ...PODATKI,
  ...BIZNES,
  ...MIESZKANIE,
  ...NIEPELNOSPRAWNOSC,
  ...ENERGIA,
  ...PRACA,
  ...ZUS,
  ...EKOLOGIA,
  ...SENIOR,
  ...KRUS,
  ...POMOC_SPOLECZNA,
  ...EDUKACJA,
  ...INNE,
];

// Deduplicate by ID (cross-listed benefits appear once)
const seen = new Set<string>();
export const BENEFITS: Benefit[] = ALL_BENEFITS.filter(b => {
  if (seen.has(b.id)) return false;
  seen.add(b.id);
  return true;
});

// Category lookup helper
export function getBenefitsByCategory(kategoria: string): Benefit[] {
  const benefits = BENEFITS.filter(b => b.kategoria === kategoria);
  // Add cross-listed benefits
  if (kategoria === 'NIEPELNOSPRAWNOSC' && ulgaRehabilitacyjna) {
    benefits.push(ulgaRehabilitacyjna);
  }
  if (kategoria === 'ENERGIA' && ulgaTermomodernizacyjna) {
    benefits.push(ulgaTermomodernizacyjna);
  }
  return benefits;
}

export function getBenefitById(id: string): Benefit | undefined {
  return BENEFITS.find(b => b.id === id);
}

export function getAllBenefits(): Benefit[] {
  return BENEFITS;
}

export { ZDROWIE, RODZINA, PODATKI, BIZNES, MIESZKANIE, NIEPELNOSPRAWNOSC, ENERGIA, PRACA, ZUS, EKOLOGIA, SENIOR, KRUS, POMOC_SPOLECZNA, EDUKACJA, INNE };
