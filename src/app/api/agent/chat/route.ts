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
import type { AgentId } from '@/agents/types';
import { AGENT_IDS } from '@/agents/types';
import type { PrefetchSource } from '@/agents/types';
import type { RssContextItem, RssSubscriptionContext } from '@/agents/types';
import { buildAgentSystemPrompt, profileToUserProfile, getAgentConfig } from '@/agents/registry';
import { routeToAgent } from '@/agents/router';
import { getQueues, NFZ_PROVINCE_CODES, PROVINCE_LABELS } from '@/lib/sources/nfz';
import { getAirIndex } from '@/lib/sources/gios';
import { PROGRAMS, type EligibilityFlag } from '@/data/programs-b2b';
import { getPkdName, dominantSection } from '@/data/pkd-codes';

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

// Smart prefetch: NFZ -- kolejki + wyszukiwarka lekarzy/przychodni
async function maybeFetchNfz(text: string, userProvince: string | null): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsQueues = /\b(kolejk|czekam|czeka|czeka[lć]|oczekiwan|terminu wizyt|kiedy.*wizyt|wolne terminy)/.test(lc);
  const wantsProvider = /\b(lekarz|lekar[kz]|znale[zź][cć].*lekarz|szukam.*lekarz|szpital|przychodni|POZ|przychodn|poradni|najbli[zż]sz|gabinet|stomatolog|dentysta|fizjoterapeut)/.test(lc);
  if (!wantsQueues && !wantsProvider) return null;

  // Provider search mode: "znajdź lekarza w Lublinie"
  if (wantsProvider && !wantsQueues) {
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

    // Detect specialty from message
    let specialty: string | null = null;
    for (const [keyword, benefit] of Object.entries(NFZ_SPECIALTY_MAP)) {
      if (lc.includes(keyword)) { specialty = benefit; break; }
    }

    // If specialty found -> queue search is more useful
    if (specialty) {
      try {
        const queues = await getQueues({ benefit: specialty, province, caseType: 1, limit: 5 });
        if (queues.data && queues.data.length > 0) {
          const lines = [`NFZ - placowki oferujace "${specialty}"${province ? ` (woj. ${Object.entries(NFZ_PROVINCE_CODES).find(([, c]) => c === province)?.[0]})` : ''}:`];
          for (const q of queues.data.slice(0, 5)) {
            const a = q.attributes;
            lines.push(`  - ${a.provider}, ${a.locality}${a.phone ? `, tel. ${a.phone}` : ''}`);
          }
          lines.push(`Pelna lista + mapa: https://wezmezadarmo.com/nfz?benefit=${encodeURIComponent(specialty)}`);
          return lines.join('\n');
        }
      } catch { /* fallback below */ }
    }

    // Brak specialty -- nie zwracaj losowych podmiotow NFZ (apteki itp).
    // Kieruj uzytkownika do wyszukiwarki gdzie sam wybierze specjalizacje.
    const provSlug = province ? Object.entries(NFZ_PROVINCE_CODES).find(([, c]) => c === province)?.[0] : null;
    const popularne = ['kardiolog', 'okulist', 'ortopeda', 'dermatolog', 'ginekolog', 'neurolog', 'psychiatra'];
    return [
      `Podaj specjalizacje (np. ${popularne.slice(0, 4).join(', ')}), wtedy znajde konkretne placowki NFZ${provSlug ? ` w woj. ${provSlug}` : ''}.`,
      `Mozesz tez przeszukac samodzielnie: /nfz${provSlug ? `?woj=${provSlug}` : ''}`,
    ].join('\n');
  }

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
    // Reuze sprawdzonego parsera GIOS v1 (ld+json, defensywne klucze) z lib/sources/gios
    const aqi = await getAirIndex(info.stationId);
    if (!aqi.overall && !aqi.pm10 && !aqi.pm25 && !aqi.no2) {
      return `Aby sprawdzic jakosc powietrza w ${info.city} otworz /centrum-obywatela/powietrze.`;
    }
    const lines = [`GIOS - jakosc powietrza w ${info.city} (pomiar: ${aqi.sourceDate ?? aqi.calcDate ?? 'live'}):`];
    if (aqi.overall) lines.push(`  Indeks ogolny: ${aqi.overall}`);
    if (aqi.pm10) lines.push(`  PM10: ${aqi.pm10}`);
    if (aqi.pm25) lines.push(`  PM2.5: ${aqi.pm25}`);
    if (aqi.no2) lines.push(`  NO2: ${aqi.no2}`);
    lines.push(`  Wiecej miast: https://wezmezadarmo.com/centrum-obywatela/powietrze`);
    return lines.join('\n');
  } catch {
    return `Aby sprawdzic jakosc powietrza w ${info.city} otworz /centrum-obywatela/powietrze.`;
  }
}

