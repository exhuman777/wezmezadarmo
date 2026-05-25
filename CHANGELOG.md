# Changelog

## 2026-05-25 (część 2 -- popołudniowa)

### Dashboard `/statystyki` + 35 nowych programów B2B + chat UX

**Nowa strona `/statystyki` -- Polska w liczbach**
- LIVE: 4 wskaźniki SDG ONZ z publicznego API GUS (sdg.gov.pl, bez rejestracji)
- Featured: Cena 1m² powierzchni użytkowej 1999-2026, źródło GUS BDL public PDF
- LineChart SVG (responsywny, tooltips, accessible)
- Status integracji 8 API państwowych: GUS SDG/NBP/NFZ/CEIDG (LIVE), BDL/REGON/TERYT/STRATEG (pending)
- `docs/API_REQUEST_TEMPLATES/gus-bdl-regon.md`: 6 gotowych szablonów wnioskowania o klucz API

**programs-b2b.ts: 23 → 57 programów** (3 parallel research agents, cross-checked z gov.pl/parp/bgk/nfosigw)
- KPO/FENG/FEnIKS/FERS (12): Sciezka SMART B+R+wdrozenie, STEP Cleantech/Biotech, kredyty BGK cyfryzacja+ekologia, Akademia HR/Menadzera, NaszEauto N2/N3
- NCBR/BGK/ARP/PSI/PARP (13): Sciezka SMART duze/konsorcja, AGROSTRATEG, Kredyt Technologiczny, Gwarancja Biznesmax Plus, Polityka Nowej Szansy, Polska Strefa Inwestycji, STEP, Wzornictwo i Automatyzacja Polska Wschodnia
- Regionalne (10): dolnoslaskie, wielkopolskie, warminsko-mazurskie, lubelskie, kujawsko-pomorskie, zachodniopomorskie, opolskie, podkarpackie, lubuskie, swietokrzyskie

**Cross-reference (multi-agent system zna nowe dane):**
- `src/agents/dotacje/knowledge.md` -- explicit pointer do `src/data/programs-b2b.ts: 57 programów`
- `src/app/api/agent/chat/route.ts` -- matching engine używa PROGRAMS dla profili JDG/firmy, blok "DOPASOWANE PROGRAMY B2B" w kontekście rozmowy

**Chat UX (przed multi-agent refactor, zachowane):**
- `src/components/MessageContent.tsx` -- markdown parser dla wewnętrznych ścieżek (`/nfz`, `/swiadczenia`, `/dotacje`, `/centrum-obywatela`, etc.) + `https://` na klikalne linki (dotted underline, color inherit). Używane w `/agent/panel/chat/page.tsx`
- NFZ smart prefetch: bez specjalizacji nie zwraca losowych podmiotów (apteki/pielęgniarki). Helpful prompt: "Podaj specjalizację (np. kardiolog, ortopeda)" + link do `/nfz`

**Audyt URL + treści (commit `a3d73b5`, `15dc702`):**
- 16 broken zrodloUrl naprawione (podatki.gov.pl /ulgi-i-odliczenia/-pit, gov.pl/web/finanse, gov.pl/web/rodzina)
- 7 alertów z post-audit: 3x false positive (browser UA), 4x dodatkowe 404 naprawione
- Audyt zawartości 104/118 świadczeń: 15 błędów merytorycznych poprawionych (samotny rodzic 56→112k, dodatek pielęgnacyjny 348,22→366,68 po waloryzacji marzec 2026, mieszkanie-na-start ZANIECHANY, dodatek energetyczny ZAWIESZONY do 2027, fundusz kompensacyjny 100k→230821, turnusy rehab. 1449→2207, szczepienia HPV 9-14 lat dziewczęta+chłopcy, prostata PSA w Moje Zdrowie, 800-plus usunięty SUSPECT fragment o eZUS+Straż Graniczna)

**Nawigacja:**
- `SiteNav` (top): dodano "Statystyki"
- `SiteFooter`: dodano "Polska w liczbach", "Blog", "Press kit"
- `sitemap.ts`: dodano `/statystyki` (priority 0.8, weekly)
- `AGENTS.md`: zaktualizowana mapa projektu o nowe strony

---

## 2026-05-25 (część 1 -- przedpołudniowa)

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
