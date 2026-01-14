export interface BuyOrder {
  intent: 'CAPTURE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}
