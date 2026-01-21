import { Logger } from '@/utils/logger.utils';
import { test, expect } from '../../fixtures/app.fixtures';
import createUserData from '../../testdata/ui/create.user.json';

test.beforeEach(async ({}, testInfo) => {
  // Any setup steps before each test can be added here
  Logger.info(`Starting a test: === ${testInfo.title} ===`);
});

test.afterEach(async ({}, testInfo) => {
  // Any teardown steps after each test can be added here
  Logger.info(`Finished a test: === ${testInfo.title} ===`);
});

test(`Verify new user creation.`, async ({ dashboardPage, pimPage }) => {
  const userData = createUserData[0];

  await test.step(`Verify dashboard page is loaded after login`, async () => {
    expect(await dashboardPage.expectedPageHeader(userData.landingPage)).toBe(true);
  });

  await test.step(`Click on 'PIM' menu and verify PIM page is loaded`, async () => {
    await dashboardPage.clickOnSubMenu(userData.subMenu);
    expect(await pimPage.expectedPageHeader(userData.subMenuHeader)).toBe(true);
  });

  await test.step(`Pre-condition: Ensure user does not already exist`, async () => {
    await pimPage.ensureUserIsDeleted(
      userData.firstName,
      userData.lastName,
      userData.pimSubOptionsEmpList,
      0,
      1,
    );
  });

  await test.step(`Create new user '${userData.firstName} ${userData.lastName}'`, async () => {
    await pimPage.createNewUser(userData.firstName, userData.lastName, userData.pimSubOptionEmpAdd);
  });

  await test.step(`Verify that the new user '${userData.firstName} ${userData.lastName}' is created successfully`, async () => {
    const isUserPresent = await pimPage.searchEmpByName(
      userData.firstName,
      userData.lastName,
      userData.pimSubOptionsEmpList,
    );
    expect(
      isUserPresent,
      `User '${userData.firstName} ${userData.lastName}' should be visible in the list. `,
    ).toBe(true);
  });
});
