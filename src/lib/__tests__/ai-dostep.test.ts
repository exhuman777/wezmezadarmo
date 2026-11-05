// Dostęp do modelu (src/ai/openrouter.ts): bez OPENROUTER_API_KEY czat idzie przez Vercel AI Gateway z tokenem OIDC.
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('dostęp do modelu AI', () => {
  it('bez klucza i bez tokenu OIDC: czat nieskonfigurowany', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    const { aiSkonfigurowane } = await import('@/ai/openrouter');
    expect(await aiSkonfigurowane()).toBe(false);
  });

  it('bez klucza, z tokenem OIDC: zapytanie do AI Gateway z tokenem', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'tok-oidc-test');
    const wywolania: { url: string; auth: string; model: string }[] = [];
    vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
      const naglowki = new Headers(init?.headers);
      wywolania.push({ url: String(url), auth: naglowki.get('authorization') ?? '', model: JSON.parse(String(init?.body)).model });
      return new Response(JSON.stringify({ id: 'x', object: 'chat.completion', created: 1, model: 'm', choices: [{ index: 0, message: { role: 'assistant', content: 'działa' }, finish_reason: 'stop' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    const { aiSkonfigurowane, chatCompletion, GATEWAY_URL } = await import('@/ai/openrouter');
    expect(await aiSkonfigurowane()).toBe(true);
    expect(await chatCompletion([{ role: 'user', content: 'test' }], 'lite')).toBe('działa');
    expect(wywolania[0].url.startsWith(GATEWAY_URL)).toBe(true);
    expect(wywolania[0].auth).toBe('Bearer tok-oidc-test');
    expect(wywolania[0].model).toBe('google/gemini-2.5-flash-lite');
  });
});
