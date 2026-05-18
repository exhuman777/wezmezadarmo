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
Formularz ZUS Z-12: wniosek o zasiłek pogrzebowy.

CZĘŚĆ I -- Dane osoby wnioskującej:
- Imię i nazwisko: pełne imię i nazwisko wnioskodawcy (osoby, która poniosła koszty pogrzebu)
- PESEL lub NIP: PESEL wnioskodawcy
- Adres zamieszkania: aktualny adres wnioskodawcy
- Numer konta bankowego: 26-cyfrowy IBAN, na które ma trafić zasiłek

CZĘŚĆ II -- Dane osoby zmarłej:
- Imię i nazwisko zmarłego
- PESEL zmarłego (lub data urodzenia jeśli brak PESEL)
- Data śmierci: dokładna data zgodna z aktem zgonu
- Stopień pokrewieństwa z wnioskodawcą (małżonek, dziecko, rodzic, etc.)

CZĘŚĆ III -- Informacje o ubezpieczeniu zmarłego:
- Czy zmarła osoba była ubezpieczona w ZUS? (pracownik, emeryt, rencista, etc.)
- Ostatnie miejsce pracy lub numer emerytury/renty

DOKUMENTY DOŁĄCZANE DO WNIOSKU:
1. Akt zgonu (oryginalna kopia)
2. Dokumenty potwierdzające poniesione koszty (faktury VAT od zakładu pogrzebowego, za wieniec, urnę, itd.)
3. Dokument potwierdzający pokrewieństwo (odpis aktu urodzenia, ślubu)
4. Jeśli wnioskuje pracodawca lub instytucja: umowa o organizację pogrzebu

TYPOWE BŁĘDY:
- Składanie wniosku po 12 miesiącach od daty pogrzebu (prawo przepada bezpowrotnie)
- Brak oryginalnych faktur (kserokopie nie wystarczają)
- Wnioskowanie przez zakład pogrzebowy zamiast przez członka rodziny (rodzina dostaje więcej: 7000 PLN ryczałt vs. faktyczne koszty dla firm)
- Pomylenie daty śmierci z datą pogrzebu w formularzu
`,
    szczegolyKwalifikacji: `
Kwota od 1 stycznia 2026: 7000 PLN (wzrost z 4000 PLN). O kwocie decyduje DATA ŚMIERCI, nie data złożenia wniosku.

Kto może złożyć wniosek:
1. Członek rodziny (małżonek, dzieci, rodzice, dziadkowie, wnuki, rodzeństwo, teściowie) -- dostaje 7000 PLN ryczałtem niezależnie od faktycznych kosztów
2. Pracodawca, gmina, dom pomocy społecznej, instytucja -- dostaje zwrot faktycznych kosztów, max 7000 PLN
3. Obca osoba która faktycznie poniosła koszty -- zwrot faktycznych kosztów, max 7000 PLN

Jeśli kilka osób poniosło koszty: zasiłek dzielony proporcjonalnie.

Jeśli zakład pogrzebowy organizował pogrzeb na zlecenie rodziny i rodzina zapłaciła: wniosek składa rodzina, dostaje 7000 PLN ryczałt.
`,
    faq: `
P: Czy mogę złożyć wniosek, jeśli pogrzeb był kilka lat temu?
O: NIE. Termin to 12 miesięcy od dnia pogrzebu. Po tym terminie prawo wygasa.

P: Jak liczyć 12 miesięcy -- od daty śmierci czy od daty pogrzebu?
O: Od DATY POGRZEBU.

P: Co jeśli rodzina częściowo opłaciła pogrzeb, a część opłacił zakład pogrzebowy na kredyt?
O: Zasiłek przysługuje temu, kto faktycznie poniósł koszty. Jeśli rodzina opłaciła część -- proporcjonalny zwrot.

P: Czy obowiązuje kryterium dochodowe?
O: NIE. Zasiłek pogrzebowy nie zależy od dochodu.

