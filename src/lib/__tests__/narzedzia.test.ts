import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { wydajDostep, sprawdzDostep, COOKIE_DOSTEP } from '@/lib/narzedzia/dostep';
import { hashTokenu, nowyToken, poprawnyFormat, terminTokenu, wygasl } from '@/lib/narzedzia/token';
import { walidujLead } from '@/lib/narzedzia/walidacja';
import { magazynPamiec, wyczyscPamiec } from '@/lib/narzedzia/leady';

const KLUCZ = 'klucz-testowy-co-najmniej-16-znakow';

describe('ciasteczko dostępu', () => {
  it('ważne zaraz po wydaniu, nieważne po 30 dniach i po zmianie', async () => {
    const t0 = Date.UTC(2026, 10, 2);
    const c = await wydajDostep('abc-123', t0, KLUCZ);
    expect(c).toBeTruthy();
    expect(await sprawdzDostep(c, t0 + 1000, KLUCZ)).toBe(true);
    expect(await sprawdzDostep(c, t0 + 31 * 86400 * 1000, KLUCZ)).toBe(false);
    const [id, exp, sig] = c!.split('.');
    expect(await sprawdzDostep(`${id}.${Number(exp) + 999}.${sig}`, t0, KLUCZ)).toBe(false);
    expect(await sprawdzDostep(c, t0, 'inny-klucz-tez-16-znakow')).toBe(false);
  });
  it('bez sekretu nie wydaje ani nie przepuszcza (fail closed)', async () => {
    expect(await wydajDostep('abc', Date.now(), null)).toBeNull();
    expect(await sprawdzDostep('a.b.c', Date.now(), null)).toBe(false);
    expect(await sprawdzDostep(undefined, Date.now(), KLUCZ)).toBe(false);
  });
});

describe('token potwierdzenia', () => {
  it('losowy, w poprawnym formacie, hash różny od tokenu', () => {
    const a = nowyToken(); const b = nowyToken();
    expect(a).not.toBe(b);
    expect(poprawnyFormat(a)).toBe(true);
    expect(poprawnyFormat('xyz')).toBe(false);
    expect(hashTokenu(a)).toHaveLength(64);
    expect(hashTokenu(a)).not.toContain(a);
  });
  it('wygasa po 7 dniach', () => {
    const t0 = Date.UTC(2026, 10, 2);
    const w = terminTokenu(t0);
    expect(wygasl(w, t0 + 6 * 86400 * 1000)).toBe(false);
    expect(wygasl(w, t0 + 7 * 86400 * 1000 + 1)).toBe(true);
    expect(wygasl(null)).toBe(true);
  });
  it('jest jednorazowy i nie działa po terminie (magazyn w pamięci)', async () => {
    wyczyscPamiec();
    const t0 = Date.UTC(2026, 10, 2);
    const tok = nowyToken();
    await magazynPamiec.zapiszOczekujacy({ email: 'a@b.pl', imie: null, telefon: null }, hashTokenu(tok), terminTokenu(t0), 'test', 'x');
    expect((await magazynPamiec.potwierdz(hashTokenu(tok), t0 + 1000)).ok).toBe(true);
    expect(await magazynPamiec.potwierdz(hashTokenu(tok), t0 + 2000)).toEqual({ ok: false, powod: 'brak' });
    const tok2 = nowyToken();
    await magazynPamiec.zapiszOczekujacy({ email: 'c@d.pl', imie: 'Ola', telefon: null }, hashTokenu(tok2), terminTokenu(t0), 'test', 'x');
    expect(await magazynPamiec.potwierdz(hashTokenu(tok2), t0 + 8 * 86400 * 1000)).toEqual({ ok: false, powod: 'wygasl' });
  });
});

