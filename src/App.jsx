import React, { useState, useEffect } from 'react';
import StockRow from './components/StockRow';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '7', price: '100.68', change: '-1.72%', isPositive: false, history: [102, 101, 103, 99, 100.68] },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: '5', price: '179.62', change: '+0.03%', isPositive: true, history: [175, 178, 176, 179, 179.62] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: '25.0', price: '123.07', change: '+2.22%', isPositive: true, history: [118, 120, 122, 121, 123.07] },
];

export default function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('user_portfolio_manifest');
    return saved ? JSON.parse(saved) : DEFAULT_STOCKS;
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme_mode') || 'dark');
  const [inputSymbol, setInputSymbol] = useState('');
  const [inputShares, setInputShares] = useState('');

  useEffect(() => {
    localStorage.setItem('user_portfolio_manifest', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('app_theme_mode', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const totalNetWorth = stocks.reduce((acc, s) => acc + (parseFloat(s.price || 0) * parseFloat(s.shares || 0)), 0);
  const overallPositive = stocks.filter(s => !s.isPositive).length === 0;

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!inputSymbol || !inputShares) return;

    const symbolUpper = inputSymbol.toUpperCase().trim();
    const existingIndex = stocks.findIndex(s => s.symbol === symbolUpper);
    
    if (existingIndex > -1) {
      const updated = [...stocks];
      updated[existingIndex].shares = (parseFloat(updated[existingIndex].shares) + parseFloat(inputShares)).toString();
      setStocks(updated);
    } else {
      setStocks([
        ...stocks,
        { symbol: symbolUpper, name: `${symbolUpper} Corp.`, shares: inputShares, price: '135.00', change: '0.00%', isPositive: true, history: [135, 135, 135] }
      ]);
    }

    setInputSymbol('');
    setInputShares('');
  };

  const handleRemoveStock = (sym) => setStocks(prev => prev.filter(s => s.symbol !== sym));

  return (
    <div className={`min-h-screen bg-semantic-app-bg p-6 flex flex-col items-center font-portfolio text-semantic-text-display transition-colors duration-200 ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="w-full max-w-lg">
        
        {/* Navigation Switch Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold tracking-tight">InvestTrack Dashboard</h1>
          <button 
            onClick={toggleTheme} 
            className="px-4 py-1.5 text-xs rounded-full border border-semantic-surface-primary bg-semantic-surface-secondary text-semantic-text-display font-medium cursor-pointer shadow-sm hover:opacity-90 active:scale-[0.98] transition-transform"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Dynamic Summary Balance Card Panel */}
        <div className="mb-6 p-6 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md">
          <p className="text-xs text-semantic-text-body uppercase tracking-wider font-semibold">Total Portfolio Net Worth</p>
          <h2 className="text-3xl font-bold mt-1 tracking-tight">
            {totalNetWorth.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${overallPositive ? 'bg-semantic-stock-up/10 text-semantic-stock-up' : 'bg-semantic-stock-down/10 text-semantic-stock-down'}`}>
              {overallPositive ? '▲ Portfolio Bullish' : '▼ Market Volatile'}
            </span>
          </div>
        </div>

        {/* 🛠️ RESTORED: Action Asset Input Form Component Area */}
        <form onSubmit={handleAddStock} className="mb-6 p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/30 flex gap-2">
          <input 
            type="text" 
            placeholder="Ticker (e.g. AAPL)" 
            value={inputSymbol}
            onChange={e => setInputSymbol(e.target.value)}
            className="w-1/2 p-2 rounded bg-semantic-surface-primary text-semantic-text-display placeholder-semantic-text-body/50 border border-transparent focus:border-semantic-stock-up/50 outline-none transition-all"
          />
          <input 
            type="number" 
            step="any"
            placeholder="Shares" 
            value={inputShares}
            onChange={e => setInputShares(e.target.value)}
            className="w-1/4 p-2 rounded bg-semantic-surface-primary text-semantic-text-display placeholder-semantic-text-body/50 border border-transparent focus:border-semantic-stock-up/50 outline-none transition-all"
          />
          <button type="submit" className="w-1/4 bg-semantic-stock-up text-primitive-slate-900 font-bold p-2 rounded hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
            Add Asset
          </button>
        </form>

        {/* Positions View Listing Allocation Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-semantic-text-body px-1 uppercase tracking-wider">Active Asset Positions</h3>
          {stocks.map((stock) => (
            <StockRow key={stock.symbol} {...stock} onRemove={handleRemoveStock} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
