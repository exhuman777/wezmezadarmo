import type { UserProfile, MatchResult } from '@/engine/types';

export type AgentMode = 'ogolny' | 'swiadczenie' | 'wniosek' | 'nabor' | 'faktura' | 'termin';

export interface AgentKnowledge {
  /** Unikalne ID agenta */
  id: AgentMode;

  /** Nazwa wyświetlana */
  name: string;

  /** Krótki opis dla UI */
  description: string;

  /** Persona i specjalizacja agenta -- główna część system prompt */
  persona: string;

  /** Wiedza domenowa -- fakty, regulacje, przepisy które agent zna */
  domainKnowledge: string;

  /** Reguły odpowiadania specyficzne dla tego agenta */
  responseRules: string;

  /** Czego agent NIE robi / nie wie */
  boundaries: string;

  /** Przykładowe interakcje (few-shot) dla jakości odpowiedzi */
  examples: string;

  /** Źródła wiedzy z których agent korzysta */
  sources: string[];
}

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

  /** Public chat: focus on a specific benefit with enriched knowledge */
  focusedBenefitId?: string | null;

  /** Live RSS items from rss_cache (top 10-20 fresh, optionally filtered by user audience) */
  recentRssItems?: RssContextItem[] | null;

  /** User's RSS subscription filters */
  rssSubscription?: RssSubscriptionContext | null;

  /** Extra context appended to the prompt (company data, live intel, etc.) */
  extraContext?: string | null;
}
