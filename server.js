const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8080;
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldnJmZGpxeXVobWd6aXF4dXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU3Nzk5NywiZXhwIjoyMDk0MTUzOTk3fQ.L6Yfnj7Qu1LSZq4fx15vDGIfbe2n_JqC_RYm-XHeKX0';

function findSalesFlow() {
  const files = fs.readdirSync(__dirname);
  const sf = files.filter(f => f.match(/^SalesFlow.*\.html$/i))
                  .sort((a, b) => {
                    const na = parseInt((a.match(/\d+/) || [0])[0]) || 0;
                    const nb = parseInt((b.match(/\d+/) || [0])[0]) || 0;
                    return nb - na;
                  });
  return sf[0] || 'SalesFlow.html';
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png',
};

http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,apikey,Prefer');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (pathname.startsWith('/sb/')) {
    const sbPath = pathname.replace('/sb', '');
    const qs = querystring.stringify(parsed.query);
    const fullPath = sbPath + (qs ? '?' + qs : '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: 'kevrfdjqyuhmgziqxuvs.supabase.co',
        port: 443, path: fullPath, method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
          'Prefer': req.headers['prefer'] || '',
        }
      };
      if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
      const proxyReq = https.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': proxyRes.headers['content-type'] || 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        proxyRes.pipe(res);
      });
      proxyReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({error: e.message})); });
      if (body) proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  if (pathname === '/' || pathname.match(/SalesFlow/i)) {
    const sfFile = findSalesFlow();
    console.log('Serving:', sfFile);
    fs.readFile(path.join(__dirname, sfFile), (err, data) => {
      if (err) { res.writeHead(404); res.end('SalesFlow not found in Downloads'); return; }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
    return;
  }

  const filePath = path.join(__dirname, pathname.replace(/^\//, ''));
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': MIME[path.extname(filePath)] || 'text/plain'});
    res.end(data);
  });

}).listen(PORT, '127.0.0.1', () => {
  const sfFile = findSalesFlow();
  console.log('');
  console.log('  SalesFlow · Xone Security');
  console.log('  Open: http://localhost:8080');
  console.log('  File: ' + sfFile);
  console.log('  Supabase: proxied');
  console.log('');
});
