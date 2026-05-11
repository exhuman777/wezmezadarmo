import { NextRequest } from 'next/server';
import { chatStream } from '@/ai/openrouter';
import { SYSTEM_PROMPT, buildConversationContext } from '@/ai/systemPrompt';
import { UserProfile, MatchResult } from '@/engine/types';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-key-here') {
      return new Response(JSON.stringify({ error: 'Brak klucza API OpenRouter' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      messages,
      profile,
      verifiedResults,
    } = await request.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      profile: UserProfile | null;
      verifiedResults: MatchResult[] | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Brak wiadomosci' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const context = buildConversationContext(profile, verifiedResults);

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
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blad czatu';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
