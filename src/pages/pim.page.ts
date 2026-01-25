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

  public getPimSubMenuLink(subMenuText: string): Locator {
    if (!subMenuText || typeof subMenuText !== 'string' || subMenuText.trim().length === 0) {
      const errorMsg = `Invalid subMenuText provided.: '${subMenuText}'`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    Logger.info(`Getting PIM Sub Menu link for: ${subMenuText}`);
    const locator = this.page.getByRole('link', { name: subMenuText, exact: true });

    Logger.info(`Locator for PIM Sub Menu '${subMenuText}' created successfully.`);
    return locator;
  }

  //Page Specific Methods:

  // Verify expected page header is displayed
  public async expectedPageHeader(pageHeader: string): Promise<boolean> {
    if (!pageHeader || typeof pageHeader !== 'string' || pageHeader.trim().length === 0) {
      const errorMsg = `Invalid pageHeader provided.: '${pageHeader}'`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      Logger.info(`Waiting for page header to be visible.: ${pageHeader}`);
      await this.expectTobeVisible(this.header);

      const actualHeader = await this.getElementText(this.header);
      const trimmedActualHeader = actualHeader?.trim() || '';
      const trimmedExpectedHeader = pageHeader.trim();

      Logger.info(
        `Actual page header: '${trimmedActualHeader}', Expected page header: '${trimmedExpectedHeader}'`,
      );

      const isMatch = trimmedActualHeader === trimmedExpectedHeader;

      if (isMatch) {
        Logger.info(`Page header matches the expected value.`);
      } else {
        Logger.warn(`Page header does NOT match the expected value.`);
      }

      return isMatch;
    } catch (error) {
      const errorMsg = `Error while verifying page header. Error: ${error}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  //Searches for an employee by name in the PIM module and validates if exactly one record is returned.

  public async searchEmpByName(
    firstName: string,
    lastName: string,
    pimSubMenu: string,
  ): Promise<boolean> {
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      const errorMsg = `Invalid firstName provided: ${firstName}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      const errorMsg = `Invalid lastName provided: ${lastName}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!pimSubMenu || typeof pimSubMenu !== 'string' || pimSubMenu.trim().length === 0) {
      const errorMsg = `Invalid pimSubMenu provided: ${pimSubMenu}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      //Navigate to PIM Sub Menu.
      Logger.info(`Navigating to PIM Sub Menu: ${pimSubMenu}`);
      const empListLink = this.getPimSubMenuLink(pimSubMenu);
      await this.expectTobeVisible(empListLink);
      await this.clickElement(empListLink);
      Logger.info(`Navigated to PIM Sub Menu: ${pimSubMenu} successfully.`);

      //Enter employee name in search box.
      Logger.info(`Entering employee name in search box: ${fullName}`);
      await this.expectTobeVisible(this.employeeNameTextBox);
      await this.typeInElement(this.employeeNameTextBox, fullName);
      Logger.info(`Employee name entered in search box successfully.`);

      //Click on search button.
      Logger.info(`Clicking on Search button to search for employee.`);
      await this.expectTobeVisible(this.searchButton);
      await this.clickElement(this.searchButton);
      Logger.info(`Search button clicked successfully.`);

      //Wait for search results to load.
      Logger.info(`Waiting for search results to load after clicking on Search button.`);
      await this.expectTobeAttached(this.empListTable);
      Logger.info(`Employe list table loaded successfully.`);

      //Get the row count from the search results.
      const rowCount = await this.getTableRowCount(this.empRecordRow);
      Logger.info(`Number of records found for employee '${fullName}': ${rowCount}`);

      const isFound = rowCount === 1;

      if (isFound) {
        Logger.info(`Employee '${fullName}' found in the search results.`);
      } else {
        Logger.info(`Employee '${fullName}' NOT found in the search results.`);
      }

      return isFound;
    } catch (error) {
      const errorMsg = `Error during employee search for '${fullName}': ${(error as Error).message}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
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
      await this.expectTobeVisible(this.deleteConfirmPopup);

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
