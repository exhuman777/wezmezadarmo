import { Benefit } from './types';

/**
 * Normalizacja tekstu do wyszukiwania: usuwa polskie znaki diakrytyczne,
 * sprowadza do małych liter, redukuje białe znaki. Dzięki temu użytkownik
 * wpisujący "swiadczenie" (bez ogonków) trafi na "świadczenie".
 *
 * Uwaga: ł/Ł nie rozkłada się przez NFD (to osobny codepoint), więc
 * podmieniamy je ręcznie przed normalizacją Unicode.
 */
export function normalizePolish(input: string): string {
  return input
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // usuń znaki łączące (ogonki, kreski, kropki)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Popularne potoczne nazwy świadczeń, których nie ma wprost w treści.
 * Klucz: id świadczenia, wartość: lista aliasów (już bez diakrytyków).
 */
const BENEFIT_ALIASES: Record<string, string[]> = {
  '800-plus': ['800 plus', '800+', 'osiemset plus', 'rodzinne 800'],
  'becikowe': ['zapomoga porodowa', 'na narodziny'],
  'kosiniakowe': ['swiadczenie rodzicielskie', 'kosiniak'],
  'dobry-start': ['300 plus', '300+', 'wyprawka', 'wyprawka szkolna'],
  'ulga-prorodzinna': ['ulga na dziecko', 'ulga na dzieci'],
  '13-emerytura': ['trzynastka', 'trzynasta emerytura', '13 emerytura'],
  '14-emerytura': ['czternastka', 'czternasta emerytura', '14 emerytura'],
  'zasilek-dla-bezrobotnych': ['kuroniowka', 'zasilek dla bezrobotnego', 'zasilek bezrobotny'],
  'mama-4-plus': ['mama 4 plus', 'mama 4+', 'mama czworo'],
  'swiadczenie-uzupelniajace-500': ['500 plus dla niepelnosprawnych', '500+ dla niepelnosprawnych', '500 plus niesamodzielnych'],
  'leki-senior-65plus': ['darmowe leki', 'bezplatne leki', 'leki 65 plus', 'leki dla seniora'],
  'czyste-powietrze': ['dotacja na piec', 'wymiana pieca', 'dofinansowanie ocieplenia'],
  'renta-wdowia': ['wdowia renta', 'renta po mezu', 'renta po zonie'],
  'zasilek-pogrzebowy': ['na pogrzeb', 'koszty pogrzebu'],
  'ulga-termomodernizacyjna': ['ulga na termomodernizacje', 'odliczenie na ocieplenie'],
};

interface Field {
  text: string;      // znormalizowany ciąg (dla dopasowania podciągu i całej frazy)
  words: string[];   // słowa (dla dopasowania po rdzeniu/odmianie)
}

interface Indexed {
  benefit: Benefit;
  nazwa: Field;   // nazwa
  alias: Field;   // aliasy potoczne
  rest: Field;    // reszta przeszukiwalnej treści
}

function toField(normalized: string): Field {
  return { text: normalized, words: normalized.split(' ').filter(Boolean) };
}

function commonPrefixLen(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
}

/**
 * Dopasowanie tokenu do pola odporne na polską odmianę: najpierw podciąg
 * (najczęstszy przypadek), a dla dłuższych słów także wspólny rdzeń
 * (np. "seniorzy" trafia na "seniorow", "dzieci" na "dziecko").
 */
function tokenMatchesField(token: string, field: Field): boolean {
  if (field.text.includes(token)) return true;
  if (token.length < 5) return false;
  return field.words.some(w => w.length >= 5 && commonPrefixLen(w, token) >= 5);
}

function buildIndex(benefits: Benefit[]): Indexed[] {
  return benefits.map(b => {
    const aliasList = BENEFIT_ALIASES[b.id] ?? [];
    const restParts = [
      b.opis ?? '',
      b.kwota,
      b.kategoria,
      ...b.wniosek.kroki,
      ...b.wniosek.dokumenty,
      b.wniosek.formularz ?? '',
      b.zrodloNazwa,
    ];
    return {
      benefit: b,
      nazwa: toField(normalizePolish(b.nazwa)),
      alias: toField(normalizePolish(aliasList.join(' '))),
      rest: toField(normalizePolish(restParts.join(' '))),
    };
  });
}

/**
 * Wyszukiwanie świadczeń odporne na brak polskich znaków, przeszukujące
 * nazwę, opis, kroki, dokumenty oraz potoczne aliasy. Wymaga dopasowania
 * KAŻDEGO słowa zapytania (AND), wyniki sortuje wg trafności
 * (nazwa > alias > reszta), z bonusem za dopasowanie całej frazy w nazwie.
 *
 * Puste zapytanie zwraca wszystkie świadczenia w oryginalnej kolejności.
 */
export function searchBenefits(benefits: Benefit[], query: string): Benefit[] {
  const q = normalizePolish(query);
  if (!q) return [...benefits];

  const tokens = q.split(' ').filter(Boolean);
  const index = buildIndex(benefits);
  const scored: { benefit: Benefit; score: number; order: number }[] = [];

  index.forEach((item, order) => {
    let score = 0;
    let allMatched = true;

    for (const token of tokens) {
      if (tokenMatchesField(token, item.nazwa)) score += 10;
      else if (tokenMatchesField(token, item.alias)) score += 8;
      else if (tokenMatchesField(token, item.rest)) score += 3;
      else { allMatched = false; break; }
    }
    if (!allMatched) return;

    // Bonus: cała fraza w nazwie lub aliasie (mocny sygnał trafności)
    if (item.nazwa.text.includes(q)) score += 25;
    else if (item.alias.text.includes(q)) score += 15;

    scored.push({ benefit: item.benefit, score, order });
  });

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map(s => s.benefit);
}
