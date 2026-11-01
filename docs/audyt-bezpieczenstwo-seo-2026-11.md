# Audyt bezpieczeństwa i SEO wezmezadarmo.com (01.11.2026)

Branch `claude/wzd-seo`. Zakres: domena (tylko diagnoza), bezpieczeństwo kodu, SEO techniczne, rekomendacje SEM. Bez zmian w Vercel, DNS, wyglądzie i danych świadczeń/dotacji.

## 1. Domena: dlaczego https://wezmezadarmo.com (bez www) nie działa

**Przyczyna (odczyt z Vercel, tylko do odczytu):** w DNS domeny (GoDaddy, `ns15/ns16.domaincontrol.com`) jest rekord **CAA `0 issue "amazon.com"`**. Rekord CAA mówi, kto może wystawiać certyfikaty dla domeny. Vercel wystawia je przez Let's Encrypt, więc nie może odnowić certyfikatu dla `wezmezadarmo.com`. Vercel oznacza apex jako `misconfigured: true` z konfliktem właśnie na tym rekordzie. Certyfikat apex wygasł, przeglądarka pokazuje błąd zanim zadziała przekierowanie.

Pozostałe ustawienia są poprawne:
- rekord A apex: `216.150.1.1` (zgodny z zaleceniem Vercel),
- `www` to CNAME na `17011b6d0aef98d0.vercel-dns-016.com.`, certyfikat ważny,
- w projekcie Vercel `wezmezadarmo.com` przekierowuje na `www.wezmezadarmo.com` (z pominięciem błędu TLS odpowiedź to `307` na `https://www.wezmezadarmo.com/`).

**Ryzyko na grudzień:** certyfikat `www.wezmezadarmo.com` jest ważny do **12.12.2026**. Rekord CAA na apex obowiązuje też subdomeny, które nie mają własnego CAA, więc odnowienie `www` (Vercel próbuje ok. 30 dni przed końcem) prawdopodobnie też się nie uda (nie wiem, kiedy rekord CAA został dodany; `www` odnowił się 13.09.2026). To samo grozi `dotacje.`, `firma.`, `agent.`, `wnioski.`, `automatyzacja.` (ważne do stycznia/lutego 2027).

Uwaga do diagnozy: w tym środowisku ruch idzie przez proxy, które podpisuje certyfikaty własnym CA. Data „nowego certyfikatu” 17:33/17:42 UTC to certyfikat proxy, nie Vercel. Faktyczny stan certyfikatów pochodzi z API Vercel.

### Kroki dla Kamila (ok. 10 minut)
1. GoDaddy → Moje produkty → `wezmezadarmo.com` → DNS → Rekordy DNS.
2. Rekord **CAA** `0 issue "amazon.com"`:
   - jeśli nie używasz certyfikatów Amazon (AWS) dla tej domeny: **usuń go**;
   - jeśli używasz: zostaw i **dodaj** drugi rekord CAA: nazwa `@`, flaga `0`, tag `issue`, wartość `letsencrypt.org`.
3. Nie ruszaj rekordu A (`216.150.1.1`) ani CNAME dla `www`.
4. Vercel → projekt `wezmezadarmo` → Settings → Domains → `wezmezadarmo.com` → Refresh. Status ma zmienić się na „Valid Configuration”, certyfikat wystawi się sam w kilka minut.
5. Tam samo: Edit przy `wezmezadarmo.com` → przekierowanie na `www.wezmezadarmo.com` ustaw na **308 Permanent** (dziś jest domyślne 307 Temporary; 308 przenosi moc linków na www).
6. Sprawdzenie: `curl -I https://wezmezadarmo.com` ma zwrócić `308` i `location: https://www.wezmezadarmo.com/` bez błędu certyfikatu.

## 2. Bezpieczeństwo kodu

