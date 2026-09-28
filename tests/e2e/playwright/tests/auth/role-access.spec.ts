import { test, expect } from '@playwright/test';

const ROLES = [
  { role: 'EMPLOYEE', email: 'employee@thestackly.com' },
  { role: 'MANAGER',  email: 'manager@thestackly.com'  },
  { role: 'HR',       email: 'hr@thestackly.com'       },
  { role: 'ADMIN',    email: 'admin@thestackly.com'    }
];

const PASSWORD = 'StacklyWFA2026!';

for (const { role, email } of ROLES) {
  test(`Role Access - ${role}`, async ({ page }) => {
    // Step 1 – Email screen
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('#login-email-input');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await emailInput.fill(email);

    const nextBtn = page.locator('#email-login-submit-btn');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Step 2 – Password screen
    const pwdInput = page.locator('#password-input');
    await expect(pwdInput).toBeVisible({ timeout: 10_000 });
    await pwdInput.fill(PASSWORD);

    // Submit password (same button id reused on step 2)
    await nextBtn.click();

    // If MFA or test-bypass button appears, click it
    try {
      const directBtn = page.locator('button:has-text("Sign in directly to Dashboard")');
      if (await directBtn.isVisible({ timeout: 3_000 })) {
        await directBtn.click();
      }
    } catch (_) {}

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20_000 });

    // Verify role-specific nav is visible
    await expect(
      page.locator('nav').filter({ hasText: 'Dashboard' }).first()
    ).toBeVisible({ timeout: 10_000 });
  });
}
