import { buildDatasetsXml, fillXfaForm, loadZusPdf } from '../xfa-injector';

export interface Z15bWizardData {
  imie: string; nazwisko: string; pesel: string;
  ulica: string; nrDomu: string; nrLokalu: string; kodPocztowy: string; miejscowosc: string; telefon: string;
  nazwaPlatinika: string; nipPlatnika: string; regonPlatnika: string;
  nrKonta: string;
  dataOd: string; dataDo: string; numerEzla: string;
  imieChory: string; nazwiskoChory: string; peselChory: string; dataUrodzChory: string;
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

const U = (s: string) => s.toUpperCase();
const b = (v: boolean) => (v ? '1' : '0');

// Relacja -> Polish full string for the form
const RELACJA_LABEL: Record<string, string> = {
  malzonek: 'MAŁŻONEK',
  rodzic: 'RODZIC',
  tesciowie: 'TEŚCIOWIE',
  rodzenstwo: 'RODZEŃSTWO',
  dziecko: 'DZIECKO',
  dziadek: 'DZIADKOWIE',
  wnuk: 'WNUK/WNUCZKA',
  inne: 'INNA OSOBA',
};

export function buildZ15bPdf(data: Z15bWizardData): Buffer {
  const [imie2, ...reszta] = (data.imieNazwiskoMalzonka || '').split(' ');
  const nazwisko2 = reszta.join(' ');

  const xml = buildDatasetsXml([
    // -- Wnioskodawca --
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
    // -- Dane osoby chorej (podopieczny) --
    { name: 'PESEL', value: data.peselChory },
    { name: 'Rodzajseriainumerdokumentu', value: '' },
    { name: 'Imię', value: U(data.imieChory) },
    { name: 'Nazwisko', value: U(data.nazwiskoChory) },
    { name: 'Dataurodzenia', value: data.dataUrodzChory },
    // -- Oswiadczenia --
    { name: 'Oświadczenie1TAK', value: b(data.jestDomownik === 'tak') },
    { name: 'Oświadczenie1NIE', value: b(data.jestDomownik === 'nie') },
    { name: 'Tekst1', value: data.domownikDni },
    { name: 'Oświadczenie2TAK', value: b(data.wspolneGospodarstwo === 'tak') },
    { name: 'Oświadczenie2NIE', value: b(data.wspolneGospodarstwo === 'nie') },
    // -- Platnik --
    { name: 'Numerrachunku', value: data.nrKonta },
    { name: 'NIP', value: data.nipPlatnika },
    { name: 'REGON', value: data.regonPlatnika },
    { name: 'PESEL2', value: '' },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Nazwapłatnika', value: U(data.nazwaPlatinika) },
    // Stopien pokrewienstwa
    { name: 'Stopieńpokrewieństwa', value: RELACJA_LABEL[data.relacjaDoMnie] ?? U(data.relacjaDoMnie) },
    // -- Zmiana platnika --
    { name: 'Oświadczenie4NIE', value: b(data.zmianaPlatnika === 'nie') },
    { name: 'Oświadczenie4TAK', value: b(data.zmianaPlatnika === 'tak') },
    { name: 'Oświadczenie4NIEzmieniłem', value: b(data.zmianaPlatnika === 'nie-zmienialem') },
    { name: 'Liczbadni3a', value: '' },
    { name: 'Liczbadni3b', value: '' },
    { name: 'Liczbadni3c', value: '' },
    { name: 'ZaznaczX4a', value: '0' },
    { name: 'ZaznaczX4b', value: '0' },
    { name: 'ZaznaczX4c', value: '0' },
    // -- Malzonek --
    { name: 'Niemammalzonka', value: b(data.brakMalzonka) },
    { name: 'PESEL2', value: data.peselMalzonka },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Imię2', value: U(imie2 || '') },
    { name: 'Nazwisko2', value: U(nazwisko2 || '') },
    { name: 'Danemałżonka1TAK', value: b(data.malzonekPracuje === 'tak') },
    { name: 'Danemałżonka1NIE', value: b(data.malzonekPracuje === 'nie') },
    { name: 'Danemałżonka2TAK', value: b(data.malzonekZasilek === 'tak') },
    { name: 'Danemałżonka2NIE', value: b(data.malzonekZasilek === 'nie') },
    { name: 'Liczbadnimałżonka3a', value: '' },
    { name: 'Liczbadnimałżonka3b', value: '' },
    { name: 'Liczbadnimałżonka3c', value: data.malzonekDniDorosli },
    { name: 'ZaznaczX2a', value: '0' },
    { name: 'ZaznaczX2b', value: '0' },
    { name: 'ZaznaczX2c', value: '0' },
    // Pozostale pola (okres)
    { name: 'Dataurodzenia', value: '' },
    { name: 'PESEL1', value: '' },
    { name: 'Rodzajseriainumerdokumentu1', value: '' },
    { name: 'Dataurodzenia2', value: '' },
    { name: 'PESEL2', value: '' },
    { name: 'Rodzajseriainumerdokumentu2', value: '' },
    { name: 'Imię2', value: '' },
    { name: 'Nazwisko2', value: '' },
    { name: 'Liczbadni2a', value: '' },
    { name: 'Liczbadni2b', value: '' },
    { name: 'Stopieńpokrewieństwa2a', value: '' },
    { name: 'Stopieńpokrewieństwa2b', value: '' },
    { name: 'ZaznaczX2a', value: '0' },
    { name: 'ZaznaczX2b', value: '0' },
    { name: 'Dataurodzenia', value: '' },
    { name: 'Danemałżonka1TAK', value: '0' },
    { name: 'Danemałżonka1NIE', value: '0' },
    { name: 'Danemałżonka1NIEDOTYCZY', value: '0' },
    { name: 'Tekst1', value: '' },
    { name: 'Data', value: data.dataOd + (data.dataDo ? ' - ' + data.dataDo : '') },
    { name: 'Imię1', value: '' },
    { name: 'Nazwisko1', value: '' },
    { name: 'Liczbadni1', value: '' },
  ]);

  const pdf = loadZusPdf('Z-15B.pdf');
  return fillXfaForm(pdf, xml);
}
