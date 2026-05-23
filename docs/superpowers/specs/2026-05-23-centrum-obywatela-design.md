# Centrum Obywatela - rozbudowa o 5 brakujących integracji + reorganizacja huba

Data: 2026-05-23
Branch: main
Autor: Claude (sesja brainstormingu z exHuman)

## Cel

Dokończyć Centrum Obywatela: dodać 5 brakujących integracji z 8 zaplanowanych, zreorganizować hub per grupa docelowa, dopiąć Białą Listę VAT do UI landingu, zaktualizować /o-projekcie i /aktualnosci o nowe narzędzia.

## Stan obecny (po sprawdzeniu repo)

Już istnieje (zrobione przez wcześniejsze sesje):

- Hub `/centrum-obywatela/page.tsx` - płaska lista 6 kart (NFZ, NBP, GIOŚ, Biała Lista, RSS, Świadczenia)
- 3 podstrony: `/centrum-obywatela/{kursy,powietrze,biala-lista}`
- Osobna strona `/nfz` z wyszukiwarką świadczeniodawców
- API: `/api/public/{nbp,gios,nfz,whitelist}/route.ts`
- Helpery: `src/lib/sources/_helpers.ts` (rateLimit, publicError) + `nbp.ts`, `gios.ts`, `nfz.ts`, `whitelist.ts`
- Widgety: `NbpRatesWidget`, `AirQualityWidget` (już wpięte na `/aktualnosci`)
- `/api/ceidg` fan-outuje do whitelist i zwraca `vat.status` (Czynny/Zwolniony/Niezarejestrowany), cache 24h, rate 10/dzień/IP
- `page.tsx` zapisuje `statusVat` do profilu po sukcesie CEIDG
- SiteNav zawiera link "Centrum Obywatela" (prefix obejmuje `/nfz`)
- `/o-projekcie` ma kartę Centrum Obywatela (krótki opis bez nowych narzędzi)

Brakuje:

- 5 integracji: IMGW, ELI/Sejm, BDL GUS, ARiMR (link-only), PKP PLK (link-only)
- Reorganizacja huba per grupa docelowa
- WIDOCZNY chip "VAT: Czynny" w UI landingu po CEIDG (dane są w profilu, ale nie pokazane)
- Update `/o-projekcie` z nowymi narzędziami + źródłami
- Widgety IMGW + ELI na `/aktualnosci`

## Wzorzec implementacji (kopiowany 1:1 z istniejących)

Każda integracja = 4 pliki:

```
src/lib/sources/<tool>.ts             # fetch + parse + types, eksportuje funkcje typu searchByX()
src/app/api/public/<tool>/route.ts    # GET handler, rateLimit() + publicError()
src/app/centrum-obywatela/<tool>/page.tsx  # 'use client', form + result UI
src/components/<Tool>Widget.tsx       # opcjonalnie, gdy ma być reusable widget na /aktualnosci
```

`_helpers.ts` API: `rateLimit(scope, request, max, windowMs)` zwraca `{ ok, response? }`; `publicError(err, scope)` loguje serwerowo + zwraca sanitized 500.

Cache: `fetch(url, { next: { revalidate: SEC } })` przy server-side, in-memory `Map` przy client/route.

## 5 nowych integracji

### 1. IMGW (ostrzeżenia meteo)

**Źródło**: RCB (Rządowe Centrum Bezpieczeństwa) RSS - `https://rcb.gov.pl/feed/`. To są oficjalne alerty SMS (powódź, burze, mróz, smog). Alternatywa: `meteo.imgw.pl/api/kdo/warnings` (JSON ale niestabilny).

**Wybór**: RCB RSS - stabilny, prosty XML, dokładnie te alerty których szuka rolnik/KRUS.

**Parser**: regex (no new deps), wzorzec z `scripts/fetch-rss-cache.mjs`.

**Files**:
- `src/lib/sources/imgw.ts` - `fetchWarnings(): Promise<Warning[]>`, typ `{ title, link, pubDate, region?, severity? }`
- `src/app/api/public/imgw/route.ts` - GET, cache 15 min, rate 30/min/IP
- `src/app/centrum-obywatela/pogoda/page.tsx` - lista alertów + link do rcb.gov.pl
- `src/components/ImgwAlertWidget.tsx` - top 3 alerty na widgecie

**UI strony**: lista kart z severity badge (kolor: czerwony = pilne, pomarańczowy = ostrzeżenie, żółty = info), pubDate, link.

