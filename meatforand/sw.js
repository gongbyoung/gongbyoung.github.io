// 오프라인에서도 열리도록 앱 파일만 캐시합니다 (대화/거래처 데이터는 캐시하지 않음)
const CACHE = 'order-organizer-v2';
const FILES = ['./', 'index.html', 'parser.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
 
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 인터넷이 되면 최신 파일, 안 되면 캐시
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((m) => m || caches.match('index.html')))
  );
});
 
