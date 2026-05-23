#!/usr/bin/env node
/**
 * scripts/fetch-rss-cache.mjs
 *
 * Production-grade fetcher RSS dla polskich instytucji.
 * Uruchamiany przez GitHub Actions 2x dziennie (10:00 i 15:00 PL).
 *
 * Strategia per zrodlo:
 *   1. Direct fetch (browser headers, 15s timeout)
 *      - retry 2x z exponential backoff (1s, 3s) na sieciowy fail
 *   2. Jesli direct = bot-check / empty / parser=0:
 *      - Firecrawl render (JS, omija Incapsula/Imperva)
 *   3. Walidacja + dedup + zapis batch do Supabase
 *   4. Logowanie kazdego rezultatu do rss_run_log
 *
 * Concurrency: 3 zrodla rownoleglie (oszczedza czas, max load 3 outbound).
 * Cleanup: stare wpisy (>30 dni) usuwane na koncu.
 *
 * Env:
 *   SUPABASE_URL              - URL projektu
 *   SUPABASE_SERVICE_ROLE_KEY - service_role (bypass RLS)
 *   FIRECRAWL_API_KEY         - klucz Firecrawl (fallback)
 */

import { randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const MAX_ITEMS_PER_FEED = 20;
const FETCH_TIMEOUT_MS = 15_000;
const FIRECRAWL_TIMEOUT_MS = 60_000;
const DIRECT_RETRY_COUNT = 2;
const CONCURRENT_FEEDS = 3;
const RETENTION_DAYS = 30;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!FIRECRAWL_API_KEY) {
  console.warn('WARN: brak FIRECRAWL_API_KEY -- fallback wylaczony');
}

const RUN_ID = randomUUID();
const RUN_STARTED = Date.now();

const SUPABASE_HEADERS = {
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.5',
  'Cache-Control': 'no-cache',
};

// ---------------------------------------------------------------------------
// Feeds registry
// ---------------------------------------------------------------------------

const FEEDS = [
  { id: 'nbp',      name: 'NBP',          url: 'https://www.nbp.pl/home.aspx?f=/aktualnosci/aktualnosci.html', audiences: ['wszyscy', 'firmy'],         parser: 'html-nbp' },
  { id: 'sejm',     name: 'Sejm',         url: 'https://www.sejm.gov.pl/sejm10.nsf/rss.xsp',                   audiences: ['wszyscy', 'jdg', 'firmy'],  parser: 'rss' },
  { id: 'uokik',    name: 'UOKiK',        url: 'https://uokik.gov.pl/aktualnosci',                             audiences: ['wszyscy', 'firmy'],         parser: 'html-uokik' },
  { id: 'fundusze', name: 'Fundusze EU',  url: 'https://www.funduszeeuropejskie.gov.pl/strony/aktualnosci/',   audiences: ['jdg', 'firmy'],             parser: 'html-fundusze' },
  { id: 'ezdrowie', name: 'e-Zdrowie',    url: 'https://ezdrowie.gov.pl/portal/home/aktualnosci?isExtend=true', audiences: ['wszyscy'],                  parser: 'html-ezdrowie' },
  { id: 'arimr',    name: 'ARiMR',        url: 'https://www.arimr.gov.pl/aktualnosci-i-komunikaty',            audiences: ['jdg', 'firmy'],             parser: 'html-arimr' },
];

// ---------------------------------------------------------------------------
// Supabase REST helpers
// ---------------------------------------------------------------------------

async function supabaseUpsert(table, rows, conflictCol = 'id') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictCol}`, {
    method: 'POST',
    headers: { ...SUPABASE_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: { message: `HTTP ${res.status}: ${text.slice(0, 300)}` } };
  }
  return { error: null };
}

async function supabaseInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: { message: `HTTP ${res.status}: ${text.slice(0, 300)}` } };
  }
  return { error: null };
}

async function supabaseDeleteOld(table, column, beforeIso) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${column}=lt.${encodeURIComponent(beforeIso)}`,
    { method: 'DELETE', headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=representation' } }
  );
  if (!res.ok) {
    const text = await res.text();
    return { error: { message: `HTTP ${res.status}: ${text.slice(0, 200)}` }, count: 0 };
  }
  const body = await res.json().catch(() => []);
  return { error: null, count: Array.isArray(body) ? body.length : 0 };
}

