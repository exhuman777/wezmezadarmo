export type BenefitCategory =
  | 'ZDROWIE'
  | 'RODZINA'
  | 'PODATKI'
  | 'BIZNES'
  | 'MIESZKANIE'
  | 'NIEPELNOSPRAWNOSC'
  | 'ENERGIA'
  | 'ZUS'
  | 'PRACA'
  | 'EDUKACJA'
  | 'SENIOR'
  | 'POMOC_SPOLECZNA'
  | 'EKOLOGIA';

export type BenefitStatus = 'PRZYSLUGUJE' | 'MOZLIWE' | 'NIE_PRZYSLUGUJE';
export type Confidence = 'WYSOKA' | 'SREDNIA' | 'NISKA';
export type Gender = 'K' | 'M';
export type ApplicationChannel = 'PUE_ZUS' | 'ePUAP' | 'EMPATIA' | 'BANK' | 'MOPS' | 'URZAD_GMINY' | 'POZ' | 'URZAD_SKARBOWY' | 'PUP' | 'PFRON' | 'KRUS' | 'UCZELNIA' | 'WFOSIGW' | 'NFZ' | 'ONLINE' | 'ARiMR' | 'BGK';

export interface BenefitRequirements {
  wiekMin?: number;
  wiekMax?: number;
  plec?: Gender | 'dowolna';
  dochodMax?: number;
  dochodMaxGospodarstwo?: number;
  stanCywilny?: string[];
  dzieci?: { min?: number; wiekMax?: number };
  zatrudnienie?: string[];
  niepelnosprawnosc?: string[];
  wlasnosc?: string[];
  prowadzDzialalnosc?: boolean;
  pierwszaDzialalnosc?: boolean;
  miesiaceDzialalnosci?: { min?: number; max?: number };
  pkd?: string[];
  wojewodztwo?: string[];
  ciaza?: boolean;
  student?: boolean;
  emeryt?: boolean;
  rolnik?: boolean;
  bezrobotnyZarejestrowany?: boolean;
  statusWdowiec?: boolean;
  // Uprawnienie zależy od decyzji/statusu nadawanego przez uprawniony organ
  // (np. status kombatanta lub działacza opozycji), którego nie da się ustalić
  // z profilu. Gdy true, matcher nie oznacza świadczenia jako PRZYSLUGUJE,
  // tylko MOZLIWE - nawet jeśli wszystkie kryteria z profilu są spełnione.
  wymagaWeryfikacjiStatusu?: boolean;
}

export interface Exclusion {
  opis: string;
  sprawdz: string;
}

export interface ApplicationGuide {
  kanal: ApplicationChannel[];
  formularz?: string;
  dokumenty: string[];
  kroki: string[];
  terminRealizacji: string;
  pulapki: string[];
  odwolanie: string;
}

export interface Benefit {
  id: string;
  nazwa: string;
  opis?: string;
  kategoria: BenefitCategory;
  kwota: string;
  kwotaMin?: number;
  kwotaMax?: number;
  czestotliwosc: string;
  wymagania: BenefitRequirements;
  wykluczenia: Exclusion[];
  wniosek: ApplicationGuide;
  zrodloUrl: string;
  zrodloNazwa: string;
  dataWeryfikacji: string;
  dataWaznosci: string;
}

export interface UserProfile {
  wiek: number;
  plec: Gender;
  stanCywilny: string;
  liczbaDzieci: number;
  wiekDzieci: number[];
  dochodMiesiecznie: number;
  dochodNaOsobe: number;
  zatrudnienie: string;
  niepelnosprawnosc: string;
  wlasnosc: string;
  wojewodztwo: string;
  prowadzDzialalnosc: boolean;
  pierwszaDzialalnosc: boolean;
  dataDzialalnosci?: string;
  pkd?: string[];
  statusVat?: string;
  nazwaFirmy?: string;
  ciaza?: boolean;
  student?: boolean;
  emeryt?: boolean;
  rolnik?: boolean;
  bezrobotnyZarejestrowany?: boolean;
}

export interface MatchResult {
  benefit: Benefit;
  status: BenefitStatus;
  confidence: Confidence;
  matchedCriteria: string[];
  failedCriteria: string[];
  warnings: string[];
}

export interface PeselData {
  wiek: number;
  plec: Gender;
  dataUrodzenia: string;
  valid: boolean;
}
