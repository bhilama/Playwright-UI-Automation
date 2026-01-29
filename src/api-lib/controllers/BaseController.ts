import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../../utils/logger.utils';
import fs from 'fs';
import path from 'path';

//Type of stored token name and value
interface AuthItem {
  name: string;
  value: string;
}

export class BaseController {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  //Returns authorization header as Key-value pair for subsequent request.
  private getHeaders(): { [key: string]: string } {
    try {
      const authPath = path.resolve(process.cwd(), '.auth/user.json');

      //Read contents as raw text and convert back to JavaScript Object.
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf-8'));

      //Look for the tag with name accessToken and get its value
      const token = auth.origins[0].localStorage.find(
        (i: AuthItem) => i.name === 'accessToken',
      )?.value;

      //Required header object.
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      Logger.error(`BaseController could not read token:`, e);
      return {}; // Return empty; config defaults will still be used
    }
  }

  //Sends a POST request to the specified endpoint with the given payload.
  async post(endPoint: string, payload: object): Promise<APIResponse> {
    //Validate input
    if (!endPoint || typeof endPoint !== 'string' || endPoint.trim().length === 0) {
      const errorMsg = `Invalid endPoint provided for POST request: '${endPoint}'`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      const errorMsg = `Invalid payload provided for POST request: '${JSON.stringify(payload)}'`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    Logger.info(`Attempting POST to: ${endPoint} with payload: ${JSON.stringify(payload)}`);

    try {
      //Retrieve headers with token and send POST request.
      const headers = this.getHeaders();
      if (!headers || Object.keys(headers).length === 0) {
        Logger.warn(`No authorization headers found. Proceeding without headers.`);
      }

      const response = await this.request.post(endPoint, {
        data: payload,
        headers: headers,
        timeout: 30000, //30 seconds timeout
      });

      await this.logDetails(endPoint, 'POST', response);

      if (!response.ok()) {
        const errorMsg = `POST request to ${endPoint} failed with status: ${response.status()} ${response.statusText()}`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      return response;
    } catch (error) {
      const errorMsg = `Error during POST request to ${endPoint}: ${(error as Error).message}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /*
  //POST request.
  async post(endPoint: string, payload: object): Promise<APIResponse> {
    //Get complete URL for logging
    const fullUrlForLog = `${process.env.API_BASE_URL || ''}${endPoint}`;
    Logger.info(`Attempting POST to: ${fullUrlForLog}`);

    const response = await this.request.post(endPoint, {
      data: payload,
      headers: this.getHeaders(),
    });
    await this.logDetails(endPoint, 'POST', response);
    return response;
  }
  */

  //GET request.
  async get(endPoint: string): Promise<APIResponse> {
    //Get complete URL for logging
    const fullUrlForLog = `${process.env.API_BASE_URL || ''}${endPoint}`;
    Logger.info(`Attempting GET to: ${fullUrlForLog}`);

    const response = await this.request.get(endPoint, { headers: this.getHeaders() });
    await this.logDetails(endPoint, 'GET', response);
    return response;
  }

  //DELETE request.
  async delete(endPoint: string): Promise<APIResponse> {
    const response = await this.request.delete(endPoint);
    await this.logDetails(endPoint, 'DELETE', response);
    return response;
  }

  //Log if response has error.
  private async logDetails(url: string, method: string, response: APIResponse) {
    Logger.info(`API Request | ${method} -> ${url}`);

    if (!response.ok()) {
      Logger.error(`Status: ${response.status()} ${response.statusText()}`);
      //Log error body if available.
      try {
        const errRespBody = await response.json();
        Logger.error(`[ERROR BODY]: ${JSON.stringify(errRespBody, null, 2)}`);
      } catch {
        Logger.error(`Could not parse the JSON reposne.`);
      }
    }
  }
}
