import React, { useState, useEffect } from 'react';
import StockRow from './components/StockRow';
import PortfolioHistoryChart from './components/PortfolioHistoryChart';
import LoadingSpinner from './components/LoadingSpinner';
import PortfolioBetaBlock from './components/PortfolioBetaBlock';
import SectorBreakdownBar from './components/SectorBreakdownBar';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: '7', price: '182.30', change: '+1.15%', isPositive: true, history: [180, 181, 182.30] },
  { symbol: 'TSLA', name: 'Tesla, Inc.', shares: '5', price: '214.80', change: '-0.45%', isPositive: false, history: [216, 215, 214.80] },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', shares: '25.0', price: '122.15', change: '+3.20%', isPositive: true, history: [118, 120, 122.15] }
];

const COMPANY_NAMES = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla, Inc.',
  NVDA: 'NVIDIA Corporation',
  MSFT: 'Microsoft Corporation',
  AMZN: 'Amazon.com, Inc.',
  GOOGL: 'Alphabet Inc.',
  JPM: 'JPMorgan Chase & Co.',
  V: 'Visa Inc.',
  WMT: 'Walmart Inc.',
  KO: 'The Coca-Cola Company',
  GFI: 'Gold Fields Ltd.',
  SSL: 'Sasol Ltd.',
  SBSW: 'Sibanye Stillwater Ltd.'
};

