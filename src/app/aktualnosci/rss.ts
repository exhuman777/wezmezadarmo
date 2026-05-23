export type Audience = 'wszyscy' | 'jdg' | 'firmy';

export interface FeedMeta {
  id: string;
  name: string;       // short label e.g. "ZUS"
  fullName: string;   // long name for tooltip
  url: string;
  audiences: Audience[];
  tags: string[];
  requiresProxy?: boolean; // wymaga CF Worker (blokada Incapsula/Imperva na Vercel)
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
    // Liferay AssetPublisher RSS — działa bezpośrednio (poprzedni URL zwracał stronę HTML)
    url: 'https://www.zus.pl/o-zus/aktualnosci/-/asset_publisher/aktualnosci/rss',
    audiences: ['wszyscy', 'jdg', 'firmy'],
    tags: ['ubezpieczenia', 'składki', 'świadczenia', 'emerytury'],
  },
  {
    id: 'gus',
    name: 'GUS',
    fullName: 'Główny Urząd Statystyczny',
    // Prawidłowy URL XML (poprzedni kierował do strony HTML o RSS)
    url: 'https://stat.gov.pl/rss/pl/5438/8.xml',
    audiences: ['wszyscy', 'firmy'],
    tags: ['statystyki', 'gospodarka', 'dane', 'wskaźniki'],
  },
  {
    id: 'nbp',
    name: 'NBP',
    fullName: 'Narodowy Bank Polski',
    // Incapsula blokuje Vercel — wymaga CF Worker (RSS_PROXY_URL)
    url: 'https://www.nbp.pl/home.aspx?f=/aktualnosci/aktualnosci.html',
    audiences: ['wszyscy', 'firmy'],
    tags: ['kursy walut', 'polityka pieniężna', 'stopy procentowe'],
    requiresProxy: true,
  },
  {
    id: 'uokik',
    name: 'UOKiK',
    fullName: 'Urząd Ochrony Konkurencji i Konsumentów',
    // Brak RSS — CF Worker scrapuje HTML aktualności
    url: 'https://uokik.gov.pl/aktualnosci',
    audiences: ['wszyscy', 'firmy'],
    tags: ['ochrona konsumentów', 'konkurencja', 'ostrzeżenia', 'reklamacje'],
    requiresProxy: true,
  },
  {
    id: 'fundusze',
    name: 'Fundusze EU',
    fullName: 'Fundusze Europejskie',
    // JS SPA — przez CF Worker (szansa na bypass Vercel-block)
    url: 'https://www.funduszeeuropejskie.gov.pl/strony/aktualnosci/',
    audiences: ['jdg', 'firmy'],
    tags: ['dotacje', 'UE', 'dofinansowania', 'granty', 'KPO'],
    requiresProxy: true,
  },
  {
    id: 'ezdrowie',
    name: 'e-Zdrowie',
    fullName: 'Portal e-Zdrowia (eZdrowie.gov.pl)',
    // JS SPA — przez CF Worker
    url: 'https://ezdrowie.gov.pl/portal/home/aktualnosci?isExtend=true',
    audiences: ['wszyscy'],
    tags: ['zdrowie', 'NFZ', 'e-recepta', 'leczenie'],
    requiresProxy: true,
  },
  {
    id: 'sejm',
    name: 'Sejm',
    fullName: 'Sejm Rzeczypospolitej Polskiej',
    // Imperva CDN blokuje Vercel — wymaga CF Worker
    url: 'https://www.sejm.gov.pl/sejm10.nsf/rss.xsp',
    audiences: ['wszyscy', 'firmy', 'jdg'],
    tags: ['prawo', 'legislacja', 'przepisy', 'ustawa'],
    requiresProxy: true,
  },
  {
    id: 'arimr',
    name: 'ARiMR',
    fullName: 'Agencja Restrukturyzacji i Modernizacji Rolnictwa',
    // Przez CF Worker
    url: 'https://www.arimr.gov.pl/aktualnosci-i-komunikaty',
    audiences: ['jdg', 'firmy'],
    tags: ['rolnictwo', 'dotacje', 'dopłaty', 'agro'],
    requiresProxy: true,
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

const FETCH_TIMEOUT_MS = 9000;
const MAX_ITEMS_PER_FEED = 15;

// CF Worker proxy — ustaw RSS_PROXY_URL i RSS_PROXY_SECRET w Vercel env
const PROXY_URL = process.env.RSS_PROXY_URL ?? '';
const PROXY_SECRET = process.env.RSS_PROXY_SECRET ?? '';

async function fetchFeed(feed: FeedMeta): Promise<FeedItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  // Użyj CF Worker jeśli feed wymaga proxy i Worker jest skonfigurowany
  const useProxy = feed.requiresProxy && PROXY_URL;
  const fetchUrl = useProxy
    ? `${PROXY_URL}?id=${encodeURIComponent(feed.id)}`
    : feed.url;

  const headers: Record<string, string> = useProxy
    ? {
        'Authorization': `Bearer ${PROXY_SECRET}`,
        'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml, */*',
      }
    : {
        'User-Agent': 'Mozilla/5.0 (compatible; wezmezadarmo-rss/1.0; +https://www.wezmezadarmo.com/llm.md)',
        'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml, */*',
      };

  try {
    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      headers,
      redirect: 'follow',
      next: { revalidate: 1800 },
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

export async function fetchFeeds(feeds: FeedMeta[]): Promise<FetchResult> {
  const results = await Promise.allSettled(feeds.map(f => fetchFeed(f)));

  const items: FeedItem[] = [];
  const active: string[] = [];
  const failed: string[] = [];

  results.forEach((r, i) => {
    const feed = feeds[i];
    if (r.status === 'fulfilled' && r.value.length > 0) {
      items.push(...r.value);
      active.push(feed.id);
    } else {
      failed.push(feed.id);
    }
  });

  items.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  return { items, active, failed };
}

export async function fetchAllFeeds(): Promise<FetchResult> {
  return fetchFeeds(FEEDS);
}

// Live source IDs - dzialaja bezposrednio bez proxy
const LIVE_SOURCE_IDS = new Set(['zus', 'gus']);

// Pobiera z Supabase rss_cache dla zablokowanych zrodel
async function fetchFromSupabaseCache(sourceIds: string[]): Promise<FeedItem[]> {
  if (sourceIds.length === 0) return [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!url || !key) {
    console.error('[rss.fetchFromSupabaseCache] brak SUPABASE env');
    return [];
  }

  try {
    const params = new URLSearchParams({
      select: 'id,source_id,source_name,title,link,description,pub_date,audiences',
      source_id: `in.(${sourceIds.join(',')})`,
      order: 'fetched_at.desc',
      limit: '150',
    });
    const res = await fetch(`${url}/rest/v1/rss_cache?${params}`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[rss.fetchFromSupabaseCache] HTTP', res.status, await res.text().then(t => t.slice(0, 200)));
      return [];
    }
    const data = await res.json() as Array<{
      id: string; source_id: string; source_name: string;
      title: string; link: string; description: string;
      pub_date: string | null; audiences: Audience[];
    }>;
    return data.map(row => ({
      id: row.id,
      title: row.title,
      link: row.link,
      description: row.description,
      pubDate: row.pub_date,
      source: row.source_name,
      sourceId: row.source_id,
      audiences: row.audiences,
    }));
  } catch (e) {
    console.error('[rss.fetchFromSupabaseCache] EXCEPTION:', (e as Error).message);
    return [];
  }
}

// Combo: live dla ZUS+GUS, cache dla reszty. Glowna funkcja uzywana przez strone /aktualnosci.
export async function fetchAllWithCache(): Promise<FetchResult> {
  const liveFeeds = FEEDS.filter(f => LIVE_SOURCE_IDS.has(f.id));
  const cachedSourceIds = FEEDS.filter(f => !LIVE_SOURCE_IDS.has(f.id)).map(f => f.id);

  const [liveResult, cachedItems] = await Promise.all([
    fetchFeeds(liveFeeds),
    fetchFromSupabaseCache(cachedSourceIds),
  ]);

  const active = [
    ...liveResult.active,
    ...cachedSourceIds.filter(id => cachedItems.some(i => i.sourceId === id)),
  ];
  const failed = [
    ...liveResult.failed,
    ...cachedSourceIds.filter(id => !cachedItems.some(i => i.sourceId === id)),
  ];

  const items = [...liveResult.items, ...cachedItems];

  items.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  return { items, active, failed };
}
