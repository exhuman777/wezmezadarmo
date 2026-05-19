/**
 * AGENT REGISTRY -- centralne miejsce ladowania i skladania agentow.
 *
 * Jak dodac nowego agenta:
 * 1. Stworz plik src/agents/knowledge/{id}.ts (eksportuj default AgentKnowledge)
 * 2. Dodaj import i wpis w AGENTS ponizej
 * 3. Dodaj id do AgentMode w types.ts i AgentPanelSidebar.tsx
 *
 * Jak zaktualizowac wiedze agenta:
 * - Edytuj odpowiedni plik w src/agents/knowledge/
 * - Zmien domainKnowledge, examples, boundaries
 * - Nie trzeba zmieniac kodu -- wystarczy zmienic tekst
 */

import type { AgentKnowledge, AgentMode, AgentContext } from './types';
import type { UserProfile, MatchResult } from '@/engine/types';
import { buildBasePrompt } from './base-prompt';

// --- Agent knowledge imports ---
import ogolny from './knowledge/ogolny';
import swiadczenie from './knowledge/swiadczenie';
import wniosek from './knowledge/wniosek';
import nabor from './knowledge/nabor';
import faktura from './knowledge/faktura';
import termin from './knowledge/termin';

/** Rejestr wszystkich agentow */
const AGENTS: Record<AgentMode, AgentKnowledge> = {
  ogolny,
  swiadczenie,
  wniosek,
  nabor,
  faktura,
  termin,
};

/** Pobierz definicje agenta */
export function getAgent(mode: AgentMode): AgentKnowledge {
  return AGENTS[mode] ?? AGENTS.ogolny;
}

/** Pobierz liste agentow (do UI) */
export function getAgentList(): Pick<AgentKnowledge, 'id' | 'name' | 'description'>[] {
  return Object.values(AGENTS).map(({ id, name, description }) => ({ id, name, description }));
}

/**
 * Zbuduj pelny system prompt dla agenta.
 *
 * Struktura:
 * 1. BASE: identyfikacja + anty-halucynacje + formatowanie + ton + dane
 * 2. PERSONA: specjalizacja i styl agenta
 * 3. DOMAIN: wiedza domenowa agenta
 * 4. RULES: reguly odpowiedzi agenta
 * 5. BOUNDARIES: czego agent nie robi
 * 6. EXAMPLES: przykladowe interakcje (few-shot)
 * 7. CONTEXT: profil uzytkownika + dopasowane swiadczenia (runtime)
 */
export function buildAgentSystemPrompt(
  mode: AgentMode,
  context: AgentContext,
): string {
  const agent = getAgent(mode);
  const parts: string[] = [];

  // 1. Base prompt (wspolny dla wszystkich)
  parts.push(buildBasePrompt());

  // 2. Persona agenta
  parts.push(`=== TWOJA SPECJALIZACJA ===\n${agent.persona}`);

  // 3. Wiedza domenowa
  parts.push(`=== TWOJA WIEDZA DOMENOWA ===\n${agent.domainKnowledge}`);

  // 4. Reguly odpowiedzi
  parts.push(`=== REGULY ODPOWIEDZI ===\n${agent.responseRules}`);

  // 5. Granice
  parts.push(`=== CZEGO NIE ROBISZ ===\n${agent.boundaries}`);

  // 6. Przyklady (few-shot learning)
  parts.push(`=== PRZYKLADY ROZMOW ===\n${agent.examples}`);

  // 7. Kontekst runtime (profil uzytkownika)
  const contextBlock = buildRuntimeContext(context);
  if (contextBlock) {
    parts.push(`=== KONTEKST UZYTKOWNIKA ===\n${contextBlock}`);
  }

  return parts.join('\n\n');
}

/**
 * Buduje kontekst runtime z profilu uzytkownika i dopasowanych swiadczen.
 */