export default function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('user_portfolio_manifest');
    return saved ? JSON.parse(saved) : DEFAULT_STOCKS;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme_mode') || 'dark');
  const [currency, setCurrency] = useState('ZAR');
  const [fxRate, setFxRate] = useState(16.59);
  const [inputSymbol, setInputSymbol] = useState('');
  const [inputShares, setInputShares] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const checkNyseOpen = () => {
    const nyTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = nyTime.getDay();
    const totalMinutes = nyTime.getHours() * 60 + nyTime.getMinutes();
    return day >= 1 && day <= 5 && totalMinutes >= 9 * 60 + 30 && totalMinutes < 16 * 60;
  };

  const [isMarketOpen, setIsMarketOpen] = useState(checkNyseOpen);

  const [netWorthHistory, setNetWorthHistory] = useState(() => {
    const savedHistory = localStorage.getItem('user_networth_history_ledger');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;
  const finnhubDomain = ['finnhub', 'io'].join('.');

  const fetchSingleQuote = async (symbol) => {
    if (!FINNHUB_KEY) return null;
    try {
      const url = `https://${finnhubDomain}/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.c || data.c === 0) return null;

      const currentPrice = data.c;
      const prevClose = data.pc || currentPrice;
      const changePct = data.dp || 0;
      const midPoint = (prevClose + currentPrice) / 2;

      return {
        price: currentPrice.toFixed(2),
        change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
        isPositive: changePct >= 0,
        history: [prevClose, midPoint * 0.995, midPoint * 1.005, currentPrice]
      };
    } catch {
      return null;
    }
  };

  const syncMarketData = async () => {
    setIsRefreshing(true);
    setIsMarketOpen(checkNyseOpen());

    try {
      const erDomain = ['open', 'er-api', 'com'].join('.');
      const fxRes = await fetch(`https://${erDomain}/v6/latest/USD`);
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData?.rates?.ZAR) setFxRate(fxData.rates.ZAR);
      }
    } catch (e) {
      console.warn('FX fallback active:', e.message);
    }

    setStocks((currentStocks) => {
      Promise.all(
        currentStocks.map(async (stock) => {
          const live = await fetchSingleQuote(stock.symbol);
          return live ? { ...stock, ...live } : stock;
        })
      ).then((updated) => {
        setStocks(updated);
        setLoading(false);
        setIsRefreshing(false);
        setLastUpdated(
          new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      });
      return currentStocks;
    });
  };

  useEffect(() => {
    syncMarketData();
    const interval = setInterval(syncMarketData, 60000);
    return () => clearInterval(interval);
  }, []);
    useEffect(() => {
    localStorage.setItem('user_portfolio_manifest', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('app_theme_mode', theme);
  }, [theme]);

  const totalNetWorthUSD = stocks.reduce(
    (acc, s) => acc + parseFloat(s.price || 0) * parseFloat(s.shares || 0),
    0
  );
  const displayTotalNetWorth = currency === 'ZAR' ? totalNetWorthUSD * fxRate : totalNetWorthUSD;
  const overallPositive = stocks.every((s) => s.isPositive);

  useEffect(() => {
    if (displayTotalNetWorth === 0) return;
    const todayLabel = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });

    setNetWorthHistory((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex((entry) => entry.date === todayLabel);
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

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleCurrency = () => setCurrency((prev) => (prev === 'ZAR' ? 'USD' : 'ZAR'));

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!inputSymbol || !inputShares) return;

    const symbolUpper = inputSymbol.toUpperCase().trim();
    const sharesToAdd = inputShares;
    setInputSymbol('');
    setInputShares('');

    const live = await fetchSingleQuote(symbolUpper);
    let companyName = COMPANY_NAMES[symbolUpper] || `${symbolUpper} Corp.`;

    if (!COMPANY_NAMES[symbolUpper] && FINNHUB_KEY) {
      try {
        const profileRes = await fetch(
          `https://${finnhubDomain}/api/v1/stock/profile2?symbol=${symbolUpper}&token=${FINNHUB_KEY}`
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData?.name) companyName = profileData.name;
        }
      } catch {
        // Keep fallback name
      }
    }

    const stockData = live || {
      price: '100.00',
      change: '0.00%',
      isPositive: true,
      history: []
    };

    setStocks((prev) => {
      const existingIndex = prev.findIndex((s) => s.symbol === symbolUpper);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...stockData,
          shares: (parseFloat(updated[existingIndex].shares) + parseFloat(sharesToAdd)).toString()
        };
        return updated;
      }
      return [
        ...prev,
        {
          symbol: symbolUpper,
          name: companyName,
          shares: sharesToAdd,
          ...stockData
        }
      ];
    });
  };

  const handleRemoveStock = (sym) => {
    setStocks((prev) => prev.filter((s) => s.symbol !== sym));
  };

  const handleExportCSV = () => {
    if (stocks.length === 0) return;

    const headers = ['Ticker', 'Company Name', 'Shares', `Price (${currency})`, `Total Value (${currency})`, '24h Change'];
    const rows = stocks.map((stock) => {
      const unitPrice = currency === 'ZAR' ? parseFloat(stock.price) * fxRate : parseFloat(stock.price);
      const totalValue = unitPrice * parseFloat(stock.shares);
      return [
        stock.symbol,
        `"${stock.name.replace(/"/g, '""')}"`,
        stock.shares,
        unitPrice.toFixed(2),
        totalValue.toFixed(2),
        stock.change
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `InvestTrack_Portfolio_${currency}_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && stocks.every((s) => s.price === '0.00')) {
    return <LoadingSpinner fullScreen={true} />;
  }
    return (
    <div
      className={`min-h-screen bg-semantic-app-bg p-6 flex flex-col items-center font-portfolio text-semantic-text-display transition-colors duration-200 ${
        theme === 'light' ? 'light-theme' : ''
      }`}
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Top Navigation */}
        <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight">InvestTrack</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isMarketOpen
                  ? 'bg-semantic-stock-up/15 text-semantic-stock-up'
                  : 'bg-semantic-surface-primary text-semantic-text-body'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMarketOpen ? 'bg-semantic-stock-up animate-pulse' : 'bg-semantic-text-body'
                }`}
              />
              {isMarketOpen ? 'NYSE Open' : 'NYSE Closed'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={syncMarketData}
              disabled={isRefreshing}
              title="Refresh live quotes"
              className="px-3 py-1 text-xs rounded-full bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-medium cursor-pointer hover:opacity-80 disabled:opacity-50 transition-all"
            >
              <span className={isRefreshing ? 'inline-block animate-spin' : 'inline-block'}>↻</span>{' '}
              {isRefreshing ? 'Syncing' : 'Refresh'}
            </button>
            <button
              onClick={toggleCurrency}
              className="px-3 py-1 text-xs rounded-full bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-medium cursor-pointer"
            >
              💵 {currency}
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 text-xs rounded-full bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-medium cursor-pointer"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Portfolio Net Worth Card + 7-Day Rolling Chart */}
        <div className="p-6 rounded-xl bg-semantic-surface-secondary border border-semantic-surface-primary/40 shadow-md">
          <p className="text-xs text-semantic-text-body uppercase tracking-wider font-semibold">
            Total Portfolio Net Worth
          </p>
          <h2 className="text-3xl font-bold mt-1 tracking-tight">
            {currency === 'ZAR'
              ? displayTotalNetWorth.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
              : displayTotalNetWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </h2>

          <PortfolioHistoryChart historyData={netWorthHistory} currency={currency} />

          <div className="mt-4 flex items-center justify-between border-t border-semantic-surface-primary/30 pt-3">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                overallPositive
                  ? 'bg-semantic-stock-up/10 text-semantic-stock-up'
                  : 'bg-semantic-stock-down/10 text-semantic-stock-down'
              }`}
            >
              {overallPositive ? '▲ Portfolio Bullish' : '▼ Market Volatile'}
            </span>
            <span className="text-xs text-semantic-text-body">
              1 USD = R {fxRate.toFixed(2)} • Synced {lastUpdated}
            </span>
          </div>
        </div>

        {/* Volatility Risk Indicator */}
        <PortfolioBetaBlock stocks={stocks} />

        {/* Sector Allocation Breakdown Bar */}
        <SectorBreakdownBar stocks={stocks} />

        {/* Add Asset Form */}
        <form
          onSubmit={handleAddStock}
          className="p-4 rounded-lg bg-semantic-surface-secondary border border-semantic-surface-primary/30 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ticker"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="w-1/2 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20"
          />
          <input
            type="number"
            step="any"
            placeholder="Shares"
            value={inputShares}
            onChange={(e) => setInputShares(e.target.value)}
            className="w-1/4 p-2 rounded bg-semantic-surface-primary text-semantic-text-display border border-transparent outline-none transition-all duration-200 hover:border-semantic-text-body/30 focus:border-semantic-stock-up focus:ring-2 focus:ring-semantic-stock-up/20"
          />
          <button
            type="submit"
            className="w-1/4 bg-semantic-stock-up text-primitive-slate-900 font-bold p-2 rounded cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Add Asset
          </button>
        </form>

        {/* Active Positions List with CSV Export Button */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-semantic-text-body uppercase tracking-wider">
              Active Asset Positions
            </h3>
            <button
              onClick={handleExportCSV}
              title="Download portfolio ledger as CSV"
              className="px-2.5 py-1 text-[11px] rounded-md bg-semantic-surface-secondary border border-semantic-surface-primary text-semantic-text-display font-semibold cursor-pointer hover:border-semantic-stock-up/50 active:scale-[0.97] transition-all"
            >
              ⬇ Export CSV
            </button>
          </div>
          {stocks.map((stock) => (
            <StockRow
              key={stock.symbol}
              {...stock}
              currency={currency}
              fxRate={fxRate}
              onRemove={handleRemoveStock}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
