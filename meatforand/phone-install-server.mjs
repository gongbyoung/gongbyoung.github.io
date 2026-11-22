import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * ============================================================================
 * VS Code 전용 스마트폰 다이렉트 설치 서버 (phone-install-server.mjs)
 * ----------------------------------------------------------------------------
 * 카카오톡의 '.apk' 차단과 '.zip' 압축 해제 오류를 100% 피해가는 가장 확실한 방법!
 * 1) PC(VS Code)에서 로컬 웹서버(포트 8080)를 엽니다.
 * 2) 스마트폰 크롬/삼성인터넷 주소창에 http://192.168.219.104:8080 을 입력하거나
 *    카톡에 해당 링크만 보내서 누르면, 압축을 풀 필요 없이 정식 APK가 폰으로 직행 다운로드됩니다!
 * ============================================================================
 */

const PORT = 8080;
const rootDir = process.cwd();
const apkPath = path.join(rootDir, 'meatpoan-release.apk');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }
  return '192.168.219.104';
}

const localIp = getLocalIp();
const downloadUrl = `http://${localIp}:${PORT}/meatpoan-release.apk`;
const pageUrl = `http://${localIp}:${PORT}`;

const server = http.createServer((req, res) => {
  if (req.url === '/meatpoan-release.apk') {
    if (!fs.existsSync(apkPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('APK 파일이 없습니다. 먼저 npm run apk:build 를 실행해주세요.');
      return;
    }
    const stat = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="meatpoan-release.apk"',
      'Content-Length': stat.size
    });
    fs.createReadStream(apkPath).pipe(res);
    return;
  }

  // 스마트폰 접속 시 보여줄 큼직한 원클릭 설치 안내 웹페이지
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>미트포앤 안드로이드 앱 직접 설치</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0f172a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }
        .card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 32px 24px;
          max-width: 380px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        h1 { color: #f87171; font-size: 1.4rem; margin-bottom: 8px; }
        p { color: #cbd5e1; font-size: 0.92rem; line-height: 1.5; margin-bottom: 24px; }
        .btn-download {
          display: block;
          background: #c41e3a;
          color: #fff;
          text-decoration: none;
          padding: 18px;
          border-radius: 14px;
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 14px;
          box-shadow: 0 6px 16px rgba(196, 30, 58, 0.4);
        }
        .btn-live {
          display: block;
          background: #2563eb;
          color: #fff;
          text-decoration: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .tip {
          margin-top: 20px;
          font-size: 0.8rem;
          color: #94a3b8;
          text-align: left;
          background: #0f172a;
          padding: 12px;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🥩 미트포앤 발주·재고 앱</h1>
        <p>압축 풀기나 카카오톡 오류 없이<br><b>원본 APK를 스마트폰에 바로 설치</b>합니다.</p>
        <a class="btn-download" href="/meatpoan-release.apk">📲 여기를 눌러 앱 다운로드 (.apk)</a>
        <div class="tip">
          <b>💡 주의 (카톡 내부 브라우저로 열었을 때):</b><br>
          1. 화면 우측 하단(또는 상단) <b>[⋮]</b> 버튼 터치<br>
          2. <b>[다른 브라우저로 열기 (Chrome/삼성인터넷)]</b> 선택<br>
          3. 빨간색 다운로드 버튼을 누르면 압축 없이 1초 만에 설치됩니다!
        </div>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('==============================================================');
  console.log('🚀 [VS Code 스마트폰 직통 설치 서버]가 켜졌습니다!');
  console.log('--------------------------------------------------------------');
  console.log(`👉 스마트폰 크롬(Chrome)이나 삼성인터넷 주소창에 아래 주소를 치세요:`);
  console.log(`   ${pageUrl}`);
  console.log('--------------------------------------------------------------');
  console.log(`👉 또는 카카오톡 [나에게 보내기]에 파일 대신 아래 글자(링크)만 복사해서 보내세요:`);
  console.log(`   ${downloadUrl}`);
  console.log('==============================================================');
});
