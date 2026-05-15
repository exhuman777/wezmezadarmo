import { NextRequest } from 'next/server';
import { chatStream } from '@/ai/openrouter';
import { SYSTEM_PROMPT, buildConversationContext } from '@/ai/systemPrompt';
import { UserProfile, MatchResult } from '@/engine/types';
import { checkRateLimit } from '@/lib/rateLimit';
import { checkApiKey, unauthorizedResponse, optionsResponse, CORS_HEADERS } from '@/lib/apiAuth';

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  if (!checkApiKey(request)) return unauthorizedResponse();

  try {
    // Klienci B2B z kluczem API -- bez limitu zapytań
    const apiKeysEnv = process.env.B2B_API_KEYS;
    const providedKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const isBizClient = !!(apiKeysEnv && providedKey && apiKeysEnv.split(',').map(k => k.trim()).includes(providedKey));

    let remaining = 999;

    if (!isBizClient) {
      // Rate limit by IP
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
      const { allowed, remaining: rem } = checkRateLimit(ip);
      remaining = rem;

      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: 'limit',
            message: 'Osiągnąłeś dzienny limit 3 pytań do asystenta AI. wezmezadarmo.com jest projektem pro bono, utrzymywanym ze środków własnych. Limity pozwalają na to, żeby każdy mógł skorzystać z narzędzia. Limit resetuje się po 24 godzinach.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': '0',
              ...CORS_HEADERS,
            },
          },
        );
      }
    }

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-key-here') {
      return new Response(JSON.stringify({ error: 'Brak klucza API OpenRouter' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const {
      messages,
      profile,
      verifiedResults,
      focusedBenefitId,
    } = await request.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      profile: UserProfile | null;
      verifiedResults: MatchResult[] | null;
      focusedBenefitId?: string | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Brak wiadomosci' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const context = buildConversationContext(profile, verifiedResults, focusedBenefitId);

    const systemMessage = SYSTEM_PROMPT + (context ? `\n\n${context}` : '');

    const allMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages,
    ];

    const stream = await chatStream(allMessages, 'conversation');

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
        'X-RateLimit-Remaining': String(remaining),
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blad czatu';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
