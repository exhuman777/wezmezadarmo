# Aktualizacja świadczeń dla obywateli, stan na 11.2026

Data sprawdzenia: 2026-11-01. Zakres: `src/engine/benefits/*.ts` i fakty o kwotach i terminach w `src/agents/*/knowledge.md`. Pole `dataWeryfikacji` ustawione na `2026-11-01` tylko przy świadczeniach faktycznie sprawdzonych w tej aktualizacji. Pozostałe wpisy mają dane po waloryzacji z 1.03.2026 i nie wymagały zmian w tej rundzie albo trafiły na listę „do weryfikacji”.

## Zmiany

| Świadczenie (id) | Co zmienione | Źródło |
|---|---|---|
| Świadczenie wychowawcze 800+ (`800-plus`) | Opis okresu: aktualny okres 1.06.2026-31.05.2027, wnioski na kolejny okres od 1.02.2027, ciągłość przy złożeniu do 30.04.2027. Link źródła na stronę świadczenia, `dataWaznosci` 2027-05-31. | https://www.gov.pl/web/rodzina/swiadczenie-wychowawcze |
| Zasiłek rodzinny z dodatkami (`zasilek-rodzinny`) | Nowy okres zasiłkowy 1.11.2026-31.10.2027, progi 674/764 PLN i kwoty 95/124/135 PLN bez zmian. `dataWaznosci` 2027-10-31. | https://www.gov.pl/web/gov/uzyskaj-zasilek-rodzinny-wraz-z-dodatkami , https://www.gazetaprawna.pl/twoje-prawo/swiadczenia/artykuly/11241990,zasilek-rodzinny-oraz-dodatki-do-zasilku-rodzinnego-2026-i-2027-r---d.html |
| Bon senioralny (`bon-senioralny`) | Poprawiony wiek z 75+ na 65+ (`wiekMin` 65). Podstawa: ustawa z 11.06.2026 o osobach starszych i koordynacji opieki długoterminowej (Dz.U. 2026 poz. 986), w życie 7.08.2026; rozporządzenie RM z 29.09.2026 w sprawie Programu Bonu Senioralnego 2026-2028 (Dz.U. 2026 poz. 1277). Usunięte niepotwierdzone informacje o pilotażu w 4 województwach, progach wieku 85+, wymogu orzeczenia i zastąpieniu programów Opieka 75+ itd. Start etapami od września 2026 w części gmin. Nowe źródło. | https://www.gazetaprawna.pl/twoje-prawo/swiadczenia/artykuly/11261631,bon-senioralny-2026-kiedy-przepisy-wejda-w-zycie-i-jak-przygotowac-sie-do-zlozenia-wniosku.html , https://www.gazetaprawna.pl/twoje-prawo/swiadczenia/artykuly/11282012,bon-senioralny-2026-dla-kogo-kryteria-zasady-2150-zl.html , https://wydarzenia.interia.pl/kraj/news-dodatkowe-wsparcie-dla-seniorow-prezydent-podpisal-ustawe,nId,23522112 |
| Bon ciepłowniczy (`bon-cieplowniczy`) | Nabór za 2026 (1.07-31.08.2026) oznaczony jako zakończony we wszystkich tekstach i krokach. | https://www.gov.pl/web/energia/informacje-o-bonie-cieplowniczym |
| Wakacje składkowe (`wakacje-skladkowe`) | Limit poprawiony z 9 pracowników na 10 ubezpieczonych łącznie z przedsiębiorcą, liczonych w miesiącu przed złożeniem wniosku. Link źródła na wyjaśnienia ZUS. | https://www.zus.pl/baza-wiedzy/biezace-wyjasnienia-komorek-merytorycznych/wakacje-skladkowe-pytania-i-odpowiedzi |
| Czyste Powietrze (`czyste-powietrze`) | Dopisana informacja o nowej wersji programu od 20.07.2026 (więcej wyjątków od wymogu 3-letniej własności) i zalecenie sprawdzenia regulaminu w WFOŚiGW. | https://www.wfosgw.poznan.pl/wp-content/uploads/2026/07/4.-Regulamin-PPCP.pdf , https://koszalin.pl/pl/printpdf/12686 |
| Asystent osobisty AOON (`asystent-osobisty`) | Dopisana informacja: Sejm 18.09.2026 uchwalił ustawę o asystencji osobistej, planowany start 2028, do tego czasu działa program AOON. | https://wartowiedziec.pl/polityka-spoleczna/81980-prawo-do-wiekszej-niezaleznosci-sejm-przyjal-ustawe-o-asystencji-osobistej |
| Wiedza agenta `swiadczenia` | Bon ciepłowniczy: zamiast błędnych 1200/1600 PLN „dla gazu i prądu” poprawne kwoty 1000/2000/3500 PLN tylko dla ciepła systemowego, nabór zakończony. Mój Prąd oznaczony jako zakończony (spójnie z `ekologia.ts`). Dopisany bon senioralny. Wakacje składkowe: 10 ubezpieczonych. | jak wyżej |
| Wiedza agenta `finanse-jdg` | Wakacje składkowe: 10 ubezpieczonych zamiast 9. | https://www.zus.pl/baza-wiedzy/biezace-wyjasnienia-komorek-merytorycznych/wakacje-skladkowe-pytania-i-odpowiedzi |

