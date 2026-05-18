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
- `/` -- kalkulator świadczeń dla obywateli (117+ świadczeń ZUS, NFZ, PFRON itd.)
- `/wnioski/` -- AI-asystowane wypełnianie wniosków ZUS z eksportem PDF
- `/aktualnosci/` -- monitoring RSS (publiczny podgląd + B2B panel dla firm)
- `/automatyzacje/` -- AI automatyzacje dla firm: KSeF, faktury zagraniczne, custom workflows
- `/dotacje/` -- B2B SaaS: monitoring dofinansowań, AI agent dopasowujący do profilu firmy
- `/dla-firm/` -- landing dla firm i JDG
- `/o-projekcie/`, `/polityka-prywatnosci/`, `/regulamin/` -- strony informacyjne

Panel firmowy (/dotacje/panel/):
- `/dotacje/panel/` -- dashboard
- `/dotacje/panel/agent/` -- konfiguracja AI agenta
- `/dotacje/panel/monitoring/` -- aktywne dofinansowania
- `/dotacje/panel/aktualnosci/` -- monitoring RSS per firma + powiadomienia
- `/dotacje/panel/subskrypcja/` -- zarządzanie subskrypcją

API:
- `/api/chat/` -- czat AI dla obywateli (rate limit: 3/dzień)
- `/api/form-assist/` -- AI wypełnianie pól wniosku
- `/api/pdf/` -- generowanie PDF z danymi
- `/api/aktualnosci/` -- RSS feeds per firma
- `/api/dotacje/` -- auth, company, monitoring, stripe, cron
- `/api/ceidg/` -- integracja z rejestrem firm CEIDG
