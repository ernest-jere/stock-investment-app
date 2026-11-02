// src/components/StockRow.jsx
import React from 'react';

export default function StockRow({ symbol, name, shares, value, change, isPositive }) {
  return (
    <div className="flex items-center justify-between p-4 my-2 rounded-lg bg-surface shadow-umbra transition-all">
      <div className="flex items-center gap-3">
        {/* Placeholder for FNB / Brand Asset Logos */}
        <div className="w-10 h-10 rounded-full bg-second-surface flex items-center justify-center text-surface-text font-bold">
          {symbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="text-body-large font-bold text-surface-text">{symbol}</h3>
          <p className="text-body-small text-off-surface-text">{name}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-body-large font-bold text-surface-text">{value}</p>
        <p className="text-body-small text-off-surface-text">{shares} Shares</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'text-green-400 bg-green-950/30' : 'text-error bg-red-950/30'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
