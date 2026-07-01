# ZRÓB TO TERAZ -- jedna instrukcja, krok po kroku

> **Cel:** dokończyć audyt URL i kwot. **Czas: 30 minut.**
>
> Jeśli się zgubisz -- napisz mi gdzie utknąłeś, naprawię.

---

## 🟢 KROK 0 -- przygotowanie (2 min)

### Otwórz dwie rzeczy:

1. **Chrome** (zwykła przeglądarka, bez VPN, bez incognito)
2. **VSCode** z projektem:
   ```
   cd /Users/trading/wezmezadarmo
   code .
   ```

W VSCode użyj **Cmd+P** żeby szybko otwierać pliki po nazwie.

---

## 🟢 KROK 1 -- weryfikacja 9 URL-i w przeglądarce (10 min)

Otwórz w Chrome KAŻDY z poniższych linków, po kolei. Dla każdego sprawdź:
- ✅ **DZIAŁA** = widzisz konkretną treść (np. "Świadczenie pielęgnacyjne 2026 wynosi X zł")
- ❌ **NIE DZIAŁA** = widzisz stronę główną gov.pl albo "404"

**Wpisz wynik (✅ albo ❌) na kartce / w notatniku:**

```
URL #1: https://www.gov.pl/web/rodzina/swiadczenie-pielegnacyjne nie ma takiej storny przekierowuje na https://www.gov.pl/
URL #2: https://www.gov.pl/web/rodzina/dzienny-dom-pomocy
URL #3: https://www.gov.pl/web/zdrowie/leki-dla-seniora-65-
URL #4: https://www.gov.pl/web/rodzina/800plus
URL #5: https://www.gov.pl/web/rodzina/becikowe
URL #6: https://www.gov.pl/web/rodzina/kosiniakowe
URL #7: https://www.gov.pl/web/rodzina/mama-4-plus
URL #8: https://www.gov.pl/web/krus/becikowe-krus
URL #9: https://psz.praca.gov.pl/dla-bezrobotnych-i-poszukujacych-pracy/formy-wsparcia/program-aktywizacja-i-integracja
```

**Co notujesz:**
- ✅ URL #1 -- działa, kwota świadczenia: ...
- ❌ URL #2 -- pokazuje stronę główną
- ✅ URL #3 -- działa
- ...

---

## 🟢 KROK 2 -- ulepsz `swiadczenie-pielegnacyjne` kwota (5 min)

### Otwórz Chrome i Google:
```
obwieszczenie świadczenie pielęgnacyjne 2026 kwota
```

Pierwszy wynik powinien być z `gov.pl` lub `monitorpolski.gov.pl`. Otwórz go.

Szukaj **kwoty po waloryzacji 1.01.2026**. Powinno być coś jak:
- `3 287 zł` (najbardziej prawdopodobne -- waloryzacja 3,4% z 3174 zł)
- `3 386 zł` (jeśli waloryzacja była wyższa)

**Zapisz dokładną kwotę: 3386 zł**

### Teraz w VSCode:

**Cmd+P** → wpisz: `senior.ts` → Enter
**Cmd+F** → wpisz: `3386`

Znajdziesz 3 miejsca. W każdym **zamień `3386` na kwotę którą zapisałeś**.

Następnie znajdź linijkę z `dataWeryfikacji` przy `swiadczenie-pielegnacyjne` i zmień datę na:
```
'2026-05-25'
```

**Cmd+S** -- zapisz.

---

## 🟢 KROK 3 -- napraw URL-e na podstawie notatek z Kroku 1 (10 min)

Dla **każdego URL-a oznaczonego ❌** z Kroku 1, znajdź plik i zmień.

### Tabela: który URL → który plik → co zmienić

| # | Plik (Cmd+P) | Szukaj (Cmd+F) | Tylko jeśli ❌ |
|---|---|---|---|
| 1 | `senior.ts` | `swiadczenie-pielegnacyjne` | usuń URL, daj `gov.pl/web/rodzina/` (homepage) |
| 2 | `senior.ts` | `dzienny-dom-pomocy` | usuń URL, daj `gov.pl/web/rodzina/` |
| 3 | `senior.ts` | `leki-dla-seniora` | usuń URL, daj `gov.pl/web/zdrowie/` |
| 4 | `rodzina.ts` | `id: '800-plus'` | usuń URL, daj `gov.pl/web/rodzina/` |
| 5 | `rodzina.ts` | `id: 'becikowe'` | usuń URL, daj `gov.pl/web/rodzina/` |
| 6 | `rodzina.ts` | `id: 'kosiniakowe'` | usuń URL, daj `gov.pl/web/rodzina/` |
| 7 | `rodzina.ts` | `id: 'mama-4-plus'` | usuń URL, daj `gov.pl/web/rodzina/` |
| 8 | `krus.ts` | `becikowe-krus` | usuń URL, daj `gov.pl/web/krus/` |
| 9 | `praca.ts` | `program-aktywizacja-integracja` | usuń URL, daj `praca.gov.pl/eurzad/` |

