/**
 * ZAS-53 -- Wniosek o zasilek chorobowy
 * Coordinates derived from pdftotext -bbox on ZAS-53.pdf (A4, 595.28 x 841.89 pt)
 *
 * Conversion: pdf_lib_y = 841.89 - bbox_yMin
 * Text x: 232 for most fields (label xMax ~227, input starts ~232)
 * Right column (Numer lokalu, Miejscowosc) starts at x=397
 *
 * Page 0 -- Twoje dane (wnioskodawca)
 *   PESEL label yMin=306.8  -> plib_y=535.1  -> text y=535
 *   Imie label yMin=414.7   -> plib_y=427.1  -> text y=427
 *   Nazwisko label yMin=440.6 -> plib_y=401.3 -> text y=401
 *   Ulica label yMin=466.5  -> plib_y=375.4  -> text y=375
 *   Numer domu label yMin=492.3 -> plib_y=349.6 -> text y=349
 *   Numer lokalu label yMin=492.3 x=334-387  -> right col x=397
 *   Kod pocztowy label yMin=518.2 -> plib_y=323.7 -> text y=323
 *   Miejscowosc label yMin=518.2 x=336-387  -> right col x=397
 *   Numer telefonu label yMin=578.8 -> plib_y=263.1 -> text y=263
 *
 * Page 0 -- Dane platnika skladek
 *   NIP label yMin=637.6   -> plib_y=204.3  -> text y=204
 *   REGON label yMin=663.5 -> plib_y=178.4  -> text y=178
 *   PESEL platnika label yMin=698.3 -> plib_y=143.6 -> text y=143
 *   Nazwa platnika label yMin=767.9 -> plib_y=74.0  -> text y=74
 *     (but actually this wraps onto page so we need to check visible area)
 *
 * Page 1 -- Rachunek bankowy, Wniosek
 *   Rachunek bankowy label yMin=91.6  -> plib_y=750.3  -> account text y=750
 *   "Skladam wniosek" yMin=171.5  (period selector area starts here)
 *   w trakcie ubezpieczenia row yMin=313.2 -> plib_y=528.7 -> checkbox col ~62, text ~82
 *   po ustaniu row yMin=340.0 -> plib_y=501.9
 *   Data ustania yMin=354.4 (dd/mm/rrrr) right side x=356 -> text x=356
 *   Wniosek dotyczy niezdolnosci yMin=394.5
 *   choroby zawodowej row yMin=420.1 -> plib_y=421.8 -> checkbox x=62
 *   wypadku przy pracy row yMin=420.1 -> x=197
 *   wypadku w drodze row yMin=414.6 -> x=323
 *   nie dotyczy yMin=420.1 -> x=501
 *   eZLA numer -- The "data" field is around y=256 on page 1. The actual e-ZLA input
 *     follows "Podaj date lub daty" text block. Input is a single row below.
 *     From structure: ZLA numer row starts after the instruction text at ~y=254.
 *     The actual input row (numer ZLA): looking at the form, the e-ZLA field
 *     is at approximately the same y as the date instruction line.
 *     The "Data" (od) field is at p1 y~312 in the "wniosek dotyczy" section,
 *     The eZLA seria/numer appears to be on the instruction row itself at y=256.
 *     For the actual input field (seria i numer), place text at y~242 (just below instruction).
 *
 * Note: ZAS-53 page 0 "Nazwa platnika" label is at the very bottom (y=767.9, plib=74).
 *   The actual text input row is just below the label, so we place at y=74 or slightly above.
 *   However with font size 9, baseline would need to be at y~74 - 9 = 65. Let's use y=73.
 */

import { loadZusPdf, stampPdf, type FieldStamp } from '../xfa-injector';

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

const U = (s: string) => (s || '').toUpperCase();

// A4 height in pdf-lib pts
const PH = 841.89;

// Convert bbox yMin to pdf-lib y, with optional baseline offset
function y(bboxYMin: number, baselineOffset = 0): number {
  return Math.round(PH - bboxYMin + baselineOffset);
}

