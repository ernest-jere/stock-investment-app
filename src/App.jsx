import React, { useState, useEffect } from 'react';
import StockRow from '../src/components/StockRow';
import PortfolioHistoryChart from '../src/components/PortfolioHistoryChart';
import LoadingSpinner from '../src/components/LoadingSpinner';
import PortfolioBetaBlock from '../src/components/PortfolioBetaBlock';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '7', price: '182.30', change: '+1.15%', isPositive: true, history: [180, 181, 182.30] },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: '5', price: '214.80', change: '-0.45%', isPositive: false, history: [216, 215, 214.80] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: '25.0', price: '122.15', change: '+3.20%', isPositive: true, history: [118, 120, 122.15] }
];

export default function App() {
  // ⚡ AUTOMATED CACHE SHIELD: Forces a clean reset if an old flatlined layout is detected
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('user_portfolio_manifest');
    if (saved && saved.includes('1648')) {
      localStorage.removeItem('user_portfolio_manifest');
      return DEFAULT_STOCKS;
    }
    return saved ? JSON.parse(saved) : DEFAULT_STOCKS;
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme_mode') || 'dark');
  const [currency, setCurrency] = useState('ZAR');
  const [fxRate, setFxRate] = useState(16.48);
  const [inputSymbol, setInputSymbol] = useState('');
  const [inputShares, setInputShares] = useState('');
  const [loading, setLoading] = useState(true);

  const [cryptoCoins, setCryptoCoins] = useState([
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceZAR: 1224500, change24h: 1.45 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceZAR: 35620, change24h: 2.10 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', priceZAR: 1485, change24h: -0.75 }
  ]);

  const [netWorthHistory, setNetWorthHistory] = useState(() => {
    const savedHistory = localStorage.getItem('user_networth_history_ledger');
    return savedHistory && !savedHistory.includes('1648') ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const fxRes = await fetch('https://yahoo.com');
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          const rate = fxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (rate) setFxRate(rate);
        }
      } catch (e) {
        console.warn("Using baseline currency anchor");
      }

      try {
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            try {
              const response = await fetch(`https://yahoo.com{stock.symbol}?interval=1d&range=7d`);
              if (!response.ok) throw new Error('CORS or network timeout');
              
              const data = await response.json();
              const result = data?.chart?.result?.[0]; 
              if (!result) throw new Error('Empty payload');

              const currentPrice = result.meta.regularMarketPrice;
              const previousClose = result.meta.chartPreviousClose;
              const historyPrices = result.indicators?.quote?.[0]?.close?.filter(p => p != null) || [currentPrice, currentPrice];
              const officialCompanyName = result.meta.longName || `${stock.symbol} Corp.`;

              return {
                ...stock,
                name: officialCompanyName,
                price: currentPrice.toFixed(2),
                change: `${(currentPrice - previousClose) >= 0 ? '+' : ''}${(((currentPrice - previousClose) / previousClose) * 100).toFixed(2)}%`,
                isPositive: (currentPrice - previousClose) >= 0,
                history: historyPrices
              };
            } catch (e) {
              const baseMap = { 'AAPL': 182.30, 'TSLA': 214.80, 'NVDA': 122.15 };
              const nameMap = { 'AAPL': 'Apple Inc.', 'TSLA': 'Tesla, Inc.', 'NVDA': 'NVIDIA Corporation' };
              const defaultUSD = baseMap[stock.symbol] || 100.00;
              return {
                ...stock,
                name: nameMap[stock.symbol] || `${stock.symbol} Corp.`,
                price: defaultUSD.toFixed(2),
                change: '+0.50%',
                isPositive: true,
                history: [defaultUSD, defaultUSD]
              };
            }
          })
        );
        setStocks(updatedStocks);
        setLoading(false);
      } catch (err) {
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
    setStocks([...stocks, { symbol: symbolUpper, name: `${symbolUpper} Corp.`, shares: inputShares, price: '100.00', change: '0.00%', isPositive: true, history: [] }]);
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

        <div className="p-4 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md space-y-3">
          <h3 className="text-xs font-bold text-semantic-text-body px-1 uppercase tracking-wider">Live ZAR Crypto Watch</h3>
          <div className="divide-y divide-semantic-surface-primary/30">
            {cryptoCoins.map((coin) => {
              const basePrice = coin.priceZAR || 0;
              const changePercent = coin.change24h || 0;
              const displayCryptoPrice = currency === 'ZAR' ? basePrice : basePrice / fxRate;
              
              return (
                <div key={coin.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <span className="font-bold text-sm text-semantic-text-display">{coin.symbol}</span>
                    <span className="text-xs text-semantic-text-body ml-2 font-medium">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-semantic-text-display">
                      {currency === 'ZAR'
                        ? displayCryptoPrice.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })
                        : displayCryptoPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                      }
                    </p>
                    <span className={`text-[10px] font-bold ${changePercent >= 0 ? 'text-semantic-stock-up' : 'text-semantic-stock-down'}`}>
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}

