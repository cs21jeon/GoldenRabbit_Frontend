// 캐시 이름 정의
const CACHE_NAME = 'goldenrabbit-v0';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/js/inquiry-form.js',
  '/js/property-api.js',
  '/images/favicon_goldenrabbit.png',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// 서비스 워커 설치 시 캐시 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 생성 완료');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); //대기 단계 건너뛰기
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    // POST, PUT 등 비-GET 요청은 그냥 네트워크 요청만
    return;
  }

  // GET 요청만 처리
  if (event.request.url.includes('.html') || event.request.url.includes('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
  }
});

// 새 버전의 서비스 워커가 활성화될 때 이전 캐시 삭제
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim()); // 모든 클라이언트에 즉시 제어권 획득
});
