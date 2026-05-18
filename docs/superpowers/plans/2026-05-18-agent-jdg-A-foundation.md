# Agent JDG/Prywatny -- Plan A: Fundament (DB + Auth + API)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baza danych, naprawa CEIDG, endpointy auth i profilu dla modulu /agent.

**Architecture:** Supabase auth (admin SDK po stronie serwera) + 3 nowe tabele + Resend zainstalowany. Caly backend gotowy przed budowa UI.

**Tech Stack:** Next.js 15, Supabase (supabase-js), Resend, TypeScript strict

**Spec:** `docs/superpowers/specs/2026-05-18-agent-jdg-prywatny-design.md`

---

### Task 1: Napraw parsowanie voivodeship w CEIDG

**Files:**
- Modify: `src/lib/ceidg.ts`
- Create: `src/lib/__tests__/ceidg.test.ts`

- [ ] **Krok 1: Napisz test (powinien nie przejsc)**

```typescript
// src/lib/__tests__/ceidg.test.ts
import { parseCeidgResponse, validateNip } from '../ceidg';

describe('parseCeidgResponse', () => {
  it('parsuje wojewodztwo z adresDzialalnosci', () => {
    const raw = {
      firma: [{
        nazwa: 'Jan Kowalski',
        status: 'AKTYWNY',
        pkd: [{ kod: '62.01.Z' }],
        dataRozpoczeciaDzialalnosci: '2020-01-15',
        dataZawieszeniaDzialalnosci: null,
        dataZakonczeniaDzialalnosci: null,
        adresDzialalnosci: { wojewodztwo: 'MAZOWIECKIE' },
      }],
    };
    const result = parseCeidgResponse(raw);
    expect(result.wojewodztwo).toBe('mazowieckie');
    expect(result.nazwa).toBe('Jan Kowalski');
    expect(result.pkd).toEqual(['62.01.Z']);
  });

  it('zwraca null gdy brak adresu', () => {
    const raw = { firma: [{ nazwa: 'Test', status: 'AKTYWNY', pkd: [] }] };
    const result = parseCeidgResponse(raw);
    expect(result.wojewodztwo).toBeNull();
  });

  it('zwraca pusty obiekt gdy brak firmy', () => {
    const result = parseCeidgResponse({});
    expect(result.aktywna).toBe(false);
    expect(result.wojewodztwo).toBeNull();
  });
});

describe('validateNip', () => {
  it('waliduje poprawny NIP', () => {
    expect(validateNip('5260250274')).toBe(true);
  });
  it('odrzuca NIP z litera', () => {
    expect(validateNip('526025027X')).toBe(false);
  });
});
```

- [ ] **Krok 2: Uruchom test -- powinien FAIL**

```bash
npx jest src/lib/__tests__/ceidg.test.ts --no-coverage
```

Oczekiwany wynik: `TypeError: result.wojewodztwo is not defined` lub property missing.

- [ ] **Krok 3: Zaktualizuj src/lib/ceidg.ts**

```typescript
export interface CeidgBusinessData {
  aktywna: boolean;
  nazwa: string | null;
  dataRejestracji: string | null;
  dataZawieszenia: string | null;
  dataZakonczenia: string | null;
  pkd: string[];
  status: string | null;
  wojewodztwo: string | null;   // NOWE
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCeidgResponse(data: any): CeidgBusinessData {
  const firma = data?.firma?.[0];
  if (!firma) {
    return {
      aktywna: false, nazwa: null, dataRejestracji: null,
      dataZawieszenia: null, dataZakonczenia: null,
      pkd: [], status: null, wojewodztwo: null,
    };
  }
  const woj = firma.adresDzialalnosci?.wojewodztwo;
  return {
    aktywna: firma.status === 'AKTYWNY' && !firma.dataZakonczeniaDzialalnosci,
    nazwa: firma.nazwa ?? null,
    dataRejestracji: firma.dataRozpoczeciaDzialalnosci ?? null,
    dataZawieszenia: firma.dataZawieszeniaDzialalnosci ?? null,
    dataZakonczenia: firma.dataZakonczeniaDzialalnosci ?? null,
    pkd: (firma.pkd ?? []).map((p: { kod: string }) => p.kod),
    status: firma.status ?? null,
    wojewodztwo: typeof woj === 'string' && woj ? woj.toLowerCase() : null,
  };
}

// lookupNip pozostaje bez zmian
```

- [ ] **Krok 4: Uruchom test -- powinien PASS**

```bash
npx jest src/lib/__tests__/ceidg.test.ts --no-coverage
```

Oczekiwany wynik: `4 passed`.

- [ ] **Krok 5: Sprawdz TypeScript**

```bash
npx tsc --noEmit
```

Oczekiwany wynik: brak bledow.

- [ ] **Krok 6: Commit**

