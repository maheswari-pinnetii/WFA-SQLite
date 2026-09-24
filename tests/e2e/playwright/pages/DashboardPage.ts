import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_ENV } from '../config/test-env.js';

export class DashboardPage extends BasePage {
  readonly header: Locator;
  readonly notificationsButton: Locator;
  readonly notificationsDropdown: Locator;
  readonly unreadBadge: Locator;
  readonly profileMenu: Locator;
  readonly dashboardTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header');
    this.notificationsButton = page.locator('button[aria-label*="notification" i], button[title*="notification" i]');
    this.notificationsDropdown = page.locator('[role="menu"], div:has-text("Notifications")').filter({ hasText: /Notifications|unread/i });
    this.unreadBadge = page.locator('span:has-text("3"), span.rounded-full');
    this.profileMenu = page.locator('button:has-text("Stackly"), [aria-label*="user" i]');
    this.dashboardTitle = page.locator('h1, h2').first();
  }

  async dismissModals() {
    try {
      const modalClose = this.page.locator('button:has-text("Skip Tour"), button[aria-label="Close Tour"], button:has-text("Skip")').first();
      if (await modalClose.isVisible({ timeout: 1500 })) {
        await modalClose.click();
      }
    } catch (_) {}
  }

  async gotoDashboard() {
    await this.page.addInitScript(() => {
      localStorage.setItem('has_completed_onboarding', 'true');
    });
    await this.goto(TEST_ENV.ROUTES.EMPLOYEE_DASHBOARD);
    await this.waitForPageLoaded();
    await this.dismissModals();
  }

  async expectDashboardLoaded() {
    await this.expectUrlToMatch(/.*dashboard/);
    await expect(this.header).toBeVisible({ timeout: TEST_ENV.TIMEOUTS.EXPECT });
    await this.dismissModals();
  }

  async toggleNotifications() {
    await this.dismissModals();
    await expect(this.notificationsButton.first()).toBeVisible({ timeout: TEST_ENV.TIMEOUTS.EXPECT });
    await this.notificationsButton.first().click();
  }

  async expectNotificationsOpen() {
    await expect(this.notificationsDropdown.first()).toBeVisible({ timeout: TEST_ENV.TIMEOUTS.EXPECT });
  }
}
