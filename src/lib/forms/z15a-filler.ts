/**
 * Z-15A -- Wniosek o zasilek opiekunczy (rodzic, opieka nad dzieckiem)
 * Coordinates derived from pdftotext -bbox on Z-15A.pdf (A4, 595.28 x 841.89 pt)
 *
 * Page 0 -- Twoje dane (wnioskodawca)
 *   PESEL label yMin=423.2    -> text y=419
 *   Imie label yMin=533.5     -> text y=308
 *   Nazwisko label yMin=560.2 -> text y=282
 *   Ulica label yMin=587.0    -> text y=255
 *   Numer domu label yMin=613.8 left col -> text y=228
 *   Numer lokalu right col (label x=334-387) -> x=397 y=228
 *   Kod pocztowy label yMin=640.6 -> text y=201
 *   Miejscowosc right col yMin=667.4 x=175-226 -> x=397 y=174
 *   Numer telefonu label yMin=729.9 -> text y=112
 *
 * Page 1 -- Dane platnika skladek
 *   NIP label yMin=120.7   -> text y=721
 *   REGON label yMin=146.5 -> text y=695
 *   Nazwa platnika label yMin=250.9 -> text y=591
 *   Rachunek bankowy heading yMin=273.6 -> account input row ~y=557 (just below heading)
 *
 * Page 1 -- Period + eZLA
 *   "Okres, za ktory ubiegasz sie o zasilek opiekunczy" heading yMin=336.5
 *   "Podaj date lub daty (od-do)" instruction yMin=386.8
 *   "(jesli pamietasz)" eZLA instruction at yMin=395.8
 *   Input row for period dates ~y=410
 *   eZLA numer input ~y=421
 */

import { loadZusPdf, stampPdf, type FieldStamp } from '../xfa-injector';

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

const U = (s: string) => (s || '').toUpperCase();
const PH = 841.89;

function y(bboxYMin: number, offset = 0): number {
  return Math.round(PH - bboxYMin + offset);
}

export async function buildZ15aPdf(data: Z15aWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('Z-15A.pdf');

  const stamps: FieldStamp[] = [
    // ---- Page 0 -- Twoje dane ----
    // PESEL (label yMin=423.2)
    { page: 0, x: 232, y: y(423.2, -2), text: data.pesel },

    // Imie (label yMin=533.5)
    { page: 0, x: 232, y: y(533.5, -2), text: U(data.imie) },

    // Nazwisko (label yMin=560.2)
    { page: 0, x: 232, y: y(560.2, -2), text: U(data.nazwisko) },

    // Ulica (label yMin=587.0)
    { page: 0, x: 232, y: y(587.0, -2), text: U(data.ulica) },

    // Numer domu (label yMin=613.8)
    { page: 0, x: 232, y: y(613.8, -2), text: data.nrDomu },

    // Numer lokalu (right col)
    { page: 0, x: 397, y: y(613.8, -2), text: data.nrLokalu },

    // Kod pocztowy (label yMin=640.6)
    { page: 0, x: 232, y: y(640.6, -2), text: data.kodPocztowy },

    // Miejscowosc (right col, label yMin=667.4)
    { page: 0, x: 397, y: y(667.4, -2), text: U(data.miejscowosc) },

    // Numer telefonu (label yMin=729.9)
    { page: 0, x: 232, y: y(729.9, -2), text: data.telefon },

    // ---- Page 1 -- Dane platnika skladek ----
    // NIP (label yMin=120.7)
    { page: 1, x: 232, y: y(120.7, -2), text: data.nipPlatnika },

    // REGON (label yMin=146.5)
    { page: 1, x: 232, y: y(146.5, -2), text: data.regonPlatnika },

    // Nazwa platnika (label yMin=250.9)
    { page: 1, x: 232, y: y(250.9, -2), text: U(data.nazwaPlatnika) },

    // Rachunek bankowy (heading yMin=273.6 -- input row below)
    { page: 1, x: 42, y: y(288, 2), text: data.nrKonta },

    // ---- Page 1 -- Period + eZLA ----
    // Dates for the opieka period
    { page: 1, x: 42, y: y(410, 2), text: data.dataOd ? `od: ${data.dataOd}` : '' },
    { page: 1, x: 230, y: y(410, 2), text: data.dataDo ? `do: ${data.dataDo}` : '' },

    // eZLA numer
    { page: 1, x: 42, y: y(421, 2), text: data.numerEzla },
  ];

  return stampPdf(pdfBytes, stamps);
}
