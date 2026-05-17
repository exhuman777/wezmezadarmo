import { buildDatasetsXml, fillXfaForm, loadZusPdf } from '../xfa-injector';

export interface Z15aWizardData {
  imie: string; nazwisko: string; pesel: string;
  ulica: string; nrDomu: string; nrLokalu: string; kodPocztowy: string; miejscowosc: string; telefon: string;
  nipPlatnika: string; regonPlatnika: string; nazwaPlatnika: string;
  nrKonta: string;
  dataOd: string; dataDo: string; numerEzla: string;
  peselDziecka: string; imieDziecka: string; nazwiskoDziecka: string; dataUrodzDziecka: string;
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

const U = (s: string) => s.toUpperCase();
const b = (v: boolean) => (v ? '1' : '0');

function splitImieNazwisko(full: string): [string, string] {
  const parts = (full || '').trim().split(' ');
  return [parts[0] || '', parts.slice(1).join(' ') || ''];
}

export function buildZ15aPdf(data: Z15aWizardData): Buffer {
  const [imieR2, nazwiskoR2] = splitImieNazwisko(data.imieNazwiskoRodzic2);
  const [imieMalz, nazwiskoMalz] = data.malzonekJestRodzic2
    ? [imieR2, nazwiskoR2]
    : splitImieNazwisko(data.imieNazwiskoMalzonka);

  const xml = buildDatasetsXml([
    // == Wnioskodawca ==
    { name: 'PESEL', value: data.pesel },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imię', value: U(data.imie) },
    { name: 'Nazwisko', value: U(data.nazwisko) },
    { name: 'Ulica', value: U(data.ulica) },
    { name: 'Kodpocztowy', value: data.kodPocztowy },
    { name: 'Numerlokalu', value: data.nrLokalu },
    { name: 'Numerdomu', value: data.nrDomu },
    { name: 'Nazwapaństwa', value: '' },
    { name: 'Numertelefonu', value: data.telefon },
    { name: 'Miejscowość', value: U(data.miejscowosc) },
    // e-ZLA numer
    { name: 'Tekst1a', value: data.numerEzla },
    // == Dane dziecka ==
    { name: 'PESEL', value: data.peselDziecka },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imię', value: U(data.imieDziecka) },
    { name: 'Nazwisko', value: U(data.nazwiskoDziecka) },
    { name: 'Dataurodzenia', value: data.dataUrodzDziecka },
    // Orzeczenie o niepelnosprawnosci dziecka
    { name: 'OrzeczenieTAK', value: b(data.dzieckoNiepelnosprawne === 'tak') },
    { name: 'OrzeczenieNIE', value: b(data.dzieckoNiepelnosprawne === 'nie') },
    // == Oswiadczenie 1: czlonek rodziny moze sprawowac opieke ==
    { name: 'Oświadczenie1TAK', value: b(data.jestDomownik === 'tak') },
    { name: 'Oświadczenie1NIE', value: b(data.jestDomownik === 'nie') },
    { name: 'Tekst1', value: data.domownikDni },
    // == Oswiadczenie 2: praca zmianowa ==
    { name: 'Oświadczenie2TAK', value: b(data.pracaZmianowa === 'tak') },
    { name: 'Oświadczenie2NIE', value: b(data.pracaZmianowa === 'nie') },
    // == Platnik ==
    { name: 'Numerrachunku', value: data.nrKonta },
    { name: 'NIP', value: data.nipPlatnika },
    { name: 'REGON', value: data.regonPlatnika },
    { name: 'PESEL2', value: '' },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Nazwapłatnika', value: U(data.nazwaPlatnika) },
    // == Oswiadczenie 3: wspolne gospodarstwo ==
    { name: 'Oświadczenie3TAK', value: b(data.wspolneGospodarstwo === 'tak') },
    { name: 'Oświadczenie3NIE', value: b(data.wspolneGospodarstwo === 'nie') },
    // == Oswiadczenie 4: zmiana platnika ==
    { name: 'Oświadczenie4TAK', value: b(data.zmianaPlatnika === 'tak') },
    { name: 'Oświadczenie4NIE', value: b(data.zmianaPlatnika === 'nie') },
    { name: 'Liczbadni3a', value: '' },
    { name: 'Liczbadni3b', value: '' },
    { name: 'Liczbadni3c', value: '' },
    { name: 'ZaznaczX4a', value: '0' },
    { name: 'ZaznaczX4b', value: '0' },
    { name: 'ZaznaczX4c', value: '0' },
    // Nie mam malzonka
    { name: 'Niemammalzonka', value: b(data.brakMalzonka) },
    // == Dane malzonka ==
    { name: 'PESEL', value: data.malzonekJestRodzic2 ? data.peselRodzic2 : data.peselMalzonka },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imię', value: U(imieMalz) },
    { name: 'Nazwisko', value: U(nazwiskoMalz) },
    { name: 'Dane1TAK', value: b(data.malzonekPracuje === 'tak') },
    { name: 'Dane1NIE', value: b(data.malzonekPracuje === 'nie') },
    { name: 'Dane1BTAK', value: b(data.malzonekZasilek === 'tak') },
    { name: 'Dane1BNIE', value: b(data.malzonekZasilek === 'nie') },
    { name: 'Tekst2', value: '' },
    { name: 'Dane2TAK', value: '0' },
    { name: 'Dane2NIE', value: '0' },
    { name: 'Liczbadni2a', value: '' },
    { name: 'Liczbadni2b', value: '' },
    { name: 'Liczbadni2c', value: '' },
    { name: 'ZaznaczX2a', value: '0' },
    { name: 'ZaznaczX2b', value: '0' },
    { name: 'ZaznaczX2c', value: '0' },
    // == Oswiadczenie 4 nie zmienialem ==
    { name: 'Oświadczenie4NIEZMIENILEM', value: b(data.zmianaPlatnika === 'nie-zmienialem') },
    // == Dane drugiego rodzica ==
    { name: 'PESEL2', value: data.peselRodzic2 },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Imię2', value: U(imieR2) },
    { name: 'Nazwisko2', value: U(nazwiskoR2) },
    { name: 'Danemałżonka1TAK', value: b(data.rodzic2Pracuje === 'tak') },
    { name: 'Danemałżonka1NIE', value: b(data.rodzic2Pracuje === 'nie') },
    { name: 'Danemałżonka1BTAK', value: b(data.rodzic2Zasilek === 'tak') },
    { name: 'Danemałżonka1BNIE', value: b(data.rodzic2Zasilek === 'nie') },
    { name: 'Tekstmałżonka2', value: '' },
    { name: 'Danemałżonka2TAK', value: '0' },
    { name: 'Danemałżonka2NIE', value: '0' },
    { name: 'Liczbadnimałżonka3a', value: '' },
    { name: 'Liczbadnimałżonka3b', value: '' },
    { name: 'Liczbadnimałżonka3c', value: data.rodzic2DniDzieci },
    { name: 'ZaznaczX2a', value: '0' },
    { name: 'ZaznaczX2b', value: '0' },
    { name: 'ZaznaczX2c', value: '0' },
    // Dodatkowe pola (opiekunowie, drugi rodzic)
    { name: 'PESEL1', value: '' },
    { name: 'Rodzajseriainumerdokumentu1', value: '' },
    { name: 'Imię1', value: '' },
    { name: 'Nazwisko1', value: '' },
    { name: 'Liczbadni1', value: '' },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Dataurodzenia2', value: '' },
    { name: 'PESEL2', value: '' },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Imię2', value: '' },
    { name: 'Nazwisko2', value: '' },
    { name: 'Liczbadni2a', value: '' },
    { name: 'Liczbadni2b', value: '' },
    { name: 'Stopieńpokrewieństwa2a', value: '' },
    { name: 'Stopieńpokrewieństwa2b', value: '' },
    { name: 'Liczbadni2c', value: '' },
    { name: 'ZaznaczX2a', value: '0' },
    { name: 'ZaznaczX2b', value: '0' },
    { name: 'ZaznaczX2c', value: '0' },
    { name: 'Tekst1', value: '' },
    { name: 'Data', value: data.dataOd + (data.dataDo ? ' - ' + data.dataDo : '') },
    { name: 'Dataurodzenia', value: '' },
  ]);

  const pdf = loadZusPdf('Z-15A.pdf');
  return fillXfaForm(pdf, xml);
}
