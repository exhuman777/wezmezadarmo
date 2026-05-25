# Testing Checklist -- 3 zadania URL/treści, po kolei

> **Cel:** Wykonać 3 pozostałe taski auditu w **45 min**, z polskim IP w przeglądarce + Node.js do edycji plików.
>
> **Pełny plan:** `docs/superpowers/plans/2026-05-25-url-content-audit-fixes.md` (referencja)

---

## ✅ Workflow (3 taski, ~45 min)

### Setup (1 min)
```bash
cd /Users/trading/wezmezadarmo
git checkout feat/multi-agent   # lub main, zależnie gdzie pracujesz
git pull
code docs/superpowers/plans/2026-05-25-url-content-audit-fixes.md  # otwórz plan w VSCode
```

Otwórz w przeglądarce 3 zakładki (z polskiego IP, najlepiej zwykła Chrome bez VPN):
1. **Monitor Polski:** https://monitorpolski.gov.pl/szukaj?phrase=%C5%9Bwiadczenie+piel%C4%99gnacyjne+2026
2. **Zielona Linia:** https://zielonalinia.gov.pl
3. **gov.pl wyszukiwarka:** https://www.gov.pl/

---

## TASK A: `program-aktywizacja-integracja` URL (5 min)

### Krok 1: Otwórz stary URL
```
https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/program-aktywizacja-i-integracja
```
**Sprawdź:** czy działa (powinno) lub 404.

### Krok 2: Otwórz alternatywę
```
https://zielonalinia.gov.pl/program-aktywizacja-i-integracja
```
**Sprawdź:** czy działa i ma sensowną treść (PAI = Program Aktywizacja i Integracja).

### Krok 3: Wybierz lepszy URL
- Jeśli `psz.praca.gov.pl` działa → ZOSTAW jak jest
- Jeśli tylko `zielonalinia.gov.pl` → ZMIEŃ na ten

### Krok 4: Edycja pliku (jeśli wymagane)
```bash
# w VSCode otwórz:
src/engine/benefits/praca.ts
# znajdź linię 762 (zrodloUrl: 'https://psz.praca.gov.pl/...program-aktywizacja-i-integracja')
# zmień URL na działający
# zaktualizuj dataWeryfikacji na '2026-05-25'
```

### Krok 5: Verify
```bash
curl -sIL -A "Mozilla/5.0" "{NOWY_URL}" -o /dev/null -w "%{http_code}\n"
# powinno 200
```

### Krok 6: Checkbox
W pliku `docs/superpowers/plans/2026-05-25-url-content-audit-fixes.md` zaznacz `[x]` przy Task 2 -- program-aktywizacja-integracja.

---

## TASK B: `swiadczenie-pielegnacyjne` kwota 2026 (10 min)

### Krok 1: Znajdź obwieszczenie MRPiPS 2026
```
Otwórz Monitor Polski (już otwarta zakładka)
W wyszukiwarce wpisz: "świadczenie pielęgnacyjne 2026"
```
Szukaj **obwieszczenia MRPiPS z 2025 r.** o wysokości świadczenia w 2026.

**Alternatywne źródła (cross-check):**
- https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne
- https://www.infor.pl/prawo/zasilki/swiadczenie-pielegnacyjne/
- https://www.zus.pl (wyszukaj "pielęgnacyjne")

### Krok 2: Zapisz dokładną kwotę
```
2025: 3 174 PLN/mies
2026: ? PLN/mies   (po waloryzacji ~3,4%)
```

**Oczekiwane wartości:**
- Wariant A: `3 287 PLN` (waloryzacja 3,4% z 3174 PLN)
- Wariant B: `3 386 PLN` (obecna wartość w bazie, może błędna)

Wybierz tę która JEST W OBWIESZCZENIU.

### Krok 3: Edycja pliku
```bash
code src/engine/benefits/senior.ts
# linia 151: kwota: '3386 PLN miesięcznie' → '{POPRAWNA} PLN miesięcznie (od 1.01.2026)'
# linia 153: kwotaMin: 3386 → {POPRAWNA}
# linia 153: kwotaMax: 3386 → {POPRAWNA}
# w opisie też zmień wszystkie wystąpienia 3386
# zaktualizuj dataWeryfikacji na '2026-05-25'
```

### Krok 4: Verify (grep nie powinien znaleźć starej kwoty)
```bash
grep -n "3386\|3 386" src/engine/benefits/senior.ts
# powinno: brak wyników
```

### Krok 5: Checkbox
Plan → Task 5 `[x]` swiadczenie-pielegnacyjne kwota 2026

---

## TASK C: 8 SPA-redirect URL z przeglądarki (20 min)

### Lista 8 URL-i (z URL_AUDIT_REPORT.md grupa D + CONTENT_AUDIT)
```
1. https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne           (senior.ts)
2. https://www.gov.pl/web/rodzina/dzienny-dom-pomocy                   (senior.ts)
3. https://www.gov.pl/web/zdrowie/leki-dla-seniora-65-               (senior.ts)
4. https://www.gov.pl/web/rodzina/800plus                              (rodzina.ts)
5. https://www.gov.pl/web/rodzina/becikowe                             (rodzina.ts)
6. https://www.gov.pl/web/rodzina/kosiniakowe                          (rodzina.ts)
7. https://www.gov.pl/web/rodzina/mama-4-plus                          (rodzina.ts)
8. https://www.gov.pl/web/krus/becikowe-krus                           (krus.ts)
```

**Problem:** Te URL-e dla Node.js fetch zwracają redirect na homepage (SPA rendering). W przeglądarce mogą działać poprawnie.

