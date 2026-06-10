const PROXY_BASE = 'https://stately-beijinho-bc159e.netlify.app/.netlify/functions/proxy';

exports.handler = async function(event) {
  const params = event.queryStringParameters;
  const url = params.url;
  
  if (!url) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: getHomePage()
    };
  }
  
  const target = url.startsWith('http') ? url : 'https://' + url;
  
  try {
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });
    
    const contentType = response.headers.get('Content-Type') || '';
    let body = await response.text();
    
    // 如果是 HTML，重写所有资源链接
    if (contentType.includes('text/html')) {
      const baseUrl = target.replace(/\/?$/, '');
      
      // 重写相对路径的资源引用
      body = body
        // src="/path" -> 代理
        .replace(/src\s*=\s*"(\/(?:[^"]+))"/gi, (match, path) => {
          if (path.startsWith('//')) return match; // 协议无关 URL
          return `src="${PROXY_BASE}?url=${encodeURIComponent(baseUrl + path)}"`;
        })
        // href="/path" -> 代理
        .replace(/href\s*=\s*"(\/(?:[^"]+))"/gi, (match, path) => {
          if (path.startsWith('//')) return match;
          return `href="${PROXY_BASE}?url=${encodeURIComponent(baseUrl + path)}"`;
        })
        // src='...' 单引号版本
        .replace(/src\s*=\s*'(\/(?:[^']+))'/gi, (match, path) => {
          return `src='${PROXY_BASE}?url=${encodeURIComponent(baseUrl + path)}'`;
        })
        // 添加 base 标签方便浏览器解析
        .replace('<head>', `<head><base href="${baseUrl}/">`);
    }
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType || 'text/html'
      },
      body: body
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};

function getHomePage() {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>FreeProxy</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f5f5f7;display:flex;height:100vh;align-items:center;justify-content:center}
.card{background:#fff;padding:40px;border-radius:16px;box-shadow:0 2px 20px rgba(0,0,0,.08);width:500px;max-width:90vw;text-align:center}
h1{font-size:24px;margin-bottom:8px;color:#1d1d1f}
p{color:#86868b;margin-bottom:20px;font-size:14px}
input{width:100%;padding:12px 16px;border:1px solid #d2d2d7;border-radius:8px;font-size:16px;outline:none}
input:focus{border-color:#0071e3;box-shadow:0 0 0 3px rgba(0,113,227,.2)}
button{margin-top:12px;padding:10px 24px;background:#0071e3;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer}
button:hover{background:#0077ed}
.examples{font-size:13px;color:#86868b;margin-top:16px}
.examples a{color:#0071e3;text-decoration:none;margin:0 4px}
</style></head>
<body><div class="card">
<h1>🕊️ FreeProxy</h1>
<p>通过代理访问国外网站</p>
<form method="get" action="">
<input type="text" name="url" placeholder="输入网址，如 google.com" autofocus>
<button type="submit">打开</button>
</form>
<div class="examples">
试试：
<a href="?url=https://www.google.com">Google</a>
<a href="?url=https://github.com">GitHub</a>
<a href="?url=https://en.wikipedia.org">Wikipedia</a>
</div>
</div></body></html>`;
}
