# URL Audit Report - 2026-05-24

Audyt wszystkich 118 zrodloUrl ze swiadczen.

## Podsumowanie

| Status | Liczba | % | Akcja |
|---|---|---|---|
| ✅ OK (HTTP 200) | 101 | 86% | brak |
| ⚠️ TLS handshake fail (działa w browser) | 3 | 3% | fix audit User-Agent |
| ❌ TCP timeout (firewall psz.praca.gov.pl z mojego IP) | 7 | 6% | weryfikacja z polskiego IP |
| ❌ Real 404 (URL przeniesiony) | 7 | 6% | research + fix URL |

## ✅ NAPRAWIONE (commit 2026-05-24) - 12 URL-i

| ID | Stary URL | Nowy URL |
|---|---|---|
| `ulga-prorodzinna` | podatki.gov.pl/pit/ulgi-.../ulga-na-dzieci/ | podatki.gov.pl/ulgi-i-odliczenia/ulga-na-dziecko-pit/ |
| `ulga-termomodernizacyjna` | /pit/ulgi-.../ulga-termomodernizacyjna/ | /ulgi-i-odliczenia/ulga-termomodernizacyjna-pit/ |
| `ulga-rehabilitacyjna` | /pit/ulgi-.../ulga-rehabilitacyjna/ | /ulgi-i-odliczenia/ulga-rehabilitacyjna-pit/ |
| `ulga-internetowa` | /pit/ulgi-.../ulga-na-internet/ | /ulgi-i-odliczenia/ulga-na-internet-pit/ |
| `ulga-dla-mlodych` | /pit/ulgi-.../ulga-dla-mlodych/ | /ulgi-i-odliczenia/ulga-dla-mlodych-pit/ |
| `ulga-robotyzacja` | /cit/ulgi-i-odliczenia/ulga-na-robotyzacje/ | /ulgi-i-odliczenia/ulga-na-robotyzacje-pit/ |
| `opp-1-5-procent` | /pit/1-5-procent/ | /poradniki-i-informatory/jak-przekazac-1-5-podatku-na-rzecz-opp-pit/ |
| `ip-box` | /pit/ulgi-.../ip-box/ | gov.pl/web/finanse/ulga-ip-box |
| `ryczalt` | /pit/ryczalt-od-przychodow-ewidencjonowanych/ | gov.pl/web/finanse/ryczalt-od-przychodow-ewidencjonowanych |
| `maly-zus-plus` | zus.pl/firmy/.../maly-zus-plus | gov.pl/web/rozwoj-technologia/maly-zus-plus |
| `wakacje-skladkowe` | zus.pl/firmy/wakacje-od-zus | gov.pl/web/rozwoj-technologia/wakacje-skladkowe |
| `dodatek-pielegnacyjny` | zus.pl/swiadczenia/dodatek-pielegnacyjny | gov.pl/web/rodzina/dodatek-pielegnacyjny |

## ❌ POZOSTAŁE 14 - wymaga akcji

### Grupa A: ZUS świadczenia (4) - wymaga researchu z polskiego IP

| ID | URL (404) |
|---|---|
| `emerytura-pomostowa` | zus.pl/swiadczenia/emerytury/emerytury-pomostowe |
| `mama-4-plus` | zus.pl/swiadczenia/rodzicielskie-swiadczenie-uzupelniajace |
| `13-emerytura` | zus.pl/swiadczenia/emerytury/dodatkowe-roczne-swiadczenie-pieniezne |
| `14-emerytura` | zus.pl/swiadczenia/emerytury/kolejne-dodatkowe-roczne-swiadczenie-pieniezne |

**Sugestia:** zmienic na `https://www.gov.pl/web/rodzina/{slug}` po weryfikacji (z mojego IP soft-404 redirect na gov.pl home, ale moze dzialac z PL IP).

### Grupa B: psz.praca.gov.pl (7) - TCP timeout z mojego IP, mogą działać w Polsce

| ID | URL |
|---|---|
| `stypendium-stazowe` | psz.praca.gov.pl/.../staze |
| `bon-szkoleniowy` | psz.praca.gov.pl/.../bony/bon-szkoleniowy |
| `bon-stazowy` | psz.praca.gov.pl/.../bony/bon-stazowy |
| `dotacja-dzialalnosc-gospodarcza` | psz.praca.gov.pl/.../dotacje-jednorazowe-... |
| `dofinansowanie-wynagrodzenia-50-plus` | psz.praca.gov.pl/.../dofinansowanie-wynagrodzenia |
| `przygotowanie-zawodowe-doroslych` | psz.praca.gov.pl/.../przygotowanie-zawodowe |
| `program-aktywizacja-integracja` | psz.praca.gov.pl/.../program-aktywizacja-i-integracja |

**Akcja:** otworzyć każdy w przeglądarce z polskiego IP. Jeśli dzialaja - zostawic. Jeśli 404 - poszukać nowych w portalu zielonalinia.gov.pl lub gov.pl/web/rodzina.

### Grupa C: pozostałe (3)

| ID | URL | Akcja |
|---|---|---|
| `preferencyjny-zus` | biznes.gov.pl/pl/portal/00126 | znaleźć nowy URL na biznes.gov.pl |
| `zasilek-opiekunczy-krus` | krus.gov.pl/swiadczenia/zasilek-opiekunczy/ | szukać na nowym krus.gov.pl |
| `refundacja-okularow-nfz` | nfz.gov.pl/dla-pacjenta/wyroby-medyczne/ | szukać na pacjent.gov.pl lub nfz.gov.pl |

### Grupa D: false positives (3) - dzialaja, tylko Node fetch fail

| ID | URL | Test |
|---|---|---|
| `czyste-powietrze` | czystepowietrze.gov.pl | curl -A "Mozilla/5.0" = 200 |
| `cieple-mieszkanie` | czystepowietrze.gov.pl/inne-programy/cieple-mieszkanie | 200 |
| `stop-smog` | czystepowietrze.gov.pl/inne-programy/stop-smog | 200 |

**Akcja:** zmienic User-Agent w `src/lib/benefits-audit.ts` z `wezmezadarmo-audit/1.0` na real browser UA. Wtedy te 3 nie beda falszywie alarmowac w cron audit.

## Content verification (kwoty, daty, reguly) - **NIE WYKONANO**

Powyzej tylko URL liveness. Verification merytoryczna (czy 800+ to faktycznie 800 PLN, czy progi sa aktualne) wymaga:
- LLM-based comparison kazdego z 118 wpisow z aktualna trescia oficjalnego zrodla
- Estymacja: 15 parallel agentow x ~8 swiadczen, ~10-15 min

Sugerowane wykonanie po fix-ach URL (zeby agent czytal aktualne, nie 404).

## Wynik finalny

**12 z 26 zlamanych URL-i naprawione w tym audycie**. Pozostale 14 wymaga albo researchu z polskiego IP, albo nowych URL-i ktorych nie znalazlem w moim setup-ie.

Kod pozostal stabilny: TypeScript clean, build OK.
