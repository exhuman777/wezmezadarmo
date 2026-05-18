import type { FeedItem } from '@/app/aktualnosci/rss';
import type { MatchResult } from '@/engine/types';

export interface DigestPayload {
  to: string;
  hasContent: boolean;
  rssItems: FeedItem[];
  benefits: MatchResult[];
  companyName?: string;
  date: string;
}

/**
 * Filtruje FeedItem do tych opublikowanych w ciągu ostatnich 24h od `now`.
 * Artykuły bez pubDate są pomijane.
 */
export function filterRecentItems(items: FeedItem[], now: Date = new Date()): FeedItem[] {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return items.filter(item => {
    if (!item.pubDate) return false;
    const d = new Date(item.pubDate);
    return !isNaN(d.getTime()) && d >= cutoff;
  });
}

/**
 * Buduje payload digestu dla osoby prywatnej.
 * benefits: wynik matchBenefits() przefiltrowany do PRZYSLUGUJE + MOZLIWE, max 5.
 * rssItems: już przefiltrowane przez filterRecentItems(), max 8.
 */
export function buildPrivateDigestPayload(
  email: string,
  rssItems: FeedItem[],
  benefits: MatchResult[],
): DigestPayload {
  const topBenefits = benefits
    .filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE')
    .slice(0, 5);
  const topRss = rssItems.slice(0, 8);

  return {
    to: email,
    hasContent: topRss.length > 0 || topBenefits.length > 0,
    rssItems: topRss,
    benefits: topBenefits,
    date: new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

/**
 * Buduje payload digestu dla JDG.
 * Brak sekcji świadczeń -- tylko RSS przefiltrowane do audytorium jdg/wszyscy.
 */
export function buildJdgDigestPayload(
  email: string,
  companyName: string,
  rssItems: FeedItem[],
): DigestPayload {
  const topRss = rssItems
    .filter(item =>
      item.audiences.includes('wszyscy') || item.audiences.includes('jdg')
    )
    .slice(0, 8);

  return {
    to: email,
    hasContent: topRss.length > 0,
    rssItems: topRss,
    benefits: [],
    companyName,
    date: new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
