import {test as base} from '@playwright/test';
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

type authFixture = {
    authPage: LoginPage;
    dashboardPage: DashboardPage;
}

export const test = base.extend<authFixture>({
  // Fixture for a "clean" login page (No login performed)
  authPage: async ({page}, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({page}, use) => {
    const loginPage = new LoginPage(page);
    const homePage = new DashboardPage(page);

    await page.goto("/");
    await loginPage.login(process.env.appUserName!, process.env.appPassword!);
    await use(homePage);
  }
});

export {expect} from '@playwright/test';