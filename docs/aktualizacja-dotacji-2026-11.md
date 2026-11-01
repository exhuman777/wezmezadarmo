# Aktualizacja dotacji i dofinansowań dla firm - stan na 1 listopada 2026

Zakres: `src/data/programs-b2b.ts` (baza B2B, teraz 59 programów), `src/agents/dotacje/knowledge.md`, `src/lib/dotacje/companyContext.ts` i `emailAlerts.ts` (dopisek „Stan wiedzy”), `src/data/grant-rss-sources.ts`.

Zasada: zmiana statusu tylko z oficjalnym źródłem albo z daty zamknięcia zapisanej w samej bazie (termin minął przed 1.11.2026). Wszystko inne trafiło do sekcji „Do weryfikacji” bez zmiany w danych. Każdy zmieniony wpis ma `lastVerified: '2026-11-01'`.

## Zmiany w istniejących programach

| Program (id) | Status przed | Status po | Zmiana | Źródło |
|---|---|---|---|---|
| feng-sciezka-smart-br | closed | open | Nabór B+R MŚP 29.10-29.12.2026, pula 500 mln zł, nowy link | https://www.parp.gov.pl/component/content/article/91275:500-mln-zl-na-projekty-b-r-rusza-nowa-edycja-sciezki-smart , https://www.parp.gov.pl/harmonogram-naborow/grants/sciezka-smart , https://funduszeeuropejskie.gov.pl/aktualnosci/nabory-z-funduszy-europejskich-w-listopadzie-2026-roku/ |
| parp-feng-msp | open | closed | Nabór wdrożeniowy 14.05-11.06.2026 zakończony, odesłanie do naboru B+R | data w bazie + link PARP wyżej |
| kpo-a1-cyfryzacja-pozyczka | open | closed | Termin umów 31.08.2026 minął, środki zakontraktowane | https://www.prawo.pl/samorzad/pozyczki-na-cyfryzacje-z-kpo,533813.html (zakontraktowanie 21.09.2026 wg quasa.io, do potwierdzenia w BGK) |
| kpo-a2-cyfryzacja | expected (2026-Q3) | closed | KPO kończy się 31.08.2026, nowego naboru nie będzie | https://eur-lex.europa.eu/eli/reg/2021/241/oj |
| kpo-naszeauto-firmy | closed (next 2026-Q4) | closed (bez daty wznowienia) | Usunięta zapowiedź Q4 2026, poprawiona nazwa „Ciężarówki” | https://eur-lex.europa.eu/eli/reg/2021/241/oj ; dla NaszEauto (auta osobowe): https://elektromobilni.pl/naszeauto-dostaje-dodatkowe-82-mln-zlotych/ |
| ncbr-szybka-sciezka | open | closed | Wszystkie nabory NCBR 2026 zakończone (ostatni 16.10.2026) | daty w bazie; drugi nabór konsorcjów 1.07-16.10.2026 wg newslettera BWR (wtórne) |
| ncbr-sciezka-smart-duze-2026 | open | closed | Nabór 23.03-22.05.2026 zakończony | data w bazie |
| ncbr-sciezka-smart-konsorcja-2026 | open | closed | Nabory 9.04-12.06 i 1.07-16.10.2026 zakończone | data w bazie |
| ncbr-digital-deeptech-2026 | expected | closed | Nabór 14.04-17.06.2026 zakończony | data w bazie |
| ncbr-agrostrateg-2026 | expected | closed | Nabór 14.05-28.08.2026 zakończony | data w bazie |
| parp-step-digital-2026 | expected | closed | Nabór 21.05-16.07.2026 zakończony | data w bazie |
| parp-wzornictwo-msp-2026 | open | closed | Nabór 19.02-20.05.2026 zakończony | data w bazie |
| feniks-15-kogeneracja | open | closed | Nabór 6.05-15.07.2026 zakończony | data w bazie |
| samorzad-mazowsze | open | closed | Nabór 1.04-30.09.2026 zakończony | data w bazie |
| samorzad-wielkopolskie-fewp-141-obronnosc | open | closed | Nabór 18.05-30.06.2026 zakończony | data w bazie |
| samorzad-opolskie-feo-15 | expected | closed | Nabór 8.06-18.06.2026 zakończony | data w bazie |

