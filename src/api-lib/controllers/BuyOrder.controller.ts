import { BaseController } from './BaseController';
import { BuyOrder } from '../models/BuyOrder.model';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '@/utils/logger.utils';

export class BuyOrderController extends BaseController {
  //BuyOrder endpoint
  private readonly BUY_ORDER_ENDPOINT = process.env.BUY_ORDER_ENDPOINT;

  constructor(request: APIRequestContext) {
    super(request);

    //Validate Enpoint value is present
    if (
      !this.BUY_ORDER_ENDPOINT ||
      typeof this.BUY_ORDER_ENDPOINT !== 'string' ||
      this.BUY_ORDER_ENDPOINT.trim().length === 0
    ) {
      const errorMsg = `BUY_ORDER_ENDPOINT is not set or invalid in environment variables.`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    Logger.info(`BuyOrderController initialized with endpoint: ${this.BUY_ORDER_ENDPOINT}`);
  }

  async createOrder(payload: BuyOrder): Promise<APIResponse> {
    //Verify payload
    if (!payload) {
      const errorMsg = `Invalid payload provided for creating Buy Order: '${JSON.stringify(payload)}'`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    Logger.info(`Creating Buy Order with payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await this.post(this.BUY_ORDER_ENDPOINT!, payload);

      if (response.ok()) {
        const responseBody = await response.json();
        Logger.info(`Buy order created successfully. Order ID: ${responseBody.id || 'N/A'}`);
      } else {
        Logger.warn(
          `Failed to create Buy Order. Status: ${response.status()} - ${response.statusText()}`,
        );
      }

      return response;
    } catch (error) {
      Logger.error(`Error creating Buy Order: ${error}`);
      throw error;
    }
  }
}
