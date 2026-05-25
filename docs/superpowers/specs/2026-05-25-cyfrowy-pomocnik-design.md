# Cyfrowy Pomocnik — Design Spec

**Data:** 2026-05-25  
**Status:** Zatwierdzony przez ExHuman  
**Cel:** MVP do demonstracji inwestorskiej + fundraising w Polsce

---

## 1. Produkt

**Cyfrowy Pomocnik** to proaktywny asystent AI dla polskich firm i JDG. Działa 24/7, codziennie rano generuje brief z konkretnymi akcjami do zatwierdzenia jednym kliknięciem. Nie dashboardy jako cel sam w sobie — centrum akcji.

Tagline roboczy: "Twój Cyfrowy Pracownik. Działa kiedy Ty śpisz."

---

## 2. Architektura

### Deployment
- **Oddzielny projekt Next.js** (nowe repo: `cyfrowy-pomocnik`)
- Deployment: Vercel, docelowa domena `cyfrowypomocnik.pl`
- MVP subdomena: `cyfrowypomocnik.wezmezadarmo.com`
- **Ten sam Supabase** co wezmezadarmo (shared auth, nowe tabele `cp_*`)
- Zero referencji do wezmezadarmo w UI/brandingu

### Tech stack
- Next.js (App Router, wersja jak w wezmezadarmo)
- Supabase (auth + DB)
- Anthropic SDK (claude-sonnet-4-6, streaming)
- Firecrawl (scraping newsów branżowych w cron job)
- Vercel Cron (dzienny brief)
- Resend (email digest)

---

## 3. Model danych (Supabase, tabele `cp_*`)

```sql
cp_companies          -- profil firmy użytkownika
  user_id, name, nip, branża, opis, pain_points, created_at

cp_conversations      -- sesje czatu
  id, user_id, agent_id, title, created_at

cp_messages           -- wiadomości w czacie
  id, conversation_id, role, content, created_at

cp_news_items         -- artykuły ze scrapingu Firecrawl
  id, user_id, source, title, url, summary, relevance_tags, scraped_at

cp_daily_briefs       -- wygenerowane dzienne briefy
  id, user_id, generated_at, summary_text

cp_action_items       -- akcje do zatwierdzenia z briefu
  id, brief_id, user_id, type, title, description, status (pending/approved/dismissed), created_at

cp_reminders          -- terminy ustawiane przez AI lub użytkownika
  id, user_id, title, due_date, type (zus/umowa/oc/post/custom), status, created_at
```

---

## 4. Agenci AI (7)

| ID | Nazwa | Specjalizacja |
|----|-------|---------------|
| AG-00 | Asystent ogólny | Routing, pytania ad-hoc, poranny brief |
| AG-01 | Faktury | Przeterminowane płatności, szkice maili do klientów |
| AG-02 | Marketing | Kalendarz social media, propozycje postów, AI SEO (ChatGPT/Perplexity visibility) |
| AG-03 | Terminarz | Umowy, OC, ZUS, urzędowe deadliny |
| AG-04 | Dotacje | Nabory PARP/BGK/regionalne, dopasowanie do profilu firmy |
| AG-05 | Świadczenia | Ulgi i świadczenia dla JDG, pracowników |
| AG-06 | Prawo | Zmiany w przepisach, interpretacje podatkowe |

Każdy agent: plik `agent.md` (persona), `knowledge.md` (wiedza domenowa), `keywords.json` (routing), `prefetch.json` (API live).

Agenty AG-04, AG-05, AG-06: skopiowane pliki `agent.md` / `knowledge.md` / `keywords.json` z wezmezadarmo, przepisane pod kontekst firmowy (nie obywatelski). Ta sama struktura katalogów `src/agents/[id]/`. Ten sam `registry.ts` i `router.ts` pattern.

---

## 5. Kluczowe features MVP

### 5a. Dzienny brief (CORE)
- Vercel Cron: codziennie o 07:00
- Dla każdego aktywnego użytkownika:
  1. Pobiera `cp_news_items` z ostatnich 24h (Firecrawl)
  2. Sprawdza `cp_reminders` z najbliższymi terminami
  3. Sprawdza `cp_action_items` z poprzedniego dnia (niezatwierdzone)
  4. Claude generuje brief + listę `cp_action_items` (priorytetyzowanych)
  5. Opcjonalnie: email digest (Resend)

