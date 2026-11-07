import OpenAI from 'openai';
import { tokenOidc } from '@/lib/powiadomienia';

// Dostęp do modelu bez klucza w repo:
// 1) OPENROUTER_API_KEY w Vercel: OpenRouter jak dotąd,
// 2) bez niego: Vercel AI Gateway z tokenem OIDC tej funkcji (nagłówek x-vercel-oidc-token albo VERCEL_OIDC_TOKEN),
//    ten sam sposób co czat asystent24.com. Modele google/gemini-2.5-* mają w Gateway te same nazwy.
export const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1';

/** Czy czat ma czym odpowiadać: klucz OpenRouter albo token OIDC do AI Gateway. */
export async function aiSkonfigurowane(): Promise<boolean> {
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-key-here') return true;
  return (await tokenOidc()) !== '';
}

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = process.env.OPENROUTER_API_KEY
      ? new OpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
          defaultHeaders: {
            'HTTP-Referer': 'https://www.wezmezadarmo.com',
            'X-Title': 'wezmezadarmo',
          },
        })
      : new OpenAI({
          baseURL: GATEWAY_URL,
          // token OIDC zależy od żądania i wygasa, więc SDK pobiera go przed każdym zapytaniem
          apiKey: async () => {
            const t = await tokenOidc();
            if (!t) throw new Error('Brak OPENROUTER_API_KEY i tokenu OIDC Vercela');
            return t;
          },
        });
  }
  return _client;
}

export const MODELS = {
  // Main chat + dotacje B2B + NLnet grant writing -- needs coherent multi-step reasoning
  conversation: 'google/gemini-2.5-flash',
  // Simple 1-4 sentence tasks: ZUS form Q&A, ZUS justification generation
  lite: 'google/gemini-2.5-flash-lite',
  // Structured JSON verification pass -- deterministic output required
  verifier: 'google/gemini-2.5-flash-lite',
} as const;

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: keyof typeof MODELS = 'conversation',
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: MODELS[model],
    messages,
    temperature: 0.3,
    max_tokens: 2048,
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function chatStream(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: keyof typeof MODELS = 'conversation',
) {
  return getClient().chat.completions.create({
    model: MODELS[model],
    messages,
    temperature: 0.3,
    max_tokens: 2048,
    stream: true,
  });
}

export { getClient as openrouter };
