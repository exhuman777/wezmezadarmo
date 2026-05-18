# Agent AI dla JDG i Osób Prywatnych -- Spec

**Data:** 2026-05-18
**Projekt:** wezmezadarmo.com
**Modul:** /agent
**Status:** zatwierdzone przez Exhuman

---

## Cel

Dzienny e-mail digest od agenta AI dla dwóch typów użytkowników:
- **JDG** (jednoosobowa działalność gospodarcza) -- zmiany w prawie + dofinansowania pasujące do PKD firmy
- **Osoba prywatna** -- świadczenia socjalne które przysługują + zmiany w przepisach wpływające na profil

Agent wysyła e-mail raz dziennie o 8:00 czasu polskiego (6:00 UTC). E-mail zawiera tylko informacje publiczne i linki do panelu. Zero danych wrażliwych w treści maila.

---

## Struktura URL

```
/agent                           -- landing page (nowy moduł)
/agent/rejestracja               -- rejestracja konta
/agent/logowanie                 -- logowanie
/agent/panel                     -- dashboard
/agent/panel/swiadczenia         -- dopasowane świadczenia
/agent/panel/aktualnosci         -- RSS + zmiany w prawie
/agent/panel/powiadomienia       -- ustawienia digestu mailowego
/agent/panel/profil              -- edycja profilu
```

---

## Typy użytkowników i profil

### Rejestracja -- jeden formularz, 3 kroki

**Krok 1:** Email + hasło + akceptacja regulaminu

**Krok 2:** Checkbox "Prowadzę działalność gospodarczą (JDG)"

Jeśli TAK (JDG):
- Pole NIP -> wywołanie CEIDG API -> autouzupełnienie:
  - Nazwa firmy (`firma.nazwa`)
  - PKD codes (`firma.pkd[].kod`)
  - Województwo (`firma.adresDzialalnosci.wojewodztwo`)
  - Data rejestracji (`firma.dataRozpoczeciaDzialalnosci`)
  - Status (`firma.status`)
- Dodatkowe pole ręczne: rozmiar firmy (mikro/mała/średnia)

Jeśli NIE (osoba prywatna):
- Wiek (liczba)
- Płeć (K/M)
- Stan cywilny (wolny / małżeństwo / rozwiedziony / wdowiec)
- Liczba dzieci poniżej 18 lat
- Wiek każdego dziecka (tablica, opcjonalnie)
- Dochód netto gosp. domowego (PLN/mies.)
- Dochód netto na osobę (PLN/mies.)
- Forma zatrudnienia (umowa_o_prace / dzialalnosc / umowa_zlecenie / bezrobotny / emeryt)
- Niepełnosprawność (brak / lekki / umiarkowany / znaczny)
- Własność (mieszkanie / dom / wynajem / rodzina)
- Województwo
- Flagi boolean: ciąża, student, emeryt, rolnik, bezrobotny_zarejestrowany

**Krok 3:** Ustawienia powiadomień
- Toggle "Włącz dzienny raport na e-mail" (domyślnie: ON)
- Wybór kategorii RSS (checkboxy: dofinansowania, ZUS, podatki, prawo, inne)

### Ważna uwaga -- CEIDG fix

Istniejący `src/lib/ceidg.ts` nie parsuje `voivodeship` z `firma.adresDzialalnosci.wojewodztwo`. Należy to naprawić w ramach tego wdrożenia.

---

## Baza danych -- nowe tabele Supabase

### Tabela `agent_user_profiles`

