/**
 * Z-15B -- Wniosek o zasilek opiekunczy (czlonek rodziny inny niz dziecko)
 * Coordinates derived from pdftotext -bbox on Z-15B.pdf (A4, 595.28 x 841.89 pt)
 *
 * Page 0 -- Twoje dane (wnioskodawca)
 *   PESEL label yMin=382.1    -> text y=460
 *   Imie label yMin=488.1     -> text y=354
 *   Nazwisko label yMin=514.9 -> text y=327
 *   Ulica label yMin=541.7    -> text y=300
 *   Numer domu label yMin=568.5 left col -> text y=273
 *   Numer lokalu right col x=334-387 -> x=397 y=273
 *   Kod pocztowy label yMin=595.3 left col -> text y=247
 *   Miejscowosc right col yMin=622.0 x=175-226 -> x=397 y=220
 *   Numer telefonu label yMin=684.6 -> text y=157
 *
 * Page 1 -- Dane platnika skladek
 *   NIP label yMin=117.0   -> text y=725
 *   REGON label yMin=142.8 -> text y=699
 *   Nazwa (platnika) label yMin=247.2 -> text y=595
 *   Rachunek bankowy heading yMin=267.9 -> account input y~561 (below heading)
 *
 * Page 1 -- Dane osoby chorej (podopieczny)
 *   "Dane osoby, nad ktora sprawujesz opieke" heading yMin=403.9
 *   PESEL osoby chorej yMin=428.5    -> text y=413
 *   Imie osoby chorej yMin=533.3     -> text y=309
 *   Nazwisko osoby chorej yMin=559.7 -> text y=282
 *   Stopien pokrewienstwa yMin=586.0 -> text y=256
 *
 * Page 1 -- Oswiadczenia
 *   Jest domownik row yMin=634.2
 *     TAK checkbox at x~294 (after label), NIE at x~322
 *   Pozostaje we wspolnym gosp. row yMin=712.6
 *     TAK/NIE checkboxes similarly
 *
 * Period/eZLA data goes at y~461 on page 1 (below "Okres" heading at y=329.8)
 */

import { loadZusPdf, stampPdf, type FieldStamp } from '../xfa-injector';

