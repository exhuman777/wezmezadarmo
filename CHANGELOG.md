# Changelog

## 2026-05-25

### Multi-agent system -- 8 wyspecjalizowanych agentów z auto-routingiem

Przebudowa AI chatu z 6 trybów (mode-based) na 8 agentów z automatycznym routingiem po keywordach i selektywnymi prefetcherami. Architektura: każdy agent = folder z `.md` plikami (persona, wiedza, keywords, prefetch, źródła).

**8 agentów:**
- `konsjerz` -- fallback, zna wszystkich 7 agentów, kieruje do specjalistów
- `swiadczenia` -- 118 świadczeń, matching, kwoty, warunki kwalifikacji
- `wnioski` -- 8 formularzy ZUS krok po kroku, PDF, procedury
- `nfz-zdrowie` -- kolejki, lekarze, refundacja leków, jakość powietrza (NFZ + GIOŚ prefetch)
- `finanse-jdg` -- kursy walut, biała lista VAT, CEIDG, KSeF, podatki, ulgi ZUS (NBP + whitelist + CEIDG prefetch)
- `dotacje` -- PUP, PFRON, PARP, NCBiR, BGK, KFS, granty, 57 programów B2B
- `prawo-terminy` -- ELI/Sejm, zmiany w przepisach, kalendarz terminów (ELI prefetch)
- `rolnik` -- KRUS, ARiMR, dopłaty, pogoda, dane gminy (IMGW + BDL GUS prefetch)

**Architektura plików:**
```
src/agents/
  _base/identity.md, formatting.md, live-sources.md
  {agentId}/agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  router.ts           -- routeToAgent(message, profileType): AgentId
  registry.ts         -- czyta .md, buildAgentSystemPrompt()
  types.ts            -- AgentId union type, AgentConfig, PrefetchSource
```

**Kluczowe zmiany:**
- `router.ts`: keyword matching z wagami (długie słowa = 2 pkt, krótkie = 1 pkt), fallback JDG -> finanse-jdg
- `registry.ts`: przebudowany -- czyta .md przez fs, caching, nie importuje .ts
- `chat/route.ts`: auto-routing gdy `mode=auto`, selektywny prefetch (tylko API potrzebne dla danego agenta), nagłówek `X-Agent-Id` w odpowiedzi
- UI: 8 agentów w sidebarze, chip "Odpowiada: X" nad wiadomością AI, tryb auto-routing jako domyślny

**Usunięte pliki:**
- `src/agents/knowledge/ogolny.ts`, `swiadczenie.ts`, `wniosek.ts`, `nabor.ts`, `faktura.ts`, `termin.ts`
- `src/agents/base-prompt.ts`

### +35 programów B2B -- baza 57 dofinansowań dla firm

Rozszerzenie `src/data/programs-b2b.ts` z 23 do 57 programów (cross-checked vs gov.pl/parp/bgk/nfosigw, lastVerified 2026-05-25):
- KPO/FENG/FEnIKS (12): kredyty BGK cyfryzacja+ekologia, Ścieżka SMART B+R+wdrożenie, STEP Cleantech/Biotech, FERS Akademia HR
- NCBR/BGK/ARP/PSI (13): AGROSTRATEG, Kredyt Technologiczny, Gwarancja Biznesmax Plus, Polityka Nowej Szansy, PSI
- Regionalne (10 nowych województw): dolnośląskie, wielkopolskie, warmia-mazury, lubelskie, kujawsko-pomorskie, zachodniopomorskie, opolskie, podkarpackie, lubuskie, świętokrzyskie

Cross-reference: dotacje agent (`src/agents/dotacje/knowledge.md`) zna te programy przez blok "DOPASOWANE PROGRAMY B2B" w kontekście runtime.

### /statystyki -- dashboard GUS/SDG (skeleton)

Nowa strona publiczna `/statystyki`:
- LIVE: 4 wskaźniki SDG z publicznego API (sdg.gov.pl) bez rejestracji
- Featured: Cena 1m2 powierzchni użytkowej 1999-2026 (z public GUS PDF)
- Komponent `LineChart` SVG (responsive, dostępne tooltips)
- Status integracji 8 API państwowych (live/pending/planowane)
- `docs/API_REQUEST_TEMPLATES/gus-bdl-regon.md`: szablony wniosków o klucz do GUS BDL, REGON, TERYT, STRATEG, NFZ rozszerzony

### Klikalne linki w chacie + lepsza obsługa NFZ

- Nowy komponent `src/components/MessageContent.tsx`: parsuje `/nfz`, `/swiadczenia`, `/dotacje`, `/centrum-obywatela` itp. + `https://` na klikalne linki
- NFZ chat: gdy user pyta o "lekarza" bez specjalizacji, nie zwraca losowych podmiotów (aptek, pielęgniarek) -- prosi o specjalizację + link `/nfz`

### Audyt URL 25.05 -- 7 fixów (3 false positives + 4 prawdziwe 404)

