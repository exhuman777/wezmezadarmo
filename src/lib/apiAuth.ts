import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_ORIGINS = [
  'https://wezmezadarmo.com',
  'https://www.wezmezadarmo.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
};

/**
 * Sprawdza klucz API dla requestów B2B.
 *
 * Logika:
 * - Jeśli B2B_API_KEYS nie jest ustawiony -> wolny dostęp (tryb dev)
 * - Jeśli B2B_API_KEYS jest ustawiony:
 *   - Requesty z wezmezadarmo.com lub localhost -> zawsze dozwolone
 *   - Requesty zewnętrzne -> wymagany nagłówek X-API-Key lub Authorization: Bearer <klucz>
 *
 * Konfiguracja w Vercel: B2B_API_KEYS=klucz1,klucz2,klucz3
 */
export function checkApiKey(request: NextRequest): boolean {
  const apiKeysEnv = process.env.B2B_API_KEYS;

  // B2B klucze nie skonfigurowane -- wolny dostęp
  if (!apiKeysEnv || !apiKeysEnv.trim()) return true;

  const validKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);
  if (validKeys.length === 0) return true;

  // Requesty z tej samej domeny lub localhost -- zawsze dozwolone
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (origin && INTERNAL_ORIGINS.some(o => origin === o)) return true;
  if (referer && INTERNAL_ORIGINS.some(o => referer.startsWith(o))) return true;

  // Request zewnętrzny -- wymagany klucz
  const keyFromHeader = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');
  const keyFromBearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const providedKey = keyFromHeader || keyFromBearer;

  return !!(providedKey && validKeys.includes(providedKey));
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Brak autoryzacji. Podaj klucz API w nagłówku X-API-Key lub Authorization: Bearer <klucz>.' },
    { status: 401, headers: CORS_HEADERS },
  );
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
