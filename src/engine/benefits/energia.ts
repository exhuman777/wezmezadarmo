import { Benefit } from '../types';

export const ENERGIA: Benefit[] = [
  {
    id: 'bon-energetyczny', nazwa: 'Bon energetyczny', kategoria: 'ENERGIA',
    kwota: '1000-3500 PLN (zależne od dochodu i liczby osób)', kwotaMin: 1000, kwotaMax: 3500,
    czestotliwosc: 'rocznie',
    wymagania: { dochodMax: 2500 },
    wykluczenia: [],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowód osobisty', 'Zaświadczenie o dochodach lub PIT', 'Numer konta bankowego'],
      kroki: [
        'Sprawdź czy Twój dochód na osobę nie przekracza progu (2500 PLN dla 1-os. lub 1700 PLN dla wieloosobowego gosp.)',
        'Pobierz formularz wniosku z urzędu gminy',
        'Wypełnij dane o dochodach i liczbie osób w gospodarstwie',
        'Złóż wniosek w urzędzie gminy',
      ],
      terminRealizacji: '60 dni od złożenia wniosku',
      pulapki: [
        'Progi dochodowe: 2500 PLN/os. (jednoosobowe) lub 1700 PLN/os. (wieloosobowe)',
        'Kwota zależy od źródła ogrzewania: gaz, prąd, olej = różne stawki',
        'Bon nie podlega opodatkowaniu -- nie wykazujesz go w PIT',
      ],
      odwolanie: 'Odwołanie do SKO w ciągu 14 dni',
    },
    zrodloUrl: 'https://www.gov.pl/web/klimat/bon-energetyczny',
    zrodloNazwa: 'Ministerstwo Klimatu', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'bon-cieplowniczy', nazwa: 'Bon ciepłowniczy', kategoria: 'ENERGIA',
    kwota: '500-3500 PLN', kwotaMin: 500, kwotaMax: 3500,
    czestotliwosc: 'rocznie',
    wymagania: {},
    wykluczenia: [{ opis: 'Dotyczy odbiorców ciepła systemowego (sieć ciepłownicza)', sprawdz: 'cieplo_systemowe' }],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowód osobisty', 'Faktura za ciepło systemowe'],
      kroki: [
        'Sprawdź czy jesteś odbiorcą ciepła systemowego (sieć ciepłownicza)',
        'Pobierz formularz wniosku z urzędu gminy',
        'Złóż wniosek z fakturą za ciepło',
      ],
      terminRealizacji: '30-60 dni',
      pulapki: ['Dotyczy TYLKO ciepła systemowego -- nie dotyczy gazu, oleju czy prądu', 'Kwota zależy od cen ciepła w danym okresie'],
      odwolanie: 'Odwołanie do SKO',
    },
    zrodloUrl: 'https://www.gov.pl/web/energia/informacje-o-bonie-cieplowniczym',
    zrodloNazwa: 'Ministerstwo Energii', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
];