## Sprawdzone bez zmian

- 14. emerytura (`14-emerytura`): do 1978,49 PLN brutto, próg 2900 PLN, wypłata we wrześniu. Zgodne z komunikatem ZUS z 1.09.2026 i https://direct.money.pl/artykuly/porady/czternastka-2026-nawet-1978,49-zl-brutto-ten-prog-zdecyduje-o-wyplacie
- Renta wdowia (`renta-wdowia`): 15% w 2026, 25% od 1.01.2027. Zgodne.
- Świadczenie wspierające (`swiadczenie-wspierajace`): kwoty po waloryzacji 3.2026, próg 70 pkt od 1.01.2026. Zgodne.
- Mój Prąd (`moj-prad`): już oznaczony jako zakończony.
- Dodatek osłonowy (`dodatek-oslonowy`): już oznaczony jako zakończony.

## Nowe świadczenia

Brak nowych wpisów. Bon senioralny, jedyne nowe świadczenie dla obywateli z 2026 r. z podstawą w Dz.U., już był w bazie i został poprawiony.

## Do weryfikacji

- Bon senioralny: tekst ustawy (Dz.U. 2026 poz. 986) i rozporządzenia (poz. 1277) nie otworzył się z ISAP (HTTP 403). Do potwierdzenia w ISAP: sposób liczenia dochodu (średnia z 3 miesięcy?), waloryzacja progu 3410 PLN, maksymalny wymiar godzin, czy wymagane jest orzeczenie, oraz lista gmin realizujących program.
- Ustawa o asystencji osobistej: dalszy tok legislacyjny (Senat, podpis) i data startu.
- Czyste Powietrze: pełna lista zmian w wersji z 20.07.2026 (progi dochodowe i kwoty) do porównania z regulaminem NFOŚiGW.
- Wakacje składkowe: „Decyzja ZUS w ciągu 40 dni” oraz kwota oszczędności (1600 PLN w `biznes.ts`, 1927 PLN w wiedzy agentów) do potwierdzenia.
- `src/agents/dotacje/knowledge.md` (nie ruszany, zakres osobnej aktualizacji dotacji): nadal „Mój Prąd program przejściowy” i „max 9 ubezpieczonych” przy wakacjach składkowych. Do poprawy tak jak w `swiadczenia`.
- 800+: strona gov.pl nie podaje dat w treści statycznej; daty okresu wynikają z zasad ustawowych (wnioski od 1 lutego, ciągłość do 30 kwietnia), już opisanych w repo.
- Pozostałe ok. 110 świadczeń: dane po waloryzacji z 1.03.2026, bez nowych sygnałów zmian na 11.2026. Kolejna waloryzacja emerytur i rent 1.03.2027 oraz weryfikacja kryteriów pomocy społecznej (1010/823 PLN) w terminie ustawowym.
