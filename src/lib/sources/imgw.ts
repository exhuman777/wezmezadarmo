/**
 * IMGW - oficjalne ostrzeżenia meteorologiczne i hydrologiczne.
 * Źródło: danepubliczne.imgw.pl (oficjalne API IMGW-PIB).
 * Use case: alerty pogodowe dla rolników KRUS, alergików, prac polowych.
 *
 * Uwaga historyczna: wcześniej korzystaliśmy z rcb.gov.pl/feed (RSS), ale RCB
 * wycofało ten kanał (adres przestał odpowiadać). API IMGW jest stabilne i
 * autorytatywne. Gdy brak aktywnych ostrzeżeń, IMGW zwraca obiekt zamiast tablicy
 * -- traktujemy to jako "brak ostrzeżeń" (pusta lista), nie jako błąd.
 */

const IMGW_METEO = 'https://danepubliczne.imgw.pl/api/data/warningsmeteo';
const IMGW_HYDRO = 'https://danepubliczne.imgw.pl/api/data/warningshydro';

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

interface ImgwWarning {
  zdarzenie?: string;
  nazwa_zdarzenia?: string;
  'stopień'?: string;
  stopien?: string;
  opublikowano?: string;
  data_od?: string;
  przebieg?: string;
  tresc?: string;
  komentarz?: string;
  numer?: string;
}

function mapImgwWarning(w: ImgwWarning): RcbWarning {
  const zdarzenie = w.zdarzenie ?? w.nazwa_zdarzenia ?? 'Ostrzeżenie';
  const stopien = w['stopień'] ?? w.stopien;
  const hasDegree = !!stopien && stopien !== '-1' && stopien !== '0';
  const desc = (w.przebieg ?? w.tresc ?? w.komentarz ?? '').trim();
  return {
    title: hasDegree ? `${zdarzenie} (stopień ${stopien})` : zdarzenie,
    link: 'https://danepubliczne.imgw.pl/',
    pubDate: w.opublikowano ?? w.data_od ?? null,
    description: desc.length > 400 ? `${desc.slice(0, 400)}...` : desc,
  };
}

async function fetchImgwWarnings(url: string): Promise<RcbWarning[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 },
    });
    if (!res.ok) return []; // 404 = brak aktywnych ostrzeżeń
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return []; // {status:false} = brak ostrzeżeń
    return (data as ImgwWarning[]).map(mapImgwWarning);
  } catch {
    return [];
  }
}

export async function fetchWarnings(): Promise<RcbWarning[]> {
  const [meteo, hydro] = await Promise.all([
    fetchImgwWarnings(IMGW_METEO),
    fetchImgwWarnings(IMGW_HYDRO),
  ]);
  // IMGW potrafi zwrócić dziesiątki niemal identycznych ostrzeżeń (np. susza dla
  // wielu zlewni). Meteo pokazujemy zawsze, hydro deduplikujemy po tytule i tniemy,
  // żeby lista była czytelna dla zwykłego użytkownika.
  const seen = new Set<string>();
  const dedupedHydro: RcbWarning[] = [];
  for (const w of hydro) {
    if (seen.has(w.title)) continue;
    seen.add(w.title);
    dedupedHydro.push(w);
  }
  return [...meteo, ...dedupedHydro].slice(0, 20);
}
