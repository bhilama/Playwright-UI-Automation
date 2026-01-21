import { Logger } from '@/utils/logger.utils';
import { BasePage } from './base.page';
import { Page, expect, Locator } from '@playwright/test';

export class PimPage extends BasePage {
  private readonly header: Locator;
  private readonly employeeNameTextBox: Locator;
  private readonly searchButton: Locator;
  private readonly empRecordRow: Locator;
  private readonly deleteConfirmPopup: Locator;
  private readonly deleteYesButton: Locator;
  private readonly empFirstNameTextBox: Locator;
  private readonly empLastNameTextBox: Locator;
  private readonly saveEmpButton: Locator;
  private readonly saveLoadingSpinner: Locator;
  private readonly empListTable: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', { name: 'PIM' });
    this.employeeNameTextBox = page.locator(
      `xpath=//div[@class = 'oxd-table-filter-area']/form/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/input`,
    );
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.empRecordRow = page
      .locator('.orangehrm-container')
      .locator('.oxd-table-body')
      .locator('.oxd-table-card');
    this.empListTable = page.locator('.orangehrm-container').locator('.oxd-table-body');
    this.deleteConfirmPopup = page.getByText(`Are you Sure?`);
    this.deleteYesButton = page.getByRole('button', { name: /yes, \s*delete/i });
    this.empFirstNameTextBox = page.getByRole('textbox', { name: 'First Name' });
    this.empLastNameTextBox = page.getByRole('textbox', { name: 'Last Name' });
    this.saveEmpButton = page.getByRole('button', { name: 'Save' });
    this.saveLoadingSpinner = page.locator(`.oxd-loading-spinner`);
  }

  //Dynamic Locators:
  public getRowEditDeleteButton(rowNum: number, actionPosition: number): Locator {
    return this.page
      .locator(`.orangehrm-container`)
      .locator('.oxd-table-body')
      .locator('.oxd-table-card')
      .nth(rowNum)
      .locator('.oxd-table-cell-actions')
      .locator('button')
      .nth(actionPosition);
  }

  //Page Specific Methods:
  public getPimSubMenuLink(subMenuText: string): Locator {
    return this.page.getByRole('link', { name: subMenuText, exact: true });
  }

  // Verify expected page header is displayed
  public async expectedPageHeader(pageHeader: string): Promise<boolean> {
    const actualHeader = await this.getElementText(this.header);
    return actualHeader === pageHeader;
  }

  //Search for employee by name and validate that only one record is returned.
  public async searchEmpByName(
    firstName: string,
    lastName: string,
    pimSubMenu: string,
  ): Promise<boolean> {
    const fullNmae = `${firstName} ${lastName}`;
    Logger.info(`Navigating to PIM Sub Menu: ${pimSubMenu}`);
    const empListLink = this.getPimSubMenuLink(pimSubMenu);

    await this.clickElement(empListLink);
    await this.typeInElement(this.employeeNameTextBox, fullNmae);
    await this.clickElement(this.searchButton);
    Logger.info(`Searching for employee by name: ${fullNmae}`);
    Logger.info(`Waiting for search results to load after clicking on Search button.`);
    await expect(this.empListTable).toBeAttached({ timeout: this.customWait });
    const rowCount = await this.getTableRowCount(this.empRecordRow);
    Logger.info(`Number of records found for employee '${fullNmae}': ${rowCount}`);

    if (rowCount === 1) {
      Logger.info(`Employee '${fullNmae}' found in the search results.`);
      return true;
    } else {
      Logger.info(`Employee '${fullNmae}' NOT found in the search results.`);
      return false;
    }
  }

  //Get table row count.
  public async getTableRowCount(rowLocator: Locator, maxRetries: number = 3): Promise<number> {
    for (let i = 0; i < maxRetries; i++) {
      const rowCount = await rowLocator.count();
      if (rowCount > 0) {
        Logger.info(`Total number of rows present in the table are: ${rowCount}`);
        return rowCount;
      }

      Logger.info(`Retrying to get table row count. Attempt ${i + 1} of ${maxRetries}`);
    }
    return 0;
  }

  //Delete table row
  public async deleteTableRow(rowNumber: number, deleteActionPosition: number): Promise<void> {
    Logger.info(`Initiating delete action for the row.`);

    const deleteButton = this.getRowEditDeleteButton(rowNumber, deleteActionPosition);

    try {
      await this.clickElement(deleteButton);

      Logger.info(`Waiting for delete confirmation popup to be visible.`);
      await expect(this.deleteConfirmPopup).toBeVisible({ timeout: this.customWait });

      Logger.info(`Clicking on 'Yes, Delete' button to confirm deletion.`);
      await this.clickElement(this.deleteYesButton);

      await this.page.waitForLoadState(`networkidle`);
      Logger.info(`Waiting for delete confirmation popup to be hidden.`);
      await expect(this.deleteConfirmPopup).toBeHidden({ timeout: this.customWait });
      Logger.info(`Row deleted successfully.`);
    } catch (e) {
      Logger.error(`Error while deleting the row. Error: ${e}`);
      throw e;
    }
  }

  //Create new User.
  public async createNewUser(
    firstName: string,
    lastName: string,
    pimSubMenu: string,
  ): Promise<void> {
    Logger.info(`Navigating to PIM Sub Menu: ${pimSubMenu}`);
    const addEmpLink = this.getPimSubMenuLink(pimSubMenu);

    Logger.info(`Add user into the system.`);
    await this.clickElement(addEmpLink);

    Logger.info(`Entering First and last name fo the user.`);
    await this.typeInElement(this.empFirstNameTextBox, firstName);
    await this.typeInElement(this.empLastNameTextBox, lastName);

    Logger.info(`Clicking on Save button to create new user.`);
    await this.clickElement(this.saveEmpButton);

    await this.isElementVisible(this.saveLoadingSpinner, this.customWait);
  }

  //Delete user if already exists for clean state.
  public async ensureUserIsDeleted(
    firstName: string,
    lastName: string,
    pimSubMenu: string,
    rowNum: number,
    actionPosition: number,
  ): Promise<void> {
    const isUserPresent = await this.searchEmpByName(firstName, lastName, pimSubMenu);

    if (isUserPresent) {
      Logger.info(
        `User '${firstName} ${lastName}' already exists. Deleting the user for clean state.`,
      );
      await this.deleteTableRow(rowNum, actionPosition); //Assuming first row is the user to be deleted
    } else {
      Logger.info(`User '${firstName} ${lastName}' does not exist. Skipping the deletion.`);
    }
  }
}
