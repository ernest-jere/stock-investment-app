// api/yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, isFX, isCrypto } = req.query;

  // --- CRYPTO EDGE ROUTE ADDITION ---
  if (isCrypto === 'true') {
    try {
      const cryptoResponse = await fetch('https://coingecko.com');
      if (!cryptoResponse.ok) throw new Error(`CoinGecko endpoint error status: ${cryptoResponse.status}`);
      const cryptoData = await cryptoResponse.json();
      return res.status(200).json(cryptoData);
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