- `lib/benefits-audit.ts`: zmiana USER_AGENT na Chrome 120 (Mac) -- BGK/czystepowietrze.gov.pl blokowały custom UA "wezmezadarmo-audit"
- URL fixes w `src/engine/benefits/`:
  - `praca.ts`: bon szkoleniowy + przygotowanie zawodowe dorosłych -> gov.pl/web/rodzina/*
  - `krus.ts`: zasiłek opiekuńczy KRUS -> gov.pl/web/krus/zasilek-opiekunczy
  - `ekologia.ts`: Stop Smog -> gov.pl/web/klimat/stop-smog + zrodloNazwa: NFOSiGW -> Ministerstwo Klimatu
- Admin UI (`app/admin/benefits-audit/page.tsx`): HTTP column "-" gdy status=0, czytelniejszy label błędów

---

## 2026-05-23

### Panel świadczenia -- master-detail + embedded AI
- 3-kolumnowy layout: lista kategorii | szczegoly | Asystent AI
- Lewy panel: świadczenia pogrupowane wg kategorii, kropki pewne (zielona) / możliwe (bursztynowa)
- Środek: tytuł + kwota w gradiencie, opis, termin realizacji, CTA "Pełny przewodnik" (shimmer) + "Zapytaj AI", "CO POTRZEBUJESZ" + "KROK PO KROKU" w kartach, dopasowane kryteria jako tagi, sekcja "na co uważać", źródło + data weryfikacji
- Prawy panel: stały chat AI z kontekstem wybranego świadczenia, podpowiedzi quick-hints, streaming
- Mobile fallback: zakładki lista <-> szczegóły

### Publiczne /swiadczenia -- przeprojektowane karty szczegółów
- Wymagania jako tagi pigułki zamiast tekstu
- "CO POTRZEBUJESZ" + "KROK PO KROKU" w 2-kolumnowych kartach z numerowanymi wskaźnikami
- Buttony "Pełny przewodnik" (shimmer) + "Zapytaj AI"
- Termin realizacji z ikoną zegarka
- Sekcja "odwołanie" jeśli dostępna
- `opis` jako blockquote z zieloną listwą

### Chat AI -- smart scroll
- Container scroll zamiast scrollIntoView (nie przewija całej strony)
- Auto-scroll respektuje manualne przewinięcie użytkownika w górę
- Force-scroll przy wysłaniu wiadomości

### Panel layout -- ukryty footer
- `document.body.style.overflow = hidden` przy mount, cleanup przy unmount
- Stopka niewidoczna w panelu (nie psuje viewportu)

## 2026-05-22

### Profil agenta -- step-by-step wizard
- 10 pytań w stylu onboarding kalkulatora (płeć, wiek, stan cywilny, dzieci, zatrudnienie, dochód, województwo, mieszkanie, niepełnosprawność, status dodatkowy)
- Pasek postępu, navigacja krok po kroku
- Auto-uruchomienie wizardu jeśli profil pusty
- Widok podsumowania z opcją edycji

### Onboarding pustego profilu
- Banner na `/panel` wykrywa pusty profil (`wiek`, `zatrudnienie`, `nip` puste)
- CTA "Uzupełnij profil →" prowadzi do wizarda
- Auto-create defaultowego profilu w GET `/api/agent/profile` (kod `PGRST116`)

### Panel routing -- koniec 404
- `/panel/*` strony jako explicit imports z `/agent/panel/*`
- `/panel/chat` opakowany w `AgentModeProvider`
- `/panel/dotacje` redirect do `/dotacje/panel`
- `/panel/wnioski` redirect do `/wnioski`

### SiteNav -- stan auth
- `createBrowserClient` + `onAuthStateChange` listener
- Zalogowany: button "Panel" → `/panel`
- Niezalogowany: "Zaloguj" + "Sprawdź za darmo"
- ThemeToggle przeniesiony z `/swiadczenia` do nav

### RSS architecture -- GitHub Actions + Supabase cache
- Cron 0 6,14 * * * (8:00 i 16:00 CEST) fetchuje zablokowane źródła
- Skrypt `scripts/fetch-rss-cache.mjs`: NBP, Sejm, UOKiK, Fundusze EU, e-Zdrowie, ARiMR
- HTML scrapers z bot-check detection (Incapsula/Imperva)
- Upsert do tabeli `rss_cache` w Supabase, czyszczenie >30 dni
- Live fetch: ZUS, GUS (poprawione URL na endpointy Liferay/XML)
- Cloudflare Worker `cf-worker/` jako proxy dla real-time fetchowania

### Stopka -- LinkedIn + formularz kontaktowy
- Usunięty osobisty email
- Dodany link LinkedIn
- Nowy komponent `FooterContactForm` postujący do `/api/contact`

### Visual improvements -- 3 strony
- `/dla-firm`: macOS terminal window, shimmer buttons, 3D tilt cards
- `/swiadczenia`: hover lift, gradient borders, shimmer category pills, kategorie z dotem-glowem
- `/agent` (Asystent AI): shimmer buttons, 3D tilt cards, glow eyebrows, kompaktowy layout

### `/aktualnosci` -- redesign
- Spójny styl ze `/swiadczenia`: hover lift, gradient top border
- Filter pills jako category-pills, status dot z glow
- Round arrow buttons, source badges jako pillsy
- API merguje live (ZUS, GUS) + Supabase cache (zablokowane źródła)

### Drobne fixy
- ANONIMOWO badge usunięty z hero
- Hero gradient zmiękczony (height 120 → 64)
- Duplikaty logo usunięte ze `/swiadczenia` i `/wnioski`
- `/o-projekcie` rebuild -- design spójny z landingiem

## Wcześniej

Patrz `git log` -- historia przed CHANGELOG.md.
