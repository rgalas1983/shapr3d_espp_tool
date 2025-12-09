
import React, { useState, useEffect } from 'react';
import { Currency } from './types';
import { 
    SERIES_B_VALUATION, 
    ESPP_SHARE_PRICE, 
    DEFAULT_DILUTION, 
    DEFAULT_TAX_CAP_GAIN,
    DEFAULT_TAX_MARGINAL,
    DEFAULT_TIME_LIQUIDATION,
    TOTAL_OUTSTANDING_SHARES,
    EXCHANGE_RATES
} from './constants';
import { formatCurrency, formatPercentage } from './utils/format';
import { VestingChart } from './components/VestingChart';
import { ScenarioRow } from './components/ScenarioRow';
import { Button } from './components/ui/Button';

// Icons
const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.1 4-1 4-1s.38 2.38-1 4z"></path><path d="M12 15v5s3.03-.55 4-2c1.1-1.62 1-4 1-4s-2.38-.38-4 1z"></path></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
)

function App() {
  const [currency, setCurrency] = useState<Currency>(Currency.EUR);
  
  // ESPP Inputs
  // Defaulting to approx $5000 USD as per PDF
  const [investmentInput, setInvestmentInput] = useState<number>(5000); 
  
  // Tax & Dilution Configuration
  const [dilution, setDilution] = useState<number>(DEFAULT_DILUTION);
  const [taxCapGain, setTaxCapGain] = useState<number>(DEFAULT_TAX_CAP_GAIN);
  const [taxMarginal, setTaxMarginal] = useState<number>(DEFAULT_TAX_MARGINAL);
  const [timeToLiquidation, setTimeToLiquidation] = useState<number>(DEFAULT_TIME_LIQUIDATION);
  
  const [showSettings, setShowSettings] = useState(false);

  // Scenarios State
  const [currentTrajectoryValuation, setCurrentTrajectoryValuation] = useState<number>(250000000); // Default $250M
  const [growthCaseValuation, setGrowthCaseValuation] = useState<number>(1000000000); // Default $1B (Unicorn)

  // Animation State
  const [isReplaying, setIsReplaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Auto-adjust default tax/input when currency changes
  useEffect(() => {
    if (currency === Currency.USD) {
        setInvestmentInput(5000); 
        // US PDF Defaults roughly line up with general defaults
    } else if (currency === Currency.HUF) {
        setInvestmentInput(1596000); // Exact 1.596M HUF from PDF
    } else {
        setInvestmentInput(5000);
    }
  }, [currency]);

  // Derived Calculations
  // Normalize investment to USD for core logic
  const investmentUSD = investmentInput / EXCHANGE_RATES[currency];

  // Shares Calculation
  const sharesBought = investmentUSD / ESPP_SHARE_PRICE;
  const boosterShares = sharesBought * 0.5;
  const totalShares = sharesBought + boosterShares;

  // Projection Logic for the "Blue Card"
  const projectValuation = currentTrajectoryValuation;
  const effectivePricePerShare = (projectValuation / TOTAL_OUTSTANDING_SHARES) * (1 - dilution);
  const projectedGross = totalShares * effectivePricePerShare;
  
  // Calculate specific components for the Chart
  // We use the "Current Trajectory" valuation for the visualizer as it's the most relevant "Projected" context.
  const projectedValueBought = sharesBought * effectivePricePerShare;
  const projectedValueBooster = boosterShares * effectivePricePerShare;

  // Calculate Tax for Projection
  const gainBought = Math.max(0, (sharesBought * effectivePricePerShare) - investmentUSD);
  const taxBought = gainBought * taxCapGain;
  const taxBoosterVal = (boosterShares * effectivePricePerShare) * taxMarginal;
  const projectedNet = projectedGross - taxBought - taxBoosterVal;


  const handlePlay = () => {
    setIsReplaying(true);
    setHasPlayed(true);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-shapr-blue selection:text-white">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 max-w-7xl mx-auto border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-shapr-blue tracking-tighter mb-1">
            Shapr3D
          </h1>
          <h2 className="text-4xl font-black text-white tracking-tighter">
            EQUITY SIMULATOR
          </h2>
          <p className="text-gray-500 mt-2">Visualize the value of your ESPP & Booster Shares.</p>
        </div>
        
        {/* Currency Toggle */}
        <div className="flex bg-gray-900 rounded p-1 border border-gray-800 self-start md:self-auto">
          {[Currency.USD, Currency.EUR, Currency.HUF].map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-4 py-2 text-xs font-bold rounded transition-all ${
                currency === curr 
                  ? 'bg-shapr-blue text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Card */}
          <div className="bg-shapr-card p-6 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>$</span> The Offer
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-300 mb-2 uppercase">Total Investment ({currency})</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={investmentInput}
                  onChange={(e) => setInvestmentInput(Number(e.target.value))}
                  className="w-full bg-black border border-shapr-blue text-white p-3 rounded font-mono focus:outline-none focus:ring-1 focus:ring-shapr-blue"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                 At ${ESPP_SHARE_PRICE}/share (50% discount).
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded border border-gray-800 space-y-3">
               <div>
                  <div className="text-xs text-gray-500 mb-1">Shares Purchased</div>
                  <div className="text-white font-mono font-bold">{Math.floor(sharesBought).toLocaleString()}</div>
               </div>
               <div className="pt-2 border-t border-gray-800">
                  <div className="text-xs text-green-400 mb-1 font-bold flex items-center gap-2">
                      Booster Shares (+50%)
                      <span className="px-1 py-0.5 bg-green-900/40 text-green-400 text-[9px] rounded border border-green-800">2:1 MATCH</span>
                  </div>
                  <div className="text-green-400 font-mono font-bold">{Math.floor(boosterShares).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600 mt-1">Vests Dec 31, 2028</div>
               </div>
            </div>

            {/* Assumptions & Settings */}
            <div className="mt-6 pt-6 border-t border-gray-800">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/80 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md transition-colors ${showSettings ? 'bg-shapr-blue text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white'}`}>
                           <SettingsIcon />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">Advanced Settings</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                Adjust Tax ({formatPercentage(taxCapGain)}), Dilution ({formatPercentage(dilution)})...
                            </div>
                        </div>
                    </div>
                    <div className={`text-gray-500 transition-transform duration-300 ${showSettings ? 'rotate-180' : ''}`}>
                       <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                </button>

                {showSettings && (
                    <div className="mt-2 p-4 bg-gray-900/40 rounded-lg border border-gray-800 space-y-5 animate-in fade-in slide-in-from-top-1">
                        
                        {/* 1. Tax on Capital Gain */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Tax on Capital Gain</label>
                                <span className="text-[10px] font-mono text-gray-300">{formatPercentage(taxCapGain)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="0.5" step="0.01" 
                                value={taxCapGain} 
                                onChange={(e) => setTaxCapGain(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* 2. Marginal Income Tax (for Booster) */}
                        <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Marginal Income Tax</label>
                                <span className="text-[10px] font-mono text-gray-300">{formatPercentage(taxMarginal)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="0.6" step="0.01" 
                                value={taxMarginal} 
                                onChange={(e) => setTaxMarginal(Number(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-[9px] text-gray-500 mt-1 italic">Applied to Booster Shares.</p>
                        </div>

                        {/* 3. Dilution */}
                        <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Dilution until Liquidation</label>
                                <span className="text-[10px] font-mono text-gray-300">{formatPercentage(dilution)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="0.5" step="0.01" 
                                value={dilution} 
                                onChange={(e) => setDilution(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* 4. Time to Liquidation */}
                        <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Time to Liquidation</label>
                                <span className="text-[10px] font-mono text-gray-300">{timeToLiquidation} Years</span>
                            </div>
                            <input 
                                type="range" min="1" max="10" step="1" 
                                value={timeToLiquidation} 
                                onChange={(e) => setTimeToLiquidation(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                    </div>
                )}
            </div>

          </div>

          {/* Projection Card (Blue) */}
          <div className="bg-shapr-blue rounded-lg p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
             {/* Gradient Overlay */}
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

             <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Projected Outcome</span>
               <div className="text-blue-200 opacity-50"><svg width="12" height="6" viewBox="0 0 12 6" fill="currentColor"><path d="M6 6L0 0H12L6 6Z"/></svg></div>
             </div>

             <div className="bg-white/10 rounded px-3 py-2 text-sm font-medium text-white mb-4 backdrop-blur-sm border border-white/10">
               Current Trajectory
             </div>

             <div className="mb-1">
               <span className="text-4xl font-black text-white tracking-tight">
                 {formatCurrency(projectedNet, currency)}
               </span>
             </div>
             <div className="text-xs font-medium text-blue-200 uppercase tracking-wide opacity-80">
               Potential Net Value (After Tax)
             </div>

             <div className="mt-6 pt-4 border-t border-white/20 text-[10px] text-blue-100 leading-tight opacity-70">
                *Calculated based on {formatCurrency(currentTrajectoryValuation, Currency.USD, true)} valuation in {timeToLiquidation} years. 
                Includes taxes and dilution.
             </div>
          </div>
        </div>

        {/* Center Column: Vesting Chart */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-shapr-card rounded-lg border border-gray-800 p-8 flex flex-col relative flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Share Vesting</h3>
                        <div className="text-xs text-gray-500 mt-1">
                            Based on Current Trajectory Valuation ({formatCurrency(currentTrajectoryValuation, currency, true)})
                        </div>
                    </div>
                    <Button 
                        variant={isReplaying ? "outline" : "ghost"}
                        size="sm" 
                        className={`font-bold uppercase text-xs tracking-wider transition-all ${isReplaying ? 'bg-gray-800 text-gray-400' : 'bg-white text-black hover:bg-gray-200'}`}
                        onClick={handlePlay}
                        disabled={isReplaying}
                    >
                        <span className="mr-2"><PlayIcon /></span> 
                        {isReplaying ? "Playing..." : (hasPlayed ? "Replay" : "Visualize Timeline")}
                    </Button>
                </div>

                <div className="flex-grow flex items-end relative min-h-[250px]">
                    <VestingChart 
                        isPlaying={isReplaying} 
                        onReplayComplete={() => setIsReplaying(false)}
                        purchasedValue={projectedValueBought}
                        boosterValue={projectedValueBooster}
                        currency={currency}
                    />
                </div>

                <div className="mt-8 text-xs text-gray-500 bg-gray-900/50 p-4 rounded border border-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon />
                        <span className="font-bold text-gray-300">KEY DATES</span>
                    </div>
                    <ul className="space-y-1.5 opacity-80">
                        <li className="flex justify-between">
                            <span>Jan - Dec 2026:</span>
                            <span className="text-gray-300">Accumulation Period (Purchasing)</span>
                        </li>
                        <li className="flex justify-between">
                            <span>2027 - 2028:</span>
                            <span className="text-gray-300">Holding Period</span>
                        </li>
                         <li className="flex justify-between">
                            <span>31 Dec 2028:</span>
                            <span className="text-green-400 font-bold">Booster Shares Vest</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Program Details Summary */}
            <div className="bg-shapr-card rounded-lg border border-gray-800 p-6">
                 <div className="flex items-center gap-2 mb-4">
                     <InfoIcon />
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Program Details</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-xs">
                     <div className="space-y-1">
                         <div className="text-gray-500">Discount</div>
                         <div className="text-white font-bold">50% off Series B Price</div>
                     </div>
                     <div className="space-y-1">
                         <div className="text-gray-500">Matching</div>
                         <div className="text-white font-bold">2:1 (1 Free for 2 Bought)</div>
                     </div>
                     <div className="space-y-1">
                         <div className="text-gray-500">Purchase Window</div>
                         <div className="text-white font-bold">Monthly (2026)</div>
                     </div>
                     <div className="space-y-1">
                         <div className="text-gray-500">Eligibility</div>
                         <div className="text-white font-bold">Employed by 31 Dec 2025</div>
                     </div>
                 </div>
            </div>
        </div>

        {/* Right Column: Scenarios */}
        <div className="lg:col-span-4 bg-shapr-card rounded-lg border border-gray-800 p-8">
            <div className="flex items-center gap-2 mb-8">
               <svg className="text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valuation Scenarios</h3>
            </div>

            {/* Static Series B Row */}
            <ScenarioRow 
              title="Series B (2022)"
              subtitle="Valuation: $100M"
              valuation={SERIES_B_VALUATION}
              investmentAmount={investmentUSD}
              taxRateCapGain={taxCapGain}
              taxRateMarginal={taxMarginal}
              dilution={dilution}
              timeToLiquidation={timeToLiquidation}
              currency={currency}
              highlight={true}
              icon={<RocketIcon />}
            />

            <hr className="border-gray-800 my-8" />

            {/* Dynamic Current Trajectory */}
            <ScenarioRow 
              title="Current Trajectory"
              subtitle={`Valuation: ${formatCurrency(currentTrajectoryValuation, Currency.USD, true)}`}
              valuation={currentTrajectoryValuation}
              investmentAmount={investmentUSD}
              taxRateCapGain={taxCapGain}
              taxRateMarginal={taxMarginal}
              dilution={dilution}
              timeToLiquidation={timeToLiquidation}
              currency={currency}
              isInteractive={true}
              onValuationChange={setCurrentTrajectoryValuation}
            />

            {/* Dynamic Growth Case */}
            <ScenarioRow 
              title="Growth Case"
              subtitle={`Valuation: ${formatCurrency(growthCaseValuation, Currency.USD, true)}`}
              valuation={growthCaseValuation}
              investmentAmount={investmentUSD}
              taxRateCapGain={taxCapGain}
              taxRateMarginal={taxMarginal}
              dilution={dilution}
              timeToLiquidation={timeToLiquidation}
              currency={currency}
              isInteractive={true}
              onValuationChange={setGrowthCaseValuation}
            />

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-gray-800">
               <div className="flex gap-2">
                 <div className="mt-0.5 text-gray-600"><InfoIcon /></div>
                 <p className="text-[10px] text-gray-600 leading-relaxed">
                   <strong>Disclaimer:</strong> This calculator is for illustrative purposes only. 
                   Actual values depend on future market conditions. 
                   Calculated with {formatPercentage(dilution)} dilution.
                   Booster shares subject to vesting conditions (employed until Dec 31, 2028).
                 </p>
               </div>
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;