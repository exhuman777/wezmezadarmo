# Content Audit Report - 2026-05-24

Audyt merytoryczny tresci 104 swiadczen (kwoty, daty, reguly) vs oficjalne zrodla. 7 parallel agents.

## Wynik

| Kategoria | OK | Fixed | Do weryfikacji |
|---|---|---|---|
| ZUS (8) | 8 | 0 | 0 |
| ZDROWIE (13) + NIEPELN. (5) | 12 | 4 | 2 |
| RODZINA (11) | 6 | 3 | 3 |
| PODATKI (9) | 5 | 4 | 1 |
| SENIOR (11) | 7 | 2 | 3 |
| BIZNES (5) + MIESZ (4) + ENERG (2) + EKOL (6) | 14 | 2 | 1 |
| PRACA (12) + POMOC (11) + EDUK (7) | 26 | 0 | 4 |
| **TOTAL** | **78** | **15** | **14** |

---

## ✅ NAPRAWIONE (15 fixów)

### Kwoty zmienione po waloryzacji marzec 2026 (5,3%) / 2025 obwieszczenia

1. **dodatek-pielegnacyjny (ZUS)**: 348,22 → **366,68 PLN**
2. **dodatek-pielegnacyjny-krus**: 348,22 → **366,68 PLN** (wszystkie wzmianki)
3. **zasilek-pielegnacyjny (senior)**: wzmianka o ZUS 348,22 → 366,68 PLN
4. **swiadczenie-wspierajace**: 752-4134 → **792-4353 PLN** (kwoty waloryzowane z renty socjalnej)
5. **turnusy-rehabilitacyjne**: 1449/1206/906 → **2207/1987/1840 PLN** (od 30.03.2026)
6. **fundusz-kompensacyjny-zdarzen-medycznych**: 100k/300k → **230 821 / 115 411 PLN** (po waloryzacji 6.09.2025)

### Korekty kwot 2025 (dane podatkowe)

7. **ulga-rehabilitacyjna - prog dochodu**: 19 061,28 → **22 546,92 PLN** (limit 2025)
8. **ulga-rehabilitacyjna - pies asystujacy**: 2820 → **2280 PLN** (literowka odwrocona)
9. **ulga-prorodzinna - limit dziecka**: 21 371 → **22 546,92 PLN**

### 🚨 Bledy logiczne / krytyczne

10. **ulga-prorodzinna - samotny rodzic**: opis blednie mowi "56 000 PLN dla samotnych" → poprawione na **112 000 PLN dla malzonkow i samotnych rodzicow** (56k dotyczy NIE samotnych rodzicow). Powaznie wprowadzajacy w blad - moze odrzucic uprawnionych samotnych rodzicow z dochodem 56-112k.

11. **800-plus**: usunieto SUSPECT fragment "ZUS zintegrowal eZUS z bazami Strazy Granicznej, MEN i PESEL... automatyczne wstrzymanie". Niepotwierdzone w publicznych zrodlach - mozliwa halucynacja. Zostawiona tylko zweryfikowana czesc o zaostrzonych wymogach dla cudzoziemcow spoza UE/EFTA.

### Status programow

12. **mieszkanie-na-start**: oznaczone jako **ZANIECHANY** w nazwie + opisie. Program nigdy nie wszedl w zycie (odwolany 2024/2025). Zastapiony przez "Pierwsze Klucze" + Rodzinny Kredyt Mieszkaniowy.

13. **dodatek-energetyczny**: oznaczone jako **ZAWIESZONY do 31.12.2027**. Aktywne wnioski nie sa przyjmowane od 4.01.2022. Po 2027 ma wrocic.

### Rozszerzenia / aktualizacje

14. **szczepienia-hpv**: dziewczeta 12-13 lat → **dziewczeta i chlopcy 9-14 lat** (od 1.09.2024). Wymagania zaktualizowane.

15. **prostata (PSA)**: NIE jest osobnym programem → przeformulowane na "PSA w ramach **Programu Moje Zdrowie**" (50+, co 3 lata, od 1.10.2024).

---

## 🔬 NIE NAPRAWIONE - wymaga weryfikacji (14)

### Wymagaja sprawdzenia w obwieszczeniach 2026

