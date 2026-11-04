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
    for (const p of ['/api/cron/benefits-audit', '/api/cron/benefits-audit?secret=zgadywanie', '/api/dotacje/cron/daily-scrape', '/api/dotacje/cron/weekly-check']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(401);
    }
  });

  test('narzędzia bez dostępu przekierowują na formularz, a zły next zostaje odrzucony', async ({ request }) => {
    const r = await request.get('/narzedzia/kpir/');
    expect(new URL(r.url()).pathname).toMatch(/^\/dla-firm\/narzedzia/);
    const lead = await request.post('/api/narzedzia/lead', { data: { email: 'zly', telefon: '1', next: '//evil.com' } });
    expect(lead.status()).toBe(400);
  });

  test('logowanie z next na obcą domenę zostaje na tej domenie', async ({ request, baseURL }) => {
    const r = await request.get('/auth/callback?next=@evil.com', { maxRedirects: 0 });
    const loc = r.headers()['location'] ?? '';
    expect(new URL(loc, baseURL).host).toBe(new URL(baseURL!).host);
  });

  test('reset hasła ma limit prób na IP (429)', async ({ request }) => {
    let ostatni = 0;
    for (let i = 0; i < 7; i++) {
      const r = await request.post('/api/auth/reset-password', {
        data: { email: `limit-${i}@example.invalid` },
        headers: { 'x-forwarded-for': '198.51.100.23' },
      });
      ostatni = r.status();
    }
    expect(ostatni).toBe(429);
  });
});
