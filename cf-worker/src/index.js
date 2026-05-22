/**
 * Cloudflare Worker: RSS proxy dla polskich instytucji rządowych
 *
 * Vercel ma zablokowane IP na Incapsula/Imperva (NBP, Sejm).
 * Worker używa IP Cloudflare (AS13335) — inne ASN, większe szanse przejścia.
 * Dla UOKiK (brak RSS): scraper HTML → syntetyczny RSS.
 *
 * Env vars (ustaw via: wrangler secret put RSS_SECRET):
 *   RSS_SECRET  — bearer token, wymagany jeśli ustawiony
 *
 * Endpoint: GET /?id=<feed_id>
 * Auth:     Authorization: Bearer <RSS_SECRET>
 */

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.5',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const FEED_URLS = {
  zus:      'https://www.zus.pl/o-zus/aktualnosci/-/asset_publisher/aktualnosci/rss',
  gus:      'https://stat.gov.pl/rss/pl/5438/8.xml',
  nbp:      'https://www.nbp.pl/home.aspx?f=/aktualnosci/aktualnosci.html',
  uokik:    'https://uokik.gov.pl/aktualnosci',
  fundusze: 'https://www.funduszeeuropejskie.gov.pl/strony/aktualnosci/',
  sejm:     'https://www.sejm.gov.pl/sejm10.nsf/rss.xsp',
  ezdrowie: 'https://ezdrowie.gov.pl/portal/home/aktualnosci?isExtend=true',
  arimr:    'https://www.arimr.gov.pl/aktualnosci-i-komunikaty',
};

// ---------------------------------------------------------------------------
// HTML scrapers dla instytucji bez działającego RSS
// ---------------------------------------------------------------------------

function scrapeUokik(html) {
  const items = [];
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articleRe.exec(html)) !== null) {
    const chunk = m[1];
    const linkM = chunk.match(/href="(https:\/\/uokik\.gov\.pl\/[^"]{10,200})"/);
    if (!linkM) continue;
    const link = linkM[1];
    // Try to extract title from link text or heading
    const titleM = chunk.match(/<a[^>]*href="[^"]*"[^>]*>\s*([^<]{15,200})\s*<\/a>/) ||
                   chunk.match(/<h[23][^>]*>([^<]{15,200})<\/h[23]>/);
    const title = titleM ? titleM[1].trim() : '';
    if (title && !title.startsWith('Komunikaty') && title.length > 15) {
      items.push({ title, link, pubDate: null });
    }
  }
  return items;
}

// NBP - Incapsula blokuje, ale przez CF Worker może przejść
// Scraper aktualności ze strony głównej NBP
function scrapeNbp(html) {
  const items = [];
  const itemRe = /<li[^>]*class="[^"]*aktualnosc[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const chunk = m[1];
    const linkM = chunk.match(/href="(https?:\/\/www\.nbp\.pl\/[^"]{5,200})"/);
    const titleM = chunk.match(/<a[^>]*>([^<]{10,200})<\/a>/) ||
                   chunk.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{10,200})<\/span>/);
    if (linkM && titleM) {
      items.push({ title: titleM[1].trim(), link: linkM[1], pubDate: null });
    }
  }
  // Fallback: general links
  if (items.length === 0) {
    const linkRe = /<a[^>]+href="(https?:\/\/www\.nbp\.pl\/[^"]{10,200})"[^>]*>([^<]{15,150})<\/a>/gi;
    while ((m = linkRe.exec(html)) !== null && items.length < 15) {
      const [, link, title] = m;
      if (!title.includes('NBP') && title.trim().length > 15) {
        items.push({ title: title.trim(), link, pubDate: null });
      }
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// RSS builder
// ---------------------------------------------------------------------------

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRss(channelTitle, channelLink, items) {
  const itemsXml = items.slice(0, 15).map(i => `
  <item>
    <title><![CDATA[${i.title}]]></title>
    <link>${escXml(i.link)}</link>
    <guid isPermaLink="true">${escXml(i.link)}</guid>
    ${i.pubDate ? `<pubDate>${i.pubDate}</pubDate>` : ''}
  </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escXml(channelTitle)}</title>
    <link>${escXml(channelLink)}</link>
    <description>${escXml(channelTitle)}</description>
    ${itemsXml}
  </channel>
</rss>`;
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    // Auth
    if (env.RSS_SECRET) {
      const auth = request.headers.get('Authorization') || '';
      if (auth !== `Bearer ${env.RSS_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const url = new URL(request.url);
    const feedId = url.searchParams.get('id');

    if (!feedId || !FEED_URLS[feedId]) {
      return new Response(
        `Dostępne feedy: ${Object.keys(FEED_URLS).join(', ')}`,
        { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const feedUrl = FEED_URLS[feedId];

    try {
      const res = await fetch(feedUrl, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        cf: { cacheTtl: 1800, cacheEverything: false },
      });

      if (!res.ok) {
        return new Response(`Feed zwrócił ${res.status}`, { status: 502 });
      }

      const text = await res.text();

      // Jeśli dostaliśmy XML/RSS — zwróć bez zmian
      const trimmed = text.trimStart();
      const isXml = trimmed.startsWith('<?xml') || trimmed.startsWith('<rss') || trimmed.startsWith('<feed');
      if (isXml) {
        return new Response(text, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // HTML — uruchom scraper per instytucja
      let items = [];
      const FEED_NAMES = {
        uokik: 'UOKiK - Aktualności',
        nbp: 'NBP - Aktualności',
        fundusze: 'Fundusze Europejskie',
        sejm: 'Sejm RP',
        ezdrowie: 'e-Zdrowie',
        arimr: 'ARiMR',
      };

      if (feedId === 'uokik') items = scrapeUokik(text);
      else if (feedId === 'nbp') items = scrapeNbp(text);
      // Pozostałe JS SPA — brak scrapers na razie

      if (items.length === 0) {
        // Zwróć pusty, prawidłowy RSS — nie błąd
        const emptyRss = buildRss(FEED_NAMES[feedId] || feedId, feedUrl, []);
        return new Response(emptyRss, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const rss = buildRss(FEED_NAMES[feedId] || feedId, feedUrl, items);
      return new Response(rss, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=1800',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (err) {
      return new Response(`Błąd pobierania: ${err.message}`, { status: 502 });
    }
  },
};
