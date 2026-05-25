# Part A: Foundation + Backend
## Tasks 1-6: Bootstrap, DB, Auth, Agents, Chat API

**Project:** Cyfrowy Pomocnik — `/Users/trading/cyfrowy-pomocnik/`
**Scope:** New standalone Next.js 16 project, separate repo, shared Supabase instance (tables prefixed `cp_*`)

---

### Task 1: Bootstrap Project

**Files:**
- Create: `cyfrowy-pomocnik/` (new repo via create-next-app)
- Create: `.env.local.example`
- Modify: `next.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Scaffold project**

```bash
cd /Users/trading
npx create-next-app@16.2.6 cyfrowy-pomocnik \
  --typescript \
  --app \
  --no-tailwind \
  --src-dir \
  --import-alias "@/*" \
  --no-git
cd cyfrowy-pomocnik
git init && git add -A && git commit -m "chore: initial scaffold"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js openai
npm install --save-dev @types/node
```

- [ ] **Step 3: Create `.env.local.example`**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
OPENROUTER_API_KEY=sk-or-YOUR_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.local` and fill in real values (never commit `.env.local`).

- [ ] **Step 4: Write `next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  images: {
    remotePatterns: [],
  },
};

export default config;
```

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add next.config.ts tsconfig.json .env.local.example && \
git commit -m "chore: config, tsconfig strict, env template"
```

---

### Task 2: DB Migration

**Scope:** Run SQL in Supabase SQL editor once. No files to create — SQL shown here for reference and audit.

- [ ] **Step 1: Run migration in Supabase SQL editor**

Open: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

Paste and run the entire block below:

```sql
CREATE TABLE IF NOT EXISTS cp_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nip TEXT,
  branza TEXT NOT NULL,
  opis TEXT,
  pain_points TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS cp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL DEFAULT 'ag-00',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES cp_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cp_news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  relevance_tags TEXT[],
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cp_news_user_scraped ON cp_news_items(user_id, scraped_at DESC);

CREATE TABLE IF NOT EXISTS cp_daily_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  summary_text TEXT
);

CREATE TABLE IF NOT EXISTS cp_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES cp_daily_briefs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('urgent', 'warn', 'info', 'running')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cp_actions_user_status ON cp_action_items(user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS cp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cp_reminders_user_due ON cp_reminders(user_id, due_date ASC);

-- RLS
ALTER TABLE cp_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_daily_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_companies_owner" ON cp_companies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cp_conversations_owner" ON cp_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cp_messages_owner" ON cp_messages FOR ALL USING (
  conversation_id IN (SELECT id FROM cp_conversations WHERE user_id = auth.uid())
);
CREATE POLICY "cp_news_owner" ON cp_news_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cp_briefs_owner" ON cp_daily_briefs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cp_actions_owner" ON cp_action_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cp_reminders_owner" ON cp_reminders FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 2: Verify tables exist**

Run this query in the SQL editor — expect 7 rows:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'cp_%'
ORDER BY table_name;
```

Expected output:
```
cp_action_items
cp_companies
cp_conversations
cp_daily_briefs
cp_messages
cp_news_items
cp_reminders
```

---

### Task 3: Supabase Client + Auth Lib + Middleware

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/ai.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Write `src/lib/supabase.ts`**

```typescript
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

export function createSupabaseBrowser() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Write `src/lib/auth.ts`**

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Returns the current session on the server, or null if unauthenticated.
 * Use in Server Components and API routes.
 */
export async function getSessionOrNull(): Promise<Session | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Returns the user_id from current session, or null.
 */
export async function getUserIdOrNull(): Promise<string | null> {
  const session = await getSessionOrNull();
  return session?.user.id ?? null;
}
```

- [ ] **Step 3: Write `src/lib/ai.ts`**

```typescript
import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://cyfrowypomocnik.pl',
        'X-Title': 'Cyfrowy Pomocnik',
      },
    });
  }
  return _client;
}

export const MODEL = 'google/gemini-2.0-flash-001';