### 2. ELI/Sejm (zmiany w przepisach)

**Źródło**: `https://api.sejm.gov.pl/eli/changes/` (JSON-API, oficjalne, bez klucza). Filtr po słowach: świadczenie, zasiłek, ulga, dodatek, emerytura, becikowe, 800+, KRUS, ZUS, refundacja. Dla MVP: lista ostatnich 20 aktów + filtr keyword w server.

**Files**:
- `src/lib/sources/eli-sejm.ts` - `fetchRecentChanges(keywords?): Promise<EliAct[]>`, typ `{ eli, title, publisher, type, announcedAt, eliUrl }`
- `src/app/api/public/eli-sejm/route.ts` - GET ?q=, cache 30 min
- `src/app/centrum-obywatela/prawo/page.tsx` - search + lista wyników
- `src/components/EliChangesWidget.tsx` - 5 najnowszych na widgecie

### 3. BDL GUS (dane demograficzne per gmina)

**Źródło**: `https://bdl.stat.gov.pl/api/v1/` (REST/JSON). Bez klucza limit 10 req/min/IP. Z kluczem `X-ClientId` - 100 req/min. Start: bez klucza, jeśli za mało - dodać `BDL_API_KEY` do env później.

**Endpointy**: `/units/search?name={gmina}` → terytId; `/data/by-unit/{terytId}?var-id=...` → dane.

**Variables MVP** (najprostsze, najistotniejsze dla obywatela):
- 60559: ludność ogółem
- 60565: ludność w wieku przedprodukcyjnym
- 60567: ludność w wieku poprodukcyjnym
- 459163: bezrobocie rejestrowane (%)
- 60270: przeciętne wynagrodzenie brutto

**Files**:
- `src/lib/sources/bdl-gus.ts` - `searchUnit(name)`, `fetchUnitData(terytId)`
- `src/app/api/public/bdl-gus/route.ts` - GET ?gmina= lub ?terytId=, cache 24h
- `src/app/centrum-obywatela/gus/page.tsx` - search by gmina/woj + tabela danych

Brak widgetu (kontekstowe, wymaga inputu).

### 4. ARiMR Geoportal (mapy działek)

**Źródło**: brak publicznego REST. Geoportal pod `https://geoportal.gov.pl/wms/` (WMS, ciężkie) i `https://geoportal.arimr.gov.pl/`. X-Frame-Options blokuje embedy.

**Wybór**: link + instrukcja. Karta z 4-krokowym how-to (otwórz portal → zaloguj się przez profil zaufany → wpisz nr działki ewidencyjnej → pobierz wypis).

**Files**:
- `src/app/centrum-obywatela/dzialki/page.tsx` - statyczna strona, link + instrukcja

Brak `lib/sources/`, brak `/api/`, brak widgetu.

### 5. PKP PLK (ulgi transportowe)

**Źródło**: brak stabilnego API. `portalpasazera.pl` ma wyszukiwarkę ale nie API.

**Wybór**: tabela ulg per grupa + linki do wyszukiwarek (portalpasazera, intercity, polregio).

**Ulgi do pokazania**:
- Student do 26 lat: 51% (Intercity, R), 100% w soboty/niedziele dla biletów miesięcznych
- Senior 60+: 30%
- Emeryt: 37%
- Karta Dużej Rodziny: 37-49% (dziecko 75%)
- Dziecko 4-6 lat: 78%
- Niepełnosprawni: różne, od 37% do 95% (z opiekunem)

**Files**:
- `src/app/centrum-obywatela/transport/page.tsx` - tabela ulg + linki

Brak API/widgetu.

## Hub - reorganizacja per audience

Aktualnie 6 płaskich kart. Nowa struktura: 6 sekcji per grupa docelowa, każde narzędzie może wystąpić w wielu grupach.

**Mapowanie**:

| Grupa | Narzędzia |
|-------|-----------|
| Rolnik (KRUS) | IMGW · ARiMR · BDL GUS · NFZ · Świadczenia |
| Senior / Pacjent | NFZ · GIOŚ · ELI · PKP · Świadczenia |
| Rodzina z dziećmi | NFZ · GIOŚ · PKP · Aktualności · Świadczenia |
| Student | PKP · NFZ · NBP · ELI |
| Przedsiębiorca / JDG | Biała Lista VAT · NBP · BDL GUS · ELI · Aktualności |
| Wszyscy obywatele | Świadczenia · Aktualności RSS · NBP · GIOŚ · ELI · NFZ |

