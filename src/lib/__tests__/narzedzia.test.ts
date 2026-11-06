import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { wydajDostep, sprawdzDostep, COOKIE_DOSTEP } from '@/lib/narzedzia/dostep';
import { hashTokenu, nowyToken, poprawnyFormat, terminTokenu, wygasl } from '@/lib/narzedzia/token';
import { bezpiecznyNext, normalizujTelefon, walidujLead, ZGODA_TRESC } from '@/lib/narzedzia/walidacja';
import { NARZEDZIA } from '@/lib/narzedzia/lista';
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
    expect(await magazynPamiec.zapiszOczekujacy({ email: 'a@b.pl', imie: null, telefon: null }, hashTokenu(tok), terminTokenu(t0), 'test', 'x')).toMatch(/^test-\d+$/);
    expect((await magazynPamiec.potwierdz(hashTokenu(tok), t0 + 1000)).ok).toBe(true);
    expect(await magazynPamiec.potwierdz(hashTokenu(tok), t0 + 2000)).toEqual({ ok: false, powod: 'brak' });
    const tok2 = nowyToken();
    await magazynPamiec.zapiszOczekujacy({ email: 'c@d.pl', imie: 'Ola', telefon: null }, hashTokenu(tok2), terminTokenu(t0), 'test', 'x');
    expect(await magazynPamiec.potwierdz(hashTokenu(tok2), t0 + 8 * 86400 * 1000)).toEqual({ ok: false, powod: 'wygasl' });
  });
});

describe('walidacja formularza (sprawdzenie firmy po NIP)', () => {
  const Z = { email: true };
  it('wymaga e-maila, polskiego telefonu i zgody e-mail; imię i pozostałe zgody opcjonalne', () => {
    expect(walidujLead({ email: 'zly', telefon: '600100200', zgody: Z })).toMatchObject({ ok: false });
    expect(walidujLead({ email: 'a@b.pl', telefon: '600100200', zgody: {} })).toMatchObject({ ok: false });
    expect(walidujLead({ email: 'a@b.pl', zgody: Z })).toEqual({ ok: false, blad: 'Podaj numer telefonu.' });
    expect(walidujLead({ email: 'a@b.pl', zgody: Z, telefon: '12' })).toMatchObject({ ok: false });
    expect(walidujLead({ email: ' A@B.pl ', telefon: '600 100 200', zgody: Z })).toEqual({ ok: true, dane: { email: 'a@b.pl', imie: null, telefon: '+48 600 100 200', zgody: { email: true, emailOferty: false, telefon: false, ai: false } } });
    expect(walidujLead({ email: 'a@b.pl', telefon: '+48 600-100-200', imie: 'Iwona', zgody: { email: true, telefon: true, ai: true } })).toMatchObject({ ok: true, dane: { imie: 'Iwona', zgody: { email: true, emailOferty: false, telefon: true, ai: true } } });
  });
  it('honeypot rozpoznany jako bot', () => {
    expect(walidujLead({ email: 'a@b.pl', telefon: '600100200', zgody: Z, www: 'http://spam' })).toEqual({ ok: false, pulapka: true });
  });
  it('wymagana zgoda dotyczy kontaktu e-mailem w sprawie zgłoszenia', () => {
    expect(ZGODA_TRESC).toContain('e-mailem w sprawie tego zgłoszenia');
  });
});

describe('telefon', () => {
  it('przyjmuje 9 cyfr z +48, 0048, spacjami, myślnikami i nawiasami', () => {
    expect(normalizujTelefon('600100200')).toBe('+48 600 100 200');
    expect(normalizujTelefon('+48600100200')).toBe('+48 600 100 200');
    expect(normalizujTelefon('0048 600 100 200')).toBe('+48 600 100 200');
    expect(normalizujTelefon('(81) 532-10-20')).toBe('+48 815 321 020');
    expect(normalizujTelefon(' 600.100.200 ')).toBe('+48 600 100 200');
  });
  it('odrzuca za krótkie, za długie, litery i inne kraje', () => {
    expect(normalizujTelefon('60010020')).toBeNull();
    expect(normalizujTelefon('6001002000')).toBeNull();
    expect(normalizujTelefon('600 abc 200')).toBeNull();
    expect(normalizujTelefon('+49 600 100 200')).toBeNull();
    expect(normalizujTelefon('')).toBeNull();
  });
});

