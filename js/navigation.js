// navigation.js - 하단 네비게이션 관리

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation script loaded');
    
    // 현재 페이지 확인 및 활성 네비게이션 설정
    setActiveNavigation();
    
    // 네비게이션 클릭 이벤트 처리
    setupNavigationEvents();
});

/**
 * 현재 페이지에 따라 활성 네비게이션 설정
 */
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    
    // 모든 네비게이션 아이템에서 active 클래스 제거
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 현재 페이지에 해당하는 네비게이션 아이템에 active 클래스 추가
    let activeIndex = 0; // 기본값: 홈
    
    if (currentPath.includes('introduction.html')) {
        activeIndex = 1; // 회사소개
    } else if (currentPath.includes('map-property.html')) {
        activeIndex = 2; // 매물지도
    } else if (currentPath.includes('recomm-property.html')) {
        activeIndex = 3; // 추천매물
    } else if (currentPath.includes('search-property.html')) {
        activeIndex = 4; // 매물검색
    } else if (currentPath.includes('inquiry.html')) {
        activeIndex = 5; // 상담문의
    }
    
    // 해당 인덱스의 네비게이션 아이템에 active 클래스 추가
    if (navItems[activeIndex]) {
        navItems[activeIndex].classList.add('active');
    }
    
    console.log(`Active navigation set to index: ${activeIndex} for path: ${currentPath}`);
}

/**
 * 네비게이션 클릭 이벤트 설정
 */
function setupNavigationEvents() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    
    navItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            // 현재 활성화된 페이지를 다시 클릭한 경우 스크롤을 맨 위로
            if (item.classList.contains('active')) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            // 페이지 전환 시 임시로 활성 상태 변경 (시각적 피드백)
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * 페이지 간 전환 시 부드러운 전환 효과
 */
function smoothPageTransition(url) {
    // 페이지 전환 애니메이션이 필요한 경우 여기에 구현
    // 현재는 기본 브라우저 네비게이션 사용
    window.location.href = url;
}

/**
 * 네비게이션 상태 업데이트 (동적으로 호출 가능)
 */
function updateNavigationState(pageIndex) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    
    navItems.forEach((item, index) => {
        if (index === pageIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * 네비게이션 표시/숨김 제어
 */
function toggleNavigation(show = true) {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = show ? 'flex' : 'none';
    }
}

// 전역 함수로 내보내기 (다른 스크립트에서 사용 가능)
window.NavigationUtils = {
    setActiveNavigation,
    updateNavigationState,
    toggleNavigation,
    smoothPageTransition
};

// 페이지 로드 완료 후 실행되는 추가 초기화
window.addEventListener('load', function() {
    // 네비게이션 바가 완전히 로드된 후 한 번 더 활성 상태 확인
    setTimeout(setActiveNavigation, 100);
});

// 브라우저 뒤로가기/앞으로가기 시 네비게이션 상태 업데이트
window.addEventListener('popstate', function() {
    setTimeout(setActiveNavigation, 100);
});