P: Ile dni trwa wypłata?
O: ZUS wypłaca w ciągu 30 dni od złożenia kompletnego wniosku.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-pogrzebowy -- pobrano 2026-05-13',
  },

  'zasilek-chorobowy': {
    formularzOpis: `
E-ZLA (elektroniczne zwolnienie lekarskie) -- wystawiany przez lekarza, trafia automatycznie do ZUS i pracodawcy. Ubezpieczony nie musi go samodzielnie dostarczać.

Formularz ZUS Z-3 -- wypełnia PRACODAWCA (nie pracownik) i przekazuje do ZUS:
- Dane pracownika: imię, nazwisko, PESEL, adres
- Wymiar etatu i wynagrodzenie brutto za ostatnie 12 miesięcy
- Informacja o przerwach w ubezpieczeniu
- Konto bankowe pracownika (jeśli ZUS wypłaca bezpośrednio)

ZUS Z-3a -- dla zleceniobiorców (wypełnia zleceniodawca)
ZUS Z-3b -- dla samozatrudnionych (wypełnia sam ubezpieczony)

UBEZPIECZONY NIE SKŁADA WNIOSKU -- e-ZLA wystawione przez lekarza uruchamia automatycznie procedurę.
`,
    szczegolyKwalifikacji: `
Okres wyczekiwania:
- Pracownicy (umowa o pracę): 30 dni ciągłego ubezpieczenia chorobowego
- Zleceniobiorcy: 90 dni
- Dobrowolne ubezpieczenie (samozatrudnieni): 90 dni
- BEZ okresu wyczekiwania: ubezpieczeni wcześniej przez minimum 10 lat, absolwenci (6 mies. od studiów), ciążowe zwolnienia

Wysokość:
- 80% podstawy (średnie wynagrodzenie z 12 mies.)
- 70% za pobyt w szpitalu (z wyjątkami)
- 100% w ciąży, przy wypadku przy pracy, chorobie zawodowej

Maksymalny okres: 182 dni (6 miesięcy), przy gruźlicy lub ciąży 270 dni.
Po wyczerpaniu -- świadczenie rehabilitacyjne (do 12 miesięcy).
`,
    faq: `
P: Czy mogę iść do lekarza pierwszego dnia choroby?
O: Tak, ale zwolnienie od lekarza może być wystawione "wstecz" tylko o 3 dni (tylko w wyjątkowych sytuacjach).

P: Co jeśli pracodawca sam wypłaca zasiłek?
O: Pracodawcy zatrudniający powyżej 20 ubezpieczonych sami wypłacają zasiłek i potem rozliczają z ZUS.

P: Czy zasiłek chorobowy podlega podatkowi?
O: TAK, jest opodatkowany PIT.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-chorobowy -- pobrano 2026-05-13',
  },

  'zasilek-macierzynski': {
    formularzOpis: `
PRACOWNICY: pracodawca składa ZUS Z-3 do ZUS. Pracownica składa do pracodawcy wniosek o urlop macierzyński z kopią aktu urodzenia dziecka.

ZLECENIOBIORCY / SAMOZATRUDNIENI: składają bezpośrednio do ZUS:
- ZUS Z-3a (zleceniobiorcy) lub ZUS Z-3b (samozatrudnieni)
- Wniosek o wypłatę zasiłku macierzyńskiego
- Skrócony odpis aktu urodzenia dziecka
- Oświadczenie o niepobraniu zasiłku przez drugiego rodzica

WNIOSEK O URLOP RODZICIELSKI (jeśli chcesz wydłużyć):
- Termin: nie później niż 21 dni po porodzie (jeśli chcesz ciągły urlop)
- Późniejszy wniosek: rodzicielski może być brany później, ale trzeba złożyć 21 dni przed planowanym początkiem
`,
    szczegolyKwalifikacji: `
ZASIŁEK MACIERZYŃSKI vs. ŚWIADCZENIE RODZICIELSKIE (kosiniakowe):
- Zasiłek macierzyński: dla osób ubezpieczonych w ZUS (pracownicy, zleceniobiorcy, samozatrudnieni)
- Kosiniakowe: dla tych, którzy NIE mają ubezpieczenia chorobowego (bezrobotni, studenci, etc.)
NIE MOŻNA POBIERAĆ OBU JEDNOCZEŚNIE.

Okresy:
- Urlop macierzyński: 20 tygodni (przy pojedynczym porodzie), do 37 tyg. przy pięcioraczkach
- Urlop rodzicielski: 41 tygodni (lub 43 przy wieloraczkach) -- może być podzielony między rodziców
- 9 tygodni urlopu rodzicielskiego jest NIEPRZENOSZALNE na drugiego rodzica (obowiązuje od 2023)

Wysokość:
- 81.5% podstawy za cały czas (jeśli wniosek złożono do 21 dni po porodzie)
- 100% przez pierwsze 6 tyg. + 60% przez pozostały czas (jeśli wniosek po terminie)
`,
    faq: `
P: Ojciec dziecka może wziąć urlop macierzyński?
O: Tak. Ojciec ma prawo do urlopu ojcowskiego (2 tygodnie do 12 mies. od porodu) i może przejąć część urlopu macierzyńskiego od matki po 14 tygodniach.

P: Czy zasiłek macierzyński przysługuje przy poronieniu?
O: Tak, jeśli ciąża trwała co najmniej 22 tygodnie -- zasiłek za 8 tygodni.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski -- pobrano 2026-05-13',
  },

  'zasilek-opiekunczy': {
    formularzOpis: `
Formularz ZUS Z-15A -- opieka nad dzieckiem do 14 lat:
- Część I: dane ubezpieczonego (imię, nazwisko, PESEL, adres)
- Część II: dane dziecka (imię, nazwisko, PESEL, stopień pokrewieństwa)
- Część III: informacja o innym opiekunie (czy współmieszkający członek rodziny może zapewnić opiekę? jeżeli tak, zasiłek nie przysługuje)
- Część IV: powód (choroba dziecka, zamknięcie placówki, choroba niani, etc.)
- Podpis: własnoręcznie lub elektronicznie na PUE ZUS

Formularz ZUS Z-15B -- opieka nad chorym członkiem rodziny (małżonek, rodzic, etc.):
- Podobna struktura jak Z-15A
- Część III: tutaj warunek "brak innego opiekuna" jest BEZWZGLĘDNY (nie jak przy dziecku do lat 2)

UWAGA: lekarz wystawia e-ZLA -- ubezpieczony nie musi już dostarczać zaświadczenia lekarskiego odrębnie.
`,
    szczegolyKwalifikacji: `
LIMITY ROCZNE:
- 60 dni na chore dziecko do 14 lat (łączy się limit obojga rodziców)
- 14 dni na innego chorego członka rodziny
- Przy opiece nad dzieckiem niepełnosprawnym do 18 lat: dodatkowe 30 dni

WARUNEK "BRAK INNEGO OPIEKUNA":
- Przy chorym dziecku do lat 2: warunek nie obowiązuje (zawsze przysługuje)
- Przy chorym dziecku 2-14 lat: jeśli inny członek rodziny może zapewnić opiekę, zasiłek nie przysługuje
- Przy chorym dorosłym członku rodziny: zawsze wymagane oświadczenie że nie ma innego opiekuna

ZAMKNIĘCIE PLACÓWKI:
- Szkoła, przedszkole, żłobek zamknięty z przyczyn nieprzewidzianych lub epidemicznych
- Limit 60 dni (wliczany do ogólnego limitu na dziecko)
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-opiekunczy -- pobrano 2026-05-13',
  },

  'swiadczenie-rehabilitacyjne': {
    formularzOpis: `
Formularz ZUS Np-7 -- wniosek o świadczenie rehabilitacyjne.
Składa ubezpieczony (lub pracodawca w jego imieniu) do ZUS PRZED wyczerpaniem zasiłku chorobowego.

Część I -- dane ubezpieczonego: imię, nazwisko, PESEL, adres, konto bankowe
Część II -- informacje o chorobie: od kiedy na zwolnieniu, jaki jest powód (czy rokowanie na powrót do pracy jest pozytywne?)
Część III -- dokumentacja medyczna: skierowanie od lekarza prowadzącego na komisję ZUS

KROK OBOWIĄZKOWY: orzeczenie lekarza orzecznika ZUS -- ZUS wzywa ubezpieczonego na badanie.
Termin złożenia: najpóźniej 6 tygodni przed końcem zasiłku chorobowego.
`,
    szczegolyKwalifikacji: `
Świadczenie rehabilitacyjne przysługuje, gdy po 182 dniach zwolnienia:
- Ubezpieczony jest nadal niezdolny do pracy
- Rokowania na powrót do pracy w ciągu kolejnych 12 miesięcy są pozytywne

Trwa: do 12 miesięcy (można wnioskować o kolejne okresy, każdy wymaga nowego orzeczenia)

Wysokość:
- 90% podstawy przez pierwsze 3 miesiące
- 75% podstawy przez kolejne miesiące
- 100% jeśli niezdolność wynikła z ciąży lub wypadku przy pracy

UWAGA: pracodawca NIE MOŻE zwolnić pracownika w czasie pobierania świadczenia rehabilitacyjnego.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/zasilki/swiadczenie-rehabilitacyjne -- pobrano 2026-05-13',
  },

  'renta-socjalna': {
    formularzOpis: `
Formularz ZUS ERN -- wniosek o rentę socjalną.
Składa się w oddziale ZUS lub przez PUE ZUS.

Część I -- dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
Część II -- historia choroby: kiedy została stwierdzona niezdolność, w jakim wieku, dokumentacja medyczna
Część III -- dokumenty:
- Orzeczenie o niezdolności do pracy wydane przez lekarza orzecznika ZUS (lub komisję lekarsko-ZUS)
- Dokumenty potwierdzające, że niezdolność powstała przed 18. rokiem życia (lub podczas studiów, lub w szkole)
- Dokumentacja medyczna (zaświadczenia lekarskie, historia choroby)

KLUCZOWE: trzeba udowodnić, że niezdolność do pracy POWSTAŁA w całości przed 18. urodzinami (lub do 25. roku życia podczas nauki).
`,
    szczegolyKwalifikacji: `
Komu przysługuje renta socjalna (bez wymogu posiadania stażu):
- Osobom całkowicie niezdolnym do pracy
- Niezdolność musi powstać przed 18. rokiem życia
  LUB w trakcie nauki w szkole/uczelni (do 25. roku życia)
  LUB w trakcie studiów doktoranckich

Kwota (2026): 1902,71 PLN brutto miesięcznie.

UWAGA: renta socjalna jest zawieszana, gdy ubezpieczony osiąga przychód powyżej 70% przeciętnego wynagrodzenia (ok. 4460 PLN brutto w 2026).
Prace dorywcze do tej kwoty: renta wypłacana normalnie.
`,
    faq: `
P: Czy można pracować będąc na rencie socjalnej?
O: Tak, do 70% przeciętnego wynagrodzenia (ok. 4460 PLN brutto miesięcznie w 2026). Powyżej tej kwoty renta jest zawieszana w całości.

P: Czy renta socjalna jest na stałe?
O: Przyznawana na czas określony lub nieokreślony -- zależy od orzeczenia. Trzeba odnawiać orzeczenie lekarza orzecznika ZUS.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/renty/renta-socjalna -- pobrano 2026-05-13',
  },

  'mama-4-plus': {
    formularzOpis: `
Formularz ZUS ERSU -- wniosek o rodzicielskie świadczenie uzupełniające ("Mama 4+").
Składa się w oddziale ZUS lub przez PUE ZUS.

Część I -- dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
Część II -- informacja o dzieciach: liczba wychowanych dzieci, imiona, nazwiska, daty urodzenia, czy dzieci żyją
Część III -- historia zatrudnienia: czy wnioskodawca ma jakiekolwiek prawo do emerytury/renty z ZUS lub KRUS
Część IV -- dokumenty dołączane:
- Akty urodzenia każdego z 4 (lub więcej) dzieci
- Jeśli dzieci już dorosłe: może być potrzebne potwierdzenie, że to wnioskodawca je wychowywał
- Jeśli ojciec wnioskuje: akt zgonu matki lub wyrok sądu potwierdzający opiekę

WAŻNE: świadczenie UZUPEŁNIA emeryturę/rentę do kwoty minimalnej (1780,96 PLN brutto), nie zastępuje.
Jeśli masz już emeryturę powyżej minimalnej -- nie dostaniesz nic.
`,
    szczegolyKwalifikacji: `
Warunki:
- Matka: urodziła i wychowała co najmniej 4 dzieci
- Ojciec: wychowywał co najmniej 4 dzieci (matka dzieci nie żyje lub porzuciła dzieci)
- Wiek: kobieta 60+, mężczyzna 65+
- Brak prawa do emerytury lub renty w wysokości co najmniej minimalnej emerytury

Kwota 2026: uzupełnienie do 1780,96 PLN brutto miesięcznie.
Jeśli masz emeryturę 1200 PLN -- dostaniesz dopełnienie 580,96 PLN.
Jeśli masz emeryturę 1900 PLN -- świadczenie ci nie przysługuje.

Świadczenie jest NIEZALEŻNE od stażu pracy.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/rodzicielskie-swiadczenie-uzupelniajace -- pobrano 2026-05-13',
  },

  'emerytura-pomostowa': {
    formularzOpis: `
Formularz ZUS EPOM -- wniosek o emeryturę pomostową.
Składa się w oddziale ZUS lub przez PUE ZUS.

Część I -- dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
Część II -- historia zatrudnienia w warunkach szczególnych lub o szczególnym charakterze:
  - Nazwy pracodawców
  - Okresy pracy w warunkach szczególnych
  - Stanowiska (muszą być na liście z Zał. 1 lub 2 do Ustawy z 2008)
Część III -- dokumenty:
  - Świadectwo pracy z określeniem rodzaju pracy (musi zawierać punkt o warunkach szczególnych)
  - Zaświadczenie pracodawcy (Zał. nr 1 do wniosku EPOM)
  - Dokumenty potwierdzające ubezpieczenie przed 1999 rokiem

UWAGA: świadectwo pracy MUSI potwierdzać pracę w warunkach szczególnych. Bez tego ZUS odmówi.
Pracodawca ma obowiązek wydać takie świadectwo -- jeśli odmawia, można go przymusić sądownie.
`,
    szczegolyKwalifikacji: `
Wymagania ŁĄCZNIE:
1. Urodzony przed 1 stycznia 1969
2. Co najmniej 15 lat pracy w warunkach szczególnych lub o szczególnym charakterze (wykaz w Zał. 1 i 2 do Ustawy)
3. Staż ubezpieczeniowy: 20 lat kobiety / 25 lat mężczyźni
4. Rozwiązanie stosunku pracy
5. Praca w tych warunkach MUSI obejmować okres po 31 grudnia 2008

Typowe zawody kwalifikujące: górnicy, kierowcy ciężarówek, piloci, maszyniści, strażacy, ratownicy górscy, praca w narażeniu na hałas/zapylenie/substancje toksyczne.

Świadczenie płaci pracodawca (Fundusz Emerytur Pomostowych, finansowany ze składek pracodawców). Wniosek składa ubezpieczony do ZUS.
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/emerytury/emerytury-pomostowe -- pobrano 2026-05-13',
  },

  'swiadczenie-przedemerytalne': {
    formularzOpis: `
Formularz ZUS ESP -- wniosek o świadczenie przedemerytalne.
Składa się w oddziale ZUS lub przez PUE ZUS po upływie 6 miesięcy od daty rejestracji w urzędzie pracy.

Część I -- dane wnioskodawcy
Część II -- data rozwiązania stosunku pracy i powód (likwidacja, zwolnienie grupowe, zwolnienie z winy pracodawcy)
Część III -- historia rejestracji w Powiatowym Urzędzie Pracy (PUP):
  - Data rejestracji
  - Potwierdzenie, że przez 6 miesięcy pobierało się zasiłek dla bezrobotnych
  - Potwierdzenie z PUP że aktywnie szukano pracy
Część IV -- dokumenty:
  - Świadectwo pracy z podaniem przyczyny rozwiązania
  - Zaświadczenie z ZUS o określeniu stażu ubezpieczeniowego
  - Zaświadczenie z PUP o 6-miesięcznym pobieraniu zasiłku

KLUCZOWY TERMIN: wniosek należy złożyć w ciągu 30 dni od daty wydania przez PUP zaświadczenia potwierdzającego 6-miesięczny pobyt na zasiłku. Po upływie 30 dni -- trzeba zacząć procedurę od nowa.
`,
    szczegolyKwalifikacji: `
Warunki (muszą być spełnione ŁĄCZNIE):
1. Wiek: kobieta 56+, mężczyzna 61+ w dniu rozwiązania stosunku pracy
2. Staż: kobieta minimum 20 lat, mężczyzna minimum 25 lat ubezpieczenia
3. Powód utraty pracy: likwidacja pracodawcy, zwolnienie grupowe, przyczyny leżące po stronie pracodawcy
4. 6 miesięcy rejestracji w PUP jako bezrobotny i pobierania zasiłku dla bezrobotnych

Kwota (2026): 1636,15 PLN brutto miesięcznie (około 91% minimalnej emerytury).
Trwa do osiągnięcia wieku emerytalnego (60/65 lat).
`,
    zrodlo: 'https://www.zus.pl/swiadczenia/swiadczenia-przedemerytalne -- pobrano 2026-05-13',
  },

  // ---- RODZINA BATCH ----

  '800-plus': {
    formularzOpis: `
Wniosek SW-1 -- wyłącznie elektronicznie (brak wersji papierowej od 2024):
- PUE ZUS (pue.zus.pl): zaloguj się profilem zaufanym, e-Dowodem lub bankowością elektroniczną
- Bankowość elektroniczna: większość dużych banków (PKO, Pekao, mBank, Santander, ING, etc.)
- Portal Empatia (empatia.mpips.gov.pl)

POLA DO WYPEŁNIENIA:
1. Dane wnioskodawcy: imię, nazwisko, PESEL, adres, numer konta bankowego (IBAN)
2. Dane dziecka/dzieci: imię, nazwisko, PESEL każdego dziecka, data urodzenia
3. Przy opiece naprzemiennej: zaznaczyć i podać PESEL drugiego rodzica

WERYFIKACJA AUTOMATYCZNA:
ZUS weryfikuje dane z rejestru PESEL -- nie trzeba dołączać aktu urodzenia jeśli dziecko urodziło się w Polsce. Przy dzieciach urodzonych zagranicą -- akt urodzenia z tłumaczeniem.
`,
    szczegolyKwalifikacji: `
OKRESY ŚWIADCZENIOWE: zawsze od 1 czerwca do 31 maja.
Wnioski na nowy okres przyjmowane od 1 LUTEGO.
Jeśli złoży się wniosek:
- Od 1 lutego do 30 kwietnia: wypłata od 1 czerwca (bez opóźnienia)
- Od 1 maja do 31 maja: wypłata od 1 czerwca, ale po rozpatrzeniu (może być opóźnienie do 2 mies.)
- Po 1 czerwca: wypłata od pierwszego dnia miesiąca złożenia wniosku (BRAK wyrównania wstecz)

OPIEKA NAPRZEMIENNA:
Jeśli rodzice rozwiedzeni z orzeczeniem o opiece naprzemiennej (co najmniej 50/50): każdy rodzic składa wniosek na pół świadczenia (400 PLN).

CUDZOZIEMCY:
Prawo do 800+ mają cudzoziemcy z prawem pobytu stałe lub czasowego jeśli zamieszkują w Polsce i sprawują opiekę nad dzieckiem.
`,
    faq: `
P: Dziecko ukończyło 18 lat w sierpniu -- czy dostaje za sierpień?
O: TAK. Świadczenie przysługuje do końca miesiąca, w którym dziecko ukończy 18 lat.

P: Co jeśli urodziło się drugie dziecko w trakcie okresu świadczeniowego?
O: Należy złożyć nowy wniosek dla noworodka. ZUS automatycznie wlicza go do świadczenia.

P: Czy 800+ jest wliczane do dochodu przy innych świadczeniach?
O: NIE. Ustawa expressis verbis wyklucza 800+ z dochodu przy ocenie kryterium dochodowego innych świadczeń.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/800plus -- pobrano 2026-05-13',
  },

  'becikowe': {
    formularzOpis: `
Formularz SR-2 -- wniosek o ustalenie prawa do jednorazowej zapomogi z tytułu urodzenia się dziecka.
Składa się w MOPS lub urzędzie gminy (nie w ZUS) w miejscu zamieszkania.

POLA:
1. Dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
2. Dane dziecka: imię, nazwisko, PESEL, data urodzenia
3. Dochód rodziny: dochód netto za rok bazowy (rok poprzedzający okres zasiłkowy), na każdego członka rodziny
4. Oświadczenie o opiece medycznej: zaświadczenie lekarskie LUB od położnej że matka była pod opieką medyczną od max. 10 tygodnia ciąży

DOKUMENTY:
- Oryginalna kopia skróconego aktu urodzenia dziecka
- Zaświadczenie lekarskie o opiece medycznej od 10. tygodnia ciąży (wystawia lekarz prowadzący ciążę lub położna) -- BEZ TEGO WNIOSEK ZOSTANIE ODRZUCONY
- Dokumenty dochodowe: PIT za rok poprzedni lub zaświadczenie o dochodach z zakładu pracy
- Jeśli jest zmiana dochodu (np. utrata pracy): zaświadczenie z PUP, decyzja o zasiłku

TERMIN: 12 miesięcy od urodzenia dziecka. Po tym terminie becikowe przepada bezpowrotnie.
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe 2025/2026: 1922 PLN netto na osobe w rodzinie miesiecznie.
Dochod liczony z roku bazowego. Przy zmianie dochodu (utrata/uzyskanie) stosuje sie zasade utraty/uzyskania dochodu.

CZĘSTO POMIJANE:
- Oboje rodzice mogą być wnioskodawcami -- jeśli matka nie złoży, może ojciec
- Opieka medyczna od 10. tygodnia ciąży jest ABSOLUTNYM wymogiem -- nie ma wyjątków
- Jeśli dziecko urodziło się martwe -- becikowe NIE przysługuje
- Przy adopcji: wniosek w ciągu 12 mies. od przysposobienia, wymóg opieki medycznej nie dotyczy
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/becikowe -- pobrano 2026-05-13',
  },

  'kosiniakowe': {
    formularzOpis: `
Formularz SR-7 -- wniosek o świadczenie rodzicielskie.
Składa się w MOPS lub urzędzie gminy (nie w ZUS).

POLA:
1. Dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
2. Dane dziecka/dzieci: imię, nazwisko, PESEL, data urodzenia
3. Oświadczenie: że wnioskodawca jest osobą uprawnioną (bezrobotny, student, zleceniobiorca bez ubezp. chorobowego, rolnik)
4. Oświadczenie, że nie pobiera się zasiłku macierzyńskiego z ZUS ani KRUS

TERMIN KRYTYCZNY:
- Wniosek złożony w ciągu 3 MIESIĘCY od porodu --> wypłata od dnia narodzin
- Wniosek złożony PO 3 MIESIĄCACH --> wypłata dopiero od miesiąca złożenia wniosku (tracisz pieniądze za poprzednie miesiące)

DOKUMENTY:
- Skrócony odpis aktu urodzenia dziecka
- Oświadczenie o nieuzyskiwaniu zasiłku macierzyńskiego z ZUS
- Zaświadczenie z uczelni (jeśli student)
`,
    szczegolyKwalifikacji: `
KOSINIAKOWE vs. ZASIŁEK MACIERZYŃSKI:
- Kosiniakowe: dla osób BEZ prawa do zasiłku macierzyńskiego (bezrobotni, studenci, umowy o dzieło, rolnicy)
- Zasiłek macierzyński: dla osób UBEZPIECZONYCH w ZUS (umowa o pracę, zlecenie z ubezpieczeniem, prowadzący działalność)

JEŚLI masz umowę zlecenie BEZ dobrowolnego ubezpieczenia chorobowego -- masz prawo do kosiniakowego.
JEŚLI masz umowę zlecenie Z dobrowolnym ubezpieczeniem chorobowym -- masz prawo do zasiłku macierzyńskiego (większe pieniądze).

Kosiniakowe nie przysługuje osobom pobierającym zasiłek dla bezrobotnych.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/swiadczenie-rodzicielskie -- pobrano 2026-05-13',
  },

  'ulga-prorodzinna': {
    formularzOpis: `
Formularz PIT/O -- załącznik do PIT-36 lub PIT-37 (rozliczenie roczne).
Dostępny na podatki.gov.pl lub w usługach podatki.gov.pl (e-PIT).

POLA W PIT/O dotyczące ulgi na dziecko:
Część D -- Ulga na dzieci:
- Kolumna A: PESEL dziecka
- Kolumna B: Imię i nazwisko dziecka
- Kolumna C: Liczba miesięcy, w których korzystało się z ulgi (max. 12)
- Kolumna D: Kwota odliczenia

KWOTY ULGI (za 2025, wykazywane w PIT za 2025):
- Na 1 dziecko: 1112,04 PLN rocznie (92,67 PLN/mies.)
- Na 2 dzieci: łącznie 2224,08 PLN (po 1112,04 na każde)
- Na 3. dziecko: 2000,04 PLN rocznie (166,67 PLN/mies.)
- Na 4. i kolejne dziecko: 2700 PLN rocznie (225 PLN/mies.)
- Na pierwsze dziecko: tylko przy dochodzie powyżej 56.000 PLN (jeden rodzic) lub 112.000 PLN (małżeństwo)

PRZY OPIECE NAPRZEMIENNEJ: każdy rodzic odlicza połowę ulgi.
JEŚLI ULGA WIĘKSZA OD PODATKU: nadwyżkę można odliczyć od składek ZUS/NFZ (do wysokości faktycznie zapłaconych).
`,
    szczegolyKwalifikacji: `
Ulga na dziecko NIE przysługuje:
- Jeśli dziecko ukończyło 18 lat i nie studiuje
- Jeśli dziecko studiuje, ale ukończyło 25 lat
- Jeśli dziecko wstąpiło w związek małżeński
- Jeśli pełnoletnie dziecko miało przychody powyżej 19.061,28 PLN (kwota wolna od podatku)

Przy JEDNYM dziecku: ulga tylko jeśli dochód wnioskodawcy przekracza 56.000 PLN (lub łącznie małżeństwa 112.000 PLN). Jeśli masz niższy dochód z jednym dzieckiem -- ulga nie przysługuje.

Przy dwojgu i więcej dzieci: brak limitu dochodowego.
`,
    faq: `
P: Dziecko ukończyło 25 lat w maju -- czy mam ulgę za styczeń-kwiecień?
O: TAK, za miesiące od stycznia do maja (5 miesięcy). Podajesz 5 w polu "liczba miesięcy".

P: Gdzie wykazać nadwyżkę ulgi nad podatkiem?
O: W PIT-36 lub PIT-37 -- pole "Kwota do odliczenia od składki zdrowotnej". Nie można stracić nadwyżki -- zawsze można coś odzyskać.
`,
    zrodlo: 'https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-na-dzieci/ -- pobrano 2026-05-13',
  },

  // ---- NIEPELNOSPRAWNOSC ----

  'swiadczenie-wspierajace': {
    formularzOpis: `
Formularz SWP -- wniosek o świadczenie wspierające.
Składa się elektronicznie przez PUE ZUS, portal Empatia lub w oddziale ZUS.

KROK 1: Uzyskanie decyzji ustalającej poziom potrzeby wsparcia.
Wniosek o ustalenie poziomu wsparcia składa się do WOJEWÓDZKIEGO ZESPOŁU ds. Orzekania o Niepełnosprawności (WZON).
Formularz WZON: imię, nazwisko, PESEL, adres, dokumentacja medyczna.
Wynik: poziom potrzeby wsparcia w skali 70-100 punktów.

KROK 2: Wniosek o świadczenie do ZUS (formularz SWP):
- Dane wnioskodawcy: imię, nazwisko, PESEL, adres, konto bankowe
- Numer decyzji WZON określający poziom potrzeby wsparcia
- Oświadczenie o niekorzystaniu z zasiłku pielęgnacyjnego lub świadczenia pielęgnacyjnego jednocześnie

POZIOMY I KWOTY (2026):
- 95-100 pkt: 3495,84 PLN
- 90-94 pkt: 2621,88 PLN
- 85-89 pkt: 1747,92 PLN
- 80-84 pkt: 1310,94 PLN
- 75-79 pkt: 873,96 PLN
- 70-74 pkt: 436,98 PLN
`,
    szczegolyKwalifikacji: `
Świadczenie wspierające jest NOWE (od 2024 r.) i ZASTĘPUJE stopniowo zasiłek pielęgnacyjny dla dorosłych.

KLUCZOWE RÓŻNICE:
- Świadczenie wspierające: dla DOROSŁYCH (18+), wypłata ZUS bezpośrednio do osoby niepełnosprawnej
- Zasiłek pielęgnacyjny: dla dzieci i dorosłych, wypłaca gmina/MOPS, niższa kwota (215,84 PLN)

HARMONOGRAM WDRAŻANIA:
- 2024: osoby z decyzją na poziomie 87-100 pkt
- 2025: osoby z decyzją 78-86 pkt
- 2026: osoby z decyzją 70-77 pkt

Warunek: osoba musi samodzielnie zarządzać świadczeniem (lub przez opiekuna prawnego).
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/swiadczenie-wspierajace -- pobrano 2026-05-13',
  },

  // ---- EKOLOGIA ----

  'bon-energetyczny': {
    formularzOpis: `
Wniosek o bon energetyczny -- składa się w gminie (urząd gminy lub MOPS) do 30 września 2025.
UWAGA: nabór na bon energetyczny 2025 jest zamknięty. Kolejny nabór planowany na połowę 2026 (jeśli program będzie kontynuowany).

Pola wniosku:
- Dane wnioskodawcy: imię, nazwisko, PESEL, adres zameldowania
- Dane członków gospodarstwa domowego (wszyscy mieszkający pod tym samym adresem)
- Rodzaj źródła ogrzewania (prądu, gaz, biomasa, etc.) -- musi być w centralnej ewidencji
- Kryterium dochodowe: dochód za 2024 rok (rok poprzedni), zaświadczenie z US lub ZUS
- Numer konta bankowego do wypłaty

KWOTY:
- Jednoosobowe: 300 PLN (lub 600 PLN jesli zrodlo ogrzewania w CEEB)
- 2-3 osoby: 400 PLN (lub 800 PLN)
- 4-5 osob: 500 PLN (lub 1000 PLN)
- 6 i wiecej: 600 PLN (lub 1200 PLN)
`,
    szczegolyKwalifikacji: `
Kryterium dochodowe (za 2024):
- Jednoosobowe: do 2500 PLN netto miesięcznie
- Wieloosobowe: do 1700 PLN netto na osobę miesięcznie

WYŻSZE KWOTY (2x) są dla gospodarstw gdzie źródłem ogrzewania jest: pompa ciepła, kocioł na pelet drzewny klasy 5, kocioł gazowy kondensacyjny, kolektor słoneczny lub ogniwo fotowoltaiczne. Musi być wpisane do CEEB (Centralna Ewidencja Emisyjności Budynków).
`,
    zrodlo: 'https://www.gov.pl/web/klimat/bon-energetyczny -- pobrano 2026-05-13',
  },

  // ---- BATCH B ----

  'zasilek-dla-bezrobotnych': {
    formularzOpis: `
Wniosek o zasiłek składany osobiście w Powiatowym Urzędzie Pracy (PUP) w miejscu zameldowania lub zamieszkania.
Można też przez portal praca.gov.pl (profil zaufany wymagany).

DOKUMENTY PRZY REJESTRACJI W PUP:
- Dowód osobisty lub paszport
- Świadectwa pracy (oryginały lub kopie potwierdzone przez pracodawcę) -- za ostatnie 10 lat
- Dyplom ukończenia szkoły lub uczelni (jeśli brak stażu pracy)
- Dokumenty potwierdzające inne okresy ubezpieczenia (zaświadczenia z ZUS, KRUS)
- Zaświadczenie z urzędu skarbowego o dochodach z działalności (jeśli prowadziło się firmę)

PRZY REJESTRACJI PRZEZ INTERNET (praca.gov.pl):
- Formularz PKK-01 wypełniany online
- Skany dokumentów (świadectwa pracy, dyplom)
- Podpis profilem zaufanym

UWAGA: w ciągu 7 dni od rejestracji należy obowiązkowa wizyta w PUP (wezwanie wysyła PUP).
`,
    szczegolyKwalifikacji: `
Warunki do zasiłku:
1. Rejestracja w PUP jako bezrobotny
2. Przepracowanie co najmniej 365 dni w ciągu 18 miesięcy przed zarejestrowaniem (na umowie o pracę lub zlecenie z pełnym ZUS)
3. Utrata pracy z przyczyn leżących po stronie pracodawcy LUB wygaśnięciem umowy na czas określony

UWAGA -- kiedy zasiłek NIE przysługuje:
- Rozwiązanie umowy przez pracownika (chyba że w trybie art. 55 KP - mobbing/zaległości)
- Zwolnienie dyscyplinarne (art. 52 KP)
- W ciągu 6 miesięcy przepracowanie mniej niż 365 dni

WYSOKOŚĆ 2026:
- Podstawowy (do 5 lat stażu): 1361,37 PLN brutto
- Wyższy (5-20 lat stażu): 1701,73 PLN brutto
- Najwyższy (powyżej 20 lat): 2042,09 PLN brutto

OKRES POBIERANIA:
- 6 miesięcy na obszarach o stopie bezrobocia do 150% średniej krajowej
- 12 miesięcy na obszarach o wyższej stopie bezrobocia (można sprawdzić w PUP)
- Wydłużony do 12 mies: wiek 50+ i 20+ lat stażu, lub rodzic samotnie wychowujący dziecko do lat 15
`,
    faq: `
P: Czy mogę pobierać zasiłek i jednocześnie szukać pracy w innym mieście?
O: Tak, ale co miesiąc musisz stawiać się w PUP na wyznaczony dzień (aktywizacja). Niestawienie się powoduje wykreślenie z listy.

P: Rozwiązałem umowę za porozumieniem stron -- czy dostanę zasiłek?
O: W większości przypadków TAK, ale z 90-dniowym odroczeniem wypłaty. Zasiłek zacznie się po 90 dniach od rejestracji.

P: Czy zasiłek dla bezrobotnych podlega podatkowi?
O: TAK, jest opodatkowany PIT i odprowadzana składka zdrowotna.
`,
    zrodlo: 'https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/swiadczenia-pieniezne/zasilek-dla-osob-bezrobotnych -- pobrano 2026-05-13',
  },

  'karta-duzej-rodziny': {
    formularzOpis: `
Wniosek o Kartę Dużej Rodziny (KDR) -- przez portal Emp@tia (empatia.mpips.gov.pl) lub w gminie/urzędzie.

WNIOSEK ONLINE (Emp@tia):
1. Zaloguj się profilem zaufanym
2. Wybierz "Karta Dużej Rodziny" --> "Złóż wniosek"
3. Wypełnij dane wszystkich członków rodziny (imiona, PESEL, daty urodzenia)
4. Dla dzieci powyżej 18 lat -- dołącz zaświadczenie ze szkoły/uczelni (do 25 roku życia)
5. Karta wysyłana jest automatycznie lub można wybrać kartę fizyczną (za opłatą 9,21 PLN za plastikową kartę)

POLA WNIOSKU:
- Dane małżonków/rodziców: imię, nazwisko, PESEL, adres
- Dane dzieci: imię, nazwisko, PESEL, data urodzenia, typ (biolog., adoptowane, w rodzinie zastępczej)
- Jeśli dziecko niepełnosprawne: numer orzeczenia o niepełnosprawności (brak wiekowego limitu)

DOKUMENTY (rzadko potrzebne, system weryfikuje automatycznie z PESEL):
- Zaświadczenie ze szkoły lub uczelni (dla dzieci 18-25 lat)
- Orzeczenie o niepełnosprawności (dla dorosłych dzieci bez limitu wieku)
`,
    szczegolyKwalifikacji: `
Karta przysługuje rodzicom (lub opiekunom) z co najmniej 3 dzieci:
- Dzieci do 18 lat (bez kryterium dochodowego)
- Dzieci do 25 lat jeśli się uczą
- Dzieci niepełnosprawne bez limitu wieku
- Rodziny zastępcze i adopcyjne również się kwalifikują

ZBIOROWE RABATY 2026 -- przykładowe:
- PKP/PKS: 37% zniżki (rodzice i małe dzieci), 49% (dzieci do 18 lat)
- Muzea państwowe: bezpłatny wstęp
- Parki narodowe: bezpłatny wstęp
- Apteki: rabaty na leki (nieobjęte refundacją)
- Cinema City, Helios, Multikino: rabaty na bilety
- Stacje benzynowe, sklepy: rabaty u partnerów (lista na aplikacji Karta Dużej Rodziny)

Karta jest BEZPŁATNA (wersja elektroniczna na tel. lub plastikowa za 9,21 PLN).
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/karta-duzej-rodziny-ogolne -- pobrano 2026-05-13',
  },

  'dobry-start': {
    formularzOpis: `
Wniosek o świadczenie Dobry Start (300 PLN) -- wyłącznie elektronicznie:
- PUE ZUS (pue.zus.pl)
- Bankowość elektroniczna (większość banków)
- Portal Empatia

TERMIN SKŁADANIA: od 1 lipca do 30 listopada każdego roku.
Wypłata: do 30 dni od złożenia wniosku w lipcu/sierpniu, później do 2 miesięcy.

POLA:
- Dane rodzica/opiekuna: imię, nazwisko, PESEL, numer konta bankowego
- Dane dziecka: imię, nazwisko, PESEL, rok szkolny do którego idzie
- Potwierdzenie, że dziecko będzie uczestniczyło w zajęciach szkolnych w nowym roku szkolnym
`,
    szczegolyKwalifikacji: `
300 PLN raz w roku na każde dziecko uczące się w szkole (nie w przedszkolu ani zerówce).
Wiek: do ukończenia 20 roku życia, lub 24 lata jeśli dziecko niepełnosprawne.
Brak kryterium dochodowego.

NIE PRZYSŁUGUJE:
- Na dzieci w zerówce (roczne przygotowanie przedszkolne)
- Na studentów wyższych uczelni
- Na dzieci w szkole dla dorosłych (wieczorówkach) -- PRZYSŁUGUJE jeśli uczeń ma < 20 lat

UWAGA: wniosek do 30 listopada -- po tym terminie prawa się nie nabywa w tym roku szkolnym.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/dobry-start -- pobrano 2026-05-13',
  },

  'ulga-dla-mlodych': {
    formularzOpis: `
BRAK OSOBNEGO FORMULARZA -- ulga działa automatycznie.
Pracodawca NIE pobiera zaliczki na PIT od wynagrodzenia osoby do 26 lat (do limitu 85.528 PLN rocznie).

Przy rocznym rozliczeniu (PIT-36 lub PIT-37):
- W polu "Przychody zwolnione od podatku na podstawie art. 21" wpisuje się przychody z pracy do limitu
- e-PIT (usługa podatki.gov.pl) wypełnia to automatycznie na podstawie danych od pracodawcy

JEŚLI MASZ KILKU PRACODAWCÓW: każdy aplikuje ulgę osobno, można przekroczyć limit.
Przy przekroczeniu 85.528 PLN -- trzeba dopłacić podatek w rocznym PIT.
`,
    szczegolyKwalifikacji: `
Ulga dla młodych (art. 21 ust. 1 pkt 148 ustawy PIT):
- Dotyczy: umowy o pracę, umowy zlecenie, staże uczniowskie, praktyki absolwenckie
- NIE dotyczy: działalności gospodarczej, umów o dzieło, najmu, kapitałów

Limit 2026: 85.528 PLN rocznie.
Zwolnione są: podatek PIT (17%/32%).
NIE są zwolnione: składki ZUS i NFZ (nadal pobierane).

Przy ukończeniu 26 lat w trakcie roku: ulga obowiązuje za miesiące przed urodzinami.
Pracodawca automatycznie przestaje stosować ulgę od miesiąca, w którym pracownik kończy 26 lat.
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

  // ---- KRUS -- nowe swiadczenia dla rolnikow ----

  'zwrot-akcyzy-paliwa-rolniczego': {
    szczegolyKwalifikacji: `
Zwrot akcyzy za paliwo rolnicze 2026 -- kluczowe fakty:

STAWKA: 1,48 PLN za litr oleju napedowego (ON)

LIMITY ROCZNE (lacznie z I i II polrocza):
- 162,80 PLN za hektar uzytków rolnych
- 5,92 PLN na 1 sztuke trzody chlewnej (srednia roczna liczba swini)
- 59,20 PLN na 1 DJP (duza jednostka przeliczeniowa) bydla, owiec, koz, koni

PRZYKLADOWE KWOTY:
- 50 ha grunty orne bez zwierzat: 50 x 162,80 = 8140 PLN rocznie
- 100 ha + 100 krow mlecznych (ok. 100 DJP): 100 x 162,80 + 100 x 59,20 = 22 200 PLN

TERMINY SKLADANIA WNIOSKOW:
I termin: od 1 lutego do 2 marca (wnioski za polrocze sierpien-styczen) -- wyplata do 30 kwietnia
II termin: od 1 sierpnia do 31 sierpnia (wnioski za polrocze luty-lipiec) -- wyplata do 31 pazdziernika

GDZIE ZLOZYC: Urzad gminy wlasciwy dla miejsca zamieszkania rolnika (NIE do ARiMR)

CO JEST WYMAGANE:
- Oryginalne faktury VAT za olej napedowy z wlasciwego okresu (faktura z nazwiskiem/firma rolnika)
- Zaswiadczenie o sredniej rocznej liczbie zwierzat (generuj sam z IRZplus lub pobierz z ARiMR)

CZEGO NIE OBEJMUJE:
- Benzyna, LPG, AdBlue
- Olej napedowy do transportu/samochodow osobowych
- Zakupy bez faktury VAT (paragony nie wystarczaja)
`,
    faq: `
P: Kupilem paliwo na paragon, czy dostane zwrot?
O: NIE. Wymagane sa FAKTURY VAT. Same paragony nie uprawniaja do zwrotu. Zadbaj o wystawianie faktur przy zakupie paliwa.

P: Czy moge zlozyc jeden wniosek za caly rok?
O: NIE. Sa dwa odrebne nabory rocznie. Mozesz zlozyc oba lub tylko jeden -- zwrot obejmuje faktury z danego polrocza.

P: Czy zwrot akcyzy jest opodatkowany?
O: TAK, stanowi przychod z dzialalnosci rolniczej dla celow podatkowych.

P: Jak wygenerowalem zaswiadczenie o zwierzetach z IRZplus?
O: Zaloguj sie na www.irz.arimr.gov.pl, przejdz do raportow i wygeneruj "Zaswiadczenie do zwrotu podatku akcyzowego".

P: Czy moge zlozyc wniosek przez internet?
O: Zalezy od gminy. Wiele gmin przyjmuje wnioski elektronicznie przez ePUAP, ale warto zapytac w urzedzie.
`,
    zrodlo: 'https://www.gov.pl/web/rolnictwo/zwrot-podatku-akcyzowego -- pobrano 2026-05-14',
  },

  'premia-dla-mlodego-rolnika': {
    szczegolyKwalifikacji: `
Premia dla mlodego rolnika ARiMR 2026 -- szczegoly:

KWOTY:
- 200 000 PLN dla gospodarstw bez produkcji zwierzecej lub z produkcja roslinno-zwierzeca
- 300 000 PLN dla gospodarstw z produkcja zwierzeca jako glownym kierunkiem (NOWOSC 2026)
Wyplata: 70% po podpisaniu umowy (I transza), 30% po realizacji biznesplanu (II transza)

WARUNKI WIEKOWE:
- Minimum 18 lat w dniu zlozenia wniosku
- Maksimum 40 lat (nieukonczone 41 lat) w dniu zlozenia wniosku
- Data urodzenia: jesli skonczysz 41 lat w trakcie naboru, juz sie NIE kwalifikujesz

WARUNKI DOTYCZACE DZIALALNOSCI:
- Nie mozes prowadzic dzialalnosci rolniczej dluzej niz 24 miesiace przed zlozeniem wniosku
- Albo mozesz jeszcze nie prowadzic dzialalnosci, ale musisz ja rozpoczac w ciagu 12 miesiecy od przyznania premii
- Musisz byc ubezpieczony w KRUS jako rolnik (lub zostac ubezpieczony po przyznaniu premii)

WYMOGI DOTYCZACE GOSPODARSTWA:
- Minimalna powierzchnia: wieksza niz wartosc referencyjna dla województwa (zazwyczaj od 1 ha)
- Maksymalna powierzchnia: 300 ha
- Minimalna wartosc ekonomiczna (SO): 15 000 EUR w punkcie wyjscia
- Maksymalna wartosc ekonomiczna: 150 000 EUR

BIZNESPLAN:
- Obowiazkowy, na 5 lat
- Musi wykazac wzrost wartosci ekonomicznej do minimum 15 000 EUR po 5 latach
- Minimum 60% przychodow z rolnictwa przez 5 lat od podpisania umowy

KWALIFIKACJE:
- Wyksztalcenie rolnicze (rolnicza szkola srednia lub wyzsze) LUB
- Minimum 3 lata stazu pracy w rolnictwie (potwierdzone dokumentami) LUB
- Zobowiazanie do uzupelnienia kwalifikacji w ciagu 36 miesiecy od zlozenia wniosku

NABOR 2026: Czerwiec -- lipiec 2026
UWAGA: Moze byc ostatni nabor w perspektywie 2023-2027
`,
    faq: `
P: Mam 41 lat, czy moge zlozyc wniosek?
O: NIE. Musisz miec nieukonczone 41 lat w DNIU ZLOZENIA wniosku.

P: Prowadze mala dzialalnosc rolnicza od 3 lat. Czy sie kwalifikuje?
O: NIE. Dzialalnosc rolnicza nie moze byc prowadzona dluzej niz 24 miesiace przed zlozeniem wniosku.

P: Czy moge dostac wiecej niz 200 000 PLN?
O: TAK, jesli Twoje gospodarstwo zajmuje sie glownie produkcja zwierzeca, kwota wynosi 300 000 PLN (nowos od 2026).

P: Kiedy beda wyplate?
O: Pierwsza transza (70%) wyplacana po podpisaniu umowy z ARiMR (kilka miesiecy po naborze). Druga transza (30%) po zrealizowaniu biznesplanu.

P: Co sie stanie jesli nie zrealizuje biznesplanu?
O: Mozesz byc zobowiazany do zwrotu calej lub czesci premii, plus odsetki. ARiMR ma prawo kontrolowac realizacje biznesplanu.
`,
    zrodlo: 'https://www.arimr.gov.pl -- pobrano 2026-05-14',
  },

  'doplaty-bezposrednie-arimr': {
    szczegolyKwalifikacji: `
Doplaty bezposrednie ARiMR 2026 -- szacunkowe stawki (ostateczne kwoty jesienia):

PODSTAWOWE PLATNOSCI:
- Podstawowe wsparcie dochodow (BISS): ~494,54 PLN/ha
- Platnosc redystrybucyjna (pierwsze 30 ha): ~171,41 PLN/ha
  >> Lacznie za pierwsze 30 ha: ~665,95 PLN/ha
- Platnosc dla malych gospodarstw (do 5 ha): ~960,57 PLN/ha (zamiast BISS + redystrybucji)
- Platnosc dla mlodych rolnikow (do 40 lat, max 75 ha): ~253,76 PLN/ha dodatkowe

EKOSCHEMATY (dodatkowe, dobrowolne):
- Za przestrzeganie GAEC 2 na TUZ: 581 PLN/ha
- Za przestrzeganie GAEC 2 na gruntach ornych: 627 PLN/ha
- Za przeksztalcenie gruntow ornych na uzytki zielone (5 lat): 2387 PLN/ha
- Za miedzyplony ozime / wsiewki: ~479,64 PLN/ha
- Rolnictwo weglanowe (zakaz odwadniania torfowisk): ~1200 PLN/ha

PLATNOSCI DO ZWIERZAT:
- Bydlo (krowy i byki): ~325,31 PLN/sztuke
- Krowy mleczne: ~416,20 PLN/sztuke (dodatkowa platnosc)
- Owce: ~111,13 PLN/sztuke
- Kozy: ~48,54 PLN/sztuke

WARUNEK "AKTYWNY ROLNIK" (nowe od 2026):
- Rolnicy, ktorzy dostali powyzej 1125 EUR doplat w 2025 r., musza wykazac koszty lub przychody
- Rolnicy ponizej 1125 EUR zwolnieni z wykazywania

TERMIN 2026: do 1 czerwca (wydluzony ze wzgledu na susze i wichury)
NORMALNE TERMIN: 15 maja

NOWE GAEC 7 (od 2026): obowiazek różnorodnosci upraw na gruntach ornych >10 ha
`,
    faq: `
P: Kiedy dostane wyplate doplat?
O: Doplaty wyplacane od listopada/grudnia 2026. Podstawowa czesc od 1 grudnia, reszta do konca roku.

P: Jak zlozyc wniosek o doplaty?
O: Przez system eWniosekPlus na stronie agencja.arimr.gov.pl. Mozesz tez przez agenta ARiMR (biuro powiatowe).

P: Czy moge zlozyc wniosek po 1 czerwca?
O: Tak, ale z opoznieniem -- za kazdy dzien po terminie ARiMR odlicza 1% doplaty (do 25 dni po terminie). Po 25 dniach wniosek nie jest przyjmowany.

P: Czym jest GAEC 7 i czy mnie dotyczy?
O: GAEC 7 to wymog roznorodnosci upraw na gruntach ornych o powierzchni ponad 10 ha. Od 2026 mozliwe sa kontrole. Sprawdz czy Twoje uprawy spelniaja wymogi.

P: Czy powinienem wnioskowac o ekoschematy?
O: Tak, jezeli spelniasz warunki. Ekoschematy zwieksza dochod z hektara o kilkaset do ponad 2000 PLN/ha. Warto sprawdzic ktory ekoschema spełniasz juz teraz (np. miedzyplony).
`,
    zrodlo: 'https://www.arimr.gov.pl/dla-beneficjenta/platnosci-bezposrednie.html -- pobrano 2026-05-14',
  },

  'zasilek-opiekunczy-krus': {
    szczegolyKwalifikacji: `
Zasilek opiekuńczy KRUS -- szczegoly:

STAWKA 2026: 1/30 emerytury podstawowej = 1780,64 PLN / 30 = 59,35 PLN za dzien opieki

KIEDY PRZYSLUGUJE:
1. Opieka nad zdrowym dzieckiem ponizej 8 lat (zamkniecie zlobka/przedszkola/szkoly)
2. Opieka nad chorym dzieckiem do 14 lat
3. Opieka nad chorym dzieckiem do 18 lat z niepelnosprawnoscia
4. Opieka nad chorym malzonkiem, rodzicami lub teściami
5. W zwiazku z porodem malzonki (partner)

MAKSYMALNY OKRES:
- 60 dni w roku kalendarzowym na dzieci do 14 lat
- 14 dni w roku na doroslich czlonkow rodziny (malzonek, rodzice, teściowie)
- Dodatkowe 60 dni na dziecko niepelnosprawne do 18 lat

WARUNKI:
- Minimum 1 rok ciaglego ubezpieczenia wypadkowego, chorobowego i macierzyńskiego w KRUS
- WYJATKI: przy wypadku przy pracy rolniczej lub naglaej chorobie -- brak okresu karencji

TERMIN ZGLOSZENIA: wniosek nalezy zlozyc do KRUS w ciagu 7 dni od powstania prawa

DOMOWNICY: Osoby ubezpieczone jako domownicy rolnika maja takie same prawa
`,
    faq: `
P: Czy moge dostac zasilek za opieke nad starszym rodzicem?
O: TAK. Zasilek przysluguje tez za opieke nad chorym malzonkiem, rodzicami i tesciem/tesciowa, ale max 14 dni rocznie.

P: Czy zasilek opiekuńczy KRUS jest wyzszy niz z ZUS?
O: Zasilek KRUS: 59,35 PLN/dzien (stala stawka). ZUS: 80% dziennej podstawy wymiaru (zalezy od zarobkow). Dla rolnikow ubezpieczonych w KRUS obowiazuje stawka KRUS.

P: Oboje jestesmy ubezpieczeni w KRUS. Czy oboje mozemy wniaskowac?
O: NIE. Za ten sam dzien zasilek przysluguje tylko JEDNEMU rodzicowi/opiekunowi.

P: Co jesli przedszkole jest zamkniete z powodu epidemii?
O: TAK, zasilek przysluguje za zamkniecie placowki z powodow sanitarnych, pogody lub strajku.
`,
    zrodlo: 'https://www.krus.gov.pl -- pobrano 2026-05-14',
  },

  'bon-senioralny': {
    szczegolyKwalifikacji: `
Bon senioralny 2026 -- szczegoly:

KWOTY (szacunkowe, zaleznie od wieku i stopnia niepelnosprawnosci):
- Seniorzy 85+, orzeczenie znaczne, samotni: do 2150 PLN/mies. w uslugach
- Pozostale grupy 75+: kwoty nizsze, ustalane indywidualnie przez MOPS
- Nie jest to gotowka -- gmina organizuje opiekuna

KRYTERIUM DOCHODOWE:
- Dochod nie wyzszy niz 3410 PLN brutto miesiecznie
- Podlega corocznej waloryzacji

WYMOGI:
- Ukonczony 75. rok zycia
- Orzeczenie o niepelnosprawnosci (umiarkowany lub znaczny) LUB zaswiadczenie lekarskie
- Zamieszkiwanie samotnie LUB wylacznie z innymi seniorami (np. oboje malzonkowie 75+)
- Potrzeba wsparcia w codziennym funkcjonowaniu

USLUGI OBEJETE BONEM:
- Opieka domowa (pomoc przy codziennych czynnosciach)
- Rehabilitacja
- Wsparcie pielegniarskie
- Fizjoterapia
- Asystent osoby starszej

HARMONOGRAM WDROZENIA:
- Pilotaz Q3 2026: woj. mazowieckie, wielkopolskie, dolnoslaskie, pomorskie
- Pelne wdrozenie w calej Polsce: I kwartal 2027
- Do tego czasu obowiazuje program Opieka 75+ i Korpus Wsparcia Seniorow

UWAGA: W 2026 (poza pilotem) nadal obowiazuja dotychczasowe programy. Bon senioralny je zastapi.
`,
    faq: `
P: Czy bede musial sam placic za opiekuna?
O: NIE. Bon senioralny pokrywa koszty uslug opiekuńczych, senior nie placi bezposrednio. Usluga jest finansowana ze srodkow publicznych do wysokosci bonu.

P: Co jesli mieszkam w duzym miescie poza pilotem?
O: Do uruchomienia pelnego programu (Q1 2027) korzystaj z programu Opieka 75+ (dla gmin do 60 000 mieszkancow) lub z Korpusu Wsparcia Seniorow (opaska SOS, 60+).

P: Czy dochod 3410 PLN to brutto czy netto?
O: Kryterium dochodowe 3410 PLN dotyczy dochodu brutto miesiecznie.

P: Czy mozna laczyc bon z innymi swiadczeniami?
O: TAK, bon senioralny nie wyklucza innych swiadczen (np. zasilku pielegnacyjnego, 13/14 emerytury).
`,
    zrodlo: 'https://www.infor.pl/twoje-pieniadze/swiadczenia/7516106 -- pobrano 2026-05-14',
  },

  'fundusz-wsparcia-kredytobiorcow': {
    szczegolyKwalifikacji: `
Fundusz Wsparcia Kredytobiorcow (FWK) 2026 -- szczegoly:

KWOTA I CZAS TRWANIA:
- Do 3000 PLN miesiecznie
- Maksymalnie 40 miesiecy (lacznie do 120 000 PLN)
- Kwota ustalana indywidualnie (nie zawsze 3000 PLN)

WARUNKI (wystarczy JEDEN z trzech):
1. Bezrobocie: wnioskodawca jest zarejestrowany jako bezrobotny
2. Rata > 40% dochodu: miesieczny koszt obslugi kredytu przekracza 40% miesiecznych dochodow gosp. domowego
3. Niski dochod po racie:
   - Gospodarstwo 1-osobowe: dochod netto po odjecia raty < 2525 PLN/mies.
   - Gospodarstwo wieloosobowe: dochod netto po odjecia raty / liczba czlonkow < 2057,50 PLN/os.

SPOSOB WYPLATY: Pieniadze trafia BEZPOSREDNIO do banku jako czesc raty -- nie na konto wnioskodawcy

SPLACANIE WSPARCIA:
- Spłata zaczyna sie po 2 latach od ostatniej wyplaty wsparcia
- 200 rownych, nieoprocentowanych rat
- Jesli splacisz 134 z 200 rat bez opoznienia --> POZOSTALE RATY UMORZONE (ok. 33% kwoty)
- Przyklad: Wsparcie 60 000 PLN. Spłata = 200 x 300 PLN = 60 000 PLN, ale po 134 ratach umorzenie --> placisz ok. 40 200 PLN

GDZIE SKLADAC WNIOSEK: W banku, ktory udzielil Ci kredytu hipotecznego (nie w BGK bezposrednio)
BGK (Bank Gospodarstwa Krajowego) zarzadza funduszem i wydaje ostateczna decyzje.

WYMOGI:
- Kredyt hipoteczny na mieszkanie lub dom na wlasne potrzeby
- Nie dotyczy kredytow inwestycyjnych ani na wynajem
`,
    faq: `
P: Czy moge dostac wsparcie jesli mam chwilowe problemy z praca?
O: TAK, jezeli jestes zarejestrowany jako bezrobotny LUB rata przekracza 40% dochodu.

P: Czy wystarczy ze jeden z malzonkow jest bezrobotny?
O: Tak, jezeli wspolnie prowadzicie gospodarstwo domowe i razem obslugujecie kredyt.

P: Czy wsparcie z FWK to pozyczka?
O: Tak, ale specjalnego rodzaju: bez oprocentowania, a 33% mozna umorzyc przy terminowej splacie.

P: Czy bank moze odmowic zlozenia wniosku do FWK?
O: Nie powinien -- bank ma obowiazek przyjac i przekazac wniosek do BGK. Jesli odmawia, zlosc reklamacje.

P: Co jesli po otrzymaniu wsparcia moja sytuacja sie poprawie?
O: Poinformuj bank -- wsparcie moze zostac wstrzymane, jesli przyczyna jego przyznania ustala.
`,
    zrodlo: 'https://www.bgk.pl/produkty/fundusz-wsparcia-kredytobiorcow/ -- pobrano 2026-05-14',
  },

  'opieka-wytchnieniowa': {
    szczegolyKwalifikacji: `
Opieka wytchnieniowa -- szczegoly programu:

KTO MOZE SKORZYSTAC:
- Czlonkowie rodziny lub opiekunowie faktyczni osob z orzeczeniem o znacznym stopniu niepelnosprawnosci
- Opiekunowie dzieci z orzeczeniem o niepelnosprawnosci (bez wskazania stopnia, jezeli wskazano koniecznosc stalej opieki)

LIMIT GODZIN/DNI:
- Pobyt dzienny: do 240 godzin w roku kalendarzowym
- Pobyt calodobowy: do 14 dni (336 godzin) w roku kalendarzowym
- Mozna laczyc obie formy

KOSZT: BEZPLATNY dla uczestnikow -- finansowany z Funduszu Solidarnosciowego (budzetowe)

KOGO MOZNA ZASTEPIC:
- Opiekuna, ktory sprawuje bezposrednia opieke nad osoba ze znacznym stopniem niepelnosprawnosci
- Opiekunem moze byc malzonek, rodzic, dziecko, opiekun prawny

FORMY REALIZACJI:
- Przez dom pomocy spolecznej, osrodek wsparcia (form. dzienna)
- Przez organizacje pozarzadowe (NGO) z umowa z MOPS
- Przez asystenta osoby niepelnosprawnej
- W miejscu zamieszkania lub w placowce

WAZNA UWAGA: Nie kazda gmina przystepuje do programu. Gminy sa wybierane przez Ministerstwo Rodziny w ramach naboru.
`,
    faq: `
P: Czy podczas opieki wytchnieniowej moge gdzies wyjechac?
O: TAK. Celem programu jest wlasnie danie opiekunowi czasu dla siebie -- na odpoczynek, wizyte u lekarza, sprawy osobiste.

P: Czy moje dziecko niepelnosprawne musi miec stopien "znaczny"?
O: Dla dzieci wymagane jest orzeczenie o niepelnosprawnosci (ze wskazaniem stalej lub dlugotrwalej opieki), nawet bez stopnia.

P: Co jesli MOPS powie ze nie ma programu?
O: Zapytaj czy gmina planuje przystapic w nastepnym roku. Mozesz tez sprawdzic inne formy wsparcia: swiadczenie pielegnacyjne (3386 PLN/mies.) lub zasilek dla opiekuna.

P: Czy opieka wytchnieniowa wyklucza swiadczenie pielegnacyjne?
O: NIE, mozna korzystac z obu. Sa to odrebne programy.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina/opieka-wytchnieniowa -- pobrano 2026-05-14',
  },

  // ---- PRAWA OBYWATELSKIE ----

  'fundusz-alimentacyjny': {
    szczegolyKwalifikacji: `
Fundusz alimentacyjny -- szczegoly 2026:

KWOTA:
- Max 1000 PLN miesieczne na dziecko
- Ale nie wiecej niz kwota zasadzonych alimentow (jesli alimenty = 600 PLN, dostaniesz 600 PLN, nie 1000)

KRYTERIUM DOCHODOWE:
- Do 30 wrzesnia 2026 r.: 1209 PLN netto na osobe w rodzinie
- Od 1 pazdziernika 2026 r.: 1665 PLN netto na osobe w rodzinie

ZASADA "ZLOTOWKA ZA ZLOTOWKE":
Jesli przekroczysz prog np. o 100 PLN, swiadczenie zmniejszy sie o 100 PLN (nie do zera)
Przyklad: dochod na osobe = 1309 PLN (przekroczenie o 100 PLN) --> swiadczenie = 1000 - 100 = 900 PLN

WARUNKI OBOWIAZKOWE:
1. Zasadzone alimenty: wyrok sadu lub ugoda sadowa
2. Bezskuteczna egzekucja: zaswiadczenie komornika ze nie moze sciagnac alimentow od dluznika

UPRAWNIONE DZIECI:
- Do 18 roku zycia
- Do 25 roku zycia jezeli sie ucza (szkola lub uczelnia)
- Bez ograniczen wieku jezeli maja orzeczenie o znacznym stopniu niepelnosprawnosci

TERMINY:
- Elektronicznie (Empatia, PUE ZUS, bank): od 1 lipca
- W MOPS: od 1 sierpnia
- Nowy okres swiadczeniowy: od 1 pazdziernika do 30 wrzesnia nastepnego roku
`,
    faq: `
P: Mam alimenty, ale eks czasem placi a czasem nie. Czy moge wniaskowac?
O: Warunkiem jest bezskutecznosc egzekucji komorniczej. Jesli komornik nie moze sciaganac alimentow (dluznik nie ma majatku, ukrywa dochody), mozesz sie ubiegac.

P: Co jesli moj dochod jest tuz powyzej progu 1209 PLN?
O: Zasada "zlotowka za zlotowke" -- swiadczenie jest pomniejszane o nadwyzke, nie zerowane. Warto wniaskowac nawet przy niewielkim przekroczeniu progu.

P: Czy fundusz bedzie sciagal pieniadze od mojego eks?
O: TAK. Panstwo wyplaci Ci swiadczenie, ale jednoczesnie fundusz dochodzi od dluznika zwrotu tych kwot. Twoje alimenty nie znikaja, fundusz je przejmuje.

P: Moje dziecko ma 19 lat i studiuje. Czy moge wniaskowac?
O: TAK. Dziecko do 25 roku zycia pod warunkiem ze sie uczy (szkola, uczelnia). Wymagane zaswiadczenie z uczelni.

P: Alimenty wynosza 2000 PLN, ale fundusz wyplaca max 1000 PLN. Co z reszta?
O: Fundusz wyplaca max 1000 PLN. Pozostale 1000 PLN to nadal Twoje alimenty -- mozesz egzekwowac je przez komornika rownolegle.
`,
    zrodlo: 'https://www.gov.pl/web/rodzina -- pobrano 2026-05-14',
  },

  'nieodplatna-pomoc-prawna': {
    szczegolyKwalifikacji: `
Nieodplatna pomoc prawna 2026 -- szczegoly:

DOSTEPNOSC:
- Od 1 stycznia 2026 r.: kazdy kto zlozy oswiadczenie ze nie moze poniesc kosztow
- Oswiadczenie jest samocertyfikowane -- nikt nie weryfikuje dokumentow dochodowych
- 1483 punkty w Polsce (co najmniej 1 na kazdy powiat)
- NOWOS od 2026: mozesz korzystac z DOWOLNEGO punktu w calym kraju

ZAKRES POMOCY:
1. Porada prawna (co mi przysluguje, jak postapic, co grozi)
2. Pomoc w sporzadzeniu pisma (odwolanie, wniosek do urzedu, skarga)
3. Wyjasnienie przepisow (umowy, prawa, obowiazki)
4. Nieodplatne poradnictwo obywatelskie (w tych samych punktach)

CZEGO NIE OBEJMUJE:
- Zastepstwo procesowe w sadzie (nie pojdzie za Ciebie do sadu)
- Sporzadzanie umow handlowych
- Pomoc prawna dla firm (wyjatkiem jest jednoosobowy przedsiebiorca bez pracownikow)

PRZEDSIEBIORCY:
- Jednoosobowa dzialalnosc gospodarcza bez pracownikow: moze korzystac z pomocy
- Firmy zatrudniajace pracownikow: nie sa uprawnione

POMOC ZDALNA:
- Od 2026 r. telefonicznie lub e-mailem, bez koniecznosci wizyty osobistej
- Szczegolnie dla osob z ograniczona mobilnoscia lub za granica
`,
    faq: `
P: Czy moge poprosic o pomoc w sporze z pracodawca?
O: TAK. Prawnik doradzi Ci co Ci przysluguje (odprawa, zwolnienie niezgodne z prawem, mobbing), pomoze sporzadzic pismo do PIP lub pismo przedsadowe.

P: Czy mozna prosic o pomoc w sprawie komornika?
O: TAK. To jeden z najczestszych tematow w punktach NPP -- prawa dluznika, co komornik moze zajac, jak zaprotestowac.

P: Jak znalezc najblizszy punkt?
O: Wejdz na nieodplatnapomoc.gov.pl i wpisz swoja miejscowosc. Mozna tez zadzwonic do starostwa powiatowego.

P: Czy moge przyjsc bez umowienia?
O: Zalezy od punktu. Wiele przyjmuje z umowieniem, niektorych bez. Warto najpierw zadzwonic.

P: Ile razy moge korzystac?
O: Nie ma limitu wizyt. Mozesz korzystac z pomocy prawnej wielokrotnie w roznych sprawach.
`,
    zrodlo: 'https://www.gov.pl/web/nieodplatna-pomoc -- pobrano 2026-05-14',
  },

  'prawo-do-dokumentacji-medycznej': {
    szczegolyKwalifikacji: `
Prawo do dokumentacji medycznej -- szczegoly:

CO JEST OBJETE:
- Historia choroby (ambulatoryjna i szpitalna)
- Karty leczenia szpitalnego i wypisowe
- Wyniki badan laboratoryjnych i obrazowych (RTG, USG, MRI, CT)
- Opisy zabiegow i operacji
- Zaswiadczenia lekarskie
- Recepty i skierowania (historia)
- Dokumentacja stomatologiczna

BEZPLATNA PIERWSZA KOPIA:
- Pierwsza kopia kazdego rodzaju dokumentu = BEZPLATNA
- Podstawa prawna: RODO (art. 15) + ustawa o prawach pacjenta
- Dotyczy wylacznie KOPII (oryginaly zostaja w placowce)

KOLEJNE KOPIE TEGO SAMEGO DOKUMENTU:
- Moga byc odplatne
- Maksymalna stawka uregulowana ustawowo (nie moze byc dowolna)

TERMIN:
- "Niezwlocznie, nie pozniej niz w ciagu miesiaca" (RODO)
- W pilnych przypadkach mozna prosic o przyspieszenie

FORMA WNIOSKU:
- USTNA (np. telefoniczne) -- jest wazna
- Pisemna
- Elektroniczna
- Placowka NIE MOZE zadac pisemnej formy jesli wolisz ustna

ODMOWA:
- Placowka nie ma prawa odmowic
- Jesli odmawia: skarga do Rzecznika Praw Pacjenta, tel. 800 190 590 (bezplatna infolinia)
- RPP moze nalozyc kare finansowa na placowke
`,
    faq: `
P: Szpital chce pobrac oplate za wydanie dokumentacji. Czy musi?
O: Za PIERWSZA kopie kazdego rodzaju dokumentu -- NIE. Pierwsza kopia jest bezplatna z mocy prawa. Mozna zlozyc skarge do RPP jesli szpital odmawia lub pobiera oplate.

P: Lekarz mowi ze musi wiedziec "po co" potrzebuje dokumentow. Czy musi uzasadniac?
O: NIE. Placowka nie ma prawa pytac o cel. Wniosek nie wymaga uzasadnienia.

P: Chce uzyskac dokumentacje po smierci mamy. Czy moge?
O: TAK. Po smierci pacjenta dokumentacje moga uzyskac: malzonek, dzieci, rodzice, rodzenstwo lub osoba przez pacjenta upowazniona za zycia.

P: Jak dlugo placowka musi przechowywac dokumentacje?
O: Co do zasady 20 lat od ostatniego wpisu (lub do 30 lat po smierci pacjenta). Dzieci: 22 lata od urodzenia.

P: Czy moge dostac dokumentacje z zamknietej przychodni?
O: TAK. Zamknieta placowka musi przekazac dokumentacje do podmiotu przejmujacego lub do wlasciwego archiwum. Mozna zapytac NFZ gdzie trafi dokumentacja.
`,
    zrodlo: 'https://www.gov.pl/web/rpp/prawo-do-dokumentacji-medycznej -- pobrano 2026-05-14',
  },

  'fundusz-kompensacyjny-zdarzen-medycznych': {
    szczegolyKwalifikacji: `
Fundusz Kompensacyjny Zdarzen Medycznych -- szczegoly (od 1 VII 2024):

WAZNA ZMIANA: Komisje Wojewodzkie zlikwidowane od 1 lipca 2024 r.
Zastapit je Fundusz Kompensacyjny Zdarzen Medycznych przy Rzeczniku Praw Pacjenta.

MAKSYMALNE KWOTY:
- Zakazenie, uszkodzenie ciala, rozstroj zdrowia: do 100 000 PLN
- Smierc pacjenta: do 300 000 PLN (lacznie dla wszystkich uprawnionych czlonkow rodziny)

OPIATA ZA WNIOSEK: 300 PLN
- Zwracana gdy Fundusz uzna zdarzenie medyczne
- Zatrzymywana gdy odmowi

TERMIN:
- Rok od dowiedzenia sie o zdarzeniu
- Nie pozniej niz 3 lata od samego zdarzenia medycznego
- Po uplywaniu tych terminow prawo wygasa bezpowrotnie

CO TO JEST "ZDARZENIE MEDYCZNE":
- Zakazenie pacjenta biologicznym czynnikiem chorobotworzym
- Uszkodzenie ciala lub rozstroj zdrowia pacjenta
- Smierc pacjenta beda nastepstwem nieprawidlowych dzialan podmiotu leczniczego

CZAS POSTEPOWANIA: 4 miesiace od zlozenia kompletnego wniosku

PO POZYTYWNEJ DECYZJI:
- Fundusz proponuje kwote odszkodowania
- Mozesz przyjac propozycje (szybki pieniadz)
- Mozesz odrzucic i isc do sadu o wyzsza kwote
- Odrzucenie propozycji funduszu nie zamyka drogi sadowej

DOTYCZY:
- Podmiotow leczniczych (szpitale, kliniki, centra medyczne)
- Nie dotyczy drobnych gabinetow nieprowadzonych jako podmiot leczniczy
`,
    faq: `
P: Chce zlozyc wniosek do Komisji Wojewodzkiej. Gdzie to jest?
O: Komisje Wojewodzkie zostaly ZLIKWIDOWANE od 1 lipca 2024 r. Teraz zglaszasz sie do Funduszu Kompensacyjnego Zdarzen Medycznych przy Rzeczniku Praw Pacjenta (rpp.gov.pl).

P: Leczono mnie w 2022 r. i teraz mam problemy zdrowotne z tym zwiazane. Czy moge wniaskowac?
O: Tak, jezeli od dowiedzenia sie o zdarzeniu nie uplynelo rok I od samego zdarzenia nie uplynely 3 lata. Jesli zdarzenie bylo w 2022 r., a teraz jest 2026 r. -- 4 lata minelo, termin upadl.

P: Jak wysokie odszkodowanie moge dostac?
O: Do 100 000 PLN za uszkodzenie ciala lub rozstroj zdrowia, do 300 000 PLN przy smierci pacjenta (lacznie dla calej rodziny). Konkretna kwote ustala Fundusz.

P: Co jesli propozycja funduszu jest za niska?
O: Mozesz odrzucic propozycje i wytoczyc proces sadowy. Decyzja funduszu nie blokuje drogi sadowej.

P: Czy musze miec adwokata?
O: Nie jest wymagany, ale przy skomplikowanych sprawach lub wyzszych kwotach warto. Mozesz najpierw skonsultowac sie bezplatnie w punkcie nieodplatnej pomocy prawnej.
`,
    zrodlo: 'https://www.gov.pl/web/rpp/fundusz-kompensacyjny-zdarzen-medycznych -- pobrano 2026-05-14',
  },

  'odprawa-pracownicza': {
    szczegolyKwalifikacji: `
Odprawa pracownicza -- szczegoly 2026:

PODSTAWA PRAWNA: Ustawa z 13 marca 2003 r. o szczegolnych zasadach rozwiazywania stosunkow pracy z przyczyn niedotyczacych pracownikow

WARUNKI:
1. Firma zatrudnia CO NAJMNIEJ 20 pracownikow
2. Rozwiazanie umowy z PRZYCZYN NIEDOTYCZACYCH PRACOWNIKA:
   - Likwidacja stanowiska pracy
   - Restrukturyzacja / redukcja etatow
   - Trudna sytuacja ekonomiczna pracodawcy
   - Likwidacja lub upadlosc firmy
3. NIE przysluguje przy: zwolnieniu dyscyplinarnym, rezygnacji pracownika, uplywie umowy terminowej

WYSOKOSC:
- Staz < 2 lata: 1x miesieczne wynagrodzenie
- Staz 2-8 lat: 2x miesieczne wynagrodzenie
- Staz > 8 lat: 3x miesieczne wynagrodzenie
Staz liczony u TEGO pracodawcy (nie calkowity staz pracy w zyciu)

MAKSIMUM:
- 15-krotnosc minimalnego wynagrodzenia
- W 2026 r.: 15 x 4806 PLN = 72 090 PLN brutto

KIEDY WYPLACANA:
- W dniu rozwiazania stosunku pracy lub przy ostatniej wyplacie wynagrodzenia

ODPRAWA A OPODATKOWANIE:
- Odprawa jest opodatkowana PIT (wlaczana do dochodu)
- Podlega tez skladkom ZUS (inaczej niz odprawa emerytalna)
`,
    faq: `
P: Pracodawca powiedzial ze jestem zwolniony "za porozumieniem stron". Czy dostane odprawa?
O: TAK, jesli rozwiazanie umowy nastepuje Z PRZYCZYN LEZACYCH PO STRONIE PRACODAWCY i firma ma min. 20 pracownikow. Forma rozwiazania (wypowiedzenie vs. porozumienie) nie wyklucza odprawy -- liczy sie przyczyna.

P: Pracodawca twierdzi ze mnie zwalniam "z winy pracownika". Czy moge sie odwolac?
O: TAK. Mozesz zaprotestowac do sadu pracy lub zlozyc skarge do PIP. Pracodawca musi udowodnic ze przyczyna lezala po Twojej stronie.

P: Firma ma 15 pracownikow. Czy moge dostac odprawa?
O: NIE. Odprawa z tej ustawy przysluguje tylko przy firmach zatrudniajacych minimum 20 pracownikow.

P: Pracodawca nie chce wyplacic odprawy. Co robic?
O: Zloz skarge do Panstwowej Inspekcji Pracy (pip.gov.pl) -- bezplatna i mozliwa anonimowo. Alternatywnie: pozew do sadu pracy -- koszt to 30 PLN lub zero przy niskich zarobkach.

P: Czy odprawa wlicza sie do dochodu przy innych swiadczeniach?
O: TAK, odprawa jest opodatkowanym przychodem ze stosunku pracy i wlicza sie do dochodu.
`,
    zrodlo: 'https://www.pip.gov.pl -- pobrano 2026-05-14',
  },
};
