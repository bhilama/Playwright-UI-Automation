import { test, expect } from '../fixtures/app.fixtures';

test(`Verify user login.`, async ({dashboardPage}) =>{
  await expect(dashboardPage.dashboardHeader).toBeVisible();
})