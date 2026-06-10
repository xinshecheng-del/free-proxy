// 简单的 Vercel 代理函数
export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: '请提供 url 参数，例如 /api/proxy?url=https://example.com' });
  }
  
  try {
    const target = url.startsWith('http') ? url : 'https://' + url;
    const response = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    
    const body = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
