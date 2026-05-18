import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://wezmezadarmo.com',
        'X-Title': 'wezmezadarmo',
      },
    });
  }
  return _client;
}

export const MODELS = {
  // Main chat + dotacje B2B + NLnet grant writing -- needs coherent multi-step reasoning
  conversation: 'google/gemini-2.0-flash-001',
  // Simple 1-4 sentence tasks: ZUS form Q&A, ZUS justification generation
  lite: 'google/gemini-2.0-flash-lite-001',
  // Structured JSON verification pass -- deterministic output required
  verifier: 'google/gemini-2.0-flash-lite-001',
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
