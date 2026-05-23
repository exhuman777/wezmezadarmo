/**
 * NFZ (Narodowy Fundusz Zdrowia) Public API
 * Public, no auth. Source: api.nfz.gov.pl
 * Use cases: find healthcare providers, wait times, drug reimbursement lookup.
 */

const BASE = 'https://api.nfz.gov.pl/app-itl-api';

export type NfzCase = 1 | 2; // 1 = stable, 2 = urgent

export interface NfzQueueAttrs {
  case: number;
  benefit: string;
  'many-places': string;
  provider: string;
  'provider-code': string;
  locality: string;
  address: string;
  phone: string | null;
  dates: { date: string; 'date-situation-as-at': string } | null;
  statistics: {
    'provider-data'?: {
      awaiting?: number;
      removed?: number;
      'average-period'?: number;
    };
  } | null;
}

export interface NfzQueueItem {
  type: string;
  id: string;
  attributes: NfzQueueAttrs;
}

export interface NfzQueueResponse {
  meta: { context: string; count: number; title: string; page: number; url: string; limit: number };
  data: NfzQueueItem[];
}

export async function getQueues(params: {
  benefit: string;          // e.g. "PORADNIA KARDIOLOGICZNA"
  caseType?: NfzCase;       // 1 stable (default), 2 urgent
  province?: string;        // "07" for Mazowieckie etc., 2-digit TERYT code
  locality?: string;        // city name
  limit?: number;           // default 10
}): Promise<NfzQueueResponse> {
  const url = new URL(`${BASE}/queues`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('case', String(params.caseType ?? 1));
  url.searchParams.set('benefit', params.benefit);
  url.searchParams.set('limit', String(params.limit ?? 10));
  if (params.province) url.searchParams.set('province', params.province);
  if (params.locality) url.searchParams.set('locality', params.locality);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NFZ API error: ${res.status}`);
  return res.json();
}

// Polish voivodeship codes (TERYT 2-digit)
export const NFZ_PROVINCE_CODES: Record<string, string> = {
  dolnoslaskie: '01',
  'kujawsko-pomorskie': '02',
  lubelskie: '03',
  lubuskie: '04',
  lodzkie: '05',
  malopolskie: '06',
  mazowieckie: '07',
  opolskie: '08',
  podkarpackie: '09',
  podlaskie: '10',
  pomorskie: '11',
  slaskie: '12',
  swietokrzyskie: '13',
  'warminsko-mazurskie': '14',
  wielkopolskie: '15',
  zachodniopomorskie: '16',
};