Przy okazji: w zmienionych wpisach poprawione polskie znaki w nazwach i notatkach oraz usunięte „--” z nazw widocznych w UI.

## Nowe programy

| Program (id) | Status | Termin | Kwota | Źródło |
|---|---|---|---|---|
| fepw-platformy-startowe-iib-2026 | open | 6.10-10.12.2026, do 16:00 | do 2 mln zł na projekt, pula 10 mln zł | https://www.parp.gov.pl/component/content/article/91308:miliony-na-rozwoj-dla-startupow-rusza-nowy-nabor-parp , https://www.parp.gov.pl/storage/grants/documents/1405/OGLOSZENIE-O-NABORZE.pdf |
| fepw-platformy-startowe-iia-2026 | expected | od 3.11.2026, koniec w ogłoszeniu | pula 40 mln zł | https://www.parp.gov.pl/component/content/article/91411:40-mln-zl-na-rozwoj-startupow-z-polski-wschodniej-parp-oglasza-nowy-nabor-do-komponentu-iia-fepw-wsparcie-rozwoju-dzialalnosci-gospodarczej-startupu |

## Zamknięte w tej aktualizacji

Status „closed” dostały: parp-feng-msp, kpo-a1-cyfryzacja-pozyczka, kpo-a2-cyfryzacja, ncbr-szybka-sciezka, ncbr-sciezka-smart-duze-2026, ncbr-sciezka-smart-konsorcja-2026, ncbr-digital-deeptech-2026, ncbr-agrostrateg-2026, parp-step-digital-2026, parp-wzornictwo-msp-2026, feniks-15-kogeneracja, samorzad-mazowsze, samorzad-wielkopolskie-fewp-141-obronnosc, samorzad-opolskie-feo-15 (15 programów).

## Wiedza agenta (knowledge.md)

- Nagłówek „stan: 1 listopada 2026”, licznik 59 programów.
- Ścieżka SMART B+R: nabór trwa do 29.12.2026. Bon na cyfryzację, Młody Rolnik, modernizacja gospodarstw A i B, Aktywny Samorząd obszary A-D i moduł II, NLnet 13. nabór, NCBR: oznaczone jako zakończone (daty z tego samego pliku).
- Dodane: FEPW Platformy startowe IIa i IIb, aktualizacja harmonogramu FENG (14 naborów, 1,55 mld zł, XI.2026-I.2027, część warunkowo po zgodzie KE): https://nowoczesnagospodarka.gov.pl/aktualnosci-1-aktualizacja-harmonogramu-naborow-na-2026-r-w-programie-fundusze-europejskie-dla-nowoczesnej-gospoda/
- KPO: instrument zakończony 31.08.2026.
- EIC Accelerator: najbliższy cut-off 4.11.2026.

## Do weryfikacji (bez zmian w danych)