describe('parametr next (bez open redirect)', () => {
  it('przepuszcza tylko ścieżki narzędzi', () => {
    expect(bezpiecznyNext('/narzedzia/kpir/kpir/')).toBe('/narzedzia/kpir/kpir/');
    expect(bezpiecznyNext('/narzedzia/jpk/')).toBe('/narzedzia/jpk/');
    expect(bezpiecznyNext('/dla-firm/narzedzia/dofinansowania')).toBe('/dla-firm/narzedzia/dofinansowania');
    expect(bezpiecznyNext('/narzedzia/kpir/forma/?x=1')).toBe('/narzedzia/kpir/forma/?x=1');
  });
  it('odrzuca adresy zewnętrzne i sztuczki', () => {
    for (const zly of ['https://zly.pl/narzedzia/', '//zly.pl/narzedzia/', '/\\zly.pl', '\\\\zly.pl', 'javascript:alert(1)', '/narzedzia/../admin', '/admin/narzedzia', '/panel', '/narzedzia%2f..%2fadmin', ' /narzedzia/', '/narzedzia/\n', '', null, 42, '/dla-firm/narzedziax']) {
      const w = bezpiecznyNext(zly);
      expect(w === '/dla-firm/narzedzia' || w.startsWith('/narzedzia/') || w.startsWith('/dla-firm/narzedzia/')).toBe(true);
      expect(w).not.toMatch(/^\/\/|zly\.pl|admin|panel|javascript/);
    }
    expect(bezpiecznyNext('https://zly.pl/narzedzia/')).toBe('/dla-firm/narzedzia/dofinansowania');
    expect(bezpiecznyNext('//zly.pl/narzedzia/')).toBe('/dla-firm/narzedzia/dofinansowania');
    expect(bezpiecznyNext('/narzedzia/../admin')).toBe('/dla-firm/narzedzia/dofinansowania');
  });
});

describe('lista narzędzi', () => {
  it('stałe adresy do linkowania; e-mail tylko przy dofinansowaniach po NIP', () => {
    expect(NARZEDZIA.map((n) => n.adres)).toEqual(['/dla-firm/narzedzia/kpir', '/dla-firm/narzedzia/jpk', '/dla-firm/narzedzia/dofinansowania']);
    expect(NARZEDZIA.filter((n) => n.email).map((n) => n.slug)).toEqual(['dofinansowania']);
    expect(NARZEDZIA.find((n) => n.slug === 'kpir')?.cel).toBe('/narzedzia/kpir/kpir/');
    expect(NARZEDZIA.find((n) => n.slug === 'jpk')?.cel).toBe('/narzedzia/jpk/');
    for (const n of NARZEDZIA) expect(bezpiecznyNext(n.cel)).toBe(n.cel);
  });
});

