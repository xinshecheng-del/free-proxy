exports.handler = async function(event) {
  const params = event.queryStringParameters;
  const url = params.url;
  
  if (!url) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: '<html><body style="font-family:sans-serif;padding:2rem;"><h1>✅ 代理运行中</h1><p>使用: /api/proxy?url=https://目标网站</p></body></html>'
    };
  }
  
  try {
    const target = url.startsWith('http') ? url : 'https://' + url;
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('Content-Type') || 'text/html'
      },
      body: body
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
