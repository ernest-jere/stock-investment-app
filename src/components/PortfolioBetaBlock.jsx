// src/components/PortfolioBetaBlock.jsx
import React from 'react';

export default function PortfolioBetaBlock({ stocks }) {
  // Expanded 5-Year Monthly Beta values across Tech, NYSE Blue Chips, and JSE ADRs
  const betaMap = {
    // Mega-Cap Tech
    AAPL: 1.24,
    TSLA: 2.31,
    NVDA: 1.68,
    MSFT: 0.90,
    AMZN: 1.15,
    GOOGL: 1.05,

    // NYSE Financials, Retail & Consumer Defensive
    JPM: 1.11,
    V: 0.96,
    WMT: 0.52,
    KO: 0.61,
    'BRK.B': 0.87,

    // South African (JSE Dual-Listed) Mining & Energy
    GFI: 0.82,
    AU: 0.78,
    HMY: 0.95,
    SBSW: 1.38,
    SSL: 1.45
  };

  // 1. Calculate total USD portfolio value
  const totalValueUSD = stocks.reduce(
    (acc, s) => acc + parseFloat(s.price || 0) * parseFloat(s.shares || 0),
    0
  );

  // 2. Calculate weighted portfolio Beta based on position size
  const weightedBeta = stocks.reduce((acc, stock) => {
    const assetValue = parseFloat(stock.price || 0) * parseFloat(stock.shares || 0);
    const weight = totalValueUSD > 0 ? assetValue / totalValueUSD : 0;
    const assetBeta = betaMap[stock.symbol] ?? 1.0;
    return acc + assetBeta * weight;
  }, 0);

  const finalBeta = totalValueUSD > 0 ? weightedBeta : 1.0;

  // 3. Assign risk profile badge based on weighted Beta
  let riskLabel = 'Moderate / Market Aligned';
  let riskColor = 'text-semantic-text-display bg-semantic-surface-primary';

  if (finalBeta > 1.25) {
    riskLabel = 'High Volatility / Aggressive';
    riskColor = 'text-semantic-stock-down bg-semantic-stock-down/10';
  } else if (finalBeta < 0.90) {
    riskLabel = 'Low Volatility / Defensive';
    riskColor = 'text-semantic-stock-up bg-semantic-stock-up/10';
  }

  return (
    <div className="p-4 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md flex items-center justify-between gap-3">
      <div>
        <h4 className="text-xs font-bold text-semantic-text-body uppercase tracking-wider">
          Systemic Risk Volatility
        </h4>
        <p className="text-xl font-bold text-semantic-text-display mt-0.5">
          Beta {finalBeta.toFixed(2)}
        </p>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-right ${riskColor}`}
      >
        {riskLabel}
      </span>
    </div>
  );
}
