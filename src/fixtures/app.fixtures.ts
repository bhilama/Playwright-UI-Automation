import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { PimPage } from '../pages/pim.page';

type authFixture = {
  authPage: LoginPage;
  dashboardPage: DashboardPage;
  pimPage: PimPage;
};

export const test = base.extend<authFixture>({
  // Fixture for a "clean" login page (No login performed)
  authPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const homePage = new DashboardPage(page);

    await page.goto('/');
    await loginPage.login(process.env.APP_USER_NAME!, process.env.APP_PASSWORD!);
    await use(homePage);
  },

  pimPage: async ({ dashboardPage }, use) => {
    const pimSubMenuPage = new PimPage(dashboardPage.getPage());
    await use(pimSubMenuPage);
  },
});

export { expect } from '@playwright/test';