```sql
CREATE TABLE agent_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('jdg', 'private')),

  -- JDG only
  nip text,
  company_name text,
  pkd_codes text[],
  company_voivodeship text,
  company_registration_date date,
  company_status text,
  company_size text CHECK (company_size IN ('mikro', 'mala', 'srednia', 'duza')),

  -- Private only
  wiek smallint,
  plec text CHECK (plec IN ('K', 'M')),
  stan_cywilny text,
  liczba_dzieci smallint DEFAULT 0,
  wiek_dzieci smallint[],
  dochod_miesiecznie numeric,
  dochod_na_osobe numeric,
  zatrudnienie text,
  niepelnosprawnosc text DEFAULT 'brak',
  wlasnosc text,
  wojewodztwo text,
  ciaza boolean DEFAULT false,
  student boolean DEFAULT false,
  emeryt boolean DEFAULT false,
  rolnik boolean DEFAULT false,
  bezrobotny_zarejestrowany boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

### Tabela `email_preferences`

```sql
CREATE TABLE email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_enabled boolean DEFAULT true,
  digest_hour smallint DEFAULT 6 CHECK (digest_hour BETWEEN 0 AND 23),
  categories text[] DEFAULT ARRAY['dofinansowania','zus','podatki','prawo'],
  last_digest_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

### Tabela `digest_log`

```sql
CREATE TABLE digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  items_count smallint DEFAULT 0,
  subject text,
  skipped boolean DEFAULT false,
  skip_reason text
);
```

### Istniejące tabele -- reużyte bez zmian

- `company_rss_feeds` -- RSS kanały per user (istniejąca)
- `auth.users` (Supabase) -- konta użytkowników

---

## Architektura techniczna

### Przepływ digestu

```
Vercel Cron: "0 6 * * *"
  -> POST /api/digest
     Header: Authorization: Bearer CRON_SECRET

  -> Pobierz userów: SELECT user_id FROM email_preferences
     WHERE digest_enabled = true

  -> Dla każdego usera równolegle (Promise.allSettled):

     1. Pobierz profil z agent_user_profiles
     2. Pobierz kategorie z email_preferences

     if type = 'jdg':
       - Pobierz RSS items z ostatnich 24h dla kategorii usera
         (company_rss_feeds + domyślne feedy)
       - Filtruj po PKD (jeśli item zawiera kod PKD lub branżę)
       - Max 8 itemów RSS

     if type = 'private':
       - Wywołaj matchBenefits(profile) z src/engine/matcher.ts (potwierdzony export)
       - Porównaj z poprzednim digestem (digest_log) -> tylko NOWE lub ZMIENIONE
       - Pobierz RSS items z ostatnich 24h (prawo, podatki, zus)
       - Max 5 świadczeń + max 5 itemów RSS

     if (rssItems.length === 0 && benefits.length === 0):
       -> skip, zapisz w digest_log (skipped: true, reason: 'no_new_content')
       -> continue

     -> Zbuduj email przez src/lib/digest.ts
     -> Wyślij przez Resend API
     -> Zapisz w digest_log (sent_at, items_count, subject)
     -> UPDATE email_preferences SET last_digest_sent_at = now()
```

### Nowe pliki

| Plik | Opis |
|------|------|
| `src/app/agent/page.tsx` | Landing page /agent |
| `src/app/agent/layout.tsx` | Layout z nawigacją (client, ThemeToggle) |
| `src/app/agent/rejestracja/page.tsx` | Formularz rejestracji 3-krokowy |
| `src/app/agent/logowanie/page.tsx` | Strona logowania |
| `src/app/agent/panel/page.tsx` | Dashboard |
| `src/app/agent/panel/swiadczenia/page.tsx` | Lista dopasowanych świadczeń |
| `src/app/agent/panel/aktualnosci/page.tsx` | RSS + aktualności (wzorowane na /dotacje/panel/aktualnosci) |
| `src/app/agent/panel/powiadomienia/page.tsx` | Ustawienia digestu |
| `src/app/agent/panel/profil/page.tsx` | Edycja profilu |
| `src/app/api/agent/auth/signup/route.ts` | POST -- rejestracja |
| `src/app/api/agent/auth/signin/route.ts` | POST -- logowanie |
| `src/app/api/agent/profile/route.ts` | GET/PUT -- profil |
| `src/app/api/digest/route.ts` | POST -- cron endpoint |
| `src/app/api/digest/preferences/route.ts` | GET/PUT -- ustawienia digestu |
| `src/lib/digest.ts` | Logika budowania digestu (agregacja, filtrowanie, wywołanie matchBenefits) |
| `src/lib/ceidg.ts` | FIX: dodać parsowanie voivodeship |
| `src/emails/digest.html.ts` | Template HTML emaila (plain HTML, bez React Email) |
| `vercel.json` | Dodanie cron entry (plik juz istnieje, ma 2 inne crony) |
| `supabase/migrations/20260518_agent_tables.sql` | 3 nowe tabele |