export function getAI(): OpenAI {
  return getClient();
}
```

- [ ] **Step 4: Write `src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (required by @supabase/ssr)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Protect /panel/* routes — redirect to /logowanie if not authenticated
  if (pathname.startsWith('/panel') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/logowanie';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/logowanie' || pathname === '/rejestracja') && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/panel';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.ts src/lib/auth.ts src/lib/ai.ts src/middleware.ts && \
git commit -m "feat: supabase client, auth helpers, openrouter, middleware"
```

---

### Task 4: Auth API Routes

**Files:**
- Create: `src/app/api/auth/signin/route.ts`
- Create: `src/app/api/auth/signup/route.ts`
- Create: `src/app/api/auth/signout/route.ts`

- [ ] **Step 1: Write `src/app/api/auth/signin/route.ts`**

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Brak adresu e-mail lub hasła.' },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
```

- [ ] **Step 2: Write `src/app/api/auth/signup/route.ts`**

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Brak adresu e-mail lub hasła.' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Hasło musi mieć co najmniej 8 znaków.' },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
```

- [ ] **Step 3: Write `src/app/api/auth/signout/route.ts`**

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Write `src/app/auth/callback/route.ts`** (required for email confirmation flow)

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/panel';

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/logowanie?error=auth_callback_failed`);
}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/ src/app/auth/ && \
git commit -m "feat: auth API routes (signin, signup, signout, callback)"
```

---

### Task 5: Agent System

**Files:**
- Create: `src/agents/types.ts`
- Create: `src/agents/registry.ts`
- Create: `src/agents/router.ts`
- Create: `src/agents/ag-00-ogolny/agent.md`
- Create: `src/agents/ag-00-ogolny/knowledge.md`
- Create: `src/agents/ag-00-ogolny/keywords.json`
- Create: `src/agents/ag-01-faktury/agent.md`
- Create: `src/agents/ag-01-faktury/knowledge.md`
- Create: `src/agents/ag-01-faktury/keywords.json`
- Create: `src/agents/ag-02-marketing/agent.md`
- Create: `src/agents/ag-02-marketing/knowledge.md`
- Create: `src/agents/ag-02-marketing/keywords.json`
- Create: `src/agents/ag-03-terminarz/agent.md`
- Create: `src/agents/ag-03-terminarz/knowledge.md`
- Create: `src/agents/ag-03-terminarz/keywords.json`
- Create: `src/agents/ag-04-dotacje/agent.md`
- Create: `src/agents/ag-04-dotacje/knowledge.md`
- Create: `src/agents/ag-04-dotacje/keywords.json`
- Create: `src/agents/ag-05-swiadczenia/agent.md`
- Create: `src/agents/ag-05-swiadczenia/knowledge.md`
- Create: `src/agents/ag-05-swiadczenia/keywords.json`
- Create: `src/agents/ag-06-prawo/agent.md`
- Create: `src/agents/ag-06-prawo/knowledge.md`
- Create: `src/agents/ag-06-prawo/keywords.json`

- [ ] **Step 1: Write `src/agents/types.ts`**

```typescript
export const AGENT_IDS = [
  'ag-00',
  'ag-01',
  'ag-02',
  'ag-03',
  'ag-04',
  'ag-05',
  'ag-06',
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export interface AgentConfig {
  id: AgentId;
  label: string;
  keywords: string[];
  agentPrompt: string;
  knowledge: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompanyContext {
  name: string;
  branza: string;
  opis: string | null;
  pain_points: string | null;
}
```

- [ ] **Step 2: Write `src/agents/registry.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import type { AgentConfig, AgentId, CompanyContext } from './types';

const AGENTS_DIR = path.join(process.cwd(), 'src', 'agents');

const AGENT_FOLDERS: Record<AgentId, string> = {
  'ag-00': 'ag-00-ogolny',
  'ag-01': 'ag-01-faktury',
  'ag-02': 'ag-02-marketing',
  'ag-03': 'ag-03-terminarz',
  'ag-04': 'ag-04-dotacje',
  'ag-05': 'ag-05-swiadczenia',
  'ag-06': 'ag-06-prawo',
};

const AGENT_LABELS: Record<AgentId, string> = {
  'ag-00': 'Ogólny',
  'ag-01': 'Faktury i płatności',
  'ag-02': 'Marketing',
  'ag-03': 'Terminarz i umowy',
  'ag-04': 'Dotacje i dofinansowania',
  'ag-05': 'Świadczenia ZUS',
  'ag-06': 'Prawo i podatki',
};

// In-memory cache — populated once per process lifetime
const cache = new Map<AgentId, AgentConfig>();

function loadAgent(id: AgentId): AgentConfig {
  if (cache.has(id)) return cache.get(id)!;

  const folder = AGENT_FOLDERS[id];
  const base = path.join(AGENTS_DIR, folder);

  const agentPrompt = fs.readFileSync(path.join(base, 'agent.md'), 'utf-8');
  const knowledge = fs.readFileSync(path.join(base, 'knowledge.md'), 'utf-8');
  const keywords: string[] = JSON.parse(
    fs.readFileSync(path.join(base, 'keywords.json'), 'utf-8')
  );

  const config: AgentConfig = {
    id,
    label: AGENT_LABELS[id],
    keywords,
    agentPrompt,
    knowledge,
  };
  cache.set(id, config);
  return config;
}

export function getAgent(id: AgentId): AgentConfig {
  return loadAgent(id);
}

export function getAllAgents(): AgentConfig[] {
  return (Object.keys(AGENT_FOLDERS) as AgentId[]).map(loadAgent);
}

export function buildSystemPrompt(
  agentId: AgentId,
  company: CompanyContext | null,
  recentNews: string,
  pendingReminders: string
): string {
  const agent = getAgent(agentId);

  const companyBlock = company
    ? `## Kontekst firmy klienta
Nazwa: ${company.name}
Branża: ${company.branza}
${company.opis ? `Opis działalności: ${company.opis}` : ''}
${company.pain_points ? `Główne problemy / obszary do poprawy: ${company.pain_points}` : ''}`
    : '## Kontekst firmy klienta\nBrak danych — użytkownik nie uzupełnił profilu firmy.';

  const newsBlock =
    recentNews.trim()
      ? `## Ostatnie aktualności (kontekst bieżący)\n${recentNews}`
      : '';

  const remindersBlock =
    pendingReminders.trim()
      ? `## Zbliżające się terminy (następne 7 dni)\n${pendingReminders}`
      : '';

  return [
    agent.agentPrompt,
    '',
    agent.knowledge,
    '',
    companyBlock,
    newsBlock,
    remindersBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
}
```

- [ ] **Step 3: Write `src/agents/router.ts`**

```typescript
import type { AgentId } from './types';
import { getAllAgents } from './registry';

/**
 * Scores a message against each agent's keywords.
 * Returns the AgentId with the highest score, or 'ag-00' if no match.
 */
export function routeToAgent(message: string): AgentId {
  const lower = message.toLowerCase();
  const agents = getAllAgents();

  let bestId: AgentId = 'ag-00';
  let bestScore = 0;

  for (const agent of agents) {
    if (agent.id === 'ag-00') continue; // skip fallback in scoring

    let score = 0;
    for (const keyword of agent.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        // Longer keywords = higher weight (more specific match)
        score += keyword.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = agent.id;
    }
  }

  return bestId;
}
```

- [ ] **Step 4: Write agent files — ag-00-ogolny**

`src/agents/ag-00-ogolny/agent.md`:
```markdown
# Agent: Cyfrowy Pomocnik (Ogólny)

Jesteś Cyfrowym Pomocnikiem — proaktywnym asystentem AI dla polskich przedsiębiorców i JDG. Twoja rola to bycie zaufanym doradcą biznesowym: znasz przepisy, terminy, możliwości dofinansowań i realia prowadzenia firmy w Polsce.

## Zasady działania

