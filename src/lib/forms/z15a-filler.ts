/**
 * Z-15A - Wniosek o zasilek opiekunczy (opieka nad dzieckiem)
 * AcroForm field-based filling via pdf-lib getForm().
 */

import { loadZusPdf, fillFormByName, type FormFieldEntry } from '../xfa-injector';

export interface Z15aWizardData {
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  telefon: string;
  nipPlatnika: string;
  regonPlatnika: string;
  nazwaPlatnika: string;
  nrKonta: string;
  dataOd: string;
  dataDo: string;
  numerEzla: string;
  peselDziecka: string;
  imieDziecka: string;
  nazwiskoDziecka: string;
  dataUrodzDziecka: string;
  dzieckoNiepelnosprawne: 'tak' | 'nie';
  jestDomownik: 'tak' | 'nie';
  domownikDni: string;
  pracaZmianowa: 'tak' | 'nie';
  zmianaPlatnika: 'tak' | 'nie' | 'nie-zmienialem';
  wspolneGospodarstwo: 'tak' | 'nie';
  brakDrugiegoRodzica: boolean;
  peselRodzic2: string;
  imieNazwiskoRodzic2: string;
  rodzic2Pracuje: 'tak' | 'nie';
  rodzic2Zasilek: 'tak' | 'nie';
  rodzic2DniDzieci: string;
  rodzic2DniDorosli: string;
  brakMalzonka: boolean;
  malzonekJestRodzic2: boolean;
  peselMalzonka: string;
  imieNazwiskoMalzonka: string;
  malzonekPracuje: 'tak' | 'nie';
  malzonekZasilek: 'tak' | 'nie';
}

function splitName(full: string): { imie: string; nazwisko: string } {
  const parts = (full || '').trim().split(/\s+/);
  if (parts.length <= 1) return { imie: parts[0] || '', nazwisko: '' };
  return { imie: parts.slice(0, -1).join(' '), nazwisko: parts[parts.length - 1] };
}

export async function buildZ15aPdf(data: Z15aWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('Z-15A.pdf');

  const entries: FormFieldEntry[] = [
    // ---- Page 1 - Wnioskodawca ----
    { fieldName: 'topmostSubform[0].Page1[0].PESEL[0]', value: data.pesel },
    { fieldName: 'topmostSubform[0].Page1[0].Imię[0]', value: data.imie },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwisko[0]', value: data.nazwisko },
    { fieldName: 'topmostSubform[0].Page1[0].Ulica[0]', value: data.ulica },
    { fieldName: 'topmostSubform[0].Page1[0].Numerdomu[0]', value: data.nrDomu },
    { fieldName: 'topmostSubform[0].Page1[0].Numerlokalu[0]', value: data.nrLokalu },
    { fieldName: 'topmostSubform[0].Page1[0].Kodpocztowy[0]', value: data.kodPocztowy },
    { fieldName: 'topmostSubform[0].Page1[0].Miejscowość[0]', value: data.miejscowosc },
    { fieldName: 'topmostSubform[0].Page1[0].Numertelefonu[0]', value: data.telefon },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwapaństwa[0]', value: 'POLSKA' },

    // ---- Page 2 - Dziecko + Platnik ----
    { fieldName: 'topmostSubform[0].Page2[0].PESEL[0]', value: data.peselDziecka },
    { fieldName: 'topmostSubform[0].Page2[0].Imię[0]', value: data.imieDziecka },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwisko[0]', value: data.nazwiskoDziecka },
    { fieldName: 'topmostSubform[0].Page2[0].Dataurodzenia[0]', value: data.dataUrodzDziecka },
    { fieldName: 'topmostSubform[0].Page2[0].OrzeczenieTAK[0]', value: data.dzieckoNiepelnosprawne === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].OrzeczenieNIE[0]', value: data.dzieckoNiepelnosprawne === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Numerrachunku[0]', value: data.nrKonta },
    { fieldName: 'topmostSubform[0].Page2[0].NIP[0]', value: data.nipPlatnika },
    { fieldName: 'topmostSubform[0].Page2[0].REGON[0]', value: data.regonPlatnika },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwapłatnika[0]', value: data.nazwaPlatnika },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst1a[0]', value: [data.dataOd, data.dataDo].filter(Boolean).join(' - ') },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst1[0]', value: data.numerEzla },

    // ---- Page 3 - Oswiadczenia + malzonek ----
    { fieldName: 'topmostSubform[0].Page3[0].Oświadczenie3TAK[0]', value: data.jestDomownik === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Oświadczenie3NIE[0]', value: data.jestDomownik === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Liczbadni3a[0]', value: data.domownikDni },
    { fieldName: 'topmostSubform[0].Page3[0].Oświadczenie4TAK[0]', value: data.pracaZmianowa === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Oświadczenie4NIE[0]', value: data.pracaZmianowa === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Oświadczenie4NIEZMIENILEM[0]', value: data.zmianaPlatnika === 'nie-zmienialem' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Niemammalzonka[0]', value: data.brakMalzonka ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].PESEL[0]', value: data.peselMalzonka },
    { fieldName: 'topmostSubform[0].Page3[0].Imię[0]', value: splitName(data.imieNazwiskoMalzonka).imie },
    { fieldName: 'topmostSubform[0].Page3[0].Nazwisko[0]', value: splitName(data.imieNazwiskoMalzonka).nazwisko },
    { fieldName: 'topmostSubform[0].Page3[0].Dane1TAK[0]', value: data.malzonekPracuje === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Dane1NIE[0]', value: data.malzonekPracuje === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Dane1BTAK[0]', value: data.malzonekZasilek === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Dane1BNIE[0]', value: data.malzonekZasilek === 'nie' ? 'tak' : '', type: 'check' },

    // ---- Page 4 - Drugi rodzic ----
    { fieldName: 'topmostSubform[0].Page4[0].PESEL2[0]', value: data.peselRodzic2 },
    { fieldName: 'topmostSubform[0].Page4[0].Imię2[0]', value: splitName(data.imieNazwiskoRodzic2).imie },
    { fieldName: 'topmostSubform[0].Page4[0].Nazwisko2[0]', value: splitName(data.imieNazwiskoRodzic2).nazwisko },
    { fieldName: 'topmostSubform[0].Page4[0].ZaznaczX2a[0]', value: data.wspolneGospodarstwo === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].ZaznaczX2b[0]', value: data.wspolneGospodarstwo === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].Danemałżonka1TAK[0]', value: data.rodzic2Pracuje === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].Danemałżonka1NIE[0]', value: data.rodzic2Pracuje === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].Danemałżonka2TAK[0]', value: data.rodzic2Zasilek === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].Danemałżonka2NIE[0]', value: data.rodzic2Zasilek === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page4[0].Liczbadni1[0]', value: data.rodzic2DniDzieci },
  ];

  return fillFormByName(pdfBytes, entries);
}