export interface Z15bWizardData {
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
  imieChory: string;
  nazwiskoChory: string;
  peselChory: string;
  dataUrodzChory: string;
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

const U = (s: string) => (s || '').toUpperCase();
const PH = 841.89;

function y(bboxYMin: number, offset = 0): number {
  return Math.round(PH - bboxYMin + offset);
}

const RELACJA_LABEL: Record<string, string> = {
  malzonek: 'MALZONEK',
  rodzic: 'RODZIC',
  tesciowie: 'TESCIOWIE',
  rodzenstwo: 'RODZENSTWO',
  dziecko: 'DZIECKO',
  dziadek: 'DZIADKOWIE',
  wnuk: 'WNUK/WNUCZKA',
  inne: 'INNA OSOBA',
};

export async function buildZ15bPdf(data: Z15bWizardData): Promise<Buffer> {
  const pdfBytes = loadZusPdf('Z-15B.pdf');

  const stamps: FieldStamp[] = [
    // ---- Page 0 -- Twoje dane ----
    // PESEL (label yMin=382.1)
    { page: 0, x: 232, y: y(382.1, -2), text: data.pesel },

    // Imie (label yMin=488.1)
    { page: 0, x: 232, y: y(488.1, -2), text: U(data.imie) },

    // Nazwisko (label yMin=514.9)
    { page: 0, x: 232, y: y(514.9, -2), text: U(data.nazwisko) },

    // Ulica (label yMin=541.7)
    { page: 0, x: 232, y: y(541.7, -2), text: U(data.ulica) },

    // Numer domu (label yMin=568.5)
    { page: 0, x: 232, y: y(568.5, -2), text: data.nrDomu },

    // Numer lokalu (right col, label xMin=334)
    { page: 0, x: 397, y: y(568.5, -2), text: data.nrLokalu },

    // Kod pocztowy (label yMin=595.3)
    { page: 0, x: 232, y: y(595.3, -2), text: data.kodPocztowy },

    // Miejscowosc (right col, label yMin=622.0)
    { page: 0, x: 397, y: y(622.0, -2), text: U(data.miejscowosc) },

    // Numer telefonu (label yMin=684.6)
    { page: 0, x: 232, y: y(684.6, -2), text: data.telefon },

    // ---- Page 1 -- Dane platnika skladek ----
    // NIP (label yMin=117.0)
    { page: 1, x: 232, y: y(117.0, -2), text: data.nipPlatnika },

    // REGON (label yMin=142.8)
    { page: 1, x: 232, y: y(142.8, -2), text: data.regonPlatnika },

    // Nazwa platnika (label yMin=247.2)
    { page: 1, x: 232, y: y(247.2, -2), text: U(data.nazwaPlatinika) },

    // Rachunek bankowy (heading yMin=267.9 -- input box below)
    { page: 1, x: 42, y: y(282, 2), text: data.nrKonta },

    // ---- Page 1 -- Okres opieki + eZLA ----
    // "Okres, za ktory ubiegasz sie o zasilek opiekunczy" heading yMin=329.8
    // "Podaj date lub daty (od-do)" instruction yMin=381.1
    // eZLA instruction yMin=390.1
    // Input row for period dates ~y=405
    { page: 1, x: 42, y: y(405, 2), text: data.dataOd ? `od: ${data.dataOd}` : '' },
    { page: 1, x: 230, y: y(405, 2), text: data.dataDo ? `do: ${data.dataDo}` : '' },

    // eZLA numer input ~y=416 (below eZLA instruction line)
    { page: 1, x: 42, y: y(416, 2), text: data.numerEzla },

    // ---- Page 1 -- Dane osoby chorej ----
    // "Dane osoby, nad ktora sprawujesz opieke" heading yMin=403.9
    // PESEL osoby chorej (label yMin=428.5)
    { page: 1, x: 232, y: y(428.5, -2), text: data.peselChory },

    // Imie osoby chorej (label yMin=533.3)
    { page: 1, x: 232, y: y(533.3, -2), text: U(data.imieChory) },

    // Nazwisko osoby chorej (label yMin=559.7)
    { page: 1, x: 232, y: y(559.7, -2), text: U(data.nazwiskoChory) },

    // Stopien pokrewienstwa (label yMin=586.0)
    {
      page: 1,
      x: 232,
      y: y(586.0, -2),
      text: RELACJA_LABEL[data.relacjaDoMnie] ?? U(data.relacjaDoMnie),
    },

    // ---- Page 1 -- Oswiadczenie 1: jest domownik ----
    // "Jest domownik" label at yMin=634.2
    // TAK checkbox is right of label -- estimated x=297, NIE x=325
    ...(data.jestDomownik === 'tak'
      ? [{ page: 1, x: 291, y: y(634.2, -1), text: 'X', size: 10 } as FieldStamp]
      : [{ page: 1, x: 319, y: y(634.2, -1), text: 'X', size: 10 } as FieldStamp]),

    // Jesli TAK -- podaj dni
    ...(data.jestDomownik === 'tak' && data.domownikDni
      ? [{ page: 1, x: 232, y: y(645.2, -2), text: data.domownikDni } as FieldStamp]
      : []),

    // ---- Page 1 -- Oswiadczenie 2: wspolne gospodarstwo ----
    // "Pozostaje we wspolnym gospodarstwie" row yMin=712.6
    // TAK/NIE checkboxes after the label (estimated x=303/331)
    ...(data.wspolneGospodarstwo === 'tak'
      ? [{ page: 1, x: 303, y: y(712.6, -1), text: 'X', size: 10 } as FieldStamp]
      : [{ page: 1, x: 331, y: y(712.6, -1), text: 'X', size: 10 } as FieldStamp]),
  ];

  return stampPdf(pdfBytes, stamps);
}
