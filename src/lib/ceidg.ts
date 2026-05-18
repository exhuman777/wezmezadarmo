export function validateNip(nip: string): boolean {
  if (!/^\d{10}$/.test(nip)) return false;
  const digits = nip.split('').map(Number);
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  return sum % 11 === digits[9];
}

export interface CeidgBusinessData {
  aktywna: boolean;
  nazwa: string | null;
  dataRejestracji: string | null;
  dataZawieszenia: string | null;
  dataZakonczenia: string | null;
  pkd: string[];
  status: string | null;
  wojewodztwo: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCeidgResponse(data: any): CeidgBusinessData {
  const firma = data?.firma?.[0];
  if (!firma) {
    return {
      aktywna: false, nazwa: null, dataRejestracji: null,
      dataZawieszenia: null, dataZakonczenia: null, pkd: [], status: null,
      wojewodztwo: null,
    };
  }
  return {
    aktywna: firma.status === 'AKTYWNY' && !firma.dataZakonczeniaDzialalnosci,
    nazwa: firma.nazwa ?? null,
    dataRejestracji: firma.dataRozpoczeciaDzialalnosci ?? null,
    dataZawieszenia: firma.dataZawieszeniaDzialalnosci ?? null,
    dataZakonczenia: firma.dataZakonczeniaDzialalnosci ?? null,
    pkd: (firma.pkd ?? []).map((p: { kod: string }) => p.kod),
    status: firma.status ?? null,
    wojewodztwo: firma.adresDzialalnosci?.wojewodztwo
      ? String(firma.adresDzialalnosci.wojewodztwo).toLowerCase()
      : null,
  };
}

export async function lookupNip(nip: string): Promise<CeidgBusinessData> {
  if (!validateNip(nip)) {
    throw new Error('Nieprawidlowy numer NIP');
  }

  const token = process.env.CEIDG_API_TOKEN;
  if (!token) {
    throw new Error('Brak tokenu CEIDG API');
  }

  const response = await fetch(
    `https://dane.biznes.gov.pl/api/ceidg/v2/firmy?nip=${nip}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`CEIDG API error: ${response.status}`);
  }

  const data = await response.json();
  return parseCeidgResponse(data);
}
