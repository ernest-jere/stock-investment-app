// api/yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, isFX } = req.query;

  // Enforce correct REST API query data strings (Never fetch naked layout domains)
  const targetUrl = isFX === 'true'
    ? 'https://yahoo.com'
    : `https://yahoo.com{symbol || 'AAPL'}?interval=1d&range=7d`;

  try {
    const apiResponse = await fetch(targetUrl);
    if (!apiResponse.ok) throw new Error(`Target API rejected with status: ${apiResponse.status}`);
    const data = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy compilation failure', details: error.message });
  }
}