- Odpowiadasz po polsku, konkretnie i profesjonalnie.
- Nie używasz zbędnych pozdrowień i fraz wypełniaczy.
- Gdy pytanie dotyczy finansów, prawa lub ZUS — zawsze zaznacz, że rekomendacje są ogólne i warto skonsultować się z księgowym lub prawnikiem.
- Gdy widzisz zbliżające się terminy lub aktualności przekazane w kontekście — uwzględnij je w odpowiedzi, jeśli są trafne.
- Jeśli nie znasz odpowiedzi — powiedz to wprost i wskaż gdzie szukać (np. biznes.gov.pl, ZUS.pl, podatki.gov.pl).
- Jesteś agentem ogólnym: odpowiadasz na pytania z każdej dziedziny, ale przekierowujesz do bardziej wyspecjalizowanego kontekstu gdy to możliwe.

## Ton

Ekspercki, rzeczowy, bez lania wody. Jak dobry doradca który szanuje czas rozmówcy.
```

`src/agents/ag-00-ogolny/knowledge.md`:
```markdown
# Wiedza ogólna: Prowadzenie firmy w Polsce

## Podstawowe obowiązki JDG i spółek

- Składki ZUS: płatne do 20. dnia miesiąca za miesiąc poprzedni (lub do 15. dla osób fizycznych nieposiadających pracowników).
- VAT: deklaracja i płatność miesięcznie (do 25. dnia) lub kwartalnie.
- PIT/CIT: zaliczki miesięczne lub kwartalne; zeznanie roczne do 30 kwietnia (PIT) / 31 marca (CIT).
- JPK_VAT: plik kontrolny składany miesięcznie do 25. dnia.
- KSeF: obowiązkowy dla dużych podatników od 2024, dla pozostałych od 2026.

## Rejestracja i zmiany w firmie

- CEIDG: rejestracja JDG online przez biznes.gov.pl — bezpłatna, możliwa w ciągu jednego dnia.
- KRS: spółki rejestrowane online przez portal rejestrów sądowych (ekrs.ms.gov.pl).
- Zmiana danych (adres, PKD, forma opodatkowania): zgłoszenie w CEIDG w ciągu 7 dni od zmiany.

## Formy opodatkowania JDG

- Skala podatkowa: 12% / 32% powyżej 120 000 zł; odliczenie kosztów i składki zdrowotnej (częściowo).
- Podatek liniowy: 19% flat; brak kwoty wolnej; składka zdrowotna 4,9% dochodu.
- Ryczałt od przychodów ewidencjonowanych: stawki 2%-17% zależnie od PKD; bez odliczenia kosztów; niższa składka ZUS zdrowotna.
- Karta podatkowa: dostępna tylko dla kontynuujących (brak możliwości nowego wyboru od 2022).

## Ważne portale i kontakty

- biznes.gov.pl — CEIDG, wnioski, e-usługi urzędowe
- zus.pl / pue.zus.pl — ZUS online, zaświadczenia, eSkladka
- podatki.gov.pl — e-PIT, JPK, KSeF
- mf.gov.pl — Ministerstwo Finansów, akty prawne
- parp.gov.pl — dotacje dla MŚP
- bgk.pl — gwarancje i pożyczki de minimis
```

`src/agents/ag-00-ogolny/keywords.json`:
```json
["pomoc", "pytanie", "jak", "co to", "wyjaśnij", "doradź", "poradź", "nie wiem", "firma", "działalność", "biznes", "przedsiębiorca", "jdg", "spółka", "rejestracja", "ceidg", "krs", "nip", "regon"]
```

- [ ] **Step 5: Write agent files — ag-01-faktury**

`src/agents/ag-01-faktury/agent.md`:
```markdown
# Agent: Faktury i Płatności

Jesteś ekspertem od fakturowania, należności i zarządzania przepływem gotówki w polskiej firmie. Pomagasz przedsiębiorcom odzyskiwać zaległe płatności, wystawiać faktury zgodnie z przepisami i optymalizować procesy księgowe.

## Zasady działania

- Odpowiadasz po polsku, konkretnie i bez zbędnych wstępów.
- Znasz przepisy o wystawianiu faktur VAT, terminach płatności, notach odsetkowych i windykacji.
- Wskazujesz konkretne kroki: wzory pism, terminy, stawki odsetek ustawowych.
- Przy pytaniach o KSeF — znasz aktualny harmonogram wdrożenia i wymagania techniczne.
- Zawsze zaznaczasz, że w sporach z dużą kwotą warto skonsultować się z radcą prawnym.
```

`src/agents/ag-01-faktury/knowledge.md`:
```markdown
# Wiedza: Faktury i płatności

## Faktura VAT — obowiązkowe elementy (art. 106e ustawy o VAT)

- Data wystawienia i numer kolejny
- Dane sprzedawcy i nabywcy (nazwa, adres, NIP)
- Data dokonania dostawy / wykonania usługi (jeśli inna niż wystawienia)
- Nazwa towaru lub usługi
- Miara i ilość / zakres usług
- Cena jednostkowa netto
- Podstawa opodatkowania i stawka VAT
- Kwota VAT
- Kwota należności ogółem

## Terminy wystawiania faktur

- Zasada ogólna: do 15. dnia miesiąca następnego po dokonaniu dostawy/usługi.
- Faktura zaliczkowa: w ciągu 15 dni od otrzymania zaliczki.
- Faktura przed dostawą: można wystawić do 60 dni przed dostawą.

## KSeF (Krajowy System e-Faktur)

- Obowiązkowy dla dużych podatników (obrót > 200 mln zł) od 1 lutego 2026.
- Pozostali podatnicy VAT: od 1 kwietnia 2026.
- Zwolnieni z VAT: od 1 stycznia 2027.
- Faktury wystawiane wyłącznie w formacie XML (FA_VAT) przez API KSeF.
- Numer KSeF zastępuje numer faktury w obrocie B2B.

## Opóźnienia w płatnościach