describe('API /api/narzedzia/lead (double opt-in)', () => {
  beforeEach(() => { vi.stubEnv('NARZEDZIA_TRYB_TESTOWY', '1'); vi.stubEnv('VERCEL', ''); wyczyscPamiec(); });
  afterEach(() => { vi.unstubAllEnvs(); });
  const req = (body: unknown, ip = '10.0.0.1') => new NextRequest('http://localhost/api/narzedzia/lead', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  });
  it('odrzuca zły e-mail, alias z plusem, domenę jednorazową i brak zgody (400); honeypot bez zapisu', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    expect((await POST(req({ email: 'nie-mail', zgody: { email: true }, telefon: '600100200' }, '10.0.0.2'))).status).toBe(400);
    expect((await POST(req({ email: 'jan+1@firma.pl', zgody: { email: true }, telefon: '600100200' }, '10.0.0.2'))).status).toBe(400);
    expect((await POST(req({ email: 'jan@mailinator.com', zgody: { email: true }, telefon: '600100200' }, '10.0.0.2'))).status).toBe(400);
    expect((await POST(req({ email: 'jan@firma.pl', zgody: {}, telefon: '600100200' }, '10.0.0.2'))).status).toBe(400);
    const r = await POST(req({ email: 'bot@spam.pl', zgody: { email: true }, telefon: '600100200', www: 'x' }, '10.0.0.3'));
    expect(r.status).toBe(200);
    expect(await magazynPamiec.lista()).toHaveLength(0);
  });
  it('po wysłaniu formularza nie daje dostępu: zapisuje leada i zwraca link testowy zamiast maila', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    const r = await POST(req({ email: 'jan@firma.pl', zgody: { email: true }, telefon: '600100200', imie: 'Jan' }, '10.0.0.4'));
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d).toMatchObject({ ok: true, wyslano: true });
    expect(d.linkTestowy).toMatch(/\/api\/narzedzia\/potwierdz\?token=[0-9a-f]{48}$/);
    expect(r.cookies.get(COOKIE_DOSTEP)).toBeUndefined();
    const [lead] = await magazynPamiec.lista();
    expect(lead).toMatchObject({ email: 'jan@firma.pl', telefon: '+48 600 100 200', imie: 'Jan', potwierdzony_at: null });
  });
  it('dostęp daje dopiero link z maila (jednorazowo), potem wynik po NIP', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    const d = await (await POST(req({ email: 'ewa@firma.pl', zgody: { email: true }, telefon: '600100200' }, '10.0.0.6'))).json();
    const { GET } = await import('@/app/api/narzedzia/potwierdz/route');
    const res = await GET(new NextRequest(d.linkTestowy));
    expect(res.headers.get('location')).toContain('/dla-firm/narzedzia/dofinansowania?dostep=ok');
    const c = res.cookies.get(COOKIE_DOSTEP);
    expect(c?.httpOnly).toBe(true);
    expect(c?.maxAge).toBe(30 * 24 * 3600);
    expect(await sprawdzDostep(c?.value)).toBe(true);
    const [lead] = await magazynPamiec.lista();
    expect(lead.potwierdzony_at).toBeTruthy();
    const drugi = await GET(new NextRequest(d.linkTestowy));
    expect(drugi.headers.get('location')).toContain('dostep=zly-link');
  });
  it('limit: szóste zgłoszenie z jednego IP w godzinie dostaje 429', async () => {
    const { POST } = await import('@/app/api/narzedzia/lead/route');
    for (let i = 0; i < 5; i++) {
      expect((await POST(req({ email: `l${i}@firma.pl`, zgody: { email: true }, telefon: '600100200' }, '10.0.0.99'))).status).toBe(200);
    }
    expect((await POST(req({ email: 'l6@firma.pl', zgody: { email: true }, telefon: '600100200' }, '10.0.0.99'))).status).toBe(429);
  });
});

describe('e-mail: alias z plusem i domeny jednorazowe', () => {
  it('rozpoznaje plus tylko przed @ i domeny jednorazowe także w subdomenach', async () => {
    const { aliasPlus, domenaJednorazowa } = await import('@/lib/narzedzia/walidacja');
    expect(aliasPlus('a+b@firma.pl')).toBe(true);
    expect(aliasPlus('ab@firma.pl')).toBe(false);
    expect(domenaJednorazowa('x@mailinator.com')).toBe(true);
    expect(domenaJednorazowa('x@poczta.mailinator.com')).toBe(true);
    for (const d of ['gmail.com', 'wp.pl', 'onet.pl', 'o2.pl', 'interia.pl', 'outlook.com', 'firma.pl']) expect(domenaJednorazowa(`x@${d}`), d).toBe(false);
  });
});

describe('middleware /narzedzia', () => {
  it('bez ciasteczka i formularza przepuszcza do narzędzia i podaje index.html', async () => {
    const { middleware } = await import('@/middleware');
    const kpir = await middleware(new NextRequest('http://localhost/narzedzia/kpir/kpir/'));
    expect(kpir.status).toBe(200);
    expect(kpir.headers.get('x-middleware-rewrite')).toContain('/narzedzia/kpir/kpir/index.html');
    expect(kpir.headers.get('x-robots-tag')).toBe('noindex, follow');
    const jpk = await middleware(new NextRequest('http://localhost/narzedzia/jpk/'));
    expect(jpk.status).toBe(200);
    expect(jpk.headers.get('x-middleware-rewrite')).toContain('/narzedzia/jpk/index.html');
    const plik = await middleware(new NextRequest('http://localhost/narzedzia/jpk/_astro/app.js'));
    expect(plik.headers.get('x-middleware-rewrite')).toBeNull();
    const katalog = await middleware(new NextRequest('http://localhost/narzedzia'));
    expect(new URL(katalog.headers.get('location')!).pathname).toBe('/dla-firm/narzedzia');
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
