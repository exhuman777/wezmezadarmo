# PLAN: /dotacje -- B2B Grants SaaS MVP

**Data:** 2026-05-17
**Route:** `/dotacje` (subdirectory, nie subdomain -- zero DNS overhead)
**Cena:** 25 PLN/mies., 7 dni trial, Stripe
**Stack delta:** dodajemy `next-auth` + `@supabase/supabase-js` + `stripe` + `resend`

---

## KROK 1 -- Nowe zaleznosci

```bash
npm install next-auth @supabase/supabase-js stripe resend
```

Env vars do dodania w `.env.local` i Vercel:
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://wezmezadarmo.com
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=          # 25 PLN/mies recurring
RESEND_API_KEY=
```

---

## KROK 2 -- Supabase schema

```sql
-- Uruchom w Supabase SQL editor

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  stripe_customer_id text,
  subscription_status text default 'trial', -- trial | active | inactive
  trial_ends_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

create table company_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  nip text not null,
  name text not null,
  pkd_codes text[] default '{}',
  voivodeship text not null,
  size text not null, -- micro | small | medium | large
  employee_count_range text, -- '1-9' | '10-49' | '50-249' | '250+'
  flags jsonb default '{}',
  -- flags: { zatrudnia_niepelnosprawnych, planuje_szkolenia, chce_zatrudnic_bezrobotnych,
  --          startup, sektor: produkcja|usluga|handel|it|rolnictwo }
  updated_at timestamptz default now()
);

create table monitoring_prefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  program_ids text[] default '{}',
  created_at timestamptz default now(),
  unique(user_id)
);

create table notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  program_id text not null,
  sent_at timestamptz default now()
);
```

---

## KROK 3 -- Program registry (statyczny plik, aktualizowany recznie)

**Plik:** `src/data/programs-b2b.ts`

Struktura jednego programu:
```ts
{
  id: 'kfs-2026',
  name: 'KFS -- Krajowy Fundusz Szkoleniowy',
  institution: 'PUP',
  category: 'kfs' | 'pup' | 'pfron' | 'kpo' | 'samorzad' | 'nfz' | 'parp',
  status: 'open' | 'closed' | 'expected',
  openDate: '2026-03-01',
  closeDate: '2026-06-30',
  nextOpenExpected: '2026-10-01',
  maxAmountPLN: 300000,         // null jesli procent
  maxAmountDesc: '80% kosztow szkolenia, max 300% minwage/pracownik',
  eligibilityFlags: ['planuje_szkolenia'],  // ktore flagi profilu pasuja
  voivodeships: ['all'],
  url: 'https://psz.praca.gov.pl/...',
  lastVerified: '2026-05-15',
}
```

Startowy zestaw (~15 programow): KFS, PUP-refundacja stanowiska, PUP-doposazenie,
PUP-staze, PFRON-SOD, PFRON-PFRON-art26e, KPO-A2.1-cyfryzacja, KPO-A1-szkolenia,
PARP-innowacje, FENG-MMP, samorzad-mazowieckie, samorzad-slaskie, NFZ-profilaktyka,
ARiMR-rolnicy (dla kompletnosci), NCBR-badania.

---

## KROK 4 -- Kolejnosc tworzenia plikow

### 4a. Auth (NextAuth email+password)
```
src/app/api/dotacje/auth/[...nextauth]/route.ts
```
Credentials provider -- bcrypt hash w Supabase. Session zawiera `userId`, `subscriptionStatus`.

### 4b. Middleware -- ochrona panelu
```
src/middleware.ts   (lub rozszerzyc istniejacy)
```
Matcher: `/dotacje/panel/:path*` -- redirect do `/dotacje/logowanie` bez sesji.
Jesli `subscriptionStatus === 'inactive'` -- redirect do `/dotacje/panel/subskrypcja`.

### 4c. Strony (kolejnosc budowania)

| Krok | Plik | Co robi |
|------|------|---------|
| 1 | `src/app/dotacje/page.tsx` | Landing -- statyczna, bez auth |
| 2 | `src/app/dotacje/rejestracja/page.tsx` | 3-step onboarding form |
| 3 | `src/app/dotacje/logowanie/page.tsx` | Login form |
| 4 | `src/app/dotacje/panel/page.tsx` | Dashboard -- podsumowanie firmy + quick actions |
| 5 | `src/app/dotacje/panel/agent/page.tsx` | Chat z agentem (reuse ChatWindow.tsx) |
| 6 | `src/app/dotacje/panel/monitoring/page.tsx` | Checkboxy kategorii |
| 7 | `src/app/dotacje/panel/subskrypcja/page.tsx` | Status subskrypcji + Stripe portal link |
| 8 | `src/app/dotacje/regulamin/page.tsx` | TOS B2B |
| 9 | `src/app/dotacje/polityka-ai/page.tsx` | AI transparency notice |

### 4d. API routes

| Plik | Metoda | Robi |
|------|--------|------|
| `api/dotacje/company/route.ts` | POST/PUT | Zapisz/aktualizuj profil firmy w Supabase |
| `api/dotacje/chat/route.ts` | POST | Fork api/chat z injektem kontekstu firmy |
| `api/dotacje/monitoring/route.ts` | GET/POST | Pobierz/zapisz prefs monitoringu |
| `api/dotacje/stripe/checkout/route.ts` | POST | Stworz Stripe Checkout Session |
| `api/dotacje/stripe/webhook/route.ts` | POST | Obsluz subscription.updated/deleted |
| `api/dotacje/cron/weekly-check/route.ts` | GET | Cron -- sprawdz programy, wyslij alerty |

### 4e. Lib utils
```
src/lib/dotacje/companyContext.ts    -- buduje system prompt z profilu firmy
src/lib/dotacje/programMatcher.ts   -- dopasuje flagi do listy programs-b2b.ts
src/lib/dotacje/emailAlerts.ts      -- wrapper Resend dla alert emaili
```

---

## KROK 5 -- Agent chat (kluczowa logika)

**`src/lib/dotacje/companyContext.ts`** buduje:
```
Firma: {name}, NIP: {nip}
PKD: {pkd_codes}
Wojewodztwo: {voivodeship}
Wielkosc: {size}, Zatrudnienie: {employee_count_range}
Profil dotacyjny: {flags as readable list}
Pasujace programy (wstepna analiza): {matched program names}

