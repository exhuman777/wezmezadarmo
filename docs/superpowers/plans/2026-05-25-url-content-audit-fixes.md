# URL + Content Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 14 dead URLs i 14 wartości 2026 w src/engine/benefits/*.ts

**Architecture:** Dwa niezależne bloki: (A) naprawy URL przez research + edycje zrodloUrl, (B) aktualizacje kwot przez weryfikację obwieszczeń MRPiPS 2026.

**Tech Stack:** TypeScript, Node.js, `npx tsc --noEmit` do weryfikacji

---

## Blok A: Naprawa 14 dead URL

### Task 1: ZUS Grupa A (4 URL) - zus.pl → gov.pl

**Files:**
- Modify: `src/engine/benefits/zus.ts:292` (emerytura-pomostowa)
- Modify: `src/engine/benefits/zus.ts:386` (mama-4-plus)
- Modify: `src/engine/benefits/zus.ts:419` (13-emerytura)
- Modify: `src/engine/benefits/zus.ts:455` (14-emerytura)

- [ ] **Krok 1: Weryfikuj URL emerytura-pomostowa**

Otwórz w przeglądarce (z polskiego IP lub VPN PL):
```
https://www.gov.pl/web/rodzina/emerytura-pomostowa
https://www.zus.pl/swiadczenia/emerytury/emerytura-pomostowa
```
Sprawdź który URL działa i pokazuje treść (nie redirect na stronę główną).

- [ ] **Krok 2: Weryfikuj URL mama-4-plus**

```
https://www.gov.pl/web/rodzina/rodzicielskie-swiadczenie-uzupelniajace
https://www.zus.pl/swiadczenia/rodzicielskie-swiadczenie-uzupelniajace
```

- [ ] **Krok 3: Weryfikuj URL 13-emerytura**

```
https://www.gov.pl/web/rodzina/dodatkowe-roczne-swiadczenie-pieniezne
https://www.zus.pl/swiadczenia/emerytury/dodatkowe-roczne-swiadczenie-pieniezne
```

- [ ] **Krok 4: Weryfikuj URL 14-emerytura**

```
https://www.gov.pl/web/rodzina/kolejne-dodatkowe-roczne-swiadczenie-pieniezne
https://www.zus.pl/swiadczenia/emerytury/kolejne-dodatkowe-roczne-swiadczenie-pieniezne
```

- [ ] **Krok 5: Zaktualizuj zus.ts - 4 linie**

Dla każdego działającego URL zamień odpowiednią linię:

```typescript
// zus.ts:292 - emerytura-pomostowa
zrodloUrl: 'https://www.gov.pl/web/rodzina/emerytura-pomostowa',

// zus.ts:386 - mama-4-plus
zrodloUrl: 'https://www.gov.pl/web/rodzina/rodzicielskie-swiadczenie-uzupelniajace',

// zus.ts:419 - 13-emerytura
zrodloUrl: 'https://www.gov.pl/web/rodzina/dodatkowe-roczne-swiadczenie-pieniezne',

// zus.ts:455 - 14-emerytura
zrodloUrl: 'https://www.gov.pl/web/rodzina/kolejne-dodatkowe-roczne-swiadczenie-pieniezne',
```

