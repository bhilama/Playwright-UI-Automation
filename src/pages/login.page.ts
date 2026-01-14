import { BasePage } from './base.page';
import { Page, Locator, test } from '@playwright/test';

export class LoginPage extends BasePage {
  private readonly userNameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.userNameInput = page.locator("//input[@name = 'username']");
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.locator("//button[@type = 'submit']");
  }

  async login(userName: string, password: string) {
    await test.step(`Enter user name.`, async () => {
      await this.typeInElement(this.userNameInput, userName);
    });

    await test.step(`Enter password.`, async () => {
      await this.typeInElement(this.passwordInput, password);
    });

    await this.clickElement(this.loginButton);
  }
}
