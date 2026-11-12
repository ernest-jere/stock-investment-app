// src/components/SectorBreakdownBar.jsx
import React from 'react';

export default function SectorBreakdownBar({ stocks }) {
  const sectorMap = {
    // Technology
    AAPL: 'Technology',
    TSLA: 'Technology',
    NVDA: 'Technology',
    MSFT: 'Technology',
    AMZN: 'Technology',
    GOOGL: 'Technology',

    // Financials
    JPM: 'Financials',
    V: 'Financials',
    'BRK.B': 'Financials',

    // Retail & Consumer
    WMT: 'Retail & Consumer',
    KO: 'Retail & Consumer',

    // Mining & Energy (JSE ADRs)
    GFI: 'Mining & Energy',
    AU: 'Mining & Energy',
    HMY: 'Mining & Energy',
    SBSW: 'Mining & Energy',
    SSL: 'Mining & Energy'
  };

  const sectorColors = {
    Technology: 'bg-sky-400',
    Financials: 'bg-emerald-400',
    'Retail & Consumer': 'bg-amber-400',
    'Mining & Energy': 'bg-purple-400',
    Other: 'bg-slate-400'
  };

  const dotColors = {
    Technology: 'bg-sky-400',
    Financials: 'bg-emerald-400',
    'Retail & Consumer': 'bg-amber-400',
    'Mining & Energy': 'bg-purple-400',
    Other: 'bg-slate-400'
  };

  // 1. Calculate total portfolio value in USD
  const totalValueUSD = stocks.reduce(
    (acc, s) => acc + parseFloat(s.price || 0) * parseFloat(s.shares || 0),
    0
  );

  if (totalValueUSD === 0) return null;

  // 2. Group position values by sector
  const sectorTotals = stocks.reduce((acc, stock) => {
    const sector = sectorMap[stock.symbol] || 'Other';
    const value = parseFloat(stock.price || 0) * parseFloat(stock.shares || 0);
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {});

  // 3. Convert totals into sorted percentage segments
  const segments = Object.entries(sectorTotals)
    .map(([sector, value]) => ({
      sector,
      percentage: (value / totalValueUSD) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="p-4 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-semantic-text-body uppercase tracking-wider">
          Sector Allocation
        </h4>
        <span className="text-[11px] text-semantic-text-body font-medium">
          {segments.length} {segments.length === 1 ? 'Sector' : 'Sectors'}
        </span>
      </div>

      {/* Horizontal Stacked Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-semantic-surface-primary overflow-hidden flex gap-0.5">
        {segments.map(({ sector, percentage }) => (
          <div
            key={sector}
            style={{ width: `${percentage}%` }}
            title={`${sector}: ${percentage.toFixed(1)}%`}
            className={`h-full transition-all duration-300 ${sectorColors[sector] || sectorColors.Other}`}
          />
        ))}
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
        {segments.map(({ sector, percentage }) => (
          <div key={sector} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${dotColors[sector] || dotColors.Other}`} />
            <span className="text-semantic-text-body font-medium">{sector}</span>
            <span className="font-bold text-semantic-text-display">{percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