- [ ] **Krok 6: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/zus.ts
git commit -m "fix: 4 dead ZUS URLs → gov.pl/web/rodzina"
```

---

### Task 2: psz.praca.gov.pl Grupa B (7 URL)

**Files:**
- Modify: `src/engine/benefits/praca.ts:109` (stypendium-stazowe)
- Modify: `src/engine/benefits/praca.ts:217` (bon-szkoleniowy)
- Modify: `src/engine/benefits/praca.ts:270` (bon-stazowy)
- Modify: `src/engine/benefits/praca.ts:335` (dotacja-dzialalnosc-gospodarcza)
- Modify: `src/engine/benefits/praca.ts:443` (dofinansowanie-wynagrodzenia-50-plus)
- Modify: `src/engine/benefits/praca.ts:658` (przygotowanie-zawodowe-doroslych)
- Modify: `src/engine/benefits/praca.ts:762` (program-aktywizacja-integracja)

- [ ] **Krok 1: Sprawdź czy psz.praca.gov.pl działa z polskiego IP**

Z polskiego IP/VPN otwórz:
```
https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/podnoszenie-kwalifikacji/staze
```
Jeśli działa (HTTP 200, nie redirect) - wszystkie 7 URL psz.praca.gov.pl można zostawić bez zmian. Tylko zaktualizuj `dataWeryfikacji`.

Jeśli 404 - kontynuuj do kroku 2.

- [ ] **Krok 2: (tylko jeśli 404) Znajdź alternatywne URL**

Szukaj na:
- `https://zielonalinia.gov.pl/` (wyszukaj każdą nazwę)
- `https://www.gov.pl/web/psz/` (portal służb zatrudnienia)

Alternatywy:

| ID | Alternatywny URL (do weryfikacji) |
|---|---|
| stypendium-stazowe | https://zielonalinia.gov.pl/staze |
| bon-szkoleniowy | https://zielonalinia.gov.pl/bon-szkoleniowy |
| bon-stazowy | https://zielonalinia.gov.pl/bon-stazowy |
| dotacja-dzialalnosc-gospodarcza | https://zielonalinia.gov.pl/jednorazowe-srodki-na-dzialalnosc-gospodarcza |
| dofinansowanie-wynagrodzenia-50-plus | https://zielonalinia.gov.pl/dofinansowanie-wynagrodzenia |
| przygotowanie-zawodowe-doroslych | https://zielonalinia.gov.pl/przygotowanie-zawodowe-doroslych |
| program-aktywizacja-integracja | https://zielonalinia.gov.pl/program-aktywizacja-i-integracja |

- [ ] **Krok 3: Zaktualizuj praca.ts - 7 linii**

Zamień każdą linię tylko dla potwierdzonych działających URL (nie zmieniaj na niesprawdzony):

```typescript
// praca.ts:109 - stypendium-stazowe
zrodloUrl: '<nowy_url>',

// praca.ts:217 - bon-szkoleniowy
zrodloUrl: '<nowy_url>',

// praca.ts:270 - bon-stazowy
zrodloUrl: '<nowy_url>',

// praca.ts:335 - dotacja-dzialalnosc-gospodarcza
zrodloUrl: '<nowy_url>',

// praca.ts:443 - dofinansowanie-wynagrodzenia-50-plus
zrodloUrl: '<nowy_url>',

// praca.ts:658 - przygotowanie-zawodowe-doroslych
zrodloUrl: '<nowy_url>',

// praca.ts:762 - program-aktywizacja-integracja
zrodloUrl: '<nowy_url>',
```

- [ ] **Krok 4: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/praca.ts
git commit -m "fix: 7 psz.praca.gov.pl URLs zaktualizowane"
```

---

### Task 3: Grupa C - 3 pozostałe URL

**Files:**
- Modify: `src/engine/benefits/biznes.ts:57` (preferencyjny-zus)
- Modify: `src/engine/benefits/krus.ts:238` (zasilek-opiekunczy-krus)
- Modify: `src/engine/benefits/inne.ts:39` (refundacja-okularow-nfz)

- [ ] **Krok 1: Weryfikuj preferencyjny-zus**

Aktualny URL w kodzie to `https://www.biznes.gov.pl/pl/portal/00286` (audit raport wskazywał `00126` jako broken, ale kod ma już `00286`). Otwórz:
```
https://www.biznes.gov.pl/pl/portal/00286
```
Jeśli działa - brak zmian. Jeśli 404 - szukaj na biznes.gov.pl query "preferencyjny ZUS".

- [ ] **Krok 2: Znajdź URL zasilek-opiekunczy-krus**

Aktualny URL: `https://www.krus.gov.pl/zadania-krus/swiadczenia/zasilek-opiekunczy/`

