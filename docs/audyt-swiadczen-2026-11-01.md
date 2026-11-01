# Audyt bazy świadczeń: stan na 1 listopada 2026

Zakres: wszystkie 133 wpisy w `src/engine/benefits/*.ts`, wiedza agentów czatu (`src/agents/*`), rozszerzona wiedza AI (`src/ai/benefitKnowledge.ts`) i liczby pokazywane w UI.

## Wynik w skrócie

- Przejrzane: **133 z 133** wpisów (kwoty, progi, wiek, terminy, status programu) i **133 linki do źródeł** (curl z przekierowaniami).
- Poprawione: **33 wpisy**, w tym 4 formy pomocy, które już nie istnieją, i 1 świadczenie opisane błędnie od początku.
- Potwierdzone oficjalnym źródłem z datą 1.11.2026: 54 wpisy (pole `dataWeryfikacji`).
- Silnik dopasowań podsuwał użytkownikom zakończone programy (Mój Prąd, bon energetyczny, dodatek osłonowy, Mieszkanie na Start). Nowe pole `zakonczony: true` zostawia je w bazie jako informację, ale wyłącza z dopasowań. Takich wpisów jest 9, aktywnych dopasowań 124.
- Liczby w UI: baza ma **133** świadczenia w **13** kategoriach. Agenci czatu i README podawali 118, część stron 15 kategorii: poprawione wszędzie. Baza programów B2B ma 59 programów (było 57 w AGENTS.md i README).

## Najważniejsze błędy

1. **Rynek pracy po reformie z 1.06.2025** (ustawa z 20 marca 2025 r. o rynku pracy i służbach zatrudnienia): baza nadal opisywała bon stażowy, bon szkoleniowy dla osób do 30 lat, przygotowanie zawodowe dorosłych i Program Aktywizacja i Integracja. Na liście form pomocy PUP ich nie ma. Kwoty PUP były sprzed waloryzacji z 1.06.2026 (stypendium stażowe 2755,10 zamiast 2854,30 PLN itd.).
2. **Zasiłek opiekuńczy KRUS**: wpis opisywał świadczenie, którego KRUS nie wypłaca (59,35 PLN dziennie, 60 dni w roku). KRUS miał zasiłek opiekuńczy tylko czasowo (COVID-19, powódź 2024). To samo w `benefitKnowledge.ts`.
3. **Bezpłatne leki**: agent NFZ mówił o lekach dla seniorów 75+, a od 1.09.2023 obowiązuje 65+.
4. **Składka zdrowotna** w wiedzy AI: 381,78 PLN (stawka z 2024) zamiast 432,54 PLN (od lutego 2026); w Uldze na Start 381 PLN.
5. **Strona /wnioski**: zasiłek stały „do 1901 PLN” (ustawowo max 1229), bon szkoleniowy „do 16 000 PLN”, dotacja „do 45 000 PLN”, dodatek energetyczny jako aktywny (zawieszony do 31.12.2027).

## Zmiany w bazie świadczeń

