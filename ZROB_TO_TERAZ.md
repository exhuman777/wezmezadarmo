# ZRÓB TO TERAZ -- jedna instrukcja, krok po kroku

> **Stan: 5 lipca 2026.** Poprzedni audyt URL z tego pliku jest ZAKOŃCZONY
> (zrobiony automatycznie: 6 martwych linków naprawionych, kwoty zweryfikowane,
> wdrożone na produkcję). Poniżej TYLKO to, co zostało do zrobienia ręcznie.
> Łączny czas: ~10 minut.

---

## 🔴 KROK 1 -- migracja rate limitu w Supabase (5 min, JEDYNY WYMAGANY)

Bez tego limit czatu AI (3 pytania/dzień) działa po staremu, per instancja
serwera, czyli jest dziurawy. Kod na produkcji już czeka na tabelę.

**Opcja A (szybsza, przez Claude):**
1. W Claude Code wpisz `/mcp` i wybierz **claude.ai Supabase** -> autoryzuj w przeglądarce
2. Napisz mi: "zrób migrację" -- wykonam ją i zweryfikuję sam

**Opcja B (ręczna):**
1. Otwórz https://supabase.com/dashboard -> projekt wezmezadarmo -> **SQL Editor**
2. Otwórz w VSCode plik `supabase/migrations/20260705_chat_rate_limits.sql` (Cmd+P, wpisz "chat_rate")
3. Skopiuj CAŁĄ zawartość, wklej do SQL Editora, kliknij **Run**
4. Weryfikacja -- wklej i uruchom:
   ```sql
   select * from chat_rate_limits;
   ```
   Pusta tabela (0 rows, bez błędu) = sukces.

---

## 🟡 KROK 2 -- test na produkcji (3 min, warto)

1. Otwórz https://www.wezmezadarmo.com/swiadczenia i wpisz w wyszukiwarkę:
   - `kuroniowka` -> ma pokazać zasiłek dla bezrobotnych
   - `trzynastka` -> 13. emerytura
   - `leki seniorzy` -> bezpłatne leki 65+
2. Otwórz czat i zadaj 3 pytania. Czwarte ma pokazać komunikat o limicie.
   Po KROKU 1 limit działa też w oknie incognito (wcześniej nie działał).

---

## 🟢 KROK 3 -- opcjonalne (kiedy będzie chwila)

- **Node 20.19+**: maszyna ma 20.16, przez co vitest jest przypięty do v3.
  Po aktualizacji Node można wrócić do vitest 4. Nie blokuje niczego.
- **Post na blogu**: nowy wpis "co nowego" jest już na /blog po deployu.
  Przeczytaj i zdecyduj, czy udostępnić w social mediach (draft posta
  do LinkedIn dostał się w odpowiedzi Claude z 5.07).

---

## Co zostało zrobione automatycznie (nie ruszaj, działa)

- Audyt 133 zrodloUrl: 6 martwych linków ZUS/podatki.gov.pl naprawionych
- Kwoty 12 najbardziej zmiennych świadczeń zweryfikowane (marzec 2026 OK)
- Wyszukiwarka: diakrytyki, aliasy potoczne, ranking (9 testów)
- Router czatu AI: dopasowanie bez polskich znaków
- API czatu: walidacja przed limitem (400/503 zamiast 500)
- Audyt cron: wykrywa miękkie 404, nie spamuje mailami o zmianach layoutu
- Middleware: strona /blad-konfiguracji zamiast błędu 500
- Lint: 60 -> 16 problemów, martwy kod usunięty, next/image na homepage
- Testy: 141 -> 165, wszystkie zielone; tsc czysty; build 112 stron

Jeśli się zgubisz -- napisz mi gdzie utknąłeś, naprawię.
