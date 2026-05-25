# Cyfrowy Pomocnik — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Cyfrowy Pomocnik MVP — a proactive AI assistant for Polish SMEs/JDGs with daily brief, industry news, action items, and multi-agent chat.

**Architecture:** Separate Next.js 16.2.6 project at `/Users/trading/cyfrowy-pomocnik/`, sharing the same Supabase instance as wezmezadarmo (shared auth, new `cp_*` tables). No Tailwind — CSS Modules. OpenRouter via OpenAI SDK for AI. Vercel Cron for scheduled brief/news generation.

**Tech Stack:** Next.js 16.2.6 · React 19 · TypeScript strict · @supabase/ssr · openai (→ OpenRouter) · @mendable/firecrawl-js · resend · Vercel Cron

**New repo:** `mkdir /Users/trading/cyfrowy-pomocnik && cd /Users/trading/cyfrowy-pomocnik && git init`

**Spec:** `docs/superpowers/specs/2026-05-25-cyfrowy-pomocnik-design.md` (in wezmezadarmo repo)

---

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

---
# Part B: Business Logic + APIs (Tasks 7-13)

Project: `/Users/trading/cyfrowy-pomocnik/`
Scope: Company profile API, reminders API, brief generation, Firecrawl news scraping, cron endpoints, action items API, vercel.json.

---

### Task 7: Company Profile API

**Files:**
- Create: `src/app/api/cp/company/route.ts`

- [ ] **Step 1: Create company CRUD route**

```typescript
// src/app/api/cp/company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: company, error } = await supabase
    .from('cp_companies')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ company });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, nip, branza, opis, pain_points } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "name" jest wymagane' }, { status: 400 });
  }
  if (!branza || typeof branza !== 'string' || branza.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "branza" jest wymagane' }, { status: 400 });
  }

  const payload = {
    user_id: session.user.id,
    name: name.trim(),
    nip: nip?.trim() ?? null,
    branza: branza.trim(),
    opis: opis?.trim() ?? null,
    pain_points: pain_points?.trim() ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: company, error } = await supabase
    .from('cp_companies')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ company });
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/api/cp/company/route.ts && git commit -m "feat: company profile GET/POST API (cp_companies upsert)"
```

---

### Task 8: Reminders API

**Files:**
- Create: `src/app/api/cp/reminders/route.ts`
- Create: `src/app/api/cp/reminders/[id]/route.ts`

- [ ] **Step 1: Create reminders list + create route**

```typescript
// src/app/api/cp/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: reminders, error } = await supabase
    .from('cp_reminders')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('due_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminders });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, due_date, type } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "title" jest wymagane' }, { status: 400 });
  }
  if (!due_date || typeof due_date !== 'string') {
    return NextResponse.json({ error: 'Pole "due_date" jest wymagane (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!type || typeof type !== 'string') {
    return NextResponse.json({ error: 'Pole "type" jest wymagane' }, { status: 400 });
  }

  const { data: reminder, error } = await supabase
    .from('cp_reminders')
    .insert({
      user_id: session.user.id,
      title: title.trim(),
      due_date,
      type,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder }, { status: 201 });
}
```

- [ ] **Step 2: Create reminder update + delete route**

```typescript
// src/app/api/cp/reminders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['done', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'status musi być "done" lub "dismissed"' }, { status: 400 });
  }

  // Verify ownership first
  const { data: existing } = await supabase
    .from('cp_reminders')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono przypomnienia' }, { status: 404 });
  }

  const { data: reminder, error } = await supabase
    .from('cp_reminders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const { data: existing } = await supabase
    .from('cp_reminders')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono przypomnienia' }, { status: 404 });
  }

  const { error } = await supabase
    .from('cp_reminders')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/cp/reminders/ && git commit -m "feat: reminders API GET/POST/PATCH/DELETE"
```

---

### Task 9: Brief Generation Lib + API

**Files:**
- Create: `src/lib/brief.ts`
- Create: `src/app/api/cp/brief/route.ts`

- [ ] **Step 1: Create brief generation library**

```typescript
// src/lib/brief.ts
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';

export interface ActionItem {
  id: string;
  brief_id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface RawAction {
  type: string;
  priority: 'urgent' | 'warn' | 'info';
  title: string;
  description: string;
}

interface BriefResult {
  briefId: string;
  summary: string;
  actions: ActionItem[];
}

const BRIEF_PROMPT = `Jesteś Cyfrowym Pomocnikiem dla firmy: {companyName} (branża: {branza}).

Opis firmy: {opis}
Pain points: {painPoints}

Na podstawie poniższych danych wygeneruj dzienny brief z listą akcji do zatwierdzenia.

NEWSY BRANŻOWE (ostatnie 24h):
{newsItems}

NADCHODZĄCE TERMINY (30 dni):
{reminders}

Odpowiedz WYŁĄCZNIE w JSON (bez markdown):
{
  "summary": "krótkie podsumowanie dnia 1-2 zdania",
  "actions": [
    {
      "type": "faktura|terminarz|marketing|prawo|dotacje|ogolny",
      "priority": "urgent|warn|info",
      "title": "konkretny tytuł akcji",
      "description": "szczegóły, co dokładnie AI proponuje zrobić"
    }
  ]
}

