import { Benefit } from '../types';

export const PRACA: Benefit[] = [
  // ─────────────────────────────────────────────────
  // 1. Zasilek dla bezrobotnych (Unemployment Benefit)
  // ─────────────────────────────────────────────────
  {
    id: 'zasilek-dla-bezrobotnych',
    nazwa: 'Zasiłek dla bezrobotnych',
    opis: 'Zasiłek dla bezrobotnych to comiesięczne świadczenie pieniężne wypłacane osobom zarejestrowanym jako bezrobotne w Powiatowym Urzędzie Pracy (PUP). Przysługuje osobom, które w ciągu ostatnich 18 miesięcy przepracowały co najmniej 365 dni ze składkami na Fundusz Pracy. Kwota bazowa od 1 czerwca 2026 wynosi 1783,90 PLN brutto przez pierwsze 90 dni, następnie spada do 1400,90 PLN brutto. Przy stażu pracy powyżej 20 lat przysługuje 120% kwoty bazowej (2140,68 PLN brutto). Podstawa: obwieszczenie Ministra Rodziny z 2 marca 2026. Od czerwca 2025 zlikwidowano stawkę 80%,wszyscy dostają co najmniej 100% niezależnie od stażu. Okres pobierania to 6 miesięcy (standardowo) lub 12 miesięcy, jeśli stopa bezrobocia w powiecie przekracza 150% średniej krajowej. Uwaga: jeśli sam się zwolniłeś lub odszedłeś za porozumieniem stron, zasiłek przysługuje dopiero po 90 dniach karencji. Zwolnienie dyscyplinarne oznacza brak prawa do zasiłku. Zasiłek jest opodatkowany i podlega składce zdrowotnej 9%. Niestawienie się na wyznaczoną wizytę w PUP skutkuje utratą statusu bezrobotnego i zasiłku. Wniosek składa się osobiście w PUP lub przez portal praca.gov.pl. Odwołanie od decyzji starosty do wojewody w ciągu 14 dni.',
    kategoria: 'PRACA',
    kwota: '1783,90 PLN brutto/mies. (pierwsze 90 dni, od 1.06.2026), potem 1400,90 PLN brutto; 120% przy stażu 20+ lat',
    kwotaMin: 1401,
    kwotaMax: 2141,
    czestotliwosc: 'miesięcznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Brak 365 dni zatrudnienia (ze składkami na Fundusz Pracy) w ciągu ostatnich 18 miesięcy', sprawdz: 'staz_pracy_365_dni' },
      { opis: 'Rozwiązanie umowy za wypowiedzeniem przez pracownika lub za porozumieniem stron: karencja 90 dni', sprawdz: 'sposob_rozwiazania_umowy' },
      { opis: 'Zwolnienie dyscyplinarne: brak prawa do zasiłku', sprawdz: 'zwolnienie_dyscyplinarne' },
      { opis: 'Odmowa przyjęcia propozycji pracy lub stażu z PUP', sprawdz: 'odmowa_oferty_pup' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Dowód osobisty lub paszport',
        'Świadectwa pracy (wszystkie)',
        'Dyplomy, świadectwa szkolne, certyfikaty kwalifikacji',
        'Zaświadczenie o opłacaniu składek na Fundusz Pracy (jeśli umowa zlecenie)',
        'Decyzja o wyrejestrowaniu działalności (jeśli dotyczy)',
        'Zaświadczenie z ZUS o opłacaniu składek społecznych (dla byłych przedsiębiorców)',
        'Orzeczenie o niepełnosprawności (jeśli dotyczy)',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP właściwym dla miejsca zameldowania (osobiście lub przez praca.gov.pl)',
        'Dołącz komplet dokumentów: świadectwa pracy, dyplomy, dowód osobisty',
        'Urzędnik weryfikuje 365 dni zatrudnienia ze składkami w ciągu ostatnich 18 miesięcy',
        'Jeśli kwalifikujesz się, decyzja o przyznaniu zasiłku w ciągu 7 dni',
        'Zasiłek wypłacany z dołu, na konto bankowe, w terminie ustalonym przez PUP',
        'Obowiązkowo stawiaj się na wizyty w PUP w wyznaczonych terminach',
      ],
      terminRealizacji: '7 dni od rejestracji (jeśli spełniasz warunki)',
      pulapki: [
        'Zasiłek przysługuje po 90 dniach karencji jeśli sam się zwolniłeś lub za porozumieniem stron',
        'Okres pobierania: 6 miesięcy (standardowo) lub 12 miesięcy (stopa bezrobocia w powiecie > 150% krajowej)',
        'Niestawienie się na wizytę w PUP = utrata statusu bezrobotnego i zasiłku',
        'Po 3 miesiącach zasiłek spada: 100% przez 90 dni, potem ok. 78,5% kwoty bazowej',
        'Zasiłek jest opodatkowany i podlega składce zdrowotnej 9%',
        'Od czerwca 2025 zlikwidowano stawkę 80%: staż poniżej 20 lat to 100%, 20 lat i więcej to 120% (2140,70 PLN, potem 1681,10 PLN)',
      ],
      odwolanie: 'Odwołanie do wojewody w ciągu 14 dni od doręczenia decyzji starosty',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/swiadczenia-pieniezne/zasilek-dla-osob-bezrobotnych',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 2. Stypendium stazowe (Internship Stipend)
  // ─────────────────────────────────────────────────
  {
    id: 'stypendium-stazowe',
    nazwa: 'Stypendium stażowe (staż z urzędu pracy)',
    opis: 'Stypendium stażowe to comiesięczna wypłata dla osób bezrobotnych odbywających staż organizowany przez Powiatowy Urząd Pracy. Kwota od 1.06.2026 wynosi 2854,30 PLN brutto miesięcznie (160% zasiłku dla bezrobotnych). Staż trwa od 3 do 6 miesięcy, z możliwością wydłużenia do 12 miesięcy po potwierdzeniu kwalifikacji (nowe zasady od czerwca 2025). Staż to nie umowa o pracę,stażysta nie jest pracownikiem pracodawcy, a organizatorem stażu jest PUP. Czas pracy to max 8 godzin dziennie i 40 godzin tygodniowo. Za każde 30 dni stażu przysługują 2 dni wolne (to nie urlop w klasycznym sensie). Organizator stażu (pracodawca) musi zapewnić badania lekarskie na swój koszt. Przerwanie stażu bez uzasadnienia skutkuje utratą statusu bezrobotnego. Aby otrzymać stypendium, trzeba być zarejestrowanym jako bezrobotny w PUP. Pracodawca składa wniosek o organizację stażu, a PUP kieruje bezrobotnego. Po zakończeniu stażu uczestnik otrzymuje zaświadczenie i opinię od organizatora, co pomaga w szukaniu pracy.',
    kategoria: 'PRACA',
    kwota: '2854,30 PLN brutto miesięcznie (160% zasiłku, od 1.06.2026)',
    kwotaMin: 2854,
    kwotaMax: 2854,
    czestotliwosc: 'miesięcznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Osoby uczące się w trybie stacjonarnym', sprawdz: 'student_stacjonarny' },
      { opis: 'Odmowa podjęcia stażu proponowanego przez PUP', sprawdz: 'odmowa_oferty_pup' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Dowód osobisty',
        'Zaświadczenie o rejestracji jako bezrobotny',
        'CV (wymagane przez niektórych organizatorów stażu)',
        'Zaświadczenie lekarskie o zdolności do pracy na danym stanowisku (na koszt organizatora)',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Zgłoś doradcy zawodowemu chęć odbycia stażu lub znajdź pracodawcę oferującego staż',
        'Pracodawca składa wniosek o organizację stażu w PUP',
        'PUP kieruje Cię na staż (umowa między PUP a organizatorem)',
        'Odbywasz staż: max 8h/dzień, 40h/tydzień, min. 3 miesiące, max 6 miesięcy (do 12 po potwierdzeniu kwalifikacji)',
        'Stypendium wypłacane miesięcznie z dołu',
        'Po zakończeniu otrzymujesz zaświadczenie i opinię od organizatora',
      ],
      terminRealizacji: 'Rozpoczęcie stażu w ciągu 30 dni od zatwierdzenia wniosku',
      pulapki: [
        'Przysługuje zniżka: 2 dni wolne za każde 30 dni stażu (nie urlop w klasycznym sensie)',
        'Organizator musi zapewnić badania lekarskie na swój koszt',
        'Przerwanie stażu bez uzasadnienia = utrata statusu bezrobotnego',
        'Od czerwca 2025 nowe zasady: max 6 miesięcy, możliwość wydłużenia do 12 po potwierdzeniu kwalifikacji',
        'Czas stażu: min. 20h tyg. średnio, do 40h tyg.',
      ],
      odwolanie: 'Skarga do starosty na odmowę skierowania na staż',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/rynek-pracy/stawki-kwoty-wskazniki',
    zrodloNazwa: 'Wortal PSZ (MRPiPS): stawki od 1.06.2026',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 3. Bon na zasiedlenie (Relocation Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-na-zasiedlenie',
    nazwa: 'Bon na zasiedlenie',
    opis: 'Bon na zasiedlenie to jednorazowe wsparcie finansowe do 18 466,30 PLN (200% przeciętnego wynagrodzenia z II kw. 2026) dla osób bezrobotnych, które znajdują pracę w odległości co najmniej 80 km od miejsca zamieszkania lub gdy dzienny dojazd przekracza 3 godziny. Od 2025 roku zniesiono limit wiekowy,wcześniej bon był dostępny tylko do 30 lat, teraz mogą się ubiegać wszyscy zarejestrowani bezrobotni. Warunek kluczowy: trzeba utrzymać zatrudnienie przez minimum 180 dni w ciągu 240 dni od podpisania umowy z PUP. Wynagrodzenie w nowym miejscu musi być co najmniej minimalne (4806 PLN brutto w 2026). Trzeba faktycznie przeprowadzić się do nowej miejscowości. Realna kwota zależy od naboru i regulaminu danego PUP,nie każdy urząd przyznaje maksimum. Jeśli nie utrzymasz pracy przez wymagane 180 dni, musisz zwrócić proporcjonalną część bonu. W ciągu 30 dni po upływie 240 dni od podpisania umowy trzeba złożyć oświadczenie o spełnieniu warunków. Wniosek składa się w PUP właściwym dla miejsca zameldowania.',
    kategoria: 'PRACA',
    kwota: 'do 18 466,30 PLN jednorazowo (200% przeciętnego wynagrodzenia)',
    kwotaMin: 9000,
    kwotaMax: 18466,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Wynagrodzenie w nowym miejscu poniżej minimalnego (4806 PLN brutto w 2026)', sprawdz: 'wynagrodzenie_minimalne' },
      { opis: 'Odległość do nowego miejsca zamieszkania poniżej 80 km lub dojazd krótszy niż 3h dziennie', sprawdz: 'odleglosc_zasiedlenie' },
      { opis: 'Nieutrzymanie zatrudnienia przez min. 180 dni w ciągu 240 dni od podpisania umowy', sprawdz: 'okres_zatrudnienia_bon' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu na zasiedlenie',
        'Dowód osobisty',
        'Umowa o pracę lub wstępne potwierdzenie zatrudnienia w nowej miejscowości',
        'Oświadczenie o odległości/czasie dojazdu do nowego miejsca',
        'Dane pracodawcy i warunki zatrudnienia',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Znajdź pracę w odległości min. 80 km od obecnego zamieszkania (lub dojazd > 3h dziennie)',
        'Złóż wniosek o bon na zasiedlenie w PUP z kompletem dokumentów',
        'PUP ocenia wniosek i przyznaje bon (kwota do 200% przeciętnego wynagrodzenia)',
        'Podpisz umowę z PUP (zobowiązujesz się do 180 dni zatrudnienia w ciągu 240 dni)',
        'Otrzymujesz środki na konto',
        'W ciągu 30 dni po upływie 240 dni złóż oświadczenie o spełnieniu warunków',
      ],
      terminRealizacji: '30 dni od złożenia kompletnego wniosku',
      pulapki: [
        'Od 2025 nie ma limitu wieku (wcześniej tylko do 30 lat)',
        'Kwota max zależy od naboru. PUP może przyznać mniej niż 200% przeciętnego wynagrodzenia',
        'Jeśli nie utrzymasz pracy 180/240 dni, zwrot proporcjonalnej części bonu',
        'Musisz faktycznie przeprowadzić się do nowej miejscowości',
        'Bon jest bezzwrotny tylko przy spełnieniu warunków umowy',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/bon-na-zasiedlenie',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 4. Bon szkoleniowy (Training Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-szkoleniowy',
    nazwa: 'Bon na kształcenie ustawiczne (dawniej bon szkoleniowy)',
    opis: 'Bon na kształcenie ustawiczne zastąpił 1.06.2025 dawny bon szkoleniowy (ustawa z 20 marca 2025 r. o rynku pracy i służbach zatrudnienia). Przyznaje go starosta (PUP) osobie bezrobotnej lub poszukującej pracy, na podstawie diagnozy zapotrzebowania na zawody i kwalifikacje albo zgłoszenia pracodawcy. Bon gwarantuje sfinansowanie wskazanego przez Ciebie kształcenia do wartości 100% przeciętnego wynagrodzenia w dniu przyznania (9 233,20 PLN od 1.09.2026). Obejmuje opłaty za szkolenia, studia podyplomowe oraz egzaminy i dokumenty potwierdzające kwalifikacje; płatności idą bezpośrednio do instytucji. Koszty ponad wartość bonu pokrywasz sam. Nie ma już limitu wieku 30 lat. W czasie kształcenia może przysługiwać stypendium 120% zasiłku (2140,70 PLN). Wniosek składasz w PUP.',
    kategoria: 'PRACA',
    kwota: 'do 9 233,20 PLN (100% przeciętnego wynagrodzenia) na kształcenie',
    kwotaMin: 1000,
    kwotaMax: 9233,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Kształcenie niezwiązane z zapotrzebowaniem rynku pracy (brak pozytywnej diagnozy PUP lub zgłoszenia pracodawcy)', sprawdz: 'diagnoza_zapotrzebowania' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu na kształcenie ustawiczne (formularz PUP)',
        'Dowód osobisty',
        'Informacja o wybranym kształceniu i instytucji (zakres, koszt, termin)',
        'Zgłoszenie pracodawcy lub uzasadnienie potrzeby kształcenia (jeśli masz)',
      ],
      kroki: [
        'Zarejestruj się w PUP jako bezrobotny albo poszukujący pracy',
        'Wybierz kształcenie (szkolenie, studia podyplomowe, egzamin) i instytucję',
        'Złóż wniosek o bon w PUP',
        'PUP ocenia wniosek na podstawie diagnozy zapotrzebowania na zawody',
        'Po przyznaniu bonu PUP płaci instytucji do wartości bonu',
        'Koszty ponad wartość bonu dopłacasz sam',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: [
        'Od 1.06.2025 dawny bon szkoleniowy (do 30 lat) nie istnieje, jest bon na kształcenie ustawiczne bez limitu wieku',
        'Wartość bonu to 100% przeciętnego wynagrodzenia w dniu przyznania (od 1.09.2026: 9 233,20 PLN)',
        'PUP może odmówić, jeśli kształcenie nie odpowiada potrzebom rynku pracy',
        'Cena usługi nie może być rażąco wyższa od cen podobnych usług na rynku',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/podnoszenie-kwalifikacji/bony-na-ksztalcenie-ustawiczne',
    zrodloNazwa: 'Wortal PSZ (MRPiPS)',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 5. Bon stazowy (Internship Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-stazowy',
    nazwa: 'Bon stażowy (zlikwidowany 1.06.2025)',
    opis: 'Bon stażowy dla osób do 30 lat nie występuje w ustawie z 20 marca 2025 r. o rynku pracy i służbach zatrudnienia, która obowiązuje od 1 czerwca 2025 r., i nie ma go na liście form pomocy PUP. Zamiast niego skorzystasz ze zwykłego stażu z urzędu pracy, bez limitu wieku: stypendium stażowe od 1.06.2026 wynosi 2854,30 PLN brutto miesięcznie (160% zasiłku), a organizator stażu może dostać premię do 536,70 PLN po jego zakończeniu. Zapytaj w PUP o staż i bon na zasiedlenie.',
    kategoria: 'PRACA',
    zakonczony: true,
    kwota: 'nie przysługuje (zamiast tego staż: 2854,30 PLN brutto/mies.)',
    kwotaMin: 0,
    kwotaMax: 0,
    czestotliwosc: 'miesięcznie (stypendium) + jednorazowo (premia pracodawcy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      wiekMax: 29,
    },
    wykluczenia: [
      { opis: 'Forma pomocy zlikwidowana od 1.06.2025 (nowa ustawa o rynku pracy)', sprawdz: 'zlikwidowany' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu stażowego',
        'Dowód osobisty',
        'Dane pracodawcy oferującego staż i gwarancję zatrudnienia po stażu',
        'Program stażu',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP (wiek do 30 lat)',
        'Znajdź pracodawcę gotowego przyjąć na staż i zatrudnić na min. 6 miesięcy po stażu',
        'Złóż wniosek o bon stażowy w PUP',
        'PUP wydaje bon i kieruje Cię na staż do wskazanego pracodawcy',
        'Odbywasz staż (6 miesięcy) z wypłatą stypendium stażowego (160% zasiłku)',
        'Pracodawca zatrudnia Cię na min. 6 miesięcy po stażu',
        'Pracodawca otrzymuje jednorazową premię 2222,60 PLN po 6 miesiącach zatrudnienia',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: [
        'Nie składaj wniosku o bon stażowy: od 1.06.2025 PUP go nie przyznaje',
        'Staż z PUP jest dostępny bez limitu wieku (stypendium 160% zasiłku)',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/rynek-pracy/stawki-kwoty-wskazniki',
    zrodloNazwa: 'Wortal PSZ (MRPiPS)',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 6. Dotacja na rozpoczecie dzialalnosci gospodarczej
  // ─────────────────────────────────────────────────
  {
    id: 'dotacja-dzialalnosc-gospodarcza',
    nazwa: 'Dotacja na rozpoczęcie działalności gospodarczej',
    opis: 'Jednorazowa bezzwrotna dotacja z Funduszu Pracy na założenie własnej firmy, do 55 398,78 PLN (600% przeciętnego wynagrodzenia z II kw. 2026). Realnie PUP-y przyznają od 28 000 do 52 600 PLN, w zależności od regulaminu danego urzędu i dostępnych środków. Przeznaczona wyłącznie dla osób zarejestrowanych jako bezrobotne, które nie prowadziły działalności gospodarczej w ciągu ostatnich 12 miesięcy i nie otrzymały wcześniej dotacji z Funduszu Pracy na ten cel. Wymaga złożenia biznesplanu z kosztorysem planowanych wydatków. Nabory są okresowe (zazwyczaj wiosna/jesień), trzeba śledzić stronę swojego PUP. Konieczne jest zabezpieczenie zwrotu środków: poręczenie osoby trzeciej, weksel, blokada rachunku bankowego lub akt notarialny o poddaniu się egzekucji. Wydatki muszą być ściśle zgodne z kosztorysem,zmiany wymagają pisemnej zgody PUP. Firma musi działać minimum 12 miesięcy, wcześniejsze zamknięcie oznacza zwrot całej dotacji. Wiele PUP-ów wyklucza zakup samochodu osobowego. Dotacja stanowi pomoc de minimis i wlicza się do limitu 300 000 EUR w ciągu 3 lat. Studenci studiów stacjonarnych nie kwalifikują się.',
    kategoria: 'PRACA',
    kwota: 'do 55 398,78 PLN (600% przeciętnego wynagrodzenia); konkretną kwotę ustala PUP',
    kwotaMin: 28000,
    kwotaMax: 55399,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      pierwszaDzialalnosc: true,
    },
    wykluczenia: [
      { opis: 'Prowadzenie działalności gospodarczej w ciągu ostatnich 12 miesięcy', sprawdz: 'dzialalnosc_12m' },
      { opis: 'Otrzymanie wcześniej dotacji z Funduszu Pracy na podjęcie działalności', sprawdz: 'dotacja_fp_wczesniej' },
      { opis: 'Odmowa przyjęcia propozycji pracy z PUP w ciągu 12 miesięcy przed złożeniem wniosku', sprawdz: 'odmowa_oferty_12m' },
      { opis: 'Skazanie za przestępstwo przeciwko obrotowi gospodarczemu w ciągu 2 lat', sprawdz: 'karalnosc_gospodarcza' },
      { opis: 'Student studiów stacjonarnych', sprawdz: 'student_stacjonarny' },
    ],
    wniosek: {
      kanal: ['PUP'],
      formularz: 'Wniosek o przyznanie jednorazowych środków na podjęcie działalności gospodarczej',
      dokumenty: [
        'Wniosek z biznesplanem',
        'Dowód osobisty',
        'Kosztorys planowanych wydatków',
        'Oświadczenie o niekaralności',
        'Oświadczenie o nieprowadzeniu działalności w ostatnich 12 miesiącach',
        'Zabezpieczenie zwrotu środków: poręczenie, weksel, blokada rachunku bankowego lub akt notarialny',
        'Zaświadczenie o pomocy de minimis (jeśli otrzymywana)',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Przygotuj biznesplan z opisem planowanej działalności i kosztorysem',
        'Złóż wniosek w PUP podczas ogłoszonego naboru',
        'Komisja ocenia wniosek (punktacja za realność, innowacyjność, kwalifikacje)',
        'Podpisz umowę z PUP (zobowiązujesz się do prowadzenia firmy przez min. 12 miesięcy)',
        'Otrzymujesz środki na konto (przed zarejestrowaniem firmy lub tuż po)',
        'Zarejestruj działalność w CEIDG w terminie określonym w umowie',
        'Wydaj środki zgodnie z kosztorysem i rozlicz je w PUP',
        'Prowadź firmę min. 12 miesięcy, w przeciwnym razie zwrot dotacji',
      ],
      terminRealizacji: '30 dni od złożenia wniosku (rozpatrzenie); nabory zazwyczaj 1-3 razy w roku',
      pulapki: [
        'Nabory są okresowe, często na wiosnę/jesień, trzeba śledzić stronę PUP',
        'Realna kwota zależy od regulaminu danego PUP, nie każdy daje 100% maksimum',
        'Trzeba zabezpieczyć zwrot (poręczyciel, weksel, blokada konta)',
        'Wydatki muszą być zgodne z kosztorysem. Zmiany wymagają zgody PUP',
        'Min. 12 miesięcy prowadzenia firmy. Zamknięcie wcześniej = zwrot całej dotacji',
        'Nie można kupić samochodu osobowego (wiele PUP to wyklucza)',
        'Pomoc de minimis, wlicza się do limitu 300 000 EUR/3 lata',
      ],
      odwolanie: 'Odwołanie od negatywnej oceny wniosku do starosty, zazwyczaj w ciągu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/dofinansowanie-podjecia-dzialalnosci-gospodarczej',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 7. Refundacja kosztow opieki nad dzieckiem
  // ─────────────────────────────────────────────────
  {
    id: 'refundacja-opieka-dziecko',
    nazwa: 'Refundacja kosztów opieki nad dzieckiem do lat 7 lub osobą zależną',
    opis: 'Refundacja kosztów opieki to zwrot udokumentowanych wydatków na opiekę nad dzieckiem do lat 7 albo osobą zależną. Maksymalna kwota to 892 PLN miesięcznie (50% zasiłku, od 1.06.2026), wypłacana do 6 miesięcy po podjęciu pracy albo przez cały czas stażu lub innej formy pomocy. Przysługuje osobom zarejestrowanym jako bezrobotne, które podjęły zatrudnienie, staż, szkolenie lub inną formę pomocy z PUP. Koszty muszą być udokumentowane fakturami lub rachunkami z placówki opiekuńczej (żłobek, przedszkole, klub dziecięcy) lub od opiekuna. Kwota refundacji nie może przekroczyć faktycznie poniesionych wydatków. Refundacja może być kontynuowana nawet po utracie statusu bezrobotnego, jeśli podjęto pracę. Obejmuje również opiekę nad osobą zależną,nie tylko nad dzieckiem. Wniosek składa się w PUP z dołączeniem aktu urodzenia dziecka, umowy z placówką opiekuńczą i dowodów poniesienia kosztów. Co miesiąc trzeba dostarczać potwierdzenia płatności.',
    kategoria: 'PRACA',
    kwota: 'do 892 PLN miesięcznie (50% zasiłku, od 1.06.2026)',
    kwotaMin: 0,
    kwotaMax: 892,
    czestotliwosc: 'miesięcznie (max 6 miesięcy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      dzieci: { min: 1, wiekMax: 6 },
    },
    wykluczenia: [
      { opis: 'Dziecko w wieku 7 lat lub starsze', sprawdz: 'wiek_dziecka_opieka' },
      { opis: 'Brak podjęcia zatrudnienia, stażu, szkolenia lub innej formy pomocy z PUP', sprawdz: 'aktywnosc_zawodowa' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o refundację kosztów opieki',
        'Dowód osobisty',
        'Akt urodzenia dziecka',
        'Umowa z placówką opiekuńczą (żłobek, przedszkole) lub opiekunem',
        'Dowody poniesienia kosztów (faktury, rachunki)',
        'Umowa o pracę lub inny dokument potwierdzający zatrudnienie/staż',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Podejmij zatrudnienie, staż, szkolenie lub inną formę pomocy z PUP',
        'Złóż wniosek o refundację kosztów opieki nad dzieckiem',
        'Dołącz umowę z przedszkolem/żłobkiem/opiekunem i potwierdzenia płatności',
        'PUP przyznaje refundację na max 6 miesięcy',
        'Co miesiąc dostarczaj dowody poniesienia kosztów',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: [
        'Po podjęciu pracy refundacja trwa max 6 miesięcy, w czasie stażu przez cały staż',
        'Obejmuje też opiekę nad osobą zależną (nie tylko dzieckiem)',
        'Koszty muszą być udokumentowane. Bez rachunków nie ma refundacji',
        'Refundacja może być kontynuowana po utracie statusu bezrobotnego (jeśli podjęto pracę)',
        'Kwota refundacji nie może przekroczyć faktycznie poniesionych kosztów',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/refundacja-kosztow-opieki-nad-dzieckiem-do-lat-7-lub-osoba-zalezna',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 8. Dofinansowanie do wynagrodzenia (50+)
  // ─────────────────────────────────────────────────
  {
    id: 'dofinansowanie-wynagrodzenia-50-plus',
    nazwa: 'Dofinansowanie do wynagrodzenia za zatrudnienie bezrobotnego 50+',
    opis: 'Dofinansowanie do wynagrodzenia to instrument skierowany do pracodawców, którzy zatrudnią zarejestrowanego bezrobotnego w wieku 50 lat lub więcej. PUP refunduje pracodawcy do 2403 PLN miesięcznie (50% minimalnego wynagrodzenia) przez 12 miesięcy (dla osób w wieku 50-60 lat) lub 24 miesiące (dla osób w wieku 60+). To nie jest świadczenie wypłacane bezpośrednio bezrobotnemu,pracodawca zatrudnia osobę na umowę o pracę i otrzymuje częściowy zwrot kosztów wynagrodzenia. Po zakończeniu okresu dofinansowania pracodawca musi utrzymać zatrudnienie przez dodatkowe 6 miesięcy (przy 12-miesięcznym dofinansowaniu) lub 12 miesięcy (przy 24-miesięcznym). Rozwiązanie umowy w okresie zobowiązania oznacza zwrot całego dofinansowania. Pracodawca nie może mieć zaległości wobec ZUS ani Urzędu Skarbowego. Dofinansowanie stanowi pomoc de minimis (limit 300 000 EUR na 3 lata). Kobiety po 60 roku życia i mężczyźni po 65 roku życia kwalifikują się jako poszukujący pracy, nie jako bezrobotni, co może wpłynąć na dostępność tego instrumentu.',
    kategoria: 'PRACA',
    kwota: 'do 2403 PLN miesięcznie (50% minimalnego wynagrodzenia) przez 12-24 miesiące',
    kwotaMin: 2403,
    kwotaMax: 2403,
    czestotliwosc: 'miesięcznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      wiekMin: 50,
    },
    wykluczenia: [
      { opis: 'Wiek poniżej 50 lat', sprawdz: 'wiek_ponizej_50' },
      { opis: 'Pracodawca ma zaległości wobec ZUS/US', sprawdz: 'zaleglosci_pracodawcy' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek pracodawcy o dofinansowanie wynagrodzenia',
        'Dane bezrobotnego 50+',
        'Zaświadczenie o pomocy de minimis',
        'Zaświadczenie o niezaleganiu z ZUS i US',
        'Umowa o pracę z bezrobotnym 50+',
      ],
      kroki: [
        'Pracodawca składa wniosek w PUP o dofinansowanie wynagrodzenia osoby 50+',
        'PUP kieruje zarejestrowanego bezrobotnego 50+ do pracodawcy',
        'Pracodawca zatrudnia bezrobotnego na umowę o pracę',
        'PUP wypłaca dofinansowanie: 50% minimalnego wynagrodzenia miesięcznie',
        'Okres dofinansowania: 12 miesięcy (wiek 50-60) lub 24 miesiące (wiek 60+)',
        'Pracodawca musi kontynuować zatrudnienie po zakończeniu dofinansowania przez połowę okresu refundacji',
      ],
      terminRealizacji: '30 dni od złożenia wniosku pracodawcy',
      pulapki: [
        'To świadczenie dla pracodawcy, nie bezpośrednio dla bezrobotnego',
        'Pracodawca musi utrzymać zatrudnienie przez dodatkowe 6 lub 12 miesięcy po zakończeniu dofinansowania',
        'Rozwiązanie umowy w okresie zobowiązania = zwrot dofinansowania',
        'Dofinansowanie to pomoc de minimis (limit 300 000 EUR/3 lata dla pracodawcy)',
        'Kobiety 60+ i mężczyźni 65+ kwalifikują się jako poszukujący pracy (nie bezrobotni)',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji',
    },
    zrodloUrl: 'https://zielonalinia.gov.pl/dofinansowanie-wynagrodzen-za-zatrudnienie-pracownikow-50-41143/',
    zrodloNazwa: 'zielonalinia.gov.pl',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 9. Prace interwencyjne (Intervention Works)
  // ─────────────────────────────────────────────────
  {
    id: 'prace-interwencyjne',
    nazwa: 'Prace interwencyjne',
    opis: 'Prace interwencyjne to forma aktywizacji, w której PUP refunduje pracodawcy część wynagrodzenia i składek ZUS za zatrudnienie osoby bezrobotnej. Refundacja wynosi do 4806 PLN miesięcznie (do 100% minimalnego wynagrodzenia ze składkami ZUS) i trwa od 3 do 12 miesięcy. To świadczenie dla pracodawcy, nie bezpośrednio dla bezrobotnego,osoba bezrobotna zostaje zatrudniona na umowę o pracę i otrzymuje normalne wynagrodzenie od pracodawcy. Po zakończeniu okresu refundacji pracodawca musi kontynuować zatrudnienie przez połowę okresu, w którym otrzymywał refundację (np. po 12 miesiącach refundacji,6 miesięcy dalszego zatrudnienia). Wcześniejsze rozwiązanie umowy oznacza obowiązek zwrotu otrzymanej refundacji. Pracodawca nie może mieć zaległości wobec ZUS i Urzędu Skarbowego, nie może być gospodarstwem domowym i nie może być skazany za określone przestępstwa. To pomoc de minimis dla pracodawcy. Wniosek składa pracodawca w PUP, a urząd kieruje do niego zarejestrowanych bezrobotnych.',
    kategoria: 'PRACA',
    kwota: 'refundacja do 4806 PLN miesięcznie (100% minimalnego wynagrodzenia + składki ZUS)',
    kwotaMin: 2403,
    kwotaMax: 4806,
    czestotliwosc: 'miesięcznie (3-12 miesięcy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Pracodawca będący gospodarstwem domowym', sprawdz: 'pracodawca_gosp_domowe' },
      { opis: 'Pracodawca z zaległościami wobec ZUS/US', sprawdz: 'zaleglosci_pracodawcy' },
      { opis: 'Pracodawca skazany za przestępstwa określone w przepisach', sprawdz: 'karalnosc_pracodawcy' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek pracodawcy o organizację prac interwencyjnych',
        'Zaświadczenie o pomocy de minimis',
        'Zaświadczenie o niezaleganiu z ZUS i US',
        'Oświadczenie o niekaralności',
        'Informacja o planowanych stanowiskach pracy',
      ],
      kroki: [
        'Pracodawca składa wniosek o organizację prac interwencyjnych w PUP',
        'PUP ocenia wniosek i zawiera umowę ze starostą',
        'PUP kieruje bezrobotnych do pracodawcy',
        'Pracodawca zatrudnia bezrobotnych na umowę o pracę',
        'PUP refunduje część wynagrodzeń i składek na ubezpieczenia społeczne (do kwoty minimalnego wynagrodzenia)',
        'Po zakończeniu refundacji pracodawca musi utrzymać zatrudnienie przez połowę okresu refundacji',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: [
        'Refundacja dla pracodawcy, nie bezpośrednio dla bezrobotnego',
        'Czas trwania: 3-12 miesięcy, zależy od umowy ze starostą',
        'Pracodawca musi kontynuować zatrudnienie po refundacji (połowa okresu refundacji)',
        'Wcześniejsze rozwiązanie umowy = zwrot refundacji',
        'Kwota refundacji nie może przekroczyć minimalnego wynagrodzenia za pracę',
        'To pomoc de minimis dla pracodawcy',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-pracodawcow-i-przedsiebiorcow/wsparcie-tworzenia-miejsc-pracy/prace-interwencyjne',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 10. Roboty publiczne (Public Works)
  // ─────────────────────────────────────────────────
  {
    id: 'roboty-publiczne',
    nazwa: 'Roboty publiczne',
    opis: 'Roboty publiczne to forma zatrudnienia subsydiowanego, w której organizator (gmina, powiat, organizacja pozarządowa, spółdzielnia socjalna, spółka wodna lub przedsiębiorstwo społeczne) zatrudnia osoby bezrobotne przy pracach o charakterze użyteczności społecznej,infrastruktura, ochrona środowiska, kultura, oświata, zdrowie. PUP refunduje organizatorowi do 50% przeciętnego wynagrodzenia plus składki ZUS (do 5520,96 PLN miesięcznie od 1.09.2026) przez okres 6-12 miesięcy. Priorytet mają osoby długotrwale bezrobotne i bez kwalifikacji zawodowych. Refundacja trafia do organizatora, nie bezpośrednio do pracownika,osoba bezrobotna otrzymuje normalne wynagrodzenie na podstawie umowy o pracę. Prace muszą być finansowane lub dofinansowane ze środków samorządu, budżetu państwa lub funduszy celowych. Wnioski przyjmowane w trybie ciągłym do wyczerpania środków w danym PUP. Organizatorami nie mogą być prywatne firmy komercyjne,wyłącznie podmioty publiczne i organizacje działające w sferze użyteczności publicznej.',
    kategoria: 'PRACA',
    kwota: 'refundacja do 5520,96 PLN miesięcznie (50% przeciętnego wynagrodzenia + składki) przez 6-12 miesięcy',
    kwotaMin: 2000,
    kwotaMax: 5521,
    czestotliwosc: 'miesięcznie (do 12 miesięcy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Organizator niebędący gminą, powiatem, organizacją pozarządową lub spółdzielnią socjalną', sprawdz: 'organizator_roboty_publiczne' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek organizatora robót publicznych',
        'Opis planowanych prac i stanowisk',
        'Zaświadczenie o pomocy de minimis (jeśli dotyczy)',
        'Informacja o źródłach finansowania robót',
      ],
      kroki: [
        'Organizator (gmina, powiat, NGO, spółdzielnia socjalna) składa wniosek w PUP',
        'PUP ocenia wniosek i zawiera umowę z organizatorem',
        'PUP kieruje bezrobotnych (priorytet: długotrwale bezrobotni, bez kwalifikacji)',
        'Organizator zatrudnia bezrobotnych na umowę o pracę',
        'PUP refunduje organizatorowi część wynagrodzeń i składek ZUS',
        'Prace realizowane w obszarach użyteczności społecznej: infrastruktura, środowisko, kultura',
      ],
      terminRealizacji: '30 dni od złożenia wniosku organizatora',
      pulapki: [
        'Refundacja trafia do organizatora, nie bezpośrednio do pracownika',
        'Organizatorami mogą być wyłącznie: gminy, powiaty, NGO (ochrona środowiska, kultura, oświata, zdrowie), przedsiębiorstwa społeczne, spółdzielnie socjalne, spółki wodne',
        'Prace muszą być finansowane/dofinansowane ze środków samorządu, budżetu państwa lub funduszy celowych',
        'Wnioski w naborze ciągłym, do wyczerpania środków',
        'Priorytet dla osób długotrwale bezrobotnych i bez kwalifikacji',
        'Refundacja max 50% przeciętnego wynagrodzenia + składki ZUS',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-pracodawcow-i-przedsiebiorcow/wsparcie-tworzenia-miejsc-pracy/roboty-publiczne',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 11. Szkolenia indywidualne (Individual Training)
  // ─────────────────────────────────────────────────
  {
    id: 'szkolenie-indywidualne',
    nazwa: 'Szkolenie indywidualne z urzędu pracy',
    opis: 'Szkolenie indywidualne to sfinansowanie przez PUP wybranego przez bezrobotnego szkolenia zawodowego do kwoty 27 593,37 PLN (300% przeciętnego wynagrodzenia). Nie ma limitu wieku, dostępne dla wszystkich zarejestrowanych bezrobotnych. Podczas szkolenia przysługuje stypendium szkoleniowe: 2140,70 PLN brutto miesięcznie (120% zasiłku, od 1.06.2026) przy minimum 150 godzinach szkolenia miesięcznie. Przy mniejszej liczbie godzin stypendium jest proporcjonalnie niższe (minimum 20% zasiłku). Szkolenie musi być powiązane z potrzebami lokalnego rynku pracy i uzgodnione z doradcą zawodowym w ramach Indywidualnego Planu Działania. Od 2026 roku szkolenia muszą być realizowane przez instytucje wpisane do Bazy Usług Rozwojowych (BUR). Nie każdy PUP ma środki na szkolenia indywidualne,budżety są ograniczone i mogą się wyczerpać w ciągu roku. Można być też skierowanym na szkolenie grupowe organizowane przez PUP (bezrobotny nie wybiera tematu). Wniosek rozpatrywany w ciągu 30 dni.',
    kategoria: 'PRACA',
    kwota: 'koszt szkolenia pokrywa PUP + stypendium szkoleniowe 2140,70 PLN/mies. (120% zasiłku)',
    kwotaMin: 0,
    kwotaMax: 27593,
    czestotliwosc: 'jednorazowo (koszt szkolenia) + miesięcznie (stypendium)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Brak uzasadnienia potrzeby szkolenia w kontekście rynku pracy', sprawdz: 'uzasadnienie_szkolenia' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o skierowanie na szkolenie indywidualne',
        'Dowód osobisty',
        'Uzasadnienie wyboru szkolenia (powiązanie z zapotrzebowaniem rynku pracy)',
        'Oferta instytucji szkoleniowej (wpisanej do BUR)',
        'Indywidualny Plan Działania (opracowany z doradcą zawodowym PUP)',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Opracuj Indywidualny Plan Działania z doradcą zawodowym',
        'Znajdź szkolenie i instytucję szkoleniową w Bazie Usług Rozwojowych (BUR)',
        'Złóż wniosek o skierowanie na szkolenie indywidualne',
        'PUP rozpatruje wniosek w ciągu 30 dni',
        'Jeśli zatwierdzony, PUP finansuje koszty szkolenia do 300% przeciętnego wynagrodzenia',
        'Podczas szkolenia otrzymujesz stypendium szkoleniowe (120% zasiłku przy min. 150h/mies.)',
        'Po zakończeniu szkolenia otrzymujesz certyfikat/zaświadczenie',
      ],
      terminRealizacji: '30 dni od złożenia wniosku',
      pulapki: [
        'Stypendium szkoleniowe: 120% zasiłku (2140,70 PLN brutto od 1.06.2026) przy min. 150h szkolenia miesięcznie',
        'Poniżej 150h/mies. stypendium proporcjonalnie niższe (min. 20% zasiłku)',
        'Od 2026 szkolenia muszą być w BUR (dawniej RIS)',
        'Szkolenie musi być powiązane z potrzebami lokalnego rynku pracy',
        'Można być skierowanym też na szkolenie grupowe (nie tylko indywidualne)',
        'Nie każdy PUP ma środki na szkolenia, zależy od budżetu',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/podnoszenie-kwalifikacji/szkolenia',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 12. Przygotowanie zawodowe doroslych (Adult Vocational Preparation)
  // ─────────────────────────────────────────────────
  {
    id: 'przygotowanie-zawodowe-doroslych',
    nazwa: 'Przygotowanie zawodowe dorosłych (zlikwidowane 1.06.2025)',
    opis: 'Przygotowania zawodowego dorosłych nie ma w ustawie z 20 marca 2025 r. o rynku pracy i służbach zatrudnienia, obowiązującej od 1 czerwca 2025 r., ani na liście form pomocy PUP. Program był niszowy (w 2023 r. skorzystały 42 osoby). Zamiast niego zapytaj w PUP o szkolenie ze stypendium 120% zasiłku (2140,70 PLN brutto), bon na kształcenie ustawiczne (do 9 233,20 PLN) albo staż (2854,30 PLN brutto miesięcznie).',
    kategoria: 'PRACA',
    zakonczony: true,
    kwota: 'nie przysługuje (zamiast tego szkolenie lub staż z PUP)',
    kwotaMin: 0,
    kwotaMax: 0,
    czestotliwosc: 'miesięcznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Forma pomocy zlikwidowana od 1.06.2025 (nowa ustawa o rynku pracy)', sprawdz: 'zlikwidowany' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o skierowanie na przygotowanie zawodowe dorosłych',
        'Dowód osobisty',
        'Dokumenty potwierdzające kwalifikacje (dyplomy, certyfikaty)',
        'Zaświadczenie lekarskie o zdolności do wykonywania danego zawodu',
      ],
      kroki: [
        'Zarejestruj się jako bezrobotny w PUP',
        'Uzgodnij z doradcą zawodowym potrzebę przygotowania zawodowego',
        'PUP znajduje pracodawcę realizującego program przygotowania zawodowego',
        'Podpisujesz umowę. Program trwa od 6 do 12 miesięcy (praktyczna nauka zawodu) lub do 6 miesięcy (przyuczenie do pracy)',
        'Otrzymujesz stypendium 120% zasiłku przez cały okres',
        'Na zakończenie zdajesz egzamin kwalifikacyjny',
        'Pracodawca może ubiegać się o premię za każdego uczestnika (441 PLN za każdy pełny miesiąc)',
      ],
      terminRealizacji: 'W zależności od dostępności programów u pracodawców',
      pulapki: [
        'Od 1.06.2025 PUP nie kieruje na przygotowanie zawodowe dorosłych',
        'Podobny efekt dają szkolenie z PUP, bon na kształcenie ustawiczne i staż',
      ],
      odwolanie: 'Odwołanie do starosty w ciągu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/rynek-pracy/stawki-kwoty-wskazniki',
    zrodloNazwa: 'Wortal PSZ (MRPiPS)',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 13. Pozyczka na ksztalcenie (Education Loan)
  // ─────────────────────────────────────────────────
  {
    id: 'pozyczka-na-ksztalcenie',
    nazwa: 'Pożyczka na kształcenie (UE)',
    opis: 'Pożyczka na kształcenie to niskooprocentowane (0% odsetek) finansowanie edukacji ze środków Europejskiego Funduszu Społecznego Plus (EFS+), do kwoty 75 000 PLN. Dostępna dla wszystkich,zatrudnionych, bezrobotnych i samozatrudnionych,bez ograniczeń wiekowych. Można sfinansować: kursy zawodowe, szkolenia, studia podyplomowe, certyfikacje zawodowe. Nie można finansować studiów regularnych (I, II, III stopnia ani jednolitych magisterskich). Do 10 000 PLN pożyczka nie wymaga zabezpieczenia; powyżej tej kwoty potrzebne jest poręczenie lub inne zabezpieczenie. Spłata w ciągu 36 miesięcy z możliwością 6 miesięcy karencji. Kluczowa korzyść: możliwość umorzenia do 50% kwoty po spełnieniu warunków (ukończenie edukacji, trudna sytuacja materialna lub edukacja w priorytetowych tematach). To pożyczka, nie dotacja,trzeba ją spłacić, chyba że uzyskasz umorzenie. Środki z UE są ograniczone i program może się skończyć. Wniosek składa się online przez stronę pozyczkinaksztalcenie.pl lub u operatora (np. Polska Fundacja Przedsiębiorczości). Rozpatrzenie trwa 14-30 dni.',
    kategoria: 'PRACA',
    kwota: 'do 75 000 PLN (0% odsetek, możliwość umorzenia do 50%)',
    kwotaMin: 1000,
    kwotaMax: 75000,
    czestotliwosc: 'jednorazowo',
    wymagania: {},
    wykluczenia: [
      { opis: 'Studia I, II, III stopnia i jednolite magisterskie (nie można finansować)', sprawdz: 'studia_regularne' },
    ],
    wniosek: {
      kanal: ['ONLINE'],
      dokumenty: [
        'Wniosek o pożyczkę na kształcenie (przez operatora, np. PFP)',
        'Dowód osobisty',
        'Dokument potwierdzający formę kształcenia (oferta kursu, studia podyplomowe)',
        'Oświadczenie o statusie zawodowym (zatrudniony/bezrobotny/samozatrudniony)',
        'Do 10 000 PLN bez zabezpieczenia; powyżej wymagane poręczenie lub inne zabezpieczenie',
      ],
      kroki: [
        'Wejdź na stronę pozyczkinaksztalcenie.pl lub operatora (np. Polska Fundacja Przedsiębiorczości)',
        'Wypełnij wniosek online',
        'Dołącz dokumenty potwierdzające formę edukacji',
        'Operator rozpatruje wniosek i podpisuje umowę',
        'Otrzymujesz środki na konto (przelewem na instytucję edukacyjną lub bezpośrednio)',
        'Spłacasz pożyczkę w ciągu 36 miesięcy (z możliwością 6 mies. karencji)',
        'Po spełnieniu warunków możesz ubiegać się o umorzenie do 50% kwoty',
      ],
      terminRealizacji: '14-30 dni od złożenia kompletnego wniosku',
      pulapki: [
        'To pożyczka, nie dotacja. Trzeba oddać (chyba że umorzenie do 50%)',
        'Finansowanie z UE (EFS+), ograniczone środki, może się skończyć',
        'Nie można finansować studiów regularnych (I/II/III stopnia)',
        'Można: kursy, szkolenia, studia podyplomowe, certyfikacje zawodowe',
        'Do 10 000 PLN bez zabezpieczenia; powyżej wymaga poręczenia',
        'Umorzenie 50% po spełnieniu warunków: ukończenie edukacji, trudna sytuacja materialna, lub edukacja w priorytetowych tematach',
        'Spłata do 36 miesięcy + max 6 mies. karencji',
        'Program dostępny dla wszystkich: zatrudnionych, bezrobotnych, samozatrudnionych',
      ],
      odwolanie: 'Reklamacja do operatora pożyczki',
    },
    zrodloUrl: 'https://pozyczkinaksztalcenie.pl/',
    zrodloNazwa: 'Ministerstwo Funduszy i Polityki Regionalnej / BGK',
    dataWeryfikacji: '2026-05-23',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 14. Program Aktywizacja i Integracja (PAI)
  // ─────────────────────────────────────────────────
  {
    id: 'program-aktywizacja-integracja',
    nazwa: 'Program Aktywizacja i Integracja (zastąpiony reintegracją społeczną)',
    opis: 'Program Aktywizacja i Integracja (PAI) pochodził ze starej ustawy o promocji zatrudnienia. Od 1 czerwca 2025 r. PUP zleca zamiast niego działania w zakresie reintegracji społecznej (art. 200 ustawy z 20 marca 2025 r. o rynku pracy i służbach zatrudnienia). Są dla osób zarejestrowanych jako bezrobotne ponad 12 miesięcy w ciągu ostatnich 2 lat, trwają do 6 miesięcy po 4 godziny dziennie i obejmują poradnictwo, warsztaty i grupy wsparcia. Uczestnik dostaje stypendium 60% zasiłku: od 1.06.2026 to 1070,40 PLN miesięcznie. Prowadzą je m.in. centra integracji społecznej.',
    kategoria: 'PRACA',
    zakonczony: true,
    kwota: 'zamiast PAI: reintegracja społeczna ze stypendium 1070,40 PLN/mies. (60% zasiłku)',
    kwotaMin: 0,
    kwotaMax: 0,
    czestotliwosc: 'do 6 miesięcy (reintegracja społeczna)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'PAI zastąpiony od 1.06.2025; reintegracja wymaga statusu bezrobotnego ponad 12 miesięcy w ciągu 2 lat', sprawdz: 'dlugotrwale_bezrobotny' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Skierowanie z PUP (nie wymaga osobnego wniosku, PUP kieruje z urzędu)',
        'Dowód osobisty',
        'Kontrakt socjalny z OPS/MOPS (jeśli realizowany)',
      ],
      kroki: [
        'PUP identyfikuje bezrobotnych korzystających z pomocy społecznej (profil pomocy III)',
        'PUP we współpracy z OPS/MOPS kieruje bezrobotnego do programu PAI',
        'Program trwa 2 miesiące i składa się z dwóch bloków:',
        'Blok aktywizacyjny: max 10h/tyg., prace społecznie użyteczne, wolontariat',
        'Blok integracyjny: poradnictwo specjalistyczne, warsztaty szkoleniowe, grupy wsparcia',
        'Po zakończeniu PUP może: skierować na kolejną edycję PAI (do 6 mies. łącznie), skierować do pracy wspomaganej lub spółdzielni socjalnej',
      ],
      terminRealizacji: 'Kierowanie z urzędu, brak standardowego terminu',
      pulapki: [
        'PAI już nie działa, pytaj w PUP o działania w zakresie reintegracji społecznej',
        'Stypendium 60% zasiłku (1070,40 PLN od 1.06.2026), 4 godziny dziennie, do 6 miesięcy',
      ],
      odwolanie: 'Brak formalnej ścieżki odwoławczej. Skarga do dyrektora PUP',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/reintegracja-spoleczna',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    dataWeryfikacji: '2026-11-01',
    dataWaznosci: '2026-12-31',
  },
  {
    id: 'odprawa-pracownicza', nazwa: 'Odprawa pracownicza przy zwolnieniu',
    opis: 'Odprawa pieniężna przysługuje pracownikowi zwolnionemu z przyczyn niedotyczących pracownika (likwidacja stanowiska, restrukturyzacja, problemy ekonomiczne firmy) w firmie zatrudniającej co najmniej 20 pracowników. Kwota zależy od stażu pracy: poniżej 2 lat stażu - 1 miesięczne wynagrodzenie, 2 do 8 lat - 2 miesięczne wynagrodzenia, powyżej 8 lat - 3 miesięczne wynagrodzenia. Maksymalna odprawa w 2026 r.: 72 090 PLN brutto (15-krotność minimalnego wynagrodzenia). Odprawa jest obowiązkowa z mocy prawa - pracodawca musi ją wypłacić bez osobnego wniosku, przy rozwiązaniu umowy. Pracownik nie musi o nią prosić. Dotyczy zarówno zwolnień grupowych, jak i indywidualnych (jeśli przyczyna leży po stronie pracodawcy).',
    kategoria: 'PRACA',
    kwota: '1-3 miesięczne wynagrodzenia (max 72 090 PLN brutto w 2026 r.)', kwotaMin: 0, kwotaMax: 72090,
    czestotliwosc: 'jednorazowo (przy rozwiązaniu umowy)',
    wymagania: { zatrudnienie: ['pracownik'] },
    wykluczenia: [
      { opis: 'Firma zatrudnia mniej niż 20 pracowników', sprawdz: 'wielkosc_firmy' },
      { opis: 'Zwolnienie dyscyplinarne lub z winy pracownika', sprawdz: 'przyczyna_zwolnienia' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Brak potrzeby składania wniosku - odprawa przysługuje z mocy prawa',
        'Świadectwo pracy (pracodawca musi wystawić w dniu rozwiązania umowy)',
        'Potwierdzenie wysokości wynagrodzenia (jeśli pracodawca kwestionuje)',
      ],
      kroki: [
        'NIE MUSISZ składać żadnego wniosku - odprawa jest obowiązkowa z mocy ustawy z 2003 r.',
        'Pracodawca musi ją wypłacić w dniu rozwiązania umowy lub przy ostatniej wypłacie',
        'Jeśli pracodawca odmawia lub zaniża kwotę: złóż skargę do Państwowej Inspekcji Pracy (PIP) - bezpłatnie i anonimowo',
        'PIP może nałożyć grzywnę na pracodawcę i wyegzekwować wypłatę',
        'Alternatywnie: pozew do sądu pracy (niski lub zerowy koszt, szybkie rozpatrzenie)',
      ],
      terminRealizacji: 'W dniu rozwiązania umowy lub z ostatnią wypłatą',
      pulapki: [
        'Odprawa przysługuje TYLKO gdy firma ma min. 20 pracowników',
        'TYLKO przy zwolnieniu z przyczyn niedotyczących pracownika (likwidacja stanowiska, restrukturyzacja)',
        'NIE przysługuje przy zwolnieniu dyscyplinarnym ani przy własnej rezygnacji',
        'Staż pracy < 2 lata: 1 pensja. 2-8 lat: 2 pensje. Powyżej 8 lat: 3 pensje',
        'Maksymalna odprawa w 2026 r.: 72 090 PLN (15x minimalne wynagrodzenie 4806 PLN)',
        'Wielu pracodawców liczy na to, że pracownik nie zna tego prawa i nie wypłaca odprawy',
        'Jeśli pracodawca nie wypłaci: Państwowa Inspekcja Pracy (pip.gov.pl) lub sąd pracy',
      ],
      odwolanie: 'Skarga do Państwowej Inspekcji Pracy (pip.gov.pl, bezpłatna) lub pozew do sądu pracy',
    },
    zrodloUrl: 'https://zielonalinia.gov.pl/komu-przysluguje-odprawa-pieniezna/',
    zrodloNazwa: 'Zielona Linia (Centrum Informacyjne Służb Zatrudnienia)', dataWeryfikacji: '2026-07-06', dataWaznosci: '2026-12-31',
  },
];
