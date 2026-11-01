import { Benefit } from '../types';

export const ENERGIA: Benefit[] = [
  {
    id: 'bon-energetyczny', nazwa: 'Bon energetyczny (zakończony)',
    opis: 'PROGRAM ZAKOŃCZONY. Bon energetyczny był jednorazowym świadczeniem pieniężnym na pokrycie kosztów energii dla gospodarstw domowych o niskich dochodach. Ministerstwo Klimatu potwierdziło, że program nie będzie kontynuowany w 2025 ani 2026 roku - istniał wyłącznie w edycji 2024. Kwoty w edycji 2024: 1 osoba 1000 PLN (1200 PLN przy ogrzewaniu prądem), 2-3 osoby 1500 PLN, 4-5 osób 2000 PLN, 6+ osób 2500 PLN. Progi dochodowe: 2500 PLN netto/os. (jednoosobowe), 1700 PLN netto/os. (wieloosobowe). Wnioski przyjmowano w urzędach gmin, wypłaty zakończono w 2024 r. Dla osób w trudnej sytuacji energetycznej dostępny jest bon ciepłowniczy (dla odbiorców siepła systemowego, nabór od 1 lipca 2026) lub zasiłek celowy na opał w MOPS.',
    kategoria: 'ENERGIA',
    kwota: '1000-3500 PLN (ostatnia edycja 2024)', kwotaMin: 1000, kwotaMax: 3500,
    czestotliwosc: 'jednorazowo (ostatnia edycja 2024)',
    wymagania: { dochodMax: 2500 },
    wykluczenia: [
      { opis: 'PROGRAM ZAKOŃCZONY. Brak edycji w 2025 i 2026 roku - Ministerstwo Klimatu nie kontynuuje programu.', sprawdz: 'program_aktywny' },
    ],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowód osobisty', 'Zaświadczenie o dochodach lub PIT', 'Numer konta bankowego'],
      kroki: [
        'UWAGA: Program zakończony, nowe wnioski nie są przyjmowane',
        'Ostatnie wnioski przyjmowano w 2024 roku w urzędach gmin',
        'Dla wsparcia energetycznego sprawdź: bon ciepłowniczy (nabór od 1 lipca 2026) lub zasiłek celowy w MOPS',
      ],
      terminRealizacji: 'Program zakończony, brak nowych naborów',
      pulapki: [
        'Program istniał wyłącznie w edycji 2024. Nie będzie kontynuowany w 2026 roku',
        'Ministerstwo Klimatu potwierdziło brak kontynuacji na 2025/2026',
        'Alternatywa: bon ciepłowniczy (od lipca 2026), zasiłek celowy na opał w MOPS',
      ],
      odwolanie: 'Nie dotyczy (program zakończony)',
    },
    zrodloUrl: 'https://www.gov.pl/web/gov/zloz-wniosek-o-wyplate-bonu-energetycznego',
    zrodloNazwa: 'Ministerstwo Klimatu (program zakończony)', dataWeryfikacji: '2026-07-06', dataWaznosci: '2024-12-31',
  },
  {
    id: 'bon-cieplowniczy', nazwa: 'Bon ciepłowniczy',
    opis: 'Bon ciepłowniczy to świadczenie pieniężne dla odbiorców ciepła systemowego (podłączonych do sieci ciepłowniczej) gdzie jednoskładnikowa cena ciepła netto przekracza 170 PLN/GJ. Kwota wynosi 1000, 2000 albo 3500 PLN na gospodarstwo domowe (jednorazowo za 2026). Stawki zależą od ceny ciepła w danej taryfie: 1000 PLN gdy cena 170,01-200 PLN/GJ, 2000 PLN gdy 200,01-230 PLN/GJ, 3500 PLN gdy powyżej 230 PLN/GJ. NABÓR 2026 ZAKOŃCZONY: wnioski za 2026 r. przyjmowano od 1 lipca do 31 sierpnia 2026 r., wnioski po terminie nie są rozpatrywane. Informacje o kolejnym naborze sprawdzaj na gov.pl i w urzędzie gminy. Wniosek można złożyć online (mObywatel lub ePUAP), w urzędzie gminy osobiście albo pocztą. Dotyczy WYŁĄCZNIE ciepła z sieci ciepłowniczej. Jeśli ogrzewasz się gazem, olejem, prądem lub węglem, ten bon Ci nie przysługuje. Bon przysługuje gospodarstwom domowym spełniającym kryterium dochodowe (ustalane na okres naboru). Częsty błąd: mylenie bonu ciepłowniczego z bonem energetycznym (bon energetyczny zakończony w 2024). Praktyczna rada: zachowaj faktury za ciepło systemowe i dane z taryfy dostawcy ciepła, będą wymagane przy wniosku.',
    kategoria: 'ENERGIA',
    kwota: '1000-3500 PLN', kwotaMin: 1000, kwotaMax: 3500,
    czestotliwosc: 'rocznie',
    wymagania: {},
    wykluczenia: [{ opis: 'Dotyczy odbiorców ciepła systemowego (sieć ciepłownicza)', sprawdz: 'cieplo_systemowe' }],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Dowód osobisty', 'Faktura za ciepło systemowe'],
      kroki: [
        'UWAGA: nabór za 2026 r. zakończył się 31 sierpnia 2026 r. Sprawdź w gminie, czy jest ogłoszony kolejny nabór',
        'Sprawdź czy jesteś odbiorcą ciepła systemowego (sieć ciepłownicza)',
        'Pobierz formularz wniosku z urzędu gminy w terminie naboru',
        'Złóż wniosek z fakturą za ciepło systemowe',
      ],
      terminRealizacji: '30-60 dni od złożenia wniosku; nabór za 2026 r. trwał od 1 lipca do 31 sierpnia 2026',
      pulapki: [
        'Nabór za 2026 r. zakończony 31 sierpnia 2026, wniosek po terminie nie zostanie rozpatrzony',
        'Dotyczy TYLKO ciepła systemowego (sieć ciepłownicza), nie dotyczy gazu, oleju czy prądu',
        'Kwota zależy od cen ciepła w danym okresie rozliczeniowym i wielkości gospodarstwa',
      ],
      odwolanie: 'Odwołanie do SKO',
    },
    zrodloUrl: 'https://www.gov.pl/web/energia/informacje-o-bonie-cieplowniczym',
    zrodloNazwa: 'Ministerstwo Energii', dataWeryfikacji: '2026-11-01', dataWaznosci: '2026-12-31',
  },
];
