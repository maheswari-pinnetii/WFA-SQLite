import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    actionTimeout: 15000,
    navigationTimeout: 20000,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // ── Default: Chromium only ──────────────────────────────────────────────────
    // Running all 3 browsers sequentially takes 12+ minutes, which causes
    // the Vite dev server to die mid-run (server crash → ERR_CONNECTION_REFUSED
    // for every test that starts after the crash).
    //
    // Chromium covers the full test suite in ~4 minutes and is the most
    // representative browser for React/Vite apps.
    //
    // To run cross-browser explicitly use:
    //   npx playwright test --project=firefox
    //   npx playwright test --project=webkit
    //   npx playwright test --project=chromium --project=firefox --project=webkit
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox and WebKit: opt-in only
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});