| # | Ustalenie | Waga | Stan |
|---|---|---|---|
| B1 | `next@16.2.6`: 20 podatności, w tym 5 krytycznych (RCE w Image Optimization, `next/og`, `use cache`), obejście middleware, SSRF | krytyczna | **naprawione**: `next` i `eslint-config-next` 16.4.3 |
| B2 | `undici@6.25` (bezpośrednia zależność): obejście weryfikacji TLS, DoS | wysoka | **naprawione**: `^6.29.1` |
| B3 | `vercel` (CLI) w `dependencies` ciągnął ~45 podatnych paczek do drzewa produkcyjnego; w kodzie nieużywany | wysoka | **naprawione**: przeniesiony do `devDependencies` (Vercel instaluje devDependencies przy buildzie). `npm audit --omit=dev`: **0 podatności** |
| B4 | `/api/aktualnosci/debug` publiczny: zdradzał, które klucze Supabase są ustawione, i id projektu | średnia | **naprawione**: za Basic Auth admina (middleware) |
| B5 | `/api/digest` przy braku `CRON_SECRET` akceptował nagłówek `Bearer undefined` | średnia | **naprawione**: fail closed |
| B6 | `/api/cron/benefits-audit` przy braku `CRON_SECRET` był otwarty dla wszystkich | średnia | **naprawione**: fail closed |
| B7 | `/api/contact` bez limitu (spam do skrzynki właściciela), brak limitów długości imienia/firmy, nowe linie w temacie maila | średnia | **naprawione**: 5/h/IP, walidacja typów i długości, temat bez `\r\n`, escape `'` w HTML |
| B8 | `/api/form-assist` (płatne wywołania AI) bez limitu | średnia | **naprawione**: 20/h/IP |
| B9 | `/api/pdf` bez limitu (CPU) | niska | **naprawione**: 30/h/IP |
| B10 | Hasło admina porównywane zwykłym `===`, hasło z dwukropkiem obcinane | niska | **naprawione**: porównanie w stałym czasie, poprawne parsowanie |
| B11 | Brak Content-Security-Policy | średnia | **dodane w trybie Report-Only** (`vercel.json`), patrz niżej |
| B12 | `/api/admin/rss-status` używa klucza service role | info | OK: chroniony Basic Auth w `middleware.ts` (`/api/admin/*`) |
| B13 | Cron `daily-scrape`, `weekly-check` | info | OK: fail closed na `CRON_SECRET` |
| B14 | Stripe `checkout/portal/webhook` | info | OK: zwracają 410 (płatności wyłączone) |
| B15 | Sekrety w repo | info | OK: w kodzie i historii gita brak kluczy; `.env.example` ma tylko placeholdery |

Do decyzji (nie zmieniałem, bo zmienia zachowanie):
- **`/api/digest` nigdy nie rusza z crona.** Vercel Cron wysyła `GET`, a route ma tylko `POST`, więc codzienny digest dostaje 405. Dodanie `GET` uruchomi realne maile do użytkowników, więc to decyzja Kamila.
- `benefits-audit` przyjmuje sekret także w `?secret=`; adresy z sekretem lądują w logach. Lepiej tylko nagłówek.
- Limity są w pamięci instancji (jak reszta `/api/public/*`), więc chronią przed prostym spamem, nie przed rozproszonym atakiem. Trwały licznik jest już w `checkRateLimitDurable` (czat); można go uogólnić.
- `middleware.ts` w Next 16 jest przestarzałą nazwą (`proxy.ts`), build ostrzega. Migracja: `npx @next/codemod@canary middleware-to-proxy .`.
- Zależności tylko deweloperskie (`vitest` 3, CLI `vercel`) nadal mają podatności; poprawka wymaga `vitest` 5 (zmiana major), bez wpływu na produkcję.

### CSP (Report-Only)
Nagłówek `Content-Security-Policy-Report-Only` dopuszcza: własną domenę, Google Tag Manager i Analytics, Vercel Analytics i Speed Insights, Supabase (`https` i `wss`), Stripe, Google Fonts, obrazy z `https:`/`data:`/`blob:`, `frame-ancestors 'self'`, `object-src 'none'`. Inline skrypty (`'unsafe-inline'`) zostają, bo layout ma skrypty inline (motyw, consent GA). Report-Only niczego nie blokuje, tylko pokazuje naruszenia w konsoli przeglądarki. Po tygodniu bez naruszeń zmień klucz na `Content-Security-Policy`.