Otwórz w przeglądarce. Jeśli 404, szukaj na:
```
https://www.krus.gov.pl/  (wyszukaj "zasiłek opiekuńczy")
```
Prawdopodobny nowy URL: `https://www.krus.gov.pl/swiadczenia/zasilek-opiekunczy/`

- [ ] **Krok 3: Weryfikuj refundacja-okularow-nfz**

Aktualny URL: `https://www.nfz.gov.pl/dla-pacjenta/ubezpieczenia-w-nfz/zaopatrzenie-w-wyroby-medyczne/`

Otwórz. Jeśli 404, sprawdź alternatywy:
```
https://pacjent.gov.pl/swiadczenia-nfz/wyroby-medyczne
https://www.nfz.gov.pl/dla-pacjenta/wyroby-medyczne/
```

- [ ] **Krok 4: Zaktualizuj pliki (tylko dla zmienionych URL)**

```typescript
// biznes.ts:57 (jeśli 00286 jest broken)
zrodloUrl: '<nowy_url_biznes.gov.pl>',

// krus.ts:238
zrodloUrl: '<nowy_url_krus.gov.pl>',

// inne.ts:39
zrodloUrl: '<nowy_url_nfz_lub_pacjent.gov.pl>',
```

- [ ] **Krok 5: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/biznes.ts src/engine/benefits/krus.ts src/engine/benefits/inne.ts
git commit -m "fix: 3 URL Grupa C (biznes.gov.pl, krus.gov.pl, nfz.gov.pl)"
```

---

## Blok B: Weryfikacja 14 wartości 2026

### Task 4: ulga-ikze - limity 2026

**Files:**
- Modify: `src/engine/benefits/podatki.ts:69` (opis)
- Modify: `src/engine/benefits/podatki.ts:71` (kwota, kwotaMax)

Obecne wartości: `9 388,80 PLN` i `14 083,20 PLN` (audit: prawdopodobnie 2024).

- [ ] **Krok 1: Znajdź limity IKZE 2026**

Limity IKZE = 1,2× i 1,8× przeciętnego wynagrodzenia z poprzedniego roku (III kwartał). Szukaj:
- `https://www.gov.pl/web/gov/ogłoszenia` (obwieszczenie Ministra Rodziny ws. limitów IKZE 2026)
- Lub sprawdź `https://www.pit.pl/ikze/` - zazwyczaj aktualizują na bieżąco

Dla 2026 prawdopodobne wartości:
- Limit podstawowy: ok. **9 836,40 PLN** (jeśli przeciętne wynagrodzenie wzrosło o ~5%)
- Limit DG: ok. **14 754,60 PLN**

**Muszisz to zweryfikować** - wpisz w Google: `obwieszczenie MRPiPS IKZE 2026 limit`

- [ ] **Krok 2: Zaktualizuj podatki.ts:69 i :71**

```typescript
// podatki.ts:69
opis: '...Limit wpłat w 2026 roku to XXXX PLN (dla osób na umowie...) lub XXXX PLN (DG)...',

// podatki.ts:71
kwota: 'do XXXX PLN odliczenia rocznie (2026)', kwotaMax: XXXX,
```

