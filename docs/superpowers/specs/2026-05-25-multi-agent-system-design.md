# Multi-Agent System wezmezadarmo.com

Data: 2026-05-25

## Cel

Przebudowa AI chatu z 6 trybów (mode-based) na 8 wyspecjalizowanych agentów z auto-routingiem po keywordach, wiedzą w .md per folder, selektywnymi prefetcherami.

## 8 agentów

| ID | Nazwa | Scope | Prefetchery |
|----|-------|-------|-------------|
| konsjerz | Konsjerż | Router, zna 7 agentów, fallback | - |
| swiadczenia | Świadczenia | 118 benefitów, matching, kwoty | benefits matcher |
| wnioski | Wnioski | 8 formularzy ZUS, PDF, procedury | - |
| nfz-zdrowie | NFZ / Zdrowie | Kolejki, lekarze, refundacja, GIOŚ | nfz, gios |
| finanse-jdg | Finanse / JDG | NBP, VAT, CEIDG, KSeF, podatki, ulgi ZUS | nbp, whitelist, ceidg |
| dotacje | Dotacje | PUP, PFRON, PARP, NCBiR, BGK, KFS, granty | - |
| prawo-terminy | Prawo / Terminy | ELI/Sejm, zmiany w przepisach, kalendarz | eli |
| rolnik | Rolnik | KRUS, ARiMR, IMGW, GUS dane gminy | imgw, bdl-gus |

## Architektura

```
User message → Router (keyword match) → Agent ID
→ Load _base/*.md + {agentId}/*.md
→ Selective prefetch (per agent prefetch.json)
→ Build system prompt + runtime context
→ OpenRouter API → Stream response
```

## Struktura plików

```
src/agents/
  _base/
    identity.md
    formatting.md
    live-sources.md
  {agentId}/
    agent.md          <- persona + styl + reguły odpowiedzi + granice
    knowledge.md      <- dane domenowe, kwoty, procedury, prawo
    keywords.json     <- triggery routera ["słowo1", "słowo2"]
    prefetch.json     <- ["nbp", "nfz"] (które prefetchery odpalić)
    sources.md        <- linki weryfikacyjne do oficjalnych stron
  router.ts           <- routeToAgent(message, profileType): AgentId
  registry.ts         <- loadAgent(), buildPrompt() - czyta .md
  types.ts            <- AgentId union type
```

## Router

Keyword matching z wagami. Exact match (np. "Z-15a") > partial (np. "wniosek"). Profile bias: JDG → finanse-jdg przy braku matchu. Brak matchu → konsjerz.

```typescript
type AgentId = 'konsjerz' | 'swiadczenia' | 'wnioski' | 'nfz-zdrowie'
  | 'finanse-jdg' | 'dotacje' | 'prawo-terminy' | 'rolnik';

function routeToAgent(message: string, profileType?: 'jdg' | 'private'): AgentId
```

## Prompt assembly

```typescript
function buildAgentPrompt(agentId: AgentId, context: AgentContext): string {
  return [
    readMd('_base/identity.md'),
    readMd('_base/formatting.md'),
    readMd(`${agentId}/agent.md`),
    readMd(`${agentId}/knowledge.md`),
    readMd('_base/live-sources.md'),
    buildRuntimeContext(context),
  ].join('\n\n');
}
```

## Prefetch selektywny

Zamiast 8 prefetcherów zawsze równolegle: odpalane TYLKO te z prefetch.json aktywnego agenta. Oszczędza latencję + API quota.

Mapping: `{ nfz: maybeFetchNfz, nbp: maybeFetchNbp, ... }`

## UI

Sidebar: 8 agentów z literą/ikoną. Auto-routing domyślny, manual override klikalny. Chip "Odpowiada: X" nad odpowiedzią AI (gdy auto-routed).

## Migracja

- `knowledge/*.ts` → `{agentId}/knowledge.md` (treść bez zmian, format .md)
- `base-prompt.ts` → `_base/{identity,formatting,live-sources}.md`
- `registry.ts` → nowy (czyta .md zamiast importów .ts)
- `chat/route.ts` → dodany router + selective prefetch, reszta bez zmian
- API endpoint bez zmian (`POST /api/agent/chat`)
- Benefits engine, PDF fillers, prefetch functions - bez zmian

## Co NIE zmieniam

- OpenRouter backend
- Prefetcher functions (maybeFetchNbp etc) - te same, wywoływane selektywnie
- Benefits engine (matcher, 118 świadczeń)
- PDF fillers
- Runtime context builder (profil, RSS, benefits, live data)
