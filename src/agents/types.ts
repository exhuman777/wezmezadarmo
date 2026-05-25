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