ZASADY:
- Specjalizujesz sie w dofinansowaniach B2B w Polsce (KFS, PUP dla pracodawcow,
  PFRON, KPO, programy samorzadowe, PARP, FENG). NIE obejmujesz przetargow.
- Zawsze podaj zrodlo/podstawe prawna gdy znasz
- Nigdy nie gwarantuj przyznania -- uzywaj "mozesz sie ubiegac", "spelniasz kryteria"
- Jesli nie masz pewnosci co do aktualnosci danych -- powiedz o tym wyraznie
- Kazda odpowiedz konczy sie: "Stan wiedzy: maj 2026. Weryfikuj aktualne terminy na psz.praca.gov.pl"
```

**Rate limit:** zastapiony sprawdzeniem `subscriptionStatus` z sesji NextAuth.

---

## KROK 6 -- Monitoring (Vercel Cron)

`vercel.json`:
```json
{
  "crons": [{
    "path": "/api/dotacje/cron/weekly-check",
    "schedule": "0 8 * * 1"
  }]
}
```

Logika crona:
1. Pobierz wszystkich userow z `subscription_status = 'active'` i ich `monitoring_prefs`
2. Dla kazdego usera -- sprawdz czy jakis program z jego listy zmienil status na `'open'` od ostatniego `notification_log`
3. Jesli tak -- wyslij email przez Resend, zapisz w `notification_log`
4. Prosta deduplikacja: jeden email per program per user per otwarty nabor

Email template (plain, po polsku):
```
Temat: Nowy nabor: {program.name}

Wykryto nowy otwarty nabor dla programu, ktory obserwujesz:

Program: {name}
Instytucja: {institution}
Status: Otwarty nabor
Termin: {openDate} -- {closeDate}
Kwota max: {maxAmountDesc}
Zrodlo: {url}

Zaloguj sie, zeby omowic z agentem: https://wezmezadarmo.com/dotacje/panel/agent

