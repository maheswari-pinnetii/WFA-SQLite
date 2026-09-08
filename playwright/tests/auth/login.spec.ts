import { test, expect } from '../../fixtures/baseTest.js';
import { TEST_ENV } from '../../config/test-env.js';

test.describe('Authentication E2E Flow', () => {
  test('should load login screen and render corporate email input', async ({ loginPage }) => {
    await loginPage.gotoLogin();
    await loginPage.expectTitleToContain(/Stackly WFA|Workforce/i);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should reject non-corporate email domain and show validation error', async ({ loginPage }) => {
    await loginPage.gotoLogin();
    await loginPage.enterEmail('outsider@gmail.com');
    await loginPage.clickNext();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/@thestackly\.com/i);
  });

  test('should advance to password step when entering valid corporate email', async ({ loginPage }) => {
    await loginPage.gotoLogin();
    await loginPage.enterEmail(TEST_ENV.USERS.ADMIN.email);
    await loginPage.clickNext();

    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.cardHeading).toContainText(/Enter your password/i);
  });

  test('should complete full login flow into Dashboard for all 5 enterprise roles', async ({ loginPage, dashboardPage }) => {
    // 1. ADMIN
    await loginPage.loginAs(TEST_ENV.USERS.ADMIN.email, 'StacklyWFA2026!');
    await dashboardPage.expectDashboardLoaded();
    await loginPage.page.context().clearCookies();
  });

  test('should login as HR and land on HR Dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAs(TEST_ENV.USERS.HR.email, 'StacklyWFA2026!');
    await dashboardPage.expectDashboardLoaded();
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    await loginPage.page.context().clearCookies();
  });

  test('should login as MANAGER and land on Manager Dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAs(TEST_ENV.USERS.MANAGER.email, 'StacklyWFA2026!');
    await dashboardPage.expectDashboardLoaded();
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    await loginPage.page.context().clearCookies();
  });

  test('should login as TEAM_LEAD and land on Team Lead Dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAs(TEST_ENV.USERS.TEAM_LEAD.email, 'StacklyWFA2026!');
    await dashboardPage.expectDashboardLoaded();
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    await loginPage.page.context().clearCookies();
  });

  test('should login as EMPLOYEE and land on Employee Dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAs(TEST_ENV.USERS.EMPLOYEE.email, 'StacklyWFA2026!');
    await dashboardPage.expectDashboardLoaded();
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
  });
});