- [ ] **Krok 3: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/podatki.ts
git commit -m "fix: ulga-ikze - limity 2026 (MRPiPS obwieszczenie)"
```

---

### Task 5: swiadczenie-pielegnacyjne - kwota 2026

**Files:**
- Modify: `src/engine/benefits/senior.ts:151` (opis)
- Modify: `src/engine/benefits/senior.ts:153` (kwota, kwotaMin, kwotaMax)

Obecna wartość: `3386 PLN`. Audit sugeruje ~3287 PLN (3174 + 3,4%) lub wyżej.

- [ ] **Krok 1: Znajdź kwotę świadczenia pielęgnacyjnego od 1.01.2026**

Szukaj:
- `https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne`
- Google: `świadczenie pielęgnacyjne kwota 2026`
- Obwieszczenie MRPiPS o wysokości świadczenia pielęgnacyjnego od 1 stycznia 2026

Świadczenie pielęgnacyjne = minimalne wynagrodzenie za pracę. W 2026 minimalne wynagrodzenie = **4666 PLN brutto** (od 01.01.2026). Jednak po odliczeniu składek netto to ok. 3866 PLN.

**UWAGA:** Jeśli minimalne wynagrodzenie 2026 = 4666 PLN brutto, to kwota świadczenia pielęgnacyjnego = **4666 PLN brutto** (ustawa powiązała ją z minimalnym). Sprawdź potwierdzenie tej wartości.

- [ ] **Krok 2: Zaktualizuj senior.ts:151 i :153**

```typescript
// senior.ts:151 - w opis zmień "3386 PLN miesięcznie (2026)" na nową wartość
// senior.ts:153
kwota: 'XXXX PLN miesięcznie (2026)', kwotaMin: XXXX, kwotaMax: XXXX * 2,
// kwotaMax = 2x dla dwojga dzieci z niepełnosprawnością
```

- [ ] **Krok 3: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/senior.ts
git commit -m "fix: swiadczenie-pielegnacyjne - kwota 2026"
```

---

### Task 6: renta-rodzinna - minimum po waloryzacji marzec 2026

**Files:**
- Modify: `src/engine/benefits/rodzina.ts:267` (opis - zmiana wartości 1780,96 → ~1878 PLN)

Obecna wartość: `1780,96 PLN brutto (od marca 2025)`. Waloryzacja marzec 2026: +5,3%.

- [ ] **Krok 1: Oblicz i zweryfikuj nowe minimum**

`1780,96 × 1,053 = 1875,35 PLN` (przybliżenie). Oficjalne minimum podaje ZUS po waloryzacji.

Szukaj:
- Google: `renta rodzinna minimalna kwota marzec 2026`
- `https://www.zus.pl/swiadczenia/renty/renta-rodzinna` (może podawać aktualne minimum)

- [ ] **Krok 2: Zaktualizuj rodzina.ts:267**

W opisie zamień:
```
// PRZED:
Minimalna renta rodzinna wynosi 1780,96 PLN brutto (od marca 2025).
// PO:
Minimalna renta rodzinna wynosi XXXX PLN brutto (od marca 2026).
```

- [ ] **Krok 3: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/rodzina.ts
git commit -m "fix: renta-rodzinna minimum marzec 2026"
```

---

### Task 7: zasilek-dla-bezrobotnych - kwoty od 1.06.2026

**Files:**
- Modify: `src/engine/benefits/praca.ts:10` (opis)
- Modify: `src/engine/benefits/praca.ts:12` (kwota, kwotaMin)
- Modify: `src/engine/benefits/praca.ts:13` (kwotaMin)

Obecne: `1721,90 PLN` i `1352,20 PLN`. Od 01.06.2026: `1783,90 PLN` i `1400,90 PLN`.

- [ ] **Krok 1: Zweryfikuj nowe kwoty**

Google: `zasiłek dla bezrobotnych kwota czerwiec 2026 obwieszczenie`

Prawdopodobne źródło: Obwieszczenie Ministra Rodziny ws. wysokości zasiłku dla bezrobotnych od 1 czerwca 2026.

- [ ] **Krok 2: Zaktualizuj praca.ts linie 10, 12, 13**

```typescript
// praca.ts:10 - w opis zamień wszystkie wzmianki:
// "1721,90 PLN" → "1783,90 PLN"
// "1352,20 PLN" → "1400,90 PLN"
// "2066,28 PLN" → "2140,68 PLN" (120% z 1783,90, jeśli ta logika nadal obowiązuje)
// Dodaj wzmiankę: "od 1 czerwca 2026"

// praca.ts:12
kwota: '1783,90 PLN brutto/mies. (pierwsze 90 dni, od 1.06.2026), potem 1400,90 PLN brutto; 120% przy stażu 20+ lat',

