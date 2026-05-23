#!/usr/bin/env node
/**
 * scripts/fetch-rss-cache.mjs
 *
 * Pobiera aktualności z polskich instytucji blokowanych przez Vercel IP
 * i zapisuje do Supabase tabeli rss_cache.
 *
 * Uruchamiany przez GitHub Actions 2x dziennie.
 * Używa natywnego fetch (Node 18+) - zero dodatkowych zależności.
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const MAX_ITEMS_PER_FEED = 20;
const FETCH_TIMEOUT_MS = 15_000;
const FIRECRAWL_TIMEOUT_MS = 45_000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!FIRECRAWL_API_KEY) {
  console.warn('FIRECRAWL_API_KEY brak — fallback wyłączony (zablokowane źródła zostaną pominięte)');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.5',
  'Cache-Control': 'no-cache',
};

// ---------------------------------------------------------------------------
// Feeds
// ---------------------------------------------------------------------------

const FEEDS = [
  {
    id: 'nbp',
    name: 'NBP',
    url: 'https://www.nbp.pl/home.aspx?f=/aktualnosci/aktualnosci.html',
    audiences: ['wszyscy', 'firmy'],
    parser: 'html-nbp',
  },
  {
    id: 'sejm',
    name: 'Sejm',
    url: 'https://www.sejm.gov.pl/sejm10.nsf/rss.xsp',
    audiences: ['wszyscy', 'jdg', 'firmy'],
    parser: 'rss',
  },
  {
    id: 'uokik',
    name: 'UOKiK',
    url: 'https://uokik.gov.pl/aktualnosci',
    audiences: ['wszyscy', 'firmy'],
    parser: 'html-uokik',
  },
  {
    id: 'fundusze',
    name: 'Fundusze EU',
    url: 'https://www.funduszeeuropejskie.gov.pl/strony/aktualnosci/',
    audiences: ['jdg', 'firmy'],
    parser: 'html-fundusze',
  },
  {
    id: 'ezdrowie',
    name: 'e-Zdrowie',
    url: 'https://ezdrowie.gov.pl/portal/home/aktualnosci?isExtend=true',
    audiences: ['wszyscy'],
    parser: 'html-ezdrowie',
  },
  {
    id: 'arimr',
    name: 'ARiMR',
    url: 'https://www.arimr.gov.pl/aktualnosci-i-komunikaty',
    audiences: ['jdg', 'firmy'],
    parser: 'html-arimr',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractText(chunk, tag) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const mc = chunk.match(cdata);
  if (mc) return mc[1].trim();
  const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const mn = chunk.match(normal);
  if (mn) return mn[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  return '';
}

function extractAttrHref(chunk, tag) {
  const re = new RegExp(`<${tag}[^>]*\\shref=["']([^"']*)["'][^>]*>`, 'i');
  const m = chunk.match(re);
  return m ? m[1].trim() : '';
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.warn(`  fetch error: ${e.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Firecrawl fallback: renderuje JS, omija bot-checks (Incapsula/Imperva)
// Endpoint: POST https://api.firecrawl.dev/v1/scrape
// Zwraca: { success, data: { html, markdown, metadata } }
async function fetchWithFirecrawl(url) {
  if (!FIRECRAWL_API_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`  firecrawl error: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (!json.success || !json.data?.html) {
      console.warn(`  firecrawl error: ${json.error || 'brak HTML w odpowiedzi'}`);
      return null;
    }
    return json.data.html;
  } catch (e) {
    console.warn(`  firecrawl error: ${e.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function looksBlockedOrEmpty(html) {
  if (!html || html.length < 500) return true;
  const blockers = ['Incapsula', 'Please Wait', 'CWUDNSAI', 'Access Denied', 'cf-error-details', 'Just a moment'];
  return blockers.some(b => html.includes(b));
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseRss(xml, feed) {
  const items = [];
  // RSS 2.0 <item>
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const chunk = m[1];
    const title = stripHtml(extractText(chunk, 'title'));
    const link = extractText(chunk, 'link') || extractAttrHref(chunk, 'link');
    const description = stripHtml(
      extractText(chunk, 'description') || extractText(chunk, 'summary')
    ).slice(0, 300);
    const pubDate = parseDate(
      extractText(chunk, 'pubDate') || extractText(chunk, 'dc:date') || extractText(chunk, 'updated')
    );
    if (!title || !link) continue;
    items.push({ title, link, description, pubDate });
  }
  // Atom <entry>
  if (items.length === 0) {
    const entryRe = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((m = entryRe.exec(xml)) !== null && items.length < MAX_ITEMS_PER_FEED) {
      const chunk = m[1];
      const title = stripHtml(extractText(chunk, 'title'));
      const link = extractAttrHref(chunk, 'link') || extractText(chunk, 'link');
      const description = stripHtml(
        extractText(chunk, 'summary') || extractText(chunk, 'content')
      ).slice(0, 300);
      const pubDate = parseDate(
        extractText(chunk, 'published') || extractText(chunk, 'updated')
      );
      if (!title || !link) continue;
      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

function parseHtmlNbp(html) {
  const items = [];
  // NBP aktualnosci: <li class="..."> z linkami do /home.aspx?f=...
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const chunk = m[1];
    const linkM = chunk.match(/href=["'](\/[^"'?#]+)[^"']*["'][^>]*>([^<]{10,200})/i);
    if (!linkM) continue;
    const link = 'https://www.nbp.pl' + linkM[1];
    const title = stripHtml(linkM[2]).trim();
    if (title.length < 10) continue;
    const dateM = chunk.match(/(\d{2}[.\-\/]\d{2}[.\-\/]\d{4})/);
    const pubDate = dateM ? parseDate(dateM[1].split('.').reverse().join('-')) : null;
    items.push({ title, link, description: '', pubDate });
  }
  // Fallback: any internal links with decent title
  if (items.length === 0) {
    const linkRe = /href=["'](https?:\/\/www\.nbp\.pl\/[^"']{10,200})["'][^>]*>([^<]{15,200})/gi;
    while ((m = linkRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
      const title = stripHtml(m[2]).trim();
      if (title.length < 15) continue;
      items.push({ title, link: m[1], description: '', pubDate: null });
    }
  }
  return items;
}

function parseHtmlUokik(html) {
  const items = [];
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articleRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const chunk = m[1];
    const linkM = chunk.match(/href=["'](https:\/\/uokik\.gov\.pl\/[^"']{10,200})["']/i);
    if (!linkM) continue;
    const link = linkM[1];
    // Extract title from anchor or heading
    const titleM =
      chunk.match(/<a[^>]*href=["'][^"']*["'][^>]*>\s*([^<]{15,200})\s*<\/a>/i) ||
      chunk.match(/<h[23][^>]*>([^<]{15,200})<\/h[23]>/i);
    const title = titleM ? stripHtml(titleM[1]).trim() : '';
    if (title.length < 15 || title.toLowerCase().includes('aktualności')) continue;
    items.push({ title, link, description: '', pubDate: null });
  }
  return items;
}

function parseHtmlFundusze(html) {
  // JS SPA - próbujemy znaleźć linki do artykułów
  const items = [];
  const linkRe = /href=["'](\/strony\/aktualnosci\/[^"']{5,200})["'][^>]*>([^<]{10,200})/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const link = 'https://www.funduszeeuropejskie.gov.pl' + m[1];
    const title = stripHtml(m[2]).trim();
    if (title.length < 10) continue;
    items.push({ title, link, description: '', pubDate: null });
  }
  return items;
}

function parseHtmlEzdrowie(html) {
  const items = [];
  // e-Zdrowie: class="articleListBigBoxTitle" z linkiem
  const boxRe = /class="articleListBigBoxContent"[^>]*>([\s\S]*?)class="articleListBigBoxActual"/gi;
  let m;
  while ((m = boxRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const chunk = m[1];
    const linkM = chunk.match(/href=["'](\/portal\/home\/[^"']{5,200})["']/i);
    const titleM = chunk.match(/class="articleListBigBoxTitle"[^>]*>([^<]{10,200})/i);
    if (!linkM || !titleM) continue;
    items.push({
      title: stripHtml(titleM[1]).trim(),
      link: 'https://ezdrowie.gov.pl' + linkM[1],
      description: '',
      pubDate: null,
    });
  }
  return items;
}

function parseHtmlArimr(html) {
  const items = [];
  // ARiMR: szukamy linków do aktualności
  const linkRe = /href=["'](https?:\/\/www\.arimr\.gov\.pl\/aktualnosci[^"']{5,200})["'][^>]*>([^<]{15,200})/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const title = stripHtml(m[2]).trim();
    if (title.length < 15) continue;
    items.push({ title, link: m[1], description: '', pubDate: null });
  }
  return items;
}

const PARSERS = {
  rss: parseRss,
  'html-nbp': parseHtmlNbp,
  'html-uokik': parseHtmlUokik,
  'html-fundusze': parseHtmlFundusze,
  'html-ezdrowie': parseHtmlEzdrowie,
  'html-arimr': parseHtmlArimr,
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function processFeed(feed) {
  console.log(`\n[${feed.id}] Pobieranie: ${feed.url}`);
  let html = await fetchWithTimeout(feed.url);
  let source = 'direct';

  // Fallback do Firecrawl jeśli direct fetch nie zadziałał lub dostaliśmy bot-check
  if (looksBlockedOrEmpty(html)) {
    if (FIRECRAWL_API_KEY) {
      console.log(`[${feed.id}] Direct fetch zablokowany/pusty — próbuję Firecrawl...`);
      html = await fetchWithFirecrawl(feed.url);
      source = 'firecrawl';
      if (looksBlockedOrEmpty(html)) {
        console.log(`[${feed.id}] Firecrawl też nie pomógł - pomijam`);
        return { id: feed.id, count: 0, status: 'blocked' };
      }
    } else {
      console.log(`[${feed.id}] Bot-check lub pusta odpowiedź - pomijam (brak FIRECRAWL_API_KEY)`);
      return { id: feed.id, count: 0, status: 'blocked' };
    }
  }

  const isXml = html.trimStart().startsWith('<?xml') || html.includes('<rss') || html.includes('<feed');
  const parser = isXml ? PARSERS.rss : PARSERS[feed.parser];

  if (!parser) {
    console.log(`[${feed.id}] Brak parsera dla: ${feed.parser}`);
    return { id: feed.id, count: 0, status: 'no-parser' };
  }

  const rawItems = parser(html, feed);
  console.log(`[${feed.id}] Sparsowano ${rawItems.length} artykułów (${source})`);

  if (rawItems.length === 0) {
    return { id: feed.id, count: 0, status: 'empty' };
  }

  // Mapuj na format DB
  const rows = rawItems.map(item => ({
    id: simpleHash(item.link + feed.id),
    source_id: feed.id,
    source_name: feed.name,
    title: item.title.slice(0, 500),
    link: item.link.slice(0, 1000),
    description: (item.description || '').slice(0, 500),
    pub_date: item.pubDate || null,
    audiences: feed.audiences,
    fetched_at: new Date().toISOString(),
  }));

  // Upsert - nie nadpisuj jeśli artykuł już istnieje (zachowaj oryginalną datę)
  const { error } = await supabase
    .from('rss_cache')
    .upsert(rows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error(`[${feed.id}] Błąd Supabase:`, error.message);
    return { id: feed.id, count: 0, status: 'db-error' };
  }

  console.log(`[${feed.id}] Zapisano ${rows.length} wpisów`);
  return { id: feed.id, count: rows.length, status: 'ok' };
}

async function cleanup() {
  // Usuń wpisy starsze niż 30 dni
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await supabase
    .from('rss_cache')
    .delete({ count: 'exact' })
    .lt('fetched_at', cutoff);
  if (!error) console.log(`\nCleanup: usunięto ${count ?? 0} starych wpisów`);
}

async function main() {
  console.log('=== RSS Cache Fetch ===');
  console.log(`Czas: ${new Date().toISOString()}`);
  console.log(`Źródła: ${FEEDS.map(f => f.id).join(', ')}\n`);

  const results = [];
  for (const feed of FEEDS) {
    const result = await processFeed(feed);
    results.push(result);
    // Pauza 2s między requestami żeby nie wygląda jak bot
    await new Promise(r => setTimeout(r, 2000));
  }

  await cleanup();

  console.log('\n=== Podsumowanie ===');
  for (const r of results) {
    const icon = r.status === 'ok' ? '✓' : r.status === 'blocked' ? '✗' : '~';
    console.log(`${icon} ${r.id}: ${r.status} (${r.count} artykułów)`);
  }

  const failed = results.filter(r => r.status !== 'ok');
  if (failed.length > 0) {
    console.log(`\nNiedostępne: ${failed.map(f => f.id).join(', ')}`);
    // Nie failuj buildu - po prostu loguj
  }
  console.log('\nGotowe.');
}

main().catch(e => {
  console.error('Krytyczny błąd:', e);
  process.exit(1);
});