--
wezmezadarmo.com | Wypisz sie: [link]
Informacje maja charakter orientacyjny. Decyzja nalezy do instytucji.
```

---

## KROK 7 -- Stripe flow

1. User klika "Subskrybuj" w `/panel/subskrypcja`
2. POST `/api/dotacje/stripe/checkout` -- tworzy Checkout Session z `trial_period_days: 7`
3. Redirect na Stripe hosted checkout
4. Po sukcesie -- redirect na `/dotacje/panel?success=1`
5. Webhook `customer.subscription.updated` -- aktualizuje `subscription_status` w Supabase
6. Webhook `customer.subscription.deleted` -- ustawia `inactive`, panel zablokowany

---

## KROK 8 -- GDPR/RODO checklist

- [ ] TOS B2B na `/dotacje/regulamin` -- podstawa prawna: wykonanie umowy (art.6 ust.1 lit.b)
- [ ] Polityka AI na `/dotacje/polityka-ai` -- EU AI Act Art.52 (obowiazek przejrzystosci)
- [ ] Przycisk "Usun konto" w `/panel/subskrypcja` -- hard delete wszystkich rekordow + cancel Stripe sub
- [ ] Eksport danych JSON -- SELECT * z profilu + monitoring prefs
- [ ] Formularz rejestracji: checkbox "Akceptuje regulamin i polityka prywatnosci" -- required
- [ ] Cookie notice update -- dodac wzmiankeo Stripe (functional cookie)
- [ ] DPA: Supabase (auto), Stripe (podpisac w dashboard), Resend (podpisac w dashboard)
- [ ] Zadne dane osobowe pracownikow nie sa zbierane -- tylko profil firmy
- [ ] Agent nigdy nie mowi "otrzymasz" -- tylko "mozesz sie ubiegac"
- [ ] Disclaimer w kazdej odpowiedzi agenta o orientacyjnym charakterze info

---

## KROK 9 -- Landing page copy (kluczowe sekcje)

**Hero:**
> Dotacje dla Twojej firmy -- bez przegapiania naborow.
> AI agent dopasowany do profilu Twojej firmy. Monitoruje KFS, PUP, PFRON, KPO i programy samorzadowe. Powiadamia kiedy pojawi sie nowy nabor.
> 25 PLN miesiecznie. Pierwszy tydzien gratis.

**3 kolumny wartosci:**
1. Agent zna Twoja firme -- NIP, PKD, wielkosc, wojewodztwo. Odpowiada na pytania o konkretne programy.
2. Monitoring 24/7 -- wybierz kategorie, dostaj email gdy otworzy sie nowy nabor.
3. Tylko publiczne programy wsparcia -- KFS, PUP, PFRON, KPO, samorzady. Nie przetargi.

**Disclaimer (obowiazkowy):**
> Agent AI ma charakter informacyjny. Nie gwarantujemy przyznania dofinansowania. Decyzja nalezy wylacznie do instytucji. Informacje weryfikuj bezposrednio w urzedzie.

---

## Ryzyka i gotchas

| Ryzyko | Mitygacja |
|--------|-----------|
| CEIDG API moze nie zwrocic PKD dla wszystkich NIP | Fallback -- reczne wpisanie PKD, pole optional |
| Vercel Cron free tier: 1 req/dzien | Wystarczy -- cron raz w tygodniu |
| Stripe PLN -- trzeba zweryfikowac konto Stripe na PLN | Sprawdz przed wdrozeniem |
| NextAuth + Next.js 16 -- sprawdz kompatybilnosc wersji | Uzyj `next-auth@5` (beta) jesli Next 16 wymaga |
| programs-b2b.ts dezaktualizuje sie | Dodac `lastVerified` do kazdego programu, cron ostrzega gdy >30 dni bez update |
| Middleware conflict z istniejacym apiAuth.ts | Middleware tylko dla /dotacje/panel -- brak konfliktu |

---

## Co NIE wchodzi do MVP

- Generowanie wnioskow PDF (to robi /wnioski)
- Scraping rzadowych stron
- Panel admina
- Multi-user per firma
- OAuth (Google/LinkedIn)
- SMS/push
- Porownywarka programow
- KPO tender tracking (przetargi -- out of scope)
