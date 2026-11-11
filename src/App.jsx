import React, { useState, useEffect } from 'react';
import StockRow from './components/StockRow';
import PortfolioHistoryChart from './components/PortfolioHistoryChart';
import LoadingSpinner from './components/LoadingSpinner';
import PortfolioBetaBlock from './components/PortfolioBetaBlock';


const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '7', price: '180.50', change: '-1.72%', isPositive: false, history: [182, 181, 183, 179, 180.50] },
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

  const [cryptoCoins, setCryptoCoins] = useState([
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceZAR: 0, change24h: 0 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceZAR: 0, change24h: 0 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', priceZAR: 0, change24h: 0 }
  ]);

  const [newsArticles] = useState([
    { title: 'SABC News: South African Markets show steady resilience', source: 'SABC News', delay: '10m ago' },
    { title: 'BusinessTech: New property tax parameters update for local buyers', source: 'BusinessTech', delay: '1h ago' },
    { title: 'JSE Ticker Update: Leading industrial equities record green margins', source: 'Fin24', delay: '2h ago' }
  ]);

  const [netWorthHistory, setNetWorthHistory] = useState(() => {
    const savedHistory = localStorage.getItem('user_networth_history_ledger');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
      // 🔗 REST API Real-time data streams synchronisation hook layer
    // 🔗 REST API Real-time data streams synchronisation hook layer
  useEffect(() => {
    async function fetchFinancialData() {
      try {
        // 1. Get Live FX Exchange Rate
        const fxRes = await fetch('/api/yahoo?isFX=true');
        const fxContentType = fxRes.headers.get('content-type');
        if (fxRes.ok && fxContentType && fxContentType.includes('application/json')) {
          const fxData = await fxRes.json();
          const rate = fxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (rate) setFxRate(rate);
        }

        // 2. Fetch live crypto variables using our new Yahoo crypto proxy route
        const cryptoRes = await fetch('/api/yahoo?isCrypto=true');
        if (cryptoRes.ok) {
          const cryptoData = await cryptoRes.json();
          
          if (cryptoData && cryptoData['BTC-ZAR']) {
            setCryptoCoins([
              { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceZAR: cryptoData['BTC-ZAR'].price, change24h: cryptoData['BTC-ZAR'].change || 0 },
              { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceZAR: cryptoData['ETH-ZAR'].price, change24h: cryptoData['ETH-ZAR'].change || 0 },
              { id: 'solana', name: 'Solana', symbol: 'SOL', priceZAR: cryptoData['SOL-ZAR'].price, change24h: cryptoData['SOL-ZAR'].change || 0 }
            ]);
          } else {
            // Guard fallback if data is lagging
            setCryptoCoins([
              { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceZAR: 1390450, change24h: 1.45 },
              { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceZAR: 54220, change24h: 2.10 },
              { id: 'solana', name: 'Solana', symbol: 'SOL', priceZAR: 3950, change24h: -0.75 }
            ]);
          }
        }

        // 3. Fetch Stock Positions with Precise Yahoo Data Pathways
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            try {
              const response = await fetch(`/api/yahoo?symbol=${stock.symbol}`);
              const stockContentType = response.headers.get('content-type');
              if (!response.ok || !stockContentType || !stockContentType.includes('application/json')) return stock;
              
              const data = await response.json();
              // Array position extraction patch [0]
              const result = data?.chart?.result?.[0]; 
              if (!result) return stock;

              const currentPrice = result.meta.regularMarketPrice;
              const previousClose = result.meta.chartPreviousClose;
              const historyPrices = result.indicators.quote[0].close.filter(p => p != null);
              
              // Extract the true global corporate metadata name strings
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
              return stock;
            }
          })
        );
        setStocks(updatedStocks);
        setLoading(false);
      } catch (e) {
        console.warn("Using design token backup data anchors:", e.message);
        
        // ✨ FIXED FALLBACK LOOP: Generates distinct, variable prices per asset
        const baselinePrices = { 'AAPL': 180.50, 'TSLA': 215.30, 'NVDA': 123.07, 'SOL': 14.50, 'CPI': 45.10 };
        const fallbackNames = { 'AAPL': 'Apple Inc.', 'TSLA': 'Tesla, Inc.', 'NVDA': 'NVIDIA Corporation', 'SOL': 'Solana Labs', 'CPI': 'CPI Holdings' };

        setStocks(prev => prev.map(s => {
          const defaultUSD = baselinePrices[s.symbol] || 100.00;
          const randomShift = (Math.random() * 4 - 2); // Simulates realistic market fluctuations
          const finalUSD = defaultUSD + randomShift;
          const simPct = (Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1));

          return {
            ...s,
            name: fallbackNames[s.symbol] || `${s.symbol} Corp.`,
            price: finalUSD.toFixed(2),
            change: `${simPct >= 0 ? '+' : ''}${simPct.toFixed(2)}%`,
            isPositive: simPct >= 0,
            history: Array.from({ length: 5 }, () => defaultUSD * (0.95 + Math.random() * 0.1))
          };
        }));
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
        updated[existingIndex] = {
          ...updated[existingIndex],
          value: Math.round(displayTotalNetWorth)
        };
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

        {/* 📊 Portfolio Volatility Beta Block */}
        <PortfolioBetaBlock stocks={stocks} />

        <form onSubmit={handleAddStock} className="p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/30 flex gap-2">
          <input type="text" placeholder="Ticker" value={inputSymbol} onChange={e => setInputSymbol(e.target.value)} className="w-1/2 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent focus:border-semantic-stock-up/50 outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20" />
          <input type="number" step="any" placeholder="Shares" value={inputShares} onChange={e => setInputShares(e.target.value)} className="w-1/4 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent focus:border-semantic-stock-up/50 outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20" />
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

        <div className="p-4 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-semantic-text-body uppercase tracking-wider">Live SA Market Feed</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-stock-up opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-stock-up"></span>
            </span>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {newsArticles.map((article, idx) => (
              <div key={idx} className="p-2.5 rounded bg-semantic-surface-primary/40 border border-semantic-surface-primary/20 hover:border-semantic-surface-primary/60 transition-all">
                <p className="text-xs font-semibold text-semantic-text-display leading-relaxed">{article.title}</p>
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-semantic-text-body">
                  <span className="font-medium text-semantic-stock-up/80">{article.source}</span>
                  <span>{article.delay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}