Generuj TYLKO realne akcje na podstawie dostarczonych danych. Maksymalnie 5 akcji. Priorytetyzuj.`;

function buildPrompt(
  companyName: string,
  branza: string,
  opis: string,
  painPoints: string,
  newsItems: string,
  reminders: string,
): string {
  return BRIEF_PROMPT
    .replace('{companyName}', companyName)
    .replace('{branza}', branza)
    .replace('{opis}', opis)
    .replace('{painPoints}', painPoints)
    .replace('{newsItems}', newsItems)
    .replace('{reminders}', reminders);
}

export async function generateBrief(userId: string): Promise<BriefResult> {
  const supabase = await createSupabaseServer();

  // 1. Fetch company profile
  const { data: company, error: companyError } = await supabase
    .from('cp_companies')
    .select('name, branza, opis, pain_points')
    .eq('user_id', userId)
    .maybeSingle();

  if (companyError) throw new Error(`Błąd pobierania profilu firmy: ${companyError.message}`);
  if (!company) throw new Error('Brak profilu firmy dla użytkownika');

  // 2. Fetch news from last 24h
  const { data: newsRows } = await supabase
    .from('cp_news_items')
    .select('title, summary, source, url')
    .eq('user_id', userId)
    .gt('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('scraped_at', { ascending: false })
    .limit(20);

  const newsText = newsRows && newsRows.length > 0
    ? newsRows.map((n, i) => `${i + 1}. [${n.source}] ${n.title}\n   ${n.summary ?? '(brak opisu)'}\n   URL: ${n.url}`).join('\n\n')
    : 'Brak nowych wiadomości w ciągu ostatnich 24 godzin.';

  // 3. Fetch upcoming reminders (30 days)
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const { data: reminderRows } = await supabase
    .from('cp_reminders')
    .select('title, due_date, type')
    .eq('user_id', userId)
    .lte('due_date', thirtyDaysOut.toISOString().split('T')[0])
    .eq('status', 'active')
    .order('due_date', { ascending: true })
    .limit(10);

  const remindersText = reminderRows && reminderRows.length > 0
    ? reminderRows.map(r => `- ${r.due_date}: [${r.type}] ${r.title}`).join('\n')
    : 'Brak nadchodzących terminów.';

  // 4. Fetch pending actions from yesterday still pending
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: pendingOld } = await supabase
    .from('cp_action_items')
    .select('title, type, priority')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lt('created_at', yesterday);

  if (pendingOld && pendingOld.length > 0) {
    const pendingText = pendingOld.map(a => `- [${a.priority}] ${a.title}`).join('\n');
    // Append to reminders so Claude is aware
    const combined = remindersText + '\n\nNIEZATWIERDZONE AKCJE Z POPRZEDNIEGO DNIA:\n' + pendingText;

    return buildAndSaveBrief(userId, company, newsText, combined, supabase);
  }

  return buildAndSaveBrief(userId, company, newsText, remindersText, supabase);
}

async function buildAndSaveBrief(
  userId: string,
  company: { name: string; branza: string; opis: string | null; pain_points: string | null },
  newsText: string,
  remindersText: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
): Promise<BriefResult> {
  const prompt = buildPrompt(
    company.name,
    company.branza,
    company.opis ?? 'Brak opisu.',
    company.pain_points ?? 'Brak.',
    newsText,
    remindersText,
  );

  // 5. Call AI
  const ai = getAI();
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const rawContent = response.choices[0]?.message?.content ?? '{}';

  let parsed: { summary: string; actions: RawAction[] };
  try {
    // Strip markdown code blocks if present
    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI zwróciło nieprawidłowy JSON: ${rawContent.substring(0, 200)}`);
  }

  const summary = parsed.summary ?? '';
  const rawActions: RawAction[] = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [];

  // 6. Insert brief
  const { data: brief, error: briefError } = await supabase
    .from('cp_daily_briefs')
    .insert({
      user_id: userId,
      summary_text: summary,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (briefError) throw new Error(`Błąd zapisu briefu: ${briefError.message}`);

  // 7. Insert action items
  const actionInserts = rawActions.map(a => ({
    brief_id: brief.id,
    user_id: userId,
    type: a.type,
    title: a.title,
    description: a.description,
    priority: a.priority,
    status: 'pending' as const,
  }));

  let savedActions: ActionItem[] = [];

  if (actionInserts.length > 0) {
    const { data: actions, error: actionsError } = await supabase
      .from('cp_action_items')
      .insert(actionInserts)
      .select();

    if (actionsError) throw new Error(`Błąd zapisu akcji: ${actionsError.message}`);
    savedActions = (actions ?? []) as ActionItem[];
  }

  // 8. Return
  return {
    briefId: brief.id,
    summary,
    actions: savedActions,
  };
}
```

- [ ] **Step 2: Create brief API route**

```typescript
// src/app/api/cp/brief/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { generateBrief } from '@/lib/brief';

export async function POST() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateBrief(session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the latest brief
  const { data: brief, error: briefError } = await supabase
    .from('cp_daily_briefs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ brief: null, actions: [] });
  }

  // Get its action items
  const { data: actions, error: actionsError } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('brief_id', brief.id)
    .order('created_at', { ascending: true });

  if (actionsError) {
    return NextResponse.json({ error: actionsError.message }, { status: 500 });
  }

  return NextResponse.json({ brief, actions: actions ?? [] });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/brief.ts src/app/api/cp/brief/route.ts && git commit -m "feat: brief generation lib + API (generateBrief, GET latest)"
```

---

### Task 10: Firecrawl News Scraping

**Files:**
- Create: `src/lib/firecrawl.ts`
- Create: `src/app/api/cp/cron/news/route.ts`

- [ ] **Step 1: Create Firecrawl scraping library**

```typescript
// src/lib/firecrawl.ts
import FirecrawlApp from '@mendable/firecrawl-js';
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';
import type { CompanyContext } from '@/types';

interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  source: string;
}

const NEWS_SOURCES = [
  { url: 'https://www.parp.gov.pl/aktualnosci', source: 'PARP', keywords: ['dotacje', 'dofinansowanie', 'fundusze', 'program'] },
  { url: 'https://www.zus.pl/aktualnosci', source: 'ZUS', keywords: ['zus', 'składki', 'świadczenia', 'emerytury', 'renta'] },
  { url: 'https://www.gov.pl/web/mf/aktualnosci', source: 'MF', keywords: ['podatki', 'ksef', 'vat', 'pit', 'cit', 'faktura'] },
  { url: 'https://stat.gov.pl/aktualnosci/', source: 'GUS', keywords: ['inflacja', 'pkb', 'gospodarka', 'rynek', 'bezrobocie'] },
  { url: 'https://nbp.pl/aktualnosci/', source: 'NBP', keywords: ['stopy procentowe', 'kursy walut', 'inflacja', 'kredyt'] },
  { url: 'https://legislacja.gov.pl/', source: 'Legislacja', keywords: ['ustawa', 'rozporządzenie', 'prawo', 'przepisy', 'nowelizacja'] },
] as const;

function getFirecrawl(): FirecrawlApp {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY nie jest ustawiony');
  return new FirecrawlApp({ apiKey });
}

function isRelevant(title: string, content: string, branza: string, sourceKeywords: readonly string[]): boolean {
  const combined = (title + ' ' + content).toLowerCase();
  const branzaWords = branza.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

  // Always include if matches source-specific keywords
  const matchesSource = sourceKeywords.some(kw => combined.includes(kw.toLowerCase()));
  if (!matchesSource) return false;

  // Bonus: matches branza — but include even without branza match (news is general)
  const matchesBranza = branzaWords.some(w => combined.includes(w));
  void matchesBranza; // relevance check is just source keywords for now

  return true;
}

async function summarizeArticle(title: string, content: string): Promise<string> {
  const ai = getAI();
  const truncated = content.substring(0, 2000);

  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Streść poniższy artykuł w 1-2 zdaniach po polsku. Skup się na tym, co ważne dla małych firm i JDG.\n\nTytuł: ${title}\n\nTreść: ${truncated}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content?.trim() ?? title;
}

export async function scrapeNewsForUser(userId: string, company: CompanyContext): Promise<void> {
  const firecrawl = getFirecrawl();
  const supabase = await createSupabaseServer();

  const scraped: ScrapedArticle[] = [];

  for (const source of NEWS_SOURCES) {
    try {
      const result = await firecrawl.scrapeUrl(source.url, {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 15000,
      });

      if (!result.success || !result.markdown) continue;

      const markdown = result.markdown;

      // Extract individual news items: lines that look like article titles (links or headings)
      const lines = markdown.split('\n');
      const articleLines = lines.filter(l => {
        const cleaned = l.trim();
        return (
          (cleaned.startsWith('#') || cleaned.startsWith('[') || cleaned.startsWith('**')) &&
          cleaned.length > 20 &&
          cleaned.length < 300
        );
      });

      // Take top 5 most recent-looking items per source
      const candidates = articleLines.slice(0, 5);

      for (const line of candidates) {
        // Extract URL if present
        const urlMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        const title = urlMatch ? urlMatch[1] : line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
        const url = urlMatch ? urlMatch[2] : source.url;

        if (!isRelevant(title, markdown.substring(0, 500), company.branza, source.keywords)) continue;

        scraped.push({ title, url, content: markdown.substring(0, 3000), source: source.source });
      }
    } catch {
      // Skip failed sources silently - don't break entire pipeline
      continue;
    }
  }

  if (scraped.length === 0) return;

  // Summarize and insert each article
  for (const article of scraped) {
    try {
      const summary = await summarizeArticle(article.title, article.content);

      // Check for duplicates by URL
      const { data: existing } = await supabase
        .from('cp_news_items')
        .select('id')
        .eq('user_id', userId)
        .eq('url', article.url)
        .maybeSingle();

      if (existing) continue;

      await supabase.from('cp_news_items').insert({
        user_id: userId,
        source: article.source,
        title: article.title,
        url: article.url,
        summary,
        relevance_tags: [company.branza],
        scraped_at: new Date().toISOString(),
      });
    } catch {
      continue;
    }
  }

  // Delete items older than 48h
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('cp_news_items')
    .delete()
    .eq('user_id', userId)
    .lt('scraped_at', cutoff);
}
```

- [ ] **Step 2: Create news cron endpoint**

```typescript
// src/app/api/cp/cron/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { scrapeNewsForUser } from '@/lib/firecrawl';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServer();

  // Get all users who have a company profile
  const { data: companies, error } = await supabase
    .from('cp_companies')
    .select('user_id, name, branza, opis, pain_points');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!companies || companies.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Brak firm do przetworzenia' });
  }

  let processed = 0;
  const errors: string[] = [];

  for (const company of companies) {
    try {
      await scrapeNewsForUser(company.user_id, {
        name: company.name,
        branza: company.branza,
        opis: company.opis,
        pain_points: company.pain_points,
      });
      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      errors.push(`${company.user_id}: ${msg}`);
    }
  }

  return NextResponse.json({ processed, errors: errors.length > 0 ? errors : undefined });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/firecrawl.ts src/app/api/cp/cron/news/route.ts && git commit -m "feat: Firecrawl news scraping + cron/news endpoint"