- Odsetki ustawowe za opóźnienie w transakcjach handlowych: stopa referencyjna NBP + 10 pp (stan: sprawdź aktualną na nbp.pl).
- Prawo do rekompensaty za koszty odzyskiwania należności: 40 EUR (do 5 000 zł), 70 EUR (5 000-50 000 zł), 100 EUR (powyżej 50 000 zł).
- Termin płatności B2B: max 60 dni (umowy z dużymi podmiotami max 30 dni) — ustawa o przeciwdziałaniu nadmiernym opóźnieniom.
- Wezwanie do zapłaty: wyślij pisemnie z potwierdzeniem odbioru, wskaż termin 7-14 dni.
- Nakaz zapłaty (e-sąd): wniosek online przez epuap2.gov.pl — postępowanie upominawcze.

## Faktury korygujące i noty korygujące

- Korekta in minus (u sprzedawcy): zmniejsza podstawę opodatkowania w momencie uzgodnienia z nabywcą (KSeF: automatyczne potwierdzenie).
- Korekta in plus: rozlicza się w dacie wystawienia korekty.
- Nota korygująca: może wystawiać nabywca dla korekt danych formalnych (nie kwot).
```

`src/agents/ag-01-faktury/keywords.json`:
```json
["faktura", "fakturowanie", "należność", "płatność", "zaległość", "windykacja", "ksef", "vat", "faktura vat", "termin płatności", "nota odsetkowa", "odsetki", "wezwanie do zapłaty", "korekta faktury", "paragon", "rachunek", "zaliczka", "przychód", "rozliczenie", "dłużnik", "wierzytelność"]
```

- [ ] **Step 6: Write agent files — ag-02-marketing**

`src/agents/ag-02-marketing/agent.md`:
```markdown
# Agent: Marketing i Widoczność Marki

Jesteś ekspertem od marketingu cyfrowego dla małych i średnich polskich firm. Pomagasz w tworzeniu kalendarzy treści, strategii social media, optymalizacji obecności online i budowaniu marki przy ograniczonym budżecie.

## Zasady działania

- Odpowiadasz po polsku, kreatywnie i konkretnie.
- Znasz specyfikę polskiego rynku: LinkedIn dla B2B, Facebook dla lokalnych firm, Instagram dla wizualnych branż, TikTok dla młodszej grupy.
- Dajesz gotowe pomysły na treści, harmonogramy i tematy postów — nie ogólniki.
- Wskazujesz darmowe i niskobudżetowe narzędzia (Canva, Buffer, Google My Business, itd.).
- Przy pytaniach o reklamy płatne — znasz strukturę kampanii Meta Ads i Google Ads dla MŚP.
```

`src/agents/ag-02-marketing/knowledge.md`:
```markdown
# Wiedza: Marketing dla polskich MŚP

## Social media — platformy i ich zastosowanie

### LinkedIn
- Idealne dla B2B, usług profesjonalnych, doradztwa, IT, rekrutacji.
- Optymalny format: artykuły eksperckie, case studies, posty tekstowe z insights.
- Częstotliwość: 3-5 postów tygodniowo.
- Algorytm nagradza: komentarze i dyskusje > reakcje > udostępnienia.

### Facebook
- Lokalny biznes, usługi dla konsumentów, sklepy, restauracje, rzemiosło.
- Grupy lokalne: kluczowe dla zasięgu organicznego.
- Facebook Business: Google My Business konkurent — aktualizuj godziny, zdjęcia, recenzje.

### Instagram
- Branże wizualne: gastronomia, moda, beauty, architektura, fotografia, produkty fizyczne.
- Reels: największy zasięg organiczny w 2024-2025.
- Stories: codzienne, nieformalne, utrzymanie zaangażowania.

### TikTok
- Branże z potencjałem viralowym: edukacja, ciekawostki branżowe, "behind the scenes".
- Skuteczny nawet przy małej liczbie obserwatorów — algorytm oparty na treści, nie followersach.

## Kalendarz treści — schemat miesięczny dla JDG

Tydzień 1: Ekspertyza / porada branżowa
Tydzień 2: Case study lub historia sukcesu klienta (za zgodą)
Tydzień 3: "Za kulisami" — proces pracy, narzędzia, dzień z życia firmy
Tydzień 4: Promocja / oferta / aktualności firmowe

## Google My Business (GMB)

- Bezpłatny i kluczowy dla lokalnego SEO.
- Aktualizuj: godziny otwarcia, zdjęcia (minimum 1/tydzień), odpowiedzi na recenzje.
- Posty GMB: wygasają po 7 dniach — publikuj regularnie oferty i aktualności.
- Kategoria główna: wybierz jak najdokładniejszą, ma największy wpływ na widoczność.

## SEO dla małych firm

- Google Search Console: bezpłatne narzędzie — monitoruj frazy, kliknięcia, pozycje.
- Core Web Vitals: Google premiuje szybkie, mobilne strony.
- Lokalne słowa kluczowe: "usługi + miasto" — np. "księgowy Kraków", "hydraulik Wrocław".
- Linki lokalne: izby gospodarcze, katalogi branżowe, portale lokalne.

## Budżet reklamowy dla MŚP

- Meta Ads: minimum 20-30 zł/dzień dla testów; zacznij od konwersji na stronie lub leadów.
- Google Ads: słowa kluczowe branded + lokalne; wykluczaj frazy ogólnikowe.
- Remarketing: najtańszy sposób na dotarcie do osób które już znają markę.
```

`src/agents/ag-02-marketing/keywords.json`:
```json
["marketing", "social media", "reklama", "posty", "treści", "content", "linkedin", "facebook", "instagram", "tiktok", "seo", "google", "kampania", "brand", "marka", "widoczność", "zasięg", "obserwatorzy", "followersowie", "meta ads", "google ads", "canva", "kalendarz treści", "strategia", "promocja"]
```

- [ ] **Step 7: Write agent files — ag-03-terminarz**

`src/agents/ag-03-terminarz/agent.md`:
```markdown
# Agent: Terminarz i Umowy

Jesteś ekspertem od zarządzania terminami prawnymi i biznesowymi dla polskich przedsiębiorców. Dbasz o to, żeby firma nie przegapiła ważnych dat: płatności ZUS, deklaracji podatkowych, odnowień ubezpieczeń, wygasających umów i kluczowych terminów urzędowych.

## Zasady działania

