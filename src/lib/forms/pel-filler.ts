/**
 * PEL -- Pelnomocnictwo ogolne do spraw ZUS
 * Coordinates derived from pdftotext -bbox on PEL.pdf (A4, 595.28 x 841.89 pt)
 *
 * Page 0 -- Dane osoby, ktora udziela pelnomocnictwa (mocodawca)
 *   PESEL label yMin=406.6    -> text y=435
 *   Imie label yMin=501.1     -> text y=341
 *   Nazwisko label yMin=527.0 -> text y=315
 *   Ulica label yMin=552.8    -> text y=289
 *   Numer domu label yMin=578.7 left col -> text y=263
 *   Numer lokalu right col (label x=334-387) -> x=397 y=263
 *   Kod pocztowy label yMin=604.5 -> text y=237
 *   Miejscowosc right col (no explicit label -- same row as Kod) -> x=397 y=237
 *   Numer telefonu label yMin=664.3 -> text y=178
 *
 *   Oswiadczenie: dziala w imieniu wlasnym (yMin=735.8) / firmy (yMin=761.6)
 *   wlasne checkbox x~62 y=735, firmy x~62 y=761
 *
 * Page 1 -- NIP firmy (if ktoUdziela='firma')
 *   NIP label yMin=116.0 -> text y=726
 *
 * Page 1 -- Dane pelnomocnika
 *   PESEL pelnomocnika label yMin=217.9 -> text y=624
 *   Imie pelnomocnika label yMin=316.1   -> text y=526
 *   Nazwisko label yMin=342.9            -> text y=499
 *   Ulica label yMin=369.3               -> text y=473
 *   Numer domu label yMin=396.1 left col -> text y=446
 *   Numer lokalu right col -> x=397 y=446
 *   Kod pocztowy label yMin=422.9        -> text y=419
 *   Miejscowosc right col -> x=397 y=419
 *   Numer telefonu label yMin=485.4      -> text y=357
 *
 * Page 1 -- Zakres pelnomocnictwa (checkboxes, yMin=536.4 section heading)
 *   "do zalwatwiania moich spraw w ZUS" -- wszystkie: x~62, y=561
 *   "do otrzymywania deklaracji PIT"     -- pit: x~62, y=640
 *   "do wykonania konkretnej czynnosci"  -- konkretna: x~62, y=713
 *   konkretna czynnosc text input: x~84, y=733 (below)
 */

import { loadZusPdf, stampPdf, type FieldStamp } from '../xfa-injector';

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

const U = (s: string) => (s || '').toUpperCase();
const PH = 841.89;

function y(bboxYMin: number, offset = 0): number {
  return Math.round(PH - bboxYMin + offset);
}

