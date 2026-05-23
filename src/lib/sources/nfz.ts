/**
 * NFZ (Narodowy Fundusz Zdrowia) Public API
 * Public, no auth. Source: api.nfz.gov.pl
 * Endpoints: queues, providers, dictionaries, drug reimbursement.
 */

const BASE = 'https://api.nfz.gov.pl/app-itl-api';
const UMOWY_BASE = 'https://api.nfz.gov.pl/app-umw-api';

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
  links?: { first?: string; prev?: string; next?: string; last?: string };
}

// ============================================================
// 1. KOLEJKI (wait lists)
// ============================================================

export async function getQueues(params: {
  benefit: string;
  caseType?: NfzCase;
  province?: string;
  locality?: string;
  page?: number;
  limit?: number;
}): Promise<NfzQueueResponse> {
  const url = new URL(`${BASE}/queues`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('case', String(params.caseType ?? 1));
  url.searchParams.set('benefit', params.benefit);
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('limit', String(params.limit ?? 25));
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
// 2. BENEFIT DICTIONARY (autocomplete for search)
// ============================================================

export interface NfzBenefit {
  id: string;
  type: string;
  attributes: { name: string };
}

export async function searchBenefits(query: string, limit: number = 25): Promise<string[]> {
  const url = new URL(`${BASE}/benefits`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('name', query);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NFZ benefits error: ${res.status}`);
  const data = await res.json();
  // The endpoint returns either array of strings or array of objects
  return (data.data ?? []).map((item: NfzBenefit | string) =>
    typeof item === 'string' ? item : item.attributes?.name,
  ).filter(Boolean);
}

// ============================================================
// 3. PROVIDERS (świadczeniodawcy)
// ============================================================

export interface NfzProviderAttrs {
  code: string;
  'regon-14': string | null;
  nip: string | null;
  'registry-number': string | null;
  name: string;
  'phone-pin': string | null;
  'pin-puk': string | null;
  email: string | null;
  www: string | null;
  'street-address': string | null;
  'post-code': string | null;
  'place-of-business': string | null;
  province: string | null;
}

export interface NfzProvider {
  type: string;
  id: string;
  attributes: NfzProviderAttrs;
}

export async function searchProviders(params: {
  name?: string;
  nip?: string;
  province?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: NfzProvider[]; meta: { count: number } }> {
  const url = new URL(`${UMOWY_BASE}/providers`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('limit', String(params.limit ?? 25));
  if (params.name) url.searchParams.set('name', params.name);
  if (params.nip) url.searchParams.set('nip', params.nip);
  if (params.province) url.searchParams.set('province', params.province);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NFZ providers error: ${res.status}`);
  return res.json();
}

// ============================================================
// 4. DRUG REIMBURSEMENT (refundacja leków)
// ============================================================

export interface NfzDrugAttrs {
  name: string;
  'common-name': string | null;
  power: string | null;
  pack: string | null;
  ean: string | null;
  'drug-type': string | null;
  refund: string | null; // refund category
  'lump-sum-fee': string | null;
  hundred: string | null; // 100% reimbursement
  thirty: string | null;
  fifty: string | null;
  free: string | null;
  validFrom: string | null;
  validTo: string | null;
}

export interface NfzDrug {
  type: string;
  id: string;
  attributes: NfzDrugAttrs;
}

export async function searchDrugs(params: {
  name?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: NfzDrug[]; meta: { count: number } }> {
  const url = new URL(`${BASE}/refunded-drugs`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('limit', String(params.limit ?? 25));
  if (params.name) url.searchParams.set('name', params.name);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NFZ drugs error: ${res.status}`);
  return res.json();
}

// ============================================================
// 5. PROVINCE CODES (TERYT 2-digit)
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

// ============================================================
// 6. POPULAR BENEFITS (for quick filters)
// ============================================================

export const POPULAR_BENEFITS = [
  'PORADNIA KARDIOLOGICZNA',
  'PORADNIA DERMATOLOGICZNA',
  'PORADNIA ENDOKRYNOLOGICZNA',
  'PORADNIA NEUROLOGICZNA',
  'PORADNIA OKULISTYCZNA',
  'PORADNIA ORTOPEDYCZNA',
  'PORADNIA REUMATOLOGICZNA',
  'PORADNIA ALERGOLOGICZNA',
  'PORADNIA GASTROENTEROLOGICZNA',
  'PORADNIA UROLOGICZNA',
  'PORADNIA STOMATOLOGICZNA',
  'REZONANS MAGNETYCZNY',
  'TOMOGRAFIA KOMPUTEROWA',
  'USG',
  'GASTROSKOPIA',
  'KOLONOSKOPIA',
  'FIZJOTERAPIA AMBULATORYJNA',
  'REHABILITACJA OGÓLNOUSTROJOWA',
  'PORADNIA ZDROWIA PSYCHICZNEGO',
];
