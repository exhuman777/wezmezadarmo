import { buildDatasetsXml, fillXfaForm, loadZusPdf } from '../xfa-injector';

// Match the ZAS-53 wizard data interface exactly
export interface Zas53WizardData {
  imie: string; nazwisko: string; pesel: string;
  ulica: string; nrDomu: string; nrLokalu: string; kodPocztowy: string; miejscowosc: string; telefon: string;
  nazwaPlatinika: string; nipPlatnika: string; regonPlatnika: string;
  nrKonta: string;
  dataOd: string; dataDo: string; numerEzla: string;
  okresUbezpieczenia: 'w-trakcie' | 'po-ustaniu';
  dataUstaniaUbezpieczenia: string;
  rodzajNiezdolnosci: 'nie-dotyczy' | 'choroba-zawodowa' | 'wypadek-przy-pracy' | 'wypadek-w-drodze';
}

const U = (s: string) => s.toUpperCase();
const b = (v: boolean) => (v ? '1' : '0');

export function buildZas53Pdf(data: Zas53WizardData): Buffer {
  const xml = buildDatasetsXml([
    // -- Twoje dane (Wnioskodawca) --
    { name: 'PESEL', value: data.pesel },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imię', value: U(data.imie) },
    { name: 'Nazwisko', value: U(data.nazwisko) },
    { name: 'Ulica', value: U(data.ulica) },
    { name: 'Numerdomu', value: data.nrDomu },
    { name: 'Numerlokalu', value: data.nrLokalu },
    { name: 'Kodpocztowy', value: data.kodPocztowy },
    { name: 'Poczta', value: U(data.miejscowosc) },
    { name: 'Nazwapaństwa', value: '' },
    { name: 'Numertelefonu', value: data.telefon },
    // -- Dane platnika skladek --
    { name: 'NIP', value: data.nipPlatnika },
    { name: 'REGON', value: data.regonPlatnika },
    { name: 'PESEL_1', value: '' },
    { name: 'Rodzajseriainumerdokumentu_1', value: '' },
    { name: 'Nazwaplatnika', value: U(data.nazwaPlatinika) },
    // -- Rachunek bankowy --
    { name: 'Numerrachunku', value: data.nrKonta },
    // -- Wniosek o zasilek (seria/numer ZLA) --
    { name: 'Tekst', value: data.numerEzla },
    // -- Checkboxes: w trakcie / po ustaniu --
    { name: 'wniosek1A', value: b(data.okresUbezpieczenia === 'w-trakcie') },
    { name: 'wniosek1B', value: b(data.okresUbezpieczenia === 'po-ustaniu') },
    // -- Okres niezdolnosci do pracy --
    { name: 'Data', value: data.dataOd },
    // -- Rodzaj niezdolnosci --
    { name: 'choroby', value: b(data.rodzajNiezdolnosci === 'choroba-zawodowa') },
    { name: 'przypracy', value: b(data.rodzajNiezdolnosci === 'wypadek-przy-pracy') },
    { name: 'wdrodze', value: b(data.rodzajNiezdolnosci === 'wypadek-w-drodze') },
    { name: 'niedotyczy', value: b(data.rodzajNiezdolnosci === 'nie-dotyczy') },
    { name: 'Data2', value: data.dataDo },
  ]);

  const pdf = loadZusPdf('ZAS-53.pdf');
  return fillXfaForm(pdf, xml);
}