### Zmienne środowiskowe -- nowe

```
RESEND_API_KEY=re_...
CRON_SECRET=...           # Vercel ustawia automatycznie gdy włączone crons
RESEND_FROM_EMAIL=agent@wezmezadarmo.com
```

---

## Template e-maila

**Subject:** `Agent znalazł {N} nowych rzeczy dla Ciebie -- {DD.MM.YYYY}`

**Struktura HTML:**

```
[NAGŁÓWEK]
wezmezadarmo.com / Twój agent AI
{DD MMMM YYYY}

[SEKCJA: ŚWIADCZENIA] (tylko dla osób prywatnych, tylko gdy nowe)
"Przysługuje Ci:"
- Świadczenie wychowawcze 800+ / 800 PLN/mies. / [Złóż wniosek ->]
- Dofinansowanie do żłobka / do 1900 PLN/mies. / [Złóż wniosek ->]

[SEKCJA: ZMIANY W PRAWIE / AKTUALNOŚCI]
"Co się zmieniło:"
- [Tytuł artykułu RSS] -- [źródło] / [Czytaj ->]
  (max 5-8 itemów)

[SEKCJA: DLA JDG] (zamiast świadczeń)
"Dla Twojej firmy:"
- [Nabór/zmiana pasująca do PKD] / [Szczegóły ->]

[STOPKA]
[Zarządzaj ustawieniami] [Wypisz się]
Dane przetwarzamy zgodnie z RODO. Profil przechowywany w zaszyfrowanej bazie.
Ten e-mail nie zawiera Twoich danych osobowych.
```

**Zasada:** Zero danych wrażliwych w treści maila. Kwoty świadczeń to informacja publiczna (gov.pl). Linki "Złóż wniosek" przenoszą do zalogowanego panelu.

---

## Domyślne kanały RSS (do dodania dla JDG i prywatnych)

| URL | Kategoria | Dla kogo |
|-----|-----------|----------|
| `https://www.zus.pl/rss` | zus | JDG + prywatni |
| `https://www.podatki.gov.pl/rss` | podatki | JDG + prywatni |
| `https://www.gov.pl/rss/rodzina` | prawo | prywatni |
| `https://www.parp.gov.pl/rss` | dofinansowania | JDG |
| `https://fundusze.mpit.gov.pl/rss` | dofinansowania | JDG |

Uwaga: należy zweryfikować czy te URL-e RSS faktycznie działają przed wdrożeniem.

---

## Bezpieczeństwo

- Endpoint `/api/digest` wymaga nagłówka `Authorization: Bearer CRON_SECRET` -- odrzuca 401 bez niego
- Profil użytkownika dostępny tylko przez authenticated API (`getSession()` z Supabase)
- E-mail nie zawiera danych wrażliwych -- tylko publiczne nazwy świadczeń i tytuły RSS
- Dane profilu przechowywane w Supabase (szyfrowanie at-rest)
- Link "Wypisz się" ustawia `digest_enabled = false` w `email_preferences`
- Brak PESEL w systemie -- zgodność z RODO

---

## Co jest poza scope MVP

- Reply-to-email (odpowiedzi użytkownika przez e-mail) -- faza 2
- Świadczenia dla JDG (teraz tylko RSS + dofinansowania) -- faza 2
- Konfigurowalny czas wysyłki per user -- faza 2
- Push notifications / SMS -- faza 3
- Pełny agent chat w panelu (jak w /dotacje/panel/agent) -- faza 3

---

## Metryki sukcesu MVP

- Użytkownik rejestruje się i dostaje pierwszy digest w ciągu 24h
- Open rate > 30% (branżowa norma dla transactional email)
- Mniej niż 1% unsubscribe po pierwszym miesiącu
- Zero incydentów z danymi wrażliwymi w treści maili
