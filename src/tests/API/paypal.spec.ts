import {test, expect} from '@playwright/test';
import {BuyOrderController} from '../../lib/controllers/BuyOrder.controller';
import {BuyOrder} from '../../lib/models/BuyOrder.model';


test(`Verify Buy Order payload`, async ({request}) => {
    const paypal = new BuyOrderController(request);

    const buyOrderPayload: BuyOrder = {
    "intent": "CAPTURE",
    "purchase_units": [
        {
        "amount": {
            "currency_code": "USD",
            "value": "10.00"
        }
        }
    ]
};

const response = await paypal.createOrder(buyOrderPayload);

//Response validations
expect(response.status()).toBe(201);
const body = await response.json();
expect(body.id).toBeDefined();
expect(body.status).toBe('CREATED');

})