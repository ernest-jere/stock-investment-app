// api/yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, isFX, isCrypto } = req.query;

  // 🚀 RE-ARCHITECTED CRYPTO PROXY ROUTE: Uses Yahoo Finance engine to completely evade blockers
  if (isCrypto === 'true') {
    try {
      const tickers = ['BTC-ZAR', 'ETH-ZAR', 'SOL-ZAR'];
      const dataMap = {};

      await Promise.all(
        tickers.map(async (ticker) => {
          const apiResponse = await fetch(`https://yahoo.com{ticker}?interval=1d&range=1d`);
          const payload = await apiResponse.json();
          const result = payload?.chart?.result?.[0];
          if (result) {
            dataMap[ticker] = {
              price: result.meta.regularMarketPrice,
              change: (((result.meta.regularMarketPrice - result.meta.chartPreviousClose) / result.meta.chartPreviousClose) * 100)
            };
          }
        })
      );

      return res.status(200).json(dataMap);
    } catch (error) {
      return res.status(500).json({ error: 'Proxy failed capturing crypto variables', details: error.message });
    }
  }

  // --- STANDARD STOCK ROUTES ---
  const url = isFX === 'true'
    ? 'https://yahoo.com'
    : `https://yahoo.com{symbol || 'AAPL'}?interval=1d&range=7d`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) throw new Error(`Yahoo responded with status ${apiResponse.status}`);
    const data = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch financial data', details: error.message });
  }
}
