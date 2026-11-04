import { defineConfig, devices } from '@playwright/test';

const PORT = 3123;

/**
 * E2E na prawdziwej przeglądarce (Chromium): klikanie, wypełnianie, nawigacja.
 * webServer buduje i uruchamia produkcyjną wersję z atrapą env Supabase, żeby
 * publiczne strony renderowały się bez skonfigurowanej bazy.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // środowisko z własnym Chromium (np. kontener w chmurze): PW_CHROMIUM_PATH=/ścieżka/do/chrome
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://dummy.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key',
      // ciasteczko narzędzi podpisane kluczem testowym (działa tylko poza Vercelem)
      NARZEDZIA_TRYB_TESTOWY: '1',
    },
  },
});
