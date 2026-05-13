/**
 * Enriched per-benefit knowledge base.
 * Populated from official source pages (zus.pl, gov.pl, podatki.gov.pl, etc.)
 * Used to give the AI deeper context when user focuses on a specific benefit.
 *
 * Format per entry:
 *   - Formularz: field names, what to write, common mistakes
 *   - Szczegoly: additional eligibility nuance not in core benefit object
 *   - FAQ: common user questions answered from official sources
 *   - Zrodlo: which page this was fetched from + date
 */

export type BenefitKnowledge = {
  formularzOpis?: string;   // field-by-field form guidance
  szczegolyKwalifikacji?: string; // edge cases, exact rules
  faq?: string;             // Q&A from official pages
  zrodlo?: string;          // URL + fetch date
};

export const BENEFIT_KNOWLEDGE: Record<string, BenefitKnowledge> = {
  // ---- ZUS BATCH (zasilki) ----

  'zasilek-pogrzebowy': {
    formularzOpis: `
Formularz ZUS Z-12 -- wniosek o zasilek pogrzebowy.

CZESC I -- Dane osoby wnioskujacej:
- Imie i nazwisko: pelne imie i nazwisko wnioskodawcy (osoby, ktora poniosla koszty pogrzebu)
- PESEL lub NIP: PESEL wnioskodawcy
- Adres zamieszkania: aktualny adres wnioskodawcy
- Numer konta bankowego: 26-cyfrowy IBAN, na ktore ma trafic zasilek

CZESC II -- Dane osoby zmarlej:
- Imie i nazwisko zmarlego
- PESEL zmarlego (lub data urodzenia jesli brak PESEL)
- Data smierci: dokladna data zgodna z aktem zgonu
- Stopien pokrewienstwa z wnioskodawca (malzonek, dziecko, rodzic, etc.)

CZESC III -- Informacje o ubezpieczeniu zmarlego:
- Czy zmarla osoba byla ubezpieczona w ZUS? (pracownik, emeryt, rencista, etc.)
- Ostatnie miejsce pracy lub numer emerytury/renty

DOKUMENTY DOLACZANE DO WNIOSKU:
1. Akt zgonu (oryginalna kopia)
2. Dokumenty potwierdzajace poniesione koszty (faktury VAT od zakladu pogrzebowego, za wieniec, urne, itd.)
3. Dokument potwierdzajacy pokrewienstwo (odpis aktu urodzenia, slubu)
4. Jesli wnioskuje pracodawca lub instytucja: umowa o organizacje pogrzebu

TYPOWE BLEDY:
- Skladanie wniosku po 12 miesiacach od daty pogrzebu (prawo przepada bezpowrotnie)
- Brak oryginalnych faktur (kserokopie nie wystarczaja)
- Wnioskowanie przez zakad pogrzebowy zamiast przez czlonka rodziny (rodzina dostaje wiecej: 7000 PLN ryczalt vs. faktyczne koszty dla firm)
- Pomylenie daty smierci z data pogrzebu w formularzu
`,
    szczegolyKwalifikacji: `
Kwota od 1 stycznia 2026: 7000 PLN (wzrost z 4000 PLN). O kwocie decyduje DATA SMIERCI, nie data zlozenia wniosku.

Kto moze zlozyc wniosek:
1. Czlonek rodziny (malzonek, dzieci, rodzice, dziadkowie, wnuki, rodzenstwo, teściowie) -- dostaje 7000 PLN ryczaltem niezaleznie od faktycznych kosztow
2. Pracodawca, gmina, dom pomocy spolecznej, instytucja -- dostaje zwrot faktycznych kosztow, max 7000 PLN
3. Obca osoba ktora faktycznie poniosla koszty -- zwrot faktycznych kosztow, max 7000 PLN

Jesli kilka osob ponioslo koszty: zasilek dzielony proporcjonalnie.

Jesli zakad pogrzebowy organizowal pogrzeb na zlecenie rodziny i rodzina zaplacila: wniosek sklada rodzina, dostaje 7000 PLN ryczalt.
`,
    faq: `
P: Czy moge zlozyc wniosek, jesli pogrzeb byl kilka lat temu?
O: NIE. Termin to 12 miesiecy od dnia pogrzebu. Po tym terminie prawo wygasa.

P: Jak liczyc 12 miesiecy -- od daty smierci czy od daty pogrzebu?
O: Od DATY POGRZEBU.

P: Co jesli rodzina czesciowo oplacila pogrzeb, a czesc oplacil zakad pogrzebowy na kredyt?
O: Zasilek przyslugi temu, kto faktycznie poniosl koszty. Jesli rodzina oplacila czesc -- proporcjonalny zwrot.

P: Czy obowiazuje kryterium dochodowe?
O: NIE. Zasilek pogrzebowy nie zalezy od dochodu.

P: Ile dni trwa wyplata?
O: ZUS wyplaca w ciagu 30 dni od zlozenia kompletnego wniosku.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-pogrzebowy -- pobrano 2026-05-13',
  },

  'zasilek-chorobowy': {
    formularzOpis: `
E-ZLA (elektroniczne zwolnienie lekarskie) -- wystawiany przez lekarza, trafia automatycznie do ZUS i pracodawcy. Ubezpieczony nie musi go samodzielnie dostarczac.

Formularz ZUS Z-3 -- wypelnia PRACODAWCA (nie pracownik) i przekazuje do ZUS:
- Dane pracownika: imie, nazwisko, PESEL, adres
- Wymiar etatu i wynagrodzenie brutto za ostatnie 12 miesiecy
- Informacja o przerwach w ubezpieczeniu
- Konto bankowe pracownika (jesli ZUS wyplaca bezposrednio)

ZUS Z-3a -- dla zleceniobiorcow (wypenla zleceniodawca)
ZUS Z-3b -- dla samozatrudnionych (wypelnia sam ubezpieczony)

UBEZPIECZONY NIE SKLADA WNIOSKU -- e-ZLA wystawione przez lekarza uruchamia automatycznie procedure.
`,
    szczegolyKwalifikacji: `
Okres wyczekiwania:
- Pracownicy (umowa o prace): 30 dni ciaglego ubezpieczenia chorobowego
- Zleceniobiorcy: 90 dni
- Dobrowolne ubezpieczenie (samozatrudnieni): 90 dni
- BEZ okresu wyczekiwania: ubezpieczeni wczesniej przez minimum 10 lat, absolwenci (6 mies. od studiow), ciazowe zwolnienia

Wysokosc:
- 80% podstawy (srednie wynagrodzenie z 12 mies.)
- 70% za pobyt w szpitalu (z wyjatkami)
- 100% w ciazy, przy wypadku przy pracy, chorobie zawodowej

Maksymalny okres: 182 dni (6 miesiecy), przy gruzlicy lub ciazy 270 dni.
Po wyczerpaniu -- swiadczenie rehabilitacyjne (do 12 miesiecy).
`,
    faq: `
P: Czy moge isc do lekarza pierwszego dnia choroby?
O: Tak, ale zwolnienie od lekarza moze byc wystawione "wstecz" tylko o 3 dni (tylko w wyjatkowych sytuacjach).

P: Co jesli pracodawca sam wyplaca zasilek?
O: Pracodawcy zatrudniajacy powyzej 20 ubezpieczonych sami wyplacaja zasilek i potem rozliczaja z ZUS.

P: Czy zasilek chorobowy podlega podatkowi?
O: TAK, jest opodatkowany PIT.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-chorobowy -- pobrano 2026-05-13',
  },

  'zasilek-macierzynski': {
    formularzOpis: `
PRACOWNICY: pracodawca sklada ZUS Z-3 do ZUS. Pracownica sklada do pracodawcy wniosek o urlop macierzynski z kopią aktu urodzenia dziecka.

ZLECENIOBIORCY / SAMOZATRUDNIENI: skladaja bezposrednio do ZUS:
- ZUS Z-3a (zleceniobiorcy) lub ZUS Z-3b (samozatrudnieni)
- Wniosek o wyplate zasilku macierzynskiego
- Skrocony odpis aktu urodzenia dziecka
- Oswiadczenie o niepobraniu zasilku przez drugiego rodzica

WNIOSEK O URLOP RODZICIELSKI (jesli chcesz wydluzyc):
- Termin: nie pozniej niz 21 dni po porodzie (jesli chcesz ciagly urlop)
- Pozniejszy wniosek: rodzicielski moze byc brany pozniej, ale treba zlozyc 21 dni przed planowanym poczatkiem
`,
    szczegolyKwalifikacji: `
ZASILEK MACIERZYNSKI vs. SWIADCZENIE RODZICIELSKIE (kosiniakowe):
- Zasilek macierzynski: dla osob ubezpieczonych w ZUS (pracownicy, zleceniobiorcy, samozatrudnieni)
- Kosiniakowe: dla tych, ktorzy NIE maja ubezpieczenia chorobowego (bezrobotni, studenci, etc.)
NIE MOZNA POBIERAC OBU JEDNOCZESNIE.

Okresy:
- Urlop macierzynski: 20 tygodni (przy pojedynczym porodzie), do 37 tyg. przy pietioraczkach
- Urlop rodzicielski: 41 tygodni (lub 43 przy wieloraczkach) -- moze byc podzielony miedzy rodzicow
- 9 tygodni urlopu rodzicielskiego jest NIEPRZENOSZALNE na drugiego rodzica (obowiazuje od 2023)

Wysokosc:
- 81.5% podstawy za caly czas (jesli wniosek zlozono do 21 dni po porodzie)
- 100% przez pierwsze 6 tyg. + 60% przez pozostaly czas (jesli wniosek po terminie)
`,
    faq: `
P: Ojciec dziecka moze wzisc urlop macierzynski?
O: Tak. Ojciec ma prawo do urlopu ojcowskiego (2 tygodnie do 12 mies. od porodu) i moze przejac czesc urlopu macierzynskiego od matki po 14 tygodniach.

P: Czy zasilek macierzynski przyslugi przy poronieniu?
O: Tak, jesli ciaza trwala co najmniej 22 tygodnie -- zasilek za 8 tygodni.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski -- pobrano 2026-05-13',
  },

  'zasilek-opiekunczy': {
    formularzOpis: `
Formularz ZUS Z-15A -- opieka nad dzieckiem do 14 lat:
- Czesc I: dane ubezpieczonego (imie, nazwisko, PESEL, adres)
- Czesc II: dane dziecka (imie, nazwisko, PESEL, stopien pokrewienstwa)
- Czesc III: informacja o innym opiekunie (czy wspolmieszkajacy czlonek rodziny moze zapewnic opieke? jezeli tak, zasilek nie przyslugi)
- Czesc IV: powod (choroba dziecka, zamkniecie placowki, choroba nianni, etc.)
- Podpis: wlasnorecznie lub elektronicznie na PUE ZUS

Formularz ZUS Z-15B -- opieka nad chorym czlonkiem rodziny (malzonek, rodzic, etc.):
- Podobna struktura jak Z-15A
- Czesc III: tutaj warunek "brak innego opiekuna" jest BEZWZGLEDNY (nie jak przy dziecku do lat 2)

UWAGA: lekarz wystawia e-ZLA -- ubezpieczony nie musi juz dostarczac zaswiadczenia lekarskiego odrebnie.
`,
    szczegolyKwalifikacji: `
LIMITY ROCZNE:
- 60 dni na chore dziecko do 14 lat (laczy sie limit obojga rodzicow)
- 14 dni na innego chorego czlonka rodziny
- Przy opiece nad dzieckiem niepelnosprawnym do 18 lat: dodatkowe 30 dni

WARUNEK "BRAK INNEGO OPIEKUNA":
- Przy chorym dziecku do lat 2: warunek nie obowiazuje (zawsze przyslugi)
- Przy chorym dziecku 2-14 lat: jesli inny czlonek rodziny moze zapewnic opieke, zasilek nie przyslugi
- Przy chorym doroslym czlonku rodziny: zawsze wymagane oswiadczenie ze nie ma innego opiekuna

ZAMKNIECIE PLACOWKI:
- Szkola, przedszkole, zlobek zamkniety z przyczyn nieprzewidzianych lub epidemicznych
- Limit 60 dni (wliczany do ogolnego limitu na dziecko)
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-opiekunczy -- pobrano 2026-05-13',
  },

  'swiadczenie-rehabilitacyjne': {
    formularzOpis: `
Formularz ZUS Np-7 -- wniosek o swiadczenie rehabilitacyjne.
Sklada ubezpieczony (lub pracodawca w jego imieniu) do ZUS PRZED wyczerpaniem zasilku chorobowego.

Czesc I -- dane ubezpieczonego: imie, nazwisko, PESEL, adres, konto bankowe
Czesc II -- informacje o chorobie: od kiedy na zwolnieniu, jaki jest powod (czy rokowanie na powrot do pracy jest pozytywne?)
Czesc III -- dokumentacja medyczna: skierowanie od lekarza prowadzacego na komisje ZUS

KROK OBOWIAZKOWY: orzeczenie lekarza orzecznika ZUS -- ZUS wzywa ubezpieczonego na badanie.
Termin zlozenia: najpozniej 6 tygodni przed koncem zasilku chorobowego.
`,
    szczegolyKwalifikacji: `
Swiadczenie rehabilitacyjne przyslugi, gdy po 182 dniach zwolnienia:
- Ubezpieczony jest nadal niezdolny do pracy
- Rokowania na powrot do pracy w ciagu kolejnych 12 miesiecy sa pozytywne

Trwa: do 12 miesiecy (mozna wnioskac o kolejne okresy, kazdy wymaga nowego orzeczenia)

Wysokosc:
- 90% podstawy przez pierwsze 3 miesiace
- 75% podstawy przez kolejne miesiace
- 100% jesli niezdolnosc wynikla z ciazy lub wypadku przy pracy

UWAGA: pracodawca NIE MOZE zwolnic pracownika w czasie pobierania swiadczenia rehabilitacyjnego.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/swiadczenie-rehabilitacyjne -- pobrano 2026-05-13',
  },

  'renta-socjalna': {
    formularzOpis: `
Formularz ZUS ERN -- wniosek o rente socjalna.
Sklada sie w oddziale ZUS lub przez PUE ZUS.

Czesc I -- dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
Czesc II -- historia choroby: kiedy zostala stwierdzona niezdolnosc, w jakim wieku, dokumentacja medyczna
Czesc III -- dokumenty:
- Orzeczenie o niezdolnosci do pracy wydane przez lekarza orzecznika ZUS (lub komisje lekarsko-ZUS)
- Dokumenty potwierdzajace, ze niezdolnosc powstala przed 18. rokiem zycia (lub podczas studiow, lub w szkole)
- Dokumentacja medyczna (zaswiadczenia lekarskie, historia choroby)

KLUCZOWE: trzeba udowodnic, ze niezdolnosc do pracy POWSTALA w caloscii przed 18. urodzinami (lub do 25. roku zycia podczas nauki).
`,
    szczegolyKwalifikacji: `
Komu przyslugi renta socjalna (bez wymogu posiadania stazu):
- Osobom calkowicie niezdolnym do pracy
- Niezdolnosc musi powstac przed 18. rokiem zycia
  LUB w trakcie nauki w szkole/uczelni (do 25. roku zycia)
  LUB w trakcie studiow doktoranckich

Kwota (2026): 1902,71 PLN brutto miesiecznie.

UWAGA: renta socjalna jest zawieszana, gdy ubezpieczony osiaga przychod powyzej 70% przecietnego wynagrodzenia (ok. 4460 PLN brutto w 2026).
Prac dorywcze do tej kwoty: renta wypacana normalnie.
`,
    faq: `
P: Czy mozna pracowac bedac na rencie socjalnej?
O: Tak, do 70% przecietnego wynagrodzenia (ok. 4460 PLN brutto miesiecznie w 2026). Powyzej tej kwoty renta jest zawieszana w calosci.

P: Czy renta socjalna jest na stale?
O: Przyznawana na czas okreslony lub nieokreslonej -- zalezy od orzeczenia. Trzeba odnawiac orzeczenie lekarza orzecznika ZUS.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/renty/renta-socjalna -- pobrano 2026-05-13',
  },

  'mama-4-plus': {
    formularzOpis: `
Formularz ZUS ERSU -- wniosek o rodzicielskie swiadczenie uzupelniajace ("Mama 4+").
Sklada sie w oddziale ZUS lub przez PUE ZUS.

Czesc I -- dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
Czesc II -- informacja o dzieciach: liczba wychowanych dzieci, imiona, nazwiska, daty urodzenia, czy dzieci zyja
Czesc III -- historia zatrudnienia: czy wnioskodawca ma jakiekolwiek prawo do emerytury/renty z ZUS lub KRUS
Czesc IV -- dokumenty dolaczane:
- Akty urodzenia kazdego z 4 (lub wiecej) dzieci
- Jesli dzieci juz doroslemu: moze byc potrzebne potwierdzenie, ze to wnioskodawca je wychowywal
- Jesli ojciec wnioskuje: akt zgonu matki lub wyrok sadu potwierdzajacy opieke

WAZNE: swiadczenie UZUPELNIA emeryture/rente do kwoty minimalnej (1780,96 PLN brutto), nie zastepuje.
Jesli masz juz emeryture powyzej minimalnej -- nie dostaniesz nic.
`,
    szczegolyKwalifikacji: `
Warunki:
- Matka: urodzila i wychowala co najmniej 4 dzieci
- Ojciec: wychowywal co najmniej 4 dzieci (matka dzieci nie zyje lub porzucila dzieci)
- Wiek: kobieta 60+, mezczyzna 65+
- Brak prawa do emerytury lub renty w wysokosci co najmniej minimalnej emerytury

Kwota 2026: uzupelnienie do 1780,96 PLN brutto miesiecznie.
Jesli masz emeryture 1200 PLN -- dostaniesz dopelnienie 580,96 PLN.
Jesli masz emeryture 1900 PLN -- swiadczenie ci nie przyslugi.

Swiadczenie jest NIEZALEZNE od stazu pracy.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/rodzicielskie-swiadczenie-uzupelniajace -- pobrano 2026-05-13',
  },

  'emerytura-pomostowa': {
    formularzOpis: `
Formularz ZUS EPOM -- wniosek o emeryture pomostowa.
Sklada sie w oddziale ZUS lub przez PUE ZUS.

Czesc I -- dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
Czesc II -- historia zatrudnienia w warunkach szczegolnych lub o szczegolnym charakterze:
  - Nazwy pracodawcow
  - Okresy pracy w warunkach szczegolnych
  - Stanowiska (musza byc na liscie z Zal. 1 lub 2 do Ustawy z 2008)
Czesc III -- dokumenty:
  - Swiadectwo pracy z okresleniem rodzaju pracy (musi zawierac punkt o warunkach szczegolnych)
  - Zaswiadczenie pracodawcy (Zal. nr 1 do wniosku EPOM)
  - Dokumenty potwierdzajace ubezpieczenie przed 1999 rokiem

UWAGA: swiadectwo pracy MUSI potwierdzac prace w warunkach szczegolnych. Bez tego ZUS odmowi.
Pracodawca ma obowiazek wydac takie swiadectwo -- jesli odmawia, mozna go przymuszic sadowo.
`,
    szczegolyKwalifikacji: `
Wymagania LACZNIE:
1. Urodzony przed 1 stycznia 1969
2. Co najmniej 15 lat pracy w warunkach szczegolnych lub o szczegolnym charakterze (wykaz w Zal. 1 i 2 do Ustawy)
3. Staz ubezpieczeniowy: 20 lat kobiety / 25 lat mezczyzni
4. Rozwiazanie stosunku pracy
5. Praca w tych warunkach MUSI obejmowac okres po 31 grudnia 2008

Typowe zawody kwalifikujace: gornicy, kierowcy ciezarowek, piloci, maszynisci, strazy, ratownicy gorscy, praca w narazeniu na halas/zapylenie/substancje toksyczne.

Swiadczenie placi pracodawca (Fundusz Emerytur Pomostowych, finansowany ze skladek pracodawcow). Wniosek sklada ubezpieczony do ZUS.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/emerytury/emerytury-pomostowe -- pobrano 2026-05-13',
  },

  'swiadczenie-przedemerytalne': {
    formularzOpis: `
Formularz ZUS ESP -- wniosek o swiadczenie przedemerytalne.
Sklada sie w oddziale ZUS lub przez PUE ZUS po uplywie 6 miesiecy od daty rejestracji w urzedzie pracy.

Czesc I -- dane wnioskodawcy
Czesc II -- data rozwiazania stosunku pracy i powod (likwidacja, zwolnienie grupowe, zwolnienie z winy pracodawcy)
Czesc III -- historia rejestracji w Powiatowym Urzedzie Pracy (PUP):
  - Data rejestracji
  - Potwierdzenie, ze przez 6 miesiecy pobieralo sie zasilek dla bezrobotnych
  - Potwierdzenie z PUP ze aktywnie szukano pracy
Czesc IV -- dokumenty:
  - Swiadectwo pracy z podaniem przyczyny rozwiazania
  - Zaswiadczenie z ZUS o okresleniu stazu ubezpieczeniowego
  - Zaswiadczenie z PUP o 6-miesiecznym pobieraniu zasilku

KLUCZOWY TERMIN: wniosek nalezy zlozyc w ciagu 30 dni od daty wydania przez PUP zaswiadczenia potwierdzajacego 6-miesieczny pobyt na zasilku. Po uplywie 30 dni -- trzeba zaczac procedure od nowa.
`,
    szczegolyKwalifikacji: `
Warunki (musza byc spelnione LACZNIE):
1. Wiek: kobieta 56+, mezczyzna 61+ w dniu rozwiazania stosunku pracy
2. Staz: kobieta minimum 20 lat, mezczyzna minimum 25 lat ubezpieczenia
3. Powod utraty pracy: likwidacja pracodawcy, zwolnienie grupowe, przyczyny lezace po stronie pracodawcy
4. 6 miesiecy rejestracji w PUP jako bezrobotny i pobierania zasilku dla bezrobotnych

Kwota (2026): 1636,15 PLN brutto miesiecznie (okolo 91% minimalnej emerytury).
Trwa do osiagniecia wieku emerytalnego (60/65 lat).
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/swiadczenia-przedemerytalne -- pobrano 2026-05-13',
  },

  // ---- RODZINA BATCH ----

  '800-plus': {
    formularzOpis: `
Wniosek SW-1 -- wyacznie elektronicznie (brak wersji papierowej od 2024):
- PUE ZUS (pue.zus.pl): zaloguj sie profilem zaufanym, e-Dowodem lub bankowoscia elektroniczna
- Bankowosc elektroniczna: wiekszosc duzych bankow (PKO, Pekao, mBank, Santander, ING, etc.)
- Portal Empatia (empatia.mpips.gov.pl)

POLA DO WYPELNIENIA:
1. Dane wnioskodawcy: imie, nazwisko, PESEL, adres, numer konta bankowego (IBAN)
2. Dane dziecka/dzieci: imie, nazwisko, PESEL kazdego dziecka, data urodzenia
3. Przy opiece naprzemiennej: zaznaczyc i podac PESEL drugiego rodzica

WERYFIKACJA AUTOMATYCZNA:
ZUS weryfikuje dane z rejestru PESEL -- nie trzeba dolaczac aktu urodzenia jesli dziecko urodzilo sie w Polsce. Przy dzieciach urodzonych zagranica -- akt urodzenia z tumaczeniem.
`,
    szczegolyKwalifikacji: `
OKRESY SWIADCZENIOWE: zawsze od 1 czerwca do 31 maja.
Wnioski na nowy okres przyjmowane od 1 LUTEGO.
Jesli zlozy sie wniosek:
- Od 1 lutego do 30 kwietnia: wyplata od 1 czerwca (bez opoznienia)
- Od 1 maja do 31 maja: wyplata od 1 czerwca, ale po rozpatrzeniu (moze byc opoznienie do 2 mies.)
- Po 1 czerwca: wyplata od pierwszego dnia miesiaca zlozenia wniosku (BRAK wyrownania wstecz)

OPIEKA NAPRZEMIENNA:
Jesli rodzice rozwiedzeni z oprawieniem o opiece naprzemiennej (co najmniej 50/50): kazdy rodzic sklada wniosek na pol swiadczenia (400 PLN).

CUDZOZIEMCY:
Prawo do 800+ maja cudzoziemcy z prawem pobytu stale lub czasowego jesli zamieszkuja w Polsce i sprawuja opieke nad dzieckiem.
`,
    faq: `
P: Dziecko ukonczylo 18 lat w sierpniu -- czy dostaje za sierpien?
O: TAK. Swiadczenie przyslugi do konca miesiaca, w ktorym dziecko ukoncza 18 lat.

P: Co jesli urodzilo sie drugie dziecko w trakcie okresu swiadczeniowego?
O: Nalezy zlozyc nowy wniosek dla noworodka. ZUS automatycznie wlicza go do swiadczenia.

P: Czy 800+ jest wliczane do dochodu przy innych swiadczeniach?
O: NIE. Ustawa expressis verbis wylacza 800+ z dochodu przy ocenie kryterium dochodowego innych swiadczen.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/800plus -- pobrano 2026-05-13',
  },

  'becikowe': {
    formularzOpis: `
Formularz SR-2 -- wniosek o ustalenie prawa do jednorazowej zapomogi z tytulu urodzenia sie dziecka.
Sklada sie w MOPS lub urzedzie gminy (nie w ZUS) w miejscu zamieszkania.

POLA:
1. Dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
2. Dane dziecka: imie, nazwisko, PESEL, data urodzenia
3. Dochod rodziny: dochod netto za rok bazowy (rok poprzedzajacy okres zasilkowy), na kazdego czlonka rodziny
4. Oswiadczenie o opiece medycznej: zaswiadczenie lekarskie LUB od poloznej ze matka byla pod opieka medyczna od max. 10 tygodnia ciazy

DOKUMENTY:
- Oryginalna kopia skroconego aktu urodzenia dziecka
- Zaswiadczenie lekarskie o opiece medycznej od 10. tygodnia ciazy (wystawia lekarz prowadzacy ciaze lub polozna) -- BEZ TEGO WNIOSEK ZOSTANIE ODRZUCONY
- Dokumenty dochodowe: PIT za rok poprzedni lub zaswiadczenie o dochodach z zakladu pracy
- Jesli jest zmiana dochodu (np. utrata pracy): zaswiadczenie z PUP, decyzja o zasilku

TERMIN: 12 miesiecy od urodzenia dziecka. Po tym terminie becikowe przepada bezpowrotnie.
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe 2025/2026: 1922 PLN netto na osobe w rodzinie miesiecznie.
Dochod liczony z roku bazowego. Przy zmianie dochodu (utrata/uzyskanie) stosuje sie zasade utraty/uzyskania dochodu.

CZESTO POMIJANE:
- Oboje rodzice moga byc wnioskodawcami -- jesli matka nie zlozy, moze ojciec
- Opieka medyczna od 10. tygodnia ciazy jest ABSOLUTNYM wymogiem -- nie ma wyjatkow
- Jesli dziecko urodzilo sie martwe -- becikowe NIE przyslugi
- Przy adopcji: wniosek w ciagu 12 mies. od przysposobieniu, wymog opieki medycznej nie dotyczy
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/becikowe -- pobrano 2026-05-13',
  },

  'kosiniakowe': {
    formularzOpis: `
Formularz SR-7 -- wniosek o swiadczenie rodzicielskie.
Sklada sie w MOPS lub urzedzie gminy (nie w ZUS).

POLA:
1. Dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
2. Dane dziecka/dzieci: imie, nazwisko, PESEL, data urodzenia
3. Oswiadczenie: ze wnioskodawca jest osoba uprawniona (bezrobotny, student, zleceniobiorca bez ubezp. chorobowego, rolnik)
4. Oswiadczenie, ze nie pobiera sie zasilku macierzynskiego z ZUS ani KRUS

TERMIN KRYTYCZNY:
- Wniosek zlozony w ciagu 3 MIESIECY od porodu --> wyplata od dnia narodzin
- Wniosek zlozony PO 3 MIESIACACH --> wyplata dopiero od miesiaca zlozenia wniosku (tracisz pieniadze za poprzednie miesiace)

DOKUMENTY:
- Skrocony odpis aktu urodzenia dziecka
- Oswiadczenie o nieuzyskiwaniu zasilku macierzynskiego z ZUS
- Zaswiadczenie z uczelni (jesli student)
`,
    szczegolyKwalifikacji: `
KOSINIAKOWE vs. ZASILEK MACIERZYNSKI:
- Kosiniakowe: dla osob BEZ prawa do zasilku macierzynskiego (bezrobotni, studenci, umowy o dzielo, rolnicy)
- Zasilek macierzynski: dla osob UBEZPIECZONYCH w ZUS (umowa o prace, zlecenie z ubezpieczeniem, prowadzacy dzialalnosc)

JESLI masz umowe zlecenie BEZ dobrowolnego ubezpieczenia chorobowego -- masz prawo do kosiniakowego.
JESLI masz umowe zlecenie Z dobrowolnym ubezpieczeniem chorobowym -- masz prawo do zasilku macierzynskiego (wieksze pieniadze).

Kosiniakowe nie przyslugi osobom pobierajacym zasilek dla bezrobotnych.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/swiadczenie-rodzicielskie -- pobrano 2026-05-13',
  },

  'ulga-prorodzinna': {
    formularzOpis: `
Formularz PIT/O -- zalacznik do PIT-36 lub PIT-37 (rozliczenie roczne).
Dostepny na podatki.gov.pl lub w uslugach podatki.gov.pl (e-PIT).

POLA W PIT/O dotyczace ulgi na dziecko:
Czesc D -- Ulga na dzieci:
- Kolumna A: PESEL dziecka
- Kolumna B: Imie i nazwisko dziecka
- Kolumna C: Liczba miesiecy, w ktorych korzystalo sie z ulgi (max. 12)
- Kolumna D: Kwota odliczenia

KWOTY ULGI (za 2025, wykazywane w PIT za 2025):
- Na 1 dziecko: 1112,04 PLN rocznie (92,67 PLN/mies.)
- Na 2 dzieci: lacznie 2224,08 PLN (po 1112,04 na kazde)
- Na 3. dziecko: 2000,04 PLN rocznie (166,67 PLN/mies.)
- Na 4. i kolejne dziecko: 2700 PLN rocznie (225 PLN/mies.)
- Na pierwsze dziecko: tylko przy dochodzie powyzej 56.000 PLN (jeden rodzic) lub 112.000 PLN (malzenstwo)

PRZY OPIECE NAPRZEMIENNEJ: kazdy rodzic odlicza polowe ulgi.
JESLI ULGA WIEKSZE OD PODATKU: nadwyzke mozna odliczyc od skladek ZUS/NFZ (do wysokosci faktycznie zaplaconych).
`,
    szczegolyKwalifikacji: `
Ulga na dziecko NIE przyslugi:
- Jesli dziecko ukonczylo 18 lat i nie studiuje
- Jesli dziecko studiuje, ale ukonczylo 25 lat
- Jesli dziecko wstapilo w zwiazek malzenski
- Jesli pelnoletnie dziecko mialo przychody powyżej 19.061,28 PLN (kwota wolna od podatku)

Przy JEDNYM dziecku: ulga tylko jesli dochod wnioskodawcy przekracza 56.000 PLN (lub lacznie malzenstwa 112.000 PLN). Jesli masz nizszy dochod z jednym dzieckiem -- ulga nie przyslugi.

Przy dwojgu i wiecej dzieci: brak limitu dochodowego.
`,
    faq: `
P: Dziecko ukonczylo 25 lat w maju -- czy mam ulge za styczen-kwiecien?
O: TAK, za miesiace od stycznia do maja (5 miesiecy). Podajesz 5 w polu "liczba miesiecy".

P: Gdzie wykazac nadwyzke ulgi nad podatkiem?
O: W PIT-36 lub PIT-37 -- pole "Kwota do odliczenia od skladki zdrowotnej". Nie mozna stracic nadwyzki -- zawsze mozna cos odzyskac.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-na-dzieci/ -- pobrano 2026-05-13',
  },

  // ---- NIEPELNOSPRAWNOSC ----

  'swiadczenie-wspierajace': {
    formularzOpis: `
Formularz SWP -- wniosek o swiadczenie wspierajace.
Sklada sie elektronicznie przez PUE ZUS, portal Empatia lub w oddziale ZUS.

KROK 1: Uzyskanie decyzji ustalajace poziom potrzeby wsparcia.
Wniosek o ustalenie poziomu wsparcia sklada sie do WOJEWODZKIEGO ZESPOLU ds. Orzekania o Niepelnosprawnosci (WZON).
Formularz WZON: imie, nazwisko, PESEL, adres, dokumentacja medyczna.
Wynik: poziom potrzeby wsparcia w skali 70-100 punktow.

KROK 2: Wniosek o swiadczenie do ZUS (formularz SWP):
- Dane wnioskodawcy: imie, nazwisko, PESEL, adres, konto bankowe
- Numer decyzji WZON okreslajacy poziom potrzeby wsparcia
- Oswiadczenie o niekorzystaniu z zasilku pielegnacyjnego lub swiadczenia pielegnacyjnego jednoczesnie

POZIOMY I KWOTY (2026):
- 95-100 pkt: 3495,84 PLN
- 90-94 pkt: 2621,88 PLN
- 85-89 pkt: 1747,92 PLN
- 80-84 pkt: 1310,94 PLN
- 75-79 pkt: 873,96 PLN
- 70-74 pkt: 436,98 PLN
`,
    szczegolyKwalifikacji: `
Swiadczenie wspierajace jest NOWE (od 2024 r.) i ZASTEPUJE stopniowo zasilek pielegnacyjny dla doroslych.

KLUCZOWE ROZNICE:
- Swiadczenie wspierajace: dla DOROSLOSCI (18+), wyplata ZUS bezposrednio do osoby niepelnosprawnej
- Zasilek pielegnacyjny: dla dzieci i doroslych, wyplaca gmina/MOPS, nizsza kwota (215,84 PLN)

HARMONOGRAM WDRAZANIA:
- 2024: osoby z decyzja na poziomie 87-100 pkt
- 2025: osoby z decyzja 78-86 pkt
- 2026: osoby z decyzja 70-77 pkt

Warunek: osoba musi samodzielnie zarzadzac swiadczeniem (lub przez opiekuna prawnego).
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/swiadczenie-wspierajace -- pobrano 2026-05-13',
  },

  // ---- EKOLOGIA ----

  'bon-energetyczny': {
    formularzOpis: `
Wniosek o bon energetyczny -- sklada sie w gminie (urzad gminy lub MOPS) do 30 wrzesnia 2025.
UWAGA: nabor na bon energetyczny 2025 jest zamkniety. Kolejny nabor planowany na polowe 2026 (jesli program bedzie kontynuowany).

Pola wniosku:
- Dane wnioskodawcy: imie, nazwisko, PESEL, adres zameldowania
- Dane czlonkow gospodarstwa domowego (wszyscy mieszkajacy pod tym samym adresem)
- Rodzaj zrodla ogrzewania (pradu, gaz, biomasa, etc.) -- musi byc w centralnej ewidencji
- Kryterium dochodowe: dochod za 2024 rok (rok poprzedni), zaswiadczenie z US lub ZUS
- Numer konta bankowego do wyplaty

KWOTY:
- Jednoosobowe: 300 PLN (lub 600 PLN jesli zrodlo ogrzewania w CEEB)
- 2-3 osoby: 400 PLN (lub 800 PLN)
- 4-5 osob: 500 PLN (lub 1000 PLN)
- 6 i wiecej: 600 PLN (lub 1200 PLN)
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe (za 2024):
- Jednoosobowe: do 2500 PLN netto miesiecznie
- Wieloosobowe: do 1700 PLN netto na osobe miesiecznie

WYZSZE KWOTY (2x) sa dla gospodarstw gdzie zrodlem ogrzewania jest: pompa ciepla, kociol na pelet drzewny klasy 5, kociol gazowy kondensacyjny, kolektor sloneczny lub ogniwo fotowoltaiczne. Musi byc wpisane do CEEB (Centralna Ewidencja Emisyjnosci Budynkow).
`,
    zrodlo: 'https://www.gov.pl/web/klimat/bon-energetyczny -- pobrano 2026-05-13',
  },

  'czyste-powietrze': {
    formularzOpis: `
Wniosek o dofinansowanie sklada sie:
1. ELEKTRONICZNIE: przez portal czystepowietrze.gov.pl
2. W WFOSIGW (Wojewodzki Fundusz Ochrony Srodowiska i Gospodarki Wodnej) -- papierowo
3. Przez Gminy partnerskie -- gmina pomaga wypelnic wniosek

POLA WNIOSKU (wersja podstawowa):
- Dane wnioskodawcy: imie, nazwisko, PESEL, adres budynku (nie musi byc adresem zameldowania)
- Numer dzialki i numer ksiegi wieczystej
- Dane o budynku: rok budowy, powierzchnia ogrzewana, obecne zrodlo ciepla (do wymiany)
- Planowane prace: nowe zrodlo ciepla (pompa ciepla, kociol gazowy, etc.), ocieplenie, okna, etc.
- Dochod: PIT za rok poprzedni lub zaswiadczenie ze gminy (dla najnizszych dochodow)
- Kosztorys: oferty od wykonawcow lub faktury (jesli juz realizowane -- dofinanasowanie ex-post tez mozliwe)
`,
    szczegolyKwalifikacji: `
TRZY POZIOMY DOFINANSOWANIA (2025/2026):
1. Podstawowy (dochod do 135.000 PLN rocznie): do 66.000 PLN dofinansowania, 30-45% kosztow
2. Podwyzszony (dochod na osobe do 1894 PLN/mies lub mniej): do 99.000 PLN, do 60% kosztow
3. Najwyzszy (dochod na osobe do 1090 PLN/mies lub KDR z 3 dziecmi): do 135.000 PLN, do 90% kosztow

Mozna finansowac: wymiane kotla (na pompe, kociol gazowy, pellety kl.5), ocieplenie scian/dachu, okna/drzwi, wentylacja z rekuperacja, panele fotowoltaiczne (tylko przy pompie ciepla).

NIE MOZNA finansowac: kotly wegane (nawet nowe), sciagi zewnetrzne bez wymiany kotla.
`,
    zrodlo: 'https://czystepowietrze.gov.pl -- pobrano 2026-05-13',
  },
};
