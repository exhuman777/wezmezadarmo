import fs from 'fs';
import path from 'path';
import type { AgentId, AgentConfig, AgentContext, PrefetchSource } from './types';
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

export function buildFormChatPrompt(formKnowledge: string): string {
  const config = getAgentConfig('wnioski');
  return [
    getBaseIdentity(),
    `=== TWOJA SPECJALIZACJA ===\n${config.agentPrompt}`,
    `=== KONTEKST FORMULARZA ===\n${formKnowledge}`,
  ].filter(Boolean).join('\n\n');
}


// ---------------------------------------------------------------------------
// Runtime context builder
// ---------------------------------------------------------------------------

function buildRuntimeContext(ctx: AgentContext): string | null {
  const blocks: string[] = [];

  // --- Profil uzytkownika ---
  if (ctx.userProfile) {
    blocks.push(buildUserProfileBlock(ctx.userProfile));
  } else if (ctx.profile && ctx.profileType) {
    blocks.push(buildRawProfileBlock(ctx.profile, ctx.profileType));
  }

  // --- Dopasowane swiadczenia ---
  if (ctx.matchedBenefits && ctx.matchedBenefits.length > 0) {
    blocks.push(buildBenefitsBlock(ctx.matchedBenefits, ctx.focusedBenefitId));
  }

  // --- Swieze aktualnosci RSS ---
  if (ctx.recentRssItems && ctx.recentRssItems.length > 0) {
    blocks.push(buildRssBlock(ctx.recentRssItems));
  }

  // --- Subskrypcja RSS usera ---
  if (ctx.rssSubscription && ctx.rssSubscription.active) {
    blocks.push(buildRssSubscriptionBlock(ctx.rssSubscription));
  }

  // --- Extra context (company data, live intel, etc.) ---
  if (ctx.extraContext) {
    blocks.push(ctx.extraContext);
  }

  return blocks.length > 0 ? blocks.join('\n\n') : null;
}

/**
 * Blok swiezych aktualnosci RSS -- top 10-15 ostatnich items z cache.
 * AI moze cytowac konkretne newsy odpowiadajac na pytania typu "co nowego w X".
 */
function buildRssBlock(items: import('./types').RssContextItem[]): string {
  const lines: string[] = [
    'ŚWIEŻE AKTUALNOŚCI Z POLSKICH INSTYTUCJI (cache, ostatnia aktualizacja max 12h):',
    'Możesz cytować te wiadomości w odpowiedziach. Zawsze podawaj źródło i link.',
    '',
  ];
  for (const item of items.slice(0, 15)) {
    const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('pl-PL') : '?';
    lines.push(`[${item.source}] ${date} - ${item.title}`);
    if (item.description) lines.push(`  ${item.description.slice(0, 200)}`);
    lines.push(`  ${item.link}`);
  }
  if (items.length > 15) {
    lines.push(`...i ${items.length - 15} wiecej (pelna lista na /panel/aktualnosci)`);
  }
  return lines.join('\n');
}

/**
 * Blok subskrypcji RSS uzytkownika -- AI wie co user sledzi i moze sugerowac dopasowane wiesci.
 */
function buildRssSubscriptionBlock(sub: import('./types').RssSubscriptionContext): string {
  const parts: string[] = ['SUBSKRYPCJA RSS UŻYTKOWNIKA (aktywna):'];
  if (sub.source_ids.length > 0) parts.push(`Śledzi źródła: ${sub.source_ids.join(', ')}`);
  else parts.push('Śledzi: wszystkie źródła');
  if (sub.audiences.length > 0) parts.push(`Grupa: ${sub.audiences.join(', ')}`);
  if (sub.keywords.length > 0) parts.push(`Słowa kluczowe: ${sub.keywords.join(', ')}`);
  if (sub.last_sent_at) {
    const date = new Date(sub.last_sent_at).toLocaleString('pl-PL');
    parts.push(`Ostatni e-mail alertu: ${date}`);
  }
  parts.push('Możesz odsyłać do /panel/aktualnosci po jego spersonalizowany widok.');
  return parts.join('\n');
}

