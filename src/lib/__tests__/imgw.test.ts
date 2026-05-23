import { describe, it, expect } from 'vitest';
import { parseRcbRss } from '@/lib/sources/imgw';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>RCB</title>
<item>
<title>Ostrzeżenie: silne opady deszczu - mazowieckie, łódzkie</title>
<link>https://rcb.gov.pl/alert-deszcz</link>
<pubDate>Sat, 23 May 2026 12:00:00 +0000</pubDate>
<description>IMGW prognozuje opady do 50mm.</description>
</item>
<item>
<title>Burze z gradem - małopolska</title>
<link>https://rcb.gov.pl/burze</link>
<pubDate>Sat, 23 May 2026 10:00:00 +0000</pubDate>
<description>Burze z opadami gradu.</description>
</item>
</channel></rss>`;

describe('parseRcbRss', () => {
  it('parses items with title, link, pubDate, description', () => {
    const items = parseRcbRss(SAMPLE_RSS);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Ostrzeżenie: silne opady deszczu - mazowieckie, łódzkie');
    expect(items[0].link).toBe('https://rcb.gov.pl/alert-deszcz');
    expect(items[0].pubDate).toBe('Sat, 23 May 2026 12:00:00 +0000');
    expect(items[0].description).toContain('50mm');
  });

  it('returns empty array when no items', () => {
    expect(parseRcbRss('<rss><channel></channel></rss>')).toEqual([]);
  });

  it('handles CDATA in description', () => {
    const rss = `<rss><channel><item><title>T</title><link>L</link><pubDate>D</pubDate><description><![CDATA[Tekst z <b>HTML</b>]]></description></item></channel></rss>`;
    expect(parseRcbRss(rss)[0].description).toContain('Tekst z');
  });
});