## 3. SEO

### Zmienione
- **`metadataBase`** na `https://www.wezmezadarmo.com` (było `wezmezadarmo.vercel.app`, więc `og:image` na produkcji wskazywał adres vercel.app).
- **Canonical** absolutny na www na wszystkich publicznych stronach z sitemapy poza `/` i `/agent` (strony serwerowe i layouty-liście). Celowo nie w root layout: metadata się dziedziczy i każda podstrona wskazywałaby stronę główną.
- **Strona główna:** title „Jakie świadczenia mi się należą? Kalkulator świadczeń 2026 | wezmezadarmo”, description z frazą „kalkulator świadczeń 2026”, OG i Twitter bez liczb (liczby świadczeń zmieniają się z aktualizacją bazy).
- **`/swiadczenia`**: nowy layout z title „Baza świadczeń 2026: zasiłki, ulgi i dopłaty, które Ci się należą”, description z frazą „Jakie świadczenia mi się należą?”, canonical, BreadcrumbList.
- **`/dotacje`**: title „Dotacje dla firm 2026: monitoring naborów i agent AI”, description z frazą „dotacje dla firm 2026”. Usunięte nieaktualne „25 PLN / miesiąc” z description (serwis jest bezpłatny).
- **Wnioski ZUS** (Z-15A, Z-15B, ZAS-53, ERPO, ERU, PEL, Z-3, NLnet): własne title, description, canonical i BreadcrumbList (wcześniej wszystkie miały title strony głównej).
- **noindex** na logowaniu, rejestracji, resecie i nowym haśle, „sprawdź e-mail” (także wersje `/agent/*` i `/dotacje/*`) oraz panelu `/dotacje/panel`.
- **og:image** wraca na stronach (16 plików metadanych), które ustawiały własne `openGraph` i przez płytkie scalanie traciły obraz (blog, wpisy, NFZ, aktualności, automatyzacje, press, dotacje, narzędzia Centrum Obywatela). Twitter dostał obraz w root layout.
- **Sitemap:** usunięte 133 adresy `/swiadczenia?id=` (duplikaty z canonical na `/swiadczenia`), dodane `/centrum-obywatela/polska-cyfrowa`, `lastmod` z realnych dat: najnowsza weryfikacja świadczenia, data wpisu bloga, stała data dla stron statycznych, czas generowania tylko dla stron „na żywo” (aktualności, prawo, pogoda, statystyki).
- **robots.txt:** `Disallow` dla `/admin/`, `/api/admin/`, `/panel/`, `/dotacje/panel/`, `/agent/panel/`, powtórzony w każdej grupie botów (bot z własną grupą ignoruje `*`). `/api/public/*` zostaje otwarte, bo strony narzędzi pobierają z niego dane w przeglądarce.
- Poprawione teksty metadanych: „--” i brak polskich znaków w `/statystyki` i `/agent`.

### Stan po zmianach (build lokalny, 38 adresów z sitemapy)
Każdy ma title, description, jeden `h1` (poza `/agent`), og:image i twitter:image. Canonical mają wszystkie poza `/` i `/agent`.