export async function buildPelPdf(data: PelWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('PEL.pdf');

  const stamps: FieldStamp[] = [
    // ---- Page 0 -- Mocodawca ----
    // PESEL (label yMin=406.6)
    { page: 0, x: 232, y: y(406.6, -2), text: data.pesel },

    // Imie (label yMin=501.1)
    { page: 0, x: 232, y: y(501.1, -2), text: U(data.imie) },

    // Nazwisko (label yMin=527.0)
    { page: 0, x: 232, y: y(527.0, -2), text: U(data.nazwisko) },

    // Ulica (label yMin=552.8)
    { page: 0, x: 232, y: y(552.8, -2), text: U(data.ulica) },

    // Numer domu (label yMin=578.7)
    { page: 0, x: 232, y: y(578.7, -2), text: data.nrDomu },

    // Numer lokalu (right col)
    { page: 0, x: 397, y: y(578.7, -2), text: data.nrLokalu },

    // Kod pocztowy (label yMin=604.5)
    { page: 0, x: 232, y: y(604.5, -2), text: data.kodPocztowy },

    // Miejscowosc (right col, estimated same row area)
    { page: 0, x: 397, y: y(604.5, -2), text: U(data.miejscowosc) },

    // Numer telefonu (label yMin=664.3)
    { page: 0, x: 232, y: y(664.3, -2), text: data.telefon },

    // Oswiadczenie checkbox: wlasne (yMin=735.8) / firmy (yMin=761.6)
    ...(data.ktoUdziela === 'wlasne'
      ? [{ page: 0, x: 57, y: y(735.8, -1), text: 'X', size: 10 } as FieldStamp]
      : []),
    ...(data.ktoUdziela === 'firma'
      ? [{ page: 0, x: 57, y: y(761.6, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // ---- Page 1 -- NIP firmy (if firma) ----
    ...(data.ktoUdziela === 'firma' && data.nipFirmy
      ? [{ page: 1, x: 232, y: y(116.0, -2), text: data.nipFirmy } as FieldStamp]
      : []),

    // ---- Page 1 -- Dane pelnomocnika ----
    // PESEL pelnomocnika (label yMin=217.9)
    { page: 1, x: 232, y: y(217.9, -2), text: data.peselPeln },

    // Imie pelnomocnika (label yMin=316.1)
    { page: 1, x: 232, y: y(316.1, -2), text: U(data.imiePeln) },

    // Nazwisko (label yMin=342.9)
    { page: 1, x: 232, y: y(342.9, -2), text: U(data.nazwiskoPeln) },

    // Ulica (label yMin=369.3)
    { page: 1, x: 232, y: y(369.3, -2), text: U(data.ulicaPeln) },

    // Numer domu (label yMin=396.1)
    { page: 1, x: 232, y: y(396.1, -2), text: data.nrDomuPeln },

    // Numer lokalu (right col)
    { page: 1, x: 397, y: y(396.1, -2), text: data.nrLokoluPeln },

    // Kod pocztowy (label yMin=422.9)
    { page: 1, x: 232, y: y(422.9, -2), text: data.kodPocztowyPeln },

    // Miejscowosc (right col, same row)
    { page: 1, x: 397, y: y(422.9, -2), text: U(data.miejscowoscPeln) },

    // Numer telefonu pelnomocnika (label yMin=485.4)
    { page: 1, x: 232, y: y(485.4, -2), text: data.telefonPeln },

    // ---- Page 1 -- Zakres pelnomocnictwa ----
    // "do zalatwienia moich spraw w ZUS" (wszystkie) -- row at yMin=560.6
    ...(data.zakres === 'wszystkie'
      ? [{ page: 1, x: 57, y: y(560.6, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // "do otrzymywania deklaracji PIT" (pit) -- row at yMin=640.0
    ...(data.zakres === 'pit'
      ? [{ page: 1, x: 57, y: y(640.0, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // "do wykonania konkretnej czynnosci" (konkretna) -- row at yMin=713.3
    ...(data.zakres === 'konkretna'
      ? [{ page: 1, x: 57, y: y(713.3, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // Konkretna czynnosc text input (below "konkretna" row, near yMin=772.5 instruction)
    ...(data.zakres === 'konkretna' && data.konkretnaCzynnosc
      ? [
          {
            page: 1,
            x: 84,
            y: y(733, 2),
            text: U(data.konkretnaCzynnosc),
          } as FieldStamp,
        ]
      : []),

    // Date range (dataOd/dataDo) -- placed at bottom of last page if provided
    // These appear on page 2 of PEL form, but we'll add to page 1 near bottom if useful
    ...(data.dataOd
      ? [
          {
            page: 1,
            x: 232,
            y: y(785, 2),
            text: `od: ${data.dataOd}`,
            size: 8,
          } as FieldStamp,
        ]
      : []),
    ...(data.dataDo
      ? [
          {
            page: 1,
            x: 350,
            y: y(785, 2),
            text: `do: ${data.dataDo}`,
            size: 8,
          } as FieldStamp,
        ]
      : []),
  ];

  return stampPdf(pdfBytes, stamps);
}
