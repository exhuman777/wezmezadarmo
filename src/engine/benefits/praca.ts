import { Benefit } from '../types';

export const PRACA: Benefit[] = [
  // ─────────────────────────────────────────────────
  // 1. Zasilek dla bezrobotnych (Unemployment Benefit)
  // ─────────────────────────────────────────────────
  {
    id: 'zasilek-dla-bezrobotnych',
    nazwa: 'Zasilek dla bezrobotnych',
    kategoria: 'PRACA',
    kwota: '1721,90 PLN brutto/mies. (pierwsze 90 dni), potem 1352,20 PLN brutto; 120% przy stazu 20+ lat',
    kwotaMin: 1352,
    kwotaMax: 2066,
    czestotliwosc: 'miesiecznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Brak 365 dni zatrudnienia (ze skladkami na Fundusz Pracy) w ciagu ostatnich 18 miesiecy', sprawdz: 'staz_pracy_365_dni' },
      { opis: 'Rozwiazanie umowy za wypowiedzeniem przez pracownika lub za porozumieniem stron -- karencja 90 dni', sprawdz: 'sposob_rozwiazania_umowy' },
      { opis: 'Zwolnienie dyscyplinarne -- brak prawa do zasilku', sprawdz: 'zwolnienie_dyscyplinarne' },
      { opis: 'Odmowa przyjecia propozycji pracy lub stazu z PUP', sprawdz: 'odmowa_oferty_pup' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Dowod osobisty lub paszport',
        'Swiadectwa pracy (wszystkie)',
        'Dyplomy, swiadectwa szkolne, certyfikaty kwalifikacji',
        'Zaswiadczenie o oplacaniu skladek na Fundusz Pracy (jesli umowa zlecenie)',
        'Decyzja o wyrejestrowaniu dzialalnosci (jesli dotyczy)',
        'Zaswiadczenie z ZUS o oplacaniu skladek spolecznych (dla bylych przedsiebiorcow)',
        'Orzeczenie o niepelnosprawnosci (jesli dotyczy)',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP wlasciwym dla miejsca zameldowania (osobiscie lub przez praca.gov.pl)',
        'Dolacz komplet dokumentow: swiadectwa pracy, dyplomy, dowod osobisty',
        'Urzednik weryfikuje 365 dni zatrudnienia ze skladkami w ciagu ostatnich 18 miesiecy',
        'Jesli kwalifikujesz sie -- decyzja o przyznaniu zasilku w ciagu 7 dni',
        'Zasilek wyplacany z dolu, na konto bankowe, w terminie ustalonym przez PUP',
        'Obowiazkowo stawiaj sie na wizyty w PUP w wyznaczonych terminach',
      ],
      terminRealizacji: '7 dni od rejestracji (jesli spelniasz warunki)',
      pulapki: [
        'Zasilek przyslugujepo 90 dniach karencji jesli sam sie zwolniles lub za porozumieniem stron',
        'Okres pobierania: 6 miesiecy (standardowo) lub 12 miesiecy (stopa bezrobocia w powiecie > 150% krajowej)',
        'Niestawienie sie na wizyte w PUP = utrata statusu bezrobotnego i zasilku',
        'Po 3 miesiacach zasilek spada -- 100% przez 90 dni, potem ok. 78,5% kwoty bazowej',
        'Zasilek jest opodatkowany i podlega skladce zdrowotnej 9%',
        'Od czerwca 2025 zlikwidowano stawke 80% -- wszyscy dostaja min. 100% niezaleznie od stazu',
      ],
      odwolanie: 'Odwolanie do wojewody w ciagu 14 dni od doreczenia decyzji starosty',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/swiadczenia-pieniezne/zasilek-dla-osob-bezrobotnych',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 2. Stypendium stazowe (Internship Stipend)
  // ─────────────────────────────────────────────────
  {
    id: 'stypendium-stazowe',
    nazwa: 'Stypendium stazowe (staz z urzedu pracy)',
    kategoria: 'PRACA',
    kwota: '2755,10 PLN brutto miesiecznie (160% zasilku bazowego)',
    kwotaMin: 2755,
    kwotaMax: 2755,
    czestotliwosc: 'miesiecznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Osoby uczace sie w trybie stacjonarnym', sprawdz: 'student_stacjonarny' },
      { opis: 'Odmowa podjecia stazu proponowanego przez PUP', sprawdz: 'odmowa_oferty_pup' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Dowod osobisty',
        'Zaswiadczenie o rejestracji jako bezrobotny',
        'CV (wymagane przez niektorych organizatorow stazu)',
        'Zaswiadczenie lekarskie o zdolnosci do pracy na danym stanowisku (na koszt organizatora)',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Zglos doradcy zawodowemu chec odbycia stazu lub znajdz pracodawce oferujacego staz',
        'Pracodawca sklada wniosek o organizacje stazu w PUP',
        'PUP kieruje Cie na staz (umowa miedzy PUP a organizatorem)',
        'Odbywasz staz: max 8h/dzien, 40h/tydzien, min. 3 miesiace, max 6 miesiecy (do 12 po potwierdzeniu kwalifikacji)',
        'Stypendium wyplacane miesiecznie z dolu',
        'Po zakonczeniu otrzymujesz zaswiadczenie i opinie od organizatora',
      ],
      terminRealizacji: 'Rozpoczecie stazu w ciagu 30 dni od zatwierdzenia wniosku',
      pulapki: [
        'Przyslugujeznizka -- 2 dni wolne za kazde 30 dni stazu (nie urlop w klasycznym sensie)',
        'Organizator musi zapewnic badania lekarskie na swoj koszt',
        'Przerwanie stazu bez uzasadnienia = utrata statusu bezrobotnego',
        'Od czerwca 2025 nowe zasady -- max 6 miesiecy, mozliwosc wydluzenia do 12 po potwierdzeniu kwalifikacji',
        'Czas stazu: min. 20h tyg. srednio, do 40h tyg.',
      ],
      odwolanie: 'Skarga do starosty na odmowe skierowania na staz',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/staze',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 3. Bon na zasiedlenie (Relocation Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-na-zasiedlenie',
    nazwa: 'Bon na zasiedlenie',
    kategoria: 'PRACA',
    kwota: 'do 18 395,58 PLN jednorazowo (200% przecietnego wynagrodzenia)',
    kwotaMin: 9000,
    kwotaMax: 18396,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Wynagrodzenie w nowym miejscu ponizej minimalnego (4806 PLN brutto w 2026)', sprawdz: 'wynagrodzenie_minimalne' },
      { opis: 'Odleglosc do nowego miejsca zamieszkania ponizej 80 km lub dojazd krotszy niz 3h dziennie', sprawdz: 'odleglosc_zasiedlenie' },
      { opis: 'Nieutrzymanie zatrudnienia przez min. 180 dni w ciagu 240 dni od podpisania umowy', sprawdz: 'okres_zatrudnienia_bon' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu na zasiedlenie',
        'Dowod osobisty',
        'Umowa o prace lub wstepne potwierdzenie zatrudnienia w nowej miejscowosci',
        'Oswiadczenie o odleglosci/czasie dojazdu do nowego miejsca',
        'Dane pracodawcy i warunki zatrudnienia',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Znajdz prace w odleglosci min. 80 km od obecnego zamieszkania (lub dojazd > 3h dziennie)',
        'Zloz wniosek o bon na zasiedlenie w PUP z kompletem dokumentow',
        'PUP ocenia wniosek i przyznaje bon (kwota do 200% przecietnego wynagrodzenia)',
        'Podpisz umowe z PUP -- zobowiazujesz sie do 180 dni zatrudnienia w ciagu 240 dni',
        'Otrzymujesz srodki na konto',
        'W ciagu 30 dni po uplywie 240 dni zloz oswiadczenie o spelnieniu warunkow',
      ],
      terminRealizacji: '30 dni od zlozenia kompletnego wniosku',
      pulapki: [
        'Od 2025 nie ma limitu wieku -- wczesniej tylko do 30 lat',
        'Kwota max zalezy od naboru -- PUP moze przyznac mniej niz 200% przecietnego wynagrodzenia',
        'Jesli nie utrzymasz pracy 180/240 dni -- zwrot proporcjonalnej czesci bonu',
        'Musisz faktycznie przeprowadzic sie do nowej miejscowosci',
        'Bon jest bezzwrotny tylko przy spelnieniu warunkow umowy',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/bon-na-zasiedlenie',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 4. Bon szkoleniowy (Training Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-szkoleniowy',
    nazwa: 'Bon szkoleniowy',
    kategoria: 'PRACA',
    kwota: 'do 9 197,79 PLN (100% przecietnego wynagrodzenia) na szkolenia + koszty dojazdu i zakwaterowania',
    kwotaMin: 1000,
    kwotaMax: 9198,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      wiekMax: 29,
    },
    wykluczenia: [
      { opis: 'Wiek 30 lat lub wiecej', sprawdz: 'wiek_powyzej_30' },
      { opis: 'Brak uprawdopodobnienia podjecia pracy po szkoleniu', sprawdz: 'uprawdopodobnienie_pracy' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu szkoleniowego',
        'Dowod osobisty',
        'Oferta szkoleniowa z instytucji szkoleniowej (wpisanej do BUR)',
        'Uzasadnienie wyboru szkolenia i uprawdopodobnienie zatrudnienia po szkoleniu',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Znajdz szkolenie i instytucje szkoleniowa w Bazie Uslug Rozwojowych (BUR)',
        'Zloz wniosek o bon szkoleniowy w PUP',
        'PUP ocenia wniosek -- weryfikuje powiazanie szkolenia z rynkiem pracy',
        'Otrzymujesz bon pokrywajacy: koszty szkolenia, egzaminow, badanetc lekarskich, dojazdow (do 150 PLN), zakwaterowania (550-1500 PLN)',
        'Odbywasz szkolenie i uzyskujesz kwalifikacje',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: [
        'Tylko dla bezrobotnych do 30 roku zycia',
        'Nie kazde szkolenie zostanie zatwierdzone -- musi byc powiazane z zapotrzebowaniem rynku pracy',
        'Od 2026 szkolenia musza byc realizowane przez podmioty z BUR (nie z dawnego RIS)',
        'Koszty dojazdu: max 150 PLN (do 150h szkolenia) lub 200 PLN (powyzej 150h)',
        'Zakwaterowanie: 550 PLN (do 75h) do 1500 PLN (powyzej 150h)',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/bony/bon-szkoleniowy',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 5. Bon stazowy (Internship Voucher)
  // ─────────────────────────────────────────────────
  {
    id: 'bon-stazowy',
    nazwa: 'Bon stazowy',
    kategoria: 'PRACA',
    kwota: 'stypendium stazowe + premia dla pracodawcy 2222,60 PLN + dofinansowanie dojazdu 600 PLN (6x100 PLN)',
    kwotaMin: 2756,
    kwotaMax: 2756,
    czestotliwosc: 'miesiecznie (stypendium) + jednorazowo (premia pracodawcy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      wiekMax: 29,
    },
    wykluczenia: [
      { opis: 'Wiek 30 lat lub wiecej', sprawdz: 'wiek_powyzej_30' },
      { opis: 'Pracodawca nie zobowiaze sie do zatrudnienia po stazu na min. 6 miesiecy', sprawdz: 'gwarancja_zatrudnienia_6m' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o przyznanie bonu stazowego',
        'Dowod osobisty',
        'Dane pracodawcy oferujacego staz i gwarancje zatrudnienia po stazu',
        'Program stazu',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP (wiek do 30 lat)',
        'Znajdz pracodawce gotowego przyjac na staz i zatrudnic na min. 6 miesiecy po stazu',
        'Zloz wniosek o bon stazowy w PUP',
        'PUP wydaje bon -- kieruje Cie na staz do wskazanego pracodawcy',
        'Odbywasz staz (6 miesiecy) z wypclata stypendium stazowego (160% zasilku)',
        'Pracodawca zatrudnia Cie na min. 6 miesiecy po stazu',
        'Pracodawca otrzymuje jednorazowa premie 2222,60 PLN po 6 miesiacach zatrudnienia',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: [
        'Tylko dla bezrobotnych do 30 roku zycia',
        'Pracodawca MUSI zatrudnic na min. 6 miesiecy po stazu -- inaczej traci premie',
        'Bon obejmuje tez koszty dojazdu: 600 PLN (6 rat po 100 PLN)',
        'Badania lekarskie na koszt pracodawcy',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/bony/bon-stazowy',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 6. Dotacja na rozpoczecie dzialalnosci gospodarczej
  // ─────────────────────────────────────────────────
  {
    id: 'dotacja-dzialalnosc-gospodarcza',
    nazwa: 'Dotacja na rozpoczecie dzialalnosci gospodarczej',
    kategoria: 'PRACA',
    kwota: 'do 55 186,74 PLN (6-krotnosc przecietnego wynagrodzenia); realnie 28 000-52 600 PLN',
    kwotaMin: 28000,
    kwotaMax: 55187,
    czestotliwosc: 'jednorazowo',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      pierwszaDzialalnosc: true,
    },
    wykluczenia: [
      { opis: 'Prowadzenie dzialalnosci gospodarczej w ciagu ostatnich 12 miesiecy', sprawdz: 'dzialalnosc_12m' },
      { opis: 'Otrzymanie wczesniej dotacji z Funduszu Pracy na podjecie dzialalnosci', sprawdz: 'dotacja_fp_wczesniej' },
      { opis: 'Odmowa przyjecia propozycji pracy z PUP w ciagu 12 miesiecy przed zlozeniem wniosku', sprawdz: 'odmowa_oferty_12m' },
      { opis: 'Skazanie za przestepstwo przeciwko obrotowi gospodarczemu w ciagu 2 lat', sprawdz: 'karalnosc_gospodarcza' },
      { opis: 'Student studiow stacjonarnych', sprawdz: 'student_stacjonarny' },
    ],
    wniosek: {
      kanal: ['PUP'],
      formularz: 'Wniosek o przyznanie jednorazowych srodkow na podjecie dzialalnosci gospodarczej',
      dokumenty: [
        'Wniosek z biznesplanem',
        'Dowod osobisty',
        'Kosztorys planowanych wydatkow',
        'Oswiadczenie o niekaralnosci',
        'Oswiadczenie o nieprowadzeniu dzialalnosci w ostatnich 12 miesiacach',
        'Zabezpieczenie zwrotu srodkow: poreczenie, weksel, blokada rachunku bankowego lub akt notarialny',
        'Zaswiadczenie o pomocy de minimis (jesli otrzymywana)',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Przygotuj biznesplan z opisem planowanej dzialalnosci i kosztorysem',
        'Zloz wniosek w PUP podczas ogloszonego naboru',
        'Komisja ocenia wniosek -- punktacja za realnosc, innowacyjnosc, kwalifikacje',
        'Podpisz umowe z PUP -- zobowiazujesz sie do prowadzenia firmy przez min. 12 miesiecy',
        'Otrzymujesz srodki na konto (przed zarejestrowaniem firmy lub tuz po)',
        'Zarejestruj dzialalnosc w CEIDG w terminie okreslonym w umowie',
        'Wydaj srodki zgodnie z kosztorysem i rozlicz je w PUP',
        'Prowadz firme min. 12 miesiecy -- w przeciwnym razie zwrot dotacji',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku (rozpatrzenie); nabory zazwyczaj 1-3 razy w roku',
      pulapki: [
        'Nabory sa okresowe -- czesto na wiosne/jesien, trzeba sledzic strone PUP',
        'Realna kwota zalezy od regulaminu danego PUP -- nie kazdy daje 100% maksimum',
        'Trzeba zabezpieczyc zwrot (poreczyciel, weksel, blokada konta)',
        'Wydatki musza byc zgodne z kosztorysem -- zmiany wymagaja zgody PUP',
        'Min. 12 miesiecy prowadzenia firmy -- zamkniecie wczesniej = zwrot calej dotacji',
        'Nie mozna kupic samochodu osobowego (wiele PUP to wyklucza)',
        'Pomoc de minimis -- wlicza sie do limitu 300 000 EUR/3 lata',
      ],
      odwolanie: 'Odwolanie od negatywnej oceny wniosku do starosty -- zazwyczaj w ciagu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/dotacje-jednorazowe-srodki-na-podjecie-dzialalnosci-gospodarczej',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 7. Refundacja kosztow opieki nad dzieckiem
  // ─────────────────────────────────────────────────
  {
    id: 'refundacja-opieka-dziecko',
    nazwa: 'Refundacja kosztow opieki nad dzieckiem do lat 6 lub osoba zalezna',
    kategoria: 'PRACA',
    kwota: 'do 861 PLN miesiecznie (50% zasilku bazowego)',
    kwotaMin: 0,
    kwotaMax: 861,
    czestotliwosc: 'miesiecznie (max 6 miesiecy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      dzieci: { min: 1, wiekMax: 6 },
    },
    wykluczenia: [
      { opis: 'Dziecko powyzej 6 roku zycia (chyba ze niepelnosprawne -- do 7 lat)', sprawdz: 'wiek_dziecka_opieka' },
      { opis: 'Brak podjecia zatrudnienia, stazu, szkolenia lub przygotowania zawodowego', sprawdz: 'aktywnosc_zawodowa' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o refundacje kosztow opieki',
        'Dowod osobisty',
        'Akt urodzenia dziecka',
        'Umowa z placowka opiekunczaa (zlobek, przedszkole) lub opiekunem',
        'Dowody poniesienia kosztow (faktury, rachunki)',
        'Umowa o prace lub inny dokument potwierdzajacy zatrudnienie/staz',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Podejmij zatrudnienie, staz, szkolenie lub przygotowanie zawodowe z PUP',
        'Zloz wniosek o refundacje kosztow opieki nad dzieckiem',
        'Dolacz umowe z przedszkolem/zlobkiem/opiekunem i potwierdzenia platnosci',
        'PUP przyznaje refundacje na max 6 miesiecy',
        'Co miesiac dostarczaj dowody poniesienia kosztow',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: [
        'Refundacja trwa max 6 miesiecy',
        'Obejmuje tez opieke nad osoba zalezna (nie tylko dzieckiem)',
        'Koszty musza byc udokumentowane -- bez rachunkow nie ma refundacji',
        'Refundacja moze byc kontynuowana po utracie statusu bezrobotnego (jesli podjeto prace)',
        'Kwota refundacji nie moze przekroczyc faktycznie poniesionych kosztow',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/refundacja-kosztow-opieki-nad-dzieckiem-do-lat-7-lub-osoba-zalezna',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 8. Dofinansowanie do wynagrodzenia (50+)
  // ─────────────────────────────────────────────────
  {
    id: 'dofinansowanie-wynagrodzenia-50-plus',
    nazwa: 'Dofinansowanie do wynagrodzenia za zatrudnienie bezrobotnego 50+',
    kategoria: 'PRACA',
    kwota: 'do 2403 PLN miesiecznie (50% minimalnego wynagrodzenia) przez 12-24 miesiace',
    kwotaMin: 2403,
    kwotaMax: 2403,
    czestotliwosc: 'miesiecznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
      wiekMin: 50,
    },
    wykluczenia: [
      { opis: 'Wiek ponizej 50 lat', sprawdz: 'wiek_ponizej_50' },
      { opis: 'Pracodawca ma zaleglosci wobec ZUS/US', sprawdz: 'zaleglosci_pracodawcy' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek pracodawcy o dofinansowanie wynagrodzenia',
        'Dane bezrobotnego 50+',
        'Zaswiadczenie o pomocy de minimis',
        'Zaswiadczenie o niezaleganiu z ZUS i US',
        'Umowa o prace z bezrobotnym 50+',
      ],
      kroki: [
        'Pracodawca sklada wniosek w PUP o dofinansowanie wynagrodzenia osoby 50+',
        'PUP kieruje zarejestrowanego bezrobotnego 50+ do pracodawcy',
        'Pracodawca zatrudnia bezrobotnego na umowe o prace',
        'PUP wyplaca dofinansowanie: 50% minimalnego wynagrodzenia miesiecznie',
        'Okres dofinansowania: 12 miesiecy (wiek 50-60) lub 24 miesiace (wiek 60+)',
        'Pracodawca musi kontynuowac zatrudnienie po zakonczeniu dofinansowania przez polowe okresu refundacji',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku pracodawcy',
      pulapki: [
        'To swiadczenie dla pracodawcy, nie bezposrednio dla bezrobotnego',
        'Pracodawca musi utrzymac zatrudnienie przez dodatkowe 6 lub 12 miesiecy po zakonczeniu dofinansowania',
        'Rozwiazanie umowy w okresie zobowiazania = zwrot dofinansowania',
        'Dofinansowanie to pomoc de minimis -- limit 300 000 EUR/3 lata dla pracodawcy',
        'Kobiety 60+ i mezczyzni 65+ kwalifikuja sie jako poszukujacy pracy (nie bezrobotni)',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-pracodawcow-i-przedsiebiorcow/wsparcie-tworzenia-miejsc-pracy/dofinansowanie-wynagrodzenia',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 9. Prace interwencyjne (Intervention Works)
  // ─────────────────────────────────────────────────
  {
    id: 'prace-interwencyjne',
    nazwa: 'Prace interwencyjne',
    kategoria: 'PRACA',
    kwota: 'refundacja do 4806 PLN miesiecznie (100% minimalnego wynagrodzenia + skladki ZUS)',
    kwotaMin: 2403,
    kwotaMax: 4806,
    czestotliwosc: 'miesiecznie (3-12 miesiecy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Pracodawca bedacy gospodarstwem domowym', sprawdz: 'pracodawca_gosp_domowe' },
      { opis: 'Pracodawca z zalegosciami wobec ZUS/US', sprawdz: 'zaleglosci_pracodawcy' },
      { opis: 'Pracodawca skazany za przestepstwa okreslone w przepisach', sprawdz: 'karalnosc_pracodawcy' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek pracodawcy o organizacje prac interwencyjnych',
        'Zaswiadczenie o pomocy de minimis',
        'Zaswiadczenie o niezaleganiu z ZUS i US',
        'Oswiadczenie o niekaralnosci',
        'Informacja o planowanych stanowiskach pracy',
      ],
      kroki: [
        'Pracodawca sklada wniosek o organizacje prac interwencyjnych w PUP',
        'PUP ocenia wniosek i zawiera umowe ze starosta',
        'PUP kieruje bezrobotnych do pracodawcy',
        'Pracodawca zatrudnia bezrobotnych na umowe o prace',
        'PUP refunduje czesc wynagrodzen i skladek na ubezpieczenia spoleczne (do kwoty minimalnego wynagrodzenia)',
        'Po zakonczeniu refundacji pracodawca musi utrzymac zatrudnienie przez polowe okresu refundacji',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: [
        'Refundacja dla pracodawcy, nie bezposrednio dla bezrobotnego',
        'Czas trwania: 3-12 miesiecy -- zalezy od umowy ze starosta',
        'Pracodawca musi kontynuowac zatrudnienie po refundacji (polowa okresu refundacji)',
        'Wczesniejsze rozwiazanie umowy = zwrot refundacji',
        'Kwota refundacji nie moze przekroczyc minimalnego wynagrodzenia za prace',
        'To pomoc de minimis dla pracodawcy',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-pracodawcow-i-przedsiebiorcow/wsparcie-tworzenia-miejsc-pracy/prace-interwencyjne',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 10. Roboty publiczne (Public Works)
  // ─────────────────────────────────────────────────
  {
    id: 'roboty-publiczne',
    nazwa: 'Roboty publiczne',
    kategoria: 'PRACA',
    kwota: 'refundacja do 4000 PLN miesiecznie (50% przecietnego wynagrodzenia + skladki ZUS) przez 6-12 miesiecy',
    kwotaMin: 2000,
    kwotaMax: 4599,
    czestotliwosc: 'miesiecznie (do 12 miesiecy)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Organizator niebedacy gmina, powiatem, organizacja pozarzadowa lub spoldzielnia socjalna', sprawdz: 'organizator_roboty_publiczne' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek organizatora robot publicznych',
        'Opis planowanych prac i stanowisk',
        'Zaswiadczenie o pomocy de minimis (jesli dotyczy)',
        'Informacja o zrodlach finansowania robot',
      ],
      kroki: [
        'Organizator (gmina, powiat, NGO, spoldzielnia socjalna) sklada wniosek w PUP',
        'PUP ocenia wniosek i zawiera umowe z organizatorem',
        'PUP kieruje bezrobotnych (priorytet: dlugotrwale bezrobotni, bez kwalifikacji)',
        'Organizator zatrudnia bezrobotnych na umowe o prace',
        'PUP refunduje organizatorowi czesc wynagrodzen i skladek ZUS',
        'Prace realizowane w obszarach uzytecznosci spolecznej: infrastruktura, srodowisko, kultura',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku organizatora',
      pulapki: [
        'Refundacja trafia do organizatora, nie bezposrednio do pracownika',
        'Organizatorami moga byc wylacznie: gminy, powiaty, NGO (ochrona srodowiska, kultura, oswiata, zdrowie), przedsiebiorstwa spoleczne, spoldzielnie socjalne, spolki wodne',
        'Prace musza byc finansowane/dofinansowane ze srodkow samorzadu, budzetu panstwa lub funduszy celowych',
        'Wnioski w naborze ciaglym -- do wyczerpania srodkow',
        'Priorytet dla osob dlugotrwale bezrobotnych i bez kwalifikacji',
        'Refundacja max 50% przecietnego wynagrodzenia + skladki ZUS',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-pracodawcow-i-przedsiebiorcow/wsparcie-tworzenia-miejsc-pracy/roboty-publiczne',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 11. Szkolenia indywidualne (Individual Training)
  // ─────────────────────────────────────────────────
  {
    id: 'szkolenie-indywidualne',
    nazwa: 'Szkolenie indywidualne z urzedu pracy',
    kategoria: 'PRACA',
    kwota: 'do 27 593,37 PLN (300% przecietnego wynagrodzenia) na szkolenie + stypendium szkoleniowe 2066,28 PLN/mies.',
    kwotaMin: 0,
    kwotaMax: 27593,
    czestotliwosc: 'jednorazowo (koszt szkolenia) + miesiecznie (stypendium)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Brak uzasadnienia potrzeby szkolenia w kontekscie rynku pracy', sprawdz: 'uzasadnienie_szkolenia' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o skierowanie na szkolenie indywidualne',
        'Dowod osobisty',
        'Uzasadnienie wyboru szkolenia (powiazanie z zapotrzebowaniem rynku pracy)',
        'Oferta instytucji szkoleniowej (wpisanej do BUR)',
        'Indywidualny Plan Dzialania (opracowany z doradca zawodowym PUP)',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Opracuj Indywidualny Plan Dzialania z doradca zawodowym',
        'Znajdz szkolenie i instytucje szkoleniowa w Bazie Uslug Rozwojowych (BUR)',
        'Zloz wniosek o skierowanie na szkolenie indywidualne',
        'PUP rozpatruje wniosek w ciagu 30 dni',
        'Jesli zatwierdzony -- PUP finansuje koszty szkolenia do 300% przecietnego wynagrodzenia',
        'Podczas szkolenia otrzymujesz stypendium szkoleniowe (120% zasilku przy min. 150h/mies.)',
        'Po zakonczeniu szkolenia otrzymujesz certyfikat/zaswiadczenie',
      ],
      terminRealizacji: '30 dni od zlozenia wniosku',
      pulapki: [
        'Stypendium szkoleniowe: 120% zasilku (2066,28 PLN brutto) przy min. 150h szkolenia miesiecznie',
        'Ponizej 150h/mies. -- stypendium proporcjonalnie nizsze (min. 20% zasilku)',
        'Od 2026 szkolenia musza byc w BUR (dawniej RIS)',
        'Szkolenie musi byc powiazane z potrzebami lokalnego rynku pracy',
        'Mozna byc skierowanym tez na szkolenie grupowe (nie tylko indywidualne)',
        'Nie kazdy PUP ma srodki na szkolenia -- zalezy od budzetu',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni od decyzji odmownej',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/podnoszenie-kwalifikacji/szkolenia',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 12. Przygotowanie zawodowe doroslych (Adult Vocational Preparation)
  // ─────────────────────────────────────────────────
  {
    id: 'przygotowanie-zawodowe-doroslych',
    nazwa: 'Przygotowanie zawodowe doroslych',
    kategoria: 'PRACA',
    kwota: 'stypendium 2066,28 PLN brutto miesiecznie (120% zasilku)',
    kwotaMin: 2066,
    kwotaMax: 2066,
    czestotliwosc: 'miesiecznie',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Od czerwca 2025 zastapione przez "staz plus" -- sprawdz dostepnosc w lokalnym PUP', sprawdz: 'dostepnosc_programu' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Wniosek o skierowanie na przygotowanie zawodowe doroslych',
        'Dowod osobisty',
        'Dokumenty potwierdzajace kwalifikacje (dyplomy, certyfikaty)',
        'Zaswiadczenie lekarskie o zdolnosci do wykonywania danego zawodu',
      ],
      kroki: [
        'Zarejestruj sie jako bezrobotny w PUP',
        'Uzgodnij z doradca zawodowym potrzebe przygotowania zawodowego',
        'PUP znajduje pracodawce realizujacego program przygotowania zawodowego',
        'Podpisujesz umowe -- program trwa od 6 do 12 miesiecy (praktyczna nauka zawodu) lub do 6 miesiecy (przyuczenie do pracy)',
        'Otrzymujesz stypendium 120% zasilku przez caly okres',
        'Na zakonczenie zdajesz egzamin kwalifikacyjny',
        'Pracodawca moze ubiegac sie o premie za kazdego uczestnika (441 PLN za kazdy pelny miesiac)',
      ],
      terminRealizacji: 'W zaleznosci od dostepnosci programow u pracodawcow',
      pulapki: [
        'Program ma dwie formy: praktyczna nauka zawodu (6-12 mies.) i przyuczenie do pracy (do 6 mies.)',
        'Stypendium 120% zasilku wymaga min. 150h zajec miesiecznie',
        'Od czerwca 2025 program zostal zastapiony przez "staz plus" w ramach nowej ustawy o rynku pracy',
        'W 2023 skorzystaly z niego zaledwie 42 osoby w calej Polsce -- niszowy program',
        'Egzamin kwalifikacyjny jest obowiazkowy na zakonczenie',
        'Pracodawca dostaje premie za kazdego uczestnika',
      ],
      odwolanie: 'Odwolanie do starosty w ciagu 14 dni',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/przygotowanie-zawodowe-doroslych',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 13. Pozyczka na ksztalcenie (Education Loan)
  // ─────────────────────────────────────────────────
  {
    id: 'pozyczka-na-ksztalcenie',
    nazwa: 'Pozyczka na ksztalcenie (UE)',
    kategoria: 'PRACA',
    kwota: 'do 75 000 PLN (0% odsetek, mozliwosc umorzenia do 50%)',
    kwotaMin: 1000,
    kwotaMax: 75000,
    czestotliwosc: 'jednorazowo',
    wymagania: {},
    wykluczenia: [
      { opis: 'Studia I, II, III stopnia i jednolite magisterskie (nie mozna finansowac)', sprawdz: 'studia_regularne' },
    ],
    wniosek: {
      kanal: ['ONLINE'],
      dokumenty: [
        'Wniosek o pozyczke na ksztalcenie (przez operatora, np. PFP)',
        'Dowod osobisty',
        'Dokument potwierdzajacy forme ksztalcenia (oferta kursu, studia podyplomowe)',
        'Oswiadczenie o statusie zawodowym (zatrudniony/bezrobotny/samozatrudniony)',
        'Do 10 000 PLN -- bez zabezpieczenia; powyzej -- wymagane poreczenie lub inne zabezpieczenie',
      ],
      kroki: [
        'Wejdz na strone pozyczkinaksztalcenie.pl lub operatora (np. Polska Fundacja Przedsiebiorczosci)',
        'Wypelnij wniosek online',
        'Dolacz dokumenty potwierdzajace forme edukacji',
        'Operator rozpatruje wniosek i podpisuje umowe',
        'Otrzymujesz srodki na konto (przelewem na instytucje edukacyjna lub bezposrednio)',
        'Splacasz pozyczke w ciagu 36 miesiecy (z mozliwoscia 6 mies. karencji)',
        'Po spelnieniu warunkow mozesz ubiegac sie o umorzenie do 50% kwoty',
      ],
      terminRealizacji: '14-30 dni od zlozenia kompletnego wniosku',
      pulapki: [
        'To pozyczka, nie dotacja -- trzeba oddac (chyba ze umorzenie do 50%)',
        'Finansowanie z UE (EFS+) -- ograniczone srodki, moze sie skonczyc',
        'Nie mozna finansowac studiow regularnych (I/II/III stopnia)',
        'Mozna: kursy, szkolenia, studia podyplomowe, certyfikacje zawodowe',
        'Do 10 000 PLN bez zabezpieczenia; powyzej wymaga poreczenia',
        'Umorzenie 50% po spelnieniu warunkow: ukonczenie edukacji, trudna sytuacja materialna, lub edukacja w priorytetowych tematach',
        'Splata do 36 miesiecy + max 6 mies. karencji',
        'Program dostepny dla wszystkich: zatrudnionych, bezrobotnych, samozatrudnionych',
      ],
      odwolanie: 'Reklamacja do operatora pozyczki',
    },
    zrodloUrl: 'https://pozyczkinaksztalcenie.pl/',
    zrodloNazwa: 'Ministerstwo Funduszy i Polityki Regionalnej / BGK',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },

  // ─────────────────────────────────────────────────
  // 14. Program Aktywizacja i Integracja (PAI)
  // ─────────────────────────────────────────────────
  {
    id: 'program-aktywizacja-integracja',
    nazwa: 'Program Aktywizacja i Integracja (PAI)',
    kategoria: 'PRACA',
    kwota: 'swiadczenie integracyjne + aktywizacja zawodowa (bezplatne uslugi -- brak wyplaty pienieznej)',
    kwotaMin: 0,
    kwotaMax: 0,
    czestotliwosc: 'program 2-miesiecczny (mozliwosc powtorzenia do 6 miesiecy lacznie)',
    wymagania: {
      bezrobotnyZarejestrowany: true,
      zatrudnienie: ['bezrobotny'],
    },
    wykluczenia: [
      { opis: 'Brak korzystania z pomocy spolecznej (wymagany kontakt z OPS/MOPS)', sprawdz: 'pomoc_spoleczna_pai' },
    ],
    wniosek: {
      kanal: ['PUP'],
      dokumenty: [
        'Skierowanie z PUP (nie wymaga osobnego wniosku -- PUP kieruje z urzedu)',
        'Dowod osobisty',
        'Kontrakt socjalny z OPS/MOPS (jesli realizowany)',
      ],
      kroki: [
        'PUP identyfikuje bezrobotnych korzystajacych z pomocy spolecznej (profil pomocy III)',
        'PUP we wspolpracy z OPS/MOPS kieruje bezrobotnego do programu PAI',
        'Program trwa 2 miesiace i sklada sie z dwoch blokow:',
        'Blok aktywizacyjny: max 10h/tyg. -- prace spolecznie uzyteczne, wolontariat',
        'Blok integracyjny: poradnictwo specjalistyczne, warsztaty szkoleniowe, grupy wsparcia',
        'Po zakonczeniu PUP moze: skierowac na kolejna edycje PAI (do 6 mies. lacznie), skierowac do pracy wspomaganej lub spoldzielni socjalnej',
      ],
      terminRealizacji: 'Kierowanie z urzedu -- brak standardowego terminu',
      pulapki: [
        'Program nie daje wyplaty pienieznej -- to usluga aktywizacyjna',
        'Przeznaczony dla najtrudniejszych przypadkow (profil III pomocy)',
        'Realizowany we wspolpracy PUP + OPS/MOPS',
        'Max 10h aktywizacji tygodniowo',
        'Mozna powtarzac program, ale lacznie nie dluzej niz 6 miesiecy',
        'Po PAI mozliwe skierowanie do pracy wspomaganej lub spoldzielni socjalnej',
      ],
      odwolanie: 'Brak formalnej sciezki odwolawtczej -- skarga do dyrektora PUP',
    },
    zrodloUrl: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/program-aktywizacja-i-integracja',
    zrodloNazwa: 'Ministerstwo Rodziny, Pracy i Polityki Spolecznej',
    dataWeryfikacji: '2026-05-10',
    dataWaznosci: '2026-12-31',
  },
];
