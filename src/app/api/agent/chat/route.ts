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

// Smart prefetch: NFZ kolejki/lekarze gdy user pyta o czas oczekiwania
async function maybeFetchNfz(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsQueues = /\b(kolejk|czekam|czeka|czeka[lć]|oczekiwan|terminu wizyt|kiedy.*wizyt|wolne terminy)/.test(lc);
  if (!wantsQueues) return null;

  const specialty = (() => {
    const map: Record<string, string> = {
      endokrynolog: 'PORADNIA ENDOKRYNOLOGICZNA',
      kardiolog: 'PORADNIA KARDIOLOGICZNA',
      ortopeda: 'PORADNIA CHIRURGII URAZOWO-ORTOPEDYCZNEJ',
      neurolog: 'PORADNIA NEUROLOGICZNA',
      dermatolog: 'PORADNIA DERMATOLOGICZNA',
      okulist: 'PORADNIA OKULISTYCZNA',
      urolog: 'PORADNIA UROLOGICZNA',
      gastrolog: 'PORADNIA GASTROENTEROLOGICZNA',
      psychiatr: 'PORADNIA ZDROWIA PSYCHICZNEGO',
      ginekolog: 'PORADNIA GINEKOLOGICZNO-POLOZNICZA',
      reumatolog: 'PORADNIA REUMATOLOGICZNA',
    };
    for (const [keyword, benefit] of Object.entries(map)) {
      if (lc.includes(keyword)) return benefit;
    }
    return null;
  })();

  if (!specialty) {
    return `Aby sprawdzic kolejki NFZ otworz /nfz i wpisz nazwe specjalisty oraz wojewodztwo. Mozesz tez podac specjaliste w pytaniu (np. "ile czekam do endokrynologa w Warszawie?").`;
  }

  return `Sprawdz aktualne kolejki dla "${specialty}" na /nfz?benefit=${encodeURIComponent(specialty)}. Czas oczekiwania moze sie roznic per wojewodztwo i tryb (stabilny/pilny).`;
}

// Glowna funkcja prefetch - rownoleglie
async function buildLivePrefetch(lastUserMsg: string): Promise<string | null> {
  const [nbp, whitelist, nfz] = await Promise.all([
    maybeFetchNbp(lastUserMsg),
    maybeFetchWhitelist(lastUserMsg),
    maybeFetchNfz(lastUserMsg),
  ]);
  const parts = [nbp, whitelist, nfz].filter((p): p is string => p !== null);
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
  const [recentRssItems, rssSubscription, livePrefetch] = await Promise.all([
    fetchRecentRss(audienceHint),
    fetchUserSubscription(session.user.id),
    buildLivePrefetch(lastUserMsg),
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