| Świadczenie | Było | Jest | Źródło |
|---|---|---|---|
| Stypendium stażowe | 2755,10 PLN | 2854,30 PLN (160% zasiłku, od 1.06.2026) | https://psz.praca.gov.pl/rynek-pracy/stawki-kwoty-wskazniki |
| Bon na zasiedlenie | do 18 395,58 PLN | do 18 466,30 PLN | jw. |
| Bon szkoleniowy | do 9 197,79 PLN, tylko do 30 lat | Bon na kształcenie ustawiczne: do 9 233,20 PLN, bez limitu wieku | https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/podnoszenie-kwalifikacji/bony-na-ksztalcenie-ustawiczne |
| Bon stażowy | aktywny, premia 2222,60 PLN | zlikwidowany 1.06.2025, wyłączony z dopasowań | https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia (brak na liście) + stawki PSZ |
| Dotacja na działalność z PUP | do 55 186,74 PLN | do 55 398,78 PLN | stawki PSZ |
| Refundacja opieki nad dzieckiem | do lat 6, 861 PLN | do lat 7, 892 PLN, do 6 mies. po podjęciu pracy lub przez cały staż | https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/refundacja-kosztow-opieki-nad-dzieckiem-do-lat-7-lub-osoba-zalezna |
| Roboty publiczne | do ok. 4599 PLN | do 5520,96 PLN | stawki PSZ |
| Szkolenie z PUP | stypendium 2066,28 PLN | 2140,70 PLN | stawki PSZ |
| Przygotowanie zawodowe dorosłych | aktywne („staż plus”) | zlikwidowane 1.06.2025, wyłączone z dopasowań | lista form pomocy PSZ |
| Program Aktywizacja i Integracja | aktywny | zastąpiony reintegracją społeczną (stypendium 1070,40 PLN, do 6 mies.) | https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/reintegracja-spoleczna |
| Zasiłek dla bezrobotnych | uwaga „wszyscy min. 100%” | 100% przy stażu poniżej 20 lat, 120% przy 20+ (2140,70 / 1681,10 PLN) | https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/swiadczenia-pieniezne/zasilek-dla-osob-bezrobotnych |
| Ulga na Start | zdrowotna ok. 381 PLN, link do złej strony | min. 432,54 PLN, link do 00285 | https://www.biznes.gov.pl/pl/portal/00285 |
| Preferencyjny ZUS | „zamiast ok. 1600 PLN” | zamiast ok. 1927 PLN | jw. (pełny ZUS 2026) |
| Wakacje składkowe | 1600 PLN | do ok. 1927 PLN (pełny ZUS), ok. 456 PLN przy preferencyjnym | https://www.zus.pl/baza-wiedzy/biezace-wyjasnienia-komorek-merytorycznych/wakacje-skladkowe-pytania-i-odpowiedzi |
| Zasiłek opiekuńczy KRUS | 59,35 PLN/dzień, 60 dni | brak stałego świadczenia, tylko przepisy szczególne; wyłączony z dopasowań | https://www.gov.pl/web/krus/kwoty-swiadczen |
| Premia dla młodego rolnika | link do strony głównej ARiMR | link do naboru 2026 (1.06-30.07.2026, zakończony) | https://www.gov.pl/web/arimr/premie-dla-mlodych-rolnikow--nabor-od-1-czerwca-do-30-lipca-2026-r |
| Aktywny samorząd (PFRON) | link 404, „zakup samochodu do 27 000 PLN”, moduł II do 4000/8000 PLN | zadania i terminy 2026 wg komunikatu PFRON (prawo jazdy do 3200/4820 PLN, dodatek 1155/1733 PLN za semestr) | https://www.pfron.gov.pl/o-funduszu/programy-i-zadania-pfron/programy-i-zadania-real/aktywny-samorzad/komunikaty/aktywny-samorzad-w-2026-roku/ |
| Turnusy rehabilitacyjne | 1840-2207 PLN | 25-30% przeciętnego wynagrodzenia (ok. 2308-2770 PLN przy II kw. 2026), opiekun 20% | https://www.pfron.gov.pl/osoby-niepelnosprawne/rehabilitacja/turnusy-rehabilitacyjne/ |
| Opieka wytchnieniowa | „do 240 godzin dziennie” | do 240 godzin rocznie lub 14 dni całodobowo | niepelnosprawni.gov.pl (bez zmiany linku) |
| Bon turystyczny (regionalny) | tekst bez polskich znaków, link do zakończonego bonu krajowego | regiony 2026 i kwoty 300-500 PLN, ostrzeżenie przed fałszywymi stronami | bankier.pl, money.pl, interia.pl (brak jednego źródła rządowego) |
| Bezpłatne leki 65+ | „ponad 2000 preparatów, lista co 2 miesiące” | kilka tysięcy pozycji, nowe zasady aktualizacji od 1.10.2026 | odpowiedź MZ na interpelację 18028, gazetaprawna.pl |
| Cytologia | co 3 lata | co 3 lata albo test HPV HR co 5 lat (od 1.07.2025) | komunikaty NFZ i samorządów |
| Stypendium socjalne | próg 1908,90 PLN | 2099,70 PLN w roku 2026/2027 (45% płacy minimalnej z 1.01.2025) | https://www.gov.pl/web/nauka/swiadczenia-dla-studentow-w-roku-akademickim-2025-2026 (reguła 45%) |
| Stypendium szkolne | gminne progi podane jako ogólne | kwotę 99,20-248 PLN ustala regulamin gminy | https://www.gov.pl/web/edukacja/stypendium-szkolne-oraz-zasilek-szkolny |
| 800+, becikowe | link do strony głównej gov.pl | ZUS 800+ i „Uzyskaj becikowe” | https://www.zus.pl/swiadczenia/swiadczenia-dla-rodzin/swiadczenie-wychowawcze-800-plus |
| Ulga na leki | link do pit.pl | podatki.gov.pl | https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-rehabilitacyjna-pit/ |
| Mieszkanie na Start | „zastąpiony przez Pierwsze Klucze i RKM” | Pierwsze klucze tylko zapowiadane, startu nie potwierdzono | gov.pl (projekt ustawy) |
| Mój Prąd, bon energetyczny, dodatek osłonowy, Mieszkanie na Start, dodatek energetyczny | dopasowywane jak aktywne | `zakonczony: true`, wyłączone z dopasowań | jak w opisach wpisów |

