import type { BenefitCategory } from './types';

/** Nazwy kategorii świadczeń i ich kolejność: strona /swiadczenia oraz pliki dla modeli (/swiadczenia.md, /llms-full.txt). */
export const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  ZDROWIE: 'Zdrowie',
  RODZINA: 'Rodzina',
  PODATKI: 'Podatki i ulgi',
  BIZNES: 'Biznes',
  MIESZKANIE: 'Mieszkanie',
  NIEPELNOSPRAWNOSC: 'Niepełnosprawność',
  ENERGIA: 'Energia',
  ZUS: 'ZUS',
  PRACA: 'Praca',
  EDUKACJA: 'Edukacja',
  SENIOR: 'Seniorzy',
  POMOC_SPOLECZNA: 'Pomoc społeczna',
  EKOLOGIA: 'Ekologia',
};

export const CATEGORY_ORDER: BenefitCategory[] = [
  'RODZINA', 'ZDROWIE', 'PRACA', 'ZUS', 'PODATKI', 'SENIOR',
  'POMOC_SPOLECZNA', 'EDUKACJA', 'BIZNES', 'MIESZKANIE',
  'NIEPELNOSPRAWNOSC', 'EKOLOGIA', 'ENERGIA',
];
