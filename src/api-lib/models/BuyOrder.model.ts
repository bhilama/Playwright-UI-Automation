export interface BuyOrder {
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}
