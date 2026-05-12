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
  conversation: 'google/gemini-2.0-flash-001',
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
