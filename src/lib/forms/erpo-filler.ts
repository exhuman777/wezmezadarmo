/**
 * ERPO - Wniosek o ponowne obliczenie swiadczenia emerytalno-rentowego
 * ERPO PDF has 0 AcroForm fields. Generates a clean text-based PDF
 * with the user's data formatted as an instruction sheet for PUE ZUS.
 */

import { buildTextPdf, type TextSection } from '../xfa-injector';

export interface ErpoWizardData {
  imieNazwisko: string;
  imieOjca: string;
  pesel: string;
  adres: string;
  telefon: string;
  email: string;
  plec: 'K' | 'M';
  rodzajEmerytury: string;
  dataUrodzenia: string;
  formaZatrudnienia: string;
  latPracy: string;
  latSkładkowych: string;
  nrKonta: string;
  pobieraRente: 'tak' | 'nie';
  numerDecyzjiRentowej: string;
}

function todayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export async function buildErpoPdf(data: ErpoWizardData): Promise<Buffer> {
  const sections: TextSection[] = [
    {
      heading: 'Dane wnioskodawcy',
      lines: [
        `Imie i nazwisko: ${(data.imieNazwisko || '').toUpperCase()}`,
        `PESEL: ${data.pesel || ''}`,
        data.dataUrodzenia ? `Data urodzenia: ${data.dataUrodzenia}` : '',
        data.plec ? `Plec: ${data.plec === 'K' ? 'Kobieta' : 'Mezczyzna'}` : '',
        data.imieOjca ? `Imie ojca: ${data.imieOjca.toUpperCase()}` : '',
        data.adres ? `Adres: ${data.adres.toUpperCase()}` : '',
        data.telefon ? `Telefon: ${data.telefon}` : '',
        data.email ? `E-mail: ${data.email}` : '',
      ],
    },
    {
      heading: 'Dane dotyczace swiadczenia',
      lines: [
        data.rodzajEmerytury ? `Rodzaj emerytury/renty: ${data.rodzajEmerytury}` : '',
        data.formaZatrudnienia ? `Forma zatrudnienia: ${data.formaZatrudnienia}` : '',
        data.latPracy ? `Lata pracy: ${data.latPracy}` : '',
        data.latSkładkowych ? `Lata skladkowe: ${data.latSkładkowych}` : '',
        data.pobieraRente ? `Pobiera rente: ${data.pobieraRente === 'tak' ? 'TAK' : 'NIE'}` : '',
        data.numerDecyzjiRentowej ? `Numer decyzji rentowej: ${data.numerDecyzjiRentowej}` : '',
      ],
    },
    {
      heading: 'Rachunek bankowy',
      lines: [
        data.nrKonta ? `Numer konta: ${data.nrKonta}` : '',
      ],
    },
    {
      heading: 'Informacje dodatkowe',
      lines: [
        `Data wygenerowania: ${todayFormatted()}`,
        '',
        'Wypelnij formularz ERPO na portalu PUE ZUS korzystajac z powyzszych danych.',
        'Formularz ERPO nie posiada pol AcroForm, dlatego dane zostaly przygotowane',
        'w formie instrukcji do recznego wypelnienia na platformie PUE ZUS.',
      ],
    },
  ];

  return buildTextPdf('ERPO - Dane do wniosku o ponowne obliczenie swiadczenia', sections);
}