### 5b. Firecrawl scraping (cron co 6h)
- Na podstawie `cp_companies.branża` + `cp_companies.opis`
- Źródła: GUS API, PARP, Sejm.gov.pl, NBP, ZUS, + branżowe (keyword-based)
- Zapis do `cp_news_items` z tagami relevancji

### 5c. Chat z agentami (streaming)
- Endpoint: `POST /api/cp/chat` (streaming, SSE)
- Auto-routing po keywordach (jak w wezmezadarmo `router.ts`)
- Nagłówek `X-Agent-Id` w odpowiedzi
- Kontekst: profil firmy + ostatnie brief + reminder history
- Rate limit: bez limitu dla zalogowanych (tokenizacja później)

### 5d. Akcje jednym kliknięciem
- Karty w kolumnie "Akcje do zatwierdzenia"
- `PATCH /api/cp/actions/[id]` — status: approved/dismissed
- Po approved: AI wykonuje akcję (np. generuje gotowy mail, tworzy reminder)

---

## 6. Routing (Next.js App Router)

```
/                         -- landing (bez ref do wezmezadarmo)
/logowanie                -- login (shared Supabase auth)
/rejestracja              -- rejestracja + onboarding firmy
/panel                    -- główny dashboard (3 kolumny + chat)
/panel/chat               -- pełnoekranowy czat (mobile-friendly)
/panel/profil-firmy       -- edycja profilu firmy
/panel/aktualnosci        -- pełny feed newsów
/panel/kalendarz          -- pełny widok kalendarza AI
/panel/historia           -- historia czatów
/api/cp/chat              -- streaming chat API
/api/cp/actions/[id]      -- akcje (approve/dismiss)
/api/cp/brief             -- ręczne wygenerowanie briefu
/api/cp/cron/brief        -- Vercel Cron endpoint (dzienny brief)
/api/cp/cron/news         -- Vercel Cron endpoint (scraping Firecrawl)
```

---

## 7. UI

### Branding
- Nazwa: **Cyfrowy Pomocnik** (domena docelowa: cyfrowypomocnik.pl)
- Kolor bazowy: zielony `#16a34a` / `#15803d`
- Tło: białe/off-white `#f8fffe`
- Bordery strukturalne: czarne `2px solid #111`
- Bordery kart: szary `1.5px solid #9ca3af`
- Gradienty: subtelne na nawigacji, kartach, przyciskach
- Font: Inter / system-ui

### Główny panel (layout)
- **Lewy sidebar (224px):** lista agentów z kolorowymi kropkami statusu + historia czatów
- **Brief bar:** poziomy pasek z dzienny akcjami (czerwona/żółta/zielona kropka + label)
- **3 kolumny centralne:**
  - Kolumna 1: Akcje do zatwierdzenia
  - Kolumna 2: Aktualności branżowe
  - Kolumna 3: Kalendarz AI
- **Prawy panel czatu (340px):** welcome card + quick actions + input z attachmentami
- **Separatory:** 2px solid #111 między wszystkimi sekcjami

Mockup HTML: `.superpowers/brainstorm/37274-1779734247/content/combined-v3.html`

---

## 8. Onboarding

Po rejestracji: wizard 3-krokowy
1. Dane firmy (nazwa, NIP, branża — autocomplete z CEIDG API)
2. Opis działalności + główne pain points (textarea, AI może sugerować)
3. Jakich agentów chcesz aktywować? (checkboxy, domyślnie wszystkie)

Po onboardingu: pierwsze uruchomienie briefu (ręczne, nie czekamy na cron).

---

## 9. Poza scope MVP

- Gmail/Google Calendar OAuth (integracje emaila)
- RFQ auto-response (wymaga Gmail)
- Google Maps monitoring
- Stripe / billing (MVP: free beta)
- Multi-user organizations (solo-user model w MVP)
- Mobile app

---

## 10. Metryki sukcesu MVP

- Użytkownik widzi dzienny brief z akcjami po zalogowaniu
- Co najmniej jedna akcja do zatwierdzenia generowana dziennie
- Aktualności branżowe aktualizowane co 6h via Firecrawl
- Chat odpowiada w < 3s (streaming)
- Onboarding < 5 minut
