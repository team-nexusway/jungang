const CACHE_NAME = 'jungang-v1';  // 캐시의 이름을 설정합니다.
const urlsToCache = [
    '/jungang',  // 홈페이지
    '/index.html',  // 기본 HTML 파일
    '/Jungang-main',  // CSS 파일
    '/app.js',  // JavaScript 파일
];

// ✅ 1. 설치 (필수 파일 캐싱)
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching files...');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();  // 즉시 활성화
});

// ✅ 2. 활성화 (이전 캐시 정리)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();  // 새로운 서비스 워커 즉시 적용
});

// ✅ 3. 네트워크 요청 처리 (캐시 우선, 없으면 네트워크 요청)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match('/index.html');  // 네트워크 안 될 때 기본 페이지 제공
        })
    );
});

// ✅ 4. 업데이트 감지 및 즉시 서비스 워커 활성화
self.addEventListener('message', (event) => {
    if (event.data.type === 'skipWaiting') {
        console.log('📢 새로운 서비스 워커 즉시 활성화!');
        self.skipWaiting();
    }
});