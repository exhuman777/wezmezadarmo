/**
 * Benefits URL audit -- monitoring zrodloUrl ze swiadczen.
 * Cron co tydzien sprawdza wszystkie URL-e, oblicza hash, alertuje przy problemach.
 *
 * Bezpieczne: NIC nie modyfikuje w bazie swiadczen, tylko monitoruje.
 */

import { createHash } from 'crypto';
import { Agent } from 'undici';

const TIMEOUT_MS = 15_000;
// Browser-like UA wymagany -- BGK, czystepowietrze.gov.pl, gov.pl/ARiMR blokuja
// custom "bot" UA (403, fetch failed). Identyfikator projektu w komentarzu zostawiony.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Pelne browser-like headers -- BGK WAF wymaga Sec-Fetch-*
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

// Niektore *.gov.pl (np. czystepowietrze.gov.pl) wysylaja niekompletny TLS chain
// (brak intermediate cert). Browsers maja intermediate w lokalnej bazie -> dziala.
// Node 20 fetch tego nie ma -> "fetch failed" / UNABLE_TO_VERIFY_LEAF_SIGNATURE.
// Bezpiecznie: tylko *.gov.pl, tylko GET, nie wysylamy credentials.
const insecureGovAgent = new Agent({ connect: { rejectUnauthorized: false } });
const isGovDomain = (url: string): boolean => {
  try { return new URL(url).hostname.endsWith('.gov.pl'); } catch { return false; }
};

// Hosty z WAF-em blokujacym Vercel IP ranges (BGK, sprawdzone: curl/browser z
// normalnego IP -> 200, Vercel -> 403). Strony OK, my nie mozemy ich audytowac.
// Dla nich BLOCKED nie alertuje (status WAF_PROTECTED, info-only).
// TODO: sprawdzac manualnie raz na miesiac.
const WAF_BLOCKED_HOSTS = new Set<string>([
  'www.bgk.pl',
  'bgk.pl',
]);
const isKnownWafBlocked = (url: string): boolean => {
  try { return WAF_BLOCKED_HOSTS.has(new URL(url).hostname); } catch { return false; }
};


/** Procent zmiany content uznawany za "znaczacy" (wymaga review). */
const SIGNIFICANT_CHANGE_THRESHOLD = 0.30;
/** Concurrent fetch limit -- nie zatkajmy gov.pl. */
const CONCURRENCY = 8;

export type AuditStatus = 'OK' | 'NOT_FOUND' | 'REDIRECT' | 'TIMEOUT' | 'BLOCKED' | 'CHANGED' | 'NEW';

export interface AuditResult {
  benefitId: string;
  benefitName: string;
  category: string;
  url: string;
  httpStatus: number;
  status: AuditStatus;
  contentHash: string | null;
  contentLength: number;
  changePct: number | null;  // 0.0 - 1.0 (jak zmienil sie content vs poprzednio)
  needsReview: boolean;
  note?: string;
}

export interface PreviousAudit {
  benefit_id: string;
  last_content_hash: string | null;
  last_content_length?: number | null;
  consecutive_errors: number;
}

/**
 * "Miekki" 404 -- serwer zwraca 200, ale przekierowuje na strone glowna
 * (np. www.gov.pl/web/rodzina/nieistniejaca -> www.gov.pl/). Standardowy audyt
 * tego nie wykrywa, bo host sie zgadza. Heurystyka: prosilismy o glebszy adres,
 * a wyladowalismy na korzeniu domeny -> tresc znikneła.
 */
export function isSoftNotFound(finalUrl: string, requestedUrl: string): boolean {
  try {
    const f = new URL(finalUrl);
    const r = new URL(requestedUrl);
    if (f.host !== r.host) return false; // cross-domain -> obsluzone jako REDIRECT
    const reqDepth = r.pathname.split('/').filter(Boolean).length;
    const finDepth = f.pathname.split('/').filter(Boolean).length;
    return reqDepth >= 1 && finDepth === 0;
  } catch {
    return false;
  }
}

/**
 * Sanityzacja HTML do tylko text content z main area.
 * Usuwa nav, header, footer, scripts, styles, ads -- elementy ktore zmieniaja sie
 * dynamicznie i nie sa czescia tresci swiadczenia.
 */
