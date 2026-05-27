# Plan testów MVP -- wezmezadarmo.com

**Cel:** Zweryfikować że każdy krytyczny flow działa end-to-end przed launchem.
**Środowisko:** https://www.wezmezadarmo.com (produkcja)
**Wymagania:** konto Gmail do testów, karta testowa Stripe

---

## BLOK 1 -- Rejestracja i email (Resend)

### Test 1.1 -- Newsletter signup (strona główna)
1. Wejdź na `wezmezadarmo.com`
2. Znajdź formularz zapisu do newslettera
3. Wpisz adres email testowy
4. Kliknij "Zapisz się"
**Oczekiwane:** email potwierdzający z Resend w ciągu 30s
**Sprawdź:** nadawca, temat, link do wypisania działa

### Test 1.2 -- Rejestracja konta agenta (moduł /agent)
1. Wejdź na `wezmezadarmo.com/agent`
2. Kliknij "Załóż konto" / "Zarejestruj się"
3. Wypełnij formularz (email + hasło)
4. Potwierdź rejestrację
**Oczekiwane:** email powitalny z Resend, przekierowanie do `/agent/panel/`
**Sprawdź:** czy email zawiera link weryfikacyjny lub powitanie

### Test 1.3 -- Rejestracja konta B2B (moduł /dotacje)
1. Wejdź na `wezmezadarmo.com/dla-firm`
2. Kliknij CTA rejestracji
3. Zarejestruj firmę (email + hasło + NIP opcjonalnie)
**Oczekiwane:** email powitalny, przekierowanie do `/dotacje/panel/`

### Test 1.4 -- Reset hasła
1. Na stronie logowania kliknij "Zapomniałem hasła"
2. Wpisz email z Testu 1.2
**Oczekiwane:** email z linkiem do resetu hasła w ciągu 30s

---

## BLOK 2 -- Kalkulator świadczeń (strona główna)

### Test 2.1 -- Podstawowy kalkulator
1. Wejdź na `wezmezadarmo.com`
2. Wypełnij formularz: wiek 35, rodzina z dzieckiem z niepełnosprawnością
3. Kliknij "Oblicz"
**Oczekiwane:** lista świadczeń zawiera "Świadczenie pielęgnacyjne 3386 PLN"
**Sprawdź:** kwota 3386 PLN, link "Pełny przewodnik" prowadzi do działającej strony

### Test 2.2 -- Kalkulator senior
1. Wiek 70+, emeryt
**Oczekiwane:** "Dodatek pielęgnacyjny 366,68 PLN", "Zasiłek pielęgnacyjny 215,84 PLN"

### Test 2.3 -- Kalkulator rodzina z niemowlęciem
1. Wiek 28, nowo narodzone dziecko, brak umowy o pracę
**Oczekiwane:** "Kosiniakowe 1000 PLN", "Becikowe 1000 PLN", "800+ 800 PLN"

### Test 2.4 -- Sprawdzenie URL-i źródłowych
Po znalezieniu świadczenia kliknij "Pełny przewodnik" dla:
- Świadczenie pielęgnacyjne -> ma otworzyć stronę MRPiPS
- 800+ -> ma otworzyć `gov.pl/web/rodzina/` (nie 404)
- Becikowe -> ma otworzyć `gov.pl/web/rodzina/` (nie 404)

---

## BLOK 3 -- Chat AI dla obywateli (`/api/chat`)

### Test 3.1 -- Podstawowy chat (rate limit: 3/dzień)
1. Wejdź na `wezmezadarmo.com` (bez logowania)
2. Kliknij "Zapytaj AI"
3. Napisz: "Mam 70 lat i dostaję emeryturę. Jakie mam świadczenia?"
**Oczekiwane:** odpowiedź w ciągu 5s, wymienia dodatek pielęgnacyjny, zasiłek pielęgnacyjny
**Sprawdź:** streaming działa (tekst pojawia się stopniowo)

### Test 3.2 -- Rate limit
Po 3 wiadomościach:
**Oczekiwane:** komunikat "Dzienny limit wyczerpany" lub HTTP 429

### Test 3.3 -- Jakość odpowiedzi
Pytania testowe:
- "Ile wynosi becikowe w 2026?" -> oczekiwane: "1000 PLN"
- "Czy mogę pracować pobierając świadczenie pielęgnacyjne?" -> odpowiedź merytoryczna
- "Co to jest kosiniakowe?" -> wyjaśnienie świadczenia rodzicielskiego 1000 PLN

---

## BLOK 4 -- Agent AI (konto osobiste `/agent`)

### Test 4.1 -- Chat agenta po zalogowaniu
1. Zaloguj się na konto z Testu 1.2
2. Wejdź do `/agent/panel/`
3. Uruchom chat
4. Napisz: "Prowadzę JDG, mam dziecko, zarabiam 8000 PLN. Co mi przysługuje?"
**Oczekiwane:** odpowiedź uwzględnia profil, routing do agenta `finanse-jdg` lub `swiadczenia`
**Sprawdź:** nagłówek X-Agent-Id w odpowiedzi (DevTools -> Network)

### Test 4.2 -- Routing agentów
Napisz wiadomości i sprawdź który agent odpowiada (header X-Agent-Id):
- "Mam zaległości w ZUS" -> oczekiwany agent: `finanse-jdg`
- "Boli mnie kręgosłup, co refunduje NFZ?" -> oczekiwany agent: `nfz-zdrowie`
- "Kiedy mija termin PIT?" -> oczekiwany agent: `prawo-terminy`
- "Mam pole pszenicy, jakie dopłaty?" -> oczekiwany agent: `rolnik`

