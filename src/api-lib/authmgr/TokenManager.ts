import { Logger } from '@/utils/logger.utils';
import { APIRequestContext } from '@playwright/test';

export class TokenManager {
  private static readonly GRANT_TYPE = 'client_credentials';
  private static readonly TOKEN_KEY = 'access_token';

  //This function returns Bearer token.
  static async getBearerToken(request: APIRequestContext): Promise<string> {
    Logger.info(`Requesting Bearer token from Auth server using client credentials.`);

    //Validate required environment variables are available.
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const authUrl = process.env.API_AUTH_URL;

    if (!clientId || !clientSecret || !authUrl) {
      const errorMsg = `CLIENT_ID, CLIENT_SECRET, or API_AUTH_URL environment variables are not set. Please set them before running the tests.`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    //Encode credentials in Base64 format.
    const credentials = `${clientId}:${clientSecret}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
    Logger.info(`Credentials encoded in Base64 format.`);

    try {
      Logger.info(`Sending POST request to Auth URL: ${authUrl} for token.`);
      const response = await request.post(authUrl, {
        headers: {
          Authorization: authHeader, //Sets authorization header to Basic.
          'Content-Type': 'application/x-www-form-urlencoded', //Sets content type for form data.
        },
        form: {
          grant_type: this.GRANT_TYPE,
        },
        timeout: 10000, //10 seconds timeout for the request.
      });

      //Check if response is successful.
      if (!response.ok()) {
        const statusText = response.statusText() || 'Unknown Error';
        const errorMsg = `Failed to get token: ${statusText} (Status Code: ${response.status()})`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      //Parse response body.
      const respBody = await response.json();
      Logger.debug(`Token response received and parsed.`);

      //Validate token presence in response.
      const token = respBody[this.TOKEN_KEY];
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        const errorMsg = `Access token is missing or invalid in the response.`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      Logger.info(`Bearer token retrieved successfully.`);
      return token;
    } catch (error) {
      const errorMsg = `Error occurred while retrieving Bearer token: ${(error as Error).message}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
}
