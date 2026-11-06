import { test, expect, type Page } from '@playwright/test';

// Formularze z e-mailem: osobne zgody (e-mail w sprawie zgłoszenia, oferty e-mailem, telefon tylko przy telefonie, kontakt przez AI),
// domyślnie odznaczone, bez wymaganej zgody formularz nic nie wysyła. Żaden mail nie wychodzi (blokujemy zapytania).

async function bezWysylki(page: Page, api: string): Promise<string[]> {
  const wyslane: string[] = [];
  await page.route(`**${api}`, (r) => { wyslane.push(r.request().url()); return r.fulfill({ status: 200, body: '{"ok":true}', contentType: 'application/json' }); });
  return wyslane;
}

test.describe('zgody na kontakt', () => {
  test('sprawdzenie po NIP: 4 zgody odznaczone, bez zgody e-mail nic nie wychodzi', async ({ page }) => {
    const wyslane = await bezWysylki(page, '/api/narzedzia/lead');
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const zgody = page.getByTestId('formularz-narzedzia').getByTestId('zgody-kontaktu').locator('input[type=checkbox]');
    await expect(zgody).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(zgody.nth(i)).not.toBeChecked();
    await page.locator('#n-email').fill('jan@firma.pl');
    await page.locator('#n-tel').fill('600100200');
    await page.locator('input[data-zgoda=telefon]').check();
    await page.locator('input[data-zgoda=ai]').check();
    await page.getByTestId('formularz-narzedzia').locator('button[type=submit]').click();
    await expect(page.getByTestId('formularz-narzedzia').getByRole('alert')).toContainText('Zaznacz zgodę');
    expect(wyslane).toEqual([]);
    await expect(page.getByRole('link', { name: 'Polityka prywatności' }).first()).toHaveAttribute('href', '/polityka-prywatnosci#zgody');
  });

  test('„Napisz do nas” i newsletter: 3 zgody bez telefonu, odznaczone, bez wymaganej nic nie wychodzi', async ({ page }) => {
    const kontakt = await bezWysylki(page, '/api/contact');
    const newsletter = await bezWysylki(page, '/api/newsletter');
    await page.goto('/o-projekcie');
    await page.locator('#napisz-do-nas summary').click();
    const k = page.locator('#napisz-do-nas');
    await expect(k.locator('input[type=checkbox]')).toHaveCount(3);
    await expect(k.locator('input[data-zgoda=telefon]')).toHaveCount(0);
    for (const c of await k.locator('input[type=checkbox]').all()) await expect(c).not.toBeChecked();
    await k.locator('#stopka-email').fill('jan@firma.pl');
    await k.locator('#stopka-wiadomosc').fill('Pytanie');
    await k.locator('input[data-zgoda=emailOferty]').check();
    await k.locator('button[type=submit]').click();
    await expect(k.getByRole('alert')).toContainText('Zaznacz zgodę');
    expect(kontakt).toEqual([]);

    await page.locator('summary', { hasText: 'Newsletter' }).click();
    const n = page.locator('details', { has: page.locator('#newsletter-email') });
    await expect(n.locator('input[type=checkbox]')).toHaveCount(3);
    for (const c of await n.locator('input[type=checkbox]').all()) await expect(c).not.toBeChecked();
    await n.locator('#newsletter-email').fill('jan@firma.pl');
    await expect(n.locator('button[type=submit]')).toBeDisabled();
    expect(newsletter).toEqual([]);
  });

  test('polityka prywatności opisuje zgody i kontakt przez AI', async ({ page }) => {
    await page.goto('/polityka-prywatnosci#zgody');
    await expect(page.locator('#zgody')).toContainText('asystenta AI');
    await expect(page.getByText('Kontakt przez asystenta AI:')).toBeVisible();
  });
});
