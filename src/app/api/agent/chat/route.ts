/**
 * POST /api/agent/chat
 * Auth-aware streaming chat for agent panel.
 * Accepts mode: ogolny | swiadczenie | wniosek | nabor | faktura | termin
 * Loads user profile & benefits for context-rich responses.
 *
 * Uses the agent registry (src/agents/) for production-grade system prompts.
 */

import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { chatStream } from '@/ai/openrouter';
import { matchBenefits } from '@/engine/matcher';
import { CORS_HEADERS } from '@/lib/apiAuth';
import type { AgentMode } from '@/agents/types';
import { buildAgentSystemPrompt, profileToUserProfile } from '@/agents/registry';

const VALID_MODES: Set<string> = new Set<string>([
  'ogolny', 'swiadczenie', 'wniosek', 'nabor', 'faktura', 'termin',
]);

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

  // Build user profile object for benefit matching
  const userProfile = profile ? profileToUserProfile(profile as Record<string, unknown>) : null;

  let matchedBenefits = null;
  if (userProfile && (mode === 'swiadczenie' || mode === 'ogolny')) {
    const results = matchBenefits(userProfile);
    matchedBenefits = results.filter(
      r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE'
    );
  }

  // Build full system prompt via agent registry
  const profileType = profile?.type === 'jdg' ? 'jdg' as const : profile?.type === 'private' ? 'private' as const : null;

  const systemMessage = buildAgentSystemPrompt(mode, {
    profile: profile as Record<string, unknown> | null,
    profileType,
    matchedBenefits,
    userProfile,
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
