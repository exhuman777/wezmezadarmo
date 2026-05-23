/**
 * Wykaz podatników VAT (Biała Lista)
 * Public, no auth. Source: wl-api.mf.gov.pl
 * Rate limit: 100 search/day, 30 entities per request. 5000 check/day.
 * Use cases: pre-payment verification for B2B invoices > 15k PLN (mandatory).
 */

const BASE = 'https://wl-api.mf.gov.pl/api';

export interface WhitelistSubject {
  name: string;
  nip: string;
  statusVat: 'Czynny' | 'Zwolniony' | 'Niezarejestrowany' | null;
  regon: string | null;
  krs: string | null;
  residenceAddress: string | null;
  workingAddress: string | null;
  accountNumbers: string[];
  hasVirtualAccounts: boolean;
  registrationLegalDate: string | null;
  registrationDenialDate: string | null;
  registrationDenialBasis: string | null;
  restorationDate: string | null;
  restorationBasis: string | null;
  removalDate: string | null;
  removalBasis: string | null;
}

export interface WhitelistSearchResult {
  result: {
    subject: WhitelistSubject | null;
    requestId: string;
  };
}

export async function searchByNip(nip: string, dateIso?: string): Promise<WhitelistSubject | null> {
  const date = dateIso ?? new Date().toISOString().slice(0, 10);
  const cleanNip = nip.replace(/\D/g, '');
  if (cleanNip.length !== 10) throw new Error('NIP musi miec 10 cyfr');

  const res = await fetch(`${BASE}/search/nip/${cleanNip}?date=${date}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 21600 }, // 6h cache; rate limit is daily
  });
  if (!res.ok) throw new Error(`Whitelist API error: ${res.status}`);
  const data: WhitelistSearchResult = await res.json();
  return data.result.subject;
}

/**
 * Check if a specific bank account is registered to a given NIP (for payment verification).
 * Returns 'TAK' if registered, 'NIE' otherwise. Used for split-payment compliance.
 */
export async function checkAccount(nip: string, account: string, dateIso?: string): Promise<boolean> {
  const date = dateIso ?? new Date().toISOString().slice(0, 10);
  const cleanNip = nip.replace(/\D/g, '');
  const cleanAccount = account.replace(/\D/g, '');
  const res = await fetch(`${BASE}/check/nip/${cleanNip}/bank-account/${cleanAccount}?date=${date}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error(`Whitelist check error: ${res.status}`);
  const data = await res.json();
  return data?.result?.accountAssigned === 'TAK';
}
