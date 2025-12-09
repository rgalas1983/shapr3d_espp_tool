import { Currency } from '../types';
import { EXCHANGE_RATES } from '../constants';

export const formatCurrency = (value: number, currency: Currency, compact = false): string => {
  const converted = value * EXCHANGE_RATES[currency];
  
  return new Intl.NumberFormat(currency === Currency.HUF ? 'hu-HU' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard'
  }).format(converted);
};

export const convertToCurrency = (usdValue: number, currency: Currency): number => {
    return usdValue * EXCHANGE_RATES[currency];
}

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
}