export async function buildZas53Pdf(data: Zas53WizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('ZAS-53.pdf');

  const stamps: FieldStamp[] = [
    // ---- Page 0 -- Twoje dane ----
    // PESEL wnioskodawcy (label yMin=306.8)
    { page: 0, x: 232, y: y(306.8, -2), text: data.pesel },

    // Imie (label yMin=414.7)
    { page: 0, x: 232, y: y(414.7, -2), text: U(data.imie) },

    // Nazwisko (label yMin=440.6)
    { page: 0, x: 232, y: y(440.6, -2), text: U(data.nazwisko) },

    // Ulica (label yMin=466.5)
    { page: 0, x: 232, y: y(466.5, -2), text: U(data.ulica) },

    // Numer domu (label yMin=492.3, left col)
    { page: 0, x: 232, y: y(492.3, -2), text: data.nrDomu },

    // Numer lokalu (label yMin=492.3, right col x=334-387)
    { page: 0, x: 397, y: y(492.3, -2), text: data.nrLokalu },

    // Kod pocztowy (label yMin=518.2, left col)
    { page: 0, x: 232, y: y(518.2, -2), text: data.kodPocztowy },

    // Miejscowosc (label yMin=518.2, right col x=336-387)
    { page: 0, x: 397, y: y(518.2, -2), text: U(data.miejscowosc) },

    // Numer telefonu (label yMin=578.8)
    { page: 0, x: 232, y: y(578.8, -2), text: data.telefon },

    // ---- Page 0 -- Dane platnika skladek ----
    // NIP (label yMin=637.6)
    { page: 0, x: 232, y: y(637.6, -2), text: data.nipPlatnika },

    // REGON (label yMin=663.5)
    { page: 0, x: 232, y: y(663.5, -2), text: data.regonPlatnika },

    // Nazwa albo imie i nazwisko platnika (label yMin=767.9)
    // Input row is at same y -- place text just below label baseline
    { page: 0, x: 232, y: y(767.9, -2), text: U(data.nazwaPlatinika) },

    // ---- Page 1 -- Rachunek bankowy ----
    // "Rachunek bankowy" heading yMin=91.6 -- actual input row is the box below
    // The input area starts around y=91+14=105, so text at plib ~736
    { page: 1, x: 42, y: y(105, 2), text: data.nrKonta },

    // ---- Page 1 -- e-ZLA seria i numer ----
    // Instruction at yMin=256.2. Input field is just below that line ~y=269
    { page: 1, x: 42, y: y(269, 2), text: data.numerEzla },

    // ---- Page 1 -- Okres ubezpieczenia checkboxes ----
    // "w okresie ubezpieczenia" row yMin=313.2 -- mark X if w-trakcie
    ...(data.okresUbezpieczenia === 'w-trakcie'
      ? [{ page: 1, x: 57, y: y(313.2, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // "po ustaniu tytulu ubezpieczenia" row yMin=340.0 -- mark X if po-ustaniu
    ...(data.okresUbezpieczenia === 'po-ustaniu'
      ? [{ page: 1, x: 57, y: y(340.0, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // Data ustania ubezpieczenia (dd/mm/rrrr format hint at yMin=354.4, x=248-459)
    // The date input for ustanie starts to right of "Podaj date ustania" at x=356
    ...(data.dataUstaniaUbezpieczenia
      ? [
          {
            page: 1,
            x: 356,
            y: y(354.4, -1),
            text: data.dataUstaniaUbezpieczenia,
          } as FieldStamp,
        ]
      : []),

    // ---- Page 1 -- Daty niezdolnosci do pracy ----
    // dataOd: input row at y~387 (just below "Podaj date" line at y=256,
    //   but the actual date input boxes are further down in the form structure.
    //   From the bbox: dd/mm/rrrr markers are at yMin=354.4 for ustanie date.
    //   For the main "od" date of the wniosek, there's no explicit dd/mm/rrrr marker
    //   shown in the excerpt. The wniosek period section starts at y=287.6.
    //   The date fields for "od" and "do" of the zaswiadczenie lekarskiego
    //   are in the block starting around y=256.2 (instruction). The actual
    //   input boxes should be around y=255+14=269. But we placed eZLA there.
    //   Looking more carefully: eZLA is "seria i numer zaswiadczenia lekarskiego"
    //   which is a text field at y=256.2. The date "od-do" of niezdolnosci is
    //   in the "Wniosek dotyczy okresu niezdolnosci" section starting y=287.6.
    //   The dd/mm/rrrr format hints at y=354.4 are for "data ustania" only.
    //   The "od" period date appears to be implied by the e-ZLA. ZUS extracts it.
    //   We'll stamp dataOd and dataDo as supplemental text in the wniosek section.
    {
      page: 1,
      x: 42,
      y: y(407, 2),
      text: data.dataOd ? `od: ${data.dataOd}` : '',
    },
    {
      page: 1,
      x: 230,
      y: y(407, 2),
      text: data.dataDo ? `do: ${data.dataDo}` : '',
    },

    // ---- Page 1 -- Rodzaj niezdolnosci checkboxes ----
    // "Wniosek dotyczy niezdolnosci" section at yMin=394.5
    // Row labels at yMin=420.1 (choroby zawodowej, wypadku przy pracy, nie dotyczy)
    // wypadku w drodze at yMin=414.6

    // choroby zawodowej checkbox -- x~62, y=420.1
    ...(data.rodzajNiezdolnosci === 'choroba-zawodowa'
      ? [{ page: 1, x: 57, y: y(420.1, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // wypadku przy pracy checkbox -- x~197, y=420.1
    ...(data.rodzajNiezdolnosci === 'wypadek-przy-pracy'
      ? [{ page: 1, x: 192, y: y(420.1, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // wypadku w drodze checkbox -- x~323, y=414.6
    ...(data.rodzajNiezdolnosci === 'wypadek-w-drodze'
      ? [{ page: 1, x: 318, y: y(414.6, -1), text: 'X', size: 10 } as FieldStamp]
      : []),

    // nie dotyczy checkbox -- x~501, y=420.1
    ...(data.rodzajNiezdolnosci === 'nie-dotyczy'
      ? [{ page: 1, x: 496, y: y(420.1, -1), text: 'X', size: 10 } as FieldStamp]
      : []),
  ];

  return stampPdf(pdfBytes, stamps);
}
