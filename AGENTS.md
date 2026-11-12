<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Język polski -- BEZWZGLĘDNA REGUŁA
Wszystkie teksty widoczne dla użytkownika MUSZĄ używać poprawnych polskich znaków diakrytycznych i gramatyki. Nigdy nie pisz:
- "Aktualnosci" zamiast "Aktualności"
- "usluge" zamiast "usługę"
- "bezplatny" zamiast "bezpłatny"
- "dzialalnosc" zamiast "działalność"
- "rowniez" zamiast "również"
- "odswiezana" zamiast "odświeżana"
- "rzadowe" zamiast "rządowe"
- "wypelnieniu" zamiast "wypełnieniu"
- "wnioskow" zamiast "wniosków"
- "dostepna" zamiast "dostępna"
- i inne -- zawsze sprawdź ą, ę, ó, ś, ź, ż, ć, ń, ł

Przed każdym commitem przejrzyj WSZYSTKIE nowe ciągi tekstowe pod kątem polskich znaków. Brak polskich liter w polskim tekście = błąd krytyczny.

# Zasady kodowania

- Brak emoji w kodzie, UI i tekstach
- Polskie znaki obowiązkowe: ą ę ó ś ź ż ć ń ł
- Brak "--" w tekstach widocznych dla użytkownika (używaj pojedynczego "-" lub przepisz zdanie)
- TypeScript strict -- nie wprowadzaj błędów typów, nie używaj `any`
- Nie łam designu (od 11.2026, styl pixel-kamil, tokeny w `src/app/globals.css`):
  - paleta: papier #f6f0e4, kafel #efe4cf, tusz #2b2420, szary #6f655b, rdza #c4483a, zieleń #2f7d5a, linia #d9cbb2
  - kroje: Inter (tekst), JetBrains Mono (nagłówki, nawigacja, przyciski)
  - prosto jak strona z linkiem w bio: jedna wąska kolumna (klasa `.prosta`, max 680 px), 1-2 zdania na blok, listy z cienką linią zamiast kart
  - przyciski: kwadratowe, ramka 2 px, min. 44 px wysokości, najechanie = przesunięcie i twardy cień 4 px (bez rozmycia)
  - zakazane: gradienty, glow, rozmycia tła (glassmorphism), paski z lewej, emoji, karty z ikoną i trzema punktami
  - ruch (od 7.11.2026, decyzja Kamila, wzór: rotor tukamil.com): tylko transform i opacity, krótko, bez przesunięć układu (CLS), wyłączony przy `prefers-reduced-motion`; dozwolone miejsca: wejście kafli `.linki > li`, rotator `.ruch` (`Rotator` w `src/components/Ruch.tsx`), licznik `Licznik` (zmienia tylko tekst liczby), poza tym animacje CSS wyłączone regułą w `globals.css`; na telefonie z CPU 4x żadnych długich zadań > 200 ms od ruchu
  - piksele tylko w grze (`public/gra/`), w znaku marki (pikselowy prezent 16×16: `PixelMark` w `src/components/SiteNav.tsx`, wzór w `src/lib/znak.ts`; z tego wzoru są `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, `public/ikona-512.png` i obraz OG `public/og-2026-11.png`, przy zmianie wyglądu OG nowa nazwa pliku, bo komunikatory trzymają podgląd po adresie) oraz w drobnych ikonach-akcentach 16×16 przy nagłówkach (`PixelIcon` w `src/components/PixelIcon.tsx`, rozmiar 16 albo 32 px; decyzja Kamila z 4.11.2026)
  - wspólne klasy w `globals.css`: `.prosta`/`.prosta-blok` (kolumna i bloki), `.lista` (lista z linią), `.linki` (przyciski jak w bio), `.btn` (+ `-primary`, `-rdza`, `-ghost`; `-sm` też 44 px), `.filtr` z `aria-pressed` (filtry i przełączniki), `.pole`/`.pole-wejscie` (formularze: ramka 2 px, tekst 16 px), `.etykieta` (nadtytuł), `.znacznik` (źródło w liście), `.przycisk-ikona` (kwadrat 44 px); pilnują tego `e2e/wyglad.spec.ts` (ruch tylko w dozwolonych miejscach i tylko transform/opacity, reduced-motion, CLS, długie zadania przy CPU 4x, bez gradientów, rozmyć, zaokrągleń) i `e2e/mobile.spec.ts` (cele dotyku 44 px, bez przewijania w poziomie)

# Protokół zakończenia pracy

Po każdym zadaniu, przed zgłoszeniem gotowości:

1. Uruchom `npx tsc --noEmit` i sprawdź błędy TypeScript
2. Napisz raport: co zmieniłeś, jakie pliki, jakie funkcje
3. NIE commituj samodzielnie -- daj Exhuman gotową komendę do wklejenia z podsumowaniem: nazwa branchy, co zmieniono, dlaczego
4. Zaktualizuj opis strony/feature w komentarzach lub README jeśli dodajesz nową funkcjonalność
5. Sprawdź czy wszystkie nowe i istniejące strony/funkcje są spójnie opisane w nawigacji i linkach wewnętrznych

# Mapa projektu (aktualizuj przy każdej zmianie)

Strony publiczne:
- `/` -- na górze „Należy Ci się więcej, niż myślisz”, rotator „Należy Ci się: …” (nazwy z bazy świadczeń, lista `ROTATOR_ID` w `src/app/page.tsx`), 3 kroki (`.kroki`: podaj wiek i odpowiedz, zobacz co i ile, wyślij bliskim) i jedno CTA „Zacznij: wpisz wiek” (fokus na `#kalk-wiek`), pod formularzem liczniki świadczeń i programów (z `BENEFITS` i `PROGRAMS`); kalkulator (#kalkulator; w pytaniach na żywo „Pasuje już N świadczeń” z `matchBenefits`, nic nie zapisuje), pod nim gra (przycisk „Zagraj” ładuje iframe `/gra/index.html` dopiero po kliknięciu, pliki w `public/gra/`), asystent AI i lista linków; wyniki: świadczenia po śmierci bliskiej osoby zawsze na końcu (NA_KONIEC w src/engine/matcher.ts); na górze wyniku `WynikPodsumowanie` (`src/components/WynikPodsumowanie.tsx`, logika `src/lib/podsumowanieWyniku.ts`): liczba pasujących i pewnych świadczeń, suma tylko stałych kwot z bazy z pewnych świadczeń (bez widełek, kwot „do”, oszczędności, wartości usług, zawieszonych i NA_KONIEC) oraz „Udostępnij” (Web Share API, inaczej kopiowanie; tekst tylko z liczbą świadczeń i link https://www.wezmezadarmo.com/?ref=wynik, bez odpowiedzi); dzieci z pytania „poniżej 18 lat” liczone jako 17-latki (`pelnyProfil`), więc 800+ wchodzi do wyniku
- `/wnioski/` -- AI-asystowane wypełnianie wniosków ZUS z eksportem PDF; szkic tylko w sessionStorage karty (`useFormPrefill`), bez profilu z konta
- `/aktualnosci/` -- komunikaty instytucji z RSS, publicznie
- `/statystyki/` -- dashboard GUS/SDG: wskaźniki live, wykresy, status API państwowych
- `/centrum-obywatela/polska-cyfrowa/` -- dowody cyfryzacji PL: newsy ElevenLabs + NFZ/e-zdrowie, kafelki, 3 wykresy (dostępność mieszkań, realne ceny m2, wzrost e-usług), lista darmowych API. Dane curated+cytowane w src/data/polska-cyfrowa.ts
- `/automatyzacje/` -- AI automatyzacje dla firm: KSeF, faktury zagraniczne, custom workflows
- `/dotacje/` -- publiczna wyszukiwarka programów dofinansowań bez konta i bez e-maila (`#wyszukiwarka`, `src/app/dotacje/WyszukiwarkaProgramow.tsx`, dane `src/data/programs-b2b.ts`), linki do artykułów o naborach i do sprawdzenia po NIP; formularz kontaktowy tylko jako kontakt
- `/dla-firm/` -- landing dla firm i JDG (na górze wejście do narzędzi, potem artykuły o dotacjach i naturalne linki do DogInvoice i DogAnswer)
- Zasada od 6.11.2026: wszystko działa bez logowania i bez podawania danych. Kont nie ma (jedyny użytkownik z panelem to właściciel: `/admin`, Basic Auth). E-mail i telefon padają tylko przy sprawdzeniu firmy po NIP (`/dla-firm/narzedzia/dofinansowania`); formularz „Napisz do nas” (stopka, `/dla-firm#kontakt`, `/dotacje`) prosi tylko o e-mail. Newslettera nie ma od 7.11.2026 (POST `/api/newsletter` = 410, potwierdzenie i wypisanie działają). Logowanie, rejestracja, panele `/panel`, `/agent/panel`, `/dotacje/panel` i stare `/dotacje/regulamin`, `/dotacje/polityka-ai` przekierowują 308 na strony publiczne (`next.config.ts`), API kont odpowiada 410 (`src/middleware.ts`, `WYLACZONE_API`); kod paneli i tabele zostają, ale są nieosiągalne (pilnuje `e2e/konta.spec.ts`)
- Zgody (od 6.11.2026): `src/lib/zgody.ts` (treść, `ZGODY_WERSJA`), `src/components/ZgodyKontaktu.tsx` (osobne pola, domyślnie odznaczone, link do `/polityka-prywatnosci#zgody` przy każdym), zapis `src/lib/zgodyZapis.ts` do tabeli `zgody_formularzy` (migracja `supabase/migrations/20261106_zgody_formularzy.sql`; bez tabeli błąd zapisu jest logowany, a formularz działa). Wymagana tylko zgoda e-mail w sprawie zgłoszenia; oferty e-mailem, telefon (tylko formularz z telefonem) i kontakt przez asystenta AI dobrowolne; pilnuje `e2e/zgody.spec.ts`
- `/polityka-prywatnosci/`, `/regulamin/` -- bez numerów artykułów (baza-prawa-pl nie ma zweryfikowanych wpisów RODO i konsumenckich) i bez danych osobowych właściciela; administrator: Mooning Charts Research (marka tuKamil), NIP 7133061369 (bez imienia, nazwiska i adresu; to samo w stopce maili)
- `/dla-firm/narzedzia/` -- lista narzędzi: KPiR i JPK prowadzą prosto do aplikacji, dofinansowania po NIP do formularza (e-mail i telefon w polskim formacie wymagane, imię opcjonalne, zgoda; bez aliasu z plusem i bez domen jednorazowych z `src/lib/narzedzia/domeny-jednorazowe.ts`, lista CC0 odświeżana `node scripts/narzedzia/domeny-jednorazowe.mjs`). Double opt-in: wynik dopiero po kliknięciu linku z maila (`/api/narzedzia/potwierdz` daje ciasteczko `wzd_nip_potwierdzony` na 30 dni); wysyłka przez Resend (`RESEND_API_KEY`), w trybie testowym nic nie wychodzi i API zwraca `linkTestowy`; lead mailem do Kamila po wysłaniu linku
- Adresy do linkowania: `/dla-firm/narzedzia/kpir` i `/dla-firm/narzedzia/jpk` (opis i przycisk prosto do narzędzia, bez formularza), `/dla-firm/narzedzia/dofinansowania` (formularz z e-mailem, potem wyszukiwarka po NIP, CEIDG); lista w `src/lib/narzedzia/lista.ts` (pole `email`), parametr `next` tylko ścieżki wewnętrzne (`bezpiecznyNext`)
- `/narzedzia/kpir/`, `/narzedzia/jpk/` -- statyczne przeglądy KPiR i JPK_V7 w `public/narzedzia` (budowa: `scripts/narzedzia/zbuduj.sh`), bez czatu, formularzy i API: pliki czyta tylko przeglądarka (martwe wywołania `/api/czat`, `/api/zapytanie`, `/api/zgloszenie` z wersji dla biur zostały w paczkach JS, ale nic ich nie uruchamia; pilnuje tego `e2e/narzedzia.spec.ts`), publiczne bez ciasteczka i formularza (middleware tylko podaje index.html katalogu i nagłówek `X-Robots-Tag: noindex, follow`); leady z formularza NIP w `/admin/narzedzia`, tabela `leady_narzedzia`; bez Dogtronic Labs (decyzja Kamila 7.11.2026): `zbuduj.sh` zamienia stopkę JPK na „Mooning Charts Research, NIP 7133061369”, usuwa ukryty formularz biura z treścią zgody i przerywa budowę, gdy w `public/narzedzia` zostanie „dogtronic”, „Hajdowska” albo NIP spółki
- `/o-projekcie/`, `/polityka-prywatnosci/`, `/regulamin/` -- strony informacyjne
- `/press/` -- press kit: opis w 1 i 3 zdaniach z przyciskiem „Kopiuj” (src/app/press/PressAkcje.tsx), fakty liczone z bazy (świadczenia, programy B2B, źródła RSS), lista narzędzi, pliki do pobrania (znak SVG i PNG z `znakSvg()` w src/lib/znak.ts, ikony, obraz OG, zrzuty 1280 i 390 w `public/press/`), kontakt przez formularz w stopce (`#napisz-do-nas`), test `e2e/press.spec.ts`
- `/agent/` -- asystent AI na stronie bez konta (`src/app/agent/CzatPubliczny.tsx`, POST `/api/chat`, 3 pytania dziennie; `/agent?q=` wpisuje pytanie i wysyła je samo tylko po wejściu z tej strony); prompty agentów (`src/agents/*`) nie odsyłają do paneli
- `/blog/` i `/blog/<slug>` -- wpisy w `src/data/blog-posts.ts`, wpisy o dotacjach dla firm w `src/data/blog-dotacje-2026.ts` (ranking 10 naborów z listopada 2026 według budżetu z zestawienia MFiPR, kryterium opisane w artykule; Ścieżka SMART, kredyt dual-use BGK, Dig.IT; fakty tylko z oficjalnych źródeł z linkiem i datą sprawdzenia, na końcu DogInvoice); treść: `##`/`###`, punkty ` • `, linki `[tekst](adres)`, pole `faq` (widoczne FAQ + FAQPage), JSON-LD Article; wersja Markdown `/blog/<slug>.md` (rewrite w `next.config.ts` na `src/app/blog-md/[slug]/route.ts`, treść `wpisMd` w `src/lib/blog.ts`); sitemap i llms.txt biorą wpisy automatycznie
- `/o-projekcie/` -- kto robi stronę (tuKamil, https://tukamil.com), przewodnik https://tukamil.com/wezmezadarmo/, pakiet Wdrożenie AI w firmie https://tukamil.com/wdrozenie-ai/, DogInvoice i DogAnswer; bez nazwiska i danych kontaktowych w treści

SEO i pliki dla AI (od 5.11.2026):
- `src/lib/strony.ts` -- rejestr publicznych stron: title, description, keywords, okruszki, typ schema.org; z niego `metadaneStrony('/sciezka')` (canonical na https://www.wezmezadarmo.com, OG, Twitter, link do .md), `<StronaJsonLd>` (WebPage, BreadcrumbList, WebApplication), `sitemap.ts` i `/llms.txt`. Nowa publiczna strona = wpis w rejestrze + `metadaneStrony` i `StronaJsonLd` w page albo layout (pilnuje `src/lib/__tests__/seo.test.ts`)
- `src/components/JsonLd.tsx` -- `SerwisJsonLd` w root layout (WebSite z SearchAction na /swiadczenia?q=, Organization wezmezadarmo, wydawca tuKamil https://tukamil.com); nigdy GovernmentService (projekt prywatny); FAQPage tylko przy widocznym FAQ
- `/llms.txt`, `/llms-full.txt` i wersje `.md` stron (`/index.md`, `/swiadczenia.md`, `/wnioski.md`, `/dotacje.md`, `/dla-firm.md` i inne z `md: true`) -- route handlery, treść w `src/lib/llms.ts` z tych samych danych co strona (rejestr, baza świadczeń, blog, narzędzia); sekcje „Narzędzia na subdomenach” i „Inne aplikacje tuKamil”
- Bez Dogtronic Labs (decyzja Kamila 7.11.2026): DogInvoice i DogAnswer tylko jako nazwy produktów z linkami do doginvoice.com i doganswer.com, bez nazwy firmy, która je robi; pilnuje `src/lib/__tests__/bez-dogtronic.test.ts` (llms.txt, llms-full.txt, wersje .md, rejestr stron, `src/`, `public/`)
- `src/lib/siec.ts` -- katalog sieci tuKamil (14 aplikacji, nazwy i opisy wg wspólnego katalogu z 6.11.2026, Recepcja w telefonie od 12.11.2026): z niego stopka „Sieć tuKamil” (`src/components/SiecTuKamil.tsx`, wariant tekstowy `siec-tk--tekst`, bez ikon i psa, w `SiteFooter`, Kontakt → https://tukamil.com/#kontakt) i sekcja „Inne aplikacje tuKamil” w llms.txt; przy sygnaturze link „Marka i materiały” do https://tukamil.com/marka/wezmezadarmo/ (`MARKA_TEJ_STRONY`, ten sam adres na /press i w llms.txt); tuKamil w JSON-LD ma `@id` https://tukamil.com/#tukamil (jak w całej sieci); test `src/lib/__tests__/siec.test.ts`
- `public/llm.md`, `public/agents.md` -- przewodniki dla agentów (co jest na stronie, co działa bez danych, gdzie e-mail i telefon (tylko firmy), artykuły, publiczne API, inne aplikacje tuKamil, przewodnik tukamil.com/wezmezadarmo), podlinkowane z llms.txt; pliki statyczne, edytuj je bezpośrednio. Sekcje „Bez konta”, „Artykuły” i „Publiczne API bez klucza” w llms.txt składa `src/lib/llms.ts` (`BEZ_KONTA`, `API_PUBLICZNE`)
- `public/robots.txt` -- boty AI wpuszczone jawnie, poza indeksem: /api (poza /api/public), /admin, panele, /narzedzia; e2e: `e2e/seo.spec.ts`

Panele kont (`/panel/*`, `/dotacje/panel/*`, `/agent/panel/*`) i logowanie: wyłączone od 6.11.2026, 308 na strony publiczne (mapa w `next.config.ts`). Kod w `src/app/panel`, `src/app/dotacje/panel`, `src/app/agent/panel` zostaje nieosiągalny; `src/app/panel/dotacje/page.tsx` służy jako wynik sprawdzenia po NIP (`/dla-firm/narzedzia/dofinansowania`, z linkami do DogInvoice i DogAnswer).

System agentów AI (src/agents/):
- 8 agentów: konsjerz, swiadczenia, wnioski, nfz-zdrowie, finanse-jdg, dotacje, prawo-terminy, rolnik
- Każdy agent: `agent.md` (persona), `knowledge.md` (wiedza), `keywords.json` (router), `prefetch.json` (API live), `sources.md`
- `router.ts` -- routeToAgent(message, profileType): keyword matching z wagami
- `registry.ts` -- czyta .md, buildAgentSystemPrompt(), caching
- Selektywny prefetch: tylko API zdefiniowane w prefetch.json aktywnego agenta
- Cross-reference: dotacje agent + src/data/programs-b2b.ts (59 programów B2B)

API:
- `/api/chat/` -- czat AI dla obywateli (rate limit: 3/dzień)
- `/api/agent/chat/` -- wyłączone (410), był streaming chat z auto-routingiem dla zalogowanych
- `/api/form-assist/` -- AI wypełnianie pól wniosku
- `/api/pdf/` -- generowanie PDF z danymi
- `/api/aktualnosci/` -- publiczne aktualności RSS (`/api/aktualnosci/feeds` firm: 410)
- `/api/dotacje/` -- wyłączone (410) poza cronem daily-scrape
- `/api/ceidg/` -- integracja z rejestrem firm CEIDG
- `/api/agent/` -- wyłączone (410)
- `/api/digest/` -- wyłączone (410), digest kont nie wychodzi
- `/api/narzedzia/lead` i `/api/narzedzia/potwierdz` -- formularz NIP (walidacja `src/lib/narzedzia/walidacja.ts`: e-mail bez plusa i domen jednorazowych, telefon PL, zgody) i link z maila (Resend; tryb testowy `NARZEDZIA_TRYB_TESTOWY=1` zwraca `linkTestowy`)
- `/api/contact` -- „Napisz do nas”: zgody, odrzuca domeny jednorazowe, mail do właściciela
