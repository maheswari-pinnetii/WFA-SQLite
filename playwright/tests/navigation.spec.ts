import { test, expect } from '../fixtures/test.fixture.js';

test.describe('Navigation & Route Guards E2E Tests', () => {
  test('should redirect unauthenticated users attempting to access protected dashboard', async ({ page }) => {
    // Attempt to access protected dashboard directly without auth
    await page.goto('http://localhost:3000/employee/dashboard');

    // Should redirect back to /login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('should load public landing page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Stackly WFA|Workforce/i);
  });
});
