/**
 * POST /api/agent/chat
 * Auth-aware streaming chat for agent panel.
 * Accepts mode: ogolny | swiadczenie | wniosek | nabor | faktura | termin
 *
 * Kontekst:
 *  - Profil uzytkownika + dopasowane swiadczenia (z silnika)
 *  - Top 15 swiezych RSS aktualnosci (z rss_cache, filtrowane po audience profilu)
 *  - Subskrypcja RSS usera (filtry source/audience/keywords)
 *  - Smart prefetch live data: NBP kursy / Biala Lista VAT na podstawie intencji w wiadomosci
 *
 * Uses the agent registry (src/agents/) for production-grade system prompts.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { chatStream } from '@/ai/openrouter';
import { matchBenefits } from '@/engine/matcher';
import { CORS_HEADERS } from '@/lib/apiAuth';
import type { AgentMode } from '@/agents/types';
import type { RssContextItem, RssSubscriptionContext } from '@/agents/types';
import { buildAgentSystemPrompt, profileToUserProfile } from '@/agents/registry';
import { getQueues, NFZ_PROVINCE_CODES, PROVINCE_LABELS } from '@/lib/sources/nfz';

// Stolice wojewodztw + hardcoded GIOS stationId (znalezione przez api.gios.gov.pl)
// Pozwala omijac wolne findNearestStation w chat prefetch
const PROVINCE_CAPITALS: Record<string, { lat: number; lon: number; city: string; stationId: number }> = {
  dolnoslaskie: { lat: 51.1079, lon: 17.0385, city: 'Wrocław', stationId: 114 },
  'kujawsko-pomorskie': { lat: 53.0138, lon: 18.5984, city: 'Bydgoszcz', stationId: 109 },
  lubelskie: { lat: 51.2465, lon: 22.5684, city: 'Lublin', stationId: 258 },
  lubuskie: { lat: 52.7325, lon: 15.2369, city: 'Gorzów Wielkopolski', stationId: 230 },
  lodzkie: { lat: 51.7592, lon: 19.4560, city: 'Łódź', stationId: 295 },
  malopolskie: { lat: 50.0647, lon: 19.9450, city: 'Kraków', stationId: 400 },
  mazowieckie: { lat: 52.2297, lon: 21.0122, city: 'Warszawa', stationId: 530 },
  opolskie: { lat: 50.6751, lon: 17.9213, city: 'Opole', stationId: 478 },
  podkarpackie: { lat: 50.0413, lon: 21.9990, city: 'Rzeszów', stationId: 568 },
  podlaskie: { lat: 53.1325, lon: 23.1688, city: 'Białystok', stationId: 88 },
  pomorskie: { lat: 54.3520, lon: 18.6466, city: 'Gdańsk', stationId: 706 },
  slaskie: { lat: 50.2649, lon: 19.0238, city: 'Katowice', stationId: 814 },
  swietokrzyskie: { lat: 50.8661, lon: 20.6286, city: 'Kielce', stationId: 250 },
  'warminsko-mazurskie': { lat: 53.7784, lon: 20.4801, city: 'Olsztyn', stationId: 521 },
  wielkopolskie: { lat: 52.4064, lon: 16.9252, city: 'Poznań', stationId: 931 },
  zachodniopomorskie: { lat: 53.4285, lon: 14.5528, city: 'Szczecin', stationId: 11118 },
};

// Nazwy zgodne z faktycznym slownikiem NFZ (api.nfz.gov.pl/app-itl-api/benefits)
// "SWIADCZENIA Z ZAKRESU X" to ambulatoryjne specjalistyczne, "PORADNIA X" to konkretne placowki
const NFZ_SPECIALTY_MAP: Record<string, string> = {
  endokrynolog: 'ŚWIADCZENIA Z ZAKRESU ENDOKRYNOLOGII',
  kardiolog: 'ŚWIADCZENIA Z ZAKRESU KARDIOLOGII',
  ortopeda: 'ŚWIADCZENIA Z ZAKRESU ORTOPEDII I TRAUMATOLOGII NARZĄDU RUCHU',
  neurolog: 'ŚWIADCZENIA Z ZAKRESU NEUROLOGII',
  okulist: 'ŚWIADCZENIA Z ZAKRESU OKULISTYKI',
  urolog: 'ŚWIADCZENIA Z ZAKRESU UROLOGII',
  gastrolog: 'ŚWIADCZENIA Z ZAKRESU GASTROENTEROLOGII',
  onkolog: 'ŚWIADCZENIA Z ZAKRESU ONKOLOGII',
  diabetolog: 'ŚWIADCZENIA Z ZAKRESU DIABETOLOGII',
  nefrolog: 'ŚWIADCZENIA Z ZAKRESU NEFROLOGII',
  laryngolog: 'ŚWIADCZENIA Z ZAKRESU OTOLARYNGOLOGII',
  otolaryngolog: 'ŚWIADCZENIA Z ZAKRESU OTOLARYNGOLOGII',
  pulmonolog: 'ŚWIADCZENIA Z ZAKRESU GRUŹLICY I CHORÓB PŁUC',
  dermatolog: 'PORADNIA DERMATOLOGICZNA',
  reumatolog: 'PORADNIA REUMATOLOGICZNA',
  alergolog: 'PORADNIA ALERGOLOGICZNA',
  ginekolog: 'PORADNIA GINEKOLOGICZNA',
  psychiatr: 'PORADNIA ZDROWIA PSYCHICZNEGO',
  rehabilitac: 'PORADNIA REHABILITACYJNA',
};

const VALID_MODES: Set<string> = new Set<string>([
  'ogolny', 'swiadczenie', 'wniosek', 'nabor', 'faktura', 'termin',
]);

interface AgentChatBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  mode: string;
}

// ----- Helpers: fetch live context z Supabase + publicznych API -----

async function fetchRecentRss(audienceHint: string[] | null): Promise<RssContextItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) return [];

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      select: 'id,source_id,source_name,title,link,description,pub_date,audiences,fetched_at',
      fetched_at: `gte.${since}`,
      order: 'pub_date.desc.nullslast,fetched_at.desc',
      limit: '50',
    });
    const res = await fetch(`${url}/rest/v1/rss_cache?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json() as Array<{
      id: string; source_id: string; source_name: string;
      title: string; link: string; description: string;
      pub_date: string | null; audiences: string[];
    }>;

    let filtered = data;
    if (audienceHint && audienceHint.length > 0) {
      const matched = data.filter(item =>
        (item.audiences || []).some(a => audienceHint.includes(a))
      );
      if (matched.length >= 5) filtered = matched;
    }

    return filtered.slice(0, 15).map(row => ({
      sourceId: row.source_id,
      source: row.source_name,
      title: row.title,
      description: row.description ?? '',
      link: row.link,
      pubDate: row.pub_date,
      audiences: row.audiences ?? [],
    }));
  } catch {
    return [];
  }
}

async function fetchUserSubscription(userId: string): Promise<RssSubscriptionContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) return null;

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await client
      .from('rss_subscriptions')
      .select('active, source_ids, audiences, keywords, last_sent_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as RssSubscriptionContext;
  } catch {
    return null;
  }
}

// Smart prefetch: NBP kursy gdy uzytkownik pyta o waluty
async function maybeFetchNbp(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsCurrency = /\b(kurs|euro\b|eur\b|usd|dolar|dolara|funt|gbp|frank|chf|korona|nok|sek|czk|jen|jpy|wymian|przeliczen)/.test(lc);
  if (!wantsCurrency) return null;

  try {
    const res = await fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;
    const popular = ['EUR', 'USD', 'GBP', 'CHF', 'CZK', 'NOK', 'SEK', 'JPY'];
    const rates = data[0].rates
      .filter((r: { code: string }) => popular.includes(r.code))
      .map((r: { code: string; currency: string; mid: number }) =>
        `  ${r.code} (${r.currency}): ${r.mid.toFixed(4)} PLN`)
      .join('\n');
    return `AKTUALNE KURSY NBP (Tabela A, ${data[0].effectiveDate}):\n${rates}\n  Pelna tabela: https://wezmezadarmo.com/centrum-obywatela/kursy`;
  } catch {
    return null;
  }
}

// Smart prefetch: Biala Lista VAT gdy w wiadomosci jest NIP (10 cyfr)
async function maybeFetchWhitelist(text: string): Promise<string | null> {
  const nipMatch = text.match(/(?:nip[\s:]*)?(\d{10}|\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})/i);
  if (!nipMatch) return null;
  const nip = nipMatch[1].replace(/\D/g, '');
  if (nip.length !== 10) return null;

  try {
    const date = new Date().toISOString().slice(0, 10);
    const res = await fetch(`https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const sub = data?.result?.subject;
    if (!sub) {
      return `BIALA LISTA VAT - NIP ${nip}: brak w wykazie (status NIEZAREJESTROWANY).`;
    }
    return [
      `BIALA LISTA VAT - NIP ${nip}:`,
      `  Nazwa: ${sub.name}`,
      `  Status VAT: ${sub.statusVat}`,
      sub.regon ? `  REGON: ${sub.regon}` : '',
      sub.workingAddress || sub.residenceAddress ? `  Adres: ${sub.workingAddress ?? sub.residenceAddress}` : '',
      sub.accountNumbers?.length ? `  Konta zgloszone do MF: ${sub.accountNumbers.length}` : '',
      `  Pelne dane: https://wezmezadarmo.com/centrum-obywatela/biala-lista`,
    ].filter(Boolean).join('\n');
  } catch {
    return null;
  }
}

// Smart prefetch: NFZ live kolejki gdy user pyta o czas oczekiwania
async function maybeFetchNfz(text: string, userProvince: string | null): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsQueues = /\b(kolejk|czekam|czeka|czeka[lć]|oczekiwan|terminu wizyt|kiedy.*wizyt|wolne terminy)/.test(lc);
  if (!wantsQueues) return null;

  let specialty: string | null = null;
  for (const [keyword, benefit] of Object.entries(NFZ_SPECIALTY_MAP)) {
    if (lc.includes(keyword)) { specialty = benefit; break; }
  }

  if (!specialty) {
    return `Aby sprawdzic kolejki NFZ otworz /nfz i wpisz nazwe specjalisty oraz wojewodztwo. Lista popularnych specjalistow: ${Object.keys(NFZ_SPECIALTY_MAP).slice(0, 8).join(', ')}.`;
  }

  // Wyciagnij wojewodztwo z wiadomosci lub uzyj profilu
  let province: string | undefined;
  for (const [slug, label] of Object.entries(PROVINCE_LABELS)) {
    if (lc.includes(label.toLowerCase()) || lc.includes(slug)) {
      province = NFZ_PROVINCE_CODES[slug];
      break;
    }
  }
  if (!province && userProvince && NFZ_PROVINCE_CODES[userProvince]) {
    province = NFZ_PROVINCE_CODES[userProvince];
  }

  // Tryb pilny/stabilny
  const isPilny = /\b(pilny|pilne|pilna)\b/.test(lc);
  const caseType: 1 | 2 = isPilny ? 2 : 1;

  try {
    const queues = await getQueues({ benefit: specialty, province, caseType, limit: 5 });
    if (!queues.data || queues.data.length === 0) {
      return `NFZ kolejki dla "${specialty}"${province ? ' w wybranym wojewodztwie' : ''}: brak danych. Sprobuj /nfz?benefit=${encodeURIComponent(specialty)}.`;
    }
    const lines = [
      `NFZ - kolejki LIVE dla "${specialty}"${province ? ` (woj. ${Object.entries(NFZ_PROVINCE_CODES).find(([, c]) => c === province)?.[0]})` : ''}, tryb ${isPilny ? 'PILNY' : 'STABILNY'}:`,
      `Znaleziono ${queues.meta?.count ?? queues.data.length} placowek. Top 5 z najkrotszym oczekiwaniem:`,
    ];
    for (const q of queues.data.slice(0, 5)) {
      const a = q.attributes;
      const days = a.dates?.['date-situation-as-at']
        ? `~${a['statistics']?.['provider-data']?.['awaiting'] ?? '?'} osob w kolejce`
        : '?';
      lines.push(`  - ${a.provider} (${a.locality}): ${days}`);
    }
    lines.push(`Pelne dane: https://wezmezadarmo.com/nfz?benefit=${encodeURIComponent(specialty)}`);
    return lines.join('\n');
  } catch {
    return `Nie udalo sie pobrac live kolejek. Sprawdz /nfz?benefit=${encodeURIComponent(specialty)} reczne.`;
  }
}

// Smart prefetch: GIOS jakosc powietrza (direct API v1, bez wolnego findNearestStation)
async function maybeFetchGios(text: string, userProvince: string | null): Promise<string | null> {
  const lc = text.toLowerCase();
  const wants = /\b(powietrze|smog|jakosc powietrza|pm10|pm2|pm 2|pm25|alergi|astm|pylenie|oddychan)/.test(lc);
  if (!wants) return null;

  let info: { lat: number; lon: number; city: string; stationId: number } | null = null;
  for (const [, val] of Object.entries(PROVINCE_CAPITALS)) {
    if (lc.includes(val.city.toLowerCase())) { info = val; break; }
  }
  if (!info && userProvince && PROVINCE_CAPITALS[userProvince]) {
    info = PROVINCE_CAPITALS[userProvince];
  }
  if (!info) {
    return `Aby sprawdzic jakosc powietrza otworz /centrum-obywatela/powietrze i wybierz miasto lub zezwol na geolokalizacje.`;
  }

  try {
    const res = await fetch(`https://api.gios.gov.pl/pjp-api/v1/rest/aqindex/getIndex/${info.stationId}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      return `Aby sprawdzic jakosc powietrza w ${info.city} otworz /centrum-obywatela/powietrze.`;
    }
    const data = await res.json() as Record<string, unknown>;
    const aqi = data.AqIndex as Record<string, unknown> | undefined;
    if (!aqi) return null;

    const overall = aqi['Nazwa kategorii indeksu'] as string | null;
    const pm10 = aqi['Nazwa kategorii indeksu dla wskażnika PM10'] as string | null;
    const pm25 = aqi['Nazwa kategorii indeksu dla wskażnika PM2.5'] as string | null;
    const calcDate = aqi['Data wykonania obliczeń indeksu'] as string | null;

    const lines = [`GIOS - jakosc powietrza w ${info.city} (pomiar: ${calcDate ?? 'live'}):`];
    if (overall) lines.push(`  Indeks ogolny: ${overall}`);
    if (pm10) lines.push(`  PM10: ${pm10}`);
    if (pm25) lines.push(`  PM2.5: ${pm25}`);
    lines.push(`  Wiecej miast: https://wezmezadarmo.com/centrum-obywatela/powietrze`);
    return lines.join('\n');
  } catch {
    return `Aby sprawdzic jakosc powietrza w ${info.city} otworz /centrum-obywatela/powietrze.`;
  }
}

// Smart prefetch: CEIDG dla zalogowanych JDG ktorzy pytaja o swoja firme
async function maybeFetchCeidg(text: string, profileNip: string | null, isJdg: boolean): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsCompany = /\b(moja firm|moj nip|moja dzialal|status firmy|moj jdg|moj pkd|wpis ceidg)/.test(lc);
  if (!wantsCompany || !isJdg || !profileNip) return null;

  const ceidgToken = process.env.CEIDG_API_TOKEN;
  if (!ceidgToken) {
    return `Twoj profil JDG: NIP ${profileNip}. Sprawdz pelne dane firmy na biznes.gov.pl.`;
  }

  try {
    const res = await fetch(`https://dane.biznes.gov.pl/api/ceidg/v3/firmy?nip=${profileNip}`, {
      headers: {
        Authorization: `Bearer ${ceidgToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const firma = data?.firmy?.[0];
    if (!firma) return `CEIDG: brak wpisu dla NIP ${profileNip}.`;
    return [
      `CEIDG - Twoja firma (NIP ${profileNip}):`,
      `  Nazwa: ${firma.nazwa ?? '-'}`,
      `  Status: ${firma.status ?? '-'}`,
      firma.dataRozpoczecia ? `  Dzialalnosc od: ${firma.dataRozpoczecia}` : '',
      firma.pkdGlowny ? `  PKD glowny: ${firma.pkdGlowny.kod ?? ''} ${firma.pkdGlowny.nazwa ?? ''}` : '',
      firma.adresGlowny ? `  Adres: ${firma.adresGlowny.miasto ?? ''} ${firma.adresGlowny.kodPocztowy ?? ''}` : '',
    ].filter(Boolean).join('\n');
  } catch {
    return null;
  }
}

interface PrefetchOpts {
  userProvince: string | null;
  isJdg: boolean;
  profileNip: string | null;
}

// Glowna funkcja prefetch - rownoleglie wszystkie 5 zrodel live
async function buildLivePrefetch(lastUserMsg: string, opts: PrefetchOpts): Promise<string | null> {
  const [nbp, whitelist, nfz, gios, ceidg] = await Promise.all([
    maybeFetchNbp(lastUserMsg),
    maybeFetchWhitelist(lastUserMsg),
    maybeFetchNfz(lastUserMsg, opts.userProvince),
    maybeFetchGios(lastUserMsg, opts.userProvince),
    maybeFetchCeidg(lastUserMsg, opts.profileNip, opts.isJdg),
  ]);
  const parts = [nbp, whitelist, nfz, gios, ceidg].filter((p): p is string => p !== null);
  if (parts.length === 0) return null;
  return `DANE LIVE POBRANE NA POTRZEBY TEJ ROZMOWY:\n\n${parts.join('\n\n')}`;
}

// ----- Main handler -----

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: 'Wymagane zalogowanie.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Brak klucza API.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: AgentChatBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Nieprawidlowy format.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { messages, mode: rawMode = 'ogolny' } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Brak wiadomosci.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const mode: AgentMode = VALID_MODES.has(rawMode) ? (rawMode as AgentMode) : 'ogolny';

  // Load profile for context
  const { data: profile } = await supabase
    .from('agent_user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // Determine audience hint based on profile type
  const profileType = profile?.type === 'jdg' ? 'jdg' as const : profile?.type === 'private' ? 'private' as const : null;
  const audienceHint = profileType === 'jdg'
    ? ['jdg', 'firmy', 'wszyscy']
    : profileType === 'private'
      ? ['wszyscy']
      : null;

  // Last user message for smart prefetch
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

  // Parallel fetch all live context
  const userProfile = profile ? profileToUserProfile(profile as Record<string, unknown>) : null;
  const userProvince = (profile?.wojewodztwo as string | null) ?? null;
  const profileNip = (profile?.nip as string | null) ?? null;
  const isJdg = profileType === 'jdg';

  const [recentRssItems, rssSubscription, livePrefetch] = await Promise.all([
    fetchRecentRss(audienceHint),
    fetchUserSubscription(session.user.id),
    buildLivePrefetch(lastUserMsg, { userProvince, isJdg, profileNip }),
  ]);

  let matchedBenefits = null;
  if (userProfile && (mode === 'swiadczenie' || mode === 'ogolny')) {
    const results = matchBenefits(userProfile);
    matchedBenefits = results.filter(
      r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE'
    );
  }

  const systemMessage = buildAgentSystemPrompt(mode, {
    profile: profile as Record<string, unknown> | null,
    profileType,
    matchedBenefits,
    userProfile,
    recentRssItems,
    rssSubscription,
    extraContext: livePrefetch,
  });

  try {
    const stream = await chatStream([
      { role: 'system', content: systemMessage },
      ...messages,
    ], 'conversation');

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error('[agent/chat]', err);
    return new Response(JSON.stringify({ error: 'Blad czatu.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
