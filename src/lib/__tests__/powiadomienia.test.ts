import { afterEach, describe, expect, it, vi } from 'vitest';
import { powiadomKamila, trescPowiadomienia, tematPowiadomienia, odbiorcaPowiadomien } from '../powiadomienia';

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
});
