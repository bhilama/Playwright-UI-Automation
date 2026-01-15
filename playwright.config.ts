import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/*Default environment is DEV if not provided from the terminal*/
const ENV = process.env.NODE_ENV || 'DEV';
const envPath = path.resolve(__dirname, 'src/environments', `${ENV}.env`);

/*Throw error if environment file path is incorrect.*/
if (!fs.existsSync(envPath)) {
  throw new Error(`Environment file is NOT present at: ${envPath}`);
}

/*Load environment file*/
dotenv.config({ path: envPath });
/*
//Read token from the auth file.
const getSavedToken = () => {
  try{
    const auth = JSON.parse(fs.readFileSync('.auth/user.json', 'utf-8'));
    return auth.origins[0].localStorage[0].value;
  }catch (e) {
    return '';
  }
};
*/

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/tests',
  /*Timeouts*/
  timeout: 30 * 1000, //Max timeout for test
  expect: {
    timeout: 10000, //Max timeout for assertions like expect().toBeVisible()
  },

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    //Get base URL from the loaded environment file
    baseURL: process.env.BASE_URL,

    actionTimeout: 10000, //10 seconds per click or type action

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testDir: './src/tests/UI',
      use: { ...devices['Desktop Chrome'] },
    },

    /* {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },*/

    {
      name: 'webkit',
      testDir: './src/tests/UI',
      use: { ...devices['Desktop Safari'] },
    },

    { name: 'setup', testDir: './src/lib/utils', testMatch: /oauth.setup.ts/ },

    {
      name: 'api-tests',
      testDir: './src/tests/API',
      dependencies: ['setup'],
      use: {
        baseURL: process.env.API_BASE_URL,
        storageState: '.auth/user.json',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
