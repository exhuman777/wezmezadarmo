/**
 * Z-15B - Wniosek o zasilek opiekunczy (opieka nad dorosłym członkiem rodziny)
 * AcroForm field-based filling via pdf-lib getForm().
 */

import { loadZusPdf, fillFormByName, type FormFieldEntry } from '../xfa-injector';

export interface Z15bWizardData {
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  telefon: string;
  nazwaPlatinika: string;
  nipPlatnika: string;
  regonPlatnika: string;
  nrKonta: string;
  dataOd: string;
  dataDo: string;
  numerEzla: string;
  imieChory: string;
  nazwiskoChory: string;
  peselChory: string;
  dataUrodzChory: string;
  relacjaDoMnie: string;
  jestDomownik: 'tak' | 'nie';
  domownikDni: string;
  wspolneGospodarstwo: 'tak' | 'nie';
  zmianaPlatnika: 'tak' | 'nie' | 'nie-zmienialem';
  brakMalzonka: boolean;
  imieNazwiskoMalzonka: string;
  peselMalzonka: string;
  malzonekPracuje: 'tak' | 'nie';
  malzonekZasilek: 'tak' | 'nie';
  malzonekDniDorosli: string;
}

function splitName(full: string): { imie: string; nazwisko: string } {
  const parts = (full || '').trim().split(/\s+/);
  if (parts.length <= 1) return { imie: parts[0] || '', nazwisko: '' };
  return { imie: parts.slice(0, -1).join(' '), nazwisko: parts[parts.length - 1] };
}

export async function buildZ15bPdf(data: Z15bWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('Z-15B.pdf');

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

    // ---- Page 2 - Osoba chora + Platnik ----
    { fieldName: 'topmostSubform[0].Page2[0].PESEL[0]', value: data.peselChory },
    { fieldName: 'topmostSubform[0].Page2[0].Imię[0]', value: data.imieChory },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwisko[0]', value: data.nazwiskoChory },
    { fieldName: 'topmostSubform[0].Page2[0].Dataurodzenia[0]', value: data.dataUrodzChory },
    { fieldName: 'topmostSubform[0].Page2[0].Stopieńpokrewieństwa[0]', value: data.relacjaDoMnie },
    { fieldName: 'topmostSubform[0].Page2[0].Numerrachunku[0]', value: data.nrKonta },
    { fieldName: 'topmostSubform[0].Page2[0].NIP[0]', value: data.nipPlatnika },
    { fieldName: 'topmostSubform[0].Page2[0].REGON[0]', value: data.regonPlatnika },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwapłatnika[0]', value: data.nazwaPlatinika },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst1a[0]', value: [data.dataOd, data.dataDo].filter(Boolean).join(' - ') },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst1[0]', value: data.numerEzla },

    // ---- Page 2 - Oswiadczenia ----
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie1TAK[0]', value: data.jestDomownik === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie1NIE[0]', value: data.jestDomownik === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie2TAK[0]', value: data.wspolneGospodarstwo === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie2NIE[0]', value: data.wspolneGospodarstwo === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie4TAK[0]', value: data.zmianaPlatnika === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie4NIE[0]', value: data.zmianaPlatnika === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Oświadczenie4NIEzmieniłem[0]', value: data.zmianaPlatnika === 'nie-zmienialem' ? 'tak' : '', type: 'check' },

    // ---- Page 3 - Malzonek ----
    { fieldName: 'topmostSubform[0].Page3[0].Niemammalzonka[0]', value: data.brakMalzonka ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].PESEL2[0]', value: data.peselMalzonka },
    { fieldName: 'topmostSubform[0].Page3[0].Imię2[0]', value: splitName(data.imieNazwiskoMalzonka).imie },
    { fieldName: 'topmostSubform[0].Page3[0].Nazwisko2[0]', value: splitName(data.imieNazwiskoMalzonka).nazwisko },
    { fieldName: 'topmostSubform[0].Page3[0].Danemałżonka1TAK[0]', value: data.malzonekPracuje === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Danemałżonka1NIE[0]', value: data.malzonekPracuje === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Danemałżonka2TAK[0]', value: data.malzonekZasilek === 'tak' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Danemałżonka2NIE[0]', value: data.malzonekZasilek === 'nie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Liczbadni3a[0]', value: data.domownikDni },
    { fieldName: 'topmostSubform[0].Page3[0].Liczbadnimałżonka3a[0]', value: data.malzonekDniDorosli },
  ];

  return fillFormByName(pdfBytes, entries);
}
