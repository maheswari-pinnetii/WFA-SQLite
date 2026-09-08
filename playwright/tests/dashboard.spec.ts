import { test, expect } from '../fixtures/test.fixture.js';
import { TEST_ENV } from '../config/test-env.js';

test.describe('Employee Dashboard E2E Tests', () => {
  test('should render employee dashboard layout cleanly without step badges', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.loginAs(TEST_ENV.USERS.EMPLOYEE.email);
    await dashboardPage.expectDashboardLoaded();

    // Verify "Step 01", "Step 02" badges are not present on the dashboard
    const stepBadge = page.locator('text=Step 01');
    await expect(stepBadge).toHaveCount(0);

    // Verify "Quick Step Jump" bar is not present
    const quickJump = page.locator('text=Quick Step Jump');
    await expect(quickJump).toHaveCount(0);
  });

  test('should have notifications accessible directly in the header', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAs(TEST_ENV.USERS.EMPLOYEE.email);
    await dashboardPage.expectDashboardLoaded();

    // Notification bell icon is in the header
    await expect(dashboardPage.notificationsButton.first()).toBeVisible();

    // Click to toggle notifications dropdown
    await dashboardPage.toggleNotifications();
    await dashboardPage.expectNotificationsOpen();
  });
});
