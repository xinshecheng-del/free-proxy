exports.handler = async function(event) {
  const params = event.queryStringParameters;
  const url = params ? params.url : null;
  
  if (!url) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: '<html><body style="font-family:sans-serif;padding:20px;text-align:center"><h1>🕊️ FreeProxy</h1><p>使用: ?url=https://example.com</p><p><a href="?url=https://www.google.com">打开 Google</a></p></body></html>'
    };
  }
  
  const target = url.startsWith('http') ? url : 'https://' + url;
  try {
    const response = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
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
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
