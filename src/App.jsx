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
    // 1. Fetch live FX and initial portfolio quotes ONCE on mount, then every 60 seconds
  useEffect(() => {
    const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY || 'YOUR_FINNHUB_API_KEY';
    const finnhubDomain = ['finnhub', 'io'].join('.');

    async function fetchAllData() {
      // Fetch USD to ZAR Exchange Rate
      try {
        const erDomain = ['open', 'er-api', 'com'].join('.');
        const fxRes = await fetch(`https://${erDomain}/v6/latest/USD`);
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          if (fxData?.rates?.ZAR) setFxRate(fxData.rates.ZAR);
        }
      } catch (e) {
        console.warn('Currency fallback active:', e.message);
      }

      // Fetch quotes for current stocks without triggering re-render loops
      setStocks((currentStocks) => {
        Promise.all(
          currentStocks.map(async (stock) => {
            try {
              const quoteUrl = `https://${finnhubDomain}/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`;
              const response = await fetch(quoteUrl);
              if (!response.ok) return stock;

              const data = await response.json();
              if (!data || !data.c || data.c === 0) return stock;

              const currentPrice = data.c;
              const prevClose = data.pc || currentPrice;
              const changePct = data.dp || 0;
              const midPoint = (prevClose + currentPrice) / 2;

              return {
                ...stock,
                price: currentPrice.toFixed(2),
                change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
                isPositive: changePct >= 0,
                history: [prevClose, midPoint * 0.995, midPoint * 1.005, currentPrice]
              };
            } catch {
              return stock;
            }
          })
        ).then((updated) => {
          setStocks(updated);
          setLoading(false);
        });

        return currentStocks;
      });
    }

    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array stops the infinite flickering loop

  // 2. Fetch ONLY the newly added stock when the user clicks "Add Asset"
  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!inputSymbol || !inputShares) return;

    const symbolUpper = inputSymbol.toUpperCase().trim();
    const sharesToAdd = inputShares;
    setInputSymbol('');
    setInputShares('');

    const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY || 'YOUR_FINNHUB_API_KEY';
    const finnhubDomain = ['finnhub', 'io'].join('.');

    let newPrice = '100.00';
    let newChange = '0.00%';
    let isPos = true;
    let companyName = `${symbolUpper} Corp.`;
    let historyPrices = [];

    try {
      // Fetch quote for ONLY this single new ticker
      const quoteRes = await fetch(`https://${finnhubDomain}/api/v1/quote?symbol=${symbolUpper}&token=${FINNHUB_KEY}`);
      if (quoteRes.ok) {
        const data = await quoteRes.json();
        if (data && data.c && data.c !== 0) {
          const prevClose = data.pc || data.c;
          const changePct = data.dp || 0;
          const midPoint = (prevClose + data.c) / 2;

          newPrice = data.c.toFixed(2);
          newChange = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
          isPos = changePct >= 0;
          historyPrices = [prevClose, midPoint * 0.995, midPoint * 1.005, data.c];
        }
      }

      // Fetch company profile name once
      const profileRes = await fetch(`https://${finnhubDomain}/api/v1/stock/profile2?symbol=${symbolUpper}&token=${FINNHUB_KEY}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData && profileData.name) {
          companyName = profileData.name;
        }
      }
    } catch (err) {
      console.warn('Single ticker fetch fallback:', err.message);
    }

    setStocks((prev) => {
      const existingIndex = prev.findIndex((s) => s.symbol === symbolUpper);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          shares: (parseFloat(updated[existingIndex].shares) + parseFloat(sharesToAdd)).toString(),
          price: newPrice,
          change: newChange,
          isPositive: isPos
        };
        return updated;
      }
      return [
        ...prev,
        {
          symbol: symbolUpper,
          name: companyName,
          shares: sharesToAdd,
          price: newPrice,
          change: newChange,
          isPositive: isPos,
          history: historyPrices
        }
      ];
    });
  };

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

