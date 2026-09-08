import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_ENV } from '../config/test-env.js';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly passkeyButton: Locator;
  readonly errorMessage: Locator;
  readonly cardHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#login-email-input');
    this.passwordInput = page.locator('#password-input');
    this.submitButton = page.locator('#email-login-submit-btn');
    this.passkeyButton = page.locator('button:has-text("Sign in with a passkey")');
    this.errorMessage = page.locator('.auth-alert-error, [role="alert"]');
    this.cardHeading = page.locator('.card-heading');
  }

  async gotoLogin() {
    await this.goto('http://localhost:3000/login');
    await this.waitForPageLoaded();
  }

  async enterEmail(email: string) {
    await expect(this.emailInput).toBeVisible({ timeout: TEST_ENV.TIMEOUTS.EXPECT });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async clickNext() {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
  }

  async enterPassword(password: string = 'StacklyWFA2026!') {
    await expect(this.passwordInput).toBeVisible({ timeout: TEST_ENV.TIMEOUTS.EXPECT });
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
    try {
      const directBtn = this.page.locator('button:has-text("Sign in directly to Dashboard")');
      if (await directBtn.isVisible({ timeout: 2000 })) {
        await directBtn.click();
      }
    } catch (_) {}
  }

  async loginAs(
    email: string = TEST_ENV.USERS.EMPLOYEE.email,
    password: string = 'StacklyWFA2026!'
  ) {
    await this.gotoLogin();
    await this.enterEmail(email);
    await this.clickNext();
    await this.enterPassword(password);
    await this.clickSignIn();
    await this.expectUrlToMatch(/.*dashboard/);
  }
}
