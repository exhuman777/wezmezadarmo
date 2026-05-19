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

export interface AgentContext {
  profile: Record<string, unknown> | null;
  profileType: 'jdg' | 'private' | null;
  matchedBenefits: MatchResult[] | null;
  userProfile: UserProfile | null;

  /** Public chat: focus on a specific benefit with enriched knowledge */
  focusedBenefitId?: string | null;

  /** Extra context appended to the prompt (company data, live intel, etc.) */
  extraContext?: string | null;
}