### Do zrobienia (poza zakresem tej zmiany)
1. **Strony `/swiadczenia/[id]` renderowane na serwerze.** Dziś szczegóły świadczenia są pod `?id=` w komponencie klienckim, więc Google widzi jedną stronę zamiast 133. Osobne strony z `generateStaticParams`, własnym title („Zasiłek opiekuńczy 2026: kto dostanie, ile, jak złożyć”), JSON-LD `GovernmentService` (komponent już jest w `src/components/JsonLd.tsx`) i linkami wewnętrznymi to największa dźwignia ruchu z długiego ogona.
2. **Canonical dla `/`** po scaleniu nowego designu: wydzielić klienta strony głównej do komponentu i dodać `page.tsx` serwerowy z `alternates`. Nie robiłem teraz, żeby nie kolidować z branchem designu.
3. **Strona główna ma dwa `h1`** (`src/app/page.tsx` linie ok. 655 i 1559). Do ujednolicenia w ramach designu.
4. **FAQPage:** żadna strona nie ma widocznego FAQ, więc nie dodałem schema (Google wymaga zgodności z treścią). Sekcja FAQ na stronie głównej i `/dotacje` (np. „Jakie świadczenia mi się należą?”, „Ile wynosi zasiłek opiekuńczy w 2026?”, „Jakie dotacje dla firm są w 2026?”) plus gotowy `FAQJsonLd`.
5. **`/wnioski/nlnet`** pokazuje termin naboru 1 czerwca 2026, który minął.
6. **Core Web Vitals:** `preconnect` do Google Fonts jest w `<head>`, a fonty idą z `geist` (lokalnie). Jeśli design nie używa Google Fonts, usuń preconnect. Zdjęcia w `public/` (`foto-*.png`) warto podać przez `next/image` w WebP/AVIF.
7. Search Console: po naprawie apex zgłosić sitemapę `https://www.wezmezadarmo.com/sitemap.xml` i sprawdzić raport „Strona zduplikowana” dla starych `?id=`.

## 4. SEM: rekomendacje kampanii (bez wydatków, do decyzji)

Google Ads, kampania Search, lokalizacja Polska, język polski. Start: dopasowanie do wyrażenia i ścisłe, budżet testowy niewielki, cel: kliknięcie „Sprawdź” w kalkulatorze (zdarzenie GA4).

| Grupa reklam | Frazy | Strona docelowa |
|---|---|---|
| Kalkulator świadczeń | „kalkulator świadczeń 2026”, „jakie świadczenia mi się należą”, „co mi się należy od państwa”, „jakie zasiłki mi przysługują” | `/` |
| Rodzina | „zasiłek opiekuńczy 2026”, „świadczenia dla rodzin 2026”, „mama 4 plus wniosek”, „800 plus kto dostanie” | `/swiadczenia`, `/wnioski/zus-z15a`, `/wnioski/zus-ersu` |
| Wnioski ZUS | „wniosek z-15a online”, „zas-53 wniosek”, „pełnomocnictwo zus pel”, „jak wypełnić wniosek o emeryturę” | `/wnioski/*` |
| Dotacje dla firm | „dotacje dla firm 2026”, „dofinansowanie dla firm 2026”, „dotacje dla jdg 2026”, „kfs 2026 nabór”, „dotacje pup 2026” | `/dotacje` |
| NFZ | „kolejki nfz”, „czas oczekiwania do specjalisty nfz” | `/nfz` |

Wykluczenia (lista wspólna): `praca`, `oferta pracy`, `kredyt`, `pożyczka`, `chwilówka`, `kasyno`, `darmowe gry`, `za darmo film`, `pdf do druku` (dla grup bez PDF), `logowanie pue`, `zus kontakt`, `infolinia`, `telefon`, `adres`, `godziny otwarcia`, `komornik`, `windykacja`, nazwy konkretnych firm doradczych. Dla grupy dotacji dodatkowo: `dla osób prywatnych`, `dla studentów`, `stypendium`.

Uwagi: frazy „za darmo” przyciągają ruch spoza celu, dlatego warto je mieć tylko w dopasowaniu ścisłym. Reklamy tylko z faktami, które są na stronie (bezpłatnie, bez logowania, źródła urzędowe). Organizacje non-profit mogą sprawdzić Google Ad Grants; status prawny projektu jest do potwierdzenia przez Kamila.

## 5. Testy
- `npm ci`: OK
- `npx tsc --noEmit`: OK
- `npm test`: 17 plików, 165 testów, wszystkie zielone
- `npm run build`: OK (jedyne ostrzeżenie: przestarzała nazwa `middleware`)
- Ręcznie na `next start`: canonical, noindex, og:image, sitemap (38 adresów, 0 `?id=`), `/api/aktualnosci/debug` 401, `/api/digest` z `Bearer undefined` 401, `/api/cron/benefits-audit` bez sekretu 401, `/api/contact` 429 po limicie.