```bash
git add src/lib/ceidg.ts src/lib/__tests__/ceidg.test.ts
git commit -m "fix: ceidg parsuje wojewodztwo z adresDzialalnosci"
```

---

### Task 2: Migracja bazy danych -- 3 nowe tabele

**Files:**
- Create: `supabase/migrations/20260518000000_agent_tables.sql`

- [ ] **Krok 1: Sprawdz czy katalog migracji istnieje**

```bash
ls supabase/migrations/ | tail -3
```

Jesli nie istnieje: `mkdir -p supabase/migrations`.

- [ ] **Krok 2: Utworz plik migracji**

```sql
-- supabase/migrations/20260518000000_agent_tables.sql

-- Profil uzytkownika (JDG lub osoba prywatna)
CREATE TABLE IF NOT EXISTS agent_user_profiles (
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
  wiek_dzieci smallint[] DEFAULT '{}',
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

-- Preferencje e-mail
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_enabled boolean DEFAULT true,
  digest_hour smallint DEFAULT 6 CHECK (digest_hour BETWEEN 0 AND 23),
  categories text[] DEFAULT ARRAY['dofinansowania','zus','podatki','prawo'],
  last_digest_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Log wyslanych digestow
CREATE TABLE IF NOT EXISTS digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  items_count smallint DEFAULT 0,
  subject text,
  skipped boolean DEFAULT false,
  skip_reason text
);

-- RLS
ALTER TABLE agent_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_profile_owner" ON agent_user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "email_pref_owner" ON email_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "digest_log_read" ON digest_log
  FOR SELECT USING (auth.uid() = user_id);

-- Service role omija RLS (cron digest potrzebuje dostep do wszystkich uzytkownikow)
CREATE POLICY "digest_log_service_insert" ON digest_log
  FOR INSERT WITH CHECK (true);
```

- [ ] **Krok 3: Zastosuj migracje przez Supabase Dashboard**

Wklej SQL do Supabase Dashboard -> SQL Editor -> Run.
Sprawdz: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'agent%' OR table_name LIKE 'email%' OR table_name LIKE 'digest%';`

Oczekiwany wynik: 3 tabele widoczne.

- [ ] **Krok 4: Commit pliku migracji**

```bash
git add supabase/migrations/20260518000000_agent_tables.sql
git commit -m "feat: migracja agent_user_profiles, email_preferences, digest_log"
```

---

### Task 3: Instalacja Resend

**Files:**
- Modify: `package.json` (przez npm)
- Modify: `.env.local` (manual)

- [ ] **Krok 1: Sprawdz czy Resend juz zainstalowany**

```bash
npm list resend 2>/dev/null && echo "zainstalowany" || echo "brak"
```

- [ ] **Krok 2: Zainstaluj jesli brak**

```bash
npm install resend
```

- [ ] **Krok 3: Dodaj zmienne do .env.local**

```bash
# Dodaj do .env.local (NEVER commit tego pliku)
RESEND_API_KEY=re_TWOJ_KLUCZ
RESEND_FROM_EMAIL=agent@wezmezadarmo.com
CRON_SECRET=wygeneruj_losowy_string_32_znaki
```

Wygeneruj CRON_SECRET: `openssl rand -hex 16`

- [ ] **Krok 4: Dodaj do Vercel environment variables**

W Vercel Dashboard -> Settings -> Environment Variables dodaj:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`

- [ ] **Krok 5: Commit package.json i package-lock.json**

```bash
git add package.json package-lock.json
git commit -m "feat: instalacja resend"
```

---

### Task 4: Agent signup API

**Files:**
- Create: `src/app/api/agent/auth/signup/route.ts`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/api/agent/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  let body: {
    email?: unknown;
    password?: unknown;
    profile?: Record<string, unknown>;
    emailPreferences?: { digest_enabled?: boolean; categories?: string[] };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowy format zadania.' }, { status: 400 });
  }

  const { email, password, profile, emailPreferences } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Podaj prawidlowy adres e-mail.' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Haslo musi miec co najmniej 8 znakow.' }, { status: 400 });
  }
  if (!profile || !['jdg', 'private'].includes(profile.type as string)) {
    return NextResponse.json({ error: 'Typ konta (jdg lub private) jest wymagany.' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Konto z tym adresem e-mail juz istnieje.' }, { status: 409 });
    }
    console.error('[agent/signup] auth error:', authError);
    return NextResponse.json({ error: 'Blad tworzenia konta.' }, { status: 500 });
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from('agent_user_profiles')
    .insert(buildProfileInsert(userId, profile));

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error('[agent/signup] profile error:', profileError);
    return NextResponse.json({ error: 'Blad zapisu profilu.' }, { status: 500 });
  }

  await supabaseAdmin
    .from('email_preferences')
    .insert({
      user_id: userId,
      digest_enabled: emailPreferences?.digest_enabled ?? true,
      categories: emailPreferences?.categories ?? ['dofinansowania', 'zus', 'podatki', 'prawo'],
    });

  return NextResponse.json({ success: true }, { status: 201 });
}

