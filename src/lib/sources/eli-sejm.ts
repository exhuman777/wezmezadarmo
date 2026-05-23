/**
 * ELI (European Legislation Identifier) - api.sejm.gov.pl
 * Tracker zmian w polskim prawie: ustawy, rozporządzenia, obwieszczenia.
 * Public, no auth.
 */

const BASE = 'https://api.sejm.gov.pl/eli';

export interface EliAct {
  eli: string;          // ELI identifier np. DU/2026/100
  title: string;
  publisher: string;    // wydawca: Sejm, Min. X, RM
  type: string;         // Ustawa | Rozporządzenie | Obwieszczenie
  announcedAt: string;  // ISO date
  eliUrl: string;       // link do strony ELI z aktem
}

interface RawAct {
  ELI?: string;
  title?: string;
  publisher?: string;
  type?: string;
  announcementDate?: string;
  promulgation?: string;
}

const KEYWORD_DEFAULT = ['świadczenie', 'zasiłek', 'ulga', 'dodatek', 'emerytura', 'becikowe', 'KRUS', 'ZUS', 'refundacja', '800+'];

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function filterByKeywords(acts: EliAct[], keywords: string[]): EliAct[] {
  if (keywords.length === 0) return acts;
  const norms = keywords.map(normalize);
  return acts.filter(a => {
    const hay = normalize(a.title);
    return norms.some(k => hay.includes(k));
  });
}

export async function fetchRecentChanges(opts?: { keywords?: string[]; limit?: number }): Promise<EliAct[]> {
  const limit = opts?.limit ?? 50;
  const res = await fetch(`${BASE}/acts/DU/2026?limit=${limit}&offset=0`, {
    headers: { Accept: 'application/json', 'User-Agent': 'wezmezadarmo/1.0' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`ELI API error: ${res.status}`);
  const data = await res.json();
  const items = (data.items ?? data ?? []) as RawAct[];

  const acts: EliAct[] = items.map((r): EliAct => ({
    eli: r.ELI ?? '',
    title: r.title ?? '',
    publisher: r.publisher ?? '',
    type: r.type ?? '',
    announcedAt: r.announcementDate ?? r.promulgation ?? '',
    eliUrl: r.ELI ? `https://eli.gov.pl/eli/${r.ELI}/ogl/` : '',
  })).filter(a => a.eli && a.title);

  return filterByKeywords(acts, opts?.keywords ?? KEYWORD_DEFAULT);
}
