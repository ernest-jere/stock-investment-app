// api/yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, isFX } = req.query;

  const targetUrl = isFX === 'true'
    ? 'https://yahoo.com'
    : `https://yahoo.com{symbol || 'AAPL'}?interval=1d&range=7d`;

  try {
    const apiResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // ⚡ FIREWALL BYPASS: Mimic an authentic desktop web browser sequence
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`Yahoo Finance firewall rejected request with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Proxy authentication failure', 
      details: error.message 
    });
  }
}
