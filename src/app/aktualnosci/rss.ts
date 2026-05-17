export type Audience = 'wszyscy' | 'jdg' | 'firmy';

export interface FeedMeta {
  id: string;
  name: string;       // short label e.g. "ZUS"
  fullName: string;   // long name for tooltip
  url: string;
  audiences: Audience[];
  tags: string[];
}

export interface FeedItem {
  id: string;         // deterministic hash of link
  title: string;
  link: string;
  description: string;
  pubDate: string | null; // ISO string -- safe to pass server->client
  source: string;         // feed name
  sourceId: string;
  audiences: Audience[];
}

export interface FetchResult {
  items: FeedItem[];
  active: string[];   // feed ids that responded
  failed: string[];   // feed ids that failed
}

// ---------------------------------------------------------------------------
// Feed registry
// ---------------------------------------------------------------------------

export const FEEDS: FeedMeta[] = [
  {
    id: 'zus',
    name: 'ZUS',
    fullName: 'Zakład Ubezpieczeń Społecznych',
    url: 'https://www.zus.pl/kanal-rss',
    audiences: ['wszyscy', 'jdg', 'firmy'],
    tags: ['ubezpieczenia', 'składki', 'świadczenia', 'emerytury'],
  },
  {
    id: 'gus',
    name: 'GUS',
    fullName: 'Główny Urząd Statystyczny',
    url: 'https://stat.gov.pl/rss/',
    audiences: ['wszyscy', 'firmy'],
    tags: ['statystyki', 'gospodarka', 'dane', 'wskaźniki'],
  },
  {
    id: 'nbp',
    name: 'NBP',
    fullName: 'Narodowy Bank Polski',
    url: 'https://rss.nbp.pl/',
    audiences: ['wszyscy', 'firmy'],
    tags: ['kursy walut', 'polityka pieniężna', 'stopy procentowe'],
  },
  {
    id: 'uokik',
    name: 'UOKiK',
    fullName: 'Urząd Ochrony Konkurencji i Konsumentów',
    url: 'https://uokik.gov.pl/rss.php?m=0',
    audiences: ['wszyscy', 'firmy'],
    tags: ['ochrona konsumentów', 'konkurencja', 'ostrzeżenia', 'reklamacje'],
  },
  {
    id: 'fundusze',
    name: 'Fundusze EU',
    fullName: 'Fundusze Europejskie',
    url: 'https://www.funduszeeuropejskie.gov.pl/rss',
    audiences: ['jdg', 'firmy'],
    tags: ['dotacje', 'UE', 'dofinansowania', 'granty', 'KPO'],
  },
  {
    id: 'ezdrowie',
    name: 'e-Zdrowie',
    fullName: 'Portal e-Zdrowia (eZdrowie.gov.pl)',
    url: 'https://ezdrowie.gov.pl/portal/home/rss',
    audiences: ['wszyscy'],
    tags: ['zdrowie', 'NFZ', 'e-recepta', 'leczenie'],
  },
  {
    id: 'sejm',
    name: 'Sejm',
    fullName: 'Sejm Rzeczypospolitej Polskiej',
    url: 'https://www.sejm.gov.pl/sejm10.nsf/rss.xsp',
    audiences: ['wszyscy', 'firmy', 'jdg'],
    tags: ['prawo', 'legislacja', 'przepisy', 'ustawa'],
  },
  {
    id: 'arimr',
    name: 'ARiMR',
    fullName: 'Agencja Restrukturyzacji i Modernizacji Rolnictwa',
    url: 'https://www.arimr.gov.pl/rss.html',
    audiences: ['jdg', 'firmy'],
    tags: ['rolnictwo', 'dotacje', 'dopłaty', 'agro'],
  },
];

// ---------------------------------------------------------------------------
// XML parser -- no external dependency
// ---------------------------------------------------------------------------

function extractTagText(xml: string, tag: string): string {
  // CDATA variant
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cm = xml.match(cdata);
  if (cm) return cm[1].trim();

  // Normal text variant
  const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const nm = xml.match(normal);
  if (nm) return nm[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

  return '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']*)["'][^>]*>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}

function parseRss2Items(xml: string, feed: FeedMeta): FeedItem[] {
  const items: FeedItem[] = [];
  const raw = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)];
  for (const m of raw) {
    const chunk = m[1];
    const title = stripHtml(extractTagText(chunk, 'title'));
    const link =
      extractTagText(chunk, 'link') ||
      extractAttr(chunk, 'link', 'href') ||
      '';
    const description = stripHtml(extractTagText(chunk, 'description')).slice(0, 280);
    const pubDate = parseDate(
      extractTagText(chunk, 'pubDate') ||
      extractTagText(chunk, 'dc:date') ||
      extractTagText(chunk, 'updated')
    );
    if (!title || !link) continue;
    items.push({
      id: simpleHash(link + feed.id),
      title,
      link,
      description,
      pubDate: pubDate ? pubDate.toISOString() : null,
      source: feed.name,
      sourceId: feed.id,
      audiences: feed.audiences,
    });
  }
  return items;
}

function parseAtomEntries(xml: string, feed: FeedMeta): FeedItem[] {
  const items: FeedItem[] = [];
  const raw = [...xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi)];
  for (const m of raw) {
    const chunk = m[1];
    const title = stripHtml(extractTagText(chunk, 'title'));
    const link =
      extractAttr(chunk, 'link', 'href') ||
      extractTagText(chunk, 'link') ||
      '';
    const description = stripHtml(
      extractTagText(chunk, 'summary') || extractTagText(chunk, 'content')
    ).slice(0, 280);
    const pubDate = parseDate(
      extractTagText(chunk, 'published') || extractTagText(chunk, 'updated')
    );
    if (!title || !link) continue;
    items.push({
      id: simpleHash(link + feed.id),
      title,
      link,
      description,
      pubDate: pubDate ? pubDate.toISOString() : null,
      source: feed.name,
      sourceId: feed.id,
      audiences: feed.audiences,
    });
  }
  return items;
}

function parseXml(xml: string, feed: FeedMeta): FeedItem[] {
  const isAtom = /<feed[\s>]/i.test(xml) || xml.includes('xmlns="http://www.w3.org/2005/Atom"');
  return isAtom ? parseAtomEntries(xml, feed) : parseRss2Items(xml, feed);
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 6000;
const MAX_ITEMS_PER_FEED = 15;

async function fetchFeed(feed: FeedMeta): Promise<FeedItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'wezmezadarmo.pl/rss-aggregator (+https://wezmezadarmo.pl)',
        Accept: 'application/rss+xml, application/atom+xml, text/xml, application/xml',
      },
      // no cache in next.js server component -- let our revalidate handle it
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = parseXml(text, feed);
    return parsed.slice(0, MAX_ITEMS_PER_FEED);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchAllFeeds(): Promise<FetchResult> {
  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));

  const items: FeedItem[] = [];
  const active: string[] = [];
  const failed: string[] = [];

  results.forEach((r, i) => {
    const feed = FEEDS[i];
    if (r.status === 'fulfilled' && r.value.length > 0) {
      items.push(...r.value);
      active.push(feed.id);
    } else {
      failed.push(feed.id);
    }
  });

  // Sort newest first; items without dates go to end
  items.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  return { items, active, failed };
}
