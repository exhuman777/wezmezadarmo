import fs from 'fs';
import path from 'path';
import type { AgentId } from './types';
import { AGENT_IDS } from './types';
import { normalizePolish } from '../engine/search';

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
  // Normalizacja bez polskich znaków - użytkownik pisze "ciaza", "swiadczenie"
  // i nadal trafia na słowa kluczowe "ciąża", "świadczenie".
  const lc = normalizePolish(message);
  const scores = new Map<AgentId, number>();

  for (const agentId of AGENT_IDS) {
    if (agentId === 'konsjerz') continue;
    const keywords = loadKeywords(agentId);
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(normalizePolish(kw))) {
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