// Matching dotacji B2B na podstawie PKD + wojewodztwa (gdy user ma NIP w profilu)
function buildDotacjeContext(pkd: string[], voivodeship: string | null): string | null {
  if (!pkd || pkd.length === 0) return null;

  const flags = new Set<EligibilityFlag>(['msp']);
  for (const code of pkd) {
    const prefix = code.slice(0, 2);
    if (prefix >= '10' && prefix <= '33') flags.add('sektor_produkcja');
    if (prefix === '62' || prefix === '63') { flags.add('sektor_it'); flags.add('cyfryzacja'); }
    if ((prefix >= '69' && prefix <= '82') || (prefix >= '85' && prefix <= '93')) flags.add('sektor_usluga');
    if (prefix >= '45' && prefix <= '47') flags.add('sektor_handel');
    if (prefix >= '01' && prefix <= '03') flags.add('sektor_rolnictwo');
  }

  const matched = PROGRAMS.filter(p => {
    const wojOk = p.voivodeships.includes('all')
      || (voivodeship ? p.voivodeships.includes(voivodeship.toLowerCase()) : false);
    if (!wojOk) return false;
    if (p.eligibilityFlags.length === 0) return true;
    const overlap = p.eligibilityFlags.filter(f => flags.has(f));
    return overlap.length / p.eligibilityFlags.length >= 0.5;
  });

  if (matched.length === 0) return null;

  const branża = dominantSection(pkd);
  const lines: string[] = [
    'PROGRAMY DOTACYJNE B2B DOPASOWANE DO FIRMY UZYTKOWNIKA:',
    branża ? `Branza glowna: ${branża.label}` : '',
    `PKD: ${pkd.slice(0, 5).map(c => `${c}${getPkdName(c) ? ' (' + getPkdName(c) + ')' : ''}`).join(', ')}`,
    `Dopasowane programy: ${matched.length}/23`,
    '',
  ].filter(Boolean);
  for (const p of matched.slice(0, 10)) {
    const kwota = p.maxAmountPLN ? (p.maxAmountPLN >= 1_000_000 ? `${(p.maxAmountPLN/1_000_000).toFixed(1)} mln zl` : `${(p.maxAmountPLN/1_000).toFixed(0)} tys. zl`) : '?';
    lines.push(`[${p.status.toUpperCase()}] ${p.name} - do ${kwota} (${p.institution})`);
  }
  lines.push('');
  lines.push('Pelna lista i szczegoly: /panel/dotacje');
  return lines.join('\n');
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

// Smart prefetch: IMGW/RCB ostrzezenia gdy user pyta o pogode/burze/alerty
async function maybeFetchImgw(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsWeather = /\b(pogod|burz|mr[oó]z|przymrozk|pow[oó]d[zź]|opad|wichur|alert.*pogod|rcb|ostrze[zż]eni|gradobic|smog)/.test(lc);
  if (!wantsWeather) return null;

  try {
    const res = await fetch('https://rcb.gov.pl/feed/', {
      headers: { Accept: 'application/rss+xml,text/xml,*/*', 'User-Agent': 'wezmezadarmo/1.0' },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const items: Array<{ title: string; link: string }> = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(xml)) !== null && items.length < 3) {
      const titleMatch = m[1].match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = m[1].match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const title = (titleMatch?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const link = (linkMatch?.[1] ?? '').trim();
      if (title) items.push({ title, link });
    }
    if (items.length === 0) {
      return `IMGW/RCB: brak aktywnych ostrzezen. Sytuacja meteo w normie.`;
    }
    const lines = items.map(i => `  - ${i.title}${i.link ? ` (${i.link})` : ''}`).join('\n');
    return `IMGW/RCB OSTRZEZENIA AKTYWNE (${items.length}):\n${lines}\n  Pelna lista: https://wezmezadarmo.com/centrum-obywatela/pogoda`;
  } catch {
    return null;
  }
}

// Smart prefetch: ELI/Sejm zmiany w prawie gdy user pyta o nowelizacje
async function maybeFetchEli(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsLaw = /\b(zmian.*praw|zmian.*przepis|nowelizacj|ustawa o|nowy przepis|kiedy wejdzie w [zż]ycie|projekt ustaw)/.test(lc);
  if (!wantsLaw) return null;

  try {
    const year = new Date().getFullYear();
    const res = await fetch(`https://api.sejm.gov.pl/eli/acts/DU/${year}?limit=30&offset=0`, {
      headers: { Accept: 'application/json', 'User-Agent': 'wezmezadarmo/1.0' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = (data.items ?? data ?? []) as Array<{ ELI?: string; title?: string; type?: string; announcementDate?: string }>;
    const keywords = ['swiadczenie', 'zasilek', 'ulga', 'dodatek', 'emerytura', 'zus', 'krus', 'refundacj', '800+'];
    const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const matched = items.filter(it => it.title && keywords.some(k => norm(it.title!).includes(k))).slice(0, 5);
    if (matched.length === 0) return null;
    const lines = matched.map(a => `  - ${a.type ?? ''}: ${a.title}${a.announcementDate ? ` (ogl. ${a.announcementDate})` : ''}`).join('\n');
    return `OSTATNIE ZMIANY W PRZEPISACH O SWIADCZENIACH (${year}, top ${matched.length}):\n${lines}\n  Pelna lista: https://wezmezadarmo.com/centrum-obywatela/prawo`;
  } catch {
    return null;
  }
}

// Smart prefetch: BDL GUS dane gminy gdy user pyta o swoja gmine
async function maybeFetchBdlGus(text: string, userProvince: string | null): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsGmina = /\b(moja gmina|w gminie|ludno[sś][cć]|bezrobocie w|dane.*gmin|statystyk.*gmin|gus.*gmin)/.test(lc);
  if (!wantsGmina) return null;

  // Wymaga gminy w wiadomosci albo wojewodztwa z profilu
  const gminaMatch = text.match(/(?:gmin[aęy][\s:]+|w gminie\s+)([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż-]+)/i);
  const gmina = gminaMatch?.[1];
  if (!gmina && !userProvince) {
    return `BDL GUS: aby pobrac dane, podaj nazwe gminy ("dane gminy Warszawa") lub uzupelnij wojewodztwo w profilu. Wyszukiwarka: https://wezmezadarmo.com/centrum-obywatela/gus`;
  }
  if (!gmina) return null;

  try {
    const sRes = await fetch(`https://bdl.stat.gov.pl/api/v1/units/search?name=${encodeURIComponent(gmina)}&level=5&format=json&page-size=1`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const unit = (sData.results ?? [])[0] as { id: string; name: string; parentName?: string } | undefined;
    if (!unit) return `BDL GUS: nie znaleziono gminy "${gmina}". Sprawdz pisownie na https://wezmezadarmo.com/centrum-obywatela/gus`;

    const varParams = ['60559', '459163', '60270'].map(v => `var-id=${v}`).join('&');
    const dRes = await fetch(`https://bdl.stat.gov.pl/api/v1/data/by-unit/${unit.id}?${varParams}&format=json`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!dRes.ok) return null;
    const dData = await dRes.json();
    const byId = new Map((dData.results ?? []).map((r: { id: string; values: Array<{ val: number; year: string }> }) => [r.id, r]));
    const last = (id: string) => {
      const r = byId.get(id) as { values: Array<{ val: number; year: string }> } | undefined;
      const v = r?.values?.[r.values.length - 1];
      return v ? { val: v.val, year: v.year } : null;
    };
    const pop = last('60559');
    const unemp = last('459163');
    const sal = last('60270');
    return [
      `BDL GUS - dane gminy ${unit.name}${unit.parentName ? ` (${unit.parentName})` : ''}:`,
      pop ? `  Ludnosc: ${pop.val.toLocaleString('pl-PL')} (${pop.year})` : '',
      unemp ? `  Bezrobocie: ${unemp.val}% (${unemp.year})` : '',
      sal ? `  Przecietne wynagrodzenie: ${sal.val.toLocaleString('pl-PL')} PLN brutto (${sal.year})` : '',
      `  Wiecej: https://wezmezadarmo.com/centrum-obywatela/gus`,
    ].filter(Boolean).join('\n');
  } catch {
    return null;
  }
}

// Glowna funkcja prefetch - rownoleglie wszystkie 8 zrodel live
async function buildLivePrefetch(lastUserMsg: string, opts: PrefetchOpts): Promise<string | null> {
  const [nbp, whitelist, nfz, gios, ceidg, imgw, eli, bdl] = await Promise.all([
    maybeFetchNbp(lastUserMsg),
    maybeFetchWhitelist(lastUserMsg),
    maybeFetchNfz(lastUserMsg, opts.userProvince),
    maybeFetchGios(lastUserMsg, opts.userProvince),
    maybeFetchCeidg(lastUserMsg, opts.profileNip, opts.isJdg),
    maybeFetchImgw(lastUserMsg),
    maybeFetchEli(lastUserMsg),
    maybeFetchBdlGus(lastUserMsg, opts.userProvince),
  ]);
  const parts = [nbp, whitelist, nfz, gios, ceidg, imgw, eli, bdl].filter((p): p is string => p !== null);
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
      status: 503,
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

  const { messages, mode: rawMode = 'auto' } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Brak wiadomosci.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

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

  // Route to agent
  let agentId: AgentId;
  if (rawMode === 'auto' || !AGENT_IDS.includes(rawMode as AgentId)) {
    agentId = routeToAgent(lastUserMsg, profileType ?? undefined);
  } else {
    agentId = rawMode as AgentId;
  }

  // Parallel fetch all live context
  const userProfile = profile ? profileToUserProfile(profile as Record<string, unknown>) : null;
  const userProvince = (profile?.wojewodztwo as string | null) ?? (profile?.company_voivodeship as string | null) ?? null;
  const profileNip = (profile?.nip as string | null) ?? null;
  const isJdg = profileType === 'jdg';
  const profilePkd = (profile?.pkd_codes as string[] | null) ?? null;

  const agentConfig = getAgentConfig(agentId);
  const prefetchSources = new Set(agentConfig.prefetch);

  const PREFETCH_MAP: Record<PrefetchSource, () => Promise<string | null>> = {
    nfz: () => maybeFetchNfz(lastUserMsg, userProvince),
    gios: () => maybeFetchGios(lastUserMsg, userProvince),
    nbp: () => maybeFetchNbp(lastUserMsg),
    whitelist: () => maybeFetchWhitelist(lastUserMsg),
    ceidg: () => maybeFetchCeidg(lastUserMsg, profileNip, isJdg),
    imgw: () => maybeFetchImgw(lastUserMsg),
    eli: () => maybeFetchEli(lastUserMsg),
    'bdl-gus': () => maybeFetchBdlGus(lastUserMsg, userProvince),
    benefits: () => Promise.resolve(null),
  };

  const prefetchPromises = [...prefetchSources]
    .filter(s => s !== 'benefits')
    .map(s => PREFETCH_MAP[s]());
  const prefetchResults = await Promise.all(prefetchPromises);
  const livePrefetch = prefetchResults.filter((p): p is string => p !== null);
  const liveContext = livePrefetch.length > 0
    ? `DANE LIVE POBRANE NA POTRZEBY TEJ ROZMOWY:\n\n${livePrefetch.join('\n\n')}`
    : null;

  const [recentRssItems, rssSubscription] = await Promise.all([
    fetchRecentRss(audienceHint),
    fetchUserSubscription(session.user.id),
  ]);

  // Dotacje B2B - gdy user ma NIP w profilu (niezaleznie czy JDG czy prywatny z firma)
  const dotacjeContext = profilePkd && profilePkd.length > 0
    ? buildDotacjeContext(profilePkd, userProvince)
    : null;

  // Polacz live prefetch + dotacje w jeden extraContext
  const combinedExtra = [liveContext, dotacjeContext].filter(Boolean).join('\n\n');

  let matchedBenefits = null;
  if (userProfile && (prefetchSources.has('benefits') || agentId === 'konsjerz' || agentId === 'swiadczenia')) {
    const results = matchBenefits(userProfile);
    matchedBenefits = results.filter(
      r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE'
    );
  }

  const systemMessage = buildAgentSystemPrompt(agentId, {
    profile: profile as Record<string, unknown> | null,
    profileType,
    matchedBenefits,
    userProfile,
    recentRssItems,
    rssSubscription,
    extraContext: combinedExtra || null,
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
        'X-Agent-Id': agentId,
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
