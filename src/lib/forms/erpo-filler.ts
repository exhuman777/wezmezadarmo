/**
 * ERPO -- Wniosek o ponowne obliczenie swiadczenia emerytalno-rentowego
 * Koordynaty wyznaczone przez pdftotext -bbox na ERPO.pdf (A4, 595.276 x 841.890 pt)
 *
 * Konwersja: pdf_lib_y = 841.890 - bbox_yMin
 * Kolumna lewa (imie, nazwisko, PESEL, ulica...): x=232
 * Kolumna prawa (nr lokalu, miejscowosc): x=392
 *
 * Strona 0 -- Dane wnioskodawcy:
 *   PESEL label yMin=328.001 -> y=513
 *   Imie label yMin=388.6   -> y=453
 *   Nazwisko label yMin=414.9 -> y=427
 *   Ulica (zamieszkania) yMin=476.8 -> y=365
 *   Numer domu yMin=503.2 -> y=339, Nr lokalu (prawy) x=392
 *   Kod pocztowy yMin=529.5 -> y=312, Miejscowosc (prawa) x=392
 *   Gmina/dzielnica yMin=555.9 -> y=286
 *   Ulica (korespondencja) yMin=655.9 -> y=186
 *   Numer domu (koresp) yMin=682.3 -> y=160
 *   Kod pocztowy (koresp) yMin=708.6 -> y=133
 *   Gmina/dzielnica (koresp) yMin=735.0 -> y=107
 *
 * Strona 1 -- Dane swiadczenia + Zakres wniosku:
 *   Pole na dane swiadczenia (miedzy naglowkiem a instrukcja): y~706, x=42
 *   Checkboxy zakresu: x=62, kolejne pozycje co ~26pt
 *   Pole "inny sposob" (Podaj...): yMin=725.2 -> y=117, x=42
 *   Pole "zagraniczne" (Podaj...): yMin=773.0 -> y=69, x=60
 *
 * Strona 2 -- Zalaczniki + Sposob odbioru + Podpis:
 *   Liczba zalacznikow: yMin=118 -> y=724, x=90
 *   Checkboxy odbioru (y=187.3): w placowce x=62, pocztą x=225, PUE x=404
 *   Data dd/mm/rrrr: yMin=327.7 -> y=514, x=91
 */

import { loadZusPdf, stampPdf, type FieldStamp } from '../xfa-injector';

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

const PH = 841.890;
const U = (s: string) => (s || '').toUpperCase();

function y(bboxYMin: number): number {
  return Math.round(PH - bboxYMin - 2);
}

function splitImieNazwisko(imieNazwisko: string): { imie: string; nazwisko: string } {
  const parts = (imieNazwisko || '').trim().split(/\s+/);
  if (parts.length <= 1) return { imie: parts[0] || '', nazwisko: '' };
  const nazwisko = parts[parts.length - 1];
  const imie = parts.slice(0, parts.length - 1).join(' ');
  return { imie, nazwisko };
}

function todayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const rrrr = d.getFullYear();
  return `${dd} / ${mm} / ${rrrr}`;
}

export async function buildErpoPdf(data: ErpoWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('ERPO.pdf');
  const { imie, nazwisko } = splitImieNazwisko(data.imieNazwisko);

  const stamps: FieldStamp[] = [
    // ---- Strona 0 -- Dane wnioskodawcy ----

    // PESEL (label yMin=328.001)
    { page: 0, x: 232, y: y(328.001), text: data.pesel },

    // Imie (label yMin=388.6)
    { page: 0, x: 232, y: y(388.6), text: U(imie) },

    // Nazwisko (label yMin=414.9)
    { page: 0, x: 232, y: y(414.9), text: U(nazwisko) },

    // Adres zamieszkania -- Ulica (label yMin=476.8)
    // Pelny adres w polu Ulica, uzytkownik uzupelnia pozostale pola recznie
    { page: 0, x: 232, y: y(476.8), text: U(data.adres) },

    // ---- Strona 1 -- Dane swiadczenia ----

    // Numer decyzji / swiadczenia (w polu nad instrukcja, yMin~130)
    ...(data.numerDecyzjiRentowej
      ? [{ page: 1, x: 42, y: y(130), text: data.numerDecyzjiRentowej } as FieldStamp]
      : []),

    // ---- Strona 2 -- Data ----

    // Data (dd / mm / rrrr) -- label "Data" yMin=313.9, format hint yMin=327.7
    { page: 2, x: 91, y: y(327.7), text: todayFormatted() },
  ];

  return stampPdf(pdfBytes, stamps);
}
