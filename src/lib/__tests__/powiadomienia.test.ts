import { afterEach, describe, expect, it, vi } from 'vitest';
import { powiadomKamila, trescPowiadomienia, tematPowiadomienia, odbiorcaPowiadomien, PRZEKAZNIK } from '../powiadomienia';

const p = { strona: 'wezmezadarmo.com', formularz: 'test', pola: { Imię: '<script>alert(1)</script>', 'E-mail': 'a@b.pl' }, odpowiedzDo: 'a@b.pl' };

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('powiadomKamila', () => {
  it('wysyła na adres Kamila z escapowaną treścią', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.stubEnv('POWIADOMIENIA_EMAIL', '');
    const f = vi.fn(async () => new Response(JSON.stringify({ id: 'abc' }), { status: 200 }));
    const w = await powiadomKamila(p, f as unknown as typeof fetch);
    expect(w).toEqual({ wyslane: true, id: 'abc' });
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.to).toEqual(['sobkowicz.kamil@gmail.com']);
    expect(body.subject).toBe('[wezmezadarmo.com] Nowe zgłoszenie: test');
    expect(body.html).not.toContain('<script>');
    expect(body.html).toContain('&lt;script&gt;');
    expect(body.reply_to).toBe('a@b.pl');
  });
  it('bez klucza nie rzuca i nie woła sieci', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = vi.fn();
    expect(await powiadomKamila(p, f as unknown as typeof fetch)).toEqual({ wyslane: false, blad: 'brak RESEND_API_KEY' });
    expect(f).not.toHaveBeenCalled();
  });
  it('ponawia raz przy 5xx i błędzie sieci, nie rzuca', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = vi.fn().mockRejectedValueOnce(new Error('siec')).mockResolvedValueOnce(new Response('', { status: 503 }));
    expect((await powiadomKamila(p, f as unknown as typeof fetch)).wyslane).toBe(false);
    expect(f).toHaveBeenCalledTimes(2);
  });
  it('nie ponawia przy 4xx', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = vi.fn(async () => new Response('', { status: 422 }));
    await powiadomKamila(p, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('adres z POWIADOMIENIA_EMAIL ma pierwszeństwo, temat bez nowych linii', () => {
    vi.stubEnv('POWIADOMIENIA_EMAIL', 'inny@example.com');
    expect(odbiorcaPowiadomien()).toBe('inny@example.com');
    expect(tematPowiadomienia({ ...p, formularz: 'a\r\nBcc: x@y.z' })).not.toMatch(/[\r\n]/);
    expect(trescPowiadomienia(p).text).toContain('E-mail: a@b.pl');
  });
  it('najpierw przekaźnik z tokenem OIDC, bez odbiorcy w żądaniu', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const f = vi.fn(async () => new Response(JSON.stringify({ ok: true, id: 'p1' }), { status: 200 }));
    const w = await powiadomKamila(p, f as unknown as typeof fetch, 'tok');
    expect(w).toEqual({ wyslane: true, id: 'p1' });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(PRZEKAZNIK);
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty('to');
    expect(body.formularz).toBe('test');
  });
  it('przekaźnik odrzuca albo milczy: wysyłka lokalna', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const f = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, powod: 'projekt' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'r1' }), { status: 200 }));
    expect(await powiadomKamila(p, f as unknown as typeof fetch, 'tok')).toEqual({ wyslane: true, id: 'r1' });
    expect((f.mock.calls[1] as unknown as [string])[0]).toBe('https://api.resend.com/emails');
    const g = vi.fn().mockRejectedValueOnce(new Error('a')).mockRejectedValueOnce(new Error('b'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'r2' }), { status: 200 }));
    expect(await powiadomKamila(p, g as unknown as typeof fetch, 'tok')).toEqual({ wyslane: true, id: 'r2' });
    expect(g).toHaveBeenCalledTimes(3);
  });
});
