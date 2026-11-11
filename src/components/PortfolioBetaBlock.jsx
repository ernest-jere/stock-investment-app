// src/components/PortfolioBetaBlock.jsx
import React from 'react';

export default function PortfolioBetaBlock({ stocks }) {
  // Approximate standard baseline beta definitions for our tracked tech tokens
  const betaMap = {
    'AAPL': 1.25,
    'TSLA': 2.45,
    'NVDA': 1.85,
  };

  // 1. Calculate a weighted portfolio Beta based on individual asset values
  const totalValueUSD = stocks.reduce((acc, s) => acc + (parseFloat(s.price || 0) * parseFloat(s.shares || 0)), 0);
  
  const weightedBeta = stocks.reduce((acc, stock) => {
    const assetValue = parseFloat(stock.price || 0) * parseFloat(stock.shares || 0);
    const weight = totalValueUSD > 0 ? assetValue / totalValueUSD : 0;
    const assetBeta = betaMap[stock.symbol] || 1.00; // Default to neutral 1.0 for untracked items
    return acc + (assetBeta * weight);
  }, 0);

  const finalBeta = weightedBeta > 0 ? weightedBeta : 1.50; // Fallback initialization display

  // 2. Determine risk description categories
  let riskLabel = "Moderate Risk";
  let riskColor = "text-semantic-text-display bg-semantic-surface-primary";

  if (finalBeta > 1.3) {
    riskLabel = "High Volatility / Tech Aggressive";
    riskColor = "text-semantic-stock-down bg-semantic-stock-down/10";
  } else if (finalBeta < 0.95) {
    riskLabel = "Low Volatility / Defensive Protection";
    riskColor = "text-semantic-stock-up bg-semantic-stock-up/10";
  }

  return (
    <div className="p-4 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md flex items-center justify-between">
      <div>
        <h4 className="text-xs font-bold text-semantic-text-body uppercase tracking-wider">Systemic Risk Volatility</h4>
        <p className="text-xl font-bold text-semantic-text-display mt-0.5">
          Beta {finalBeta.toFixed(2)}
        </p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${riskColor}`}>
        {riskLabel}
      </span>
    </div>
  );
}