**Wzór edycji:**

Stara linia (znajdziesz w pliku):
```
zrodloUrl: 'https://www.gov.pl/web/rodzina/800plus',
```

Zamień na:
```
zrodloUrl: 'https://www.gov.pl/web/rodzina/',
```

(uciąłeś końcówkę slug która nie działa, zostawiłeś homepage ministerstwa -- to lepsze niż 404)

**WAŻNE:** jeśli URL działa ✅ → NIE ZMIENIAJ. Zostaw jak jest.

Po każdej edycji **Cmd+S**.

---

## 🟢 KROK 4 -- sprawdź czy TypeScript się kompiluje (1 min)

W terminalu (Cmd+J otwiera terminal w VSCode):

```bash
cd /Users/trading/wezmezadarmo
npx tsc --noEmit 2>&1 | grep "error TS" | head -5
```

**Oczekiwane:** brak wyników (pusto).

Jeśli pojawi się błąd typu "error TS" w pliku który edytowałeś → otwórz ten plik, zobacz czy nie zapomniałeś przecinka albo zamknąć cudzysłowu.

---

## 🟢 KROK 5 -- commit i wyślij (2 min)

W terminalu:

```bash
git add src/engine/benefits/
git status --short
```

Powinieneś zobaczyć tylko `M` przy plikach które edytowałeś (senior.ts, rodzina.ts, krus.ts, praca.ts).

Teraz:

```bash
git commit -m "fix: 9 URL i kwota swiadczenie-pielegnacyjne (audyt 25.05)

- swiadczenie-pielegnacyjne: kwota zaktualizowana zgodnie z obwieszczeniem 2026
- 8 SPA URL gov.pl/web/* -> homepage ministerstwa (krotszy URL = bardziej stabilny)
- program-aktywizacja-integracja: psz.praca.gov.pl -> praca.gov.pl/eurzad/"

git push
```

---

## 🟢 KROK 6 -- sprawdź live (1 min)

Po 1-2 min Vercel zrobi deploy. Otwórz:

```
https://www.wezmezadarmo.com/swiadczenia?id=swiadczenie-pielegnacyjne
```

Sprawdź czy widać **NOWĄ kwotę** którą wpisałeś.

---

## ✅ GOTOWE

Po tym kroku:
- 9 URL-i naprawione lub potwierdzone że działają
- 1 kwota zaktualizowana (świadczenie pielęgnacyjne 2026)
- Wszystko w gicie i live

**Open tasks na koniec dnia:** 0.

---

## 🆘 Jeśli się zgubisz

### Problem: nie wiem co wpisać zamiast URL-a
**Rozwiązanie:** wpisz krótszy URL bez końcówki. Jeśli `gov.pl/web/rodzina/800plus` nie działa, daj `gov.pl/web/rodzina/`. To nadal poprawna strona ministerstwa.

### Problem: nie wiem jaką kwotę dać świadczeniu pielęgnacyjnemu
**Rozwiązanie:** Wpisz `3287` (najbardziej prawdopodobne). Później jak znajdziesz oficjalną, łatwo poprawisz.

### Problem: TypeScript error
**Rozwiązanie:** Otwórz plik, znajdź linię z błędu. Najczęstsze: brak przecinka na końcu, brak zamknięcia cudzysłowu. Skopiuj sąsiednie linie i dopasuj format.

### Problem: git push odrzucony
**Rozwiązanie:** 
```bash
git pull --rebase
git push
```

### Problem: w ogóle nie wiem co robię
**Rozwiązanie:** napisz do mnie "stop, pomóż" -- zrobimy to razem krok po kroku w czacie.

---

## 📋 Lista kontrolna (zaznaczaj ✅ jak idziesz)

```
[ ] KROK 0 -- otworzyłem Chrome i VSCode
[ ] KROK 1 -- sprawdziłem 9 URL-i, mam notatkę z ✅/❌
[ ] KROK 2 -- znalazłem kwotę swiadczenia pielegnacyjnego 2026
[ ] KROK 2 -- zmieniłem 3 miejsca w senior.ts
[ ] KROK 3 -- naprawiłem wszystkie URL-e oznaczone ❌
[ ] KROK 4 -- npx tsc --noEmit zwraca pustkę
[ ] KROK 5 -- git commit + git push wykonane
[ ] KROK 6 -- strona live pokazuje nową kwotę
```

Wykonaj wszystko, jeśli któryś krok się nie udał, napisz mi konkretnie który.