## Potwierdzone bez zmian (wybrane)

Kwoty z tabeli KRUS „Wysokość świadczeń od 1 marca 2026 r.” (https://www.gov.pl/web/krus/kwoty-swiadczen) zgadzają się z bazą: najniższa emerytura i renta socjalna 1978,49 PLN, dodatek pielęgnacyjny i kombatancki 366,68 PLN, dodatek kompensacyjny 55 PLN, sieroty zupełnej 689,17 PLN, ryczałt energetyczny 336,16 PLN, zasiłek pogrzebowy 7000 PLN, świadczenie uzupełniające 500 PLN (próg 2687,67 PLN), honorowe 100+ 6938,92 PLN, zasiłek chorobowy KRUS 25 PLN, odszkodowanie KRUS 1431 PLN za 1%, zasiłek macierzyński KRUS 1000 PLN. Stawki PSZ potwierdzają też zasiłek dla bezrobotnych (1783,90 / 1400,90 PLN), dofinansowanie 50+ (2403 PLN) i prace interwencyjne (4806 PLN). Zasiłek stały max 1229 PLN, kryteria 1010/823 PLN, świadczenie pielęgnacyjne 3386 PLN, IKZE 11 304 PLN, ulga dla młodych 85 528 PLN, premia dla młodego rolnika 200/300 tys. PLN, dodatek energetyczny zawieszony do 31.12.2027.

## Poza bazą świadczeń

- `src/engine/matcher.ts`: pomijanie wpisów `zakonczony`, „Sprawdź wykluczenie” z polskim znakiem, bez „--” w ostrzeżeniu.
- Agenci czatu: dotacje (zasiłek, dotacja z PUP, staż, bony, Mój Prąd jako zakończony, wakacje składkowe do 10 ubezpieczonych), świadczenia, wnioski, konsjerż (kryterium 823 PLN zamiast 776 PLN), NFZ (65+, turnusy), wszędzie 133 zamiast 118 świadczeń.
- UI: /wnioski (kwoty PUP i MOPS), /dla-firm (bez dodatku osłonowego), /o-projekcie, manifest i ekran czatu (13 kategorii).

## Do weryfikacji

1. **czystepowietrze.gov.pl** nie odpowiada z tego środowiska: kwoty i progi Czystego Powietrza (66/99/135 tys. PLN) oraz progi dochodowe w wiedzy agenta dotacje (1090/1526 PLN) zostały bez zmian. Wyszukiwarka pokazuje inne progi (1300/1800 PLN), ale tylko z serwisów pośrednich.
2. **Szkolenie z PUP**: limit 27 593,37 PLN (300% przeciętnego wynagrodzenia) pochodzi ze starej ustawy; w nowej tabeli stawek PSZ takiego limitu nie ma.
3. **Refundacja okularów NFZ**: kwoty 50-700 PLN i częstotliwość dla dzieci (baza: co rok, media: co 6 miesięcy) są niespójne w źródłach.
4. **Wakacje składkowe w `benefitKnowledge.ts`**: zdanie, że w miesiącu zwolnienia nie ma ubezpieczenia chorobowego, wymaga potwierdzenia w ZUS (FAQ ZUS ładuje treść dynamicznie).
5. **Emerytura rolnicza**: górna wartość 2243,60 PLN w przedziale kwot nie ma źródła (KRUS podaje emeryturę podstawową 1780,64 PLN i najniższą 1978,49 PLN).
6. **Stypendium Ministra**: 17 000 PLN tylko z komunikatu uczelni, brak liczby na gov.pl.
7. **Dopłaty bezpośrednie ARiMR 2026**: stawki na 2026 r. nie zostały jeszcze sprawdzone.
8. **Stypendium sportowe gminne, Dzienny Dom Pomocy (Senior+), Karta Seniora**: linki prowadzą do stron ogólnych lub nieaktualnych programów (Senior+ 2021-2025).
9. **Bon senioralny, asystencja osobista, Czyste Powietrze 2026**: punkty z raportu `docs/aktualizacja-swiadczen-2026-11.md` nadal otwarte.
10. **Blog** (`src/data/blog-posts.ts`): wpisy z datą publikacji podają stare liczby (IKZE 9 388,80 PLN, wakacje składkowe „do 9 pracowników”); nie ruszane, bo to archiwalne artykuły.