async function logRunResult(sourceId, status, source, count, durationMs, errorMessage = null) {
  // Best-effort log -- nie failuj runa jesli logowanie padnie
  try {
    await supabaseInsert('rss_run_log', [{
      run_id: RUN_ID,
      source_id: sourceId,
      status,
      source,
      count,
      duration_ms: durationMs,
      error_message: errorMessage ? errorMessage.slice(0, 1000) : null,
    }]);
  } catch (e) {
    console.warn(`  [log] nie udalo sie zapisac do rss_run_log: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
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

function parseRss(xml) {
  const items = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const chunk = m[1];
    const title = stripHtml(extractText(chunk, 'title'));
    const link = extractText(chunk, 'link') || extractAttrHref(chunk, 'link');
    const description = stripHtml(extractText(chunk, 'description') || extractText(chunk, 'summary')).slice(0, 300);
    const pubDate = parseDate(extractText(chunk, 'pubDate') || extractText(chunk, 'dc:date') || extractText(chunk, 'updated'));
    if (!title || !link) continue;
    items.push({ title, link, description, pubDate });
  }
  if (items.length === 0) {
    const entryRe = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((m = entryRe.exec(xml)) !== null && items.length < MAX_ITEMS_PER_FEED) {
      const chunk = m[1];
      const title = stripHtml(extractText(chunk, 'title'));
      const link = extractAttrHref(chunk, 'link') || extractText(chunk, 'link');
      const description = stripHtml(extractText(chunk, 'summary') || extractText(chunk, 'content')).slice(0, 300);
      const pubDate = parseDate(extractText(chunk, 'published') || extractText(chunk, 'updated'));
      if (!title || !link) continue;
      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

function parseHtmlNbp(html) {
  const items = [];
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
  // Strategia 1: oryginalna struktura articleListBigBoxContent
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
      description: '', pubDate: null,
    });
  }
  // Strategia 2: generyczna ekstrakcja linkow do /portal/home/
  if (items.length === 0) {
    const linkRe = /href=["'](\/portal\/home\/[^"']{10,200})["'][^>]*>([^<]{15,200})/gi;
    while ((m = linkRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
      const title = stripHtml(m[2]).trim();
      if (title.length < 15) continue;
      items.push({
        title, link: 'https://ezdrowie.gov.pl' + m[1],
        description: '', pubDate: null,
      });
    }
  }
  return items;
}

function parseHtmlArimr(html) {
  const items = [];
  // Strategia 1: pelne URL
  const linkRe = /href=["'](https?:\/\/www\.arimr\.gov\.pl\/aktualnosci[^"']{5,200})["'][^>]*>([^<]{15,200})/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
    const title = stripHtml(m[2]).trim();
    if (title.length < 15) continue;
    items.push({ title, link: m[1], description: '', pubDate: null });
  }
  // Strategia 2: relatywne URL
  if (items.length === 0) {
    const relRe = /href=["'](\/aktualnosci[^"']{5,200})["'][^>]*>([^<]{15,200})/gi;
    while ((m = relRe.exec(html)) !== null && items.length < MAX_ITEMS_PER_FEED) {
      const title = stripHtml(m[2]).trim();
      if (title.length < 15) continue;
      items.push({ title, link: 'https://www.arimr.gov.pl' + m[1], description: '', pubDate: null });
    }
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
// Fetchers
// ---------------------------------------------------------------------------

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchDirect(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow', signal: controller.signal });
    if (!res.ok) return { html: null, error: `HTTP ${res.status}` };
    return { html: await res.text(), error: null };
  } catch (e) {
    return { html: null, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDirectWithRetry(url, feedId) {
  let lastError = null;
  for (let attempt = 0; attempt <= DIRECT_RETRY_COUNT; attempt++) {
    if (attempt > 0) {
      const delay = 1000 * Math.pow(3, attempt - 1); // 1s, 3s
      console.log(`  [${feedId}] retry ${attempt}/${DIRECT_RETRY_COUNT} po ${delay}ms`);
      await sleep(delay);
    }
    const { html, error } = await fetchDirect(url);
    if (html) return { html, error: null };
    lastError = error;
  }
  return { html: null, error: lastError };
}

async function fetchFirecrawl(url, feedId) {
  if (!FIRECRAWL_API_KEY) return { html: null, markdown: null, error: 'no api key' };
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
        formats: ['html', 'markdown'],
        onlyMainContent: false,
        waitFor: 5000,
        timeout: 55_000,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      return { html: null, markdown: null, error: `Firecrawl HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = await res.json();
    if (!json.success || !json.data?.html) {
      return { html: null, markdown: null, error: `Firecrawl: ${json.error || 'brak HTML'}` };
    }
    console.log(`  [${feedId}] Firecrawl OK (html=${json.data.html.length}b, md=${(json.data.markdown || '').length}b)`);
    return { html: json.data.html, markdown: json.data.markdown || null, error: null };
  } catch (e) {
    return { html: null, markdown: null, error: `Firecrawl: ${e.message}` };
  } finally {
    clearTimeout(timer);
  }
}

// Per-feed filter: czy link wyglada na artykul-aktualnosc
function isArticleLink(link, feedId) {
  const lc = link.toLowerCase();
  // Skip oczywiste smieci
  if (lc.startsWith('#') || lc.startsWith('javascript:') || lc.startsWith('mailto:')) return false;
  if (lc.endsWith('.pdf') || lc.endsWith('.doc') || lc.endsWith('.docx') || lc.endsWith('.xlsx')) return false;
  if (lc.includes('facebook.com') || lc.includes('twitter.com') || lc.includes('linkedin.com')) return false;
  if (lc.includes('/login') || lc.includes('/rejestracja') || lc.includes('/kontakt')) return false;

  // Generic: link musi miec wiecej niz 1 path segment (oprocz domeny)
  // i nie byc root-em strony
  try {
    const u = new URL(link);
    const pathSegments = u.pathname.split('/').filter(Boolean);
    if (pathSegments.length < 1 || u.pathname === '/' || u.pathname === '') return false;
  } catch { return false; }

  switch (feedId) {
    case 'nbp':
      return lc.includes('nbp.pl') && !lc.endsWith('nbp.pl/') && !lc.endsWith('aktualnosci.html')
        && (lc.includes('aktualnosci') || lc.includes('komunikat') || lc.match(/\/20\d{2}\//) !== null);
    case 'sejm':
      return lc.includes('sejm.gov.pl')
        && (lc.includes('news') || lc.includes('aktualnosci') || lc.includes('komunikat') || lc.includes('/sejm10.nsf/'));
    case 'fundusze':
      // Wszystko na funduszeeuropejskie.gov.pl - artykuly maja dluga sciezke
      return lc.includes('funduszeeuropejskie.gov.pl')
        && !lc.endsWith('/aktualnosci/')
        && !lc.endsWith('funduszeeuropejskie.gov.pl/')
        && link.length > 50;
    case 'arimr':
      // ARiMR - wszystko na ich domenie, dluga sciezka
      return lc.includes('arimr.gov.pl') && !lc.endsWith('arimr.gov.pl/') && link.length > 40;
    case 'ezdrowie':
      return lc.includes('ezdrowie.gov.pl/portal/') && !lc.endsWith('/aktualnosci');
    case 'uokik':
      return lc.includes('uokik.gov.pl') && lc.length > 30;
    default:
      return true;
  }
}

// Ekstrakcja linkow z markdown -- bardziej niezawodna niz regex HTML
// Firecrawl renderuje JS i zwraca clean markdown z linkami [tytul](url)
function parseMarkdownLinks(markdown, feed) {
  if (!markdown) return [];
  const items = [];
  const seen = new Set();
  const baseUrl = new URL(feed.url);

  // Markdown link: [tekst](url) lub [tekst](url "title")
  const linkRe = /\[([^\]]{8,300})\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = linkRe.exec(markdown)) !== null && items.length < MAX_ITEMS_PER_FEED * 3) {
    const title = stripHtml(m[1]).trim().replace(/\\\n/g, ' ').replace(/\s+/g, ' ');
    let link = m[2].trim();

    if (title.length < 15) continue;

    // Skip image-only labels
    if (m[1].startsWith('!')) continue;

    // Resolve relative URLs
    if (link.startsWith('/')) link = baseUrl.origin + link;
    else if (!link.startsWith('http')) continue;

    // Strip URL fragment
    const hashIdx = link.indexOf('#');
    if (hashIdx >= 0) link = link.slice(0, hashIdx);

    if (!isArticleLink(link, feed.id)) continue;
    if (seen.has(link)) continue;
    seen.add(link);

    items.push({ title, link, description: '', pubDate: null });
  }
  return items.slice(0, MAX_ITEMS_PER_FEED);
}

function looksBlockedOrEmpty(html) {
  if (!html || html.length < 500) return true;
  const blockers = ['Incapsula', 'Please Wait', 'CWUDNSAI', 'Access Denied', 'cf-error-details', 'Just a moment', 'Bot Detection'];
  return blockers.some(b => html.includes(b));
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateAndDedup(items, feedId) {
  const seen = new Set();
  const valid = [];
  for (const item of items) {
    if (!item.title || item.title.length < 10) continue;
    if (!item.link || !/^https?:\/\//.test(item.link)) continue;
    if (item.link.length > 1000) continue;
    const key = simpleHash(item.link + feedId);
    if (seen.has(key)) continue;
    seen.add(key);
    valid.push({ ...item, id: key });
  }
  return valid;
}

// ---------------------------------------------------------------------------
// Per-feed pipeline
// ---------------------------------------------------------------------------

async function processFeed(feed) {
  const started = Date.now();
  const logPrefix = `[${feed.id}]`;
  console.log(`\n${logPrefix} START ${feed.url}`);

  // 1. Direct fetch z retry
  let { html, error: directError } = await fetchDirectWithRetry(feed.url, feed.id);
  let source = 'direct';
  let firecrawlMarkdown = null;

  // 2. Fallback do Firecrawl jesli bot-check / empty
  if (looksBlockedOrEmpty(html)) {
    console.log(`${logPrefix} direct=${directError || 'blocked/empty'} -> Firecrawl`);
    const fc = await fetchFirecrawl(feed.url, feed.id);
    if (fc.html && !looksBlockedOrEmpty(fc.html)) {
      html = fc.html;
      firecrawlMarkdown = fc.markdown;
      source = 'firecrawl';
    } else {
      const duration = Date.now() - started;
      const err = fc.error || directError || 'blocked';
      console.log(`${logPrefix} BLOCKED (${duration}ms): ${err}`);
      await logRunResult(feed.id, 'blocked', source, 0, duration, err);
      return { id: feed.id, count: 0, status: 'blocked', source, durationMs: duration };
    }
  }

  // 3. Parse HTML
  const isXml = html.trimStart().startsWith('<?xml') || html.includes('<rss') || html.includes('<feed');
  const parser = isXml ? PARSERS.rss : PARSERS[feed.parser];
  if (!parser) {
    const duration = Date.now() - started;
    await logRunResult(feed.id, 'no-parser', source, 0, duration, `brak parsera dla ${feed.parser}`);
    return { id: feed.id, count: 0, status: 'no-parser', source, durationMs: duration };
  }

  let rawItems = parser(html, feed);
  console.log(`${logPrefix} parsed=${rawItems.length} (${source}, html)`);

  // 4. Jesli HTML parser zwrocil 0, sprobuj markdown extraction (z istniejacego firecrawl call lub nowego)
  if (rawItems.length === 0) {
    // Jesli juz mamy markdown z Firecrawl (source=firecrawl), uzyj go
    if (firecrawlMarkdown) {
      const mdItems = parseMarkdownLinks(firecrawlMarkdown, feed);
      console.log(`${logPrefix} markdown extraction: ${mdItems.length}`);
      if (mdItems.length > 0) rawItems = mdItems;
    }
    // Jesli source=direct (jeszcze nie wolalismy Firecrawl), wez go teraz z markdown
    else if (source === 'direct' && FIRECRAWL_API_KEY) {
      console.log(`${logPrefix} parser=0 -> Firecrawl (JS render + markdown)`);
      const fc = await fetchFirecrawl(feed.url, feed.id);
      if (fc.html && !looksBlockedOrEmpty(fc.html)) {
        const renderedHtml = parser(fc.html, feed);
        const renderedMd = parseMarkdownLinks(fc.markdown, feed);
        console.log(`${logPrefix} po Firecrawl: html=${renderedHtml.length}, md=${renderedMd.length}`);
        if (renderedHtml.length > 0) {
          rawItems = renderedHtml;
          source = 'firecrawl';
        } else if (renderedMd.length > 0) {
          rawItems = renderedMd;
          source = 'firecrawl-md';
        }
      }
    }
  }

  if (rawItems.length === 0) {
    const duration = Date.now() - started;
    console.log(`${logPrefix} EMPTY (${duration}ms)`);
    await logRunResult(feed.id, 'empty', source, 0, duration, 'parser found 0 items');
    return { id: feed.id, count: 0, status: 'empty', source, durationMs: duration };
  }

  // 5. Walidacja + dedup
  const validated = validateAndDedup(rawItems, feed.id);
  if (validated.length === 0) {
    const duration = Date.now() - started;
    await logRunResult(feed.id, 'empty', source, 0, duration, 'all items failed validation');
    return { id: feed.id, count: 0, status: 'empty', source, durationMs: duration };
  }

  // 6. Zapis batch do Supabase
  const rows = validated.map(item => ({
    id: item.id,
    source_id: feed.id,
    source_name: feed.name,
    title: item.title.slice(0, 500),
    link: item.link.slice(0, 1000),
    description: (item.description || '').slice(0, 500),
    pub_date: item.pubDate || null,
    audiences: feed.audiences,
    fetched_at: new Date().toISOString(),
  }));

  const { error } = await supabaseUpsert('rss_cache', rows);
  const duration = Date.now() - started;

  if (error) {
    console.error(`${logPrefix} DB-ERROR (${duration}ms): ${error.message}`);
    await logRunResult(feed.id, 'db-error', source, 0, duration, error.message);
    return { id: feed.id, count: 0, status: 'db-error', source, durationMs: duration };
  }

  console.log(`${logPrefix} OK (${duration}ms): ${rows.length} wpisow (${source})`);
  await logRunResult(feed.id, 'ok', source, rows.length, duration);
  return { id: feed.id, count: rows.length, status: 'ok', source, durationMs: duration };
}

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

async function runConcurrent(feeds, limit) {
  const results = [];
  const queue = [...feeds];
  const workers = Array(Math.min(limit, queue.length)).fill(null).map(async () => {
    while (queue.length > 0) {
      const feed = queue.shift();
      if (!feed) break;
      try {
        results.push(await processFeed(feed));
      } catch (e) {
        console.error(`[${feed.id}] CRASH: ${e.message}`);
        results.push({ id: feed.id, count: 0, status: 'crash', source: null, durationMs: 0 });
        await logRunResult(feed.id, 'crash', null, 0, 0, e.message);
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

async function cleanupRssCache() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await supabaseDeleteOld('rss_cache', 'fetched_at', cutoff);
  if (error) console.warn(`Cleanup rss_cache error: ${error.message}`);
  else console.log(`Cleanup rss_cache: usunieto ${count} starych wpisow (>${RETENTION_DAYS}d)`);
}

async function cleanupRunLog() {
  // Trzymaj 90 dni logow
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await supabaseDeleteOld('rss_run_log', 'created_at', cutoff);
  if (error) console.warn(`Cleanup rss_run_log error: ${error.message}`);
  else console.log(`Cleanup rss_run_log: usunieto ${count} starych logow (>90d)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== RSS Cache Fetch ===');
  console.log(`Run ID:    ${RUN_ID}`);
  console.log(`Czas:      ${new Date().toISOString()}`);
  console.log(`Zrodla:    ${FEEDS.map(f => f.id).join(', ')}`);
  console.log(`Firecrawl: ${FIRECRAWL_API_KEY ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Concurrency: ${CONCURRENT_FEEDS}`);

  const results = await runConcurrent(FEEDS, CONCURRENT_FEEDS);
  await cleanupRssCache();
  await cleanupRunLog();

  const totalDuration = Date.now() - RUN_STARTED;
  const okCount = results.filter(r => r.status === 'ok').length;
  const totalItems = results.reduce((s, r) => s + r.count, 0);

  console.log('\n=== Podsumowanie ===');
  for (const r of results) {
    const icon = r.status === 'ok' ? 'OK ' : r.status === 'blocked' ? 'XX ' : '-- ';
    const src = r.source ? `(${r.source})` : '';
    console.log(`${icon} ${r.id.padEnd(10)} ${r.status.padEnd(10)} ${String(r.count).padStart(3)} items ${src.padEnd(12)} ${r.durationMs}ms`);
  }
  console.log(`\nTotal: ${okCount}/${FEEDS.length} OK, ${totalItems} items, ${totalDuration}ms`);

  // Nie failuj jesli czesc padla -- tylko jesli ZADNE
  if (okCount === 0) {
    console.error('FATAL: zadne zrodlo nie zwrocilo danych');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('CRASH:', e);
  process.exit(1);
});