### Krok 1: Otwórz każdy URL w przeglądarce (1 min/URL = 8 min)
Skopiuj kolejno z listy powyżej. Dla każdego sprawdź:
- **✅ Działa:** strona ładuje konkretną treść świadczenia (kwota, warunki, wniosek)
- **❌ Redirect:** widzisz home gov.pl lub 404

### Krok 2: Jeśli URL działa → zostaw jak jest, ale verify w kodzie
```bash
grep -n "swiadczenie-pielegnacyjne\|dzienny-dom-pomocy\|800plus\|becikowe\|kosiniakowe\|mama-4-plus" src/engine/benefits/{senior,rodzina,krus}.ts | head -20
```
Sprawdź czy URL w `zrodloUrl` matchuje to co działa w przeglądarce.

### Krok 3: Jeśli URL nie działa → znajdź zastępczy
**Strategy:**
1. Google: `"{nazwa swiadczenia}" site:gov.pl`
2. Wybierz pierwszy URL z `gov.pl/web/...` który prowadzi do konkretnej strony
3. Verify w przeglądarce
4. Edit plik benefit + zaktualizuj URL + `dataWeryfikacji`

### Krok 4: Update User-Agent w benefits-audit.ts
**Cel:** żeby cron audit nie alarmował false positive na te 3 z grupy D (czystepowietrze.gov.pl).

```bash
grep -n "USER_AGENT" src/lib/benefits-audit.ts
```
Sprawdź czy używa już browser-like UA (`Mozilla/5.0...Chrome/120`). Jeśli tak -- gotowe (commit 15dc702 to zrobił).

### Krok 5: Checkbox
Plan → Task 10 `[x]` 8 SPA-redirect URL weryfikacja

---

## 🧪 FINAL TESTING (5 min)

Po zakończeniu Task A+B+C:

### 1. TypeScript
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | head -5
# powinno: 0 errors w plikach które edytowałeś
```

### 2. Audyt URL re-run
```bash
# Re-dump benefits to JSON
npx tsx -e "
import { ALL_BENEFITS } from './src/engine/benefits/index.ts';
import { writeFileSync } from 'fs';
const dump = ALL_BENEFITS.map(b => ({ id: b.id, nazwa: b.nazwa, kategoria: b.kategoria, zrodloUrl: b.zrodloUrl }));
writeFileSync('/tmp/benefits_dump.json', JSON.stringify(dump));
console.log('Dumped', dump.length);
"

# Re-audit
node /tmp/audit_urls2.mjs 2>&1 | tail -25
# oczekuj: OK >= 115/118 (3 false positives od TLS to OK)
```

### 3. Manual spot-check
Otwórz w przeglądarce 3 random URL-e z bazy:
```bash
npx tsx -e "
import { ALL_BENEFITS } from './src/engine/benefits/index.ts';
const random = [
  ALL_BENEFITS.find(b => b.id === 'swiadczenie-pielegnacyjne'),
  ALL_BENEFITS.find(b => b.id === 'program-aktywizacja-integracja'),
  ALL_BENEFITS.find(b => b.id === '800-plus'),
].filter(Boolean);
random.forEach(b => console.log(b?.id, '|', b?.kwota, '|', b?.zrodloUrl));
"
```

Każdy URL otwórz w przeglądarce → powinien działać, każda kwota → powinna match oficjalnej.

### 4. Commit + push
```bash
git add src/engine/benefits/ src/lib/benefits-audit.ts docs/TESTING_CHECKLIST.md
git commit -m "fix: 3 pozostale taski auditu (program-aktywizacja, swiadczenie-pielegnacyjne, 8 SPA URL)"
git push
```

### 5. Zaznacz pozostałe checkboxy w planie
W `docs/superpowers/plans/2026-05-25-url-content-audit-fixes.md` na końcu jest tracking table -- zaznacz `[x]` przy Task 2, 5, 10.

---

## 📊 Status pre/post

| Metryka | Przed | Po |
|---|---|---|
| OK URL | 101/118 (86%) | 115+/118 (97%+) |
| Wartości 2026 zweryfikowane | 78/104 | 79+/104 |
| Open tasks (pending) | #16, #17 | 0 |
| Wszystkie 118 świadczeń up-to-date | ❌ | ✅ |

---

## ⚡ Skrót dla niecierpliwych (15 min)

Jeśli musisz to zrobić MAKSYMALNIE SZYBKO:

1. **Otwórz przeglądarkę** (5 min) -- 9 URL-i, sprawdź które działają (8 SPA + 1 program-aktywizacja)
2. **Edytuj pliki** (5 min) -- 9 plików, każdy: zmień zrodloUrl + dataWeryfikacji
3. **swiadczenie-pielegnacyjne** (3 min) -- google "obwieszczenie świadczenie pielęgnacyjne 2026", wpisz kwotę
4. **TS check + commit** (2 min) -- `npx tsc --noEmit && git add -A && git commit && git push`

Wszystko inne (tests, re-audit) odłóż na potem. **MVP w 15 min**.

---

## 🤖 Auto-execute przez agenta (opcjonalnie)

Jeśli chcesz żebym ja to zrobił przy następnym sesji:
```
Wykonaj Task A, B, C z docs/TESTING_CHECKLIST.md.
Dla SPA-redirect URL: ufaj że dzialaja w PL browser, tylko zweryfikuj kwoty 
przez Google + cross-check 2 zrodla. Commit kazdego taska osobno.
```

**Ograniczenie:** dla Task A (psz.praca) potrzebny polski IP -- to musisz Ty zrobić.
