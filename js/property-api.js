// property-api.js - 카테고리 시스템 버전 2.3

// ===== 전역 변수 및 설정 =====
let currentCategoryModal = null;

// 카테고리 설정 객체
const categoryConfig = {
    'viwzEVzrr47fCbDNU': {
        name: '재건축용 토지',
        description: '대지 80평 이상 재건축용 매물',
        fields: ['지번 주소', '토지면적(㎡)', '매가(만원)']
    },
    'viwxS4dKAcQWmB0Be': {
        name: '고수익률 건물',
        description: '수익률 6% 이상 (비용 배제)',
        fields: ['지번 주소', '매가(만원)', '융자제외수익률(%)']
    },
    'viwUKnawSP8SkV9Sx': {
        name: '저가단독주택',
        description: '단독의 꿈. 20억 이하 저가 단독주택',
        fields: ['지번 주소', '매가(만원)', '사용승인일']
    }
};

// ===== 카테고리 매물 로딩 함수 =====
async function loadCategoryProperty(viewId, categoryName) {
    const loadingElement = document.getElementById('categoryLoading');
    
    try {
        // 로딩 표시
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        console.log(`대표 매물 로딩: ${categoryName} (뷰: ${viewId})`);
        
        // API 호출 - 백업 데이터 API로 변경
        const response = await fetch(`/api/category-property-backup?view=${viewId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API 요청 실패: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API 응답:', data);
        
        if (data && data.records && data.records.length > 0) {
            // 대표 매물 표시
            showCategoryModal(data.records[0], categoryName, viewId);
        } else {
            console.warn('대표 매물을 찾을 수 없습니다.');
            alert('현재 해당 카테고리의 대표 매물이 없습니다.');
        }
        
    } catch (error) {
        console.error('대표 매물 로딩 실패:', error);
        alert(`매물 정보를 불러오는 중 오류가 발생했습니다.\n${error.message}`);
    } finally {
        // 로딩 숨김
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// ===== 카테고리 모달 표시 함수 =====
function showCategoryModal(property, categoryName, viewId) {
    console.log('모달 표시:', property);
    
    const modal = document.getElementById('categoryModal');
    if (!modal) {
        console.error('카테고리 모달 요소를 찾을 수 없습니다.');
        return;
    }
    
    const fields = property.fields;
    const recordId = property.id;
    
    // 모달 제목과 설명 설정
    const config = categoryConfig[viewId];
    const title = config ? config.name : categoryName;
    const description = config ? config.description : '';
    
    const titleElement = document.getElementById('modalCategoryTitle');
    const descriptionElement = document.getElementById('modalCategoryDescription');
    
    if (titleElement) titleElement.textContent = title;
    if (descriptionElement) descriptionElement.textContent = description;
    
    // 이미지 업데이트 - 백업 이미지 경로 사용
    updatePropertyImage(recordId, fields);
    
    const recordDetailUrl = recordId;  // URL 대신 recordId만 저장
    
    // 2. 카테고리 뷰 전체보기 링크 (추천매물 모아보기 버튼용)
    const categoryViewUrl = `/category-view.html?view=${viewId}&category=${encodeURIComponent(categoryName)}`;
    
    console.log('생성된 링크들:');
    console.log('- 개별 매물:', recordDetailUrl);
    console.log('- 카테고리 뷰:', categoryViewUrl);
    
    const imageElement = document.getElementById('modalPropertyImage');
    if (imageElement) {
        // data-record-id 속성 추가 (중요: 클릭 이벤트용)
        imageElement.setAttribute('data-record-id', recordId);
        
        // 사진 클릭 시 내부 모달로 상세보기
        imageElement.onclick = function() {
            console.log('사진 클릭, 레코드 ID:', recordId);
            
            // 카테고리 모달 닫기
            closeCategoryModal();
            
            // 상세 모달 열기
            if (typeof openPropertyDetailModal === 'function') {
                openPropertyDetailModal(recordId);
            } else if (typeof window.openPropertyDetailModal === 'function') {
                window.openPropertyDetailModal(recordId);
            } else {
                console.warn('openPropertyDetailModal 함수를 찾을 수 없습니다.');
                // 폴백: 페이지 이동
                window.location.href = `/property-detail.html?id=${recordId}`;
            }
        };
    }
    
    // 수정: 상세내용보기 버튼 설정
    const detailBtn = document.getElementById('modalDetailBtn');
    if (detailBtn) {
        // data-record-id 속성 추가 (중요: 클릭 이벤트용)
        detailBtn.setAttribute('data-record-id', recordId);
        
        detailBtn.href = "javascript:void(0);";  // 링크 비활성화
        detailBtn.onclick = function(e) {
            e.preventDefault();
            console.log('상세내용보기 클릭, 레코드 ID:', recordId);
            
            // 카테고리 모달 닫기
            closeCategoryModal();
            
            // 상세 모달 열기
            if (typeof openPropertyDetailModal === 'function') {
                openPropertyDetailModal(recordId);
            } else if (typeof window.openPropertyDetailModal === 'function') {
                window.openPropertyDetailModal(recordId);
            } else {
                console.warn('openPropertyDetailModal 함수를 찾을 수 없습니다.');
                // 폴백: 페이지 이동
                window.location.href = `/property-detail.html?id=${recordId}`;
            }
        };
    }
    
    // 문의하기 버튼 설정
    const inquiryBtn = document.getElementById('modalInquiryBtn');
    if (inquiryBtn) {
        const address = fields['지번 주소'] || '매물';
        inquiryBtn.onclick = function() {
            // 카테고리 모달 먼저 닫기
            closeCategoryModal();
            // 상담 모달 열기
            if (typeof openConsultModal === 'function') {
                openConsultModal(address);
            } else {
                console.warn('openConsultModal 함수를 찾을 수 없습니다.');
            }
        };
    }

    // 🔧 카테고리 전체 매물 보기 버튼 설정
    const categoryViewBtn = document.getElementById('modalCategoryViewBtn');
    if (categoryViewBtn) {
        categoryViewBtn.href = categoryViewUrl;
        categoryViewBtn.onclick = function(e) {
            e.preventDefault();
            console.log('카테고리 전체 매물 보기 클릭, 링크:', categoryViewUrl);
            window.open(categoryViewUrl, '_blank');
        };
        
        // 버튼 텍스트도 카테고리에 맞게 변경
        const categoryTexts = {
            '재건축용 토지': '재건축용 토지 전체 보기',
            '고수익률 건물': '고수익률 건물 전체 보기',
            '저가단독주택': '저가단독주택 전체 보기'
        };
        categoryViewBtn.textContent = categoryTexts[categoryName] || '이 카테고리 전체 매물 보기';
    }
    
    // 매물 상세 정보 생성
    const detailsContainer = document.getElementById('modalPropertyDetails');
    if (detailsContainer) {
        detailsContainer.innerHTML = generatePropertyDetails(fields, categoryName);
    }
    
    // 모달 표시
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    currentCategoryModal = modal;
    
    console.log('카테고리 모달 표시 완료');
}

// 백업 이미지 로드 함수
async function updatePropertyImage(recordId, fields) {
    const imageElement = document.getElementById('modalPropertyImage');
    if (!imageElement) return;
    
    // 기본 이미지 먼저 설정
    let defaultPhotoUrl = '/images/default-thumb.jpg';
    imageElement.style.backgroundImage = `url('${defaultPhotoUrl}')`;
    
    try {
        // 백업 이미지 존재 여부 확인 (새로운 API 호출)
        const response = await fetch(`/api/check-image?record_id=${recordId}`);
        const data = await response.json();
        console.log('이미지 확인 API 응답:', data);
        
        if (data.hasImage) {
            // 백업 이미지 경로 - API가 반환한 path 속성 사용
            const backupImagePath = `/airtable_backup/${data.path}`;
            console.log('백업 이미지 경로:', backupImagePath);
            
            // 이미지 요소 업데이트
            imageElement.style.backgroundImage = `url('${backupImagePath}')`;
        } else {
            // 백업 이미지가 없는 경우 에어테이블 원본 URL 시도
            let photoUrl = defaultPhotoUrl;
            
            if (Array.isArray(fields['대표사진']) && fields['대표사진'][0]?.url) {
                photoUrl = fields['대표사진'][0].url;
            } else if (fields['사진링크']) {
                const photoLinks = fields['사진링크'].split(',');
                if (photoLinks[0]) {
                    photoUrl = photoLinks[0].trim();
                }
            }
            
            // 이미지 로딩 시도
            const img = new Image();
            img.onload = function() {
                imageElement.style.backgroundImage = `url('${photoUrl}')`;
            };
            img.onerror = function() {
                console.warn('이미지 로딩 실패, 기본 이미지 유지:', photoUrl);
            };
            img.src = photoUrl;
        }
    } catch (error) {
        console.error('이미지 확인 중 오류:', error);
    }
}

// ===== 매물 상세 정보 생성 함수 =====
function generatePropertyDetails(fields, categoryName) {
    let detailsHtml = '';
    
    // 지번 주소 (공통)
    if (fields['지번 주소']) {
        detailsHtml += createDetailRow('위치', fields['지번 주소']);
    }
    
    // 매가 (공통)
    if (fields['매가(만원)']) {
        const priceDisplay = formatPrice(fields['매가(만원)']);
        detailsHtml += createDetailRow('매가', priceDisplay);
    }
    
    // 카테고리별 추가 정보
    switch (categoryName) {
        case '재건축용 토지':
            if (fields['토지면적(㎡)']) {
                const sqm = fields['토지면적(㎡)'];
                const pyeong = Math.round(sqm / 3.3058);
                detailsHtml += createDetailRow('토지면적', `${pyeong}평 (${sqm.toLocaleString()}㎡)`);
            }
            break;
            
        case '고수익률 건물':
            if (fields['융자제외수익률(%)']) {
                detailsHtml += createDetailRow('수익률', `${fields['융자제외수익률(%)']}%`);
            }
            break;
            
        case '저가단독주택':
            if (fields['사용승인일']) {
                const year = fields['사용승인일'].substring(0, 4);
                detailsHtml += createDetailRow('사용승인년도', `${year}년`);
            }
            break;
    }
    
    return detailsHtml;
}

// ===== 헬퍼 함수들 =====
function createDetailRow(label, value) {
    return `
        <div class="detail-row">
            <div class="detail-label">${label}</div>
            <div class="detail-value">${value}</div>
        </div>
    `;
}

function formatPrice(priceInWon) {
    if (!priceInWon) return '가격 정보 없음';
    
    const price = parseFloat(priceInWon);
    if (price >= 10000) {
        const billions = (price / 10000).toFixed(1);
        return `${billions.replace('.0', '')}억원`;
    } else {
        return `${price.toLocaleString()}만원`;
    }
}