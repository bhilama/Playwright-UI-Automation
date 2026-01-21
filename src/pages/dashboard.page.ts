import { BasePage } from './base.page';
import { Page, Locator } from '@playwright/test';

export class DashboardPage extends BasePage {
  private readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', { name: 'Dashboard' });
  }

  //Dynamic Locators:
  getSubMenuLocator(subMenuText: string): Locator {
    return this.page.getByRole('link', { name: subMenuText, exact: true });
  }

  //Page Specific Methods:

  // Verify expected page header is displayed
  public async expectedPageHeader(pageHeader: string): Promise<boolean> {
    const actualHeader = await this.getElementText(this.header);
    return actualHeader === pageHeader;
  }

  //Click on required sub menu.
  public async clickOnSubMenu(subMenu: string): Promise<void> {
    const subMenuLocator = this.getSubMenuLocator(subMenu);
    await this.clickElement(subMenuLocator);
  }
}