// praca.ts:13
kwotaMin: 1401,
```

- [ ] **Krok 3: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/praca.ts
git commit -m "fix: zasilek-dla-bezrobotnych - kwoty od 1.06.2026"
```

---

### Task 8: maly-zus-plus - weryfikacja mechanizmu

**Files:**
- Modify: `src/engine/benefits/biznes.ts:62` (opis - ewentualna zmiana mechanizmu)
- Modify: `src/engine/benefits/biznes.ts:64` (czestotliwosc)
- Modify: `src/engine/benefits/biznes.ts:81` (pulapki)

Obecny opis: "36 miesięcy w ciągu 60 miesięcy, potem 24 miesiące pełnego ZUS". Audit agent sugerował że od 2026 elastyczne okno bez przerwy.

- [ ] **Krok 1: Zweryfikuj zasady Małego ZUS Plus 2026**

Otwórz:
```
https://www.gov.pl/web/rozwoj-technologia/maly-zus-plus
```

Sprawdź czy mechanizm "36 z 60 + 24 mies. przerwy" nadal obowiązuje, czy zmieniono go na elastyczne okno bez wymaganej przerwy.

- [ ] **Krok 2: Zaktualizuj biznes.ts (tylko jeśli mechanizm się zmienił)**

Jeśli zasady NIEZMIENIONE - brak edycji.

Jeśli zmienione (elastyczne okno):
```typescript
// biznes.ts:62 - usuń wzmiankę o "24 miesiącach pełnego ZUS po wyczerpaniu"
// biznes.ts:64
czestotliwosc: 'miesięcznie (elastyczne okno)',

// biznes.ts:81 - usuń lub zaktualizuj:
// PRZED: 'Można korzystać max 36 miesięcy w ciągu 60, potem 24 miesiące pełnego ZUS'
// PO: 'Można korzystać max 36 miesięcy w ciągu 60 ...'
```

Analogiczna wzmianka w `preferencyjny-zus` opis (biznes.ts:38 i :54) - zaktualizuj jeśli zmienione.

- [ ] **Krok 3: Commit (tylko jeśli coś zmieniłeś)**

```bash
npx tsc --noEmit
git add src/engine/benefits/biznes.ts
git commit -m "fix: maly-zus-plus - mechanizm 2026 zaktualizowany"
```

---

### Task 9: karta-duzej-rodziny - doprecyzowanie Parki Narodowe

**Files:**
- Modify: `src/engine/benefits/pomoc_spoleczna.ts:6` (opis)
- Modify: `src/engine/benefits/pomoc_spoleczna.ts:8` (kwota opis)
- Modify: `src/engine/benefits/pomoc_spoleczna.ts:35` (pulapki)

Obecny opis: "darmowy wstęp do 23 Parków Narodowych" (bez ograniczenia czasowego). Audit: tylko w wakacje (lipiec-sierpień).

- [ ] **Krok 1: Zweryfikuj zasady wstępu do Parków Narodowych z KDR**

Sprawdź:
```
https://www.gov.pl/web/rodzina/karta-duzej-rodziny-ogolne
```
lub Google: `Karta Dużej Rodziny Parki Narodowe 2026 wstęp zasady`

Potwierdź czy wstęp darmowy całorocznie czy tylko lipiec-sierpień.

- [ ] **Krok 2: Zaktualizuj pomoc_spoleczna.ts - 3 miejsca**

```typescript
// pomoc_spoleczna.ts:6 - w opis zmień:
// PRZED: "darmowy wstęp do 23 Parków Narodowych"
// PO: "darmowy wstęp do 23 Parków Narodowych (tylko lipiec-sierpień)" // jeśli potwierdzono

// pomoc_spoleczna.ts:8 - w kwota zmień analogicznie

// pomoc_spoleczna.ts:35 - w pulapki zmień:
// PRZED: 'Darmowy wstęp do 23 Parków Narodowych',
// PO: 'Darmowy wstęp do 23 Parków Narodowych (tylko lipiec-sierpień)',
```

- [ ] **Krok 3: Commit**

