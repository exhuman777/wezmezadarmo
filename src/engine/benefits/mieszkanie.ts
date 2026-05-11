import { Benefit } from '../types';

export const MIESZKANIE: Benefit[] = [
  {
    id: 'dodatek-mieszkaniowy', nazwa: 'Dodatek mieszkaniowy', kategoria: 'MIESZKANIE',
    kwota: 'pokrycie części czynszu (zależne od gminy)', czestotliwosc: 'miesięcznie (6 miesięcy)',
    wymagania: { dochodMax: 2538 },
    wykluczenia: [{ opis: 'Powierzchnia mieszkania przekracza normatywy (35-80 m2 zależne od liczby osób)', sprawdz: 'powierzchnia_normatyw' }],
    wniosek: {
      kanal: ['URZAD_GMINY', 'MOPS'],
      dokumenty: ['Zaświadczenie o dochodach za 3 miesiące', 'Dokument potwierdzający tytuł prawny do lokalu', 'Deklaracja o wysokości dochodów'],
      kroki: [
        'Pobierz formularz wniosku z urzędu gminy lub MOPS',
        'Poproś zarządcę budynku o potwierdzenie wysokości czynszu',
        'Wypełnij deklarację o dochodach za ostatnie 3 miesiące',
        'Złóż wniosek w urzędzie gminy',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: ['Dochód na osobę: max 40% (1-osob.) lub 30% (wieloosob.) przeciętnego wynagrodzenia', 'Przysługuje na 6 miesięcy, potem trzeba złożyć ponownie'],
      odwolanie: 'Odwołanie do SKO w ciągu 14 dni',
    },
    zrodloUrl: 'https://www.gov.pl/web/rodzina/dodatek-mieszkaniowy',
    zrodloNazwa: 'Ministerstwo Rodziny', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'mieszkanie-na-start', nazwa: 'Mieszkanie na Start (kredyt #naStart)', kategoria: 'MIESZKANIE',
    kwota: 'dopłata do kredytu (obniżenie raty)', czestotliwosc: 'miesięcznie (10 lat)',
    wymagania: { wiekMax: 45 },
    wykluczenia: [{ opis: 'Posiadanie innego mieszkania lub domu', sprawdz: 'inne_mieszkanie' }],
    wniosek: {
      kanal: ['BANK'],
      dokumenty: ['Wniosek kredytowy w banku uczestniczącym w programie', 'Dowód osobisty', 'Zaświadczenie o dochodach'],
      kroki: [
        'Sprawdź czy program jest aktualnie aktywny (zależy od decyzji rządu)',
        'Znajdź bank uczestniczący w programie',
        'Złóż wniosek o kredyt z dopłatą',
        'Bank weryfikuje spełnienie warunków programu',
      ],
      terminRealizacji: 'Jak standardowy kredyt hipoteczny (1-3 miesiące)',
      pulapki: ['Program może być zawieszony, sprawdź aktualny status', 'Limity cenowe na m2 zależne od lokalizacji'],
      odwolanie: 'Reklamacja w banku',
    },
    zrodloUrl: 'https://www.gov.pl/web/rozwoj-technologia/mieszkanie-na-start',
    zrodloNazwa: 'Ministerstwo Rozwoju', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
  {
    id: 'dodatek-energetyczny', nazwa: 'Dodatek energetyczny', kategoria: 'MIESZKANIE',
    kwota: 'ok. 15-44 PLN miesięcznie', kwotaMin: 15, kwotaMax: 44,
    czestotliwosc: 'miesięcznie',
    wymagania: { dochodMax: 2538 },
    wykluczenia: [{ opis: 'Wymaga posiadania umowy z dostawcą energii', sprawdz: 'umowa_energia' }],
    wniosek: {
      kanal: ['URZAD_GMINY'],
      dokumenty: ['Kopia umowy z dostawcą energii', 'Decyzja o przyznaniu dodatku mieszkaniowego'],
      kroki: ['Musisz najpierw otrzymać dodatek mieszkaniowy', 'Złóż wniosek o dodatek energetyczny w urzędzie gminy', 'Dołącz kopię umowy z dostawcą prądu'],
      terminRealizacji: '30 dni',
      pulapki: ['Wymaga NAJPIERW uzyskania dodatku mieszkaniowego', 'Kwota jest niska ale łączy się z innymi świadczeniami'],
      odwolanie: 'Odwołanie do SKO',
    },
    zrodloUrl: 'https://www.gov.pl/web/energia/dodatek-energetyczny',
    zrodloNazwa: 'Ministerstwo Energii', dataWeryfikacji: '2026-05-09', dataWaznosci: '2026-12-31',
  },
];
