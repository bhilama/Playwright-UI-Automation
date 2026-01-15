import { test, expect } from '@playwright/test';
import { BuyOrderController } from '../../lib/controllers/BuyOrder.controller';
import { BuyOrder } from '../../lib/models/BuyOrder.model';
import BuyOrderPayLoadJson from '../../data/API/buyOrder.json';

test(`Verify Buy Order payload`, async ({ request }) => {
  const paypal = new BuyOrderController(request);

  //Convert json payload to a type BuyOrder
  const buyOrderPayload: BuyOrder = BuyOrderPayLoadJson as BuyOrder;

  const response = await test.step(`Create Buy order via API`, async () => {
    return await paypal.createOrder(buyOrderPayload);
  });

  await test.step(`Verify API reponse matches 'CREATED' status`, async () => {
    expect(response.status(), `Response status should be 201`).toBe(201);

    const respBody = await response.json();
    expect(respBody.id, `Order ID should be present in the response`).toBeDefined();
    expect(respBody.status, `Order status should be CREATED`).toBe('CREATED');
  });
});
