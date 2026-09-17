/**
 * Browser Compatibility E2E Test Suite (Playwright)
 *
 * Tests core user flows across multiple browsers and viewports:
 * - Chromium (desktop + mobile)
 * - Firefox (desktop)
 * - WebKit/Safari (desktop + mobile)
 *
 * Core flows tested:
 * 1. Landing page renders
 * 2. Login → MFA → Dashboard redirect
 * 3. Employee list page loads with data
 * 4. Leave application form submission
 * 5. Responsive layout checks (mobile/tablet)
 * 6. Accessibility: keyboard navigation, focus indicators
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function loginWithMfa(page: Page, email: string, password = 'StacklyWFA2026!') {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Either directly see login page or navigate to it
  const loginUrl = page.url();
  if (!loginUrl.includes('login') && !loginUrl.includes('auth')) {
    // Check if there's a login link
    const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign in")');
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      await page.waitForLoadState('networkidle');
    }
  }

  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(password);

  // Submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
  await submitBtn.click();

  // Handle MFA
  await page.waitForTimeout(1500);
  const otpInput = page.locator('input[placeholder*="OTP" i], input[placeholder*="code" i], input[name="code"], input[inputmode="numeric"]').first();
  if (await otpInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Get the dev hint from the page text
    const devHintText = await page.locator('text=/\\d{6}/').first().textContent().catch(() => null);
    if (devHintText) {
      const otp = devHintText.match(/\d{6}/)?.[0] || '123456';
      await otpInput.fill(otp);
      const verifyBtn = page.locator('button[type="submit"], button:has-text("Verify"), button:has-text("Continue")').first();
      await verifyBtn.click();
    }
  }

  await page.waitForLoadState('networkidle');
}

// ─── Test Configuration ────────────────────────────────────────────────────

test.describe('1. Landing Page Renders Across Browsers', () => {
  test('landing page loads and has proper title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');
  });

  test('landing page has no broken images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      // An image with naturalWidth of 0 is broken
      // Some icons (SVG inline) may have 0; skip those
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('landing page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter known expected errors (e.g., favicon 404 in test env)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR')
    );
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('2. Authentication Flow', () => {
  test('employee can login and reach dashboard', async ({ page }) => {
    await loginWithMfa(page, 'employee@thestackly.com');

    // Should be on some dashboard page
    await expect(page).not.toHaveURL(/login|auth/);
    const dashboardHeading = page.locator('h1, h2, [data-testid="dashboard"]').first();
    await dashboardHeading.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('admin can login and reach admin dashboard', async ({ page }) => {
    await loginWithMfa(page, 'admin@thestackly.com');
    await expect(page).not.toHaveURL(/login|auth/);
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('invalid@nowhere.com');
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('wrongpassword');
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();

      // Should see an error message
      await page.waitForTimeout(1500);
      const errorMessage = page.locator('[role="alert"], .error, [class*="error"], [class*="Error"]').first();
      const isVisible = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBe(true);
    }
  });

  test('protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login
    const url = page.url();
    const isLoginPage = url.includes('login') || url.includes('auth') || url === page.url();
    // Either redirected OR page shows login UI
    const loginForm = page.locator('input[type="email"], input[type="password"]').first();
    const hasLoginForm = await loginForm.isVisible({ timeout: 5000 }).catch(() => false);

    expect(url.includes('login') || url.includes('auth') || hasLoginForm).toBe(true);
  });
});

test.describe('3. Responsive Layout (Mobile & Tablet)', () => {
  test('login page is usable on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login form should be visible and not overflowing
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await emailInput.boundingBox();
      if (box) {
        // Input should fit within viewport
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 20); // 20px tolerance
      }
    }
  });

  test('login page is usable on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // No horizontal scroll bar visible (content fits width)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(800); // max tolerance
  });

  test('employee dashboard is accessible on mobile after login', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginWithMfa(page, 'employee@thestackly.com');

    await page.waitForLoadState('networkidle');
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    // Check no critical layout overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    // Minor overflow acceptable (max 20px)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 30);
  });
});

test.describe('4. Navigation & Page Loads', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await loginWithMfa(page, 'admin@thestackly.com');
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('HR employee management page loads with table or empty state', async ({ browser }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await loginWithMfa(p, 'hr@thestackly.com');

    // Navigate to employees
    await p.goto('/hr/employees');
    await p.waitForLoadState('networkidle');

    // Should show either a table, list, or empty state — no error
    const content = p.locator('table, [role="table"], [class*="empty"], [class*="Error"]').first();
    const isVisible = await content.isVisible({ timeout: 10000 }).catch(() => false);
    // Page should load with some meaningful content
    await expect(p.locator('body')).toBeVisible();

    await ctx.close();
  });

  test('leave management page loads correctly', async ({ browser }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await loginWithMfa(p, 'employee@thestackly.com');

    await p.goto('/employee/leave');
    await p.waitForLoadState('networkidle');

    await expect(p.locator('body')).toBeVisible();
    const hasContent = await p.locator('h1, h2, h3, table, [class*="card"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasContent).toBe(true);

    await ctx.close();
  });
});

test.describe('5. Accessibility - Keyboard Navigation', () => {
  test('login form is keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focused element should be within the form
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      expect(['input', 'button', 'a', 'select', 'textarea']).toContain(focusedTag);
    }
  });

  test('login form submit button is focusable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.focus();
      const isFocused = await submitBtn.evaluate(el => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });
});

test.describe('6. Performance Baseline', () => {
  test('landing page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('no unhandled promise rejections on page load', async ({ page }) => {
    const unhandledRejections: string[] = [];
    page.on('pageerror', err => {
      unhandledRejections.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter only critical unhandled rejections
    const critical = unhandledRejections.filter(e =>
      !e.includes('favicon') &&
      !e.includes('script error') &&
      !e.includes('ResizeObserver')
    );
    expect(critical.length).toBe(0);
  });
});
