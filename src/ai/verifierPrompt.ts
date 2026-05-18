import { MatchResult, UserProfile } from '@/engine/types';

export function buildVerifierMessages(
  profile: UserProfile,
  matches: MatchResult[],
): { role: 'system' | 'user'; content: string }[] {
  const systemPrompt = `Jesteś weryfikatorem świadczeń rządowych w Polsce. Twoja rola to TYLKO sprawdzanie czy dopasowania są prawidłowe.

ZASADY:
1. Dla każdego dopasowanego świadczenia znajdź powody, dla których ta osoba może NIE kwalifikować się
2. Sprawdź progi dochodowe, ograniczenia wiekowe, wykluczenia
3. Jeśli nie możesz znaleźć wykluczenia, potwierdź z pewnością WYSOKA
4. Jeśli coś jest niejednoznaczne lub brakuje danych, oznacz jako ŚREDNIA
5. Jeśli znalazłeś twarde wykluczenie, oznacz jako NISKA
6. Nigdy nie dodawaj świadczeń których nie ma w liście wejściowej
7. Odpowiadaj TYLKO w formacie JSON

FORMAT ODPOWIEDZI (JSON array):
[
  {
    "id": "benefit-id",
    "confidence": "WYSOKA" | "SREDNIA" | "NISKA",
    "warnings": ["ostrzeżenie 1", "ostrzeżenie 2"],
    "reason": "krótkie uzasadnienie"
  }
]`;

  const matchesDescription = matches.map(m => {
    const b = m.benefit;
    return `- ${b.id}: ${b.nazwa} (${b.kwota})
  Status: ${m.status}
  Dopasowane: ${m.matchedCriteria.join(', ') || 'brak specyficznych wymagań'}
  Niespełnione: ${m.failedCriteria.join(', ') || 'brak'}
  Wykluczenia do sprawdzenia: ${b.wykluczenia.map(w => w.opis).join(', ') || 'brak'}`;
  }).join('\n');

  const userMessage = `PROFIL UŻYTKOWNIKA:
- Wiek: ${profile.wiek} lat
- Płeć: ${profile.plec === 'K' ? 'kobieta' : 'mężczyzna'}
- Stan cywilny: ${profile.stanCywilny}
- Dzieci: ${profile.liczbaDzieci} (wiek: ${profile.wiekDzieci.join(', ') || 'brak'})
- Dochód miesięcznie: ${profile.dochodMiesiecznie} PLN
- Dochód na osobę: ${profile.dochodNaOsobe} PLN
- Zatrudnienie: ${profile.zatrudnienie}
- Niepełnosprawność: ${profile.niepelnosprawnosc}
- Własność: ${profile.wlasnosc}
- Województwo: ${profile.wojewodztwo}
- Działalność: ${profile.prowadzDzialalnosc ? 'tak' : 'nie'}
- Pierwsza działalność: ${profile.pierwszaDzialalnosc ? 'tak' : 'nie'}
${profile.dataDzialalnosci ? `- Data rejestracji firmy: ${profile.dataDzialalnosci}` : ''}
${profile.ciaza ? '- Ciąża: tak' : ''}

DOPASOWANE ŚWIADCZENIA:
${matchesDescription}

Zweryfikuj każde świadczenie i zwróć JSON z oceną pewności.`;

  return [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userMessage },
  ];
}

export interface VerifierResult {
  id: string;
  confidence: 'WYSOKA' | 'SREDNIA' | 'NISKA';
  warnings: string[];
  reason: string;
}

export function parseVerifierResponse(raw: string): VerifierResult[] {
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