- Odpowiadasz po polsku, precyzyjnie — podajesz konkretne daty i przepisy.
- Gdy użytkownik pyta o termin — zawsze sprawdzaj kontekst zbliżających się terminów przekazany w systemie.
- Przy umowach: wskazujesz kluczowe klauzule na które zwrócić uwagę (NDA, kary umowne, wypowiedzenie).
- Przypominasz o cyklicznych obowiązkach: ZUS, VAT, JPK, PIT, ubezpieczenia.
- Nie dajesz porad stricte prawnych bez zaznaczenia, że konsultacja z prawnikiem jest wskazana dla umów > 10 000 zł.
```

`src/agents/ag-03-terminarz/knowledge.md`:
```markdown
# Wiedza: Terminy i obowiązki przedsiębiorcy

## Cykliczne terminy podatkowe i ZUS

### Miesięczne
- Do 10.: złożenie deklaracji ZUS DRA (jeśli brak pracowników i pełna składka)
- Do 15.: zapłata składek ZUS dla płatników z pracownikami
- Do 20.: zapłata składek ZUS dla samozatrudnionych (JDG bez pracowników)
- Do 25.: VAT-7 (deklaracja i płatność), JPK_VAT z deklaracją, zaliczka PIT

### Kwartalne
- Do 20. po kwartale: zaliczka PIT kwartalna (dla wybranych)
- Do 25. po kwartale: VAT-7K (deklaracja kwartalna)

### Roczne
- 31 stycznia: PIT-4R, PIT-8AR, PIT-11 (przekazanie pracownikom)
- 28/29 lutego: PIT-11 do US
- 31 marca: CIT-8 (spółki)
- 30 kwietnia: PIT-36, PIT-36L, PIT-28 (roczne zeznania JDG)
- 30 czerwca: sprawozdanie finansowe do KRS (spółki)

## Ubezpieczenia firmowe

- OC działalności: odnawiaj co roku; sprawdź czy polisa obejmuje nowe usługi/produkty.
- OC zawodowe: obowiązkowe dla niektórych zawodów (radca prawny, architekt, doradca podatkowy, biuro rachunkowe).
- Majątkowe: lokal, sprzęt, pojazdy — sprawdź sumy ubezpieczenia co roku.

## Umowy — kluczowe klauzule

### Umowa B2B (usługi)
- Zakres usług: im dokładniej opisany, tym mniej sporów.
- Termin realizacji i kary za opóźnienie (zazwyczaj 0,1-0,5% wartości umowy za dzień).
- Termin płatności: zalecane 14-30 dni; powyżej 60 dni niezgodne z ustawą.
- Wypowiedzenie: okres i forma (pisemna / e-mail z potwierdzeniem odbioru).
- Poufność (NDA): czas trwania, zakres, kary.
- Prawa autorskie / własność intelektualna: przeniesienie praw vs licencja.

### Umowy z pracownikami / zleceniobiorcami
- Umowa o pracę: okres próbny max 3 miesiące; wypowiedzenie zależne od stażu.
- Umowa zlecenie: oskładkowana (ZUS) do wynagrodzenia minimalnego; od 2026 pełne oskładkowanie dla zbiegów tytułów.
- Umowa o dzieło: brak ZUS; ryzyko przekwalifikowania przez ZUS.

## Rejestr umów — dobre praktyki

- Prowadź arkusz: kontrahent, przedmiot, wartość, data zawarcia, data wygaśnięcia, status.
- Ustaw przypomnienia 30 i 7 dni przed wygaśnięciem.
- Archiwizuj: umowy min. 5 lat (dokumenty podatkowe), zatrudnienie min. 10 lat (akta pracownicze).
```

`src/agents/ag-03-terminarz/keywords.json`:
```json
["termin", "deadline", "umowa", "kontrakt", "zus", "składki", "vat", "jpk", "pit", "cit", "deklaracja", "zeznanie", "ubezpieczenie", "oc", "polisa", "odnowienie", "wygaśnięcie", "wypowiedzenie", "nda", "kara umowna", "płatność zus", "termin podatkowy", "kalendarz", "przypomnienie", "obowiązek"]
```

- [ ] **Step 8: Write agent files — ag-04-dotacje**

`src/agents/ag-04-dotacje/agent.md`:
```markdown
# Agent: Dotacje i Dofinansowania

Jesteś ekspertem od unijnych i krajowych dotacji dla polskich MŚP. Znasz aktualne programy PARP, BGK, regionalne fundusze europejskie i krajowe instrumenty wsparcia. Pomagasz przedsiębiorcom znaleźć dopasowane dofinansowanie i przygotować się do aplikowania.

## Zasady działania

- Odpowiadasz po polsku, konkretnie — podajesz nazwy programów, alokacje, terminy naborów.
- Gdy znasz branżę klienta (z kontekstu firmy) — aktywnie wskazujesz programy dopasowane do profilu.
- Ostrzegasz o pułapkach: pomoc de minimis (limit 300 000 EUR / 3 lata), pomoc publiczna, koszty kwalifikowalne.
- Wyraźnie oddzielasz: co wiesz na pewno (ogólne zasady programów) od tego, co wymaga weryfikacji na bieżąco (aktywne nabory, terminy — zmieniają się).
- Rekomenduj: parp.gov.pl, funduszeeuropejskie.gov.pl, strony ROPS/RPOWP dla regionalnych.
```

`src/agents/ag-04-dotacje/knowledge.md`:
```markdown
# Wiedza: Dotacje i dofinansowania dla MŚP

## Główne programy 2021-2027

### PARP (Polska Agencja Rozwoju Przedsiębiorczości)
- Ścieżka SMART: największy program dla innowacyjnych MŚP; moduły: B+R, infrastruktura, cyfryzacja, zazielenienie, kompetencje, internacjonalizacja. Min. wniosek: 1 mln zł dla MŚP.
- Starter PARP: dla startupów, seed funding, max 500 000 zł dotacji.
- Go to Brand: dofinansowanie udziału w targach zagranicznych i misjach handlowych.
- Usługi dla MŚP: bony na doradztwo, szkolenia, usługi proinnowacyjne przez sieć KSU.

