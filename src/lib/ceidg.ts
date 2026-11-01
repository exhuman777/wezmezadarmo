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
  // v3 zwraca listę w polu "firmy", stare v2 w polu "firma"
  const firma = data?.firmy?.[0] ?? data?.firma?.[0];
  if (!firma) {
    return {
      aktywna: false, nazwa: null, dataRejestracji: null,
      dataZawieszenia: null, dataZakonczenia: null, pkd: [], status: null,
      wojewodztwo: null,
    };
  }
  return {
    aktywna: firma.status === 'AKTYWNY' && !(firma.dataZakonczeniaDzialalnosci ?? firma.dataZakonczenia),
    nazwa: firma.nazwa ?? null,
    dataRejestracji: firma.dataRozpoczeciaDzialalnosci ?? firma.dataRozpoczecia ?? null,
    dataZawieszenia: firma.dataZawieszeniaDzialalnosci ?? firma.dataZawieszenia ?? null,
    dataZakonczenia: firma.dataZakonczeniaDzialalnosci ?? firma.dataZakonczenia ?? null,
    pkd: [
      ...(firma.pkdGlowny?.kod ? [firma.pkdGlowny.kod as string] : []),
      ...(firma.pkd ?? []).map((p: { kod: string }) => p.kod),
    ].filter((k, i, a) => k && a.indexOf(k) === i),
    status: firma.status ?? null,
    wojewodztwo: firma.adresDzialalnosci?.wojewodztwo
      ? String(firma.adresDzialalnosci.wojewodztwo).toLowerCase()
      : null,
  };
}

function emptyCeidgData(): CeidgBusinessData {
  return {
    aktywna: false, nazwa: null, dataRejestracji: null,
    dataZawieszenia: null, dataZakonczenia: null, pkd: [], status: null,
    wojewodztwo: null,
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
    `https://dane.biznes.gov.pl/api/ceidg/v3/firmy?nip=${nip}`,
    {
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  // 404 = NIP nie istnieje w CEIDG (np. spolka, nie JDG) -- graceful empty response
  if (response.status === 404) return emptyCeidgData();
  if (!response.ok) {
    throw new Error(`CEIDG API error: ${response.status}`);
  }

  const data = await response.json();
  return parseCeidgResponse(data);
}