| Program (id) | Problem | Co sprawdzić |
|---|---|---|
| feng-step-cleantech | expected z datą 16.06.2026, brak potwierdzenia, czy nabór się odbył | harmonogram PARP STEP |
| feng-step-biotech | expected 2026-Q2, termin minął | harmonogram PARP STEP |
| feng-kredyt-ekologiczny | expected 2026-Q3, brak ogłoszenia | bgk.pl, harmonogram FENG |
| feng-promocja-marki | closed, zapowiedź 2026-Q4 bez ogłoszenia | feng.parp.gov.pl |
| feniks-11-efektywnosc-energetyczna | closed, zapowiedź III naboru Q4 2026; harmonogram FEnIKS zaktualizowany 30.06.2026 bez potwierdzonej rundy jesiennej | https://feniks.gov.pl/harmonogramy-naborow-wnioskow/ |
| parp-automatyzacja-robotyzacja-2026 | expected 2026-Q3, brak ogłoszenia | fepw.parp.gov.pl |
| samorzad-slask | expected 2026-Q3 | strona FE Śląskie |
| samorzad-warmiamazury-fewm-102-br | expected 2026-06, termin minął | funduszeeuropejskie.warmia.mazury.pl |
| samorzad-dolnoslaskie-feds-141-bony, samorzad-lubelskie-felu-24-cyfryzacja | closed, zapowiedź Q4 2026 | strony IZ regionów |
| samorzad-lubuskie-misje-gospodarcze | closed, zapowiedź 2026-Q3 | funduszeue.lubuskie.pl |
| arimir-modernizacja | expected Q4, w notatkach nabory OZE do 3.11 i dobrostan do 6.11.2026 | arimr.gov.pl |
| bgk-premia-termomodernizacyjna-2026 | nabór wstrzymany 15.05.2026, brak informacji o wznowieniu | bgk.pl |
| kfs-podstawowy, kfs-priorytetowy | brak danych krajowych o jesiennych naborach, nabory w PUP do wyczerpania limitu | strony PUP |
| fers-akademia-hr, fers-akademia-menadzera-msp, samorzad-malopolska | kończą się 30.11.2026, do ponownego sprawdzenia w grudniu | PARP, MCP |
| Kredyt dual-use BGK (FENG), nowy | 400 mln zł, wnioski 29.10.2026-28.01.2027 tylko wg inwestycje.pl; PKO BP oferuje produkt od 5.10.2026. Nie dodany do bazy bez komunikatu BGK | https://inwestycje.pl/biznes/bgk-uruchomi-nowy-instrument-wsparcia-produkcji-dual-use-z-budzetem-400-mln-zl/ , https://www.pkobp.pl/korporacje/kredyty-i-finansowanie/kredyt-dual-use-bgk |
| First Team Dual Use (FNP), nowy | 1.10-20.11.2026, 30 mln zł tylko ze źródeł wtórnych | fnp.org.pl |
| PARP FENG Laboratorium Innowatora, klastry | koniec 30.11.2026 oraz 4.11 i 10.11.2026; brak w bazie, nie dodane | feng.parp.gov.pl |
| AGROSTRATEG | baza podaje pulę 300 mln zł, knowledge.md 500 mln zł | ncbr.gov.pl |
| Kolejny nabór wdrożeniowy Ścieżki SMART | 21.01-16.03.2027 tylko wg mdotacje.pl | harmonogram PARP 2027 |

## Źródła RSS (grant-rss-sources.ts)

Sprawdzone 1.11.2026 przez `curl --http1.1`. Żaden adres nie zwraca kanału RSS (XML):

| Źródło | Wynik |
|---|---|
| funduszeeuropejskie.gov.pl/rss | 200, strona HTML |
| parp.gov.pl ?format=feed | 200, strona z blokadą JS |
| ncbr.gov.pl ?format=feed | 400 |
| pfron.org.pl rss.xml | 200, strona HTML |
| psz.praca.gov.pl/rss | 404 |
| arimr.gov.pl/rss.html | 200, strona HTML |
| bgk.pl ?format=feed | 403 (Cloudflare) |
| zus.pl/kanal-rss | 200, strona HTML (to spis kanałów, nie kanał) |
| gov.pl/api/feed/web/... (MF, MRiT, MRiPS) | 200, strona HTML |

Adresów nie zmieniałem, bo nie mam potwierdzonych zamienników. Scraper pomija niedziałające źródła, więc monitoring aktualności B2B dziś prawdopodobnie nie dostaje nic z RSS. Do zrobienia osobno: znaleźć działające kanały albo przejść na scraping stron „nabory”.

## Poza zakresem tej zmiany

- `AGENTS.md` (mapa projektu) mówi o „57 programach”, baza ma teraz 59. Do poprawy przy zmianie dokumentacji.

## Testy

`npm ci`, `npx tsc --noEmit` (0 błędów), `npm test` (17 plików, 165 testów, wszystkie zielone).