```

---

### Task 11: Daily Brief Cron + Email

**Files:**
- Create: `src/app/api/cp/cron/brief/route.ts`
- Create: `src/lib/email.ts`

- [ ] **Step 1: Create email library**

```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import type { ActionItem } from '@/lib/brief';

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY nie jest ustawiony');
  return new Resend(apiKey);
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'PILNE',
  warn: 'WAŻNE',
  info: 'INFO',
  running: 'W TOKU',
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#dc2626',
  warn: '#d97706',
  info: '#2563eb',
  running: '#7c3aed',
};

function buildActionHtml(action: ActionItem): string {
  const label = PRIORITY_LABEL[action.priority] ?? action.priority.toUpperCase();
  const color = PRIORITY_COLOR[action.priority] ?? '#6b7280';

  return `
    <div style="border-left: 4px solid ${color}; padding: 12px 16px; margin-bottom: 12px; background: #f9f9f9; border-radius: 0 4px 4px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background: ${color}; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; font-family: monospace;">${label}</span>
        <strong style="font-size: 15px; color: #111;">${escapeHtml(action.title)}</strong>
      </div>
      <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.5;">${escapeHtml(action.description)}</p>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml(companyName: string, summary: string, actions: ActionItem[]): string {
  const today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const actionsHtml = actions.map(buildActionHtml).join('');

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twój dzienny brief</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background: #fff;">
  <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700;">Cyfrowy Pomocnik</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">${escapeHtml(companyName)} &middot; ${today}</p>
  </div>

  <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #0c4a6e;">${escapeHtml(summary)}</p>
  </div>

  <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">Akcje do zatwierdzenia (${actions.length})</h2>

  ${actionsHtml}

  <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px;">
    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
      Cyfrowy Pomocnik &middot; Zatwierdź lub odrzuć akcje w panelu
    </p>
  </div>
</body>
</html>
  `.trim();
}

export async function sendDailyBriefEmail(
  to: string,
  companyName: string,
  summary: string,
  actions: ActionItem[],
): Promise<void> {
  const resend = getResend();
  const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });

  await resend.emails.send({
    from: 'Cyfrowy Pomocnik <noreply@cyfrowypomocnik.pl>',
    to,
    subject: `Twój brief na ${today}: ${actions.length} ${actions.length === 1 ? 'akcja' : actions.length < 5 ? 'akcje' : 'akcji'}`,
    html: buildEmailHtml(companyName, summary, actions),
  });
}
```

- [ ] **Step 2: Create daily brief cron endpoint**

```typescript
// src/app/api/cp/cron/brief/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { generateBrief } from '@/lib/brief';
import { sendDailyBriefEmail } from '@/lib/email';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServer();

  // Get all users with company profiles
  const { data: companies, error } = await supabase
    .from('cp_companies')
    .select('user_id, name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!companies || companies.length === 0) {
    return NextResponse.json({ generated: 0, message: 'Brak firm do przetworzenia' });
  }

  let generated = 0;
  const errors: string[] = [];

  for (const company of companies) {
    try {
      const { summary, actions } = await generateBrief(company.user_id);

      // Attempt to send email if user has an email (via auth.users)
      // We use service role to read auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(company.user_id);
      const email = authUser?.user?.email;

      if (email && actions.length > 0) {
        try {
          await sendDailyBriefEmail(email, company.name, summary, actions);
        } catch {
          // Email failure doesn't break the cron
        }
      }

      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      errors.push(`${company.user_id}: ${msg}`);
    }
  }

  return NextResponse.json({ generated, errors: errors.length > 0 ? errors : undefined });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/email.ts src/app/api/cp/cron/brief/route.ts && git commit -m "feat: daily brief cron + Resend email digest"
```

---

### Task 12: Action Items API

**Files:**
- Create: `src/app/api/cp/actions/route.ts`
- Create: `src/app/api/cp/actions/[id]/route.ts`

- [ ] **Step 1: Create actions list route**

```typescript
// src/app/api/cp/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') ?? 'pending';

  let query = supabase
    .from('cp_action_items')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    const validStatuses = ['pending', 'approved', 'dismissed'];
    const status = validStatuses.includes(statusFilter) ? statusFilter : 'pending';
    query = query.eq('status', status);
  }

  const { data: actions, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ actions: actions ?? [] });
}
```

- [ ] **Step 2: Create action update route**

```typescript
// src/app/api/cp/actions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function generateNextStep(title: string, description: string): Promise<string> {
  const ai = getAI();
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Użytkownik zatwierdził akcję: "${title}". Opis: "${description}"\n\nPodaj jeden konkretny następny krok do wykonania TERAZ (maksymalnie 1 zdanie, po polsku, w formie polecenia np. "Otwórz fakturę i uzupełnij datę sprzedaży").`,
      },
    ],
    temperature: 0.3,
    max_tokens: 80,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Wykonaj zaplanowaną akcję.';
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['approved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'status musi być "approved" lub "dismissed"' }, { status: 400 });
  }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono akcji' }, { status: 404 });
  }

  // Update status
  const { data: action, error: updateError } = await supabase
    .from('cp_action_items')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If approved, generate next step
  if (status === 'approved') {
    try {
      const nextStep = await generateNextStep(existing.title, existing.description);
      return NextResponse.json({ action, status: 'approved', nextStep });
    } catch {
      // Degrade gracefully if AI fails
      return NextResponse.json({ action, status: 'approved', nextStep: 'Wykonaj zaplanowaną akcję.' });
    }
  }

  return NextResponse.json({ action });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/cp/actions/ && git commit -m "feat: action items API GET/PATCH with AI next-step on approve"
```

---

### Task 13: vercel.json + env setup

**Files:**
- Create: `vercel.json`
- Create: `.env.local.example`

- [ ] **Step 1: Create vercel.json with cron schedules**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cp/cron/news",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cp/cron/brief",
      "schedule": "0 7 * * *"
    }
  ]
}
```

- [ ] **Step 2: Create env example file**

```bash
# .env.local.example

# Supabase (shared with wezmezadarmo - same project, cp_* tables)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI - OpenRouter (model: google/gemini-2.0-flash-001)
OPENROUTER_API_KEY=

# Firecrawl - news scraping
FIRECRAWL_API_KEY=

# Resend - email digest
RESEND_API_KEY=

# Cron security - random secret, set same in Vercel dashboard
CRON_SECRET=
```

- [ ] **Step 3: Commit**
```bash
git add vercel.json .env.local.example && git commit -m "feat: vercel.json cron schedules + env example"
```

---

## Summary: Part B file tree

```
src/
  app/api/cp/
    company/route.ts          # Task 7: GET+POST company profile
    reminders/
      route.ts                # Task 8: GET+POST reminders
      [id]/route.ts           # Task 8: PATCH+DELETE reminder
    brief/route.ts            # Task 9: POST generate, GET latest
    actions/
      route.ts                # Task 12: GET actions list
      [id]/route.ts           # Task 12: PATCH approve/dismiss
    cron/
      news/route.ts           # Task 10: Firecrawl scrape cron
      brief/route.ts          # Task 11: Daily brief cron
  lib/
    brief.ts                  # Task 9: generateBrief() core logic
    firecrawl.ts              # Task 10: scrapeNewsForUser()
    email.ts                  # Task 11: sendDailyBriefEmail()
