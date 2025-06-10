// 동적 캐시 이름 생성
let CACHE_NAME = 'goldenrabbit-v1';

// 버전 정보를 가져와서 캐시 이름 업데이트
async function updateCacheName() {
    try {
        const response = await fetch('/api/version.php', { 
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            CACHE_NAME = `goldenrabbit-v${data.version}`;
            console.log('캐시 이름 업데이트:', CACHE_NAME);
        }
    } catch (error) {
        console.warn('캐시 버전 업데이트 실패:', error);
        // 폴백으로 현재 시간 사용
        CACHE_NAME = `goldenrabbit-v${Date.now()}`;
    }
}

// 캐시할 파일 목록 - auto-update.js 추가
const urlsToCache = [
  '/',
  '/index.html',
  '/introduction.html',
  '/map-property.html',
  '/recomm-property.html',
  '/category-view.html',
  '/property-detail.html',
  '/search-property.html',
  '/inquiry.html',
  '/airtable_map.html',
  '/css/styles.css',
  '/js/navigation.js',
  '/js/inquiry-form.js',
  '/js/property-api.js',
  '/js/ai-property-search.js',
  '/js/pwa-install.js',
  '/js/auto-update.js',                    // 새로 추가
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
self.addEventListener('install', async event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      // 버전 정보 가져오기
      await updateCacheName();
      
      console.log('Service Worker installing with cache version:', CACHE_NAME);
      
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('캐시 생성 완료:', CACHE_NAME);
        await cache.addAll(urlsToCache);
        console.log('모든 파일 캐시 완료');
      } catch (error) {
        console.error('캐시 생성 실패:', error);
      }
    })()
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
  
  // API 요청은 항상 네트워크에서 가져오기 (캐시하지 않음)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // API 요청 실패 시에도 캐시 사용하지 않음
        return new Response('API 요청 실패', { status: 503 });
      })
    );
    return;
  }
  
  // HTML, CSS, JS 파일은 네트워크 우선 전략 (최신 버전 우선)
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
            }).catch(error => {
              console.warn('캐시 저장 실패:', error);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          console.log('네트워크 실패, 캐시에서 반환:', event.request.url);
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
                })
                .catch(error => {
                  console.warn('이미지 캐시 저장 실패:', error);
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
  
  event.waitUntil(
    (async () => {
      // 현재 캐시만 유지하고 나머지는 삭제
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(cacheName => {
        if (cacheName.startsWith('goldenrabbit-') && cacheName !== CACHE_NAME) {
          console.log('이전 캐시 삭제:', cacheName);
          return caches.delete(cacheName);
        }
      });
      
      await Promise.all(deletePromises);
      console.log('이전 캐시 정리 완료');
    })()
  );
  
  // 모든 클라이언트에 즉시 제어권 획득
  event.waitUntil(clients.claim());
});

// 주기적으로 업데이트 확인 (1시간마다)
setInterval(async () => {
  try {
    const response = await fetch('/api/version.php', { 
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const newCacheName = `goldenrabbit-v${data.version}`;
      
      if (newCacheName !== CACHE_NAME) {
        console.log('새 버전 감지, Service Worker 업데이트 시작');
        // 새로운 서비스 워커 등록 트리거
        self.registration.update();
      }
    }
  } catch (error) {
    console.warn('정기 업데이트 체크 실패:', error);
  }
}, 3600000); // 1시간마다

// 메시지 리스너 (클라이언트와 통신)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker 로드 완료 - 자동 업데이트 시스템 활성화');