/**
 * Profil z typed UserProfile (public chat, po konwersji).
 */
function buildUserProfileBlock(p: UserProfile): string {
  const fields = [
    `Wiek: ${p.wiek}`,
    `Plec: ${p.plec === 'K' ? 'kobieta' : 'mezczyzna'}`,
    p.stanCywilny && `Stan cywilny: ${p.stanCywilny}`,
    `Dzieci: ${p.liczbaDzieci}`,
    p.wiekDzieci && p.wiekDzieci.length > 0 && `Wiek dzieci: ${p.wiekDzieci.join(', ')}`,
    p.dochodMiesiecznie && `Dochod miesiecznie: ${p.dochodMiesiecznie} PLN`,
    p.dochodNaOsobe && `Dochod na osobe: ${p.dochodNaOsobe} PLN`,
    p.zatrudnienie && `Zatrudnienie: ${p.zatrudnienie}`,
    p.niepelnosprawnosc && p.niepelnosprawnosc !== 'brak' && `Niepelnosprawnosc: ${p.niepelnosprawnosc}`,
    p.wlasnosc && `Mieszkanie: ${p.wlasnosc}`,
    p.wojewodztwo && `Wojewodztwo: ${p.wojewodztwo}`,
    p.ciaza && 'W ciazy: tak',
    p.student && 'Student: tak',
    p.emeryt && 'Emeryt: tak',
    p.rolnik && 'Rolnik (KRUS): tak',
    p.bezrobotnyZarejestrowany && 'Bezrobotny zarejestrowany: tak',
    p.prowadzDzialalnosc && 'Prowadzi dzialalnosc: tak',
  ].filter(Boolean);

  return `PROFIL UZYTKOWNIKA:\n${fields.join('\n')}`;
}

/**
 * Profil z raw DB record (agent panel, snake_case).
 */
function buildRawProfileBlock(p: Record<string, unknown>, type: 'jdg' | 'private'): string {
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

    return `PROFIL UZYTKOWNIKA (osoba prywatna):\n${fields.join('\n')}`;
  }

  // JDG
  const fields = [
    p.company_name && `Firma: ${p.company_name}`,
    p.nip && `NIP: ${p.nip}`,
    p.pkd_codes && Array.isArray(p.pkd_codes) && `PKD: ${(p.pkd_codes as string[]).join(', ')}`,
    p.company_voivodeship && `Wojewodztwo: ${p.company_voivodeship}`,
    p.company_size && `Wielkosc: ${p.company_size}`,
  ].filter(Boolean);

  return `PROFIL UZYTKOWNIKA (JDG):\n${fields.join('\n')}`;
}

/**
 * Blok dopasowanych swiadczen z opcjonalnym focus na jedno.
 */
