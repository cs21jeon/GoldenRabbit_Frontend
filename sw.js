// 캐시 이름 정의
const CACHE_NAME = 'goldenrabbit-v2';
// 캐시할 파일 목록 - 새로운 페이지들 추가
const urlsToCache = [
  '/',
  '/index.html',
  '/introduction.html',
  '/map-property.html',
  '/recomm-property.html',
  '/search-property.html',
  '/inquiry.html',
  '/css/styles.css',
  '/js/navigation.js',
  '/js/inquiry-form.js',
  '/js/property-api.js',
  '/js/ai-property-search.js',
  '/js/pwa-install.js',
  '/images/favicon_goldenrabbit_01.png',
  '/images/logo_goldenrabbit.jpg',
  '/images/building_image.png',
  '/images/office_outside.jpg',
  '/images/profile_jeonchangseong.jpg',
  '/images/default-thumb.jpg',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// 서비스 워커 설치 시 캐시 저장
self.addEventListener('install', event => {
  console.log('Service Worker installing with cache version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 생성 완료');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('캐시 생성 실패:', error);
      })
  );
  self.skipWaiting(); // 대기 단계 건너뛰기
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    // POST, PUT 등 비-GET 요청은 그냥 네트워크 요청만
    return;
  }
  
  const url = new URL(event.request.url);
  
  // API 요청은 캐시하지 않음
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // HTML, CSS, JS 파일은 네트워크 우선 전략
  if (event.request.url.includes('.html') || 
      event.request.url.includes('.css') || 
      event.request.url.includes('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 네트워크 응답이 성공적인 경우 캐시에 저장
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(event.request);
        })
    );
  } else {
    // 이미지 등 기타 리소스는 캐시 우선 전략
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
  console.log('Service Worker activating with cache version:', CACHE_NAME);
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim()); // 모든 클라이언트에 즉시 제어권 획득
});