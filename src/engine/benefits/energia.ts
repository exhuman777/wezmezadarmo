import { Benefit } from '../types';

export const ENERGIA: Benefit[] = [
  {
    id: 'bon-energetyczny', nazwa: 'Bon energetyczny', kategoria: 'ENERGIA',
    kwota: '1000-3500 PLN (zalezne od dochodu i liczby osob)', kwotaMin: 1000, kwotaMax: 3500,
    czestotliwosc: 'rocznie',
    wymagania: { dochodMax: 2500 },
    wykluczenia: [],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowod osobisty', 'Zaswiadczenie o dochodach lub PIT', 'Numer konta bankowego'],
      kroki: [
        'Sprawdz czy Twoj dochod na osobe nie przekracza progu (2500 PLN dla 1-os. lub 1700 PLN dla wieloosobowego gosp.)',
        'Pobierz formularz wniosku z urzedu gminy',
        'Wypelnij dane o dochodach i liczbie osob w gospodarstwie',
        'Zloz wniosek w urzedzie gminy',
      ],
      terminRealizacji: '60 dni od zlozenia wniosku',
      pulapki: [
        'Progi dochodowe: 2500 PLN/os. (jednoosobowe) lub 1700 PLN/os. (wieloosobowe)',
        'Kwota zalezy od zrodla ogrzewania: gaz, prad, olej = rozne stawki',
        'Bon nie podlega opodatkowaniu -- nie wykazujesz go w PIT',
      ],
      odwolanie: 'Odwolanie do SKO w ciagu 14 dni',
    },
    zrodloUrl: 'https://www.gov.pl/web/klimat/bon-energetyczny',
    zrodloNazwa: 'Ministerstwo Klimatu', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'bon-cieplowniczy', nazwa: 'Bon cieplowniczy', kategoria: 'ENERGIA',
    kwota: '500-3500 PLN', kwotaMin: 500, kwotaMax: 3500,
    czestotliwosc: 'rocznie',
    wymagania: {},
    wykluczenia: [{ opis: 'Dotyczy odbiorcow ciepla systemowego (siec cieplownicza)', sprawdz: 'cieplo_systemowe' }],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowod osobisty', 'Faktura za cieplo systemowe'],
      kroki: [
        'Sprawdz czy jestes odbiorca ciepla systemowego (siec cieplownicza)',
        'Pobierz formularz wniosku z urzedu gminy',
        'Zloz wniosek z faktura za cieplo',
      ],
      terminRealizacji: '30-60 dni',
      pulapki: ['Dotyczy TYLKO ciepla systemowego -- nie dotyczy gazu, oleju czy pradu', 'Kwota zalezy od cen ciepla w danym okresie'],
      odwolanie: 'Odwolanie do SKO',
    },
    zrodloUrl: 'https://www.gov.pl/web/energia/informacje-o-bonie-cieplowniczym',
    zrodloNazwa: 'Ministerstwo Energii', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
];