```bash
npx tsc --noEmit
git add src/engine/benefits/pomoc_spoleczna.ts
git commit -m "fix: karta-duzej-rodziny - wstep do parkow tylko wakacje"
```

---

### Task 10: Weryfikacja 8 SPA-redirect URL

**Files:**
- Sprawdzić: `src/engine/benefits/senior.ts` (swiadczenie-pielegnacyjne, leki-senior-65plus)
- Sprawdzić: `src/engine/benefits/rodzina.ts` (800-plus, becikowe, kosiniakowe)
- Sprawdzić: `src/engine/benefits/zus.ts` (mama-4-plus)
- Sprawdzić: `src/engine/benefits/krus.ts` (becikowe-krus)
- Sprawdzić: który plik ma `dzienny-dom-pomocy`

Te URL-e przekierowują na homepage przez SPA rendering (Node.js fetch), ale mogą działać w przeglądarce.

- [ ] **Krok 1: Znajdź wszystkie 8 URL**

```bash
grep -n "zrodloUrl" src/engine/benefits/senior.ts src/engine/benefits/rodzina.ts src/engine/benefits/krus.ts
grep -rn "dzienny-dom-pomocy" src/engine/benefits/*.ts
```

- [ ] **Krok 2: Zweryfikuj każdy w przeglądarce (z polskiego IP)**

Lista URL do sprawdzenia:
- swiadczenie-pielegnacyjne → `https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne`
- dzienny-dom-pomocy → znajdź z kroku 1
- leki-senior-65plus → znajdź z kroku 1
- 800-plus → `https://www.gov.pl/web/rodzina/800-plus`
- becikowe → znajdź z kroku 1
- kosiniakowe → znajdź z kroku 1
- mama-4-plus → `https://www.gov.pl/web/rodzina/rodzicielskie-swiadczenie-uzupelniajace`
- becikowe-krus → znajdź z kroku 1

Dla każdego: jeśli URL działa w przeglądarce ale nie w Node.js fetch, zaktualizuj tylko `dataWeryfikacji` (URL jest poprawny). Jeśli URL jest faktycznie 404, znajdź nowy.

- [ ] **Krok 3: Commit (tylko jeśli zmieniono URL)**

```bash
npx tsc --noEmit
git add src/engine/benefits/senior.ts src/engine/benefits/rodzina.ts src/engine/benefits/krus.ts
git commit -m "fix: 8 SPA-redirect URL - weryfikacja i aktualizacja"
```

---

## Finalna weryfikacja

- [ ] **Uruchom TypeScript check**

```bash
npx tsc --noEmit
```

Oczekiwany wynik: `0 errors`

- [ ] **Opcjonalnie: uruchom URL audit**

Jeśli projekt ma skrypt do audytu URL:
```bash
# sprawdź czy istnieje
grep -r "benefits-audit\|url-audit" package.json
```

---

## Podsumowanie zmian (wypełnij po wykonaniu)

| Task | Plik | Linie | Status |
|---|---|---|---|
| ZUS Grupa A (4 URL) | zus.ts | 292, 386, 419, 455 | [ ] |
| psz.praca.gov.pl (7 URL) | praca.ts | 109, 217, 270, 335, 443, 658, 762 | [ ] |
| Grupa C (3 URL) | biznes.ts:57, krus.ts:238, inne.ts:39 | | [ ] |
| ulga-ikze limity | podatki.ts | 69, 71 | [ ] |
| swiadczenie-pielegnacyjne | senior.ts | 151, 153 | [ ] |
| renta-rodzinna minimum | rodzina.ts | 267 | [ ] |
| zasilek-dla-bezrobotnych od 1.06 | praca.ts | 10, 12, 13 | [ ] |
| maly-zus-plus mechanizm | biznes.ts | 62, 64, 81 | [ ] |
| karta-duzej-rodziny parki | pomoc_spoleczna.ts | 6, 8, 35 | [ ] |
| 8 SPA-redirect URL | senior/rodzina/krus.ts | rozne | [ ] |
