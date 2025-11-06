// 자동 업데이트 관리 스크립트
class AutoUpdater {
    constructor() {
        this.currentVersion = null;
        this.checkInterval = 60 * 60 * 1000; // 1시간마다 체크
        this.isChecking = false;
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        try {
            // 페이지 로드 시 초기 버전 설정
            await this.getCurrentVersion();
            this.isInitialized = true;
            
            // 주기적 체크 시작
            this.startPeriodicCheck();
            
            // 페이지 포커스 시 체크
            window.addEventListener('focus', () => {
                this.checkForUpdates();
            });
            
            // 온라인 상태 복구 시 체크
            window.addEventListener('online', () => {
                this.checkForUpdates();
            });
        } catch (error) {
            console.warn('AutoUpdater 초기화 실패:', error);
        }
    }
    
    async getCurrentVersion() {
        try {
            const response = await fetch('/api/version.php', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentVersion = data.version;
                console.log('현재 버전:', data.formatted_time);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('버전 확인 실패:', error);
            throw error;
        }
    }
    
    async checkForUpdates() {
        if (this.isChecking || !this.isInitialized) return;
        
        this.isChecking = true;
        
        try {
            const response = await fetch('/api/version.php', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (this.currentVersion && data.version > this.currentVersion) {
                    this.showUpdateNotification(data.formatted_time);
                }
                
                this.currentVersion = data.version;
            }
        } catch (error) {
            console.warn('업데이트 체크 실패:', error);
        } finally {
            this.isChecking = false;
        }
    }
    
    showUpdateNotification(updateTime) {
        // 중복 알림 방지
        if (document.getElementById('update-notification')) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                border: 2px solid #e38000;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000000;
                max-width: 350px;
                font-family: 'Noto Sans KR', sans-serif;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: #e38000;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        color: white;
                        font-size: 20px;
                    ">🔄</div>
                    <div>
                        <div style="font-weight: bold; color: #333; font-size: 16px;">업데이트 알림</div>
                        <div style="font-size: 12px; color: #666;">업데이트 시간: ${updateTime}</div>
                    </div>
                </div>
                <div style="color: #555; margin-bottom: 15px; line-height: 1.5;">
                    새로운 업데이트가 있습니다.<br>
                    <strong>모든 캐시를 지우고</strong> 최신 버전을 사용하시겠습니까?
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="forceUpdateAndReload()" style="
                        flex: 1;
                        padding: 10px;
                        background: #e38000;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    ">업데이트</button>
                    <button onclick="this.closest('#update-notification').remove()" style="
                        flex: 1;
                        padding: 10px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">나중에</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 30초 후 자동 제거
        setTimeout(() => {
            const element = document.getElementById('update-notification');
            if (element) {
                element.remove();
            }
        }, 30000);
    }
    
    startPeriodicCheck() {
        setInterval(() => {
            this.checkForUpdates();
        }, this.checkInterval);
    }
}

// 자동 업데이터 시작
document.addEventListener('DOMContentLoaded', () => {
    window.autoUpdater = new AutoUpdater();
});

// 강제 업데이트 함수
async function forceUpdateAndReload() {
    console.log('강제 업데이트 시작...');
    
    try {
        // Service Worker 해제
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log('Service Worker 해제됨');
            }
        }
        
        // 캐시 삭제
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => {
                    console.log('캐시 삭제됨:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }
        
        // 알림 제거
        const notification = document.getElementById('update-notification');
        if (notification) {
            notification.remove();
        }
        
        // 잠시 대기 후 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        console.error('업데이트 처리 중 오류:', error);
        // 오류가 발생해도 새로고침은 진행
        window.location.reload();
    }
}

// 전역 함수로 등록
window.forceUpdateAndReload = forceUpdateAndReload;

console.log('자동 업데이터 시작');