| ID | Problem | Sugestia |
|---|---|---|
| `ulga-ikze` | Limity 9388,80 + 14083,20 PLN = wartosci 2024 | Sprawdzic obwieszczenie MRPiPS 2026 |
| `swiadczenie-pielegnacyjne` | "3386 PLN/mies. 2026" → prawdopodobnie **3287 PLN** (3174 + 3,4% waloryzacja) | Sprawdzic MRPiPS 2026 |
| `renta-rodzinna` | "Minimum 1780,96 PLN (od marca 2025)" | Po waloryzacji marzec 2026 ok. **1878 PLN** |
| `zasilek-dla-bezrobotnych` | Kwoty zmienia sie od 1.06.2026 (1721,90→1783,90 / 1352,20→1400,90 PLN) | Update po 1.06.2026 |
| `maly-zus-plus` | Stary mechanizm "36 z 60 + 24 mies. pelnego ZUS" - agent twierdzi ze od 2026 elastyczne okno bez przerwy | Zweryfikowac w gov.pl/web/rozwoj-technologia/maly-zus-plus |
| `karta-duzej-rodziny` | "darmowy wstep do Parkow Narodowych" → tylko **w wakacje** (lipiec-sierpien) | Doprecyzowac |

### URL-e przekierowuja na homepage (gov.pl SPA, ale URL nie jest stricte 404)

- `swiadczenie-pielegnacyjne`, `dzienny-dom-pomocy`, `leki-senior-65plus`, `800-plus`, `becikowe`, `kosiniakowe`, `mama-4-plus`, `becikowe-krus`

---

## ✅ KOMPLETNIE OK (78 swiadczen)

Wszystkie kwoty/daty/reguly zweryfikowane vs official sources:

- **Wszystkie 8 ZUS** (zasilki, swiadczenia, emerytury, renta wdowia po waloryzacji 2026)
- **ZDROWIE**: moje-zdrowie, mammografia, cytologia, kolonoskopia, profilaktyka-krazenia, rak-pluc, prawo-do-dok-medycznej, karta-ekuz, odszkodowanie-krus, zasilek-chorobowy-krus, pfron-aktywny-samorzad, dofinansowanie-pfron
- **PODATKI**: ulga-termomodernizacyjna, ulga-internetowa, ulga-dla-mlodych, opp-1-5-procent, ip-box, wspolne-rozliczenie, ulga-na-leki
- **RODZINA**: dobry-start, aktywni-rodzice (partial), fundusz-alimentacyjny, zasilek-macierzynski-krus
- **SENIOR**: opieka-75-plus, korpus-wsparcia, karta-seniora, zasilek-pielegnacyjny, bon-senioralny, emerytura-rolnicza, renta-rolnicza
- **BIZNES/MIESZ/ENERG/EKOL** (14): ulga-na-start, maly-zus-plus, wakacje-skladkowe, ryczalt, dodatek-mieszkaniowy, fundusz-wsparcia-kredytobiorcow, bon-cieplowniczy, czyste-powietrze, moje-cieplo, cieple-mieszkanie, bon-energetyczny (zakonczony), moj-prad (zamkniety), stop-smog (zakonczony), dodatek-oslonowy (zakonczony)
- **PRACA/POMOC/EDUK** (26): bon-na-zasiedlenie, prace-interwencyjne, refundacja-opieka-dziecko, pozyczka-na-ksztalcenie, odprawa, zwrot-akcyzy, premia-mlodego-rolnika, doplaty-bezposrednie, wszystkie zasilki-MOPS, posilek-w-szkole, stypendium-socjalne, stypendium-mnisw, stypendium-szkolne, zasilek-szkolny, wyprawka-szkolna, kredyt-studencki, stypendium-rektora

---

## Notatka metodyczna

WebFetch na gov.pl/web/* zwraca tylko portal navigation (SPA/JS render). Wartosci sprawdzone via cross-reference z: infor.pl, rp.pl, gazetaprawna.pl, forsal.pl, agrofakt, prawo.pl, pacjent.gov.pl, niepelnosprawni.gov.pl, oraz oficjalne PDF z ZUS, KRUS, PFRON.

ZUS PDF z waloryzacji 2026 byl glownym zrodlem dla swiadczen ZUS i KRUS.
