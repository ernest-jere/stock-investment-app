import React from 'react';
import StockSparkline from './StockSparkline';

export default function StockRow({ symbol, name, shares, price, change, isPositive, history, currency, fxRate, onRemove }) {
  const rawPrice = parseFloat(price || 0);
  const displayPrice = currency === 'ZAR' ? rawPrice * fxRate : rawPrice;
  const displayTotal = displayPrice * parseFloat(shares || 0);

  const formattedPrice = currency === 'ZAR'
    ? displayPrice.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
    : displayPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formattedTotal = currency === 'ZAR'
    ? displayTotal.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
    : displayTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/40 group relative">
      // inside src/components/StockRow.jsx
    <div className="flex items-center gap-3 w-1/3">
      {/* Circle Identity Avatar Badge */}
      <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center text-semantic-text-display font-bold shrink-0">
        {symbol.slice(0, 2)}
      </div>
      
      {/* Dynamic Identity Strings */}
      <div className="truncate">
        {/* Ticker Indicator */}
        <h3 className="font-bold text-semantic-text-display text-text-body-large">{symbol}</h3>
        
        {/* Full Corporate Name string - renders full live company name here */}
        <p className="text-text-body-small text-semantic-text-body truncate" title={name}>
          {name}
        </p>
      </div>
    </div>
     <div className="flex justify-center w-1/4"><StockSparkline data={history} isPositive={isPositive} /></div>
      <div className="flex items-center justify-end gap-3 w-1/3 text-right">
        <div>
          <p className="font-bold text-semantic-text-display">{formattedPrice}</p>
          <p className="text-xs text-semantic-text-body">{shares} Shares ({formattedTotal})</p>
          <span className={`inline-block font-bold px-2 py-0.5 rounded-full mt-1 text-[11px] ${isPositive ? 'text-semantic-stock-up bg-semantic-stock-up/10' : 'text-semantic-stock-down bg-semantic-stock-down/10'}`}>{change}</span>
        </div>
        <button onClick={() => onRemove(symbol)} className="text-semantic-text-body hover:text-semantic-stock-down p-1 opacity-40 group-hover:opacity-100 cursor-pointer">✕</button>
      </div>
    </div>
  );
}
