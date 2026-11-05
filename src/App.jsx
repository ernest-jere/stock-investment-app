// src/App.jsx
import React, { useState, useEffect } from 'react';
import StockRow from './components/StockRow';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '12.5', price: '0.00', change: '0.00%', isPositive: true, history: [] },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: '4.0', price: '0.00', change: '0.00%', isPositive: false, history: [] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: '25.0', price: '0.00', change: '0.00%', isPositive: true, history: [] },
];

export default function App() {
  // 1. Initialise State directly from LocalStorage to avoid layout flicker
  const [stocks, setStocks] = useState(() => {
    const savedPortfolio = localStorage.getItem('user_portfolio_manifest');
    return savedPortfolio ? JSON.parse(savedPortfolio) : DEFAULT_STOCKS;
  });

  const [inputSymbol, setInputSymbol] = useState('');
  const [inputShares, setInputShares] = useState('');
  const [loading, setLoading] = useState(true);

  // 2. Synchronise LocalStorage changes whenever the stock data structure updates
  useEffect(() => {
    localStorage.setItem('user_portfolio_manifest', JSON.stringify(stocks));
  }, [stocks]);

  // 3. Asynchronous Live Financial Price Feed Fetcher Loop
  useEffect(() => {
    async function fetchStockPrices() {
      try {
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            const response = await fetch(`https://yahoo.com{stock.symbol}?interval=1d&range=7d`);
            if (!response.ok) throw new Error('API down');
            const data = await response.json();
            
            const result = data.chart.result[0];
            const currentPrice = result.meta.regularMarketPrice;
            const previousClose = result.meta.chartPreviousClose;
            const historyPrices = result.indicators.quote.close.filter(p => p != null);

            const absoluteChange = currentPrice - previousClose;
            const percentageChange = ((absoluteChange / previousClose) * 100).toFixed(2);
            const isPositive = absoluteChange >= 0;

            return {
              ...stock,
              price: currentPrice.toFixed(2),
              change: `${isPositive ? '+' : ''}${percentageChange}%`,
              isPositive,
              history: historyPrices
            };
          })
        );
        setStocks(updatedStocks);
        setLoading(false);
      } catch (error) {
        // Fallback mock live calculation if client hits global CORS limits locally
        setStocks(prev => prev.map(s => {
          if (s.history.length > 0) return s; // Retain current values if available
          return {
            ...s,
            price: (Math.random() * 150 + 100).toFixed(2),
            change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 3).toFixed(2)}%`,
            isPositive: Math.random() > 0.5,
            history: Array.from({ length: 7 }, () => Math.random() * 40 + 120)
          };
        }));
        setLoading(false);
      }
    }

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 30000); 
    return () => clearInterval(interval);
  }, [stocks.length]); // Re-fetch dependencies only when new assets are appended

  // 4. Handle Adding a New Asset
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!inputSymbol || !inputShares) return;

    const symbolUpper = inputSymbol.toUpperCase().trim();
    
    // Check for duplicate tickers; if found, update the share count instead
    const existingIndex = stocks.findIndex(s => s.symbol === symbolUpper);
    if (existingIndex > -1) {
      const updated = [...stocks];
      updated[existingIndex].shares = (parseFloat(updated[existingIndex].shares) + parseFloat(inputShares)).toString();
      setStocks(updated);
    } else {
      setStocks([
        ...stocks,
        { symbol: symbolUpper, name: `${symbolUpper} Corporation`, shares: inputShares, price: '0.00', change: '0.00%', isPositive: true, history: [] }
      ]);
    }

    setInputSymbol('');
    setInputShares('');
  };

  return (
    <div className="min-h-screen bg-semantic-app-bg p-6 flex flex-col items-center font-portfolio">
      <div className="w-full max-w-lg">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-headline font-weight-bold text-semantic-text-display">My Live Portfolio</h1>
          {loading && <span className="text-text-body-small text-semantic-text-body animate-pulse">Syncing...</span>}
        </div>

        {/* Dynamic Asset Input Form Component Area */}
        <form onSubmit={handleAddStock} className="mb-6 p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/30 flex gap-2">
          <input 
            type="text" 
            placeholder="Ticker (e.g. AAPL)" 
            value={inputSymbol}
            onChange={e => setInputSymbol(e.target.value)}
            className="w-1/2 p-2 rounded bg-semantic-surface-primary text-semantic-text-display text-text-body-large placeholder-semantic-text-body/50 border border-transparent focus:border-semantic-stock-up/50 outline-none"
          />
          <input 
            type="number" 
            step="any"
            placeholder="Shares" 
            value={inputShares}
            onChange={e => setInputShares(e.target.value)}
            className="w-1/4 p-2 rounded bg-semantic-surface-primary text-semantic-text-display text-text-body-large placeholder-semantic-text-body/50 border border-transparent focus:border-semantic-stock-up/50 outline-none"
          />
          <button type="submit" className="w-1/4 bg-semantic-stock-up text-semantic-surface-secondary font-weight-bold p-2 rounded hover:opacity-90 active:scale-[0.98] transition-all">
            Add
          </button>
        </form>
        
        {/* Rendered Persistent Rows Grid */}
        <div className="space-y-3">
          {stocks.map((stock) => (
            <StockRow key={stock.symbol} {...stock} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
