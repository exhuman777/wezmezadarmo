import { MatchResult, UserProfile } from '@/engine/types';

export function buildVerifierMessages(
  profile: UserProfile,
  matches: MatchResult[],
): { role: 'system' | 'user'; content: string }[] {
  const systemPrompt = `Jestes weryfikatorem swiadczen rzadowych w Polsce. Twoja rola to TYLKO sprawdzanie czy dopasowania sa prawidlowe.

ZASADY:
1. Dla kazdego dopasowanego swiadczenia znajdz powody, dla ktorych ta osoba moze NIE kwalifikowac sie
2. Sprawdz progi dochodowe, ograniczenia wiekowe, wykluczenia
3. Jesli nie mozesz znalezc wykluczenia, potwierdz z pewnoscia WYSOKA
4. Jesli cos jest niejednoznaczne lub brakuje danych, oznacz jako SREDNIA
5. Jesli znalazles twarde wykluczenie, oznacz jako NISKA
6. Nigdy nie dodawaj swiadczen ktorych nie ma w liscie wejsciowej
7. Odpowiadaj TYLKO w formacie JSON

FORMAT ODPOWIEDZI (JSON array):
[
  {
    "id": "benefit-id",
    "confidence": "WYSOKA" | "SREDNIA" | "NISKA",
    "warnings": ["ostrzezenie 1", "ostrzezenie 2"],
    "reason": "krotkie uzasadnienie"
  }
]`;

  const matchesDescription = matches.map(m => {
    const b = m.benefit;
    return `- ${b.id}: ${b.nazwa} (${b.kwota})
  Status: ${m.status}
  Dopasowane: ${m.matchedCriteria.join(', ') || 'brak specyficznych wymagan'}
  Niespelnione: ${m.failedCriteria.join(', ') || 'brak'}
  Wykluczenia do sprawdzenia: ${b.wykluczenia.map(w => w.opis).join(', ') || 'brak'}`;
  }).join('\n');

  const userMessage = `PROFIL UZYTKOWNIKA:
- Wiek: ${profile.wiek} lat
- Plec: ${profile.plec === 'K' ? 'kobieta' : 'mezczyzna'}
- Stan cywilny: ${profile.stanCywilny}
- Dzieci: ${profile.liczbaDzieci} (wiek: ${profile.wiekDzieci.join(', ') || 'brak'})
- Dochod miesiecznie: ${profile.dochodMiesiecznie} PLN
- Dochod na osobe: ${profile.dochodNaOsobe} PLN
- Zatrudnienie: ${profile.zatrudnienie}
- Niepelnosprawnosc: ${profile.niepelnosprawnosc}
- Wlasnosc: ${profile.wlasnosc}
- Wojewodztwo: ${profile.wojewodztwo}
- Dzialalnosc: ${profile.prowadzDzialalnosc ? 'tak' : 'nie'}
- Pierwsza dzialalnosc: ${profile.pierwszaDzialalnosc ? 'tak' : 'nie'}
${profile.dataDzialalnosci ? `- Data rejestracji firmy: ${profile.dataDzialalnosci}` : ''}
${profile.ciaza ? '- Ciaza: tak' : ''}

DOPASOWANE SWIADCZENIA:
${matchesDescription}

Zweryfikuj kazde swiadczenie i zwroc JSON z ocena pewnosci.`;

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