**Implementacja**: jeden array `TOOLS` (registry z polem `audiences: string[]`) + array `AUDIENCES` (label + slug + opis). Render: dla każdej audience filtruj TOOLS i renderuj sekcję. Karta narzędzia jak teraz (linia top accent, icon kafelek 40x40, label + badge + desc).

Hero pozostaje (pill "Centrum Obywatela", h1, paragraf opisu). Banner źródeł na dole - rozszerzony o nowe API (imgw/rcb, sejm/eli, bdl, arimr, portalpasazera).

## Wpięcia w AI chat agenta (KLUCZOWE - dodane po review)

`src/app/api/agent/chat/route.ts` ma system smart prefetch: 5 funkcji `maybeFetchX(text, ...)` ładowanych równolegle, plus `BASE_LIVE_SOURCES` w `src/agents/base-prompt.ts` opisujący 6 narzędzi AI. Nowe integracje MUSZĄ wpaść do obu.

### Smart prefetch handlers (3 nowe)

Wzorzec: każdy handler dostaje tekst ostatniej wiadomości, sprawdza regex triggery, fetchuje API, zwraca sformatowany string z URL Centrum Obywatela na końcu (lub null).

- **maybeFetchImgw(text)** - trigger: `/\b(pogoda|burza|burze|mr[oó]z|przymrozk|powod[zź]|opad|wichura|alert.*pogod|rcb|ostrze[zż]eni)/`. Fetch RCB feed → top 3 alerty → format `IMGW/RCB OSTRZEZENIA AKTYWNE: ...` + link `/centrum-obywatela/pogoda`.
- **maybeFetchEli(text)** - trigger: `/\b(zmian.*prawo|zmian.*przepis|nowelizacj|ustawa o|nowy przepis|kiedy wejdzie w [zż]ycie)/`. Fetch ELI top 5 ostatnich aktów filtrowanych po słowach kluczowych z tekstu → format `OSTATNIE ZMIANY W PRZEPISACH: ...` + link `/centrum-obywatela/prawo`.
- **maybeFetchBdlGus(text)** - trigger: `/\b(moja gmina|w gminie|ludno[sś][cć]|bezrobocie w|dane.*gminy|statystyk.*gmin|GUS.*gmin)/` ORAZ user musi mieć województwo/gminę w profilu (albo wymienić w wiadomości). Fetch BDL → 3 podstawowe wskaźniki → link `/centrum-obywatela/gus`.

ARiMR/PKP - bez prefetch (brak API). AI ma tylko wiedzę z BASE_LIVE_SOURCES że może odesłać do `/centrum-obywatela/dzialki` lub `/centrum-obywatela/transport`.

### BASE_LIVE_SOURCES - 5 nowych pozycji

W `src/agents/base-prompt.ts` po pozycji 6 (Aktualności RSS) dodać:

7. **IMGW/RCB - ostrzeżenia meteo** - URL `/centrum-obywatela/pogoda`, źródło `rcb.gov.pl`, polecaj gdy rolnik/KRUS, alergik (PM10/smog), wyjazd, prace polowe.
8. **ELI/Sejm - tracker zmian w prawie** - URL `/centrum-obywatela/prawo`, źródło `api.sejm.gov.pl/eli`, polecaj gdy "co zmienia się w X", "kiedy wejdzie nowy ZUS", "nowelizacja kosiniakowego".
9. **BDL GUS - dane demograficzne per gmina** - URL `/centrum-obywatela/gus`, źródło `bdl.stat.gov.pl`, polecaj gdy user pyta o bezrobocie, ludność, wynagrodzenia w swojej gminie/powiecie.
10. **ARiMR Geoportal - mapy działek** - URL `/centrum-obywatela/dzialki`, polecaj gdy rolnik pyta o działki, dopłaty bezpośrednie, kontrolę agro.
11. **PKP - ulgi transportowe** - URL `/centrum-obywatela/transport`, polecaj gdy senior/student/KDR/niepełnosprawny pyta o tańsze podróżowanie.

Update końca BASE_LIVE_SOURCES: "Wszystko dostępne pod hubem CENTRUM OBYWATELA: /centrum-obywatela" pozostaje, ale dopisać że teraz **11 narzędzi** (było 6).

## Wpięcia w istniejące strony

### Landing - VAT chip po CEIDG

`page.tsx` ma już `statusVat` w profilu po CEIDG. Brakuje wyświetlenia. 

