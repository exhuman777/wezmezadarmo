# Multi-Agent System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przebudowa AI chatu z 6 trybów na 8 wyspecjalizowanych agentów z auto-routingiem po keywordach, wiedzą w .md per folder, selektywnymi prefetcherami.

**Architecture:** Każdy agent = folder z agent.md (persona), knowledge.md (dane), keywords.json (triggery routera), prefetch.json (które API odpalić). Router analizuje wiadomość usera i wybiera agenta. Registry czyta .md i buduje prompt. Chat route łączy routing + selective prefetch + OpenRouter streaming.

**Tech Stack:** Next.js 16, TypeScript strict, OpenRouter API, Supabase, vitest. Zero nowych deps.

**Spec:** `docs/superpowers/specs/2026-05-25-multi-agent-system-design.md`

---

## File Structure

**Nowe pliki:**

```
src/agents/
  _base/
    identity.md         # wspólna tożsamość + anty-halucynacje + ton
    formatting.md       # reguły formatowania
    live-sources.md     # opis 11 narzędzi Centrum Obywatela
  konsjerz/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  swiadczenia/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  wnioski/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  nfz-zdrowie/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  finanse-jdg/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  dotacje/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  prawo-terminy/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  rolnik/
    agent.md, knowledge.md, keywords.json, prefetch.json, sources.md
  router.ts             # routeToAgent()
  router.test.ts        # testy routera

src/agents/types.ts     # nowy AgentId + AgentConfig
src/agents/registry.ts  # nowy - czyta .md, buduje prompty
```

**Modyfikowane pliki:**

```
src/app/api/agent/chat/route.ts        # router + selective prefetch
src/components/AgentPanelSidebar.tsx    # 8 agentów
src/app/agent/panel/AgentModeContext.tsx # AgentId zamiast AgentMode
src/app/agent/panel/layout.tsx          # updated context type
src/app/agent/panel/chat/page.tsx       # agent indicator chip
src/app/panel/chat/page.tsx             # updated import
```

**Usuwane pliki (po migracji):**

```
src/agents/knowledge/ogolny.ts
src/agents/knowledge/swiadczenie.ts
src/agents/knowledge/wniosek.ts
src/agents/knowledge/nabor.ts
src/agents/knowledge/faktura.ts
src/agents/knowledge/termin.ts
src/agents/base-prompt.ts
```

---

## Task 1: Types + AgentConfig

**Files:**
- Modify: `src/agents/types.ts`

- [ ] **Step 1: Redefine types**

Replace the `AgentMode` type and `AgentKnowledge` interface with new agent system types:

```typescript
import type { UserProfile, MatchResult } from '@/engine/types';

export const AGENT_IDS = [
  'konsjerz', 'swiadczenia', 'wnioski', 'nfz-zdrowie',
  'finanse-jdg', 'dotacje', 'prawo-terminy', 'rolnik',
] as const;

export type AgentId = typeof AGENT_IDS[number];

// Backward compat alias - remove after full migration
export type AgentMode = AgentId;

export type PrefetchSource = 'nfz' | 'gios' | 'nbp' | 'whitelist' | 'ceidg' | 'imgw' | 'eli' | 'bdl-gus' | 'benefits';

export interface AgentConfig {
  id: AgentId;
  label: string;
  desc: string;
  icon: string;
  keywords: string[];
  prefetch: PrefetchSource[];
  agentPrompt: string;    // agent.md content
  knowledge: string;      // knowledge.md content
  sources: string;        // sources.md content
}

// Keep existing interfaces unchanged
export interface RssContextItem {
  sourceId: string;
  source: string;
  title: string;
  description: string;
  link: string;
  pubDate: string | null;
  audiences: string[];
}

export interface RssSubscriptionContext {
  active: boolean;
  source_ids: string[];
  audiences: string[];
  keywords: string[];
  last_sent_at: string | null;
}

export interface AgentContext {
  profile: Record<string, unknown> | null;
  profileType: 'jdg' | 'private' | null;
  matchedBenefits: MatchResult[] | null;
  userProfile: UserProfile | null;
  focusedBenefitId?: string | null;
  recentRssItems?: RssContextItem[] | null;
  rssSubscription?: RssSubscriptionContext | null;
  extraContext?: string | null;
}
```