function buildBenefitsBlock(benefits: MatchResult[], focusedId?: string | null): string {
  const lines: string[] = [];

  // Focused benefit: full detail + knowledge enrichment
  const focused = focusedId
    ? benefits.find(r => r.benefit.id === focusedId)
    : null;

  if (focused) {
    lines.push(`UZYTKOWNIK PYTA O TO SWIADCZENIE -- odpowiadaj przede wszystkim w kontekscie tego swiadczenia:`);
    lines.push(formatDetailedBenefit(focused));

    // Enriched knowledge from benefitKnowledge.ts
    const enrichment = BENEFIT_KNOWLEDGE[focused.benefit.id];
    if (enrichment) {
      if (enrichment.formularzOpis) {
        lines.push(`\nFORMULARZ I POLA:\n${enrichment.formularzOpis}`);
      }
      if (enrichment.szczegolyKwalifikacji) {
        lines.push(`\nSZCZEGOLY KWALIFIKACJI:\n${enrichment.szczegolyKwalifikacji}`);
      }
      if (enrichment.faq) {
        lines.push(`\nCZESTE PYTANIA:\n${enrichment.faq}`);
      }
    }

    // Other benefits as summary
    const others = benefits.filter(r => r.benefit.id !== focusedId);
    if (others.length > 0) {
      lines.push(`\nPOZOSTALE DOPASOWANE SWIADCZENIA (dodatkowy kontekst):`);
      for (const r of others.slice(0, 10)) {
        const status = r.status === 'PRZYSLUGUJE' ? '[PEWNE]' : '[MOZLIWE]';
        lines.push(`${status} ${r.benefit.nazwa}: ${r.benefit.kwota}`);
      }
      if (others.length > 10) {
        lines.push(`...i ${others.length - 10} wiecej`);
      }
    }

    lines.push(`\nLACZNA LICZBA DOPASOWANYCH SWIADCZEN: ${benefits.length}`);
    return lines.join('\n');
  }

  // Regular mode: summary of all benefits
  const pewne = benefits.filter(r => r.status === 'PRZYSLUGUJE');
  const mozliwe = benefits.filter(r => r.status === 'MOZLIWE');

  lines.push(`DOPASOWANE SWIADCZENIA:`);
  lines.push(`Laczna liczba: ${benefits.length}`);
  lines.push(`Pewne (PRZYSLUGUJE): ${pewne.length}`);
  lines.push(`Mozliwe (MOZLIWE): ${mozliwe.length}`);
  lines.push('');

  for (const r of benefits.slice(0, 15)) {
    const status = r.status === 'PRZYSLUGUJE' ? '[PEWNE]' : '[MOZLIWE]';
    lines.push(`${status} ${r.benefit.nazwa} -- ${r.benefit.kwota}`);
    if (r.benefit.opis) {
      lines.push(`  Opis: ${r.benefit.opis}`);
    }
    lines.push(`  Zrodlo: ${r.benefit.zrodloUrl}`);
    if (r.matchedCriteria.length > 0) {
      lines.push(`  Spelnione: ${r.matchedCriteria.join(', ')}`);
    }
    if (r.warnings.length > 0) {
      lines.push(`  Ostrzezenie: ${r.warnings.join(', ')}`);
    }
  }

  if (benefits.length > 15) {
    lines.push(`...i ${benefits.length - 15} wiecej`);
  }

  return lines.join('\n');
}

/**
 * Formatuj pelne dane swiadczenia (dla focused benefit).
 */
function formatDetailedBenefit(r: MatchResult): string {
  const b = r.benefit;
  const parts = [
    `[${r.status}] ${b.nazwa}`,
    `Kwota: ${b.kwota} (${b.czestotliwosc})`,
    `Pewnosc: ${r.confidence}`,
  ];
  if (b.opis) parts.push(`Opis: ${b.opis}`);
  parts.push(`Zrodlo: ${b.zrodloUrl}`);
  if (r.warnings.length > 0) parts.push(`Ostrzezenia: ${r.warnings.join('; ')}`);
  if (b.wykluczenia.length > 0) parts.push(`Wykluczenia: ${b.wykluczenia.map(w => w.opis).join('; ')}`);
  parts.push(`Gdzie zlozyc: ${b.wniosek.kanal.join(', ')}`);
  if (b.wniosek.formularz) parts.push(`Formularz: ${b.wniosek.formularz}`);
  parts.push(`Dokumenty: ${b.wniosek.dokumenty.join('; ')}`);
  parts.push(`Kroki: ${b.wniosek.kroki.map((k, i) => `${i + 1}. ${k}`).join(' ')}`);
  parts.push(`Termin: ${b.wniosek.terminRealizacji}`);
  if (b.wniosek.pulapki.length > 0) parts.push(`Pulapki: ${b.wniosek.pulapki.join('; ')}`);
  parts.push(`Odwolanie: ${b.wniosek.odwolanie}`);
  return parts.join('\n  ');
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

