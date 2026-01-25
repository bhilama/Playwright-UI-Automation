/*
    Perform authentication once, save the resulting state (the token) to a file, 
    then reuse that state across all other tests to avoid logging in repeatedly
*/

import { test as setup } from '@playwright/test';
import { TokenManager } from './TokenManager';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../../utils/logger.utils';

//Declare required constants.
const AUTH_DIR = '.auth';
const AUTH_FILE = path.join(AUTH_DIR, 'user.json');
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; //1 second delay between retries.

//Following block runs before actual test suite runs through global setup in Playwright.config file
setup(`Authenticate with client credentials`, async ({ request }) => {
  Logger.info(`Starting authentication to get Bearer token.`);

  //Validate required environment variables are available.
  const reqEnvVars = ['API_BASE_URL', 'CLIENT_ID', 'CLIENT_SECRET', 'API_AUTH_URL'];
  for (const key of reqEnvVars) {
    if (!process.env[key]) {
      const errorMsg = `Environment variable ${key} is not set. Please set it before running the tests.`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  //Retry logic to get Bearer token.
  let token: string | null = null;
  let lastError: Error | null = null;

  for (let i = 1; i <= MAX_RETRY_ATTEMPTS; i++) {
    try {
      Logger.info(`Attempting to retrieve Bearer token, Attempt: ${i} / ${MAX_RETRY_ATTEMPTS}`);
      token = await TokenManager.getBearerToken(request);

      if (token) {
        Logger.info(`Successfully retrieved Bearer token.`);
        break;
      }
    } catch (error) {
      lastError = error as Error;
      Logger.error(`Token retrieval attempt ${i} failed. Error: ${lastError.message}`);

      if (i < MAX_RETRY_ATTEMPTS) {
        Logger.info(`Retrying after ${RETRY_DELAY_MS} ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  //Final check to see if token is retrieved.
  if (!token) {
    const errorMsg = `Failed to retrieve Bearer token after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message || 'Unknown error'}. Verify Client ID, Secret, and API endpoints.`;
    Logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  //Local storage of Auth token
  const authState = {
    origins: [
      {
        origin: process.env.API_BASE_URL!,
        localStorage: [{ name: 'accessToken', value: token }],
      },
    ],
  };

  //Verify if .auth dir exists if not create it
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      Logger.info(`Created authentication directory at ${AUTH_DIR}`);
    }
  } catch (error) {
    const errorMsg = `Failed to create authentication directory at ${AUTH_DIR}. Error: ${(error as Error).message}`;
    Logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  //Write auth state to file.
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2));
    Logger.info(`Authentication state saved successfully to ${AUTH_FILE}`);
  } catch (error) {
    const errorMsg = `Failed to write authentication state to file at ${AUTH_FILE}. Error: ${(error as Error).message}`;
    Logger.error(errorMsg);
    throw new Error(errorMsg);
  }
});
