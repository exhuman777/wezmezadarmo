import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { buildAgentSystemPrompt } from '@/lib/dotacje/companyContext';
import { chatStream } from '@/ai/openrouter';
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
    return Response.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Brak wiadomości w żądaniu.' }, { status: 400 });
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !profileRow) {
    return Response.json(
      { error: 'Nie znaleziono profilu firmy. Uzupełnij dane firmy przed rozmową z asystentem.' },
      { status: 404 },
    );
  }

  const profile = dbProfileToCompanyProfile(profileRow as DBCompanyProfile);
  const systemPrompt = buildAgentSystemPrompt(profile);

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
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Błąd strumieniowania odpowiedzi.' })}\n\n`),
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
      { error: 'Błąd komunikacji z modelem AI. Spróbuj ponownie.' },
      { status: 502 },
    );
  }
}
