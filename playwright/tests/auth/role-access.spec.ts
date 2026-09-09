import { test, expect } from '@playwright/test';

const ROLES = [
  { role: 'EMPLOYEE', email: 'employee@thestackly.com' },
  { role: 'MANAGER', email: 'manager@thestackly.com' },
  { role: 'HR', email: 'hr@thestackly.com' },
  { role: 'FINANCE', email: 'finance@thestackly.com' },
  { role: 'ADMIN', email: 'admin@thestackly.com' }
];

for (const { role, email } of ROLES) {
  test(`Role Access - ${role}`, async ({ page }) => {
    // Navigate to login
    await page.goto('/');
    
    // Perform login
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify role-specific UI elements
    if (role === 'EMPLOYEE') {
      await expect(page.locator('text=My Schedule')).toBeVisible();
    } else if (role === 'MANAGER') {
      await expect(page.locator('text=Team Overview')).toBeVisible();
    } else if (role === 'HR') {
      await expect(page.locator('text=Employee Directory')).toBeVisible();
    } else if (role === 'ADMIN') {
      await expect(page.locator('text=System Settings')).toBeVisible();
    }
  });
}