describe('walidacja formularza', () => {
  it('wymaga e-maila i zgody, reszta opcjonalna', () => {
    expect(walidujLead({ email: 'zly', zgoda: true })).toMatchObject({ ok: false });
    expect(walidujLead({ email: 'a@b.pl', zgoda: false })).toMatchObject({ ok: false });
    expect(walidujLead({ email: ' A@B.pl ', zgoda: true })).toEqual({ ok: true, dane: { email: 'a@b.pl', imie: null, telefon: null } });
    expect(walidujLead({ email: 'a@b.pl', zgoda: true, imie: 'Iwona', telefon: '600 100 200' })).toEqual({ ok: true, dane: { email: 'a@b.pl', imie: 'Iwona', telefon: '600 100 200' } });
    expect(walidujLead({ email: 'a@b.pl', zgoda: true, telefon: '12' })).toMatchObject({ ok: false });
  });
  it('honeypot rozpoznany jako bot', () => {
    expect(walidujLead({ email: 'a@b.pl', zgoda: true, www: 'http://spam' })).toEqual({ ok: false, pulapka: true });
  });
});

describe('API /api/narzedzia/lead', () => {
  beforeEach(() => { vi.stubEnv('NARZEDZIA_TRYB_TESTOWY', '1'); vi.stubEnv('VERCEL', ''); wyczyscPamiec(); });
  afterEach(() => { vi.unstubAllEnvs(); });
  const req = (body: unknown, ip = '10.0.0.1') => new NextRequest('http://localhost/api/narzedzia/lead', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  });
  it('odrzuca zły e-mail (400) i udaje sukces przy honeypocie bez zapisu', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    expect((await POST(req({ email: 'nie-mail', zgoda: true }, '10.0.0.2'))).status).toBe(400);
    const r = await POST(req({ email: 'bot@spam.pl', zgoda: true, www: 'x' }, '10.0.0.3'));
    expect(r.status).toBe(200);
    expect(await magazynPamiec.lista()).toHaveLength(0);
  });
  it('zapisuje leada i daje link testowy, który wydaje ciasteczko', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    const r = await POST(req({ email: 'jan@firma.pl', zgoda: true, imie: 'Jan' }, '10.0.0.4'));
    const d = await r.json();
    expect(d.ok).toBe(true);
    expect(d.linkTestowy).toMatch(/\/api\/narzedzia\/potwierdz\?token=[0-9a-f]{48}$/);
    const { GET } = await import('@/app/api/narzedzia/potwierdz/route');
    const res = await GET(new NextRequest(d.linkTestowy));
    expect(res.headers.get('location')).toContain('/dla-firm/narzedzia?dostep=ok');
    expect(res.cookies.get(COOKIE_DOSTEP)?.value).toBeTruthy();
    const drugi = await GET(new NextRequest(d.linkTestowy));
    expect(drugi.headers.get('location')).toContain('dostep=zly-link');
  });
});

describe('middleware /narzedzia', () => {
  beforeEach(() => { vi.stubEnv('NARZEDZIA_TRYB_TESTOWY', '1'); vi.stubEnv('VERCEL', ''); });
  afterEach(() => { vi.unstubAllEnvs(); });
  it('bez ciasteczka przekierowuje do formularza, z ciasteczkiem przepuszcza i podaje index.html', async () => {
    const { middleware } = await import('@/middleware');
    const bez = await middleware(new NextRequest('http://localhost/narzedzia/kpir/kpir/'));
    expect(bez.status).toBe(307);
    expect(bez.headers.get('location')).toContain('/dla-firm/narzedzia?wymagany=1');
    const c = await wydajDostep('lead-1');
    const z = await middleware(new NextRequest('http://localhost/narzedzia/kpir/kpir/', { headers: { cookie: `${COOKIE_DOSTEP}=${c}` } }));
    expect(z.status).toBe(200);
    expect(z.headers.get('x-middleware-rewrite')).toContain('/narzedzia/kpir/kpir/index.html');
    expect(z.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});

describe('powiadomienie o leadzie dla właściciela', () => {
  it('pokazuje dane leada i ucieka znaki HTML', async () => {
    const { mailLeadHtml, WLASCICIEL_EMAIL } = await import('../narzedzia/mail');
    const html = mailLeadHtml({ email: 'a@b.pl', imie: '<script>x</script>', telefon: null }, new Date('2026-11-02T08:00:00Z'));
    expect(WLASCICIEL_EMAIL).toBe('sobkowicz.kamil@gmail.com');
    expect(html).toContain('a@b.pl');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
