import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://wezmezadarmo.com',
    'X-Title': 'wezmezadarmo',
  },
});

export const MODELS = {
  conversation: 'anthropic/claude-haiku-4-5-20251001',
  verifier: 'anthropic/claude-haiku-4-5-20251001',
} as const;

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: keyof typeof MODELS = 'conversation',
): Promise<string> {
  const response = await openrouter.chat.completions.create({
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
  return openrouter.chat.completions.create({
    model: MODELS[model],
    messages,
    temperature: 0.3,
    max_tokens: 2048,
    stream: true,
  });
}

export { openrouter };
