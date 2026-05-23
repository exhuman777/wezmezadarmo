/**
 * NFZ (Narodowy Fundusz Zdrowia) Public APIs
 * Public, no auth. Sources:
 *   - api.nfz.gov.pl/app-itl-api (Terminy leczenia): kolejki, słownik świadczeń, providers (tylko nazwy)
 *   - api.nfz.gov.pl/app-umw-api (Umowy): pełne dane świadczeniodawców
 *
 * NOTE: Refundacja leków NIE jest w API NFZ (lista refundacyjna jest PDF/Excel
 * od Min. Zdrowia, nie REST). Zakładka "leki" w UI nie korzysta z tego.
 */

const BASE_ITL = 'https://api.nfz.gov.pl/app-itl-api';
const BASE_UMW = 'https://api.nfz.gov.pl/app-umw-api';

export type NfzCase = 1 | 2;

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
  links?: { first?: string; prev?: string; next?: string; last?: string };
}

// ============================================================
// 1. KOLEJKI (itl-api)
// ============================================================
export async function getQueues(params: {
  benefit: string;
  caseType?: NfzCase;
  province?: string;
  locality?: string;
  page?: number;
  limit?: number;
}): Promise<NfzQueueResponse> {
  const url = new URL(`${BASE_ITL}/queues`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('case', String(params.caseType ?? 1));
  url.searchParams.set('benefit', params.benefit);
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('limit', String(params.limit ?? 25));
  url.searchParams.set('api-version', '1.3');
  if (params.province) url.searchParams.set('province', params.province);
  if (params.locality) url.searchParams.set('locality', params.locality);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NFZ queues error: ${res.status}`);
  return res.json();
}

// ============================================================
// 2. SŁOWNIK ŚWIADCZEŃ (itl-api benefits)
// ============================================================
interface RawBenefit { id: string; type: string; attributes: { name: string } }

export async function searchBenefits(query: string, limit: number = 25): Promise<string[]> {
  if (query.length < 3) return [];
  const url = new URL(`${BASE_ITL}/benefits`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('name', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('api-version', '1.3');
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NFZ benefits error: ${res.status}`);
  const data = await res.json();
  // Response shape: { data: [string, string, ...] } or { data: [{attributes:{name}}, ...] }
  const items = data.data ?? [];
  return items.map((it: RawBenefit | string) => typeof it === 'string' ? it : it.attributes?.name).filter(Boolean);
}

// ============================================================
// 3. ŚWIADCZENIODAWCY (umw-api -- full data with NIP/phone/address)
// ============================================================
export interface NfzProviderAttrs {
  branch: string;          // NFZ branch code (= TERYT province code)
  code: string;
  name: string;
  nip: string | null;
  regon: string | null;
  'registry-number': string | null;
  'post-code': string | null;
  street: string | null;
  place: string | null;
  phone: string | null;
  commune: string | null;
}

export interface NfzProvider {
  type: string;
  attributes: NfzProviderAttrs;
}

export interface NfzProviderResponse {
  meta: { count: number; page: number; limit: number };
  data: { entries: NfzProvider[] };
}

export async function searchProviders(params: {
  name?: string;
  nip?: string;
  branch?: string;            // NFZ oddział (= TERYT województwo)
  year?: number;              // required by API; default = current year
  page?: number;
  limit?: number;
}): Promise<NfzProviderResponse> {
  const url = new URL(`${BASE_UMW}/providers`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api-version', '1.2');
  url.searchParams.set('year', String(params.year ?? new Date().getFullYear()));
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('limit', String(params.limit ?? 25));
  if (params.name) url.searchParams.set('name', params.name);
  if (params.nip) url.searchParams.set('nip', params.nip);
  if (params.branch) url.searchParams.set('branch', params.branch);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NFZ providers error: ${res.status}`);
  return res.json();
}

// ============================================================
// 4. SŁOWNIKI: kody województw
// ============================================================
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

export const PROVINCE_LABELS: Record<string, string> = {
  dolnoslaskie: 'Dolnośląskie',
  'kujawsko-pomorskie': 'Kujawsko-Pomorskie',
  lubelskie: 'Lubelskie',
  lubuskie: 'Lubuskie',
  lodzkie: 'Łódzkie',
  malopolskie: 'Małopolskie',
  mazowieckie: 'Mazowieckie',
  opolskie: 'Opolskie',
  podkarpackie: 'Podkarpackie',
  podlaskie: 'Podlaskie',
  pomorskie: 'Pomorskie',
  slaskie: 'Śląskie',
  swietokrzyskie: 'Świętokrzyskie',
  'warminsko-mazurskie': 'Warmińsko-Mazurskie',
  wielkopolskie: 'Wielkopolskie',
  zachodniopomorskie: 'Zachodniopomorskie',
};

export const POPULAR_BENEFITS = [
  'PORADNIA KARDIOLOGICZNA',
  'PORADNIA DERMATOLOGICZNA',
  'PORADNIA ENDOKRYNOLOGICZNA',
  'PORADNIA NEUROLOGICZNA',
  'PORADNIA OKULISTYCZNA',
  'PORADNIA ORTOPEDYCZNA',
  'PORADNIA REUMATOLOGICZNA',
  'PORADNIA ALERGOLOGICZNA',
];
