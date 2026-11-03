// src/components/StockRow.jsx
import React from 'react';
import StockSparkline from './StockSparkline';

export default function StockRow({ symbol, name, shares, price, change, isPositive, history }) {
  const portfolioValue = (parseFloat(price) * parseFloat(shares)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/40 transition-all hover:scale-[1.01]">
      
      {/* Left Column: Core Identification Profiles */}
      <div className="flex items-center gap-3 w-1/3">
        <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center text-semantic-text-display font-bold shrink-0">
          {symbol.slice(0, 2)}
        </div>
        <div className="truncate">
          <h3 className="font-bold text-semantic-text-display">{symbol}</h3>
          <p className="text-xs text-semantic-text-body truncate">{name}</p>
        </div>
      </div>

      {/* Middle Column: The Tokenized Sparkline Graph */}
      <div className="flex justify-center w-1/4">
        <StockSparkline data={history} isPositive={isPositive} />
      </div>
      
      {/* Right Column: Values and Change Indicators */}
      <div className="text-right w-1/3">
        <p className="font-bold text-semantic-text-display">R {price || '0.00'}</p>
        <p className="text-xs text-semantic-text-body">{shares} Shares ({portfolioValue})</p>
        <span 
          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
            isPositive 
              ? 'text-semantic-stock-up bg-semantic-stock-up/10' 
              : 'text-semantic-stock-down bg-semantic-stock-down/10'
          }`}
        >
          {change}
        </span>
      </div>

    </div>
  );
}