function buildProfileInsert(userId: string, profile: Record<string, unknown>) {
  if (profile.type === 'jdg') {
    return {
      user_id: userId,
      type: 'jdg' as const,
      nip: profile.nip ?? null,
      company_name: profile.company_name ?? null,
      pkd_codes: profile.pkd_codes ?? [],
      company_voivodeship: profile.company_voivodeship ?? null,
      company_registration_date: profile.company_registration_date ?? null,
      company_status: profile.company_status ?? null,
      company_size: profile.company_size ?? null,
    };
  }
  return {
    user_id: userId,
    type: 'private' as const,
    wiek: profile.wiek ?? null,
    plec: profile.plec ?? null,
    stan_cywilny: profile.stan_cywilny ?? null,
    liczba_dzieci: (profile.liczba_dzieci as number) ?? 0,
    wiek_dzieci: (profile.wiek_dzieci as number[]) ?? [],
    dochod_miesiecznie: profile.dochod_miesiecznie ?? null,
    dochod_na_osobe: profile.dochod_na_osobe ?? null,
    zatrudnienie: profile.zatrudnienie ?? null,
    niepelnosprawnosc: profile.niepelnosprawnosc ?? 'brak',
    wlasnosc: profile.wlasnosc ?? null,
    wojewodztwo: profile.wojewodztwo ?? null,
    ciaza: profile.ciaza ?? false,
    student: profile.student ?? false,
    emeryt: profile.emeryt ?? false,
    rolnik: profile.rolnik ?? false,
    bezrobotny_zarejestrowany: profile.bezrobotny_zarejestrowany ?? false,
  };
}
```

- [ ] **Krok 2: Sprawdz TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Krok 3: Commit**

```bash
git add src/app/api/agent/auth/signup/route.ts
git commit -m "feat: agent signup API -- JDG i osoba prywatna"
```

---

### Task 5: Agent signin API

**Files:**
- Create: `src/app/api/agent/auth/signin/route.ts`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/api/agent/auth/signin/route.ts
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowy format.' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Email i haslo sa wymagane.' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return NextResponse.json({ error: 'Nieprawidlowy email lub haslo.' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Krok 2: Sprawdz TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/api/agent/auth/signin/route.ts
git commit -m "feat: agent signin API"
```

---

### Task 6: Profile API (GET/PUT)

**Files:**
- Create: `src/app/api/agent/profile/route.ts`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/api/agent/profile/route.ts
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  const { data, error } = await supabase
    .from('agent_user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Profil nie znaleziony.' }, { status: 404 });
  }
  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowy format.' }, { status: 400 });
  }

  // Zabraniam zmiany type i user_id
  const { type: _type, user_id: _uid, id: _id, created_at: _ca, ...updateData } = body;

  const { data, error } = await supabase
    .from('agent_user_profiles')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('[agent/profile PUT]', error);
    return NextResponse.json({ error: 'Blad aktualizacji profilu.' }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/api/agent/profile/route.ts
git commit -m "feat: agent profile API GET/PUT"
```

---

### Task 7: Digest preferences API (GET/PUT)

**Files:**
- Create: `src/app/api/digest/preferences/route.ts`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/api/digest/preferences/route.ts
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  const { data, error } = await supabase
    .from('email_preferences')
    .select('digest_enabled, digest_hour, categories, last_digest_sent_at')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    // Zwroc domyslne jesli brak rekordu
    return NextResponse.json({
      prefs: { digest_enabled: false, digest_hour: 6, categories: [], last_digest_sent_at: null }
    });
  }
  return NextResponse.json({ prefs: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  let body: { digest_enabled?: boolean; categories?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowy format.' }, { status: 400 });
  }

  const allowed = ['dofinansowania', 'zus', 'podatki', 'prawo', 'inne'];
  const update: Record<string, unknown> = {};
  if (typeof body.digest_enabled === 'boolean') update.digest_enabled = body.digest_enabled;
  if (Array.isArray(body.categories)) {
    update.categories = body.categories.filter(c => allowed.includes(c));
  }

  const { error } = await supabase
    .from('email_preferences')
    .upsert({ user_id: session.user.id, ...update }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: 'Blad zapisu preferencji.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/api/digest/preferences/route.ts
git commit -m "feat: digest preferences API GET/PUT"
```

---

## Weryfikacja planu A

Po wszystkich 7 taskach sprawdz:

```bash
npx tsc --noEmit
npx jest src/lib/__tests__/ceidg.test.ts --no-coverage
git log --oneline -7
```

Oczekiwany wynik: 0 bledow TypeScript, testy PASS, 7 commitow widocznych.

Przejdz do Planu B: `docs/superpowers/plans/2026-05-18-agent-jdg-B-panel-ui.md`
