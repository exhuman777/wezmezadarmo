/**
 * IMGW / RCB (Rządowe Centrum Bezpieczeństwa) - oficjalne ostrzeżenia meteo i kryzysowe.
 * Źródło: rcb.gov.pl/feed (RSS 2.0, XML).
 * Use case: alerty pogodowe dla rolników KRUS, alergików, prac polowych.
 */

const RCB_FEED = 'https://rcb.gov.pl/feed/';

export interface RcbWarning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export function parseRcbRss(xml: string): RcbWarning[] {
  const out: RcbWarning[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    out.push({
      title: extractTag(block, 'title') ?? '',
      link: extractTag(block, 'link') ?? '',
      pubDate: extractTag(block, 'pubDate'),
      description: extractTag(block, 'description') ?? '',
    });
  }
  return out;
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return null;
  return stripCdata(m[1]).replace(/<[^>]+>/g, '').trim();
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

export async function fetchWarnings(): Promise<RcbWarning[]> {
  const res = await fetch(RCB_FEED, {
    headers: { Accept: 'application/rss+xml,text/xml,*/*', 'User-Agent': 'wezmezadarmo/1.0' },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`RCB feed error: ${res.status}`);
  const xml = await res.text();
  return parseRcbRss(xml);
}
