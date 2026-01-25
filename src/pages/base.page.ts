import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger.utils';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly customWait: number = Number(process.env.ELEMENT_WAIT) || 5000;

  constructor(page: Page) {
    this.page = page;
  }

  public getPage(): Page {
    return this.page;
  }

  //Wait for element to be visible and click on it.
  protected async clickElement(locator: Locator) {
    try {
      await locator.waitFor({ state: 'visible', timeout: this.customWait });
      await locator.click({ timeout: this.customWait });
      Logger.info(`Clicked on locator '${locator}'`);
    } catch (e) {
      Logger.error(`Failed to click on ${locator}`);
      throw e;
    }
  }

  //Clears input field and type in value.
  protected async typeInElement(locator: Locator, value: string) {
    Logger.info(`Clear the text field '${locator}' before typing in value`);
    try {
      await locator.waitFor({ state: 'visible', timeout: this.customWait });
      await locator.focus();
      await locator.clear();
      await locator.fill(value);
      Logger.info(`Typed in value in locator '${locator}'`);
    } catch (e) {
      Logger.error(`Error while clearing and filling locator.: ${locator}`);
      throw e;
    }
  }

  //Verify that element is enabled.
  protected async isElementEnabled(
    locator: Locator,
    timeout: number = this.customWait,
  ): Promise<boolean> {
    Logger.info(`Validating if the element is enabled.: ${locator}`);
    try {
      await locator.waitFor({ state: 'attached', timeout });
      return await locator.isEnabled();
    } catch (e) {
      Logger.error(`Element is NOT enabled.: ${locator}. Error ${e}`);
      return false;
    }
  }

  //Verify that element is hidden.
  protected async isElementHidden(locator: Locator, timeout: number = this.customWait) {
    Logger.info(`Validating if the element is hidden.: ${locator}`);
    try {
      await locator.waitFor({ state: 'hidden', timeout });
      return true;
    } catch (e) {
      Logger.error(`Element is NOT hidden.: ${locator}. Error: ${e}`);
      return false;
    }
  }

  //Get the text content of the element.
  protected async getElementText(locator: Locator, trim: boolean = true): Promise<string> {
    Logger.info(`Getting the text of the element.: ${locator}`);
    try {
      await locator.waitFor({ state: 'attached', timeout: this.customWait });

      //Extract raw text
      const rawText = (await locator.innerText()) ?? '';

      //Clean the text
      const finalText = trim ? rawText.trim() : rawText;

      Logger.info(`Successfully retrieved text ${finalText}`);
      return finalText;
    } catch (e) {
      Logger.error(`Failed to retrive text from locator ${locator}. Error: ${e}`);
      return '';
    }
  }

  //Get the title of the page
  protected async getPageTitle(): Promise<string> {
    Logger.info(`Get the title of the page`);
    try {
      const title = (await this.page.title()).trim();
      Logger.info(`Successfully retrieved page title: ${title}`);
      return title;
    } catch (e) {
      Logger.error(`Failed to retrieve page title. Error: ${e}`);
      return '';
    }
  }

  //Verify if element is visible
  protected async isElementVisible(
    locator: Locator,
    timeout: number = this.customWait,
  ): Promise<boolean> {
    Logger.info(`Validating if the element is visible.: ${locator}`);
    try {
      await locator.waitFor({ state: 'visible', timeout });
      Logger.info(`Element is visible.: ${locator}`);
      return true;
    } catch (e) {
      Logger.error(`Element is NOT visible.: ${locator}. Error: ${e}`);
      return false;
    }
  }

  //Wrapper for expect(locator).toBeVisible() with custom timeout and logging.
  protected async expectTobeVisible(
    locator: Locator,
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? this.customWait;
    try {
      Logger.debug(`Expecting locator to be visible.: ${locator} with timeout: ${timeout} ms`);
      await expect(locator).toBeVisible({ timeout });
      Logger.debug(`Locator is visible as expected.: ${locator}`);
    } catch (error) {
      Logger.error(`Locator visibility check failed.: ${locator}. Error: ${error}`);
      throw error;
    }
  }

  //Wrapper for expect(locator).toBeAttached() with custom timeout and logging.
  protected async expectTobeAttached(
    locator: Locator,
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? this.customWait;
    try {
      Logger.debug(`Expecting locator to be attached.: ${locator} with timeout: ${timeout} ms`);
      await expect(locator).toBeAttached({ timeout });
      Logger.debug(`Locator is attached as expected.: ${locator}`);
    } catch (error) {
      Logger.error(`Locator attachment check failed.: ${locator}. Error: ${error}`);
      throw error;
    }
  }
}
