/**
 * NBP (Narodowy Bank Polski) API
 * Public, no auth. Source: api.nbp.pl
 * Use cases: currency conversion for foreign income on benefits applications.
 */

export interface NbpRate {
  currency: string;
  code: string;
  mid: number;
}

export interface NbpTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: NbpRate[];
}

const BASE = 'https://api.nbp.pl/api';

export async function getCurrentRates(): Promise<NbpTable> {
  const res = await fetch(`${BASE}/exchangerates/tables/A?format=json`, {
    headers: { Accept: 'application/json' },
    // Cache in Next.js fetch cache for 1h (rates update once a day on weekdays)
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NBP API error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) throw new Error('NBP: empty response');
  return data[0];
}

export async function getRate(currencyCode: string): Promise<NbpRate | null> {
  const table = await getCurrentRates();
  return table.rates.find(r => r.code.toUpperCase() === currencyCode.toUpperCase()) ?? null;
}

export async function convertToPln(amount: number, fromCurrency: string): Promise<number | null> {
  if (fromCurrency.toUpperCase() === 'PLN') return amount;
  const rate = await getRate(fromCurrency);
  if (!rate) return null;
  return Math.round(amount * rate.mid * 100) / 100;
}
