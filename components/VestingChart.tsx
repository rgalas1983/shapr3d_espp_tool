

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Currency } from '../types';
import { formatCurrency } from '../utils/format';

interface VestingChartProps {
  isPlaying: boolean;
  onReplayComplete: () => void;
  purchasedValue: number;
  boosterValue: number;
  currency: Currency;
}

export const VestingChart: React.FC<VestingChartProps> = ({ 
    isPlaying, 
    onReplayComplete, 
    purchasedValue, 
    boosterValue, 
    currency 
}) => {
  const [animationStep, setAnimationStep] = useState(36); // Start fully visible (36 months)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timeline: Jan 2026 - Dec 2028 (3 Years / 36 Months)
  // Phase 1 (Months 1-12): Accumulation (buying shares monthly)
  // Phase 2 (Months 13-36): Holding
  // End of Month 36: Booster Vesting
  const data = useMemo(() => {
    const points = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let month = 1; month <= 36; month++) {
      // Purchased Shares accumulate linearly in year 1, then stay flat
      // The VALUE accumulates linearly as you buy more shares
      let currentPurchasedVal = 0;
      
      if (month <= 12) {
        currentPurchasedVal = purchasedValue * (month / 12);
      } else {
        currentPurchasedVal = purchasedValue;
      }

      // Booster Shares (50% of purchased) appear only at month 36
      const currentBoosterVal = month === 36 ? boosterValue : 0;
      
      // Calculate display label (e.g., "August 2026")
      const year = 2026 + Math.floor((month - 1) / 12);
      const monthName = months[(month - 1) % 12];
      const fullLabel = `${monthName} ${year}`;

      points.push({
        month,
        purchased: currentPurchasedVal,
        booster: currentBoosterVal,
        boosterVested: month === 36,
        fullLabel,
        axisLabel: getLabelForMonth(month)
      });
    }
    return points;
  }, [purchasedValue, boosterValue]);

  useEffect(() => {
    if (isPlaying) {
      setAnimationStep(0);
      let step = 0;

      const runStep = () => {
        step += 1;
        setAnimationStep(step);

        if (step >= 36) {
          onReplayComplete();
          return;
        }

        // Variable Speed Logic
        // 400ms = Standard Pace (readable)
        // 240ms = Fast Forward (clearly faster but still readable, "half speed" of previous 120ms)
        let delay = 400; 

        // Fast Forward during Holding Period (Jan 2027 - Nov 2028)
        // Steps 13 to 35
        if (step >= 13 && step < 35) {
            delay = 240; 
        } else if (step === 35) {
            delay = 1500; // Pause right before the big reveal
        }

        timeoutRef.current = setTimeout(runStep, delay);
      };

      // Initial start
      timeoutRef.current = setTimeout(runStep, 400);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [isPlaying, onReplayComplete]);

  // Current State for HUD
  const currentStepIndex = Math.max(0, Math.min(animationStep - 1, 35));
  const currentData = data[currentStepIndex] || data[35];
  
  // Filter data based on animation for the chart
  const displayData = data.map(d => ({
    ...d,
    purchased: d.month <= animationStep ? d.purchased : 0,
    booster: d.month <= animationStep ? d.booster : 0,
  }));

  function getLabelForMonth(m: number) {
      if (m === 1) return 'Jan 26';
      if (m === 12) return 'Dec 26';
      if (m === 24) return 'Dec 27';
      if (m === 36) return 'Dec 28';
      return '';
  }

  // Custom Tooltip (still useful for hovering specific bars later)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded shadow-xl text-xs z-50">
          <p className="font-bold text-gray-300 mb-2 border-b border-gray-700 pb-1">{dataPoint.fullLabel}</p>
          <div className="space-y-1">
             <div className="flex justify-between gap-4">
                 <span className="text-shapr-blue">Purchased:</span>
                 <span className="font-mono text-white">{formatCurrency(dataPoint.purchased, currency)}</span>
             </div>
             <div className="flex justify-between gap-4">
                 <span className="text-green-400">Booster:</span>
                 <span className="font-mono text-white">{formatCurrency(dataPoint.booster, currency)}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const isHoldingPeriod = animationStep >= 13 && animationStep < 35 && isPlaying;

  return (
    <div className="h-64 w-full mt-8 relative group">
      
      {/* Live Data HUD Overlay */}
      <div className={`absolute top-0 left-4 z-20 transition-all duration-300 pointer-events-none
          bg-gray-900/95 border border-gray-700 p-4 rounded-lg shadow-2xl backdrop-blur-sm
          ${animationStep === 0 ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}>
         {/* Holding Period Indicator */}
         {isHoldingPeriod && (
             <div className="absolute -top-6 left-0 text-[10px] font-black text-shapr-blue animate-pulse flex items-center gap-1 uppercase tracking-widest whitespace-nowrap">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 19V5l11 7-11 7zM2 19V5l11 7-11 7z"/></svg>
                Holding Period • Fast Forwarding
             </div>
         )}

         <div className="flex items-center justify-between gap-6 mb-3 border-b border-gray-800 pb-2">
            <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Timeline</div>
                <div className="text-lg font-bold text-white tabular-nums leading-none mt-1 min-w-[100px]">
                    {currentData.fullLabel}
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Value</div>
                <div className="text-lg font-bold text-white tabular-nums leading-none mt-1">
                    {formatCurrency(currentData.purchased + currentData.booster, currency)}
                </div>
            </div>
         </div>
         
         <div className="space-y-2 text-xs w-56">
            {/* Purchased Row */}
            <div>
                <div className="flex items-center justify-between mb-0.5">
                   <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-shapr-blue rounded-full"></div>
                        <span className="text-gray-300 font-medium">Purchased</span>
                   </div>
                   <span className="font-mono font-bold text-white">{formatCurrency(currentData.purchased, currency)}</span>
                </div>
                <div className="text-[10px] text-gray-500 text-right">
                    {currentStepIndex >= 11 ? '100% Vested' : 'Accumulating...'}
                </div>
            </div>

            {/* Booster Row */}
            <div className={currentData.boosterVested ? 'opacity-100' : 'opacity-60'}>
                <div className="flex items-center justify-between mb-0.5">
                   <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 font-medium">Booster</span>
                   </div>
                   <span className={`font-mono font-bold ${currentData.boosterVested ? 'text-green-400' : 'text-gray-400'}`}>
                       {formatCurrency(currentData.booster, currency)}
                   </span>
                </div>
                <div className={`text-[10px] text-right transition-colors duration-300 ${currentData.boosterVested ? 'text-green-400 font-bold' : 'text-gray-600'}`}>
                    {currentData.boosterVested ? 'VESTED' : 'UNVESTED'}
                </div>
            </div>
         </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} barCategoryGap={2} stackOffset="sign">
          <XAxis 
            dataKey="month" 
            tickFormatter={(val) => getLabelForMonth(val)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 10, fontWeight: 600 }}
            interval={0}
            ticks={[1, 12, 24, 36]}
            padding={{ left: 10, right: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff', opacity: 0.05}} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', opacity: 0.7 }} iconSize={8} />
          
          <Bar 
            dataKey="purchased" 
            stackId="a" 
            fill="#0066FF" 
            name="Purchased Value" 
            radius={[0, 0, 0, 0]} 
            isAnimationActive={false} // Disable internal animation to prevent jitter with manual steps
          />
          <Bar 
            dataKey="booster" 
            stackId="a" 
            fill="#34D399" 
            name="Booster Value" 
            radius={[2, 2, 0, 0]} 
            isAnimationActive={false} // Disable internal animation
          />
          
          {/* Reference lines for years */}
          <ReferenceLine x={12} stroke="#333" strokeDasharray="3 3" />
          <ReferenceLine x={24} stroke="#333" strokeDasharray="3 3" />
          <ReferenceLine x={36} stroke="#333" strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
