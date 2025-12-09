
import React from 'react';
import { Currency } from '../types';
import { formatCurrency, formatPercentage } from '../utils/format';
import { 
  SERIES_B_VALUATION, 
  SERIES_B_SHARE_PRICE, 
  ESPP_SHARE_PRICE,
  TOTAL_OUTSTANDING_SHARES
} from '../constants';

interface ScenarioRowProps {
  title: string;
  subtitle: string;
  valuation: number;
  investmentAmount: number; // In USD
  taxRateCapGain: number;
  taxRateMarginal: number;
  dilution: number;
  timeToLiquidation: number;
  currency: Currency;
  isInteractive?: boolean;
  onValuationChange?: (val: number) => void;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const ScenarioRow: React.FC<ScenarioRowProps> = ({
  title,
  subtitle,
  valuation,
  investmentAmount,
  taxRateCapGain,
  taxRateMarginal,
  dilution,
  timeToLiquidation,
  currency,
  isInteractive = false,
  onValuationChange,
  icon,
  highlight = false
}) => {
  // --- CORE ESPP CALCULATION LOGIC ---
  
  // 1. Calculate Effective Share Price at this future valuation
  // Formula: (FutureVal / TotalShares) * (1 - Dilution)
  // Note: TotalShares is static based on Series B. Dilution reduces the effective price per share.
  const rawPricePerShare = valuation / TOTAL_OUTSTANDING_SHARES;
  const effectivePricePerShare = rawPricePerShare * (1 - dilution);

  // 2. Calculate Shares
  const sharesBought = investmentAmount / ESPP_SHARE_PRICE;
  const boosterShares = sharesBought * 0.5; // 50% matching as per PDF analysis
  const totalShares = sharesBought + boosterShares;

  // 3. Gross Values
  const valueBought = sharesBought * effectivePricePerShare;
  const valueBooster = boosterShares * effectivePricePerShare;
  const grossValue = valueBought + valueBooster;

  // 4. Tax Calculation
  // Tax on Bought: (Value - Cost) * CapGainRate
  // Cost Basis = sharesBought * ESPP_SHARE_PRICE (which is exactly investmentAmount)
  const gainBought = Math.max(0, valueBought - investmentAmount);
  const taxBought = gainBought * taxRateCapGain;

  // Tax on Booster: Value * MarginalRate (Treating entire booster value as taxable income)
  const taxBooster = valueBooster * taxRateMarginal;

  const totalTax = taxBought + taxBooster;

  // 5. Net Value & ROI
  const netValue = grossValue - totalTax;
  
  // NOTE: PDF defines ROI as "total portfolio value divided by the initial net investment".
  // This calculates a multiple (e.g. 250% of original), not just the gain (150%).
  const roi = investmentAmount > 0 ? (netValue / investmentAmount) : 0; 

  // 6. Annualized Return (CAGR)
  // Formula: ((Final Value / Initial Value) ^ (1 / Years)) - 1
  // Initial Value = Investment
  // Final Value = Net Value
  // We handle edge cases where investment is 0 or netValue is negative (though unlikely here)
  let annualizedRoi = 0;
  if (investmentAmount > 0 && netValue > 0 && timeToLiquidation > 0) {
      annualizedRoi = Math.pow(netValue / investmentAmount, 1 / timeToLiquidation) - 1;
  }

  // -----------------------------------

  return (
    <div className={`mb-8 ${highlight ? 'p-4 bg-gray-900/50 border border-l-4 border-l-shapr-blue border-y-0 border-r-0 rounded' : ''}`}>
      {highlight && (
        <div className="flex items-start gap-3 mb-2">
           {icon && <div className="text-shapr-blue mt-1">{icon}</div>}
           <div>
             <h4 className="text-sm font-bold text-gray-200">Valuations start at $100M (Series B, 2022).</h4>
             <p className="text-xs text-gray-500 mt-1">Comparision baseline.</p>
           </div>
        </div>
      )}

      <div className={`flex justify-between items-end mb-2 ${highlight ? 'mt-4' : ''}`}>
        <div>
          <div className="text-sm font-bold text-gray-300 uppercase tracking-wide">{title}</div>
          <div className="text-xs text-gray-500 mt-1">Valuation: {formatCurrency(valuation, Currency.USD, true)}</div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
             <div className={`text-xl font-bold ${highlight ? 'text-white' : (isInteractive ? 'text-shapr-blue' : 'text-gray-400')}`}>
               {formatCurrency(netValue, currency)}
             </div>
             <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-green-400 border border-green-900/50">
                    ROI {formatPercentage(roi)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-blue-400 border border-blue-900/50">
                    {formatPercentage(annualizedRoi)} / yr
                </span>
             </div>
             <div className="text-[10px] text-gray-500 mt-1">
                Net Value (Post-Tax)
             </div>
          </div>
        </div>
      </div>

      <div className="relative h-6 flex items-center">
        {isInteractive ? (
            <input 
              type="range" 
              min="100000000" 
              max="5000000000" 
              step="50000000"
              value={valuation}
              onChange={(e) => onValuationChange && onValuationChange(Number(e.target.value))}
              className="w-full z-10 opacity-0 absolute inset-0 cursor-pointer"
            />
        ) : null}
        
        {/* Track Background */}
        <div className="w-full h-1 bg-gray-800 rounded absolute overflow-hidden">
             {/* Fill for non-interactive (static progress) */}
             {!isInteractive && (
                 <div className="h-full bg-gray-600" style={{ width: '0%' }}></div>
             )}
        </div>

        {/* Custom Thumb/Marker */}
        {isInteractive ? (
             <div 
               className="h-5 w-5 bg-white rounded-full shadow-lg absolute pointer-events-none transition-all duration-75"
               style={{ 
                   left: `${((valuation - 100000000) / (5000000000 - 100000000)) * 100}%`,
                   transform: 'translateX(-50%)' 
               }}
             />
        ) : (
             <div className="h-4 w-4 bg-gray-600 rounded-full border-2 border-gray-900 absolute left-0" />
        )}

      </div>
    </div>
  );
};