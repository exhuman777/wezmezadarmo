/**
 * ZAS-53 - Wniosek o zasilek chorobowy
 * AcroForm field-based filling via pdf-lib getForm().
 */

import { loadZusPdf, fillFormByName, type FormFieldEntry } from '../xfa-injector';

export interface Zas53WizardData {
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
  okresUbezpieczenia: 'w-trakcie' | 'po-ustaniu';
  dataUstaniaUbezpieczenia: string;
  rodzajNiezdolnosci:
    | 'nie-dotyczy'
    | 'choroba-zawodowa'
    | 'wypadek-przy-pracy'
    | 'wypadek-w-drodze';
}

export async function buildZas53Pdf(data: Zas53WizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('ZAS-53.pdf');

  const entries: FormFieldEntry[] = [
    // ---- Page 1 - Wnioskodawca + Platnik ----
    { fieldName: 'topmostSubform[0].Page1[0].PESEL[0]', value: data.pesel },
    { fieldName: 'topmostSubform[0].Page1[0].Imię[0]', value: data.imie },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwisko[0]', value: data.nazwisko },
    { fieldName: 'topmostSubform[0].Page1[0].Ulica[0]', value: data.ulica },
    { fieldName: 'topmostSubform[0].Page1[0].Numerdomu[0]', value: data.nrDomu },
    { fieldName: 'topmostSubform[0].Page1[0].Numerlokalu[0]', value: data.nrLokalu },
    { fieldName: 'topmostSubform[0].Page1[0].Kodpocztowy[0]', value: data.kodPocztowy },
    { fieldName: 'topmostSubform[0].Page1[0].Poczta[0]', value: data.miejscowosc },
    { fieldName: 'topmostSubform[0].Page1[0].Numertelefonu[0]', value: data.telefon },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwapaństwa[0]', value: 'POLSKA' },
    { fieldName: 'topmostSubform[0].Page1[0].NIP[0]', value: data.nipPlatnika },
    { fieldName: 'topmostSubform[0].Page1[0].REGON[0]', value: data.regonPlatnika },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwaplatnika[0]', value: data.nazwaPlatinika },

    // ---- Page 2 - Rachunek + Wniosek ----
    { fieldName: 'topmostSubform[0].Page2[0].Numerrachunku[0]', value: data.nrKonta },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst[0]', value: data.numerEzla },
    { fieldName: 'topmostSubform[0].Page2[0].Data[0]', value: [data.dataOd, data.dataDo].filter(Boolean).join(' - ') },

    // Okres ubezpieczenia
    { fieldName: 'topmostSubform[0].Page2[0].wniosek1A[0]', value: data.okresUbezpieczenia === 'w-trakcie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].wniosek1B[0]', value: data.okresUbezpieczenia === 'po-ustaniu' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Data2[0]', value: data.dataUstaniaUbezpieczenia },

    // Rodzaj niezdolnosci
    { fieldName: 'topmostSubform[0].Page2[0].choroby[0]', value: data.rodzajNiezdolnosci === 'choroba-zawodowa' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].przypracy[0]', value: data.rodzajNiezdolnosci === 'wypadek-przy-pracy' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].wdrodze[0]', value: data.rodzajNiezdolnosci === 'wypadek-w-drodze' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].niedotyczy[0]', value: data.rodzajNiezdolnosci === 'nie-dotyczy' ? 'tak' : '', type: 'check' },
  ];

  return fillFormByName(pdfBytes, entries);
}
