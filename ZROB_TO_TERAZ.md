# ZRÓB TO TERAZ - produkcja state-of-the-art, krok po kroku

> **Stan: 6 lipca 2026.** Cały kod jest już na produkcji (main + Vercel auto-deploy).
> Poniżej wszystko, co musisz zrobić RĘCZNIE, żeby serwis działał w pełni
> produkcyjnie. Kolejność = priorytet. Całość ~25 minut.

---

## KROK 1 - Dwie migracje bazy (Supabase) [WYMAGANE, 6 min]

**Po co:** kod na produkcji już używa tabeli/kolumny, których jeszcze nie ma w bazie.
Bez tego: limit czatu działa na słabszym fallbacku, a panel audytu nie pokaże diagnozy.

**Gdzie:** https://supabase.com/dashboard -> projekt wezmezadarmo -> SQL Editor -> New query.

1. Otwórz plik `supabase/migrations/20260705_chat_rate_limits.sql`, wklej całość, **Run**.
   - Sprawdź: `select * from chat_rate_limits;` -> pusta tabela, bez błędu = OK.
2. Otwórz plik `supabase/migrations/20260706_audit_note_column.sql`, wklej całość, **Run**.
   - Sprawdź: `select last_note from benefits_url_audit limit 1;` -> działa (może być null) = OK.

> Szybciej: w Claude wpisz `/mcp` -> zaloguj "claude.ai Supabase" -> napisz "zrób obie migracje",
> wtedy zrobię je i zweryfikuję sam.

---

## KROK 2 - Zmienne środowiskowe w Vercel [WYMAGANE, 8 min]

**Gdzie:** Vercel -> projekt wezmezadarmo -> Settings -> Environment Variables -> Production.
**Po co:** brak którejś = konkretna funkcja pada (opisane niżej). Sprawdź, że każda istnieje.

KRYTYCZNE (bez nich serwis nie działa):
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` - logowanie, panel, czat.
  Brak = /panel pokazuje stronę /blad-konfiguracji.
- `SUPABASE_SERVICE_ROLE_KEY` - audyt, trwały rate limit, digest, panel admin.
- `OPENROUTER_API_KEY` - czat AI. Brak = czat zwraca 503.

CRON I ADMIN:
- `CRON_SECRET` - autoryzacja crona audytu (Vercel wysyła go automatycznie) + przycisk
  "Uruchom audyt teraz" w panelu admina.
- `ADMIN_PASSWORD` - login do /admin/benefits-audit (Basic Auth).

E-MAIL (audyt, digest, newsletter, kontakt):
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (np. `WezmeZaDarmo <hello@wezmezadarmo.com>`),
  `NEWSLETTER_SECRET`.

ADRES SERWISU (poprawne linki w mailach/OG):
- `NEXT_PUBLIC_SITE_URL` i/lub `NEXT_PUBLIC_URL` = `https://www.wezmezadarmo.com`.

OPCJONALNE (feature-flagi - tylko jeśli używasz):
- `B2B_API_KEYS` - klucze klientów B2B (czat bez limitu).
- `CEIDG_API_TOKEN` - podgląd firm z CEIDG.
- `RSS_PROXY_URL` + `RSS_PROXY_SECRET` - proxy do pobierania RSS.
- `NEXT_PUBLIC_GA_ID` - Google Analytics.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PERSONAL`,
  `STRIPE_PRICE_ID_BUSINESS` - płatności B2B w /dotacje (jeśli sprzedajesz subskrypcje).

Po dodaniu brakujących -> **Redeploy** (Deployments -> ostatni -> Redeploy).

---

## KROK 3 - Weryfikacja deployu [3 min]

- Vercel -> Deployments: ostatni commit `f98d1f6` (lub nowszy) ma status **Ready** (zielony).
  Jeśli **Error** -> otwórz, skopiuj log builda, wklej mi.

---

## KROK 4 - Smoke-testy na żywo [5 min]

Nowa zakładka biznesowa:
- https://www.wezmezadarmo.com/za-darmo-dla-biznesu -> widać DogInvoice i DogAnswer
  z logotypami i podglądami, działa przycisk "Napisz: admin@dogtronic.io".

Wyszukiwarka świadczeń:
- /swiadczenia -> wpisz `kuroniowka`, `trzynastka`, `leki seniorzy` -> trafia.

Naprawione źródła (audyt 20 linków):
- /swiadczenia -> rozwiń np. "Dodatek mieszkaniowy", "Kosiniakowe", "Opieka wytchnieniowa"
  -> kliknij link źródła -> otwiera właściwą stronę (nie stronę główną gov.pl).

Logowanie i konto z Asystenta AI:
- /agent -> "Mam już konto" (albo "Zaloguj się i zapytaj AI") -> ląduje na /logowanie
  (bez podwójnego przekierowania).
- Zaloguj się -> /panel -> lewy sidebar: **Profil** (edycja danych) i **Wyloguj**
  (ma faktycznie wylogować i wrócić do /logowanie). Zadaj 4 pytania w czacie ->
  4. pokazuje limit (po KROKU 1 działa też w incognito).

Panel audytu (po zalogowaniu Basic Auth):
- https://www.wezmezadarmo.com/admin/benefits-audit -> sekcja "Wymaga uwagi" z linkami
  "Znajdź aktualne źródło". Kliknij "Uruchom audyt teraz" -> po chwili lista OK, bez
  20 błędów (te już naprawione).

---

## KROK 5 - Higiena produkcyjna [gdy będzie czas]

- **Custom SMTP w Supabase Auth**: domyślny mailer Supabase ma limit ~3-4 maile/h i
  słabą dostarczalność. Do produkcji podłącz Resend jako SMTP w Supabase ->
  Authentication -> SMTP Settings. Inaczej maile potwierdzające rejestrację mogą nie
  dochodzić przy większym ruchu.
- **Supabase Auth URLs**: Authentication -> URL Configuration -> Site URL =
  `https://www.wezmezadarmo.com`, Redirect URLs zawierają
  `https://www.wezmezadarmo.com/**` (żeby linki z maili nie wygasały/nie 404-owały).
- **Node 20.19+** na maszynie deweloperskiej -> można wrócić do vitest 4 (teraz przypięty
  do v3, bo rolldown wymaga 20.19). Nie blokuje produkcji.
- **Monitoring**: włącz Vercel Analytics + Log Drains (albo Sentry) na błędy 500 API.

---

## Co zostało zrobione automatycznie w tej serii (nie ruszaj)

- Audyt: naprawione 6 (czerwiec) + 20 (lipiec) martwych URL po przebudowie gov.pl.
  Audyt sam wykrywa miękkie 404, zapisuje diagnozę, w mailu i panelu daje link do
  wyszukania zamiennika (samonaprawialność).
- Wyszukiwarka świadczeń: diakrytyki, aliasy potoczne, ranking.
- Trwały rate limit czatu (Supabase, hash IP), walidacja API (400/503 zamiast 500).
- Nowa zakładka /za-darmo-dla-biznesu (DogInvoice, DogAnswer) + nav + sitemap.
- Przepływ logowania z /agent: linki wprost do /logowanie i /rejestracja (bez skoku 308);
  wylogowanie i profil w /panel zweryfikowane e2e.
- Lint 60 -> 16, martwy kod usunięty, next/image na homepage, testy 165 zielone.

Jeśli się zgubisz - napisz gdzie utknąłeś, dokończę.