### Test 4.3 -- Kontekst agenta
Po pytaniu o NFZ:
- "A ile wynosi składka zdrowotna dla JDG?"
**Oczekiwane:** agent pamięta kontekst rozmowy (nie pyta ponownie o profil)

---

## BLOK 5 -- Wnioski ZUS (`/wnioski`)

### Test 5.1 -- Wypełnianie formularza AI
1. Wejdź na `wezmezadarmo.com/wnioski`
2. Wybierz wniosek (np. SR-5Z -- świadczenie pielęgnacyjne)
3. Kliknij "Wypełnij z AI"
4. Opisz sytuację: "Mam syna z orzeczeniem o niepełnosprawności, 15 lat"
**Oczekiwane:** AI wypełnia pola formularza

### Test 5.2 -- Eksport PDF
Po wypełnieniu kliknij "Pobierz PDF"
**Oczekiwane:** plik PDF się pobiera i zawiera wypełnione dane

---

## BLOK 6 -- B2B Panel dofinansowań (`/dotacje`)

### Test 6.1 -- Chat B2B
1. Zaloguj się na konto B2B z Testu 1.3
2. Wejdź do `/dotacje/panel/`
3. Napisz: "Jesteśmy firmą IT, 15 pracowników, szukamy dofinansowania na R&D"
**Oczekiwane:** lista programów z PARP/NCBR, kwoty, terminy

### Test 6.2 -- Monitoring dofinansowań
1. Wejdź do `/dotacje/panel/monitoring/`
**Oczekiwane:** lista aktywnych programów (minimum 1 program)

---

## BLOK 7 -- Stripe (płatności)

### Test 7.1 -- Checkout
1. W panelu kliknij "Kup tokeny" lub "Upgrade"
2. Wybierz pakiet Personal (100 tokenów, 25 PLN)
3. W Stripe Checkout wpisz kartę testową: `4242 4242 4242 4242`, data przyszła, CVC 123
**Oczekiwane:** przekierowanie z powrotem, tokeny dodane do konta

### Test 7.2 -- Portal klienta
1. Kliknij "Zarządzaj subskrypcją"
**Oczekiwane:** otwiera się Stripe Customer Portal

---

## BLOK 8 -- Aktualności RSS (`/aktualnosci`)

### Test 8.1 -- Publiczny podgląd
1. Wejdź na `wezmezadarmo.com/aktualnosci`
**Oczekiwane:** lista artykułów z co najmniej 3 źródeł, daty nie starsze niż 7 dni

### Test 8.2 -- Odświeżanie
**Oczekiwane:** "Ostatnia aktualizacja: X minut temu"

---

## BLOK 9 -- Admin (`/admin`)

### Test 9.1 -- Basic Auth gate
1. Otwórz `wezmezadarmo.com/admin`
**Oczekiwane:** popup Basic Auth (login/hasło)

### Test 9.2 -- API admin za auth
1. `curl https://wezmezadarmo.com/api/admin/rss-status`
**Oczekiwane:** HTTP 401 (nie 200 jak było przed naprawą)

---

## BLOK 10 -- Statystyki GUS (`/statystyki`)

### Test 10.1 -- Dashboard
1. Wejdź na `wezmezadarmo.com/statystyki`
**Oczekiwane:** wykresy z danymi, wskaźniki ekonomiczne, status API (zielone/żółte/czerwone)

---

## Wyniki testów -- tabela

| Test | Status | Data | Uwagi |
|---|---|---|---|
| 1.1 Newsletter email | | | |
| 1.2 Rejestracja agent | | | |
| 1.3 Rejestracja B2B | | | |
| 1.4 Reset hasła | | | |
| 2.1 Kalkulator podstawowy | | | |
| 2.2 Kalkulator senior | | | |
| 2.3 Kalkulator rodzina | | | |
| 2.4 URL-e źródłowe | | | |
| 3.1 Chat AI streaming | | | |
| 3.2 Rate limit | | | |
| 3.3 Jakość odpowiedzi | | | |
| 4.1 Agent chat zalogowany | | | |
| 4.2 Routing agentów | | | |
| 4.3 Kontekst agenta | | | |
| 5.1 Wnioski ZUS AI | | | |
| 5.2 Eksport PDF | | | |
| 6.1 Chat B2B | | | |
| 6.2 Monitoring | | | |
| 7.1 Stripe checkout | | | |
| 7.2 Stripe portal | | | |
| 8.1 RSS aktualności | | | |
| 9.1 Admin Basic Auth | | | |
| 9.2 API admin 401 | | | |
| 10.1 Statystyki GUS | | | |

---

## Co NIE jest jeszcze wdrożone (backlog MVP)

| Funkcja | Status | Priorytet |
|---|---|---|
| Firecrawl scraping | NIE WDROŻONE | WYSOKI -- monitoring URL-i świadczeń |
| OpenRouter vision (obrazki w chacie) | NIE WDROŻONE | ŚREDNI |
| Digest email test end-to-end | DO WERYFIKACJI | WYSOKI |
| Agent prompt audit (production-grade) | DO ZROBIENIA | WYSOKI |
