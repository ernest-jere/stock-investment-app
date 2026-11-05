// src/components/StockRow.jsx
import React from 'react';
import StockSparkline from './StockSparkline';

export default function StockRow({ symbol, name, shares, price, change, isPositive, history, onRemove }) {
  const portfolioValue = (parseFloat(price) * parseFloat(shares)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/40 transition-all hover:scale-[1.01] group relative">
      
      {/* Left Profile Segment */}
      <div className="flex items-center gap-3 w-1/3">
        <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center text-semantic-text-display font-weight-bold shrink-0 text-text-body-large">
          {symbol.slice(0, 2)}
        </div>
        <div className="truncate">
          <h3 className="font-weight-bold text-semantic-text-display text-text-body-large">{symbol}</h3>
          <p className="text-text-body-small text-semantic-text-body truncate">{name}</p>
        </div>
      </div>

      {/* Middle Sparkline Segment */}
      <div className="flex justify-center w-1/4">
        <StockSparkline data={history} isPositive={isPositive} />
      </div>
      
      {/* Right Pricing Segment & Inline Delete Action Trigger */}
      <div className="flex items-center justify-end gap-3 w-1/3 text-right">
        <div>
          <p className="font-weight-bold text-semantic-text-display text-text-body-large">R {price}</p>
          <p className="text-text-body-small text-semantic-text-body">{shares} Shares ({portfolioValue})</p>
          <span 
            className={`inline-block font-weight-bold px-2 py-0.5 rounded-full mt-1 text-[11px] ${
              isPositive 
                ? 'text-semantic-stock-up bg-semantic-stock-up/10' 
                : 'text-semantic-stock-down bg-semantic-stock-down/10'
          }`}
          >
            {change}
          </span>
        </div>

        {/* Delete button: updates opacity smoothly when hovering over the stock row item card */}
        <button
          onClick={() => onRemove(symbol)}
          className="text-text-body-large text-semantic-text-body hover:text-semantic-stock-down transition-colors p-1 md:opacity-20 group-hover:opacity-100 cursor-pointer"
          title={`Remove ${symbol} from portfolio`}
        >
          ✕
        </button>
      </div>

    </div>
  );
}
