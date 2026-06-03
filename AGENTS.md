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
- Nie łam istniejącego designu: ciemne tło #0d0b0a, amber #e6993a, JetBrains Mono

# Protokół zakończenia pracy

Po każdym zadaniu, przed zgłoszeniem gotowości:

1. Uruchom `npx tsc --noEmit` i sprawdź błędy TypeScript
2. Napisz raport: co zmieniłeś, jakie pliki, jakie funkcje
3. NIE commituj samodzielnie -- daj Exhuman gotową komendę do wklejenia z podsumowaniem: nazwa branchy, co zmieniono, dlaczego
4. Zaktualizuj opis strony/feature w komentarzach lub README jeśli dodajesz nową funkcjonalność
5. Sprawdź czy wszystkie nowe i istniejące strony/funkcje są spójnie opisane w nawigacji i linkach wewnętrznych

# Mapa projektu (aktualizuj przy każdej zmianie)

Strony publiczne:
- `/` -- kalkulator świadczeń dla obywateli (133+ świadczeń ZUS, NFZ, PFRON itd.)
- `/wnioski/` -- AI-asystowane wypełnianie wniosków ZUS z eksportem PDF
- `/aktualnosci/` -- monitoring RSS (publiczny podgląd + B2B panel dla firm)
- `/statystyki/` -- dashboard GUS/SDG: wskaźniki live, wykresy, status API państwowych
- `/centrum-obywatela/polska-cyfrowa/` -- dowody cyfryzacji PL: newsy ElevenLabs + NFZ/e-zdrowie, kafelki, 3 wykresy (dostępność mieszkań, realne ceny m2, wzrost e-usług), lista darmowych API. Dane curated+cytowane w src/data/polska-cyfrowa.ts
- `/automatyzacje/` -- AI automatyzacje dla firm: KSeF, faktury zagraniczne, custom workflows
- `/dotacje/` -- B2B SaaS: monitoring dofinansowań, baza 57 programów, AI agent dopasowujący do profilu firmy
- `/dla-firm/` -- landing dla firm i JDG
- `/o-projekcie/`, `/polityka-prywatnosci/`, `/regulamin/` -- strony informacyjne
- `/agent/` -- Agent AI dla JDG i osób prywatnych (świadczenia, RSS, dzienny e-mail digest)

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
- Cross-reference: dotacje agent + src/data/programs-b2b.ts (57 programów B2B)

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
