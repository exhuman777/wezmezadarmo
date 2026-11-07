import { test, expect, type Page } from '@playwright/test';

// Formularze z e-mailem: osobne zgody (e-mail w sprawie zgłoszenia, oferty e-mailem, telefon tylko przy telefonie,
// kontakt przez AI), domyślnie odznaczone, bez wymaganej zgody nic nie wychodzi. E-mail bez aliasu z plusem
// i bez domeny jednorazowej. Żaden mail nie wychodzi: zapytania z przeglądarki przechwytujemy, a API działa
// w trybie testowym (NARZEDZIA_TRYB_TESTOWY=1, bez Resend).

async function bezWysylki(page: Page, api: string): Promise<string[]> {
  const wyslane: string[] = [];
  await page.route(`**${api}`, (r) => { wyslane.push(r.request().url()); return r.fulfill({ status: 200, body: '{"ok":true}', contentType: 'application/json' }); });
  return wyslane;
}

const ZGODA_EMAIL = { email: true, emailOferty: false, telefon: false, ai: false };

test.describe('zgody na kontakt', () => {
  test('sprawdzenie po NIP: 4 zgody domyślnie odznaczone, bez zgody e-mail nic nie wychodzi', async ({ page }) => {
    const wyslane = await bezWysylki(page, '/api/narzedzia/lead');
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const form = page.getByTestId('formularz-narzedzia');
    const zgody = form.getByTestId('zgody-kontaktu').locator('input[type=checkbox]');
    await expect(zgody).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(zgody.nth(i)).not.toBeChecked();
    await expect(form.locator('input[data-zgoda=telefon]')).toHaveCount(1);
    await expect(form.locator('input[data-zgoda=ai]')).toHaveCount(1);
    await form.locator('#n-email').fill('jan@firma.pl');
    await form.locator('#n-tel').fill('600100200');
    await form.locator('input[data-zgoda=telefon]').check();
    await form.locator('input[data-zgoda=ai]').check();
    await form.locator('button[type=submit]').click();
    await expect(form.getByRole('alert')).toContainText('Zaznacz zgodę');
    expect(wyslane).toEqual([]);
    // przy każdej zgodzie link do polityki prywatności
    await expect(form.getByRole('link', { name: 'Polityka prywatności' })).toHaveCount(4);
    for (const l of await form.getByRole('link', { name: 'Polityka prywatności' }).all()) await expect(l).toHaveAttribute('href', '/polityka-prywatnosci#zgody');
  });

  test('formularz NIP odrzuca a+1@x.pl już w przeglądarce', async ({ page }) => {
    const wyslane = await bezWysylki(page, '/api/narzedzia/lead');
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const form = page.getByTestId('formularz-narzedzia');
    await form.locator('#n-email').fill('a+1@x.pl');
    await form.locator('#n-tel').fill('600 100 200');
    await form.locator('input[data-zgoda=email]').check();
    await form.locator('button[type=submit]').click();
    await expect(form.getByRole('alert')).toContainText('plus');
    expect(wyslane).toEqual([]);
  });

  test('API formularza NIP odrzuca alias z plusem, domenę jednorazową, zły telefon i brak zgody', async ({ request }) => {
    const wyslij = (dane: Record<string, unknown>) => request.post('/api/narzedzia/lead', { data: { telefon: '600100200', zgody: ZGODA_EMAIL, ...dane }, headers: { 'x-forwarded-for': `198.18.0.${Math.floor(Math.random() * 250) + 1}` } });
    const plus = await wyslij({ email: 'a+1@x.pl' });
    expect(plus.status()).toBe(400);
    expect((await plus.json()).error).toContain('plus');
    const jednorazowa = await wyslij({ email: 'jan@mailinator.com' });
    expect(jednorazowa.status()).toBe(400);
    expect((await jednorazowa.json()).error).toContain('jednorazowe');
    const telefon = await wyslij({ email: 'jan@firma.pl', telefon: '123' });
    expect(telefon.status()).toBe(400);
    const bezZgody = await wyslij({ email: 'jan@firma.pl', zgody: {} });
    expect(bezZgody.status()).toBe(400);
    expect((await bezZgody.json()).error).toContain('Zaznacz zgodę');
  });

  test('„Napisz do nas”: 3 zgody bez telefonu, odznaczone, bez wymaganej nic nie wychodzi', async ({ page }) => {
    const kontakt = await bezWysylki(page, '/api/contact');
    await page.goto('/o-projekcie');
    await page.locator('#napisz-do-nas summary').click();
    const k = page.locator('#napisz-do-nas');
    await expect(k.locator('input[type=checkbox]')).toHaveCount(3);
    await expect(k.locator('input[data-zgoda=telefon]')).toHaveCount(0);
    await expect(k.locator('input[data-zgoda=ai]')).toHaveCount(1);
    for (const c of await k.locator('input[type=checkbox]').all()) await expect(c).not.toBeChecked();
    await k.locator('#stopka-email').fill('jan@firma.pl');
    await k.locator('#stopka-wiadomosc').fill('Pytanie');
    await k.locator('input[data-zgoda=emailOferty]').check();
    await k.locator('button[type=submit]').click();
    // wymagana zgoda ma atrybut required: przeglądarka zatrzymuje wysłanie
    expect(await k.locator('input[data-zgoda=email]').evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true);
    await page.waitForTimeout(500);
    expect(kontakt).toEqual([]);
  });

  test('API „Napisz do nas” odrzuca brak zgody i domenę jednorazową', async ({ request }) => {
    const h = { 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}` };
    const bez = await request.post('/api/contact', { data: { email: 'jan@firma.pl', wiadomosc: 'x' }, headers: h });
    expect(bez.status()).toBe(400);
    const jedn = await request.post('/api/contact', { data: { email: 'jan@mailinator.com', wiadomosc: 'x', zgody: ZGODA_EMAIL }, headers: h });
    expect(jedn.status()).toBe(400);
  });

  test('newslettera nie ma: brak formularza w stopce, zapis odpowiada 410', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('#newsletter-email')).toHaveCount(0);
    await expect(page.locator('footer summary', { hasText: 'Newsletter' })).toHaveCount(0);
    const r = await request.post('/api/newsletter', { data: { email: 'jan@firma.pl' } });
    expect(r.status()).toBe(410);
  });

  test('polityka prywatności opisuje zgody i kontakt przez AI, bez numerów artykułów i danych właściciela', async ({ page }) => {
    await page.goto('/polityka-prywatnosci#zgody');
    await expect(page.locator('#zgody')).toContainText('asystenta AI');
    await expect(page.locator('#ai')).toContainText('rozmawiasz z programem AI');
    const tekst = await page.locator('main, body').first().innerText();
    expect(tekst).not.toMatch(/art\.\s*\d/i);
    expect(tekst).not.toMatch(/Sobkowicz|@gmail\.com/i);
    await page.goto('/regulamin');
    const regulamin = await page.locator('body').innerText();
    expect(regulamin).not.toMatch(/art\.\s*\d/i);
    expect(regulamin).not.toMatch(/Sobkowicz|@gmail\.com/i);
    expect(tekst).toContain('Mooning Charts Research (marka tuKamil), NIP 7133061369');
    expect(regulamin).toContain('Mooning Charts Research (marka tuKamil), NIP 7133061369');
    expect(tekst + regulamin).not.toMatch(/jednoosobowa działalność gospodarcza z Lublina/);
  });
});
