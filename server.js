const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── 파일 저장 엔드포인트 ──
  if (req.method === 'POST' && req.url === '/__save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { file, html } = JSON.parse(body);
        const filePath = path.join(DIR, path.basename(file));
        if (!filePath.endsWith('.html')) { res.writeHead(400); res.end('html 파일만 저장 가능'); return; }
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`저장됨: ${path.basename(file)}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500); res.end(e.message);
      }
    });
    return;
  }

  // ── 정적 파일 서빙 ──
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(DIR, urlPath);
  // 보안: 워크샵 폴더 밖으로 나가지 못하게
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(filePath);

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ 워크샵 서버 실행 중`);
  console.log(`   브라우저에서 열기: http://localhost:${PORT}\n`);
  console.log(`   DevTools에서 수정 후 Cmd+S 또는 "파일 저장" 버튼으로 저장\n`);
});
