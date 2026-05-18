import { fetchFeeds } from '@/app/aktualnosci/rss';
import type { FeedItem } from '@/app/aktualnosci/rss';
import { GRANT_RSS_SOURCES } from '@/data/grant-rss-sources';
import { PROGRAMS } from '@/data/programs-b2b';

// ---------------------------------------------------------------------------
// Keyword sets for nabor detection
// ---------------------------------------------------------------------------

const OPEN_KEYWORDS = [
  'nabór', 'nowy nabór', 'ogłoszono nabór', 'otwarcie naboru', 'ruszył nabór',
  'trwa nabór', 'ruszyło dofinansowanie', 'otwarto dofinansowanie',
  'wnioski można składać', 'termin składania wniosków', 'startuje nabór',
  'dofinansowanie dla firm', 'dotacja na', 'nabór wniosków',
  'ogłoszenie naboru', 'przyjmowanie wniosków',
];

const CLOSE_KEYWORDS = [
  'zakończono nabór', 'zamknięto nabór', 'zakończenie naboru',
  'wyniki naboru', 'lista rankingowa', 'rozstrzygnięcie naboru',
  'nabór zakończony', 'zamknięcie naboru',
];

// Keywords per static program ID -- used to link scraped items to known programs
const PROGRAM_KEYWORDS: Record<string, string[]> = {
  'kfs-podstawowy':          ['kfs', 'krajowy fundusz szkoleniowy', 'nabór kfs'],
  'kfs-priorytetowy':        ['kfs priorytetowy', 'priorytetowy kfs', 'kfs mśp'],
  'pup-refundacja-stanowiska': ['refundacja stanowiska', 'wyposażenie stanowiska pracy', 'pup refundacja'],
  'pup-staze':               ['staż bezrobotnych', 'staż z pup', 'pup staże'],
  'pup-roboty-publiczne':    ['roboty publiczne', 'pup roboty'],
  'pup-dotacja-dzialalnosc': ['jednorazowe środki na działalność', 'podjęcie działalności bezrobotny', 'art. 46'],
  'pfron-sod':               ['pfron sod', 'dofinansowanie wynagrodzeń on', 'system obsługi dofinansowania'],
  'pfron-rehabilitacja':     ['pfron rehabilitacja', 'rehabilitacja zawodowa pfron'],
  'pfron-bariery':           ['pfron bariery', 'likwidacja barier architektonicznych', 'bariery w zakładzie'],
  'pfron-dzialalnosc-on':    ['pfron działalność gospodarcza', 'niepełnosprawny działalność', 'pcpr dofinansowanie działalności'],
  'kpo-a2-cyfryzacja':       ['kpo cyfryzacja', 'kpo a2', 'cyfryzacja mśp kpo', 'dostępność cyfryzacja'],
  'parp-feng-msp':           ['feng 1.1', 'ścieżka smart', 'smart parp', 'parp innowacje mśp'],
  'parp-rozw-kompetencji':   ['akademia menedżerów', 'parp kompetencje', 'rozwój kompetencji parp'],
  'ncbr-szybka-sciezka':     ['szybka ścieżka ncbr', 'szybka ścieżka badania', 'ncbr badania', 'feng ncbr'],
  'arimir-modernizacja':     ['arimr modernizacja', 'modernizacja gospodarstw', 'plan strategiczny wpr'],
  'arimir-restrukturyzacja': ['restrukturyzacja małych', 'małe gospodarstwa rolne', 'premia arimr'],
  'bgk-innowacyjne':         ['bgk pożyczki innowacje', 'bgk polska wschodnia', 'pożyczki na innowacje bgk'],
  'pofe-uslugi-rozwojowe':   ['usługi rozwojowe', 'pofe', 'baza usług rozwojowych', 'bur szkolenia'],
  'samorzad-mazowsze':       ['mazowieckie mśp', 'miwp mazowsze', 'mjwpu', 'fundusze dla mazowsza'],
  'samorzad-malopolska':     ['małopolski bon szkoleniowy', 'mcp bon', 'małopolska mśp'],
  'samorzad-slask':          ['śląskie centrum przedsiębiorczości', 'scp dotacje', 'śląskie mśp'],
  'wup-szkolenia':           ['wup szkolenia', 'efs szkolenia regionalne', 'efs+ pracownicy wup'],
  'nfz-profilaktyka':        ['nfz profilaktyka', 'programy profilaktyczne nfz', 'profilaktyka pracowników'],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrapeItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  isNabor: boolean;
  isClose: boolean;
  matchedProgramId: string | null;
  scrapedAt: string;
}

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

function detectNabor(item: FeedItem): { isNabor: boolean; isClose: boolean } {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const isClose = CLOSE_KEYWORDS.some(kw => text.includes(kw));
  const isNabor = isClose || OPEN_KEYWORDS.some(kw => text.includes(kw));
  return { isNabor, isClose };
}

function matchToProgramId(item: FeedItem): string | null {
  const text = `${item.title} ${item.description}`.toLowerCase();
  for (const [programId, keywords] of Object.entries(PROGRAM_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return programId;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main scrape function
// ---------------------------------------------------------------------------

export async function scrapeGrantSources(): Promise<ScrapeItem[]> {
  const { items } = await fetchFeeds(GRANT_RSS_SOURCES);
  const now = new Date().toISOString();

  const results: ScrapeItem[] = [];

  for (const item of items) {
    const { isNabor, isClose } = detectNabor(item);
    if (!isNabor) continue; // skip non-grant items

    results.push({
      id: item.id,
      sourceId: item.sourceId,
      sourceName: item.source,
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      isNabor,
      isClose,
      matchedProgramId: matchToProgramId(item),
      scrapedAt: now,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Context builder -- inject recent scrape data into agent system prompt
// ---------------------------------------------------------------------------

export function buildLiveIntelBlock(items: ScrapeItem[]): string {
  if (items.length === 0) return '';

  const lines = [
    '## BIEŻĄCY MONITORING -- SYGNAŁY Z OSTATNICH 24 GODZIN',
    'Poniższe wpisy pochodzą z automatycznego monitoringu oficjalnych stron rządowych.',
    'Są to SYGNAŁY do weryfikacji -- nie potwierdzone informacje. Zawsze odsyłaj do źródła.',
    '',
  ];

  for (const item of items.slice(0, 10)) {
    const prefix = item.isClose ? '[ZAMKNIĘCIE NABORU]' : '[NOWY NABÓR / AKTUALNOŚĆ]';
    lines.push(`${prefix} ${item.sourceName}: ${item.title}`);
    if (item.description) {
      lines.push(`  Opis: ${item.description.slice(0, 150)}`);
    }
    lines.push(`  Źródło: ${item.link}`);
    if (item.matchedProgramId) {
      const prog = PROGRAMS.find(p => p.id === item.matchedProgramId);
      if (prog) lines.push(`  Powiązany program w bazie: "${prog.name}"`);
    }
    lines.push('');
  }

  lines.push(
    'INSTRUKCJA DLA AGENTA: Jeśli użytkownik pyta o program powiązany z powyższymi sygnałami,',
    'poinformuj go o wykrytej aktywności i ZAWSZE odeślij do źródłowego URL w celu weryfikacji.',
    'Nie twierdzisz, że nabór jest "otwarty" -- mówisz "wykryto aktywność, sprawdź bezpośrednio".',
  );

  return lines.join('\n');
}
