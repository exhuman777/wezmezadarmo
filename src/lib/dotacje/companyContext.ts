import type { EligibilityFlag } from '@/data/programs-b2b';
import { matchPrograms } from './programMatcher';

export interface CompanyProfile {
  nip: string;
  name: string;
  pkdCodes: string[];
  voivodeship: string;
  size: 'micro' | 'small' | 'medium' | 'large';
  employeeCountRange: string;
  flags: EligibilityFlag[];
}

const SIZE_LABELS: Record<CompanyProfile['size'], string> = {
  micro: 'Mikroprzedsiębiorstwo (do 9 pracowników)',
  small: 'Małe przedsiębiorstwo (10-49 pracowników)',
  medium: 'Średnie przedsiębiorstwo (50-249 pracowników)',
  large: 'Duże przedsiębiorstwo (250+ pracowników)',
};

const FLAG_LABELS: Record<EligibilityFlag, string> = {
  zatrudnia_niepelnosprawnych: 'zatrudnia osoby niepełnosprawne',
  planuje_szkolenia: 'planuje szkolenia pracowników',
  chce_zatrudnic_bezrobotnych: 'planuje zatrudnienie osób bezrobotnych',
  startup: 'startup (firma poniżej 24 miesięcy)',
  sektor_produkcja: 'sektor produkcyjny',
  sektor_it: 'sektor IT/technologiczny',
  sektor_usluga: 'sektor usługowy',
  sektor_handel: 'sektor handlowy',
  sektor_rolnictwo: 'sektor rolniczy',
  msp: 'mikro/małe/średnie przedsiębiorstwo (MSP)',
  innowacje: 'działalność innowacyjna / B+R',
  cyfryzacja: 'cyfryzacja procesów',
  export: 'działalność eksportowa',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'OTWARTY',
  continuous: 'CIĄGŁY',
  expected: 'OCZEKIWANY',
  closed: 'ZAMKNIĘTY',
};

function buildCompanyBlock(profile: CompanyProfile): string {
  const flagDescriptions = profile.flags.map((f) => FLAG_LABELS[f] ?? f).join(', ');

  return [
    '## DANE FIRMY',
    `Nazwa: ${profile.name}`,
    `NIP: ${profile.nip}`,
    `Wielkość: ${SIZE_LABELS[profile.size]}`,
    `Liczba pracowników: ${profile.employeeCountRange}`,
    `Województwo: ${profile.voivodeship}`,
    `Kody PKD: ${profile.pkdCodes.join(', ')}`,
    `Charakterystyka: ${flagDescriptions || 'brak danych'}`,
  ].join('\n');
}

function buildMatchedProgramsBlock(profile: CompanyProfile): string {
  const matches = matchPrograms(profile.flags, profile.voivodeship, profile.size);

  if (matches.length === 0) {
    return '## DOPASOWANE PROGRAMY\nBrak programów spełniających kryteria dla tej firmy w aktualnej bazie.';
  }

  const lines = ['## DOPASOWANE PROGRAMY', ''];

  for (const program of matches) {
    lines.push(`### ${program.name}`);
    lines.push(`Instytucja: ${program.institution}`);
    lines.push(`Status: ${STATUS_LABELS[program.status] ?? program.status}`);
    if (program.openDate) lines.push(`Data otwarcia naboru: ${program.openDate}`);
    if (program.closeDate) lines.push(`Termin składania wniosków: ${program.closeDate}`);
    if (program.nextOpenExpected) lines.push(`Następny nabór oczekiwany: ${program.nextOpenExpected}`);
    lines.push(`Kwota: ${program.maxAmountDesc}`);
    lines.push(`Strona instytucji: ${program.url}`);
    if (program.notes) lines.push(`Uwagi: ${program.notes}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function buildAgentSystemPrompt(profile: CompanyProfile): string {
  const companyBlock = buildCompanyBlock(profile);
  const programsBlock = buildMatchedProgramsBlock(profile);

  return `Jesteś asystentem specjalizującym się w publicznych programach dotacyjnych i wsparcia dla polskich przedsiębiorstw. Twoja rola: pomagać firmie zrozumieć, o jakie dofinansowania może się ubiegać, jakie są wymagania i jak złożyć wniosek.

${companyBlock}

${programsBlock}

## ZASADY ODPOWIEDZI

1. NIGDY nie gwarantuj przyznania dotacji. Używaj zwrotów: "możesz się ubiegać o...", "spełniasz kryteria formalne do...", "rekomendujemy sprawdzenie...". Decyzja należy do instytucji.

2. ZAWSZE podawaj pełną nazwę instytucji i adres URL źródła przy każdym wspomnianym programie.

3. ZAKRES SPECJALIZACJI: odpowiadasz WYŁĄCZNIE na pytania dotyczące:
   - KFS i nabory PUP dla pracodawców (szkolenia, staże, refundacje stanowisk)
   - PFRON (dofinansowanie do wynagrodzeń ON, rehabilitacja, likwidacja barier)
   - KPO (inwestycje i cyfryzacja MŚP)
   - Samorządy regionalne (programy FEM, FE SL, FEMaz itp.)
   - PARP i FENG (innowacje, ścieżka SMART, usługi rozwojowe)
   - BGK (instrumenty zwrotne dla przedsiębiorstw)
   - ARiMR (jedynie dla firm z sektora rolnego)
   NIE odpowiadasz na pytania dotyczące przetargów publicznych (zamówień publicznych), ulg podatkowych, ani dotacji dla osób fizycznych.

4. Jeśli firma nie spełnia kryteriów danego programu, powiedz to wprost i wskaż, czego brakuje.

5. Język odpowiedzi: POLSKI. Używaj języka formalnego, ale zrozumiałego.

6. Każdą odpowiedź KOŃCZY następujące zdanie (dokładnie, bez zmian):
   "Stan wiedzy: maj 2026. Weryfikuj terminy i wymagania bezpośrednio w instytucji przed złożeniem wniosku."

7. Jeśli pytanie dotyczy programu spoza bazy lub aktualności danych: przyznaj ograniczenie i odeślij do strony instytucji.`;
}
