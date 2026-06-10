export default async function handler(req, res) {
  const url = req.query.url;
  
  if (!url) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <html><body style="font-family: sans-serif; padding: 2rem;">
        <h1>✅ 代理已运行</h1>
        <p>使用方式：<code>/api/proxy?url=https://目标网站.com</code></p>
      </body></html>
    `);
  }
  
  try {
    const target = url.startsWith('http') ? url : 'https://' + url;
    const response = await fetch(target, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    const body = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'text/html');
    res.status(response.status).send(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
