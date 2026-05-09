import { MatchResult } from '@/engine/types';
import { VerifierResult } from './verifierPrompt';

export function applyVerification(
  matches: MatchResult[],
  verifierResults: VerifierResult[],
): MatchResult[] {
  return matches.map(m => {
    const verification = verifierResults.find(v => v.id === m.benefit.id);
    if (!verification) return m;

    const updatedWarnings = [...m.warnings, ...verification.warnings];

    // Verifier can only downgrade confidence, never upgrade
    let confidence = m.confidence;
    if (verification.confidence === 'NISKA') {
      confidence = 'NISKA';
    } else if (verification.confidence === 'SREDNIA' && m.confidence === 'WYSOKA') {
      confidence = 'SREDNIA';
    }

    // If verifier says NISKA confidence, downgrade status to MOZLIWE
    let status = m.status;
    if (verification.confidence === 'NISKA' && status === 'PRZYSLUGUJE') {
      status = 'MOZLIWE';
    }

    return {
      ...m,
      status,
      confidence,
      warnings: updatedWarnings,
    };
  }).filter(m => m.confidence !== 'NISKA' || m.status !== 'NIE_PRZYSLUGUJE');
}

export function formatBenefitsSummary(results: MatchResult[]): string {
  if (results.length === 0) {
    return 'Nie znaleziono swiadczen pasujacych do Twojego profilu. Jesli uwazasz ze to blad, skontaktuj sie z lokalnym MOPS lub urzedem gminy.';
  }

  const przysluguje = results.filter(r => r.status === 'PRZYSLUGUJE');
  const mozliwe = results.filter(r => r.status === 'MOZLIWE');

  let summary = `Znaleziono ${results.length} swiadczen`;
  if (przysluguje.length > 0) {
    summary += ` (${przysluguje.length} pewnych`;
  }
  if (mozliwe.length > 0) {
    summary += `, ${mozliwe.length} do weryfikacji`;
  }
  summary += ').';

  const totalMin = results.reduce((sum, r) => sum + (r.benefit.kwotaMin ?? 0), 0);
  const totalMax = results.reduce((sum, r) => sum + (r.benefit.kwotaMax ?? 0), 0);
  if (totalMax > 0) {
    summary += ` Szacowana wartosc: ${totalMin !== totalMax ? `${totalMin}-${totalMax}` : totalMax} PLN.`;
  }

  return summary;
}
