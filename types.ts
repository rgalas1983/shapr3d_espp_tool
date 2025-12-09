export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  HUF = 'HUF'
}

export interface Scenario {
  name: string;
  valuation: number;
  description: string;
}

export interface ESPPCalculationResult {
  sharesBought: number;
  boosterShares: number;
  grossValue: number;
  taxAmount: number;
  netValue: number;
  roi: number;
  sharePriceAtValuation: number;
}
