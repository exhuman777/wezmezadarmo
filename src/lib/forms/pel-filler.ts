import { buildDatasetsXml, fillXfaForm, loadZusPdf } from '../xfa-injector';

export interface PelWizardData {
  imie: string; nazwisko: string; pesel: string;
  ulica: string; nrDomu: string; nrLokalu: string; kodPocztowy: string; miejscowosc: string; telefon: string;
  ktoUdziela: 'wlasne' | 'firma' | 'podmiot';
  nipFirmy: string;
  imiePeln: string; nazwiskoPeln: string; peselPeln: string;
  ulicaPeln: string; nrDomuPeln: string; nrLokoluPeln: string; kodPocztowyPeln: string; miejscowoscPeln: string; telefonPeln: string;
  zakres: 'wszystkie' | 'pit' | 'konkretna' | 'ezus';
  konkretnaCzynnosc: string;
  rolEzusUbezpieczony: boolean;
  rolEzusSwiadzeniobiorca: boolean;
  rolEzusPlatnik: boolean;
  dataOd: string;
  dataDo: string;
}

const U = (s: string) => s.toUpperCase();
const b = (v: boolean) => (v ? '1' : '0');

export function buildPelPdf(data: PelWizardData): Buffer {
  const xml = buildDatasetsXml([
    // == Mocodawca (osoba udzielajaca pelnomocnictwa) ==
    { name: 'PESEL', value: data.pesel },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imie', value: U(data.imie) },
    { name: 'Nazwisko', value: U(data.nazwisko) },
    { name: 'Ulica', value: U(data.ulica) },
    { name: 'Numerdomu', value: data.nrDomu },
    { name: 'Numerlokalu', value: data.nrLokalu },
    { name: 'Kodpocztowy', value: data.kodPocztowy },
    { name: 'Miejscowosc', value: U(data.miejscowosc) },
    { name: 'NazwaPanstwa', value: '' },
    { name: 'Numertelefonu', value: data.telefon },
    // Kto udziela: X1=wlasne, X2=firma, X3=podmiot (nie znamy dokladnych nazw)
    { name: 'ZaznaczX', value: b(data.ktoUdziela === 'wlasne') },
    { name: 'ZaznaczX2', value: b(data.ktoUdziela === 'firma') },
    { name: 'NIP', value: data.nipFirmy },
    { name: 'ZaznaczX3', value: b(data.ktoUdziela === 'podmiot') },
    { name: 'ZaznaczX4', value: '0' },
    { name: 'NIP2', value: '' },
    { name: 'Tekst', value: '' },
    // == Pelnomocnik ==
    { name: 'PESEL', value: data.peselPeln },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imie', value: U(data.imiePeln) },
    { name: 'Nazwisko', value: U(data.nazwiskoPeln) },
    { name: 'Ulica', value: U(data.ulicaPeln) },
    { name: 'Numerdomu', value: data.nrDomuPeln },
    { name: 'Numerlokalu', value: data.nrLokoluPeln },
    { name: 'Kodpocztowy', value: data.kodPocztowyPeln },
    { name: 'Miejscowosc', value: U(data.miejscowoscPeln) },
    { name: 'Nazwapanstwa', value: '' },
    { name: 'Numertelefonu', value: data.telefonPeln },
    // == Zakres pelnomocnictwa ==
    // 1=wszystkie, 2=pit, 3=konkretna, 4=ezus
    { name: 'ZaznaczXzzerowaniem1', value: b(data.zakres === 'wszystkie') },
    { name: 'ZaznaczXzzerowaniem2', value: b(data.zakres === 'pit') },
    { name: 'ZaznaczXzzerowaniem3', value: b(data.zakres === 'konkretna') },
    { name: 'Tekst2', value: data.konkretnaCzynnosc },
    { name: 'ZaznaczXzzerowaniem4', value: b(data.zakres === 'ezus') },
    // Role eZUS (Ubezpieczony, Swiadczeniobiorca, Platnik)
    { name: 'Ubezpieczony', value: b(data.rolEzusUbezpieczony) },
    { name: 'X1', value: b(data.rolEzusUbezpieczony) },
    { name: 'Swiadczeniobiorca', value: b(data.rolEzusSwiadzeniobiorca) },
    { name: 'X2', value: b(data.rolEzusSwiadzeniobiorca) },
    { name: 'Platnik', value: b(data.rolEzusPlatnik) },
    { name: 'X3', value: b(data.rolEzusPlatnik) },
    { name: 'X3B', value: '0' },
    { name: 'Komornik', value: '0' },
    { name: 'Platnik2', value: '0' },
    { name: 'X5', value: '0' },
    { name: 'X5B', value: '0' },
    { name: 'Tekst', value: '' },
    // == Daty pelnomocnictwa ==
    { name: 'DataOd', value: data.dataOd },
    { name: 'DataDo', value: data.dataDo },
    { name: 'Data4', value: '' },
  ]);

  const pdf = loadZusPdf('PEL.pdf');
  return fillXfaForm(pdf, xml);
}
