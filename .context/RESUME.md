# RESUME -- ostatnia sesja

**Data:** 2026-07-05
**Branch:** main (up to date z origin, working tree czysty, wszystko wypchnięte)
**Model roboczy:** Opus 4.8 / Fable 5

> Ten plik = pierwsze co czytasz w nowej sesji. Pełny kontekst ostatnich prac.

---

## STAN NA DZIŚ: co jest zrobione i wdrożone

Ostatnie 3 sesje (29.06 - 05.07) skupione na: audyt świadczeń, wyszukiwarka,
niezawodność API, sprzątanie. Wszystko na produkcji (Vercel auto-deploy z main).

### Świadczenia -- audyt źródeł i kwot
- Baza: **133 świadczenia** w `src/engine/benefits/*.ts` (15 plików kategorii)
- Audyt 133 `zrodloUrl`: naprawiono **6 martwych linków** (ZUS przebudował strukturę
  witryny + podatki.gov.pl `ulga-dla-rodzin-4-pit` -> `4plus-pit`). Każdy nowy URL
  zweryfikowany curl-em (200). `dataWeryfikacji` tych 6 -> 2026-06-29
- Zweryfikowano kwoty 12 najbardziej zmiennych świadczeń po waloryzacji marzec 2026:
  wszystkie w kodzie AKTUALNE (zasiłek pogrzebowy 7000 od 1.01.2026, najniższa
  emerytura/renta 1978,49, dodatek pielęgnacyjny 366,68, świadczenie pielęgnacyjne
  3386, zasiłek dla bezrobotnych 1783,90 od 1.06.2026, itd.)

### Wyszukiwarka świadczeń (NOWA) -- `src/engine/search.ts`
- Odporna na brak polskich znaków (normalizacja diakrytyków, ł obsłużone ręcznie)
- Przeszukuje opis + kroki + dokumenty + **aliasy potoczne** (kuroniówka, trzynastka,
  czternastka, 800 plus, wyprawka, mama 4+, 500+ dla niepełnosprawnych, leki 65+...)
- Dopasowanie po rdzeniu (odmiana: "seniorzy" -> "senior"), ranking trafności
- Wpięta w `/swiadczenia` (page.tsx) ORAZ w router czatu AI (`src/agents/router.ts`
  normalizuje zapytanie i słowa kluczowe -> lepsze dopasowanie agenta)
- Testy: `src/engine/__tests__/search.test.ts` (9)

### Niezawodność API (bad paths)
- `api/chat`: walidacja wejścia PRZED limitem i kluczem AI. Błędny JSON -> 400
  (było 500), brak klucza AI -> 503 (było 500). Nie marnuje dziennego limitu
- To samo wyrównanie: `api/agent/chat`, `api/form-assist`, `api/form-chat`
- **Rate limit czatu przepisany na trwały (Supabase)** -- `src/lib/rateLimit.ts`:
  był w pamięci procesu (każda instancja Vercel liczyła osobno, deploy zerował =
  limit kosztów AI dziurawy). Teraz RPC `increment_chat_rate_limit` (atomowy,
  okno 24h), IP tylko jako SHA-256 (RODO), fallback do pamięci przy braku env.
  Testy: `src/lib/__tests__/rateLimit.test.ts` (3)

### Audyt cron -- `src/lib/benefits-audit.ts` + `api/cron/benefits-audit`
- Wykrywa **miękkie 404**: przekierowanie głębokiego URL na stronę główną
  (host się zgadza, więc stary kod tego nie łapał). Funkcja `isSoftNotFound`
- **Wyciszony szum**: sama zmiana hasha (przebudowa layoutu gov.pl) NIE wysyła
  już maila. Alert tylko gdy treść skurczyła się >50% (strona wyprana z treści).
  Zmiany nadal w bazie + panelu admin. Używa `last_content_length`
- Cron przy okazji woła `cleanup_chat_rate_limits` (wpisy >48h)
- Testy: `src/lib/__tests__/benefits-audit.test.ts` (5)

### Middleware -- `src/middleware.ts`
- Brak env Supabase lub błąd auth -> rewrite na `/blad-konfiguracji`
  (zrozumiała strona 503-style) zamiast surowego 500. try/catch wokół getSession

