import { BaseController } from './BaseController';
import { BuyOrder } from '../models/BuyOrder.model';
import { APIRequestContext } from '@playwright/test';

export class BuyOrderController extends BaseController {
  constructor(request: APIRequestContext) {
    super(request);
  }
  private readonly BUYORDER_PATH = process.env.BUY_ORDER_ENDPOINT!;

  async createOrder(payload: BuyOrder) {
    return await this.post(this.BUYORDER_PATH, payload);
  }

  async getOrder(oderId: string) {
    return await this.get(`${this.BUYORDER_PATH}/${oderId}`);
  }
}