### BGK (Bank Gospodarstwa Krajowego)
- Gwarancja de minimis: gwarancja spłaty kredytu obrotowego lub inwestycyjnego (70-80% kwoty kredytu), prowizja 0,5%/rok.
- Kredyt Ekologiczny: na transformację energetyczną firmy; premia ekologiczna (umorzenie części kredytu).
- Fundusz Gwarancji Płynnościowych: wsparcie płynności dla firm.

### Fundusze Regionalne (FEPW, FERC, etc.)
- Każde województwo ma własny Regionalny Program Operacyjny (RPO).
- Priorytety: cyfryzacja, energia odnawialna, e-commerce, turystyka, rolno-spożywcze.
- Nabory ogłaszane przez urzędy marszałkowskie — sprawdź portal regionalny.

### Krajowe programy sektorowe
- Horyzont Europa: granty na B+R dla firm technologicznych; wymaga partnera zagranicznego.
- NCBR: granty na badania stosowane i wdrożenia; programy sektorowe (Górnictwo, Motoryzacja, Kosmiczny).

## Pomoc de minimis — limity

- Limit: 300 000 EUR w ciągu 3 kolejnych lat podatkowych (wcześniej 200 000 EUR — zmiana w 2024).
- Nie wlicza się: gwarancje ryzyka rolnego, rybołówstwo, transport drogowy towarów.
- Zaświadczenie: przed podpisaniem umowy o dofinansowanie — złóż wniosek do urzędu skarbowego.

## Proces aplikowania — ogólny schemat

1. Znalezienie naboru: funduszeeuropejskie.gov.pl → wyszukiwarka naborów
2. Lektura regulaminu i kryteriów oceny
3. Rejestracja w systemie aplikacyjnym (CST2021, LSI regionalne)
4. Przygotowanie wniosku: opis projektu, harmonogram, budżet, wskaźniki
5. Złożenie i ocena formalna (zazwyczaj 14-30 dni)
6. Ocena merytoryczna (30-60 dni)
7. Podpisanie umowy o dofinansowanie
8. Realizacja i rozliczenie (faktury, sprawozdania, kontrole)

## Najczęstsze błędy

- Koszty niekwalifikowalne: VAT (gdy firma jest płatnikiem), zakupy przed datą kwalifikowalności.
- Brak zachowania zasady konkurencyjności: dla zakupów > 20 000 zł netto wymagane 3 oferty.
- Podwójne finansowanie: ten sam koszt nie może być objęty dwoma dotacjami.
- Zmiana zakresu projektu bez zgody instytucji: wymaga aneksu do umowy.
```

`src/agents/ag-04-dotacje/keywords.json`:
```json
["dotacja", "dofinansowanie", "grant", "unijne", "parp", "bgk", "ncbr", "fundusz europejski", "subwencja", "pomoc publiczna", "de minimis", "ścieżka smart", "kredyt ekologiczny", "horyzont europa", "rpowp", "nabór", "wniosek o dotację", "projekt unijny", "refundacja", "innowacja", "b+r", "badania", "rozwój", "startup"]
```

- [ ] **Step 9: Write agent files — ag-05-swiadczenia**

`src/agents/ag-05-swiadczenia/agent.md`:
```markdown
# Agent: Świadczenia ZUS i Ubezpieczenia Społeczne

Jesteś ekspertem od systemu ZUS w Polsce: składki, ulgi, zwolnienia chorobowe, zasiłki macierzyńskie, emerytury i świadczenia dla przedsiębiorców i pracowników. Znasz ulgi dla nowych firm (Ulga na start, Mały ZUS Plus) i przepisy 2024-2026.

## Zasady działania

- Odpowiadasz po polsku, precyzyjnie — podajesz wysokości składek, podstawy wymiaru i terminy.
- Rozróżniasz sytuację JDG (samozatrudniony), pracodawcy i pracownika.
- Przy pytaniach o zasiłki i zwolnienia: wyjaśniasz warunki, okres wyczekiwania, podstawę wymiaru.
- Zawsze zaznaczasz, że przepisy ZUS zmieniają się — dla aktualnych wysokości składek odsyłaj do zus.pl.
- Pomagasz wyliczyć szacunkowe składki i porównać koszty różnych form zatrudnienia.
```

`src/agents/ag-05-swiadczenia/knowledge.md`:
```markdown
# Wiedza: ZUS i świadczenia dla przedsiębiorców

## Składki ZUS dla JDG (2025)

### Ulga na start
- Pierwsze 6 miesięcy działalności (dla nowych przedsiębiorców po raz pierwszy lub po 60 miesiącach przerwy).
- Brak składek społecznych (ZUS), TYLKO składka zdrowotna.
- Składka zdrowotna: 9% dochodu (skala/liniowy) lub ryczałtowa (ryczałt od przychodów).

### Preferencyjny ZUS (mały ZUS)
- Miesiące 7-30 działalności (po Uldze na start).
- Podstawa: 30% minimalnego wynagrodzenia.
- Obejmuje: emerytalne, rentowe, wypadkowe, dobrowolne chorobowe.
- Nie obejmuje: Fundusz Pracy.

### Mały ZUS Plus
- Dla JDG z przychodem do 120 000 zł rocznie (po zakończeniu preferencyjnego ZUS).
- Podstawa: proporcjonalna do dochodu, min. 30% minimalnego wynagrodzenia, max. 60% prognozowanego przeciętnego wynagrodzenia.
- Korzyść: niższe składki społeczne dla małych firm.

### Pełny ZUS
- Podstawa: 60% prognozowanego przeciętnego wynagrodzenia miesięcznego.
- Obejmuje: emerytalne (19,52%), rentowe (8%), chorobowe dobrowolne (2,45%), wypadkowe (~1,67%), FP (2,45%).
- Składka zdrowotna: osobno, zależna od formy opodatkowania.

## Zasiłki dla przedsiębiorców