**Implementacja**: w fazie `questions` lub jako "toast po sukcesie CEIDG" - pokaż przy wprowadzonym NIPie chip kolorowy:
- Czynny → zielony chip "VAT czynny"
- Zwolniony → bursztynowy chip "VAT zwolniony"
- Niezarejestrowany → szary chip "Nie figuruje w VAT"
- `null` (rate limit / błąd) → pomiń

Lokalizacja: pod hero questionnaire, po lewej obok wieku/płci jeśli NIP przeszedł CEIDG. Albo (prostsze): tymczasowy banner-success ponad pierwszym pytaniem.

**Wybór**: banner-success ponad pierwszym pytaniem - mniej zmian w istniejącym UI questionnaire. Tekst: "Wykryto firmę: {nazwa CEIDG}. Status VAT: {statusVat}".

### /o-projekcie - update karty Centrum Obywatela

W `MODULES` rozszerzyć opis karty `/centrum-obywatela`:
> "Hub publicznych danych: kursy NBP, jakość powietrza GIOŚ, biała lista VAT, kolejki NFZ, ostrzeżenia IMGW/RCB, zmiany w prawie (Sejm/ELI), dane demograficzne GUS, link do Geoportalu ARiMR i tabela ulg PKP. Wszystko z oficjalnych polskich API, bez logowania."

W `SOURCES` dodać: `rcb.gov.pl`, `api.sejm.gov.pl/eli`, `bdl.stat.gov.pl`, `geoportal.arimr.gov.pl`, `portalpasazera.pl`.

### /aktualnosci - widgety IMGW + ELI

Po `<NbpRatesWidget/>` dorzucamy `<ImgwAlertWidget/>` i `<EliChangesWidget/>`. Layout: grid `repeat(auto-fit, minmax(280px, 1fr))` (już taki jest).

## Nawigacja

SiteNav już ma link "Centrum Obywatela" z prefixem obejmującym `/nfz`. Po dodaniu podstron `/pogoda /prawo /gus /dzialki /transport` - sprawdzić czy są podświetlane jako aktywne. Prefix `/centrum-obywatela` to pokrywa, `/nfz` zostaje extra.

## Risk / decyzje

1. **BDL GUS bez klucza** - 10 req/min/IP wystarczy dla obecnego ruchu. Cache 24h dodatkowo łagodzi. Plan B: dodać `BDL_API_KEY` do env, ale dopiero jeśli się okaże mało.

2. **IMGW vs RCB** - RCB to dokładnie alerty, IMGW to prognozy. Obywatel chce alertów. Pomijamy meteo.imgw.pl, używamy rcb.gov.pl/feed.

3. **ELI vs Sejm API** - api.sejm.gov.pl/eli/ daje JSON, dobrze udokumentowane. Nie potrzebujemy XML parsera.

4. **Brak XML parsera w deps** - RCB RSS to XML. Parsujemy regex (tytuł, link, pubDate, description), wzorzec z `scripts/fetch-rss-cache.mjs`. Nie dodajemy nowych dep.

5. **ARiMR/PKP bez API** - świadoma decyzja. Karta z linkiem + instrukcja jest lepsza niż złamane iframe lub niestabilny scraping.

6. **VAT chip placement** - banner-success ponad pytaniami zamiast modyfikacji IntakeForm. IntakeForm jest reusable, dodawanie tam state psuje SRP.

## Testy / weryfikacja

- `npx tsc --noEmit` - brak błędów typów
- Manual sanity: każda nowa podstrona ładuje się, każde API zwraca dane lub sanitized error
- Hub: każda sekcja renderuje się, narzędzie pojawia się w >1 sekcji jak zaplanowano
- Landing: wpisanie NIP firmy realnej → banner VAT się pojawia
- /aktualnosci: 4 widgety w grid, każdy ładuje dane lub graceful fallback

## Kolejność wykonania

1. Spec (ten dokument) + commit
2. Lib + API per integracja: IMGW → ELI → BDL (każda komplet: lib/source + /api/public + podstrona + widget jeśli aplikowalny)
3. ARiMR + PKP (statyczne podstrony, bez API)
4. Hub reorganizacja per audience (registry TOOLS z polem audiences)
5. AI chat: 3 nowe prefetchery (maybeFetchImgw/Eli/BdlGus) + update BASE_LIVE_SOURCES o 5 nowych pozycji
6. VAT chip na landingu (banner-success po CEIDG)
7. /aktualnosci dodać widgety IMGW + ELI + /o-projekcie update opisu Centrum
8. `npx tsc --noEmit` + raport zmian
