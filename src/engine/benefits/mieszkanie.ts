import { Benefit } from '../types';

export const MIESZKANIE: Benefit[] = [
  {
    id: 'dodatek-mieszkaniowy', nazwa: 'Dodatek mieszkaniowy', kategoria: 'MIESZKANIE',
    kwota: 'pokrycie czesci czynszu (zalezne od gminy)', czestotliwosc: 'miesiecznie (6 miesiecy)',
    wymagania: { dochodMax: 2538 },
    wykluczenia: [{ opis: 'Powierzchnia mieszkania przekracza normatywy (35-80 m2 zalezne od liczby osob)', sprawdz: 'powierzchnia_normatyw' }],
    wniosek: {
      kanal: ['URZAD_GMINY', 'MOPS'],
      dokumenty: ['Zaswiadczenie o dochodach za 3 miesiace', 'Dokument potwierdzajacy tytul prawny do lokalu', 'Deklaracja o wysokosci dochodow'],
      kroki: [
        'Pobierz formularz wniosku z urzedu gminy lub MOPS',
        'Popros zarzadce budynku o potwierdzenie wysokosci czynszu',
        'Wypelnij deklaracje o dochodach za ostatnie 3 miesiace',
        'Zloz wniosek w urzedzie gminy',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: ['Dochod na osobe: max 40% (1-osob.) lub 30% (wieloosob.) przecietnego wynagrodzenia', 'Przysluguje na 6 miesiecy -- potem trzeba zlozyc ponownie'],
      odwolanie: 'Odwolanie do SKO w ciagu 14 dni',
    },
    zrodloUrl: 'https://www.gov.pl/web/rodzina/dodatek-mieszkaniowy',
    zrodloNazwa: 'Ministerstwo Rodziny', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'mieszkanie-na-start', nazwa: 'Mieszkanie na Start (kredyt #naStart)', kategoria: 'MIESZKANIE',
    kwota: 'doplata do kredytu (obnizenie raty)', czestotliwosc: 'miesiecznie (10 lat)',
    wymagania: { wiekMax: 45 },
    wykluczenia: [{ opis: 'Posiadanie innego mieszkania lub domu', sprawdz: 'inne_mieszkanie' }],
    wniosek: {
      kanal: ['BANK'],
      dokumenty: ['Wniosek kredytowy w banku uczestniczacym w programie', 'Dowod osobisty', 'Zaswiadczenie o dochodach'],
      kroki: [
        'Sprawdz czy program jest aktualnie aktywny (zalezy od decyzji rzadu)',
        'Znajdz bank uczestniczacy w programie',
        'Zloz wniosek o kredyt z doplata',
        'Bank weryfikuje spelnienie warunkow programu',
      ],
      terminRealizacji: 'Jak standardowy kredyt hipoteczny (1-3 miesiace)',
      pulapki: ['Program moze byc zawieszony -- sprawdz aktualny status', 'Limity cenowe na m2 zalezne od lokalizacji'],
      odwolanie: 'Reklamacja w banku',
    },
    zrodloUrl: 'https://www.gov.pl/web/rozwoj-technologia/mieszkanie-na-start',
    zrodloNazwa: 'Ministerstwo Rozwoju', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'dodatek-energetyczny', nazwa: 'Dodatek energetyczny', kategoria: 'MIESZKANIE',
    kwota: 'ok. 15-44 PLN miesiecznie', kwotaMin: 15, kwotaMax: 44,
    czestotliwosc: 'miesiecznie',
    wymagania: { dochodMax: 2538 },
    wykluczenia: [{ opis: 'Wymaga posiadania umowy z dostawca energii', sprawdz: 'umowa_energia' }],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Kopia umowy z dostawca energii', 'Decyzja o przyznaniu dodatku mieszkaniowego'],
      kroki: ['Musisz najpierw otrzymac dodatek mieszkaniowy', 'Zloz wniosek o dodatek energetyczny w urzedzie gminy', 'Dolacz kopie umowy z dostawca pradu'],
      terminRealizacji: '30 dni',
      pulapki: ['Wymaga NAJPIERW uzyskania dodatku mieszkaniowego', 'Kwota jest niska ale laczy sie z innymi swiadczeniami'],
      odwolanie: 'Odwolanie do SKO',
    },
    zrodloUrl: 'https://www.gov.pl/web/energia/dodatek-energetyczny',
    zrodloNazwa: 'Ministerstwo Energii', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
];