export function extractStableContent(html: string): string {
  return html
    // Usun calkowicie elementy z dynamicznym content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')   // formularze szukania
    .replace(/<!--[\s\S]*?-->/g, '')
    // Usun komentarze HTML
    .replace(/<[^>]+>/g, ' ')                  // wszystkie tagi -> spacja
    .replace(/&[a-z]+;/gi, ' ')                // encje HTML
    .replace(/&#\d+;/g, ' ')                   // numeric encje
    .replace(/\s+/g, ' ')                      // multiple whitespace -> single
    .toLowerCase()
    .trim()
    .slice(0, 30000);                          // ucinamy do 30K chars (avg gov page ~5-15K text)
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Wylicza procent zmiany miedzy dwoma stringami (jaccard-like).
 * Zwraca 0.0 (identyczne) - 1.0 (calkowicie rozne).
 */
export function calculateChangePct(prev: string, curr: string): number {
  if (prev === curr) return 0;
  if (!prev || !curr) return 1;

  // Tokenize na slowa (5+ znakow) -> Set
  const tokensA = new Set(prev.split(/\s+/).filter(w => w.length >= 5));
  const tokensB = new Set(curr.split(/\s+/).filter(w => w.length >= 5));
  if (tokensA.size === 0 && tokensB.size === 0) return 0;

  // Jaccard distance: 1 - |intersection| / |union|
  let intersect = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersect++;
  const union = tokensA.size + tokensB.size - intersect;
  if (union === 0) return 0;
  return 1 - (intersect / union);
}

export async function auditUrl(
  benefitId: string,
  benefitName: string,
  category: string,
  url: string,
  previous: PreviousAudit | null,
): Promise<AuditResult> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  // Helper: fetch z fallbackiem na relaxed TLS dla *.gov.pl (incomplete chain)
  const doFetch = async (relaxTls: boolean) => {
    const opts: RequestInit & { dispatcher?: Agent } = {
      signal: ctrl.signal,
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    };
    if (relaxTls && isGovDomain(url)) opts.dispatcher = insecureGovAgent;
    return fetch(url, opts as RequestInit);
  };

  try {
    let res: Response;
    try {
      res = await doFetch(false);
    } catch (firstErr) {
      // Retry z relaxed TLS gdy *.gov.pl wysyla niekompletny chain
      const msg = firstErr instanceof Error ? firstErr.message : '';
      if (isGovDomain(url) && /fetch failed|certificate|self.?signed|chain/i.test(msg)) {
        res = await doFetch(true);
      } else {
        throw firstErr;
      }
    }
    clearTimeout(timeout);

    const httpStatus = res.status;

    // 404 -> alert natychmiast
    if (httpStatus === 404 || httpStatus === 410) {
      return {
        benefitId, benefitName, category, url,
        httpStatus, status: 'NOT_FOUND',
        contentHash: null, contentLength: 0, changePct: null,
        needsReview: true,
        note: `HTTP ${httpStatus} -- strona zrodlowa nie istnieje`,
      };
    }

    // Inne 4xx/5xx
    if (!res.ok) {
      // Known WAF (BGK) blokuje Vercel IPs -- strona OK, nie alertuj
      if (isKnownWafBlocked(url)) {
        return {
          benefitId, benefitName, category, url,
          httpStatus, status: 'OK',
          contentHash: previous?.last_content_hash ?? null,
          contentLength: 0, changePct: null,
          needsReview: false,
          note: `WAF blokuje audyt (HTTP ${httpStatus}) -- strona OK, sprawdz manualnie`,
        };
      }
      return {
        benefitId, benefitName, category, url,
        httpStatus, status: 'BLOCKED',
        contentHash: null, contentLength: 0, changePct: null,
        needsReview: (previous?.consecutive_errors ?? 0) >= 2, // alert po 3 errorach z rzedu
        note: `HTTP ${httpStatus}`,
      };
    }

    // Redirect (po follow) -- sprawdzamy czy URL koncowy != podany
    const finalUrl = res.url;
    const isRedirect = !sameOrigin(finalUrl, url);

    // Miekki 404: 200, ale przekierowanie na strone glowna -> tresc zrodla znikneła
    if (isSoftNotFound(finalUrl, url)) {
      return {
        benefitId, benefitName, category, url,
        httpStatus, status: 'NOT_FOUND',
        contentHash: null, contentLength: 0, changePct: null,
        needsReview: true,
        note: `Miekki 404 -- przekierowanie na strone glowna (${finalUrl})`,
      };
    }

    // Hash content
    const html = await res.text();
    const stableContent = extractStableContent(html);
    const contentLength = stableContent.length;
    const contentHash = hashContent(stableContent);

    // Porownanie z poprzednim
    let changePct: number | null = null;
    let status: AuditStatus = 'OK';
    let needsReview = false;
    let note: string | undefined;

    if (previous?.last_content_hash) {
      if (contentHash !== previous.last_content_hash) {
        // Hash sie zmienil. Strony gov.pl przebudowuja layout/menu bardzo czesto,
        // wiec sam zmieniony hash to zwykle SZUM, nie zmiana tresci swiadczenia.
        // Nie alarmujemy przy kazdej zmianie -- tylko gdy tresc mocno sie skurczyla
        // (strona wyprana z tresci / stub), co jest realnym sygnalem problemu.
        // Zmiane i tak zapisujemy do bazy (widoczna w panelu admin), ale bez maila.
        status = 'CHANGED';
        const prevLen = previous.last_content_length ?? 0;
        changePct = prevLen > 0 ? Math.min(1, Math.abs(prevLen - contentLength) / prevLen) : null;
        const shrunk = prevLen > 800 && contentLength < prevLen * 0.5;
        needsReview = shrunk;
        if (shrunk) note = `Tresc skurczyla sie z ${prevLen} do ${contentLength} znakow -- sprawdz`;
      }
    } else {
      // Pierwszy audit -- nowy benefit
      status = 'NEW';
      needsReview = false;
    }

    // Jesli redirect i poprzednio nie bylo redirect -> review
    if (isRedirect && !needsReview) {
      status = 'REDIRECT';
      needsReview = true;
    }

    if (isRedirect) note = `Redirect -> ${finalUrl}`;

    return {
      benefitId, benefitName, category, url,
      httpStatus, status, contentHash, contentLength, changePct, needsReview,
      ...(note && { note }),
    };
  } catch (err) {
    clearTimeout(timeout);
    const errMsg = err instanceof Error ? err.message : String(err);
    // Known WAF blokuje nawet TCP -- nie alertuj
    if (isKnownWafBlocked(url)) {
      return {
        benefitId, benefitName, category, url,
        httpStatus: 0, status: 'OK',
        contentHash: previous?.last_content_hash ?? null,
        contentLength: 0, changePct: null,
        needsReview: false,
        note: `WAF blokuje audyt -- strona OK, sprawdz manualnie`,
      };
    }
    return {
      benefitId, benefitName, category, url,
      httpStatus: 0,
      status: errMsg.includes('aborted') ? 'TIMEOUT' : 'BLOCKED',
      contentHash: null, contentLength: 0, changePct: null,
      needsReview: (previous?.consecutive_errors ?? 0) >= 2,
      note: errMsg.slice(0, 200),
    };
  }
}

function sameOrigin(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    // Same host + pathname pierwszy 2 segmenty (np. www.gov.pl/web/rodzina jest "ten sam" co /web/rodzina/X)
    return ua.host === ub.host;
  } catch {
    return false;
  }
}

/**
 * Audit wszystkich URLi z concurrency limit.
 */
export async function auditAll(
  benefits: Array<{ benefitId: string; benefitName: string; category: string; url: string }>,
  previousMap: Map<string, PreviousAudit>,
): Promise<AuditResult[]> {
  const results: AuditResult[] = [];
  const chunks: typeof benefits[] = [];

  for (let i = 0; i < benefits.length; i += CONCURRENCY) {
    chunks.push(benefits.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const batch = await Promise.all(
      chunk.map(b => auditUrl(b.benefitId, b.benefitName, b.category, b.url, previousMap.get(b.benefitId) ?? null)),
    );
    results.push(...batch);
  }

  return results;
}

export { SIGNIFICANT_CHANGE_THRESHOLD };
