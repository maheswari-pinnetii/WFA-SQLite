import { test, expect } from '@playwright/test';

const ROLES = [
  { role: 'EMPLOYEE', email: 'employee@thestackly.com' },
  { role: 'MANAGER', email: 'manager@thestackly.com' },
  { role: 'HR', email: 'hr@thestackly.com' },
  { role: 'ADMIN', email: 'admin@thestackly.com' }
];

for (const { role, email } of ROLES) {
  test(`Role Access - ${role}`, async ({ page }) => {
    // Navigate to login
    await page.goto('/');
    
    // Perform login
    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"]'); // Click Next
    await page.fill('input[type="password"]', 'StacklyWFA2026!');
    await page.click('button[type="submit"]'); // Click Sign in

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify role-specific UI elements
    await expect(page.locator('nav').filter({ hasText: 'Dashboard' }).first()).toBeVisible();
  });
}
