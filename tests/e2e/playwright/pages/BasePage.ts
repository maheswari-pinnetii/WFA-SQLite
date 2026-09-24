import { Page, expect } from '@playwright/test';
import { TEST_ENV } from '../config/test-env.js';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    try {
      await this.page.addInitScript(() => {
        try { localStorage.setItem('has_completed_onboarding', 'true'); } catch (_) {}
      });
    } catch (_) {}
    await this.page.goto(path);
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async expectUrlToMatch(pattern: RegExp | string) {
    await expect(this.page).toHaveURL(pattern, { timeout: TEST_ENV.TIMEOUTS.NAVIGATION });
  }

  async expectTitleToContain(text: string | RegExp) {
    await expect(this.page).toHaveTitle(text, { timeout: TEST_ENV.TIMEOUTS.EXPECT });
  }

  async toggleTheme() {
    const themeBtn = this.page.locator('button[aria-label*="theme" i], button[title*="theme" i], button:has(.lucide-sun), button:has(.lucide-moon)').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
    }
  }
}