- [ ] **Step 2: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: errors in files importing old `AgentKnowledge` (registry.ts, knowledge/*.ts). These files will be replaced in later tasks, so errors are expected and OK.

- [ ] **Step 3: Commit**

```bash
git add src/agents/types.ts
git commit -m "feat: AgentId type (8 agents) + AgentConfig interface + PrefetchSource"
```

---

## Task 2: Base markdown files

**Files:**
- Create: `src/agents/_base/identity.md`
- Create: `src/agents/_base/formatting.md`
- Create: `src/agents/_base/live-sources.md`

- [ ] **Step 1: Extract identity from base-prompt.ts**

Read `src/agents/base-prompt.ts` and extract these sections into separate .md files:

`src/agents/_base/identity.md`:
- Copy content of `BASE_IDENTITY` const (lines ~8-9)
- Copy content of `BASE_ANTI_HALLUCINATION` const (lines ~11-42)
- Copy content of `BASE_TONE` const (lines ~73-83)
- Combine into one .md file with section headers

`src/agents/_base/formatting.md`:
- Copy content of `BASE_FORMATTING` const (lines ~44-71)

`src/agents/_base/live-sources.md`:
- Copy content of `BASE_LIVE_SOURCES` const (lines ~111-193)
- Copy content of `BASE_DATA_CONTEXT` const (lines ~85-109)

Each file: plain text, no frontmatter, ready to be concatenated into system prompt.

- [ ] **Step 2: Commit**

```bash
git add src/agents/_base/
git commit -m "feat: base markdown files (identity, formatting, live-sources) extracted from base-prompt.ts"
```

---

## Task 3: 8 agent folders - content files

**Files:**
- Create: `src/agents/{konsjerz,swiadczenia,wnioski,nfz-zdrowie,finanse-jdg,dotacje,prawo-terminy,rolnik}/{agent.md,knowledge.md,keywords.json,prefetch.json,sources.md}`

This task creates 40 files (8 agents x 5 files each). Content sources:

| Agent | Content source |
|-------|---------------|
| konsjerz | `knowledge/ogolny.ts` persona + domainKnowledge + ADD: list of 7 other agents with descriptions |
| swiadczenia | `knowledge/swiadczenie.ts` all sections |
| wnioski | `knowledge/wniosek.ts` all sections |
| nfz-zdrowie | MERGE: NFZ parts from `ogolny.ts` + `swiadczenie.ts` (health benefits) + GIOŚ knowledge from `base-prompt.ts` |
| finanse-jdg | MERGE: `faktura.ts` all sections + NBP/CEIDG/VAT from `base-prompt.ts` |
| dotacje | `knowledge/nabor.ts` all sections |
| prawo-terminy | MERGE: `termin.ts` all sections + ELI knowledge from `base-prompt.ts` |
| rolnik | NEW: KRUS benefits from `benefits/krus.ts` + ARiMR from `nabor.ts` (ARiMR section) + IMGW/GUS from `base-prompt.ts` |

- [ ] **Step 1: Create keyword + prefetch JSON for all 8 agents**

`src/agents/konsjerz/keywords.json`:
```json
[]
```

`src/agents/konsjerz/prefetch.json`:
```json
[]
```

`src/agents/swiadczenia/keywords.json`:
```json
["świadczenie", "świadczenia", "zasiłek", "zasiłku", "co mi się należy", "co mi przysługuje", "kwalifikuję", "800+", "becikowe", "kosiniakowe", "renta", "emerytura", "dodatek", "bon", "refundacja", "dofinansowanie do", "ile dostanę", "ulga", "przysługuje mi"]
```

`src/agents/swiadczenia/prefetch.json`:
```json
["benefits"]
```

`src/agents/wnioski/keywords.json`:
```json
["wniosek", "wniosku", "formularz", "wypełnić", "wypełniać", "Z-15", "z15", "ZAS-53", "zas53", "PEL", "ERPO", "ERSU", "ERU", "ERN", "PDF", "jak złożyć", "gdzie złożyć", "druk", "NLnet"]
```

`src/agents/wnioski/prefetch.json`:
```json
[]
```

`src/agents/nfz-zdrowie/keywords.json`:
```json
["lekarz", "lekarza", "lekarka", "NFZ", "nfz", "kolejka", "kolejki", "czekam", "oczekiwanie", "szpital", "przychodnia", "poradnia", "POZ", "specjalista", "endokrynolog", "kardiolog", "ortopeda", "neurolog", "dermatolog", "okulist", "urolog", "gastrolog", "psychiatra", "ginekolog", "stomatolog", "dentysta", "fizjoterapeut", "rehabilitacja", "refundacja leku", "lek", "recepta", "powietrze", "smog", "PM10", "PM2.5", "astma", "alergia", "zdrowie"]
```

`src/agents/nfz-zdrowie/prefetch.json`:
```json
["nfz", "gios"]
```

`src/agents/finanse-jdg/keywords.json`:
```json
["kurs", "kursy", "euro", "EUR", "USD", "dolar", "frank", "CHF", "GBP", "walut", "wymiana", "NIP", "VAT", "biała lista", "kontrahent", "CEIDG", "działalność", "JDG", "firma", "jednoosobowa", "KSeF", "faktura", "podatek", "PIT", "CIT", "ZUS składki", "ulga na start", "preferencyjny ZUS", "mały ZUS", "wakacje składkowe", "konto firmowe", "księgowość"]
```

`src/agents/finanse-jdg/prefetch.json`:
```json
["nbp", "whitelist", "ceidg"]
```

`src/agents/dotacje/keywords.json`:
```json
["dotacja", "dotacje", "dofinansowanie", "grant", "PARP", "NCBiR", "KFS", "szkolenie", "bon szkoleniowy", "bon zasiedleniowy", "staż", "PUP", "urząd pracy", "jednorazowe środki", "Aktywny Samorząd", "PFRON", "BGK", "gwarancja", "Czyste Powietrze", "Mój Prąd", "FENG", "Fundusze Europejskie", "nabór"]
```

`src/agents/dotacje/prefetch.json`:
```json
[]
```

`src/agents/prawo-terminy/keywords.json`:
```json
["zmiana w prawie", "nowelizacja", "ustawa", "rozporządzenie", "kiedy wejdzie", "termin", "deadline", "do kiedy", "PIT roczny", "ZUS miesięczny", "PFRON termin", "ELI", "Sejm", "Dziennik Ustaw", "przepis", "obowiązuje od", "kalendarz"]
```

`src/agents/prawo-terminy/prefetch.json`:
```json
["eli"]
```

`src/agents/rolnik/keywords.json`:
```json
["rolnik", "rolnictwo", "KRUS", "ARiMR", "działka", "działki", "dopłaty", "dopłaty bezpośrednie", "Młody Rolnik", "gospodarstwo", "geoportal", "pogoda", "burza", "mróz", "przymrozki", "powódź", "ostrzeżenie", "alert", "RCB", "IMGW", "gmina", "dane gminy", "bezrobocie w", "ludność"]
```

`src/agents/rolnik/prefetch.json`:
```json
["imgw", "bdl-gus"]
```

- [ ] **Step 2: Create agent.md for all 8 agents**

Each `agent.md` contains: persona (who the agent is, role, style), response rules, boundaries (what NOT to do), and 2-3 example interactions.

Port content from corresponding `src/agents/knowledge/*.ts` files:
- `konsjerz/agent.md` ← `ogolny.ts` (persona + responseRules + boundaries + examples)
- `swiadczenia/agent.md` ← `swiadczenie.ts`
- `wnioski/agent.md` ← `wniosek.ts`
- `nfz-zdrowie/agent.md` ← NEW (health-focused persona, combine NFZ + GIOŚ knowledge from ogolny.ts responseRules section 5)
- `finanse-jdg/agent.md` ← `faktura.ts` (expand to cover NBP/VAT/CEIDG)
- `dotacje/agent.md` ← `nabor.ts`
- `prawo-terminy/agent.md` ← `termin.ts`
- `rolnik/agent.md` ← NEW (agriculture-focused persona)

Add to EVERY agent.md at the top:
```markdown
Działasz wewnątrz platformy wezmezadarmo.com. Masz dostęp do profilu użytkownika, bazy 118 świadczeń, live API rządowych (NFZ, NBP, GIOŚ, MF, GUS, Sejm) i aktualności RSS z 8 instytucji.
```

For konsjerz/agent.md ADDITIONALLY include a section listing all 7 other agents:
```markdown
## Agenci specjalistyczni (możesz o nich opowiedzieć i do nich kierować):

1. ŚWIADCZENIA - ekspert od 118 świadczeń, zasiłków, ulg. Dopasowuje do profilu.
2. WNIOSKI - pomaga wypełnić 8 formularzy ZUS krok po kroku, generuje PDF.
3. NFZ/ZDROWIE - kolejki, lekarze, refundacja leków, jakość powietrza, smog.
4. FINANSE/JDG - kursy walut, biała lista VAT, CEIDG, KSeF, podatki, ulgi ZUS.
5. DOTACJE - PUP, PFRON, PARP, NCBiR, BGK, KFS, granty, dofinansowania.
6. PRAWO/TERMINY - zmiany w przepisach, kalendarz terminów urzędowych.
7. ROLNIK - KRUS, ARiMR, dopłaty, pogoda, dane gminy.
```

- [ ] **Step 3: Create knowledge.md for all 8 agents**

Port `domainKnowledge` string from corresponding TS files to markdown format. Content stays the same, just wrapped in markdown:
- `konsjerz/knowledge.md` ← `ogolny.ts:domainKnowledge`
- `swiadczenia/knowledge.md` ← `swiadczenie.ts:domainKnowledge`
- `wnioski/knowledge.md` ← `wniosek.ts:domainKnowledge`
- `nfz-zdrowie/knowledge.md` ← extract health-related from `ogolny.ts` + NFZ API capabilities from `base-prompt.ts` (NFZ section)
- `finanse-jdg/knowledge.md` ← `faktura.ts:domainKnowledge` + NBP/VAT/CEIDG sections from `base-prompt.ts`
- `dotacje/knowledge.md` ← `nabor.ts:domainKnowledge`
- `prawo-terminy/knowledge.md` ← `termin.ts:domainKnowledge` + ELI section from `base-prompt.ts`
- `rolnik/knowledge.md` ← extract KRUS from `benefits/krus.ts` + ARiMR from `nabor.ts` + IMGW/GUS from `base-prompt.ts`

- [ ] **Step 4: Create sources.md for all 8 agents**

Port `sources` array from TS files to markdown list.

- [ ] **Step 5: Commit**

```bash
git add src/agents/konsjerz/ src/agents/swiadczenia/ src/agents/wnioski/ src/agents/nfz-zdrowie/ src/agents/finanse-jdg/ src/agents/dotacje/ src/agents/prawo-terminy/ src/agents/rolnik/
git commit -m "feat: 8 agent folders with .md knowledge, keywords, prefetch configs"
```

---

## Task 4: Router implementation + test

**Files:**
- Create: `src/agents/router.ts`
- Create: `src/agents/router.test.ts`

- [ ] **Step 1: Write router test**

```typescript
import { describe, it, expect } from 'vitest';
import { routeToAgent } from './router';

describe('routeToAgent', () => {
  it('routes NFZ questions to nfz-zdrowie', () => {
    expect(routeToAgent('Ile czekam do kardiologa?')).toBe('nfz-zdrowie');
    expect(routeToAgent('Znajdź mi lekarza w Lublinie')).toBe('nfz-zdrowie');
    expect(routeToAgent('Jaka jest jakość powietrza?')).toBe('nfz-zdrowie');
  });

  it('routes benefit questions to swiadczenia', () => {
    expect(routeToAgent('Co mi się należy?')).toBe('swiadczenia');
    expect(routeToAgent('Czy przysługuje mi 800+?')).toBe('swiadczenia');
  });

  it('routes form questions to wnioski', () => {
    expect(routeToAgent('Jak wypełnić Z-15a?')).toBe('wnioski');
    expect(routeToAgent('Potrzebuję formularz PEL')).toBe('wnioski');
  });

  it('routes currency questions to finanse-jdg', () => {
    expect(routeToAgent('Ile kosztuje euro?')).toBe('finanse-jdg');
    expect(routeToAgent('Sprawdź NIP 5252548768')).toBe('finanse-jdg');
  });

  it('routes grant questions to dotacje', () => {
    expect(routeToAgent('Jakie dotacje dla JDG?')).toBe('dotacje');
    expect(routeToAgent('Dofinansowanie PARP')).toBe('dotacje');
  });

  it('routes law questions to prawo-terminy', () => {
    expect(routeToAgent('Co zmienia się w prawie?')).toBe('prawo-terminy');
    expect(routeToAgent('Kiedy termin PIT roczny?')).toBe('prawo-terminy');
  });

  it('routes farmer questions to rolnik', () => {
    expect(routeToAgent('Dopłaty ARiMR')).toBe('rolnik');
    expect(routeToAgent('Pogoda dla rolnika')).toBe('rolnik');
  });

  it('falls back to konsjerz for generic messages', () => {
    expect(routeToAgent('Cześć')).toBe('konsjerz');
    expect(routeToAgent('Dzień dobry')).toBe('konsjerz');
  });

  it('uses profile bias for JDG users on ambiguous queries', () => {
    expect(routeToAgent('Co nowego?', 'jdg')).toBe('finanse-jdg');
    expect(routeToAgent('Co nowego?', 'private')).toBe('konsjerz');
  });
});
```

- [ ] **Step 2: Implement router**

`src/agents/router.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import type { AgentId } from './types';
import { AGENT_IDS } from './types';

const keywordsCache = new Map<AgentId, string[]>();

function loadKeywords(agentId: AgentId): string[] {
  if (keywordsCache.has(agentId)) return keywordsCache.get(agentId)!;
  try {
    const filePath = path.join(process.cwd(), 'src', 'agents', agentId, 'keywords.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const keywords = JSON.parse(raw) as string[];
    keywordsCache.set(agentId, keywords);
    return keywords;
  } catch {
    keywordsCache.set(agentId, []);
    return [];
  }
}

export function routeToAgent(message: string, profileType?: 'jdg' | 'private' | null): AgentId {
  const lc = message.toLowerCase();
  const scores = new Map<AgentId, number>();

  for (const agentId of AGENT_IDS) {
    if (agentId === 'konsjerz') continue;
    const keywords = loadKeywords(agentId);
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(kw.toLowerCase())) {
        score += kw.length >= 5 ? 2 : 1;
      }
    }
    if (score > 0) scores.set(agentId, score);
  }

  if (scores.size === 0) {
    if (profileType === 'jdg') return 'finanse-jdg';
    return 'konsjerz';
  }

  let best: AgentId = 'konsjerz';
  let bestScore = 0;
  for (const [id, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  return best;
}
```

- [ ] **Step 3: Run test**

```bash
cp vitest.config.ts vitest.config.mts 2>/dev/null; npx vitest run src/agents/router.test.ts --config vitest.config.mts; rm -f vitest.config.mts
```

- [ ] **Step 4: Commit**

```bash
git add src/agents/router.ts src/agents/router.test.ts
git commit -m "feat: agent router - keyword-based auto-routing with profile bias + tests"
```

---

## Task 5: Registry rewrite

**Files:**
- Rewrite: `src/agents/registry.ts`

- [ ] **Step 1: Rewrite registry to read .md files**

```typescript
import fs from 'fs';
import path from 'path';
import type { AgentId, AgentConfig, AgentContext, PrefetchSource } from './types';
import { AGENT_IDS } from './types';
import type { UserProfile, MatchResult } from '@/engine/types';
import { BENEFIT_KNOWLEDGE } from '@/ai/benefitKnowledge';

const agentsDir = path.join(process.cwd(), 'src', 'agents');

function readMd(filePath: string): string {
  try {
    return fs.readFileSync(path.join(agentsDir, filePath), 'utf-8');
  } catch {
    return '';
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(agentsDir, filePath), 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

const configCache = new Map<AgentId, AgentConfig>();

export function getAgentConfig(agentId: AgentId): AgentConfig {
  if (configCache.has(agentId)) return configCache.get(agentId)!;

  const config: AgentConfig = {
    id: agentId,
    label: agentId,
    desc: '',
    icon: agentId[0].toUpperCase(),
    keywords: readJson<string[]>(`${agentId}/keywords.json`, []),
    prefetch: readJson<PrefetchSource[]>(`${agentId}/prefetch.json`, []),
    agentPrompt: readMd(`${agentId}/agent.md`),
    knowledge: readMd(`${agentId}/knowledge.md`),
    sources: readMd(`${agentId}/sources.md`),
  };

  configCache.set(agentId, config);
  return config;
}

// Base prompt parts (cached)
let _baseIdentity: string | null = null;
let _baseFormatting: string | null = null;
let _baseLiveSources: string | null = null;

function getBaseIdentity(): string {
  if (!_baseIdentity) _baseIdentity = readMd('_base/identity.md');
  return _baseIdentity;
}
function getBaseFormatting(): string {
  if (!_baseFormatting) _baseFormatting = readMd('_base/formatting.md');
  return _baseFormatting;
}
function getBaseLiveSources(): string {
  if (!_baseLiveSources) _baseLiveSources = readMd('_base/live-sources.md');
  return _baseLiveSources;
}

export function buildAgentSystemPrompt(
  agentId: AgentId,
  context: AgentContext,
): string {
  const config = getAgentConfig(agentId);
  const parts: string[] = [];

  parts.push(getBaseIdentity());
  parts.push(getBaseFormatting());
  parts.push(`=== TWOJA SPECJALIZACJA ===\n${config.agentPrompt}`);
  parts.push(`=== TWOJA WIEDZA DOMENOWA ===\n${config.knowledge}`);
  parts.push(getBaseLiveSources());

  const contextBlock = buildRuntimeContext(context);
  if (contextBlock) {
    parts.push(`=== KONTEKST UZYTKOWNIKA ===\n${contextBlock}`);
  }

  return parts.filter(Boolean).join('\n\n');
}

// Keep buildFormChatPrompt for /wnioski form chat
export function buildFormChatPrompt(formKnowledge: string): string {
  const config = getAgentConfig('wnioski');
  return [
    getBaseIdentity(),
    `=== TWOJA SPECJALIZACJA ===\n${config.agentPrompt}`,
    `=== KONTEKST FORMULARZA ===\n${formKnowledge}`,
  ].filter(Boolean).join('\n\n');
}

// --- Runtime context builder (port from existing registry.ts) ---
// Copy the ENTIRE buildRuntimeContext, buildRssBlock, buildRssSubscriptionBlock,
// buildUserProfileBlock, buildRawProfileBlock, buildBenefitsBlock,
// formatDetailedBenefit, profileToUserProfile functions from the current registry.ts.
// These do NOT change - same logic, same interfaces.

// (The implementer should copy lines 116-388 from current src/agents/registry.ts here)
```

IMPORTANT: The implementer MUST copy the runtime context functions from existing `src/agents/registry.ts` (lines ~116-388). These functions are unchanged:
- `buildRuntimeContext(ctx)`
- `buildRssBlock(items)`
- `buildRssSubscriptionBlock(sub)`
- `buildUserProfileBlock(p)`
- `buildRawProfileBlock(p, type)`
- `buildBenefitsBlock(benefits, focusedId)`
- `formatDetailedBenefit(r)`
- `profileToUserProfile(profile)`

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/agents/registry.ts
git commit -m "feat: registry rewrite - reads .md files, builds prompts per agent"
```

---

## Task 6: Chat route - router + selective prefetch

**Files:**
- Modify: `src/app/api/agent/chat/route.ts`

- [ ] **Step 1: Add router import and selective prefetch**

At top of file, add:
```typescript
import { routeToAgent } from '@/agents/router';
import { getAgentConfig } from '@/agents/registry';
import type { PrefetchSource } from '@/agents/types';
```

Replace the `VALID_MODES` set and mode validation (~line 605-613):
```typescript
// OLD:
// const VALID_MODES: Set<string> = new Set(['ogolny', 'swiadczenie', ...]);
// const mode = VALID_MODES.has(rawMode) ? rawMode : 'ogolny';

// NEW:
import { AGENT_IDS } from '@/agents/types';
const { messages, mode: rawMode = 'auto' } = body;
let agentId: AgentId;
if (rawMode === 'auto' || !AGENT_IDS.includes(rawMode as AgentId)) {
  agentId = routeToAgent(lastUserMsg, profileType ?? undefined);
} else {
  agentId = rawMode as AgentId;
}
```

Replace `buildLivePrefetch` call with selective version:
```typescript
// OLD: always runs all 8 prefetchers
// const [nbp, whitelist, nfz, gios, ceidg, imgw, eli, bdl] = await Promise.all([...]);

// NEW: only run prefetchers configured for this agent
const agentConfig = getAgentConfig(agentId);
const prefetchSources = new Set(agentConfig.prefetch);

const PREFETCH_MAP: Record<PrefetchSource, () => Promise<string | null>> = {
  nfz: () => maybeFetchNfz(lastUserMsg, userProvince),
  gios: () => maybeFetchGios(lastUserMsg, userProvince),
  nbp: () => maybeFetchNbp(lastUserMsg),
  whitelist: () => maybeFetchWhitelist(lastUserMsg),
  ceidg: () => maybeFetchCeidg(lastUserMsg, profileNip, isJdg),
  imgw: () => maybeFetchImgw(lastUserMsg),
  eli: () => maybeFetchEli(lastUserMsg),
  'bdl-gus': () => maybeFetchBdlGus(lastUserMsg, userProvince),
  benefits: () => Promise.resolve(null), // handled separately via matchBenefits
};

const prefetchPromises = [...prefetchSources]
  .filter(s => s !== 'benefits')
  .map(s => PREFETCH_MAP[s]());
const prefetchResults = await Promise.all(prefetchPromises);
const livePrefetch = prefetchResults.filter((p): p is string => p !== null);
const liveContext = livePrefetch.length > 0
  ? `DANE LIVE POBRANE NA POTRZEBY TEJ ROZMOWY:\n\n${livePrefetch.join('\n\n')}`
  : null;
```

Update benefits loading to check agent prefetch config:
```typescript
let matchedBenefits = null;
if (userProfile && (prefetchSources.has('benefits') || agentId === 'konsjerz' || agentId === 'swiadczenia')) {
  const results = matchBenefits(userProfile);
  matchedBenefits = results.filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE');
}
```

Update system message build:
```typescript
const systemMessage = buildAgentSystemPrompt(agentId, {
  profile: profile as Record<string, unknown> | null,
  profileType,
  matchedBenefits,
  userProfile,
  recentRssItems,
  rssSubscription,
  extraContext: liveContext,
});
```

Add `agentId` to response headers so frontend knows which agent responded:
```typescript
// In the streaming response, add header:
headers: {
  ...CORS_HEADERS,
  'Content-Type': 'text/event-stream',
  'X-Agent-Id': agentId,
}
```

- [ ] **Step 2: tsc + build**

```bash
npx tsc --noEmit
npx next build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/agent/chat/route.ts
git commit -m "feat: chat route - auto-routing + selective prefetch per agent"
```

---

## Task 7: UI - Sidebar + Context + Chat page

**Files:**
- Modify: `src/components/AgentPanelSidebar.tsx`
- Modify: `src/app/agent/panel/AgentModeContext.tsx`
- Modify: `src/app/agent/panel/chat/page.tsx`
- Modify: `src/app/panel/chat/page.tsx`

- [ ] **Step 1: Update AgentModeContext to use AgentId**

In `src/app/agent/panel/AgentModeContext.tsx`, change imports:
```typescript
import type { AgentId } from '@/agents/types';

interface AgentModeContextValue {
  mode: AgentId;
  setMode: (mode: AgentId) => void;
}

const AgentModeContext = createContext<AgentModeContextValue>({
  mode: 'konsjerz',
  setMode: () => {},
});
```

- [ ] **Step 2: Update Sidebar with 8 agents**

In `src/components/AgentPanelSidebar.tsx`:

```typescript
import type { AgentId } from '@/agents/types';
export type { AgentId };

interface AgentType {
  id: AgentId;
  label: string;
  desc: string;
  icon: string;
}

const AGENT_TYPES: AgentType[] = [
  { id: 'konsjerz', label: 'Konsjerż', desc: 'Pytania ogólne', icon: 'K' },
  { id: 'swiadczenia', label: 'Świadczenia', desc: '118 świadczeń i ulg', icon: 'S' },
  { id: 'wnioski', label: 'Wnioski', desc: '8 formularzy ZUS', icon: 'W' },
  { id: 'nfz-zdrowie', label: 'NFZ / Zdrowie', desc: 'Lekarze, kolejki, smog', icon: 'N' },
  { id: 'finanse-jdg', label: 'Finanse', desc: 'NBP, VAT, KSeF, podatki', icon: 'F' },
  { id: 'dotacje', label: 'Dotacje', desc: 'Granty, PARP, PFRON', icon: 'D' },
  { id: 'prawo-terminy', label: 'Prawo', desc: 'Zmiany, terminy', icon: 'P' },
  { id: 'rolnik', label: 'Rolnik', desc: 'KRUS, ARiMR, pogoda', icon: 'R' },
];
```

Update Props type to use `AgentId` instead of `AgentMode`.

Add "auto" label at top of sidebar (above agent list):
```typescript
<div style={{ fontSize: 10, color: 'var(--color-text-3)', padding: '0 6px', marginBottom: 4 }}>
  Tryb: auto-routing (kliknij aby wymusić agenta)
</div>
```

- [ ] **Step 3: Update chat page - show which agent responded**

In `src/app/agent/panel/chat/page.tsx`, add state for active agent:
```typescript
const [activeAgent, setActiveAgent] = useState<string>('konsjerz');
```

In the fetch response handler, read the `X-Agent-Id` header:
```typescript
const agentHeader = res.headers.get('X-Agent-Id');
if (agentHeader) setActiveAgent(agentHeader);
```

Show chip above AI response:
```typescript
{msg.role === 'assistant' && (
  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
    {activeAgent.replace('-', ' / ')}
  </div>
)}
```

- [ ] **Step 4: Update chat body to send 'auto' mode**

In the sendMessage function, change mode sent to API:
```typescript
body: JSON.stringify({
  messages: newMessages.map(m => ({ role: m.role, content: m.content })),
  mode: 'auto',  // was: mode (from sidebar selection)
}),
```

When user manually selects an agent from sidebar, send that ID instead:
```typescript
mode: mode === 'konsjerz' ? 'auto' : mode,
```

- [ ] **Step 5: tsc + build**

```bash
npx tsc --noEmit
npx next build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/AgentPanelSidebar.tsx src/app/agent/panel/AgentModeContext.tsx src/app/agent/panel/chat/page.tsx src/app/panel/chat/page.tsx src/app/agent/panel/layout.tsx
git commit -m "feat: UI - 8 agents in sidebar + auto-routing mode + agent indicator chip"
```

---

## Task 8: Cleanup old files + final verification

**Files:**
- Delete: `src/agents/knowledge/*.ts` (6 files)
- Delete: `src/agents/base-prompt.ts`

- [ ] **Step 1: Remove old knowledge files**

```bash
rm src/agents/knowledge/ogolny.ts src/agents/knowledge/swiadczenie.ts src/agents/knowledge/wniosek.ts src/agents/knowledge/nabor.ts src/agents/knowledge/faktura.ts src/agents/knowledge/termin.ts
rmdir src/agents/knowledge
rm src/agents/base-prompt.ts
```

- [ ] **Step 2: Fix any remaining imports**

Search for old imports:
```bash
grep -rn "from.*agents/knowledge\|from.*base-prompt\|AgentKnowledge" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next"
```

Fix any remaining references to old types/files.

- [ ] **Step 3: Full verification**

```bash
npx tsc --noEmit
npx next build
cp vitest.config.ts vitest.config.mts; npx vitest run --config vitest.config.mts; rm vitest.config.mts
```

All must pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old knowledge/*.ts + base-prompt.ts (migrated to .md per agent)"
```

---

## Task 9: Smoke test + push

- [ ] **Step 1: Local smoke test**

```bash
npm run dev
```

Test in browser:
1. `/panel/chat` → "Cześć" → responds as Konsjerż
2. "Ile czekam do kardiologa?" → auto-routes to NFZ/Zdrowie + live prefetch
3. "Co mi się należy?" → auto-routes to Świadczenia + matched benefits
4. "Jak wypełnić Z-15a?" → auto-routes to Wnioski
5. "Ile kosztuje euro?" → auto-routes to Finanse + NBP prefetch
6. "Jakie dotacje dla JDG?" → auto-routes to Dotacje
7. "Co zmienia się w prawie?" → auto-routes to Prawo + ELI prefetch
8. "Pogoda dla rolnika" → auto-routes to Rolnik + IMGW prefetch

Check: agent indicator chip shows correct agent name above each response.
Check: sidebar shows 8 agents, clicking one forces that agent.

- [ ] **Step 2: Push**

```bash
git push
```
