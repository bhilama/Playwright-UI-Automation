import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { PimPage } from '../pages/pim.page';
import { Logger } from '@/utils/logger.utils';

type authFixture = {
  authPage: LoginPage;
  dashboardPage: DashboardPage;
  pimPage: PimPage;
};

const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_RETRY_DELAY_MS = 1000;

//Helper to sleep for specified milliseconds.
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

//Attempt login with retry logic.
async function performLoginWithRetries(
  loginPage: LoginPage,
  dashboardPage: DashboardPage,
  userName: string,
  password: string,
): Promise<boolean> {
  for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt++) {
    try {
      Logger.info(`Login attempt ${attempt} for user '${userName}'`);
      await loginPage.getPage().goto('/');
      await loginPage.login(userName, password);

      //Verify header of the page.
      const headerOk = await dashboardPage.expectedPageHeader('Dashboard');
      if (headerOk) {
        Logger.info(`Login successful for user '${userName}. Dashboard verified.'`);
        return true;
      } else {
        Logger.warn(`Login completed but Dashboard header mismatch.`);
      }
    } catch (error) {
      Logger.warn(`Login attempt ${attempt} failed with error: ${error}`);
    }

    if (attempt < LOGIN_MAX_ATTEMPTS) {
      Logger.info(`Waiting for ${LOGIN_RETRY_DELAY_MS} ms before next login attempt.`);
      await delay(LOGIN_RETRY_DELAY_MS);
    }
  }

  return false;
}

//Fixure definition
export const test = base.extend<authFixture>({
  // Fixture for a "clean" login page (No login performed)
  authPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  //Dashboard page fixture with login performed for every test.
  dashboardPage: async ({ page }, use, testInfo) => {
    const userName = process.env.APP_USER_NAME;
    const password = process.env.APP_USER_PASSWORD;

    if (!userName || !password) {
      const errorMsg = `APP_USER_NAME or APP_USER_PASSWORD environment variables are not set. Cannot perform login.`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    //Verify if already logged in by checking Dashboard header.
    try {
      await page.goto('/');
      const alreadyLoggedIn = await dashboardPage.expectedPageHeader('Dashboard');
      if (alreadyLoggedIn) {
        Logger.info(`Already logged in. Reusing existing session for user '${userName}'.`);
        await use(dashboardPage);
        return;
      }
    } catch (error) {
      Logger.debug(
        `Not logged in yet. Proceeding with login for user '${userName}'. ${(error as Error).message}`,
      );
    }

    //Perform login
    const loggedIn = await performLoginWithRetries(loginPage, dashboardPage, userName, password);

    if (!loggedIn) {
      const errorMsg = `Failed to login after ${LOGIN_MAX_ATTEMPTS} attempts for user '${userName}'.`;
      Logger.error(errorMsg);

      try {
        await page.screenshot({ path: `test-artifacts/login-failure-${Date.now()}.png` });
        await testInfo.attach('page-screenshot-on-login-failure', {
          body: await page.screenshot(),
          contentType: 'image/png',
        });
      } catch (err) {
        Logger.warn(`Failed to capture screenshot on login failure. Error: ${err}`);
      }
      throw new Error(errorMsg);
    }

    //Provide dashboard page to the test.
    await use(dashboardPage);
  },

  //PIM Page fixture
  pimPage: async ({ dashboardPage }, use) => {
    const pimSubMenuPage = new PimPage(dashboardPage.getPage());
    await use(pimSubMenuPage);
  },
});

export { expect } from '@playwright/test';