vercel.json                   # Task 13: cron schedule config
.env.local.example            # Task 13: required env vars
```

## Dependencies to install

```bash
npm install @mendable/firecrawl-js resend
```

---
# Part C: UI + Frontend (Tasks 14-25)

**Project:** `/Users/trading/cyfrowy-pomocnik/`
**Scope:** Root layout, auth pages, onboarding, panel layout, all components, dashboard

---

### Task 14: Root layout + globals.css

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyfrowy Pomocnik — AI dla Twojej firmy',
  description: 'Poranny brief, aktualności branżowe i centrum dowodzenia dla JDG i małych firm.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Write `src/app/globals.css`**

```css
:root {
  --green: #16a34a;
  --green-dark: #15803d;
  --green-light: #dcfce7;
  --green-bg: #f0fdf4;
  --green-border: #86efac;
  --bg: #f8fffe;
  --border-structural: #111;
  --border-card: #9ca3af;
  --text: #111;
  --text-2: #374151;
  --text-3: #6b7280;
  --text-4: #9ca3af;
  --urgent: #dc2626;
  --warn: #d97706;
  --blue: #1d4ed8;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
}

body {
  height: 100%;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/layout.tsx src/app/globals.css && git commit -m "feat: root layout and design system globals"
```

---

### Task 15: Landing page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/page.module.css`

- [ ] **Step 1: Write `src/app/page.tsx`**

```tsx
import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.root}>
      {/* Topnav */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </span>
        <div className={styles.navActions}>
          <Link href="/logowanie" className={styles.navLink}>Zaloguj się</Link>
          <Link href="/rejestracja" className={styles.navBtn}>Zacznij za darmo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Twój Cyfrowy Pracownik.<br />
            Działa kiedy Ty śpisz.
          </h1>
          <p className={styles.heroSub}>
            Każdego ranka dostajesz gotową listę akcji: przeterminowane faktury,
            okazje dotacyjne, zmiany przepisów i wpisy do kalendarza.
            Zero przeglądania, zero przegapionych terminów.
          </p>
          <div className={styles.heroCtaRow}>
            <Link href="/rejestracja" className={styles.heroCta}>Zacznij bezpłatnie</Link>
            <Link href="/logowanie" className={styles.heroCtaSecondary}>Mam już konto</Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>07:00</div>
          <h3 className={styles.featureTitle}>Poranny Brief</h3>
          <p className={styles.featureDesc}>
            AI generuje listę konkretnych akcji na dziś: co zatwierdzić, co pilne,
            co można poczekać. Wchodzisz na panel i wiesz dokładnie, co robić.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>RSS</div>
          <h3 className={styles.featureTitle}>Aktualności branżowe</h3>
          <p className={styles.featureDesc}>
            Firecrawl monitoruje strony Twojej branży, MF, ZUS, PARP.
            Dostajesz tylko to, co dotyczy Twojej firmy — bez szumu informacyjnego.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>AI</div>
          <h3 className={styles.featureTitle}>Centrum dowodzenia</h3>
          <p className={styles.featureDesc}>
            Faktury, terminy, marketing, dotacje i prawo w jednym miejscu.
            Siedmiu specjalistycznych agentów AI, jeden interfejs.
          </p>
        </div>
      </section>

      {/* CTA section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Gotowy na cyfrowego pracownika?</h2>
        <p className={styles.ctaDesc}>
          Bezpłatna rejestracja, bez karty kredytowej. Konfiguracja w 3 minuty.
        </p>
        <Link href="/rejestracja" className={styles.heroCta}>Zacznij bezpłatnie</Link>
      </section>

      <footer className={styles.footer}>
        <span>Cyfrowy Pomocnik &copy; 2025</span>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Nav */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 56px;
  border-bottom: 2px solid var(--border-structural);
  background: #fff;
  flex-shrink: 0;
}

.logo {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
}

.logoAccent {
  color: var(--green);
}

.navActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navLink {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}

.navLink:hover {
  background: var(--green-bg);
  color: var(--green-dark);
}

.navBtn {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  padding: 7px 16px;
  border-radius: 7px;
  transition: opacity 0.15s;
}

.navBtn:hover {
  opacity: 0.9;
}

/* Hero */
.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 32px 48px;
  text-align: center;
}

.heroInner {
  max-width: 640px;
}

.heroTitle {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  line-height: 1.1;
  color: var(--text);
  letter-spacing: -1px;
  margin-bottom: 20px;
}

.heroSub {
  font-size: 17px;
  color: var(--text-2);
  line-height: 1.65;
  margin-bottom: 32px;
}

.heroCtaRow {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.heroCta {
  display: inline-block;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  padding: 12px 28px;
  border-radius: 8px;
  transition: opacity 0.15s, transform 0.1s;
}

.heroCta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.heroCtaSecondary {
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-2);
  background: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  border: 1.5px solid var(--border-card);
  transition: border-color 0.15s, background 0.15s;
}

.heroCtaSecondary:hover {
  border-color: var(--green-border);
  background: var(--green-bg);
  color: var(--green-dark);
}

/* Features */
.features {
  display: flex;
  gap: 0;
  border-top: 2px solid var(--border-structural);
  border-bottom: 2px solid var(--border-structural);
}

.featureCard {
  flex: 1;
  padding: 32px 28px;
  border-right: 2px solid var(--border-structural);
  background: #fff;
}

.featureCard:last-child {
  border-right: none;
}

.featureIcon {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: var(--green-dark);
  background: var(--green-light);
  border: 1.5px solid var(--green-border);
  border-radius: 6px;
  padding: 4px 10px;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.featureTitle {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 10px;
}

.featureDesc {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.65;
}

/* CTA section */
.ctaSection {
  padding: 64px 32px;
  text-align: center;
  background: var(--green-bg);
  border-bottom: 2px solid var(--border-structural);
}

.ctaTitle {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
}

.ctaDesc {
  font-size: 15px;
  color: var(--text-3);
  margin-bottom: 24px;
}

/* Footer */
.footer {
  padding: 16px 32px;
  font-size: 12px;
  color: var(--text-4);
  text-align: center;
  background: #fff;
  border-top: 2px solid var(--border-structural);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx src/app/page.module.css && git commit -m "feat: landing page"
```

---

### Task 16: Logowanie page

**Files:**
- Create: `src/app/logowanie/page.tsx`
- Create: `src/app/logowanie/page.module.css`

- [ ] **Step 1: Write `src/app/logowanie/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function LogowanieePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: haslo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd logowania. Spróbuj ponownie.');
      } else {
        router.push('/panel');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </div>
        <h1 className={styles.heading}>Zaloguj się</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Adres e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="jan@firma.pl"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo" className={styles.label}>Hasło</label>
            <input
              id="haslo"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={haslo}
              onChange={e => setHaslo(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Nie masz konta?{' '}
          <Link href="/rejestracja" className={styles.switchA}>Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/logowanie/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 12px;
  padding: 36px 32px 28px;
}

.logo {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btn {
  height: 42px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switchLink {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
}

.switchA {
  color: var(--green-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/logowanie/ && git commit -m "feat: logowanie page"
```

---

### Task 17: Rejestracja page

**Files:**
- Create: `src/app/rejestracja/page.tsx`
- Create: `src/app/rejestracja/page.module.css`

- [ ] **Step 1: Write `src/app/rejestracja/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function RejestracjaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [haslo2, setHaslo2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (haslo.length < 6) return 'Hasło musi mieć co najmniej 6 znaków.';
    if (haslo !== haslo2) return 'Hasła nie są identyczne.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: haslo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd rejestracji. Spróbuj ponownie.');
      } else {
        router.push('/panel');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </div>
        <h1 className={styles.heading}>Utwórz konto</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Adres e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="jan@firma.pl"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo" className={styles.label}>Hasło</label>
            <input
              id="haslo"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="Min. 6 znaków"
              value={haslo}
              onChange={e => setHaslo(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo2" className={styles.label}>Powtórz hasło</label>
            <input
              id="haslo2"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={haslo2}
              onChange={e => setHaslo2(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Masz już konto?{' '}
          <Link href="/logowanie" className={styles.switchA}>Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/rejestracja/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 12px;
  padding: 36px 32px 28px;
}

.logo {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btn {
  height: 42px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switchLink {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
}

.switchA {
  color: var(--green-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/rejestracja/ && git commit -m "feat: rejestracja page with client-side validation"
```

---

### Task 18: Onboarding wizard

**Files:**
- Create: `src/components/OnboardingWizard.tsx`
- Create: `src/components/OnboardingWizard.module.css`

- [ ] **Step 1: Write `src/components/OnboardingWizard.tsx`**

```tsx
'use client';

import { useState } from 'react';
import styles from './OnboardingWizard.module.css';

const BRANZE = [
  'IT/SaaS',
  'E-commerce',
  'Usługi profesjonalne',
  'Produkcja',
  'Handel detaliczny',
  'Budownictwo',
  'Gastronomia/HoReCa',
  'Marketing/Agencja',
  'Finanse/Księgowość',
  'Inne',
];

const AGENTS = [
  { id: 'ag-00', code: 'AG-00', name: 'Asystent ogólny', desc: 'Routing i pytania ogólne' },
  { id: 'ag-01', code: 'AG-01', name: 'Faktury', desc: 'Przeterminowane płatności, szkice maili' },
  { id: 'ag-02', code: 'AG-02', name: 'Marketing', desc: 'Kalendarz social media, propozycje postów' },
  { id: 'ag-03', code: 'AG-03', name: 'Terminarz', desc: 'Umowy, OC, ZUS, deadliny' },
  { id: 'ag-04', code: 'AG-04', name: 'Dotacje', desc: 'Nabory PARP, BGK, programy regionalne' },
  { id: 'ag-05', code: 'AG-05', name: 'Świadczenia', desc: 'Ulgi i świadczenia ZUS dla JDG' },
  { id: 'ag-06', code: 'AG-06', name: 'Prawo', desc: 'Zmiany przepisów, interpretacje podatkowe' },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  // Step 1
  const [nazwa, setNazwa] = useState('');
  const [nip, setNip] = useState('');
  const [branza, setBranza] = useState('');

  // Step 2
  const [opis, setOdpis] = useState('');
  const [wyzwania, setWyzwania] = useState('');

  // Step 3
  const [activeAgents, setActiveAgents] = useState<string[]>(AGENTS.map(a => a.id));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAgent(id: string) {
    setActiveAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/cp/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nazwa,
          nip: nip || null,
          branza,
          opis,
          pain_points: wyzwania,
          active_agents: activeAgents,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Błąd zapisu danych firmy.');
        return;
      }
      await fetch('/api/cp/brief', { method: 'POST' });
      window.location.reload();
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        {/* Progress */}
        <div className={styles.progress}>
          <span className={styles.stepLabel}>Krok {step} z 3</span>
          <div className={styles.dots}>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className={n <= step ? styles.dotActive : styles.dot}
              />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Dane firmy</h2>
            <p className={styles.stepDesc}>Skonfigurujemy agentów pod Twoją działalność.</p>

            <div className={styles.field}>
              <label className={styles.label}>Nazwa firmy *</label>
              <input
                className={styles.input}
                type="text"
                required
                placeholder="np. Kowalski Digital sp. z o.o."
                value={nazwa}
                onChange={e => setNazwa(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>NIP (opcjonalne)</label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="0000000000"
                value={nip}
                onChange={e => setNip(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Branża *</label>
              <select
                className={styles.select}
                value={branza}
                onChange={e => setBranza(e.target.value)}
                required
              >
                <option value="">Wybierz branżę...</option>
                {BRANZE.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <button
              className={styles.nextBtn}
              disabled={!nazwa || !branza}
              onClick={() => setStep(2)}
            >
              Dalej
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Opis działalności</h2>
            <p className={styles.stepDesc}>Im więcej wiesz, tym lepiej agenci dopasują pomoc.</p>

            <div className={styles.field}>
              <label className={styles.label}>Opisz swoją działalność</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Np. Tworzymy oprogramowanie dla firm e-commerce, specjalizujemy się w integracji systemów..."
                value={opis}
                onChange={e => setOdpis(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Główne wyzwania / czego oczekujesz od AI?</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Np. Chcę monitorować konkurencję, pilnować faktur, znajdować dotacje..."
                value={wyzwania}
                onChange={e => setWyzwania(e.target.value)}
              />
            </div>

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>Wstecz</button>
              <button className={styles.nextBtn} onClick={() => setStep(3)}>Dalej</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Wybierz agentów AI</h2>
            <p className={styles.stepDesc}>Wszyscy aktywni domyślnie. Odznacz tych, których nie potrzebujesz.</p>

            <div className={styles.agentList}>
              {AGENTS.map(agent => (
                <label key={agent.id} className={styles.agentRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={activeAgents.includes(agent.id)}
                    onChange={() => toggleAgent(agent.id)}
                  />
                  <div className={styles.agentInfo}>
                    <span className={styles.agentCode}>{agent.code}</span>
                    <span className={styles.agentName}>{agent.name}</span>
                    <span className={styles.agentDesc}>{agent.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(2)}>Wstecz</button>
              <button
                className={styles.nextBtn}
                onClick={handleFinish}
                disabled={submitting || activeAgents.length === 0}
              >
                {submitting ? 'Konfigurowanie...' : 'Zakończ i uruchom'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/OnboardingWizard.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.wizard {
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  overflow: hidden;
}

.progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 2px solid var(--border-structural);
  background: var(--green-bg);
}

.stepLabel {
  font-size: 12px;
  font-weight: 700;
  color: var(--green-dark);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-border);
}

.dotActive {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}

.stepBody {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stepTitle {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.stepDesc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: -8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.select {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  cursor: pointer;
}

.select:focus {
  border-color: var(--green);
  background: #fff;
}

.textarea {
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  line-height: 1.5;
}

.textarea:focus {
  border-color: var(--green);
  background: #fff;
}

.agentList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agentRow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.agentRow:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

.checkbox {
  margin-top: 2px;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  accent-color: var(--green);
  cursor: pointer;
}

.agentInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agentCode {
  font-size: 10px;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: 0.8px;
}

.agentName {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.agentDesc {
  font-size: 12px;
  color: var(--text-3);
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btnRow {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.backBtn {
  height: 40px;
  padding: 0 20px;
  background: #fff;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s;
}

.backBtn:hover {
  background: var(--bg);
}

.nextBtn {
  height: 40px;
  padding: 0 24px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.nextBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.nextBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/OnboardingWizard.tsx src/components/OnboardingWizard.module.css && git commit -m "feat: onboarding wizard 3-step"
```

---

### Task 19: Panel layout (protected)

**Files:**
- Create: `src/app/panel/layout.tsx`
- Create: `src/app/panel/layout.module.css`

- [ ] **Step 1: Write `src/app/panel/layout.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import styles from './layout.module.css';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/logowanie');

  return (
    <div className={styles.panelRoot}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
      <ChatPanel />
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/panel/layout.module.css`**

```css
.panelRoot {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 2px solid var(--border-structural);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/panel/layout.tsx src/app/panel/layout.module.css && git commit -m "feat: panel layout with auth guard"
```

---

### Task 20: Sidebar component

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Sidebar.module.css`

- [ ] **Step 1: Write `src/components/Sidebar.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

type AgentStatus = 'active' | 'urgent' | 'waiting' | 'idle';

interface Agent {
  id: string;
  code: string;
  name: string;
  defaultStatus: AgentStatus;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

const AGENTS: Agent[] = [
  { id: 'ag-00', code: 'AG-00', name: 'Asystent ogólny', defaultStatus: 'active' },
  { id: 'ag-01', code: 'AG-01', name: 'Faktury', defaultStatus: 'idle' },
  { id: 'ag-02', code: 'AG-02', name: 'Marketing', defaultStatus: 'idle' },
  { id: 'ag-03', code: 'AG-03', name: 'Terminarz', defaultStatus: 'idle' },
  { id: 'ag-04', code: 'AG-04', name: 'Dotacje', defaultStatus: 'idle' },
  { id: 'ag-05', code: 'AG-05', name: 'Świadczenia', defaultStatus: 'idle' },
  { id: 'ag-06', code: 'AG-06', name: 'Prawo', defaultStatus: 'idle' },
];

const DOT_COLORS: Record<AgentStatus, string> = {
  active: '#16a34a',
  urgent: '#dc2626',
  waiting: '#d97706',
  idle: '#d1d5db',
};

export default function Sidebar() {
  const [activeAgentId, setActiveAgentId] = useState<string>('ag-00');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cp_history');
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        setHistory(parsed.slice(0, 5));
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoRow}>
        <span className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </span>
      </div>

      <button
        className={styles.newChatBtn}
        onClick={() => {
          setActiveAgentId('ag-00');
          window.dispatchEvent(new CustomEvent('cp:new-chat'));
        }}
      >
        + Nowa rozmowa
      </button>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Agenci AI</div>
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            className={activeAgentId === agent.id ? styles.agentItemActive : styles.agentItem}
            onClick={() => {
              setActiveAgentId(agent.id);
              window.dispatchEvent(new CustomEvent('cp:select-agent', { detail: agent.id }));
            }}
          >
            <span
              className={styles.agentDot}
              style={{ background: DOT_COLORS[agent.defaultStatus] }}
            />
            <span className={styles.agentCode}>{agent.code}</span>
            <span className={styles.agentName}>{agent.name}</span>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Historia</div>
          {history.map(item => (
            <div key={item.id} className={styles.historyItem}>
              <span className={styles.historyTitle}>{item.title}</span>
              <span className={styles.historyDate}>{item.date}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          &larr; Wróć na stronę
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write `src/components/Sidebar.module.css`**

```css
.sidebar {
  width: 224px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(180deg, #fff 0%, var(--bg) 100%);
  border-right: 2px solid var(--border-structural);
}

.logoRow {
  padding: 14px 14px 10px;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
}

.logo {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.newChatBtn {
  margin: 10px 10px 4px;
  padding: 8px 12px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  width: calc(100% - 20px);
  text-align: left;
  transition: opacity 0.15s;
}

.newChatBtn:hover {
  opacity: 0.9;
}

.section {
  padding: 6px 0;
  border-bottom: 1.5px solid #f3f4f6;
}

.sectionLabel {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 6px 14px 3px;
}

.agentItem {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 0;
  transition: background 0.12s;
}

.agentItem:hover {
  background: var(--green-bg);
}

.agentItemActive {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 14px;
  background: var(--green-bg);
  border: none;
  border-left: 3px solid var(--green);
  cursor: pointer;
  text-align: left;
  border-radius: 0;
}

.agentDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.agentCode {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.agentName {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.historyItem {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.12s;
}

.historyItem:hover {
  background: var(--bg);
}

.historyTitle {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.historyDate {
  font-size: 10px;
  color: var(--text-4);
}

.footer {
  margin-top: auto;
  padding: 12px 14px;
  border-top: 1.5px solid #f3f4f6;
  flex-shrink: 0;
}

.backLink {
  font-size: 12px;
  color: var(--text-3);
  display: inline-block;
  transition: color 0.12s;
}

.backLink:hover {
  color: var(--green-dark);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/Sidebar.tsx src/components/Sidebar.module.css && git commit -m "feat: sidebar with agent list and history"
```

---

### Task 21: BriefBar component

**Files:**
- Create: `src/components/BriefBar.tsx`
- Create: `src/components/BriefBar.module.css`

- [ ] **Step 1: Write `src/components/BriefBar.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './BriefBar.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  actions: ActionItem[];
}

function formatDate(d: Date): string {
  const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export default function BriefBar({ actions }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const urgent = actions.filter(a => a.priority === 'urgent');
  const warn = actions.filter(a => a.priority === 'warn');
  const info = actions.filter(a => a.priority === 'info');

  return (
    <div className={styles.bar}>
      <span className={styles.label}>BRIEF</span>

      {urgent.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#dc2626' }} />
          <span>
            {urgent.length > 1
              ? `${urgent.length} pilnych akcji`
              : urgent[0].title}
          </span>
        </div>
      )}

      {warn.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#d97706' }} />
          <span>
            {warn.length > 1
              ? `${warn.length} ważnych`
              : warn[0].title}
          </span>
        </div>
      )}

      {info.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#16a34a' }} />
          <span>{info.length} informacji</span>
        </div>
      )}

      {urgent.length === 0 && warn.length === 0 && info.length === 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#d1d5db' }} />
          <span>Brak nowych akcji</span>
        </div>
      )}

      <div className={styles.spacer} />
      <div className={styles.datetime}>
        <span className={styles.date}>{formatDate(now)}</span>
        <span className={styles.time}>{formatTime(now)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/BriefBar.module.css`**

```css
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #fff;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-4);
  letter-spacing: 1.2px;
  margin-right: 4px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text);
  background: #f9fafb;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 3px 9px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.pill:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spacer {
  flex: 1;
}

.datetime {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.date {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 500;
}

.time {
  font-size: 13px;
  color: var(--text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/BriefBar.tsx src/components/BriefBar.module.css && git commit -m "feat: BriefBar with priority pills and live clock"
```

---

### Task 22: ActionCard component

**Files:**
- Create: `src/components/ActionCard.tsx`
- Create: `src/components/ActionCard.module.css`

- [ ] **Step 1: Write `src/components/ActionCard.tsx`**

```tsx
'use client';

import { useState } from 'react';
import styles from './ActionCard.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  action: ActionItem;
  onStatusChange: (id: string, status: 'approved' | 'dismissed') => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'teraz';
  if (m < 60) return `${m}m temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h temu`;
  return `${Math.floor(h / 24)}d temu`;
}

const PRIORITY_STYLES: Record<string, { border: string; gradient: string }> = {
  urgent: {
    border: '#dc2626',
    gradient: 'linear-gradient(135deg, #fff 60%, #fff5f5)',
  },
  warn: {
    border: '#d97706',
    gradient: 'linear-gradient(135deg, #fff 60%, #fffbf0)',
  },
  info: {
    border: '#16a34a',
    gradient: 'linear-gradient(135deg, #fff 60%, #f0fdf4)',
  },
  running: {
    border: '#16a34a',
    gradient: '#f0fdf4',
  },
};

function TagBadge({ priority, type }: { priority: string; type: string }) {
  if (priority === 'urgent') {
    return <span className={`${styles.tag} ${styles.tagUrgent}`}>PILNE</span>;
  }
  if (priority === 'warn') {
    return <span className={`${styles.tag} ${styles.tagWarn}`}>UWAGA</span>;
  }
  if (priority === 'running') {
    return <span className={`${styles.tag} ${styles.tagRunning}`}>AGENT DZIALA</span>;
  }
  // info — derive from type
  const label = type === 'marketing'
    ? 'MARKETING'
    : type === 'dotacje'
    ? 'DOTACJE'
    : 'OGOLNY';
  return <span className={`${styles.tag} ${styles.tagInfo}`}>{label}</span>;
}

export default function ActionCard({ action, onStatusChange }: Props) {
  const [loading, setLoading] = useState<'approved' | 'dismissed' | null>(null);
  const ps = PRIORITY_STYLES[action.priority] ?? PRIORITY_STYLES.info;

  async function handleAction(newStatus: 'approved' | 'dismissed') {
    setLoading(newStatus);
    try {
      await fetch(`/api/cp/actions/${action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(action.id, newStatus);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div
      className={styles.card}
      style={{
        borderLeft: `3px solid ${ps.border}`,
        background: ps.gradient,
      }}
    >
      <div className={styles.topRow}>
        <TagBadge priority={action.priority} type={action.type} />
        <span className={styles.timeAgo}>{timeAgo(action.created_at)}</span>
      </div>
      <p className={styles.title}>{action.title}</p>
      <p className={styles.desc}>{action.description}</p>
      <div className={styles.btnRow}>
        <button
          className={styles.approveBtn}
          disabled={loading !== null}
          onClick={() => handleAction('approved')}
        >
          {loading === 'approved' ? 'Zatwierdzanie...' : 'Zatwierdź →'}
        </button>
        <button
          className={styles.dismissBtn}
          disabled={loading !== null}
          onClick={() => handleAction('dismissed')}
        >
          Odrzuć
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ActionCard.module.css`**

```css
.card {
  border: 1.5px solid var(--border-card);
  border-radius: 9px;
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  border-radius: 4px;
  padding: 2px 7px;
}

.tagUrgent {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.tagWarn {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.tagInfo {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.tagRunning {
  background: var(--green-light);
  color: var(--green-dark);
  border: 1px solid var(--green-border);
}

.timeAgo {
  font-size: 10px;
  color: var(--text-4);
}

.title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.desc {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
}

.btnRow {
  display: flex;
  gap: 7px;
  margin-top: 4px;
}

.approveBtn {
  flex: 1;
  height: 32px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.approveBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.approveBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dismissBtn {
  height: 32px;
  padding: 0 14px;
  background: #fff;
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid var(--border-card);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.dismissBtn:hover:not(:disabled) {
  background: #f9fafb;
  color: var(--text);
}

.dismissBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/ActionCard.tsx src/components/ActionCard.module.css && git commit -m "feat: ActionCard with approve/dismiss and optimistic feedback"
```

---

### Task 23: NewsItem + CalendarItem components

**Files:**
- Create: `src/components/NewsItem.tsx`
- Create: `src/components/NewsItem.module.css`
- Create: `src/components/CalendarItem.tsx`
- Create: `src/components/CalendarItem.module.css`

- [ ] **Step 1: Write `src/components/NewsItem.tsx`**

```tsx
'use client';

import styles from './NewsItem.module.css';

interface NewsItemData {
  id: string;
  source: string;
  title: string;
  url: string | null;
  relevance_tags: string[];
  scraped_at: string;
}

interface Props {
  item: NewsItemData;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'teraz';
  if (m < 60) return `${m}m temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h temu`;
  return `${Math.floor(h / 24)}d temu`;
}

export default function NewsItem({ item }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.source}>{item.source.toUpperCase()}</span>
        <span className={styles.time}>{timeAgo(item.scraped_at)}</span>
      </div>

      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.titleLink}
        >
          {item.title}
        </a>
      ) : (
        <p className={styles.title}>{item.title}</p>
      )}

      {item.relevance_tags.length > 0 && (
        <div className={styles.tags}>
          {item.relevance_tags.slice(0, 2).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/NewsItem.module.css`**

```css
.card {
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 11px 13px;
  margin-bottom: 7px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: border-color 0.12s;
}

.card:hover {
  border-color: var(--green-border);
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.source {
  font-size: 9px;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: 0.8px;
}

.time {
  font-size: 10px;
  color: var(--text-4);
}

.titleLink {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  text-decoration: none;
  transition: color 0.12s;
}

.titleLink:hover {
  color: var(--green-dark);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}

.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1px 6px;
}
```

- [ ] **Step 3: Write `src/components/CalendarItem.tsx`**

```tsx
'use client';

import styles from './CalendarItem.module.css';

interface ReminderData {
  id: string;
  title: string;
  due_date: string;
  type: string;
  status: string;
}

interface Props {
  reminder: ReminderData;
}

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

function Badge({ type }: { type: string }) {
  if (type === 'zus') return <span className={`${styles.badge} ${styles.badgeZus}`}>ZUS</span>;
  if (type === 'oc') return <span className={`${styles.badge} ${styles.badgeOc}`}>OC</span>;
  if (type === 'ai') return <span className={`${styles.badge} ${styles.badgeAi}`}>AI</span>;
  return <span className={`${styles.badge} ${styles.badgeOther}`}>!</span>;
}

export default function CalendarItem({ reminder }: Props) {
  const d = new Date(reminder.due_date);
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];

  return (
    <div className={styles.card}>
      <div className={styles.dateBox}>
        <span className={styles.day}>{day}</span>
        <span className={styles.month}>{month}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.title}>{reminder.title}</p>
          <Badge type={reminder.type} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/CalendarItem.module.css`**

```css
.card {
  display: flex;
  gap: 10px;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 7px;
  background: #fff;
  align-items: center;
  transition: border-color 0.12s;
}

.card:hover {
  border-color: var(--green-border);
}

.dateBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 38px;
}

.day {
  font-size: 22px;
  font-weight: 900;
  color: var(--green);
  line-height: 1;
}

.month {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content {
  flex: 1;
  min-width: 0;
}

.topRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
  flex: 1;
}

.badge {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
}

.badgeZus {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.badgeOc {
  background: #faf5ff;
  color: #7c3aed;
  border: 1px solid #c4b5fd;
}

.badgeAi {
  background: var(--green-light);
  color: var(--green-dark);
  border: 1px solid var(--green-border);
}

.badgeOther {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
```

- [ ] **Step 5: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**
```bash
git add src/components/NewsItem.tsx src/components/NewsItem.module.css src/components/CalendarItem.tsx src/components/CalendarItem.module.css && git commit -m "feat: NewsItem and CalendarItem components"
```

---

### Task 24: ChatPanel component

**Files:**
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/ChatPanel.module.css`

- [ ] **Step 1: Write `src/components/ChatPanel.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatPanel.module.css';

type AgentId = 'ag-00' | 'ag-01' | 'ag-02' | 'ag-03' | 'ag-04' | 'ag-05' | 'ag-06';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AGENT_LABELS: Record<AgentId, string> = {
  'ag-00': 'Asystent ogólny',
  'ag-01': 'Faktury',
  'ag-02': 'Marketing',
  'ag-03': 'Terminarz',
  'ag-04': 'Dotacje',
  'ag-05': 'Świadczenia',
  'ag-06': 'Prawo',
};

const QUICK_CHIPS: { label: string; agentId: AgentId; text: string }[] = [
  { label: 'Przeterminowane faktury', agentId: 'ag-01', text: 'Pokaż przeterminowane faktury' },
  { label: 'Mail do klienta', agentId: 'ag-00', text: 'Napisz mail do klienta' },
  { label: 'Dotacje dla mnie', agentId: 'ag-04', text: 'Jakie dotacje mi pasują?' },
  { label: 'Post LinkedIn', agentId: 'ag-02', text: 'Przygotuj post na LinkedIn' },
  { label: 'Terminy ZUS', agentId: 'ag-03', text: 'Pilnuj moich terminów ZUS' },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentId>('ag-00');
  const [agentLabel, setAgentLabel] = useState<string>('Asystent ogólny');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleSelectAgent(e: Event) {
      const id = (e as CustomEvent<string>).detail as AgentId;
      if (id in AGENT_LABELS) {
        setActiveAgent(id);
        setAgentLabel(AGENT_LABELS[id]);
      }
    }
    function handleNewChat() {
      setMessages([]);
      setActiveAgent('ag-00');
      setAgentLabel('Asystent ogólny');
    }
    window.addEventListener('cp:select-agent', handleSelectAgent);
    window.addEventListener('cp:new-chat', handleNewChat);
    return () => {
      window.removeEventListener('cp:select-agent', handleSelectAgent);
      window.removeEventListener('cp:new-chat', handleNewChat);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string, overrideAgent?: AgentId) {
    const agent = overrideAgent ?? activeAgent;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantPlaceholder: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantPlaceholder]);

    try {
      const res = await fetch('/api/cp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          agentId: agent,
        }),
      });

      if (!res.body) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: 'Brak odpowiedzi z serwera.' };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const { text: chunk } = JSON.parse(line.slice(6)) as { text: string };
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + chunk };
                return updated;
              });
            } catch {
              // skip malformed chunk
            }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Błąd połączenia z agentem.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !streaming) {
        sendMessage(input.trim());
      }
    }
  }

  return (
    <aside className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.agentDot} />
          <span className={styles.agentName}>{agentLabel}</span>
        </div>
        <span className={styles.agentId}>{activeAgent.toUpperCase()}</span>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <p className={styles.welcomeTitle}>Jak mogę pomóc?</p>
            <p className={styles.welcomeSub}>Szybkie akcje:</p>
            <div className={styles.chips}>
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  className={styles.chip}
                  onClick={() => {
                    setActiveAgent(chip.agentId);
                    setAgentLabel(AGENT_LABELS[chip.agentId]);
                    sendMessage(chip.text, chip.agentId);
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? styles.msgUser : styles.msgAssistant}
          >
            {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        Twoje dane nie są zapisywane na serwerze. Każda rozmowa znika po zamknięciu karty.
      </div>

      {/* Attachment bar */}
      <div className={styles.attachBar}>
        <button className={styles.attachBtn}>+ Faktura</button>
        <button className={styles.attachBtn}>+ Dokument</button>
        <button className={styles.attachBtn}>+ Profil firmy</button>
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder="Napisz do agenta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={streaming}
        />
        <button
          className={styles.sendBtn}
          disabled={!input.trim() || streaming}
          onClick={() => sendMessage(input.trim())}
        >
          {streaming ? '...' : '→'}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write `src/components/ChatPanel.module.css`**

```css
.panel {
  width: 340px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 2px solid var(--border-structural);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
  background: linear-gradient(180deg, #fff 0%, var(--green-bg) 100%);
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 7px;
}

.agentDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}

.agentName {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.agentId {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 0.5px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.messages::-webkit-scrollbar {
  width: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: var(--border-card);
  border-radius: 2px;
}

.welcome {
  padding: 8px 4px;
}

.welcomeTitle {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.welcomeSub {
  font-size: 11px;
  color: var(--text-3);
  margin-bottom: 10px;
}

.chips {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chip {
  padding: 7px 11px;
  background: var(--bg);
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.chip:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
  color: var(--green-dark);
}

.msgUser {
  align-self: flex-end;
  background: var(--green);
  color: #fff;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 10px 10px 2px 10px;
  max-width: 85%;
  line-height: 1.45;
  word-break: break-word;
}

.msgAssistant {
  align-self: flex-start;
  background: var(--bg);
  border: 1.5px solid var(--border-card);
  color: var(--text);
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 10px 10px 10px 2px;
  max-width: 90%;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-wrap;
}

.disclaimer {
  font-size: 10px;
  color: var(--text-4);
  padding: 4px 12px;
  text-align: center;
  flex-shrink: 0;
  border-top: 1px solid #f3f4f6;
}

.attachBar {
  display: flex;
  gap: 5px;
  padding: 6px 10px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.attachBtn {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 3px 8px;
  cursor: pointer;
  transition: background 0.12s;
}

.attachBtn:hover {
  background: var(--green-bg);
  color: var(--green-dark);
  border-color: var(--green-border);
}

.inputRow {
  display: flex;
  gap: 6px;
  padding: 8px 10px 10px;
  border-top: 2px solid var(--border-structural);
  flex-shrink: 0;
  align-items: flex-end;
}

.input {
  flex: 1;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
  resize: none;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.4;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.input:disabled {
  opacity: 0.6;
}

.sendBtn {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.sendBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.sendBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/ChatPanel.tsx src/components/ChatPanel.module.css && git commit -m "feat: ChatPanel with streaming and quick chips"
```

---

### Task 25: Main dashboard page

**Files:**
- Create: `src/app/panel/page.tsx`
- Create: `src/app/panel/page.module.css`
- Create: `src/components/DashboardClient.tsx`

- [ ] **Step 1: Write `src/components/DashboardClient.tsx`**

```tsx
'use client';

import { useState } from 'react';
import ActionCard from './ActionCard';
import styles from '../app/panel/page.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  initialActions: ActionItem[];
}

export default function DashboardClient({ initialActions }: Props) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  function handleStatusChange(id: string, status: 'approved' | 'dismissed') {
    setActions(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      {actions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onStatusChange={handleStatusChange}
        />
      ))}
      {actions.length === 0 && (
        <div className={styles.emptyCol}>
          <span className={styles.emptyIcon}>✓</span>
          <p className={styles.emptyText}>Wszystko zatwierdzone</p>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write `src/app/panel/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase';
import OnboardingWizard from '@/components/OnboardingWizard';
import BriefBar from '@/components/BriefBar';
import DashboardClient from '@/components/DashboardClient';
import NewsItem from '@/components/NewsItem';
import CalendarItem from '@/components/CalendarItem';
import styles from './page.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface NewsItemData {
  id: string;
  source: string;
  title: string;
  url: string | null;
  relevance_tags: string[];
  scraped_at: string;
}

interface ReminderData {
  id: string;
  title: string;
  due_date: string;
  type: string;
  status: string;
}

export default async function PanelPage() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/logowanie');

  const { data: company } = await supabase
    .from('cp_companies')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!company) {
    return <OnboardingWizard />;
  }

  const { data: actionsRaw } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: newsRaw } = await supabase
    .from('cp_news_items')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('scraped_at', new Date(Date.now() - 86400000).toISOString())
    .order('scraped_at', { ascending: false })
    .limit(10);

  const { data: remindersRaw } = await supabase
    .from('cp_reminders')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .lte('due_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
    .order('due_date', { ascending: true })
    .limit(10);

  const actions = (actionsRaw ?? []) as ActionItem[];
  const news = (newsRaw ?? []) as NewsItemData[];
  const reminders = (remindersRaw ?? []) as ReminderData[];

  return (
    <>
      <BriefBar actions={actions} />
      <div className={styles.columns}>
        <div className={styles.col}>
          <div className={styles.colHeader}>
            Akcje do zatwierdzenia
            <span className={styles.colCount}>{actions.length}</span>
          </div>
          <div className={styles.colBody}>
            <DashboardClient initialActions={actions} />
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colHeader}>
            Aktualności branżowe
            <span className={styles.colCount}>{news.length}</span>
          </div>
          <div className={styles.colBody}>
            {news.map(item => (
              <NewsItem key={item.id} item={item} />
            ))}
            {news.length === 0 && (
              <div className={styles.emptyCol}>
                <p className={styles.emptyText}>Brak nowych aktualności</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colHeader}>
            Kalendarz AI
            <span className={styles.colCount}>{reminders.length}</span>
          </div>
          <div className={styles.colBody}>
            {reminders.map(r => (
              <CalendarItem key={r.id} reminder={r} />
            ))}
            {reminders.length === 0 && (
              <div className={styles.emptyCol}>
                <p className={styles.emptyText}>Brak terminów w ciągu 30 dni</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Write `src/app/panel/page.module.css`**

```css
.columns {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.col {
  flex: 1;
  border-right: 2px solid var(--border-structural);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.col:last-child {
  border-right: none;
}

.colHeader {
  padding: 9px 14px 8px;
  border-bottom: 2px solid var(--border-structural);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #fff 0%, #f9fafb 100%);
}

.colCount {
  background: var(--border-structural);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 10px;
  color: #fff;
  font-weight: 700;
}

.colBody {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: var(--bg);
}

.colBody::-webkit-scrollbar {
  width: 3px;
}

.colBody::-webkit-scrollbar-thumb {
  background: var(--border-card);
  border-radius: 2px;
}

.emptyCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 6px;
  color: var(--text-4);
}

.emptyIcon {
  font-size: 20px;
  color: var(--green);
}

.emptyText {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-4);
  text-align: center;
}
```

- [ ] **Step 4: Fix `DashboardClient.tsx` import path**

The `DashboardClient.tsx` in `src/components/` references `'../app/panel/page.module.css'` which is a cross-boundary import. Move the empty state styles inline or extract shared styles. Replace the import in `DashboardClient.tsx` with a local module.

Create `src/components/DashboardClient.module.css`:

```css
.emptyCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 6px;
}

.emptyIcon {
  font-size: 20px;
  color: var(--green);
}

.emptyText {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-4);
  text-align: center;
}
```

Update `src/components/DashboardClient.tsx` to use `./DashboardClient.module.css` instead:

```tsx
'use client';

import { useState } from 'react';
import ActionCard from './ActionCard';
import styles from './DashboardClient.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  initialActions: ActionItem[];
}

export default function DashboardClient({ initialActions }: Props) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  function handleStatusChange(id: string, _status: 'approved' | 'dismissed') {
    setActions(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      {actions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onStatusChange={handleStatusChange}
        />
      ))}
      {actions.length === 0 && (
        <div className={styles.emptyCol}>
          <span className={styles.emptyIcon}>&#10003;</span>
          <p className={styles.emptyText}>Wszystko zatwierdzone</p>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**
```bash
git add src/app/panel/page.tsx src/app/panel/page.module.css src/components/DashboardClient.tsx src/components/DashboardClient.module.css && git commit -m "feat: dashboard page with 3-column layout and server-side data fetching"
```
