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
  - zakazane: gradienty, glow, rozmycia tła (glassmorphism), paski z lewej, emoji, karty z ikoną i trzema punktami, animacje (poza grą)
  - piksele tylko w grze (`public/gra/`), w znaku marki (`PixelMark` w `src/components/SiteNav.tsx`) oraz w drobnych ikonach-akcentach 16×16 przy nagłówkach (`PixelIcon` w `src/components/PixelIcon.tsx`, rozmiar 16 albo 32 px; decyzja Kamila z 4.11.2026)

# Protokół zakończenia pracy

Po każdym zadaniu, przed zgłoszeniem gotowości:

1. Uruchom `npx tsc --noEmit` i sprawdź błędy TypeScript
2. Napisz raport: co zmieniłeś, jakie pliki, jakie funkcje
3. NIE commituj samodzielnie -- daj Exhuman gotową komendę do wklejenia z podsumowaniem: nazwa branchy, co zmieniono, dlaczego
4. Zaktualizuj opis strony/feature w komentarzach lub README jeśli dodajesz nową funkcjonalność
5. Sprawdź czy wszystkie nowe i istniejące strony/funkcje są spójnie opisane w nawigacji i linkach wewnętrznych

# Mapa projektu (aktualizuj przy każdej zmianie)

Strony publiczne:
- `/` -- na górze „Należy Ci się więcej, niż myślisz”, 2 przykłady świadczeń i kalkulator (#kalkulator), pod nim gra (przycisk „Zagraj” ładuje iframe `/gra/index.html` dopiero po kliknięciu, pliki w `public/gra/`), asystent AI i lista linków; wyniki: świadczenia po śmierci bliskiej osoby zawsze na końcu (NA_KONIEC w src/engine/matcher.ts)
- `/wnioski/` -- AI-asystowane wypełnianie wniosków ZUS z eksportem PDF
- `/aktualnosci/` -- monitoring RSS (publiczny podgląd + B2B panel dla firm)
- `/statystyki/` -- dashboard GUS/SDG: wskaźniki live, wykresy, status API państwowych
- `/centrum-obywatela/polska-cyfrowa/` -- dowody cyfryzacji PL: newsy ElevenLabs + NFZ/e-zdrowie, kafelki, 3 wykresy (dostępność mieszkań, realne ceny m2, wzrost e-usług), lista darmowych API. Dane curated+cytowane w src/data/polska-cyfrowa.ts
- `/automatyzacje/` -- AI automatyzacje dla firm: KSeF, faktury zagraniczne, custom workflows
- `/dotacje/` -- B2B SaaS: monitoring dofinansowań, baza 59 programów, AI agent dopasowujący do profilu firmy
- `/dla-firm/` -- landing dla firm i JDG (na górze wejście do narzędzi)
- `/dla-firm/narzedzia/` -- narzędzia dla firm bez konta: formularz leadu (e-mail i telefon wymagane, imię opcjonalne, zgoda), ciasteczko dostępu na 30 dni od razu po wysłaniu; mail z linkiem tylko jako potwierdzenie i dostęp na innym urządzeniu; lead mailem do Kamila
- Adresy do linkowania (opis + formularz, z dostępem od razu narzędzie): `/dla-firm/narzedzia/kpir`, `/dla-firm/narzedzia/jpk`, `/dla-firm/narzedzia/dofinansowania` (NIP, CEIDG); lista w `src/lib/narzedzia/lista.ts`, parametr `next` tylko ścieżki wewnętrzne (`bezpiecznyNext`)
- `/narzedzia/kpir/`, `/narzedzia/jpk/` -- statyczne przeglądy KPiR i JPK_V7 w `public/narzedzia` (budowa: `scripts/narzedzia/zbuduj.sh`), bez czatu, formularzy i API: pliki czyta tylko przeglądarka (martwe wywołania `/api/czat`, `/api/zapytanie`, `/api/zgloszenie` z wersji dla biur zostały w paczkach JS, ale nic ich nie uruchamia; pilnuje tego `e2e/narzedzia.spec.ts`), dostęp tylko z ciasteczkiem (middleware, bez niego przekierowanie na stronę narzędzia z formularzem); leady w `/admin/narzedzia`, tabela `leady_narzedzia`
- `/o-projekcie/`, `/polityka-prywatnosci/`, `/regulamin/` -- strony informacyjne
- `/agent/` -- Agent AI dla JDG i osób prywatnych (świadczenia, RSS, dzienny e-mail digest)

SEO i pliki dla AI (od 5.11.2026):
- `src/lib/strony.ts` -- rejestr publicznych stron: title, description, keywords, okruszki, typ schema.org; z niego `metadaneStrony('/sciezka')` (canonical na https://www.wezmezadarmo.com, OG, Twitter, link do .md), `<StronaJsonLd>` (WebPage, BreadcrumbList, WebApplication), `sitemap.ts` i `/llms.txt`. Nowa publiczna strona = wpis w rejestrze + `metadaneStrony` i `StronaJsonLd` w page albo layout (pilnuje `src/lib/__tests__/seo.test.ts`)
- `src/components/JsonLd.tsx` -- `SerwisJsonLd` w root layout (WebSite z SearchAction na /swiadczenia?q=, Organization wezmezadarmo, wydawca tuKamil https://tukamil.com); nigdy GovernmentService (projekt prywatny); FAQPage tylko przy widocznym FAQ
- `/llms.txt`, `/llms-full.txt` i wersje `.md` stron (`/index.md`, `/swiadczenia.md`, `/wnioski.md`, `/dotacje.md`, `/dla-firm.md` i inne z `md: true`) -- route handlery, treść w `src/lib/llms.ts` z tych samych danych co strona (rejestr, baza świadczeń, blog, narzędzia); sekcje „Narzędzia na subdomenach” i „Inne aplikacje tuKamil”
- `public/llm.md`, `public/agents.md` -- przewodniki techniczne dla agentów (API), podlinkowane z llms.txt
- `public/robots.txt` -- boty AI wpuszczone jawnie, poza indeksem: /api (poza /api/public), /admin, panele, /narzedzia; e2e: `e2e/seo.spec.ts`

Panel główny (/panel/) -- dla zalogowanych obywateli:
- `/panel/` -- dashboard (Świadczenia, Dotacje, Czat AI, Aktualności, Wnioski, Powiadomienia)
- `/panel/swiadczenia/` -- dopasowane świadczenia i ulgi
- `/panel/dotacje/` -- karta dotacje (link do systemu /dotacje/)
- `/panel/chat/` -- czat z asystentem AI
- `/panel/aktualnosci/` -- RSS aktualności i zmiany w prawie
- `/panel/wnioski/` -- lista wniosków ZUS
- `/panel/powiadomienia/` -- ustawienia digestu e-mail
- `/panel/profil/` -- edycja profilu użytkownika

Panel firmowy (/dotacje/panel/) -- B2B, osobna rejestracja:
- `/dotacje/panel/` -- dashboard B2B
- `/dotacje/panel/agent/` -- konfiguracja AI agenta dotacji
- `/dotacje/panel/monitoring/` -- baza programów dofinansowań
- `/dotacje/panel/aktualnosci/` -- RSS per firma
- `/dotacje/panel/subskrypcja/` -- zarządzanie subskrypcją

Panel agenta (/agent/panel/) -- alternatywny/legacy, bez wnioski/dotacje:
- `/agent/panel/` -- dashboard
- `/agent/panel/swiadczenia/` -- świadczenia
- `/agent/panel/aktualnosci/` -- aktualności RSS
- `/agent/panel/powiadomienia/` -- digest e-mail
- `/agent/panel/profil/` -- profil

System agentów AI (src/agents/):
- 8 agentów: konsjerz, swiadczenia, wnioski, nfz-zdrowie, finanse-jdg, dotacje, prawo-terminy, rolnik
- Każdy agent: `agent.md` (persona), `knowledge.md` (wiedza), `keywords.json` (router), `prefetch.json` (API live), `sources.md`
- `router.ts` -- routeToAgent(message, profileType): keyword matching z wagami
- `registry.ts` -- czyta .md, buildAgentSystemPrompt(), caching
- Selektywny prefetch: tylko API zdefiniowane w prefetch.json aktywnego agenta
- Cross-reference: dotacje agent + src/data/programs-b2b.ts (59 programów B2B)

API:
- `/api/chat/` -- czat AI dla obywateli (rate limit: 3/dzień)
- `/api/agent/chat/` -- streaming chat z auto-routingiem (8 agentów), nagłówek X-Agent-Id
- `/api/form-assist/` -- AI wypełnianie pól wniosku
- `/api/pdf/` -- generowanie PDF z danymi
- `/api/aktualnosci/` -- RSS feeds per firma
- `/api/dotacje/` -- auth, company, monitoring, stripe, cron
- `/api/ceidg/` -- integracja z rejestrem firm CEIDG
- `/api/agent/` -- auth i profil dla modułu agent
- `/api/digest/` -- cron endpoint digestu (wywoływany przez Vercel Cron)