### Sprzątanie / tooling
- **vitest 4 -> 3.2.6**: vitest 4 ciągnie rolldown wymagający Node >=20.19,
  maszyna ma 20.16 -> `npm test` był całkowicie zepsuty. Teraz działa
- **Lint: 60 -> 16 problemów**. Naprawione: rules-of-hooks (useCity/useGeo ->
  checkCity/checkGeo w powietrze/page), 21x martwy kod, 5x `<a>` -> `<Link>`,
  3x `<img>` -> next/image (homepage), encje, exhaustive-deps.
  16 zostawionych CELOWO: react-hooks compiler (set-state-in-effect) na wzorcach
  hydration-safe/streaming -- poprawne w runtime, refactor = ryzyko bez zysku
- **Blog**: nowy wpis `/blog/co-nowego-lipiec-2026-wyszukiwarka-audyt`
  (`src/data/blog-posts.ts`) -- devlog o zmianach

### Weryfikacja (stan końcowy)
- `npx tsc --noEmit` czysty
- `npx vitest run`: **165 testów** zielonych (było 141)
- `npm run build`: 113 stron, bez ostrzeżeń
- Commity wypchnięte: fc71d1c, 3ee8f95, 98279aa (+ wcześniejsze z tej serii:
  e50e58f, 6810a2a, c146233)

---

## DO ZROBIENIA RĘCZNIE (dla użytkownika) -- patrz też ZROB_TO_TERAZ.md

1. **[WYMAGANE] Migracja Supabase** -- wklej `supabase/migrations/20260705_chat_rate_limits.sql`
   w Supabase SQL Editor. Bez tego rate limit działa na fallbacku (jak dawniej,
   dziurawy). Weryfikacja: `select * from chat_rate_limits;` -> pusta tabela = OK.
   Można też zrobić przez Claude: `/mcp` -> "claude.ai Supabase" -> autoryzuj ->
   "zrób migrację" (Claude wykona i zweryfikuje)
2. [warto] Klik-test na produkcji: wyszukiwarka (kuroniowka/trzynastka/leki seniorzy),
   czat (4. pytanie -> limit, działa też w incognito po migracji)
3. [opcjonalne] Node 20.19+ -> powrót do vitest 4 (nie blokuje)
4. [opcjonalne] Udostępnić post w social (draft w `.context/DRAFTS.md`)

---

## Stan integracji

| Integracja | Status | Uwagi |
|---|---|---|
| Resend | DZIAŁA | email signup, digest, alerty, kontakt |
| OpenRouter | DZIAŁA | gemini-2.5-flash(-lite), bez obsługi obrazków |
| Supabase | DZIAŁA | auth + tabele, RLS; NOWA tabela chat_rate_limits (czeka na migrację) |
| Stripe | DZIAŁA | checkout, portal, webhook |
| AI Agents (8x) | DZIAŁA | router keyword-based (teraz z normalizacją diakrytyków) |
| Vercel Cron | DZIAŁA | audyt świadczeń co tydzień (pon 6:00 UTC) |
| Firecrawl | NIE WDROŻONE | tylko planowany fallback |
| OpenRouter vision | NIE WDROŻONE | brak image_url w requestach |

## Pliki kluczowe (aktualne)

- `src/engine/search.ts` -- wyszukiwarka (NOWA)
- `src/engine/matcher.ts` -- dopasowanie świadczeń do profilu (rule-based)
- `src/engine/benefits/*.ts` -- 133 świadczenia
- `src/lib/rateLimit.ts` -- trwały rate limit czatu (NOWY)
- `src/lib/benefits-audit.ts` -- audyt źródeł (miękkie 404, wyciszenie szumu)
- `src/middleware.ts` -- auth + strona błędu konfiguracji
- `src/agents/router.ts` + `src/agents/registry.ts` -- 8 agentów AI
- `supabase/migrations/20260705_chat_rate_limits.sql` -- migracja do wykonania
- `src/data/blog-posts.ts` -- 4 wpisy blog

## Backlog (dawny, wciąż otwarty)
1. Firecrawl -- scraping/monitoring URL świadczeń
2. OpenRouter vision -- obrazki w chacie
3. Audyt promptów agentów (production-grade)
4. Rozszerzenie bazy świadczeń + lepsze dopasowanie do profilu rodziny
