# Changelog

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
