// 단순화된 뉴스 표시 시스템 - 5개 뉴스
async function loadTodayNews() {
    try {
        showSkeletonLoading();
        
        const response = await fetch('/data/latest_news.json?' + new Date().getTime()); // 캐시 방지
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: 뉴스 데이터 로딩 실패`);
        }
        
        const data = await response.json();
        
        if (!data.news || data.news.length === 0) {
            showError('표시할 뉴스가 없습니다.');
            return;
        }
        
        displayNews(data);
        
    } catch (error) {
        console.error('뉴스 로딩 오류:', error);
        showError('뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
}

function showSkeletonLoading() {
    const container = document.getElementById('news-container');
    // 5개 스켈레톤 카드 생성
    const skeletonHtml = Array(5).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-thumbnail"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-summary"></div>
                <div class="skeleton skeleton-summary"></div>
                <div class="skeleton skeleton-summary"></div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = skeletonHtml;
}

function displayNews(data) {
    const container = document.getElementById('news-container');
    const updateTime = document.getElementById('news-update-time');
    
    // 업데이트 시간 표시
    const date = new Date(data.update_time);
    updateTime.textContent = `업데이트: ${date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
    
    // 5개 뉴스 카드 생성
    const newsHtml = data.news.slice(0, 5).map((news, index) => {
        const timeAgo = formatTimeAgo(data.update_time);
        const thumbnailHtml = news.thumbnail && news.thumbnail !== '/images/default_news.jpg' 
            ? `<img src="${news.thumbnail}" alt="${news.title}" class="news-thumbnail" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="news-thumbnail placeholder" style="display:none;">📰 뉴스 이미지</div>`
            : `<div class="news-thumbnail placeholder">📰 뉴스 이미지</div>`;

        return `
            <div class="news-card" style="animation-delay: ${index * 0.1}s">
                ${thumbnailHtml}
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-time">${timeAgo}</span>
                    </div>
                    <h3 class="news-title">${escapeHtml(news.title)}</h3>
                    <p class="news-summary">${escapeHtml(news.summary)}</p>
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                        자세히 보기
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = newsHtml;
    
    // 애니메이션 트리거
    setTimeout(() => {
        const cards = container.querySelectorAll('.news-card');
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 100);
}

function showError(message) {
    const container = document.getElementById('news-container');
    const updateTime = document.getElementById('news-update-time');
    
    updateTime.textContent = '업데이트: 실패';
    
    container.innerHTML = `
        <div class="news-error">
            <h3>뉴스 로딩 실패</h3>
            <p>${escapeHtml(message)}</p>
            <button onclick="loadTodayNews()" style="
                margin-top: 10px; 
                padding: 8px 16px; 
                background: #e38000; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
            ">다시 시도</button>
        </div>
    `;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 1) return '1시간 미만';
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 뉴스 새로고침 함수 (디버깅용)
function refreshNews() {
    console.log('뉴스 새로고침 시작...');
    loadTodayNews();
}

// 자동 새로고침 (30분마다)
function setupAutoRefresh() {
    setInterval(() => {
        console.log('자동 뉴스 새로고침...');
        loadTodayNews();
    }, 30 * 60 * 1000); // 30분
}

// 페이지 로드 시 뉴스 로딩
document.addEventListener('DOMContentLoaded', function() {
    console.log('단순 뉴스 모듈 초기화...');
    loadTodayNews();
    setupAutoRefresh();
    
    // 전역 함수로 등록 (디버깅용)
    window.refreshNews = refreshNews;
    window.loadTodayNews = loadTodayNews;
});

// 페이지 가시성 변경 시 새로고침 (탭 전환 시)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const lastUpdate = localStorage.getItem('news-last-update');
        const now = Date.now();
        
        // 마지막 업데이트로부터 10분 이상 지났으면 새로고침
        if (!lastUpdate || (now - parseInt(lastUpdate)) > 10 * 60 * 1000) {
            console.log('페이지 활성화 - 뉴스 새로고침');
            loadTodayNews();
        }
    }
});