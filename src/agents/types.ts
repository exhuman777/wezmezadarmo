import type { UserProfile, MatchResult } from '@/engine/types';

export type AgentMode = 'ogolny' | 'swiadczenie' | 'wniosek' | 'nabor' | 'faktura' | 'termin';

export interface AgentKnowledge {
  /** Unikalne ID agenta */
  id: AgentMode;

  /** Nazwa wyswietlana */
  name: string;

  /** Krotki opis dla UI */
  description: string;

  /** Persona i specjalizacja agenta -- glowna czesc system prompt */
  persona: string;

  /** Wiedza domenowa -- fakty, regulacje, przepisy ktore agent zna */
  domainKnowledge: string;

  /** Reguly odpowiadania specyficzne dla tego agenta */
  responseRules: string;

  /** Czego agent NIE robi / nie wie */
  boundaries: string;

  /** Przykladowe interakcje (few-shot) dla jakosci odpowiedzi */
  examples: string;

  /** Zrodla wiedzy z ktorych agent korzysta */
  sources: string[];
}

export interface AgentContext {
  profile: Record<string, unknown> | null;
  profileType: 'jdg' | 'private' | null;
  matchedBenefits: MatchResult[] | null;
  userProfile: UserProfile | null;
}
