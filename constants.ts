

export const SERIES_B_VALUATION = 100_000_000; // $100M
export const SERIES_B_SHARE_PRICE = 6.81; // From PDF
export const ESPP_SHARE_PRICE = 3.41; // From PDF (50% of Series B)

// Total shares calculated from Series B metrics
export const TOTAL_OUTSTANDING_SHARES = SERIES_B_VALUATION / SERIES_B_SHARE_PRICE; // ~14.6M

// Default Assumptions from Prompt/PDF
export const DEFAULT_DILUTION = 0.20; // 20%
export const DEFAULT_TAX_CAP_GAIN = 0.15; // 15%
export const DEFAULT_TAX_MARGINAL = 0.20; // 20% Marginal Rate
export const DEFAULT_TIME_LIQUIDATION = 5; // 5 Years

// Exchange Rates (Approximate)
export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  HUF: 330
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  HUF: 'Ft'
};