/**
 * POST /api/agent/chat
 * Auth-aware streaming chat for agent panel.
 * Accepts mode: ogolny | swiadczenie | wniosek | nabor | faktura | termin
 * Loads user profile & benefits for context-rich responses.
 */

import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { chatStream } from '@/ai/openrouter';
import { SYSTEM_PROMPT, buildConversationContext } from '@/ai/systemPrompt';
import { matchBenefits } from '@/engine/matcher';
import { UserProfile } from '@/engine/types';
import { CORS_HEADERS } from '@/lib/apiAuth';

const MODE_PROMPTS: Record<string, string> = {
  ogolny: `Odpowiadasz na dowolne pytania dotyczace swiadczen, ulg, wnioskow i urzedow w Polsce. Badz pomocny i rzeczowy.`,

  swiadczenie: `Skupiasz sie na konkretnych swiadczeniach i ulgach. Masz dostep do profilu uzytkownika i jego dopasowanych swiadczen. Pomagasz zrozumiec jakie swiadczenia przysluguja, jakie sa warunki i jak z nich skorzystac.`,

  wniosek: `Specjalizujesz sie w pomaganiu z wypelnianiem wnioskow ZUS, PFRON, MOPS i innych urzedow. Wyjasniaj krok po kroku jak wypelnic kazde pole. Znasz formularze: Z-15a, Z-15b, ZAS-53, PEL, ERPO, ERSU, Z-3. Jesli pytanie dotyczy innego formularza, powiedz ze mozesz pomoc z formularzami dostepnymi na wezmezadarmo.com/wnioski`,

  nabor: `Specjalizujesz sie w dofinansowaniach i naborach. Pomagasz znalezc odpowiednie programy wsparcia, granty EU, programy PUP, PFRON, NCBiR, PARP. Wyjasniaj terminy, warunki i kroki aplikowania.`,

  faktura: `Specjalizujesz sie w fakturach i rozliczeniach. Wyjasniaj KSeF (Krajowy System e-Faktur), obowiazki podatkowe, VAT, PIT, CIT. Odpowiadaj na pytania o terminy rozliczen, deklaracje, ulgi podatkowe dla firm i osob fizycznych.`,

  termin: `Specjalizujesz sie w terminach urzedowych. Informujesz o terminach skladania wnioskow, deklaracji podatkowych, rejestracji, odnowien. Przypominaj o waznych terminach i konsekwencjach ich niedotrzymania. Kalendarz urzedowy: PIT roczny do 30.04, VAT miesiecznie do 25. dnia, ZUS do 15/20. dnia.`,
};

interface AgentChatBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  mode: string;
}

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

  const { messages, mode = 'ogolny' } = body;
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

  // Build user profile object for benefit matching
  let verifiedResults = null;
  let userProfile: UserProfile | null = null;

  if (profile && profile.type === 'private') {
    userProfile = {
      wiek: profile.wiek ?? 0,
      plec: profile.plec ?? '',
      stanCywilny: profile.stan_cywilny ?? '',
      liczbaDzieci: profile.liczba_dzieci ?? 0,
      wiekDzieci: profile.wiek_dzieci ?? [],
      dochodMiesiecznie: profile.dochod_miesiecznie ?? 0,
      dochodNaOsobe: profile.dochod_na_osobe ?? 0,
      zatrudnienie: profile.zatrudnienie ?? '',
      niepelnosprawnosc: profile.niepelnosprawnosc ?? 'brak',
      wlasnosc: profile.wlasnosc ?? '',
      wojewodztwo: profile.wojewodztwo ?? '',
      prowadzDzialalnosc: false,
      pierwszaDzialalnosc: false,
      ciaza: profile.ciaza ?? false,
      student: profile.student ?? false,
      emeryt: profile.emeryt ?? false,
      rolnik: profile.rolnik ?? false,
      bezrobotnyZarejestrowany: profile.bezrobotny_zarejestrowany ?? false,
    } as UserProfile;

    // Match benefits for context
    if (mode === 'swiadczenie' || mode === 'ogolny') {
      const results = matchBenefits(userProfile);
      verifiedResults = results.filter(
        r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE'
      );
    }
  }

  const modePrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS.ogolny;
  const context = buildConversationContext(userProfile, verifiedResults, null);

  const systemMessage = SYSTEM_PROMPT
    + `\n\nTRYB AGENTA: ${modePrompt}`
    + (profile ? `\n\nPROFIL UZYTKOWNIKA: Typ: ${profile.type}${profile.type === 'jdg' ? `, Firma: ${profile.company_name}, NIP: ${profile.nip}` : ``}` : '')
    + (context ? `\n\n${context}` : '');

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
