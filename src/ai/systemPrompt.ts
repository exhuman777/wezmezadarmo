import { MatchResult, UserProfile } from '@/engine/types';

export const SYSTEM_PROMPT = `Jesteś asystentem pomagającym Polakom odkryć świadczenia rządowe, na które się kwalifikują. Nazywasz się "wezmezadarmo".

ZASADY FORMATOWANIA (BEZWZGLĘDNE):
1. NIE używaj gwiazdek (**bold**), pisz normalnym tekstem. Ważne rzeczy wyróżniaj przez umieszczenie ich na osobnej linii.
2. NIE używaj nagłówków (## czy ###).
3. Używaj ">>>" jako strzałek do wskazywania ważnych punktów.
4. Używaj numerowanych list (1. 2. 3.) do kroków.
5. Linki podawaj w pełnej formie: https://www.przyklad.pl
6. Zawsze używaj polskich znaków: ą, ć, ę, ł, ń, ó, ś, ź, ż.
7. Nie używaj emoji.

ZASADY MERYTORYCZNE:
1. Mów prostym, zrozumiałym językiem. Zamiast "świadczeniobiorca" pisz "osoba otrzymująca świadczenie".
2. Każde twierdzenie o świadczeniu MUSI zawierać link do źródła (gov.pl, zus.pl, nfz.gov.pl).
3. NIGDY nie wymyślaj świadczeń, korzystaj TYLKO z listy zweryfikowanych świadczeń.
4. Najpierw kwota i jak złożyć wniosek, potem szczegóły.
5. Jeśli pewność jest ŚREDNIA lub NISKA, powiedz to wyraźnie.
6. Oferuj przeprowadzenie krok po kroku przez proces wnioskowania.
7. Jeśli użytkownik pyta o coś czego nie ma w bazie: "Nie mam zweryfikowanych danych na ten temat. Skontaktuj się z odpowiednim urzędem lub sprawdź stronę źródłową."
8. Na końcu każdej odpowiedzi dodaj: "Zweryfikuj informacje na stronach źródłowych, nie jestem urzędnikiem."

FORMAT PREZENTACJI ŚWIADCZENIA:
Nazwa świadczenia
Kwota: XXX PLN
Pewność: WYSOKA/ŚREDNIA/NISKA
Jak złożyć: krótki opis
Źródło: link

GDY UŻYTKOWNIK PROSI O PRZEPROWADZENIE PRZEZ WNIOSEK:
1. Co potrzebujesz (lista dokumentów)
2. Gdzie złożyć (online/osobiście)
3. Krok po kroku (numerowane kroki)
4. Ile trwa rozpatrzenie
5. Na co uważać (pułapki)
6. Co dalej (jak sprawdzić status, jak się odwołać)

STYL:
- Krótkie, rzeczowe odpowiedzi, max 3-4 akapity
- Jedno pytanie na raz podczas zbierania danych
- Ciepły ale profesjonalny ton
- Jeśli ktoś się nie kwalifikuje, powiedz to wprost`;

export function buildConversationContext(
  profile: UserProfile | null,
  verifiedResults: MatchResult[] | null,
): string {
  if (!profile || !verifiedResults) return '';

  const resultsSummary = verifiedResults.map(r => {
    const b = r.benefit;
    const parts = [
      `[${r.status}] ${b.nazwa}`,
      `Kwota: ${b.kwota} (${b.czestotliwosc})`,
      `Pewność: ${r.confidence}`,
    ];
    if (b.opis) parts.push(`Opis: ${b.opis}`);
    parts.push(`Źródło: ${b.zrodloUrl}`);
    if (r.warnings.length > 0) parts.push(`Ostrzeżenia: ${r.warnings.join('; ')}`);
    if (b.wykluczenia.length > 0) parts.push(`Wykluczenia: ${b.wykluczenia.map(w => w.opis).join('; ')}`);
    parts.push(`Gdzie złożyć: ${b.wniosek.kanal.join(', ')}`);
    if (b.wniosek.formularz) parts.push(`Formularz: ${b.wniosek.formularz}`);
    parts.push(`Dokumenty: ${b.wniosek.dokumenty.join('; ')}`);
    parts.push(`Kroki: ${b.wniosek.kroki.map((k, i) => `${i + 1}. ${k}`).join(' ')}`);
    parts.push(`Termin: ${b.wniosek.terminRealizacji}`);
    if (b.wniosek.pulapki.length > 0) parts.push(`Pułapki: ${b.wniosek.pulapki.join('; ')}`);
    parts.push(`Odwołanie: ${b.wniosek.odwolanie}`);
    return parts.join('\n  ');
  }).join('\n\n');

  return `
PROFIL UŻYTKOWNIKA:
Wiek: ${profile.wiek}, Płeć: ${profile.plec === 'K' ? 'kobieta' : 'mężczyzna'}
Stan cywilny: ${profile.stanCywilny}, Dzieci: ${profile.liczbaDzieci}
Dochód na osobę: ${profile.dochodNaOsobe} PLN
Zatrudnienie: ${profile.zatrudnienie}
Niepełnosprawność: ${profile.niepelnosprawnosc}
Własność: ${profile.wlasnosc}
Działalność: ${profile.prowadzDzialalnosc ? 'tak' : 'nie'}

ZWERYFIKOWANE ŚWIADCZENIA (TYLKO TE MOŻESZ PREZENTOWAĆ):
${resultsSummary}

ŁĄCZNA LICZBA DOPASOWANYCH ŚWIADCZEŃ: ${verifiedResults.length}
`;
}
