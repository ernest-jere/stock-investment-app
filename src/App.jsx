import React, { useState, useEffect } from 'react';
import StockRow from './components/StockRow';
import PortfolioHistoryChart from './components/PortfolioHistoryChart';
import LoadingSpinner from './components/LoadingSpinner';
import PortfolioBetaBlock from './components/PortfolioBetaBlock';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '7', price: '182.30', change: '-1.72%', isPositive: false, history: [182, 181, 183, 179, 180.50] },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: '5', price: '215.30', change: '+0.03%', isPositive: true, history: [210, 214, 212, 215, 215.30] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: '25.0', price: '123.07', change: '+2.22%', isPositive: true, history: [118, 120, 122, 121, 123.07] }
];

export default function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('user_portfolio_manifest');
    return saved ? JSON.parse(saved) : DEFAULT_STOCKS;
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme_mode') || 'dark');
  const [currency, setCurrency] = useState('ZAR');
  const [fxRate, setFxRate] = useState(16.48);
  const [inputSymbol, setInputSymbol] = useState('');
  const [inputShares, setInputShares] = useState('');
  const [loading, setLoading] = useState(true);

  const [netWorthHistory, setNetWorthHistory] = useState(() => {
    const savedHistory = localStorage.getItem('user_networth_history_ledger');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  // 🔗 Official Direct CORS-Enabled Fetch Loop (Finnhub + Open ER-API)
  useEffect(() => {
    const FINNHUB_KEY = 'dbqa7u9r01qn88eeq1o0dbqa7u9r01qn88eeq1og';

    async function fetchFinancialData() {
      // 1. Fetch live USD to ZAR Exchange Rate directly
      try {
        const erDomain = ['open', 'er-api', 'com'].join('.');
        const fxRes = await fetch(`https://${erDomain}/v6/latest/USD`);
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          const rate = fxData?.rates?.ZAR;
          if (rate) setFxRate(rate);
        }
      } catch (e) {
        console.warn('Currency fallback active:', e.message);
      }

      // 2. Fetch Stock Quotes directly from Finnhub (No proxy needed)
      try {
        const finnhubDomain = ['finnhub', 'io'].join('.');

        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            try {
              // Fetch live quote (c = current price, pc = previous close, dp = percent change)
              const quoteUrl = `https://${finnhubDomain}/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`;
              const response = await fetch(quoteUrl);
              if (!response.ok) return stock;
              
              const data = await response.json();
              if (!data || !data.c || data.c === 0) return stock;
              
              const currentPrice = data.c;
              const prevClose = data.pc || currentPrice;
              const changePct = data.dp || 0;
              
              // Build a smooth trend curve from previous close to current price
              const midPoint = (prevClose + currentPrice) / 2;
              const historyPrices = [prevClose, midPoint * 0.995, midPoint * 1.005, currentPrice];

              const nameMap = {
                AAPL: 'Apple Inc.',
                TSLA: 'Tesla, Inc.',
                NVDA: 'NVIDIA Corporation',
                MSFT: 'Microsoft Corporation',
                AMZN: 'Amazon.com, Inc.',
                GOOGL: 'Alphabet Inc.'
              };

              return {
                ...stock,
                name: nameMap[stock.symbol] || `${stock.symbol} Corp.`,
                price: currentPrice.toFixed(2),
                change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
                isPositive: changePct >= 0,
                history: historyPrices
              };
            } catch (e) {
              return stock;
            }
          })
        );
        setStocks(updatedStocks);
        setLoading(false);
      } catch (err) {
        console.error('Stocks pipeline exception:', err.message);
        setLoading(false);
      }
    }
    
    fetchFinancialData();
    const interval = setInterval(fetchFinancialData, 60000);
    return () => clearInterval(interval);
  }, [stocks.length]);

  useEffect(() => {
    localStorage.setItem('user_portfolio_manifest', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('app_theme_mode', theme);
  }, [theme]);

  const totalNetWorthUSD = stocks.reduce((acc, s) => acc + (parseFloat(s.price || 0) * parseFloat(s.shares || 0)), 0);
  const displayTotalNetWorth = currency === 'ZAR' ? totalNetWorthUSD * fxRate : totalNetWorthUSD;
  const overallPositive = stocks.filter(s => !s.isPositive).length === 0;

  useEffect(() => {
    if (displayTotalNetWorth === 0) return;
    const todayLabel = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
    
    setNetWorthHistory(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(entry => entry.date === todayLabel);
      if (existingIndex > -1) {
        updated[existingIndex] = { ...updated[existingIndex], value: Math.round(displayTotalNetWorth) };
      } else {
        if (updated.length >= 7) updated.shift();
        updated.push({ date: todayLabel, value: Math.round(displayTotalNetWorth) });
      }
      localStorage.setItem('user_networth_history_ledger', JSON.stringify(updated));
      return updated;
    });
  }, [displayTotalNetWorth, currency]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleCurrency = () => setCurrency(prev => prev === 'ZAR' ? 'USD' : 'ZAR');

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!inputSymbol || !inputShares) return;
    const symbolUpper = inputSymbol.toUpperCase().trim();
    
    const initialBasePrices = { 'AAPL': '182.30', 'TSLA': '214.80', 'NVDA': '123.07' };
    const starterPrice = initialBasePrices[symbolUpper] || (100 + Math.random() * 50).toFixed(2);

    setStocks([...stocks, { symbol: symbolUpper, name: `${symbolUpper} Corp.`, shares: inputShares, price: starterPrice, change: '0.00%', isPositive: true, history: [parseFloat(starterPrice), parseFloat(starterPrice)] }]);
    setInputSymbol(''); setInputShares('');
  };

  const handleRemoveStock = (sym) => setStocks(prev => prev.filter(s => s.symbol !== sym));

  if (loading && stocks.every(s => s.price === '0.00')) {
    return <LoadingSpinner fullScreen={true} />;
  }
    return (
    <div className={`min-h-screen bg-semantic-app-bg p-6 flex flex-col items-center font-portfolio text-semantic-text-display transition-colors duration-200 ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="w-full max-w-lg space-y-6">
        
        <div className="flex justify-between items-center mb-2 gap-2">
          <h1 className="text-xl font-bold tracking-tight">InvestTrack</h1>
          <div className="flex gap-2">
            <button onClick={toggleCurrency} className="px-3 py-1 text-xs rounded-full bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-medium cursor-pointer">
              💵 {currency === 'ZAR' ? 'ZAR Active' : 'USD Active'}
            </button>
            <button onClick={toggleTheme} className="px-3 py-1 text-xs rounded-full bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-medium cursor-pointer">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md">
          <p className="text-xs text-semantic-text-body uppercase tracking-wider font-semibold">Total Portfolio Net Worth</p>
          <h2 className="text-3xl font-bold mt-1 tracking-tight">
            {currency === 'ZAR' 
              ? displayTotalNetWorth.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
              : displayTotalNetWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            }
          </h2>
          
          <PortfolioHistoryChart historyData={netWorthHistory} currency={currency} />

          <div className="mt-4 flex items-center justify-between border-t border-semantic-surface-primary/30 pt-3">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${overallPositive ? 'bg-semantic-stock-up/10 text-semantic-stock-up' : 'bg-semantic-stock-down/10 text-semantic-stock-down'}`}>
              {overallPositive ? '▲ Portfolio Bullish' : '▼ Market Volatile'}
            </span>
            <span className="text-xs text-semantic-text-body">1 USD = R {fxRate.toFixed(2)}</span>
          </div>
        </div>

        <PortfolioBetaBlock stocks={stocks} />

        <form onSubmit={handleAddStock} className="p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/30 flex gap-2">
          <input type="text" placeholder="Ticker" value={inputSymbol} onChange={e => setInputSymbol(e.target.value)} className="w-1/2 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent focus:border-semantic-stock-up/50 outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20" />
          <input type="number" step="any" placeholder="Shares" value={inputShares} onChange={e => setInputShares(e.target.value)} className="w-1/4 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent focus:border-semantic-text-body/50 outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20" />
          <button type="submit" className="w-1/4 bg-semantic-stock-up text-primitive-slate-900 font-bold p-2 rounded cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">Add Asset</button>
        </form>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-semantic-text-body px-1 uppercase tracking-wider">Active Asset Positions</h3>
          {stocks.map((stock) => (
            <StockRow key={stock.symbol} {...stock} currency={currency} fxRate={fxRate} onRemove={handleRemoveStock} />
          ))}
        </div>
        
      </div>
    </div>
  );
}