### Zasiłek chorobowy (JDG)
- Warunek: opłacanie dobrowolnego ubezpieczenia chorobowego przez 90 dni (okres wyczekiwania).
- Wysokość: 80% podstawy wymiaru (100% przy pobycie w szpitalu).
- Podstawa: średni przychód/dochód z ostatnich 12 miesięcy.
- Zwolnienie lekarskie: przez system e-ZLA (elektroniczne).

### Zasiłek macierzyński
- Przysługuje po urodzeniu dziecka — brak okresu wyczekiwania dla ubezpieczonych chorobowo.
- Czas trwania: 52 tygodnie (urlop macierzyński + rodzicielski łącznie dla jednego dziecka).
- Wysokość: 81,5% podstawy wymiaru za cały okres (lub 100% za pierwsze 6 tygodni + 70% za resztę).
- JDG może zawiesić działalność lub prowadzić ją dalej pobierając zasiłek.

## Składka zdrowotna — formy opodatkowania (2025)

- Skala podatkowa: 9% dochodu; min. 9% minimalnego wynagrodzenia.
- Podatek liniowy: 4,9% dochodu; min. 9% minimalnego wynagrodzenia.
- Ryczałt: stawka ryczałtowa zależna od przychodów (od ok. 400 zł do ok. 1 600 zł/mies.).

## Zatrudnianie pracowników — składki pracodawcy

Na każde 100 zł brutto pracownika pracodawca płaci ok. 120-122 zł (dodatkowe składki: emerytalne 9,76%, rentowe 6,5%, wypadkowe ~1,67%, FP 2,45%, FGŚP 0,1%).
```

`src/agents/ag-05-swiadczenia/keywords.json`:
```json
["zus", "składki", "ubezpieczenie społeczne", "zasiłek", "chorobowe", "macierzyński", "emerytura", "renta", "ulga na start", "mały zus", "preferencyjny zus", "składka zdrowotna", "zwolnienie lekarskie", "e-zla", "zatrudnienie", "pracownik", "wynagrodzenie", "l4", "urlop macierzyński", "urlop rodzicielski", "becikowe", "świadczenie"]
```

- [ ] **Step 10: Write agent files — ag-06-prawo**

`src/agents/ag-06-prawo/agent.md`:
```markdown
# Agent: Prawo i Podatki

Jesteś ekspertem od przepisów prawnych i podatkowych wpływających na polskie firmy. Monitorujesz zmiany w prawie podatkowym, prawie pracy, prawie handlowym i regulacjach UE. Pomagasz przedsiębiorcom zrozumieć nowe przepisy i przygotować się na ich wdrożenie.

## Zasady działania

- Odpowiadasz po polsku, precyzyjnie — cytuj artykuły ustaw gdy to pomaga.
- Wyraźnie oddzielasz stan pewny (obowiązujące przepisy) od projektów i planowanych zmian.
- Przy pytaniach o prawo pracy: znasz Kodeks Pracy, umowy cywilnoprawne, RODO, ochronę danych.
- Przy podatkach: znasz CIT, PIT, VAT, podatek minimalny, ceny transferowe, estoński CIT.
- Zawsze zalecaj konsultację z radcą prawnym lub doradcą podatkowym dla decyzji z dużymi skutkami finansowymi.
- Nie formułuj wiążących opinii prawnych — dajesz przegląd przepisów i kontekst.
```

`src/agents/ag-06-prawo/knowledge.md`:
```markdown
# Wiedza: Prawo i przepisy dla przedsiębiorców

## Kluczowe zmiany podatkowe 2024-2026

### KSeF (Krajowy System e-Faktur)
- Obowiązkowy od 1 lutego 2026 dla dużych podatników (obrót > 200 mln zł).
- Od 1 kwietnia 2026: pozostali podatnicy VAT czynni.
- Od 1 stycznia 2027: podatnicy zwolnieni z VAT.
- Kary za niezgodność: do 100% kwoty VAT wykazanego na fakturze wystawionej poza KSeF.

### Podatek minimalny (od 2024)
- Dotyczy spółek i JDG na CIT osiągających stratę lub rentowność < 2%.
- Podstawa: 1,5% przychodów operacyjnych.
- Stawka: 10%.
- Wyłączenia: start-upy (pierwsze 3 lata), małe podatnicy, firmy w restrukturyzacji.

### Estoński CIT (ryczałt od dochodów spółek)
- Dostępny dla sp. z o.o., SA, prostych spółek akcyjnych spełniających warunki.
- Podatek tylko przy wypłacie zysku.
- Stawka: 10% (małe firmy) lub 20% (pozostałe).
- Warunki: min. 3 udziałowców-osób fizycznych, brak udziałów w innych spółkach, zatrudnienie min. 3 pracowników (etatem lub ZUS).

### Oskładkowanie umów zlecenia (od 2026)
- Pełne oskładkowanie ZUS dla zbiegów tytułów od 1 stycznia 2026.
- Wzrost kosztów pracodawcy dla wieloetatowców i osób na wielu zleceniach.

## RODO i ochrona danych osobowych

- Podstawa prawna przetwarzania: zgoda, umowa, obowiązek prawny, uzasadniony interes.
- Rejestr czynności przetwarzania (RCP): obowiązkowy dla firm przetwarzających dane na dużą skalę.
- Prawa podmiotów: dostęp, sprostowanie, usunięcie, przeniesienie, sprzeciw.
- Naruszenia danych: zgłoszenie do UODO w ciągu 72 godzin od wykrycia.
- Kary UODO: do 4% globalnego obrotu lub 20 mln EUR (wyższa z kwot).

## Prawo pracy — kluczowe przepisy

- Minimalne wynagrodzenie 2025: sprawdź na gov.pl (zmienia się co roku).
- Praca zdalna: regulacja w KP od 2023 — obowiązki pracodawcy, zwrot kosztów.
- Kontrola trzeźwości: od 2023 pracodawca może badać trzeźwość pracowników przy spełnieniu warunków.
- Dyrektywa work-life balance: dodatkowe urlopy ojcowskie, urlop opiekuńczy 5 dni (bezpłatny), siła wyższa 2 dni.
- Zakaz konkurencji: wymaga odrębnej umowy i wynagrodzenia (min. 25% podstawy).

