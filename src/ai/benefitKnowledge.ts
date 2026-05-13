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

  // ---- BATCH B ----

  'zasilek-dla-bezrobotnych': {
    formularzOpis: `
Wniosek o zasilek skladany osobiście w Powiatowym Urzedzie Pracy (PUP) w miejscu zameldowania lub zamieszkania.
Mozna tez przez portal praca.gov.pl (profil zaufany wymagany).

DOKUMENTY PRZY REJESTRACJI W PUP:
- Dowod osobisty lub paszport
- Swiadectwa pracy (oryginaly lub kopie potwierdzone przez pracodawce) -- za ostatnie 10 lat
- Dyplom ukonczenia szkoly lub uczelni (jesli brak stazu pracy)
- Dokumenty potwierdzajace inne okresy ubezpieczenia (zaswiadczenia z ZUS, KRUS)
- Zaswiadczenie z urzedu skarbowego o dochodach z dzialalnosci (jesli prowadzilo sie firme)

PRZY REJESTRACJI PRZEZ INTERNET (praca.gov.pl):
- Formularz PKK-01 wypelniany online
- Skany dokumentow (swiadectwa pracy, dyplom)
- Podpis profilem zaufanym

UWAGA: w ciagu 7 dni od rejestracji nalezy obowiazkowa wizyta w PUP (wezwanie wysyla PUP).
`,
    szczegolyKwalifikacji: `
Warunki do zasilku:
1. Rejestracja w PUP jako bezrobotny
2. Przepracowanie co najmniej 365 dni w ciagu 18 miesiecy przed zarejestrowaniem (na umowie o prace lub zlecenie z pelnym ZUS)
3. Utrata pracy z przyczyn lezacych po stronie pracodawcy LUB wyganieciem umowy na czas okreslony

UWAGA -- kiedy zasilek NIE przyslugi:
- Rozwiazanie umowy przez pracownika (chyba ze w trybie art. 55 KP - mobbing/zaleglosci)
- Zwolnienie dyscyplinarne (art. 52 KP)
- W ciagu 6 miesiecy przepracowanie mniej niz 365 dni

WYSOKOSC 2026:
- Podstawowy (do 5 lat stazu): 1361,37 PLN brutto
- Wyzszy (5-20 lat stazu): 1701,73 PLN brutto
- Najwyzszy (powyzej 20 lat): 2042,09 PLN brutto

OKRES POBIERANIA:
- 6 miesiecy na obszarach o stopie bezrobocia do 150% sredniej krajowej
- 12 miesiecy na obszarach o wyzszej stopie bezrobocia (mozna sprawdzic w PUP)
- Wydluzony do 12 mies: wiek 50+ i 20+ lat stazu, lub rodzic samotnie wychowujacy dziecko do lat 15
`,
    faq: `
P: Czy moge pobierac zasilek i jednoczesnie szukac pracy w innym miescie?
O: Tak, ale co miesiac musisz stawiac sie w PUP na wyznaczony dzien (aktywizacja). Niestawienie sie powoduje wykreslenie z listy.

P: Rozwiazalem umowe za porozumieniem stron -- czy dostane zasilek?
O: W wiekszosci przypadkow TAK, ale z 90-dniowym odroczeniem wyplaty. Zasilek zacznie sie po 90 dniach od rejestracji.

P: Czy zasilek dla bezrobotnych podlega podatkowi?
O: TAK, jest opodatkowany PIT i odprowadzana skladka zdrowotna.
`,
    zrodlo: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/swiadczenia-pieniezne/zasilek-dla-osob-bezrobotnych -- pobrano 2026-05-13',
  },

  'karta-duzej-rodziny': {
    formularzOpis: `
Wniosek o Karte Duzej Rodziny (KDR) -- przez portal Emp@tia (empatia.mpips.gov.pl) lub w gminie/urzedzie.

WNIOSEK ONLINE (Emp@tia):
1. Zaloguj sie profilem zaufanym
2. Wybierz "Karta Duzej Rodziny" --> "Zloz wniosek"
3. Wypelnij dane wszystkich czlonkow rodziny (imiona, PESEL, daty urodzenia)
4. Dla dzieci powyzej 18 lat -- dolacz zaswiadczenie ze szkoly/uczelni (do 25 roku zycia)
5. Karta wysylana jest automatycznie lub mozna wybrac karte fizyczna (za oplate 9,21 PLN za plastikowa karte)

POLA WNIOSKU:
- Dane malzonkow/rodzicow: imie, nazwisko, PESEL, adres
- Dane dzieci: imie, nazwisko, PESEL, data urodzenia, typ (biolog., adoptowane, w rodzinie zastepczej)
- Jesli dziecko niepelnosprawne: numer orzeczenia o niepelnosprawnosci (brak wiekowego limitu)

DOKUMENTY (rzadko potrzebne, system weryfikuje automatycznie z PESEL):
- Zaswiadczenie ze szkoly lub uczelni (dla dzieci 18-25 lat)
- Orzeczenie o niepelnosprawnosci (dla doroslych dzieci bez limitu wieku)
`,
    szczegolyKwalifikacji: `
Karta przyslugi rodzicom (lub opiekunom) z co najmniej 3 dzieci:
- Dzieci do 18 lat (bez kryterium dochodowego)
- Dzieci do 25 lat jesli sie ucza
- Dzieci niepelnosprawne bez limitu wieku
- Rodziny zastecze i adopcyjne rowniez sie kwalifikuja

ZBIOROWE RABATY 2026 -- przykladowe:
- PKP/PKS: 37% znizki (rodzice i male dzieci), 49% (dzieci do 18 lat)
- Muzea panstwowe: bezplatny wstep
- Parki narodowe: bezplatny wstep
- Apteki: rabaty na leki (nieobjete refundacja)
- Cinema City, Helios, Multikino: rabaty na bilety
- Petla benzyn, sklepy: rabaty u partnerow (lista na aplikacji Karta Duzej Rodziny)

Karta jest BEZPLATNA (wersja elektroniczna na tel. lub plastikowa za 9,21 PLN).
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/karta-duzej-rodziny-ogolne -- pobrano 2026-05-13',
  },

  'dobry-start': {
    formularzOpis: `
Wniosek o swiadczenie Dobry Start (300 PLN) -- wyacznie elektronicznie:
- PUE ZUS (pue.zus.pl)
- Bankowosc elektroniczna (wiekszosc bankow)
- Portal Empatia

TERMIN SKLADANIA: od 1 lipca do 30 listopada kazdego roku.
Wyplata: do 30 dni od zlozenia wniosku w lipcu/sierpniu, pozniej do 2 miesiecy.

POLA:
- Dane rodzica/opiekuna: imie, nazwisko, PESEL, numer konta bankowego
- Dane dziecka: imie, nazwisko, PESEL, rok szkolny do ktorego idzie
- Potwierdzenie, ze dziecko bedzie uczestniczylo w zajociach szkolnych w nowym roku szkolnym
`,
    szczegolyKwalifikacji: `
300 PLN raz w roku na kazde dziecko uczone sie w szkole (nie w przedszkolu ani zerowej).
Wiek: do ukonczenia 20 roku zycia, lub 24 lata jesli dziecko niepelnosprawne.
Brak kryterium dochodowego.

NIE PRZYSLUGI:
- Na dzieci w zerowej (roczne przygotowanie przedszkolne)
- Na studentow wyzszych uczelni
- Na dzieci w szkole dla doroslych (wieczorowkach) -- PRZYSLUGI jesli uczen ma < 20 lat

UWAGA: wniosek do 30 listopada -- po tym terminie prawa sie nie nabywa w tym roku szkolnym.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/dobry-start -- pobrano 2026-05-13',
  },

  'ulga-dla-mlodych': {
    formularzOpis: `
BRAK OSOBNEGO FORMULARZA -- ulga dziala automatycznie.
Pracodawca NIE pobiera zaliczki na PIT od wynagrodzenia osoby do 26 lat (do limitu 85.528 PLN rocznie).

Przy rocznym rozliczeniu (PIT-36 lub PIT-37):
- W polu "Przychody zwolnione od podatku na podstawie art. 21" wpisuje sie przychody z pracy do limitu
- e-PIT (usuga podatki.gov.pl) wypelnia to automatycznie na podstawie danych od pracodawcy

JESLI MASZ KILKU PRACODAWCOW: kazdy aplikuje ulge osobno, mozna przekroczyc limit.
Przy przekroczeniu 85.528 PLN -- trzeba doplaci podatek w rocznym PIT.
`,
    szczegolyKwalifikacji: `
Ulga dla mlodych (art. 21 ust. 1 pkt 148 ustawy PIT):
- Dotyczy: umowy o prace, umowy zlecenie, staze uczniowskie, praktyki absolwenckie
- NIE dotyczy: dzialalnosci gospodarczej, umow o dzielo, najmu, kapitalow

Limit 2026: 85.528 PLN rocznie.
Zwolnione sa: podatek PIT (17%/32%).
NIE sa zwolnione: skladki ZUS i NFZ (nadal pobierane).

Przy ukonczeniu 26 lat w trakcie roku: ulga obowiazuje za miesiace przed urodzinami.
Pracodawca automatycznie przestaje stosowac ulge od miesiaca, w ktorym pracownik konczy 26 lat.
`,
    faq: `
P: Mam 25 lat i pracuje na B2B -- czy dostane ulge?
O: NIE. Ulga dla mlodych dotyczy wylacznie umow o prace i zlecenie, nie dzialalnosci gospodarczej.

P: Zarabiam 90.000 PLN rocznie i mam 24 lata -- ile zaplace podatku?
O: Od 85.528 PLN: 0 PLN podatku. Od nadwyzki 4.472 PLN: 12% = ok. 536 PLN.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-dla-mlodych/ -- pobrano 2026-05-13',
  },

  'wspolne-rozliczenie': {
    formularzOpis: `
WSPOLNE ROZLICZENIE MALZONKOW -- w PIT-36 lub PIT-37 zaznacza sie opcje "Wspolne rozliczenie malzonkow".

POLA DO WYPELNIENIA:
- Dane obojga malzonkow: imie, nazwisko, PESEL
- Przychody kazdego z malzonkow osobno (w odpowiednich rubrykach)
- Ulgi i odliczenia (laczone)
- Podpisy obojga malzonkow (w e-PIT: autoryzacja profilem zaufanym lub danymi z zeznania)

KIEDY SIE OPLACA:
- Gdy jedno z malzonkow zarabia znacznie wiecej niz drugie (duza roznica dochodow)
- Gdy jedno z malzonkow nie osiaga zadnych dochodow lub ma bardzo niskie dochody
- Gdy malzonkowie razem mieszcza sie w 12% progu (do 120.000 PLN lacznie)
`,
    szczegolyKwalifikacji: `
Warunki wspolnego rozliczenia:
- Zwiazek malzenski przez caly rok podatkowy (lub od slubu do konca roku, przy slubie w ciagu roku)
- Brak wspolnoty majatkowej nie przeszkadza (ale musi byc zwiazek malzenski)
- Oboje musza miec nieograniczony obowiazek podatkowy w Polsce
- Jedno z malzonkow moze byc na ryczalcie -- ALE tylko pod warunkiem ze tylko z najmu

MECHANIZM:
Lacza sie dochody, dziela na pol, od kazdej polowy liczy sie podatek, mnozy x 2.
Efekt: jesli jedno zarabia 0, a drugie 200.000 PLN -- podatek jak od dwojga po 100.000 PLN (tylko 12% zamiast 32% od nadwyzki).

Mozna rozliczac sie wspolnie rowniez jako:
- Wdowiec/wdowa: jesli malzonek zmarl w trakcie roku podatkowego
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ -- pobrano 2026-05-13',
  },

  'opp-1-5-procent': {
    formularzOpis: `
1,5% PODATKU DLA OPP -- brak osobnego formularza.
W PIT-36 lub PIT-37 (lub e-PIT) wypelnia sie pole "Wniosek o przekazanie 1,5% podatku naleznego":
- Numer KRS wybranej Organizacji Pozytku Publicznego (OPP)
- Kwota: system oblicza automatycznie (1,5% podatku naleznego)
- Opcjonalnie: cel szczegolowy (np. imie podopiecznego lub konkretny projekt)
- Opcjonalnie: zgoda na udostepnienie danych OPP (imie, nazwisko, kwota)

WAZNE: mozna podac wylacznie OPP ktora ma status OPP nadany przez sad. Lista na podatki.gov.pl.
`,
    szczegolyKwalifikacji: `
1,5% nie zmniejsza TWOJEGO zobowiazania podatkowego -- to pieniadze ktore i tak trafi do budzetu, a ty decydujesz gdzie.
Jesli zaplaciles za duzy podatek w ciagu roku (zaliczki), US zwraca nadplate + przekazuje 1,5% wybranej OPP.

Termin zlozenia wniosku: do 30 KWETNIA (razem z PIT). Po tym terminie nie mozna wskazac OPP na dany rok.

Jesli zloze wniosek po terminie (korekta PIT): 1,5% przepada na budzet.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/1-5-procent/ -- pobrano 2026-05-13',
  },

  'ulga-termomodernizacyjna': {
    formularzOpis: `
Formularz PIT/O -- zalacznik do PIT-36 lub PIT-37.
Czesc B.1 -- Ulga termomodernizacyjna:
- Kwota wydatkow na termomodernizacje (maksymalnie 53.000 PLN na podatnika)
- Typ wydatkow: ocieplenie, wymiana okien, nowe zrodlo ciepla (pompa ciepla, kociol gazowy, etc.), panele fotowoltaiczne

DOKUMENTY DO ZACHOWANIA (nie dolacza sie do PIT, ale trzeba miec na wezwanie US):
- Faktury VAT od wykonawcow (musza zawierac NIP wykonawcy, opis roboty)
- Umowy z wykonawcami

UWAGA: trzeba byc WLASCICIELEM lub WSPOLWLASCICIELEM budynku jednorodzinnego.
Najem lub spoldzielcze lokatorskie prawo do lokalu: ulga NIE przyslugi.
`,
    szczegolyKwalifikacji: `
Limit: 53.000 PLN na podatnika (jezeli malzenstwo rozlicza sie wspolnie, kazdy ma limit 53.000 PLN = 106.000 PLN lacznie).

Mozna odliczac wydatki na:
- Ocieplenie scian, stropow, dachow
- Wymiane okien, drzwi zewnetrznych
- Nowe zrodlo ciepla (pompa ciepla, kociol gazowy/olejowy klasy 5, kociol na pelet klasy 5, ogrzewanie elektryczne)
- Panele fotowoltaiczne
- Wentylacja mechaniczna z odzyskiem ciepla

NIE mozna odliczac:
- Remontu (tynkowanie, malowanie) bez zwiazku z termomodernizacja
- Kotlow weglowych (nawet nowych)

Ulga moze byc rozliczana przez kilka lat, jesli nie zmiesci sie w jednym roku (nie ma terminu wyczerpania).
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-termomodernizacyjna/ -- pobrano 2026-05-13',
  },

  'ulga-rehabilitacyjna': {
    formularzOpis: `
Formularz PIT/O -- zalacznik do PIT-36 lub PIT-37.
Czesc B -- Inne odliczenia, pozycja: "Wydatki na cele rehabilitacyjne".

KATEGORIE WYDATKOW (wybrane najwazniejsze):
A) Limitowane (max 2280 PLN rocznie):
- Leki (powyzej 100 PLN/mies. -- odlicza sie nadwyzke powyzej 100 PLN)
- Uzytkowanie samochodu osobowego do celow rehabilitacyjnych
- Kolonie i obozy dla dzieci niepelnosprawnych

B) Nielimitowane (cala kwota):
- Zakup i naprawa sprzetu rehabilitacyjnego (wzki, lozka, aparaty sluchowe)
- Odpoczatek i kuracje rehabilitacyjne (turnusy rehabilitacyjne)
- Dofinansowanie do protezy, ortezy, wozka
- Adaptacja mieszkania na potrzeby niepelnosprawnosci (podjazd, uchwyt)
- Tlumacz jezyka migowego

DOKUMENTY: faktury VAT ze swoim imieniem i nazwiskiem (lub PESEL). Dla lekow -- recepta + paragon (urzad skarbowy akceptuje paragon jesli mamy recepte).
`,
    szczegolyKwalifikacji: `
Ulga przyslugi:
- Osobie z orzeczeniem o niepelnosprawnosci (lub rencie z tytulu niezdolnosci do pracy)
- Podatnikowi, ktory utrzymuje finansowo osobe niepelnosprawna (malzonek, dzieci, rodzice, rodzenstwo) pod warunkiem ze roczny dochod tej osoby nie przekracza 19.061,28 PLN

Przy lekach: odlicza sie tylko nadwyzke ponad 100 PLN MIESIECZNE (jesli w danym miesiacu wydales 80 PLN -- nic nie odliczasz; jesli 250 PLN -- odliczasz 150 PLN).

Samochod: ryczalt 2280 PLN rocznie (bez potrzeby zbierania paragonow za paliwo), pod warunkiem ze auto uzywane jest do rehabilitacji lub leczenia.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-rehabilitacyjna/ -- pobrano 2026-05-13',
  },

  'ulga-internetowa': {
    formularzOpis: `
Formularz PIT/O -- czesc B -- "Wydatki z tytulu uzytkowania sieci Internet".
Limit: 760 PLN rocznie (staly, nie zmieniany od lat).

DOKUMENTY: faktury za internet od dostawcy (imie/nazwisko lub PESEL podatnika musi byc na fakturze).
Przy faktuurze na malzonka/rodzica -- trudniej udowodnic prawo do odliczenia. Lepiej miec umowe na siebie.

UWAGA: ulge mozna stosowac tylko przez 2 KOLEJNE lata podatkowe (nie musi byc bez przerwy -- chodzi o 2 lata korzystania z ulgi lacznie). Nie mozna uzywac ulgi co roku bez ograniczen.
`,
    szczegolyKwalifikacji: `
Ograniczenie "2 kolejne lata" -- interpretacja:
Mozna skorzystac z ulgi internetowej lacznie przez 2 lata podatkowe. Jesli w 2020 i 2021 juz z niej skorzystales -- w 2022 juz nie mozesz. Ale jesli skorzystales tylko w 2021 -- mozesz jeszcze w jednym roku.

Warto sprawdzic PIT z lat ubieglych czy ulga byla stosowana.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-na-internet/ -- pobrano 2026-05-13',
  },

  'ulga-ikze': {
    formularzOpis: `
Formularz PIT/O -- czesc B -- "Wplaty na Indywidualne Konto Zabezpieczenia Emerytalnego (IKZE)".

POLA:
- Kwota wplacona na IKZE w roku podatkowym (potwierdzona przez instytucje finansowa)
- Limit odliczenia: 9.388,80 PLN w 2025 (lub 14.083,20 PLN dla prowadzacych DG)

DOKUMENT: PIT-11A lub zaswiadczenie z banku/towarzystwa funduszy o wysokosci wplat na IKZE.
`,
    szczegolyKwalifikacji: `
IKZE vs. IKE:
- IKZE: wplaty odlicza sie od dochodu TERAZ (oszczednosc podatkowa), przy wyplacie po 65. roku zycia placi sie 10% podatku zryczaltowanego
- IKE: brak odliczenia na wejsciu, wyplata po 60 latach CALKOWICIE zwolniona z podatku

Limit wplat IKZE 2026: 9.388,80 PLN (pracownicy/zleceniobiorcy), 14.083,20 PLN (prowadzacy DG).
Limit IKE 2026: 23.472 PLN.

Mozna miec jednoczesnie IKE i IKZE (i PPK i PPE).
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ -- pobrano 2026-05-13',
  },

  'ulga-na-start': {
    formularzOpis: `
ULGA NA START -- brak osobnego formularza, dziala automatycznie przez pierwsze 6 miesiecy dzialalnosci.

Przy rejestracji DG w CEIDG: domyslnie stosuje sie ulge na start.
Rejestracja ubezpieczenia: tylko ZUS ZZA (ubezpieczenie zdrowotne), BEZ spolecznych.

PRZY PRZEJSCIU NA PREFERENCYJNY ZUS (po 6 mies.):
- Formularz ZUS ZUA -- zgloszenie do ubezpieczen spolecznych na preferencyjnych skladkach
- Termin: w ciagu 7 dni od zakonczenia 6-miesecznego okresu ulgi na start

UWAGA: dlugosc okresu ulgi na start liczy sie w MIESIACACH od dnia rozpoczecia dzialalnosci, nie od rejestracji w CEIDG.
`,
    szczegolyKwalifikacji: `
Ulga na start -- 6 pelnych miesiecy calendarowych od rozpoczecia dzialalnosci:
- Brak skladek spolecznych ZUS (emerytalnej, rentowej, wypadkowej, chorobowej)
- Tylko skladka zdrowotna (9% dochodu, min. 381,78 PLN w 2026)
- Brak ubezpieczenia chorobowego = brak prawa do zasilku chorobowego i macierzynskiego

Po 6 mies.: przejscie na preferencyjny ZUS (nizsze skladki przez kolejne 24 miesiace).

Ulga NIE przyslugi jesli:
- Przynajmniej w ciagu ostatnich 60 miesiecy prowadzilo sie DG
- Nowa DG jest swiadczeniem uslug na rzecz bylego pracodawcy (w tym samym zakresie)
`,
    zrodlo: 'https://www.biznes.gov.pl/pl/portal/00271 -- pobrano 2026-05-13',
  },

  'preferencyjny-zus': {
    formularzOpis: `
Formularz ZUS ZUA -- zgloszenie do ubezpieczen spolecznych (preferencyjne skladki).
Sklada sie w ZUS (oddzial, PUE ZUS) w ciagu 7 dni od rozpoczecia preferencyjnego okresu.

POLA ZUS ZUA:
- Dane platnika (przedsiebiorcy): NIP, REGON, imie, nazwisko, PESEL, adres
- Kod tytulu ubezpieczenia: 05 70 (preferencyjny ZUS -- pierwszy)
- Daty ubezpieczenia: od kiedy stosuje sie preferencyjne skladki
- Wymiar ubezpieczenia: pelne ubezpieczenie spoleczne

Dodatkowo ZUS DRA -- deklaracja rozliczeniowa: skladana co miesiac do 20. dnia kolejnego miesiaca.
`,
    szczegolyKwalifikacji: `
PREFERENCYJNY ZUS -- przez 24 miesiace (po 6 mies. ulgi na start LUB od razu po zarejestrowaniu DG jesli nie korzystalo sie z ulgi na start):

Podstawa wymiaru 2026: 1272 PLN (30% minimalnego wynagrodzenia)
Skladki przyblizone (2026):
- Emerytalna 19,52%: 248,39 PLN
- Rentowa 8%: 101,76 PLN
- Chorobowa 2,45% (dobrowolna): 31,16 PLN
- Wypadkowa 1,67%: 21,24 PLN
- Zdrowotna: 9% dochodu (min. 381,78 PLN)

Po 24 mies.: pelny ZUS (podstawa = 60% przecietnego wynagrodzenia, ok. 2547 PLN w 2026 --> skladki ~1400 PLN/mies).
Mozliwosci dalej: Maly ZUS Plus (jesli przychod do 120.000 PLN rocznie).
`,
    zrodlo: 'https://www.biznes.gov.pl/pl/portal/00126 -- pobrano 2026-05-13',
  },

  'maly-zus-plus': {
    formularzOpis: `
Formularz ZUS DRA czesc II lub ZUS RCA czesc II -- deklaracja przy skladaniu miesiecznej rozliczenia.
Rejestracja: formularz ZUS ZUA z kodem tytulu ubezpieczenia 05 90 (Maly ZUS Plus).

TERMIN REJESTRACJI: w ciagu 7 dni od 1 lutego (Maly ZUS Plus mozna stosowac od 1 stycznia, ale zgloszenie musi byc do 8 lutego).
Mozna tez przystapic po zakonczeniu preferencyjnego ZUS.

DOKUMENTY:
- Ewidencja przychodow za poprzedni rok (lub KPiR)
- Obliczenie podstawy: (roczny przychod / 365 * 30 * 0.5), min. 1272 PLN, max. 60% przecietnego wynagrodzenia
`,
    szczegolyKwalifikacji: `
Warunek: roczny przychod z DG za poprzedni rok nie wiekszy niz 120.000 PLN.

MALY ZUS PLUS -- podstawa wymiaru:
= (roczny przychod / liczba dni DG) x 30 x 0.5
Przyklad: przychod 60.000 PLN, pelny rok (365 dni):
= (60.000/365) x 30 x 0.5 = 2465 PLN podstawa
Skladki od 2465 PLN (nizsze niz pelny ZUS, wyzsze niz preferencyjny).

Limit: max 5 lat stosowania Malego ZUS Plus (niekoniecznie kolejnych).
Jesli w jednym roku przychod przekroczy 120.000 PLN -- w nastepnym wychodzi sie z Malego ZUS Plus.

Uwaga: Maly ZUS Plus nie dotyczy skladki zdrowotnej (ona jest od dochodu, osobno).
`,
    zrodlo: 'https://www.zus.pl/firmy/przedsiebiorco-to-ciebie-dotyczy/maly-zus-plus -- pobrano 2026-05-13',
  },

  'emerytura-rolnicza': {
    formularzOpis: `
Formularz KRUS SR-20 -- wniosek o emeryture rolnicza.
Sklada sie w oddziale KRUS wlasciwym dla miejsca zamieszkania.

POLA:
- Dane wnioskodawcy: imie, nazwisko, PESEL, numer ewidencyjny KRUS, adres
- Okresy ubezpieczenia rolniczego: daty od-do, nazwy gospodarstw
- Ewentualne okresy ubezpieczenia w ZUS (sumowane z KRUS przy ustalaniu stazu)
- Konto bankowe do wyplaty
- Oswiadczenie o zaprzestaniu (lub niezaprzestaniu) prowadzenia dzialalnosci rolniczej

DOKUMENTY:
- Dowod osobisty
- Zaswiadczenia o pracy w rolnictwie (z KRUS lub zaswiadczenia z gmin)
- Zaswiadczenie z ZUS o ewentualnych okresach ubezpieczenia spolecznego
- Dokumenty dot. dzialalnosci rolniczej (akt wlasnosci gruntu, dzierzawa)
`,
    szczegolyKwalifikacji: `
Wiek emerytalny KRUS 2026:
- Kobiety: 60 lat
- Mezczyzni: 65 lat

Wymagany staz ubezpieczenia rolniczego: 25 lat (latami ubezpieczenia lacznie z ZUS).

Emerytura rolnicza sklada sie z:
1. Czesc skladkowa: 1% emerytury podstawowej za kazdy rok ubezpieczenia (1780,64 PLN x 1%)
2. Czesc uzupelniajaca: do 95% emerytury podstawowej

Minimalna emerytura rolnicza (2026): 1978,49 PLN brutto.

WAZNE: jesli rolnik prowadzi dzialalnosc rolnicza po osiagnieciu wieku emerytalnego -- moze pobierac emeryture, ale czesc uzupelniajaca moze byc zawieszona.
`,
    zrodlo: 'https://www.gov.pl/web/krus/waloryzacja-emerytur-i-rent-rolniczych-od-1-marca-2026-r -- pobrano 2026-05-13',
  },

  'stypendium-socjalne': {
    formularzOpis: `
Wniosek o stypendium socjalne -- sklada sie na uczelni (dziekanat lub system USOS/wirtualna uczelnia).
Formularz jest UCZELNIANY (kazda uczelnia ma wlasny), ale pola sa podobne.

TYPOWE POLA:
- Dane studenta: imie, nazwisko, PESEL, numer albumu, adres zamieszkania
- Sklad rodziny: wszystkie osoby we wspolnym gospodarstwie domowym (imiona, stopien pokrewienstwa)
- Dochody kazdego czlonka rodziny: ze wszystkich zrodel za poprzedni rok rozliczeniowy
- Konto bankowe studenta

DOKUMENTY:
- Zaswiadczenia o dochodach (PIT, zaswiadczenie z ZUS o emeryturze, zaswiadczenie z US)
- Przy utracie dochodu: swiadectwo pracy, decyzja PUP o zasilku
- Zaswiadczenie ze szkoly dla niepelnoletniego rodzenstwa
- Jesli student samodzielnie finansowo: oswiadczenie + dokumentacja (trudniejsze do udowodnienia)
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe na 2025/2026: ustalone przez uczelnie, zwykle 1294-1600 PLN netto na osobe w rodzinie.
Kazda uczelnia SAMA ustala prog (w granicach ustawy Prawo o szkolnictwie wyzszym).
Sprawdz progi na stronie swojej uczelni.

Przy dochodzie od 0 do 50% progu: mozna wnioskac o stypendium socjalne w zwiekszonej wysokosci (jesli student mieszka poza miejscem zamieszkania rodzicow).

Stypendium moze byc laczone z: stypendium rektora, stypendium ministra, zapomoga.
NIE MOZE byc laczone z: jednolitym stypendium socjalnym z innej uczelni (nie mozna pobierac z dwoch uczelni jednoczesnie).

Termin skladania: zwykle wrzesien-pazdziernik na nowy rok akademicki. Sprawdz harmonogram swojej uczelni.
`,
    zrodlo: 'https://www.gov.pl/web/nauka/swiadczenia-dla-studentow-w-roku-akademickim-2025-2026 -- pobrano 2026-05-13',
  },

  'refundacja-okularow-nfz': {
    formularzOpis: `
Wniosek o refundacje wyrobu medycznego (okulary korekcyjne) -- sklada sie u OPTYKA po zakupie okularow.
To optyk wystawia zlecenie na wyrob medyczny i wysyla rozliczenie do NFZ.

PROCEDURA:
1. Wizyta u okulisty (lub optometrysty uprawnionego do wystawiania zlecen)
2. Lekarz/optometrysta wystawia zlecenie na wyrob medyczny (elektronicznie -- ePUAP lub NFZ)
3. Udaj sie do optyka MAJACEGO UMOWE Z NFZ (sprawdz na nfz.gov.pl --> znajdz swiadczeniodawce)
4. Optyk realizuje zlecenie i wystawia fakture
5. NFZ refunduje cześć kosztow bezposrednio optykowi (pacjent placi tylko doplata)

WAZNE: jesli poidziesz do optyka BEZ umowy z NFZ, pieniadze stracisz. Sprawdz liste kontraktowanych punktow.
`,
    szczegolyKwalifikacji: `
Limity refundacji NFZ (2026):
- Szka korekcyjne dla doroslych: do 70 PLN za jedna szke (140 PLN za komplet)
- Oprawki dla doroslych: do 50 PLN
- Dla dzieci do 16 lat: wyzsze limity (soczewki 120 PLN, oprawki 80 PLN)
- Soczewki kontaktowe: do 280 PLN rocznie (tylko przy wskazaniach medycznych)

Czestotliwosc: dorosli -- nowe zlecenie co 2 lata (przy pogorszeniu wzroku mozna szybciej).

Badanie okulistyczne NFZ: bezplatne (jako swiadczenie gwarantowane przy skierowaniu od lekarza POZ lub bez skierowania przy jednym bezplatnym badaniu rocznie u okulisty).
`,
    zrodlo: 'https://www.nfz.gov.pl/dla-pacjenta/wyroby-medyczne/ -- pobrano 2026-05-13',
  },

  'karta-ekuz': {
    formularzOpis: `
Wniosek o EKUZ (Europejska Karta Ubezpieczenia Zdrowotnego) -- przez internet na pacjent.gov.pl.
LUB: oddzial NFZ wlasciwy dla miejsca zamieszkania.

WNIOSEK ONLINE (pacjent.gov.pl):
1. Zaloguj sie profilem zaufanym
2. Wybierz "EKUZ"
3. Wypelnij: dane osobowe, cel wyjazdu (turystyczny/zawodowy/studyjny)
4. Karta wysylana pocztą na adres zamieszkania w ciagu 5-7 dni roboczych (lub odbiór osobisty w NFZ)

UWAGA: mozesz tez pobrac TYMCZASOWY ZASWIADCZENIE ZASTEPUJACE EKUZ (PDA) -- do wydruku, wazne 14 dni.
`,
    szczegolyKwalifikacji: `
EKUZ uprawnia do niezbednej pomocy medycznej w krajach EU/EOG/Szwajcarii na takich samych warunkach jak obywatel danego kraju.

NIE OBEJMUJE:
- Leczenia planowego (czyli celowo jadac na operacje za granice)
- Leczenia prywatnego (tylko publiczna sluzba zdrowia w danym kraju)
- Transportu powrotnego do Polski (to ubezpieczenie turystyczne)

WAZNOSC: zwykle 2 lata. Po wygasnieciu mozna odnowic bezplatnie (bez limitu odnowen).

UWAGA: EKUZ to nie ubezpieczenie turystyczne. Na wyjazdy wakacyjne zaleca sie rowniez wykupienie ubezpieczenia turystycznego (m.in. na transport medyczny powrotny).
`,
    zrodlo: 'https://pacjent.gov.pl/ekuz -- pobrano 2026-05-13',
  },

  // ---- BATCH C ----

  'stypendium-rektora': {
    formularzOpis: `
Wniosek o stypendium rektora -- sklada sie na uczelni (dziekanat lub system USOS/wirtualna uczelnia).
Formularz uczelniany. Termin: zwykle pazdziernik (sprawdz harmonogram swojej uczelni).

DOKUMENTY:
- Zaswiadczenia o osiagnieciach naukowych (publikacje, patenty, nagrody naukowe)
- Zaswiadczenia o osiagnieciach artystycznych (nagrody, wystawy, spektakle)
- Dokumenty potwierdzajace osiagniecia sportowe (co najmniej medal mistrzostw Polski)
- Srednia ocen za poprzedni rok akademicki (lub semestr) -- zwykle wyciagana z USOS automatycznie
`,
    szczegolyKwalifikacji: `
Stypendium rektora przyznawane najlepszym studentom (zwykle top 10% studentow na kierunku):
- Kryterium naukowe: wysokie osiagniecia naukowe (publikacje, udział w konferencjach, nagrody)
- Kryterium artystyczne: wybitne osiagniecia artystyczne potwierdzone konkursami/nagrodami
- Kryterium sportowe: minimum medal mistrzostw Polski (seniorzy lub juniorzy)
- Srednia ocen: dobra srednia, ale sama srednia nie wystarczy -- potrzebne osiagniecia

Brak kryterium dochodowego.
Mozna laczyc ze stypendium socjalnym.
Na I roku: nie mozna ubiegac sie (brak ocen z poprzedniego roku).
`,
    zrodlo: 'https://www.gov.pl/web/nauka/swiadczenia-dla-studentow-w-roku-akademickim-2025-2026 -- pobrano 2026-05-13',
  },

  'stypendium-szkolne': {
    formularzOpis: `
Wniosek o stypendium szkolne -- sklada sie w urzedzie gminy lub MOPS w ciagu 15 dni od poczatku roku szkolnego.
Formularz gminny (rozny w kazdej gminie).

TYPOWE POLA:
- Dane ucznia: imie, nazwisko, PESEL, klasa, szkola
- Dane rodzicow/opiekunow: imie, nazwisko, PESEL, adres
- Sklad rodziny: wszyscy zamieszkali wspolnie
- Dochody netto: ze wszystkich zrodel, za ostatni miesiac przed zlozeniem wniosku
- Podpis rodzica/opiekuna lub pelnoletni ucznia

TERMIN: do 15 wrzesnia (rok szkolny 1 wrzesnia - 31 sierpnia).
Wyjatek: stypendium na semestr zimowy mozna zlozyc do 15 wrzesnia, na letni do 15 lutego.
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe: 600 PLN netto na osobe w rodzinie miesiecznie (tak jak przy zasilku rodzinnym).

Stypendium szkolne przeznaczone na:
- Zakup podreczinikow, pizornikow, materialy edukacyjne
- Oplaaty za zajeecia pozaszkolne (muzyczna szkola, jezyki obce)
- Komputer/tablet do nauki (przy odpowiednim udokumentowaniu)
- Stroj sportowy na WF

Forma wyplaty: zwykle REFUNDACJA faktur/paragonow (nie gotowka). Trzeba zbierac dokumenty zakupow.
Niektore gminy wyplacaja jako zapomoga pieniezna lub bony towarowe.
`,
    zrodlo: 'https://www.gov.pl/web/edukacja/stypendium-szkolne-oraz-zasilek-szkolny -- pobrano 2026-05-13',
  },

  'zasilek-szkolny': {
    formularzOpis: `
Wniosek o zasilek szkolny -- sklada sie w urzedzie gminy lub MOPS.
W ciagu 2 MIESIECY od zdarzenia losowego uprawniajacego do zasilku.

POLA: podobne do stypendium szkolnego.
KLUCZOWE ROZNICE: trzeba opisac zdarzenie losowe (pozar, powodz, wypadek, smiesc w rodzinie, etc.) i dolac dokumentacje (np. zaswiadczenie z policji o poarze, akt zgonu, etc.).
`,
    szczegolyKwalifikacji: `
Zasilek szkolny to jednorazowe swiadczenie (max. 620 PLN) dla uczniow, ktorych sytuacja zyciowa pogorszyła sie z powodu zdarzenia losowego:
- Pozar, powodz, zdarzenie losowe
- Smiesc rodzica lub opiekuna
- Nagla choroba czlonka rodziny

Brak kryterium dochodowego (zdarzenie losowe jest kluczowe, nie dochod).
Mozna laczyc ze stypendium szkolnym.
`,
    zrodlo: 'https://www.gov.pl/web/edukacja/stypendium-szkolne-oraz-zasilek-szkolny -- pobrano 2026-05-13',
  },

  'zasilek-macierzynski-krus': {
    formularzOpis: `
Formularz SR-24A -- wniosek o zasilek macierzynski z KRUS.
Sklada sie w oddziale KRUS wlasciwym dla miejsca zamieszkania.

POLA:
- Dane wnioskodawcy: imie, nazwisko, PESEL, numer ewidencyjny KRUS, adres, konto bankowe
- Data urodzenia dziecka lub data przysposobieniu
- Oswiadczenie ze wnioskodawca podlega ubezpieczeniu w KRUS i nie pobiera zasilku z ZUS

DOKUMENTY:
- Skrocony odpis aktu urodzenia dziecka
- Zaswiadczenie o ubezpieczeniu w KRUS przez wymagany okres
`,
    szczegolyKwalifikacji: `
Zasilek macierzynski z KRUS przyslugi ubezpieczonym rolnikom:
- Matka: ubezpieczona co najmniej 1 rok przed porodem
- Ojciec: moze przejac zasilek po 14 tygodniach macierzystwa matki lub przy jej smierci

Wysokosc (2026): 1000 PLN miesiecznie (jednolita kwota, niezalezna od dochodow).
Czas wyplaty: 52 tygodnie (lub wiecej przy blizniatach i wyzszych multiples).

UWAGA: rolnik pobierajacy zasilek macierzynski z KRUS NIE MOZE jednoczesnie pobierac kosiniakowego z gminy. Wieksze pieniadze sa z KRUS.
`,
    zrodlo: 'https://www.gov.pl/web/krus/zasilek-macierzynski -- pobrano 2026-05-13',
  },

  'wakacje-skladkowe': {
    formularzOpis: `
Wakacje skladkowe (przerwa w skladkach ZUS dla samozatrudnionych) -- wniosek przez PUE ZUS lub CEIDG.
Kod tytulu ubezpieczenia pozostaje taki sam, skladana deklaracja ZUS DRA z zerowym skladkami.

TERMIN WNIOSKU: do konca miesiaca POPRZEDZAJACEGO miesiac wakacji.
Przyklad: jesli chcesz "wakacje" we wrzesniu -- wniosek do 31 sierpnia.

POLA: data miesiaca ulgi, potwierdzenie ze DG jest aktywna i spelnia warunki.
`,
    szczegolyKwalifikacji: `
Kto moze skorzystac z wakacji skladkowych:
- Osoby prowadzace DG i oplacajace wlasne skladki ZUS (nie pracodawcy)
- Przychod za poprzedni rok nie przekroczyl 2 milionow PLN
- DG nie jest zawieszona

Zasady:
- RAZ w roku mozna "zawiesic" skladki spoleczne na 1 miesiac (lipiec, sierpien, wrzesien lub grudzien -- wybierasz)
- W tym miesiacu NIE placi sie: emerytalnej, rentowej, wypadkowej, chorobowej
- Placi sie nadal: skladke zdrowotna (9% dochodu, min. 381,78 PLN)
- Za miesiac przerwy: brak ubezpieczenia chorobowego (nie mozna isc na chorobowe)

Wakacje skladkowe SUMUJA sie z innymi ulgami (mozna byc na Malym ZUS Plus i jednoczesnie skorzystac z wakacji).
`,
    zrodlo: 'https://www.zus.pl/firmy/wakacje-od-zus -- pobrano 2026-05-13',
  },

  'opieka-75-plus': {
    formularzOpis: `
Wniosek o uslugi opiekuncze w ramach programu Opieka 75+ -- sklada sie w MOPS lub GOPS.
Formularz gminny/gops (rozny w kazdej jednostce).

POLA:
- Dane seniora: imie, nazwisko, PESEL, adres, stan zdrowia (krotki opis potrzeb)
- Dane opiekuna faktycznego (jesli jest): imie, nazwisko, stosunek do seniora
- Opis potrzeb: jakie czynnosci wymagaja pomocy (toaleta, gotowanie, sprzatanie, zakupy, etc.)
- Dochod seniora: emerytura/renta (podstawa do ustalenia odplatnosci)

KROK 1: Pracownik MOPS przeprowadza wywiad srodowiskowy w domu seniora.
KROK 2: Decyzja o przyznaniu uslug i o odplatnosci (lub bezplatnosci).
`,
    szczegolyKwalifikacji: `
Program Opieka 75+ (finansowany z budzetu panstwa, realizowany przez gminy).
Skierowany do osob samotnych lub samotnie gospoodarczo zamieszkujacych w wieku 75+.
Uslugi opiekuncze: pomoc w codziennych czynnosci (sprzatanie, gotowanie, zakupy, higiena) + specjalistyczne uslugi opiekuncze (pielegnacja medyczna).

Bezplatne dla samotnych seniorow ponizej progu: 776 PLN netto dochodu.
Czescowo odplatne: od 776 do ok. 2000 PLN (tabela odplatnosci ustalana przez gmine).
Powyzej progu: pelna odplatnosc.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/program-opieka-75-na-rok-2026 -- pobrano 2026-05-13',
  },

  'renta-rolnicza': {
    formularzOpis: `
Formularz KRUS SR-20 -- wniosek o rente rolnicza (ten sam co dla emerytury rolniczej).
Sklada sie w oddziale KRUS.

POLA: analogiczne jak przy emeryturze rolniczej (SR-20), z roznica:
- Zaznaczenie ze wniosek dotyczy RENTY (nie emerytury)
- Dokumentacja medyczna: zaswiadczenia lekarskie, historia choroby, orzeczenia o niepelnosprawnosci

DOKUMENTY DODATKOWE:
- Dokumentacja medyczna potwierdzajaca niezdolnosc do pracy w rolnictwie (co najmniej czescowo)
- Zaswiadczenia z KRUS o okresach ubezpieczenia
`,
    szczegolyKwalifikacji: `
Renta rolnicza z tytulu niezdolnosci do pracy:
- Calkowita niezdolnosc do pracy w rolnictwie: renta w pelnej wysokosci
- Czescowa niezdolnosc: polowa kwoty renty

Wymagany staz ubezpieczenia KRUS: zalez od wieku w chwili powstania niezdolnosci:
- Do 20 lat: 1 rok ubezpieczenia
- 20-22 lat: 2 lata
- 22-25 lat: 3 lata
- 25-30 lat: 4 lata
- Powyzel 30 lat: 5 lat w ciagu ostatnich 10 lat

Kwota minimalna renty rolniczej (2026): 1978,49 PLN brutto (zblizona do minimalnej emerytury).
`,
    zrodlo: 'https://www.gov.pl/web/krus -- pobrano 2026-05-13',
  },

  'kredyt-studencki': {
    formularzOpis: `
Wniosek o kredyt studencki -- sklada sie w BANKU (nie na uczelni ani nie w Ministerstwie).
Banki udzielajace kredytow studenckich z doplata panstwa: PKO BP, Pekao, Bank Polskiej Spoldzielczosci (BPS).

PROCEDURA:
1. Wybierz bank z oferta kredytu studenckiego
2. Zloz wniosek w banku (osobiscie lub online)
3. Uczelnia powiadza: student dostarcza zaswiadczenie o studiach z uczelni
4. Bank sprawdza: status studenta, rokowanie na ukonczenie studiow
5. Umowa kredytowa -- decyzja w ciagu ok. 30 dni

DOKUMENTY:
- Zaswiadczenie o statusie studenta (z dziekanatu)
- Dowod osobisty
- Ewentualnie: zaswiadczenie o dochodach rodziny (jesli bank wymaga)
`,
    szczegolyKwalifikacji: `
Transza: wyplacana co miesiac w czasie studiow (max. 1000 PLN/mies. z reguły).
Splata: zaczyna sie 2 lata po ukonczeniu studiow, przez czas rowny dwukrotnemu okresowi korzystania z kredytu.

Korzysci:
- Oprocentowanie dotowane przez panstwo (znacznie ponizej rynkowego)
- Przy bezrobociu: mozna zawiesic splate
- Przy bardzo niskich dochodach: mozna umorzyc czesc kredytu

Limit dochodowy rodziny: ok. 3000 PLN netto na osobe (weryfikuje bank, nieco rozny).

Termin skladania wnioskow: zwykle wrzesien-pazdziernik na nowy rok akademicki.
`,
    zrodlo: 'https://www.gov.pl/web/nauka/kredyty-studenckie -- pobrano 2026-05-13',
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
