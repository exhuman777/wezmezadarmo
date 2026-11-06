import { test, expect } from '@playwright/test';

// Bezpieczeństwo na działającym serwerze: zamknięte zaplecze i crony, limity na IP.
test.describe('Bezpieczeństwo', () => {
  test('panel admina i diagnostyka wymagają hasła (401)', async ({ request }) => {
    for (const p of ['/admin/narzedzia', '/api/admin/rss-status', '/api/aktualnosci/debug']) {
      const r = await request.get(p, { maxRedirects: 0 });
      expect(r.status(), p).toBe(401);
    }
  });

  test('cron bez nagłówka i z sekretem w adresie URL jest odrzucany', async ({ request }) => {
    for (const p of ['/api/cron/benefits-audit', '/api/cron/benefits-audit?secret=zgadywanie', '/api/dotacje/cron/daily-scrape']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(401);
    }
  });

  test('narzędzia działają bez ciasteczka, a zły formularz NIP i zły next zostają odrzucone', async ({ request }) => {
    const r = await request.get('/narzedzia/kpir', { maxRedirects: 0 });
    expect(r.status()).toBe(200);
    expect(r.headers()['x-robots-tag']).toBe('noindex, follow');
    const lead = await request.post('/api/narzedzia/lead', { data: { email: 'zly', next: '//evil.com' } });
    expect(lead.status()).toBe(400);
  });

  test('logowanie z next na obcą domenę zostaje na tej domenie', async ({ request, baseURL }) => {
    const r = await request.get('/auth/callback?next=@evil.com', { maxRedirects: 0 });
    const loc = r.headers()['location'] ?? '';
    expect(new URL(loc, baseURL).host).toBe(new URL(baseURL!).host);
  });

  test('konta wyłączone: logowanie i panele 308 na strony publiczne, API kont 410', async ({ request }) => {
    for (const [z, na] of [['/logowanie', '/'], ['/rejestracja', '/'], ['/panel', '/'], ['/panel/chat', '/agent'], ['/agent/panel', '/agent'], ['/dotacje/panel', '/dotacje'], ['/dotacje/rejestracja', '/dotacje']]) {
      const r = await request.get(z, { maxRedirects: 0 });
      expect(r.status(), z).toBe(308);
      expect(new URL(r.headers()['location'], 'http://x').pathname, z).toBe(na);
    }
    for (const api of ['/api/auth/reset-password', '/api/auth/signin', '/api/agent/profile', '/api/dotacje/company', '/api/digest']) {
      const r = await request.post(api, { data: { email: 'limit@example.invalid' } });
      expect(r.status(), api).toBe(410);
    }
  });
});