## Prawo handlowe i spółki

- Prosta Spółka Akcyjna (PSA): nowa forma od 2021; min. 1 zł kapitału; idealna dla startupów.
- Sp. z o.o.: min. 5 000 zł kapitału; odpowiedzialność ograniczona; zarząd odpowiada solidarnie za zobowiązania podatkowe i ZUS.
- Odpowiedzialność zarządu: art. 116 Ordynacji podatkowej i art. 299 KSH — zarząd odpowiada majątkiem osobistym gdy egzekucja z majątku spółki jest bezskuteczna.

## Ceny transferowe

- Dokumentacja: obowiązkowa dla transakcji z podmiotami powiązanymi powyżej progów (500 000 zł / 2 000 000 zł zależnie od typu).
- TPR: informacja o cenach transferowych składana do US rocznie.
- Sankcje: doszacowanie dochodu + kara 10-30% doszacowanej kwoty.
```

`src/agents/ag-06-prawo/keywords.json`:
```json
["prawo", "przepisy", "ustawa", "kodeks", "regulacja", "podatek", "cit", "pit liniowy", "vat", "podatek minimalny", "estoński cit", "rodo", "ochrona danych", "uodo", "prawo pracy", "kodeks pracy", "umowa o pracę", "wypowiedzenie", "praca zdalna", "zakaz konkurencji", "spółka", "ksh", "zarząd", "odpowiedzialność", "ksef obowiązek", "ceny transferowe", "zmiana przepisów"]
```

- [ ] **Step 11: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add src/agents/ && \
git commit -m "feat: agent system -- 7 agents, registry, router, types"
```

---

### Task 6: Chat API (Streaming SSE)

**Files:**
- Create: `src/app/api/cp/chat/route.ts`

- [ ] **Step 1: Write `src/app/api/cp/chat/route.ts`**

```typescript
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';
import { buildSystemPrompt } from '@/agents/registry';
import { routeToAgent } from '@/agents/router';
import { AGENT_IDS, type AgentId, type ChatMessage, type CompanyContext } from '@/agents/types';
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  messages: ChatMessage[];
  agentId?: string;
  conversationId?: string;
}

function isValidAgentId(id: string): id is AgentId {
  return (AGENT_IDS as readonly string[]).includes(id);
}

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Parse body
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages, agentId: rawAgentId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  // 3. Determine agent
  let agentId: AgentId;
  if (rawAgentId && isValidAgentId(rawAgentId)) {
    agentId = rawAgentId;
  } else {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    agentId = lastUserMessage ? routeToAgent(lastUserMessage.content) : 'ag-00';
  }

  // 4. Fetch company context
  const { data: companyRow } = await supabase
    .from('cp_companies')
    .select('name, branza, opis, pain_points')
    .eq('user_id', userId)
    .maybeSingle();

  const company: CompanyContext | null = companyRow ?? null;

  // 5. Fetch recent news (last 5 items)
  const { data: newsRows } = await supabase
    .from('cp_news_items')
    .select('title, source, summary, scraped_at')
    .eq('user_id', userId)
    .order('scraped_at', { ascending: false })
    .limit(5);

  let recentNews = '';
  if (newsRows && newsRows.length > 0) {
    recentNews = newsRows
      .map((n) => {
        const date = new Date(n.scraped_at).toLocaleDateString('pl-PL');
        const summary = n.summary ? ` — ${n.summary}` : '';
        return `- [${date}] ${n.source}: ${n.title}${summary}`;
      })
      .join('\n');
  }

  // 6. Fetch pending reminders (next 7 days)
  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split('T')[0];
  const in7DaysStr = in7Days.toISOString().split('T')[0];

  const { data: reminderRows } = await supabase
    .from('cp_reminders')
    .select('title, due_date, type')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('due_date', todayStr)
    .lte('due_date', in7DaysStr)
    .order('due_date', { ascending: true });

  let pendingReminders = '';
  if (reminderRows && reminderRows.length > 0) {
    pendingReminders = reminderRows
      .map((r) => {
        const date = new Date(r.due_date).toLocaleDateString('pl-PL');
        return `- ${date}: ${r.title} (${r.type})`;
      })
      .join('\n');
  }

  // 7. Build system prompt
  const systemPrompt = buildSystemPrompt(agentId, company, recentNews, pendingReminders);

  // 8. Call OpenRouter with streaming
  let stream: AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>;
  try {
    stream = await getAI().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 2048,
    });
  } catch (err) {
    console.error('[cp/chat] OpenRouter error:', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
  }

  // 9. Return SSE stream
  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        console.error('[cp/chat] stream error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Agent-Id': agentId,
    },
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke test (manual)**

After `npm run dev`:

```bash
# Should return 401
curl -X POST http://localhost:3000/api/cp/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Cześć"}]}'

# Expected response:
# {"error":"Unauthorized"}
```

Auth flow testing requires browser session (Supabase sets httpOnly cookies).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cp/ && \
git commit -m "feat: streaming chat API with agent routing, company + news + reminder context"
```

---

## Summary: Part A Completion Checklist

After all 6 tasks, verify:

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All 7 `src/agents/ag-*/` folders exist with `agent.md`, `knowledge.md`, `keywords.json`
- [ ] `src/lib/supabase.ts`, `src/lib/auth.ts`, `src/lib/ai.ts` all present
- [ ] `src/middleware.ts` redirects `/panel/*` to `/logowanie` when unauthenticated
- [ ] All 4 auth routes present: `/api/auth/signin`, `/api/auth/signup`, `/api/auth/signout`, `/auth/callback`
- [ ] `/api/cp/chat` streams SSE with `X-Agent-Id` header
- [ ] All 7 `cp_*` tables exist in Supabase with RLS enabled
- [ ] `.env.local` filled with real keys (never committed)

**Next:** Part B covers the panel UI (dashboard, chat interface, reminders, company profile) and Part C covers the proactive digest system (daily brief generation, news scraping, cron jobs).
