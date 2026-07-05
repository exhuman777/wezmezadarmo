/**
 * POST /api/dotacje/chat
 * B2B streaming AI chat for company panel.
 * Uses the nabor agent from the unified agent registry
 * with company-specific context (matched programs, live intel).
 */

import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { buildCompanyBlock, buildMatchedProgramsBlock } from '@/lib/dotacje/companyContext';
import { buildLiveIntelBlock } from '@/lib/dotacje/grantScraper';
import type { ScrapeItem } from '@/lib/dotacje/grantScraper';
import { chatStream } from '@/ai/openrouter';
import { buildAgentSystemPrompt } from '@/agents/registry';
import type { CompanyProfile } from '@/lib/dotacje/companyContext';
import type { DBCompanyProfile } from '@/lib/dotacje/supabase';
import type OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function dbProfileToCompanyProfile(db: DBCompanyProfile): CompanyProfile {
  return {
    nip: db.nip,
    name: db.name,
    pkdCodes: db.pkd_codes,
    voivodeship: db.voivodeship,
    size: db.size,
    employeeCountRange: db.employee_count_range,
    flags: (Object.keys(db.flags) as string[]).filter((k) => db.flags[k]) as CompanyProfile['flags'],
  };
}

/** Company-specific anti-hallucination rules appended to extraContext */
const COMPANY_RULES = `ZASADY ANTY-HALUCYNACYJNE DLA CZATU FIRMOWEGO:

1. TYLKO FAKTY Z BAZY. Podajesz wylacznie informacje o programach, ktore widoczne sa w sekcji DOPASOWANE PROGRAMY powyzej. Nie wolno Ci wymyslac, uzupelniac ani "domyslac sie" szczegolow programow spoza tej listy.

2. ZAKAZY BEZWZGLEDNE:
   - Nie wolno podawac kwot dofinansowania, ktorych nie ma w DOPASOWANE PROGRAMY.
   - Nie wolno podawac dat naboru, ktorych nie ma w DOPASOWANE PROGRAMY.
   - Nie wolno podawac adresow URL, ktorych nie ma w DOPASOWANE PROGRAMY.
   - Nie wolno nazywac programow, instytucji ani funduszy z pamieci -- tylko to, co jest w bazie.
   - Nie wolno potwierdzac, ze program "jest aktualnie otwarty", jesli jego status nie wynosi "open".

3. GDY NIE WIESZ -- POWIEDZ TO WPROST. Jesli uzytkownik pyta o cos, czego nie ma w Twojej bazie lub czego nie jestes pewien, odpowiedz dokladnie tak:
   "Nie mam pewnych informacji na ten temat w mojej bazie. Rekomendujemy sprawdzenie bezposrednio na stronie instytucji."

4. WERYFIKACJA PRZED ODPOWIEDZIA. Przed kazda odpowiedzia sprawdz: czy kazdy fakt, ktory podajesz (kwota, data, nazwa, URL, wymaganie), pochodzi bezposrednio z sekcji DOPASOWANE PROGRAMY powyzej? Jesli nie -- usun ten fakt z odpowiedzi.

5. ZAKAZ UOGOLNIEN. Nie uzywaj zwrotow takich jak "zazwyczaj", "z reguly", "standardowo w takich programach". Kazde wymaganie musi miec konkretne zrodlo z bazy.

6. Kazda odpowiedz KONCZ zdaniem: "Stan wiedzy: maj 2026. Weryfikuj terminy i wymagania bezposrednio w instytucji przed zlozeniem wniosku."`;

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: 'Konfiguracja serwera niekompletna -- brak klucza AI.' },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json(
      { error: 'Wymagane zalogowanie.' },
      { status: 401 },
    );
  }

  let body: { messages: OpenAI.Chat.ChatCompletionMessageParam[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Nieprawidlowy format zadania.' }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Brak wiadomosci w zadaniu.' }, { status: 400 });
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !profileRow) {
    return Response.json(
      { error: 'Nie znaleziono profilu firmy. Uzupelnij dane firmy przed rozmowa z asystentem.' },
      { status: 404 },
    );
  }

  const profile = dbProfileToCompanyProfile(profileRow as DBCompanyProfile);

  // Fetch recent grant scrape intel (last 24h) from DB
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentScrapes } = await supabase
    .from('grant_scrape_log')
    .select('id,source_id,source_name,title,link,description,pub_date,is_nabor,is_close,matched_program_id,scraped_at')
    .gte('scraped_at', since)
    .eq('is_nabor', true)
    .order('scraped_at', { ascending: false })
    .limit(20);

  const liveItems: ScrapeItem[] = (recentScrapes ?? []).map((r) => ({
    id: r.id,
    sourceId: r.source_id,
    sourceName: r.source_name,
    title: r.title,
    link: r.link,
    description: r.description,
    pubDate: r.pub_date,
    isNabor: r.is_nabor,
    isClose: r.is_close,
    matchedProgramId: r.matched_program_id,
    scrapedAt: r.scraped_at,
  }));

  // Build company-specific extra context
  const companyBlock = buildCompanyBlock(profile);
  const programsBlock = buildMatchedProgramsBlock(profile);
  const liveBlock = buildLiveIntelBlock(liveItems);

  const extraParts = [companyBlock, programsBlock];
  if (liveBlock) extraParts.push(liveBlock);
  extraParts.push(COMPANY_RULES);

  // Use nabor agent with company extraContext
  const systemPrompt = buildAgentSystemPrompt('dotacje', {
    profile: null,
    profileType: 'jdg',
    matchedBenefits: null,
    userProfile: null,
    extraContext: extraParts.join('\n\n'),
  });

  const messagesWithSystem: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const stream = await chatStream(messagesWithSystem);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
            }
            if (chunk.choices[0]?.finish_reason) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            }
          }
        } catch {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Blad strumieniowania odpowiedzi.' })}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[chat/route] chatStream error:', err);
    return Response.json(
      { error: 'Blad komunikacji z modelem AI. Sprobuj ponownie.' },
      { status: 502 },
    );
  }
}
