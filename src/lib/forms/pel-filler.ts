/**
 * PEL - Pelnomocnictwo do wykonywania czynnosci prawnych w relacjach z ZUS
 * AcroForm field-based filling via pdf-lib getForm().
 */

import { loadZusPdf, fillFormByName, type FormFieldEntry } from '../xfa-injector';

export interface PelWizardData {
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  telefon: string;
  ktoUdziela: 'wlasne' | 'firma' | 'podmiot';
  nipFirmy: string;
  imiePeln: string;
  nazwiskoPeln: string;
  peselPeln: string;
  ulicaPeln: string;
  nrDomuPeln: string;
  nrLokoluPeln: string;
  kodPocztowyPeln: string;
  miejscowoscPeln: string;
  telefonPeln: string;
  zakres: 'wszystkie' | 'pit' | 'konkretna' | 'ezus';
  konkretnaCzynnosc: string;
  rolEzusUbezpieczony: boolean;
  rolEzusSwiadzeniobiorca: boolean;
  rolEzusPlatnik: boolean;
  dataOd: string;
  dataDo: string;
}

export async function buildPelPdf(data: PelWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('PEL.pdf');

  const entries: FormFieldEntry[] = [
    // ---- Page 1 - Mocodawca ----
    { fieldName: 'topmostSubform[0].Page1[0].PESEL[0]', value: data.pesel },
    { fieldName: 'topmostSubform[0].Page1[0].Imie[0]', value: data.imie },
    { fieldName: 'topmostSubform[0].Page1[0].Nazwisko[0]', value: data.nazwisko },
    { fieldName: 'topmostSubform[0].Page1[0].Ulica[0]', value: data.ulica },
    { fieldName: 'topmostSubform[0].Page1[0].Numerdomu[0]', value: data.nrDomu },
    { fieldName: 'topmostSubform[0].Page1[0].Numerlokalu[0]', value: data.nrLokalu },
    { fieldName: 'topmostSubform[0].Page1[0].Kodpocztowy[0]', value: data.kodPocztowy },
    { fieldName: 'topmostSubform[0].Page1[0].Miejscowosc[0]', value: data.miejscowosc },
    { fieldName: 'topmostSubform[0].Page1[0].NazwaPanstwa[0]', value: 'POLSKA' },
    { fieldName: 'topmostSubform[0].Page1[0].Numertelefonu[0]', value: data.telefon },

    // Kto udziela: wlasne (ZaznaczX) / firma (ZaznaczX2)
    { fieldName: 'topmostSubform[0].Page1[0].ZaznaczX[0]', value: data.ktoUdziela === 'wlasne' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page1[0].ZaznaczX2[0]', value: (data.ktoUdziela === 'firma' || data.ktoUdziela === 'podmiot') ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page1[0].NIP[0]', value: data.nipFirmy },

    // ---- Page 2 - Pelnomocnik ----
    { fieldName: 'topmostSubform[0].Page2[0].PESEL[0]', value: data.peselPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Imie[0]', value: data.imiePeln },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwisko[0]', value: data.nazwiskoPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Ulica[0]', value: data.ulicaPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Numerdomu[0]', value: data.nrDomuPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Numerlokalu[0]', value: data.nrLokoluPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Kodpocztowy[0]', value: data.kodPocztowyPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Miejscowosc[0]', value: data.miejscowoscPeln },
    { fieldName: 'topmostSubform[0].Page2[0].Nazwapanstwa[0]', value: 'POLSKA' },
    { fieldName: 'topmostSubform[0].Page2[0].Numertelefonu[0]', value: data.telefonPeln },

    // Zakres pelnomocnictwa
    { fieldName: 'topmostSubform[0].Page2[0].ZaznaczXzzerowaniem1[0]', value: data.zakres === 'wszystkie' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].ZaznaczXzzerowaniem2[0]', value: data.zakres === 'pit' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].ZaznaczXzzerowaniem3[0]', value: data.zakres === 'konkretna' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page2[0].Tekst2[0]', value: data.konkretnaCzynnosc },

    // ---- Page 3 - e-ZUS + daty ----
    { fieldName: 'topmostSubform[0].Page3[0].ZaznaczXzzerowaniem4[0]', value: data.zakres === 'ezus' ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Ubezpieczony[0]', value: data.rolEzusUbezpieczony ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Swiadczeniobiorca[0]', value: data.rolEzusSwiadzeniobiorca ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].Platnik[0]', value: data.rolEzusPlatnik ? 'tak' : '', type: 'check' },
    { fieldName: 'topmostSubform[0].Page3[0].DataOd[0]', value: data.dataOd },
    { fieldName: 'topmostSubform[0].Page3[0].DataDo[0]', value: data.dataDo },
  ];

  return fillFormByName(pdfBytes, entries);
}
