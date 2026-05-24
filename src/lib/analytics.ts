/**
 * Analytics helper -- wrapuje GA4 gtag z guard'ami i typed events.
 * Wszystkie wydarzenia anonimowe (bez PII).
 * Działa tylko gdy user wyrazil zgode (Cookie Consent v2 'granted').
 */

type EventCategory =
  | 'calculator'      // kalkulator swiadczen
  | 'nfz'             // wyszukiwarka NFZ
  | 'ceidg'           // CEIDG lookup
  | 'dotacje'         // panel dotacji B2B
  | 'agent'           // panel agenta AI
  | 'wnioski'         // kreator ZUS
  | 'centrum'         // centrum obywatela
  | 'chat'            // AI chat
  | 'contact'         // formularz kontaktowy
  | 'digest'          // email digest
  | 'navigation';     // klikniecia w nav

interface GTagWindow extends Window {
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
}

export function trackEvent(
  eventName: string,
  category: EventCategory,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === 'undefined') return;
  const w = window as GTagWindow;
  if (typeof w.gtag !== 'function') return;

  try {
    w.gtag('event', eventName, {
      event_category: category,
      ...params,
    });
  } catch {
    // Silent fail -- analytics nigdy nie blokuje UX
  }
}

// === Konkretne event helpers ===

export const track = {
  // Kalkulator
  formStarted: () => trackEvent('form_started', 'calculator'),
  formSubmitted: (hasNip: boolean) => trackEvent('form_submitted', 'calculator', { has_nip: hasNip }),
  resultsViewed: (count: number) => trackEvent('results_viewed', 'calculator', { results_count: count }),
  benefitClicked: (benefitId: string) => trackEvent('benefit_clicked', 'calculator', { benefit: benefitId }),

  // NFZ
  nfzSearch: (mode: 'queues' | 'providers', benefit?: string, province?: string) =>
    trackEvent('nfz_search', 'nfz', { mode, benefit: benefit ?? '', province: province ?? '' }),
  nfzCall: () => trackEvent('nfz_phone_clicked', 'nfz'),
  nfzMaps: () => trackEvent('nfz_maps_clicked', 'nfz'),

  // CEIDG
  ceidgLookup: (success: boolean) => trackEvent('ceidg_lookup', 'ceidg', { success }),

  // Dotacje
  dotacjeMatch: (matchedCount: number) => trackEvent('dotacje_matched', 'dotacje', { matched: matchedCount }),

  // Agent
  agentLogin: () => trackEvent('agent_login', 'agent'),
  agentRegister: () => trackEvent('agent_register', 'agent'),
  agentProfileSaved: () => trackEvent('agent_profile_saved', 'agent'),

  // Wnioski
  wniosekStarted: (formType: string) => trackEvent('wniosek_started', 'wnioski', { form: formType }),
  wniosekGenerated: (formType: string) => trackEvent('wniosek_pdf_generated', 'wnioski', { form: formType }),

  // Centrum Obywatela
  centrumToolUsed: (tool: string) => trackEvent('centrum_tool_used', 'centrum', { tool }),

  // Chat
  chatMessageSent: () => trackEvent('chat_message_sent', 'chat'),

  // Contact
  contactSubmitted: () => trackEvent('contact_submitted', 'contact'),

  // Digest
  digestEnabled: () => trackEvent('digest_enabled', 'digest'),
  digestDisabled: () => trackEvent('digest_disabled', 'digest'),

  // Nav
  navClick: (destination: string) => trackEvent('nav_click', 'navigation', { destination }),
};
