import React from 'react';

export default function StockRow({ symbol, name, shares, value, change, isPositive }) {
  return (
    <div className="flex items-center justify-between p-4 my-2 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/50 transition-all shadow-sm">
      <div className="flex items-center gap-3">
        
        {/* Avatar circle using semantic-surface-primary layout */}
        <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center text-semantic-text-display font-bold">
          {symbol.slice(0, 2)}
        </div>
        
        <div>
          <h3 className="font-bold text-semantic-text-display">{symbol}</h3>
          <p className="text-sm text-semantic-text-body">{name}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-semantic-text-display">{value}</p>
        <p className="text-sm text-semantic-text-body">{shares} Shares</p>
        
        <span 
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
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