function buildRuntimeContext(ctx: AgentContext): string | null {
  const blocks: string[] = [];

  if (ctx.profile) {
    const p = ctx.profile;
    const type = ctx.profileType;

    if (type === 'private') {
      const fields = [
        p.wiek && `Wiek: ${p.wiek}`,
        p.plec && `Plec: ${p.plec === 'K' ? 'kobieta' : 'mezczyzna'}`,
        p.stan_cywilny && `Stan cywilny: ${p.stan_cywilny}`,
        p.liczba_dzieci != null && `Dzieci: ${p.liczba_dzieci}`,
        p.wiek_dzieci && Array.isArray(p.wiek_dzieci) && (p.wiek_dzieci as number[]).length > 0 && `Wiek dzieci: ${(p.wiek_dzieci as number[]).join(', ')}`,
        p.dochod_miesiecznie && `Dochod miesiecznie: ${p.dochod_miesiecznie} PLN`,
        p.dochod_na_osobe && `Dochod na osobe: ${p.dochod_na_osobe} PLN`,
        p.zatrudnienie && `Zatrudnienie: ${p.zatrudnienie}`,
        p.niepelnosprawnosc && p.niepelnosprawnosc !== 'brak' && `Niepelnosprawnosc: ${p.niepelnosprawnosc}`,
        p.wlasnosc && `Mieszkanie: ${p.wlasnosc}`,
        p.wojewodztwo && `Wojewodztwo: ${p.wojewodztwo}`,
        p.ciaza && 'W ciazy: tak',
        p.student && 'Student: tak',
        p.emeryt && 'Emeryt: tak',
        p.rolnik && 'Rolnik (KRUS): tak',
        p.bezrobotny_zarejestrowany && 'Bezrobotny zarejestrowany: tak',
      ].filter(Boolean);

      blocks.push(`PROFIL UZYTKOWNIKA (osoba prywatna):\n${fields.join('\n')}`);
    } else if (type === 'jdg') {
      const fields = [
        p.company_name && `Firma: ${p.company_name}`,
        p.nip && `NIP: ${p.nip}`,
        p.pkd_codes && Array.isArray(p.pkd_codes) && `PKD: ${(p.pkd_codes as string[]).join(', ')}`,
        p.company_voivodeship && `Wojewodztwo: ${p.company_voivodeship}`,
        p.company_size && `Wielkosc: ${p.company_size}`,
      ].filter(Boolean);

      blocks.push(`PROFIL UZYTKOWNIKA (JDG):\n${fields.join('\n')}`);
    }
  }

  if (ctx.matchedBenefits && ctx.matchedBenefits.length > 0) {
    const pewne = ctx.matchedBenefits.filter(r => r.status === 'PRZYSLUGUJE');
    const mozliwe = ctx.matchedBenefits.filter(r => r.status === 'MOZLIWE');

    const benefitLines: string[] = [];
    benefitLines.push(`Laczna liczba dopasowanych swiadczen: ${ctx.matchedBenefits.length}`);
    benefitLines.push(`Pewne (PRZYSLUGUJE): ${pewne.length}`);
    benefitLines.push(`Mozliwe (MOZLIWE): ${mozliwe.length}`);
    benefitLines.push('');

    for (const r of ctx.matchedBenefits.slice(0, 15)) {
      const status = r.status === 'PRZYSLUGUJE' ? '[PEWNE]' : '[MOZLIWE]';
      benefitLines.push(`${status} ${r.benefit.nazwa} -- ${r.benefit.kwota}`);
      if (r.matchedCriteria.length > 0) {
        benefitLines.push(`  Spelnione: ${r.matchedCriteria.join(', ')}`);
      }
      if (r.warnings.length > 0) {
        benefitLines.push(`  Ostrzezenie: ${r.warnings.join(', ')}`);
      }
    }

    if (ctx.matchedBenefits.length > 15) {
      benefitLines.push(`...i ${ctx.matchedBenefits.length - 15} wiecej`);
    }

    blocks.push(`DOPASOWANE SWIADCZENIA:\n${benefitLines.join('\n')}`);
  }

  return blocks.length > 0 ? blocks.join('\n\n') : null;
}

/**
 * Helper: zbuduj UserProfile z danych bazy (agent_user_profiles).
 * Uzywane w API route do budowania kontekstu.
 */
export function profileToUserProfile(profile: Record<string, unknown>): UserProfile | null {
  if (profile.type !== 'private') return null;

  return {
    wiek: (profile.wiek as number) ?? 0,
    plec: (profile.plec as 'K' | 'M') ?? 'K',
    stanCywilny: (profile.stan_cywilny as string) ?? '',
    liczbaDzieci: (profile.liczba_dzieci as number) ?? 0,
    wiekDzieci: (profile.wiek_dzieci as number[]) ?? [],
    dochodMiesiecznie: (profile.dochod_miesiecznie as number) ?? 0,
    dochodNaOsobe: (profile.dochod_na_osobe as number) ?? 0,
    zatrudnienie: (profile.zatrudnienie as string) ?? '',
    niepelnosprawnosc: (profile.niepelnosprawnosc as string) ?? 'brak',
    wlasnosc: (profile.wlasnosc as string) ?? '',
    wojewodztwo: (profile.wojewodztwo as string) ?? '',
    prowadzDzialalnosc: false,
    pierwszaDzialalnosc: false,
    ciaza: (profile.ciaza as boolean) ?? false,
    student: (profile.student as boolean) ?? false,
    emeryt: (profile.emeryt as boolean) ?? false,
    rolnik: (profile.rolnik as boolean) ?? false,
    bezrobotnyZarejestrowany: (profile.bezrobotny_zarejestrowany as boolean) ?? false,
  };
}
