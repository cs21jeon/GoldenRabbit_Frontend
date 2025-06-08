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

// ===== 모달 관리 함수들 =====
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentCategoryModal = null;
    }
}

// 기존 매물 모달 닫기 함수 (기존 기능 유지)
function closeModal() {
    const modal = document.getElementById('modalBackground');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
            document.querySelectorAll('.price-bubble').forEach(el => el.style.display = 'block');
        }
    }
}

// 매물 상세 모달 열기 함수
async function openPropertyDetailModal(recordId) {
    console.log('매물 상세 모달 열기:', recordId);
    
    try {
        // 모달 표시
        const modal = document.getElementById('propertyDetailModal');
        const container = document.getElementById('propertyDetailContainer');
        
        // 로딩 메시지 표시
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <div style="margin-bottom:15px;">
                    <div class="loading-spinner" style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #e38000; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto;"></div>
                </div>
                <div>매물 정보를 불러오는 중입니다...</div>
            </div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // API에서 데이터 가져오기
        console.log('매물 상세 API 호출:', `/api/property-detail-backup?id=${recordId}`);
        const response = await fetch(`/api/property-detail-backup?id=${recordId}`);
        
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('매물 상세 API 응답:', data);
        
        const property = data.property;
        
        if (!property) {
            throw new Error('매물 정보를 찾을 수 없습니다.');
        }
        
        // 매물 정보 렌더링
        container.innerHTML = await renderPropertyDetail(property);
        
    } catch (error) {
        console.error('매물 상세 정보 로드 실패:', error);
        const container = document.getElementById('propertyDetailContainer');
        container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">${error.message || '매물 정보를 불러오지 못했습니다.'}</div>`;
    }
}

// 매물 상세 모달 닫기 함수
function closePropertyDetailModal() {
    const modal = document.getElementById('propertyDetailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 매물 정보 HTML 렌더링 함수
async function renderPropertyDetail(property) {
    const fields = property.fields;
    const recordId = property.id;
    const address = fields['지번 주소'] || '주소 정보 없음';
    
    // 이미지 로드 처리 - 백업 이미지 먼저 확인
    let photoUrl = '/images/default-thumb.jpg';
    
    try {
        // 백업 이미지 확인 API 호출
        console.log('이미지 확인 API 호출:', `/api/check-image?record_id=${recordId}`);
        const imageResponse = await fetch(`/api/check-image?record_id=${recordId}`);
        const imageData = await imageResponse.json();
        console.log('이미지 확인 API 응답:', imageData);
        
        if (imageData.hasImage) {
            // 백업된 이미지 사용 - API에서 반환한 path 속성 사용
            photoUrl = `/airtable_backup/${imageData.path}`;
            console.log('백업 이미지 경로:', photoUrl);
        } else {
            // 백업 이미지가 없는 경우 원본 URL 시도
            if (Array.isArray(fields['대표사진']) && fields['대표사진'][0]?.url) {
                photoUrl = fields['대표사진'][0].url;
                console.log('에어테이블 이미지 URL 사용:', photoUrl);
            } else if (fields['사진링크']) {
                const photoLinks = fields['사진링크'].split(',');
                if (photoLinks[0]) {
                    photoUrl = photoLinks[0].trim();
                    console.log('사진링크 이미지 URL 사용:', photoUrl);
                }
            }
        }
    } catch (error) {
        console.error('이미지 확인 중 오류:', error);
        // 오류 발생 시 기본 이미지 유지
    }
    
    // 가격 형식화
    let priceDisplay = '가격 정보 없음';
    if (fields['매가(만원)']) {
        const price = parseFloat(fields['매가(만원)']);
        priceDisplay = price >= 10000 ? 
            `${(price / 10000).toFixed(1).replace('.0', '')}억원` : 
            `${price.toLocaleString()}만원`;
    }
    
    // HTML 생성
    let html = `
    <div style="padding: 20px;">
        <h2 style="margin-bottom: 20px;">${address}</h2>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background-image: url('${photoUrl}'); background-size: cover; background-position: center; height: 300px; border-radius: 8px;"></div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div class="detail-row">
                        <div class="detail-label">매가</div>
                        <div class="detail-value">${priceDisplay}</div>
                    </div>
    `;
    
    // 토지면적
    if (fields['토지면적(㎡)']) {
        const sqm = parseFloat(fields['토지면적(㎡)']);
        const pyeong = Math.round(sqm / 3.3058);
        html += `
                    <div class="detail-row">
                        <div class="detail-label">토지면적</div>
                        <div class="detail-value">${pyeong}평 (${sqm.toLocaleString()}㎡)</div>
                    </div>
        `;
    }
    
    // 건물면적
    if (fields['건물면적(㎡)']) {
        const sqm = parseFloat(fields['건물면적(㎡)']);
        const pyeong = Math.round(sqm / 3.3058);
        html += `
                    <div class="detail-row">
                        <div class="detail-label">건물면적</div>
                        <div class="detail-value">${pyeong}평 (${sqm.toLocaleString()}㎡)</div>
                    </div>
        `;
    }
    
    // 수익률
    if (fields['융자제외수익률(%)']) {
        html += `
                    <div class="detail-row">
                        <div class="detail-label">수익률</div>
                        <div class="detail-value">${fields['융자제외수익률(%)']}%</div>
                    </div>
        `;
    }
    
    // 층수
    if (fields['층수']) {
        html += `
                    <div class="detail-row">
                        <div class="detail-label">층수</div>
                        <div class="detail-value">${fields['층수']}</div>
                    </div>
        `;
    }
    
    // 주용도
    if (fields['주용도']) {
        html += `
                    <div class="detail-row">
                        <div class="detail-label">주용도</div>
                        <div class="detail-value">${fields['주용도']}</div>
                    </div>
        `;
    }
    
    // 사용승인일
    if (fields['사용승인일']) {
        html += `
                    <div class="detail-row">
                        <div class="detail-label">사용승인일</div>
                        <div class="detail-value">${fields['사용승인일']}</div>
                    </div>
        `;
    }
    
    // 특이사항
    if (fields['특이사항']) {
        html += `
                    <div class="detail-row">
                        <div class="detail-label">특이사항</div>
                        <div class="detail-value">${fields['특이사항']}</div>
                    </div>
        `;
    }
    
    // 마무리 태그
    html += `
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button onclick="openConsultModal('${address}')" class="btn btn-contact" style="flex: 1;">문의하기</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    return html;
}

// ===== 스타일 주입 함수 =====
function injectCategoryStyles() {
    if (!document.getElementById('category-modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'category-modal-styles';
        styleElement.textContent = `
            /* 카테고리 모달 전용 스타일 (CSS 파일에 없는 경우 백업) */
            .category-modal {
                position: relative;
                width: 100%;
                max-width: 600px;
                background: #fff;
                border-radius: 12px;
                overflow-y: auto;
                max-height: 90vh;
                box-sizing: border-box;
            }

            .category-modal .modal-close {
                color: #666;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .category-modal .modal-close:hover {
                background: rgba(255, 255, 255, 1);
                color: #333;
            }

            .modal-image.error {
                background-image: url('/images/default-thumb.jpg');
                background-color: #f0f0f0;
            }

            .modal-image.error::after {
                content: '이미지를 불러올 수 없습니다';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #999;
                font-size: 14px;
                text-align: center;
            }
            
            /* 애니메이션 */
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* 모달 스타일 */
            .modal-content {
                animation: fadeIn 0.3s ease;
            }

            /* 반응형 개선 - 모바일에서 항목과 데이터 간격 줄이기 */
            .detail-row {
                display: flex;
                margin-bottom: 12px;
                border-bottom: 1px solid #eee;
                padding-bottom: 12px;
                flex-wrap: wrap; /* 필요시 줄바꿈 허용 */
                row-gap: 4px; /* 줄 간격 */
            }
            
            .detail-label {
                flex: 0 0 100px;
                font-weight: bold;
                color: #555;
            }
            
            .detail-value {
                flex: 1;
                min-width: 0; /* 텍스트 오버플로우 방지 */
            }

            /* 모바일 대응 개선 */
            @media (max-width: 768px) {
                .category-modal {
                    margin: 10px;
                    max-height: 85vh;
                }
                
                .modal-image {
                    height: 200px;
                }
                
                .detail-row {
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                }
                
                .detail-label {
                    flex: 0 0 80px; /* 모바일에서 라벨 너비 줄이기 */
                }
                
                .modal-image .image-overlay {
                    opacity: 1;
                }
            }
            
            /* 매우 좁은 화면에서는 라벨과 값을 세로로 배치 */
            @media (max-width: 380px) {
                .detail-row {
                    flex-direction: column;
                    gap: 2px;
                }
                
                .detail-label {
                    flex: none;
                    width: 100%;
                }
                
                .detail-value {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// ===== 이벤트 리스너 등록 함수 =====
function registerCategoryEventListeners() {
    console.log('카테고리 이벤트 리스너 등록 중...');
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const propertyModal = document.getElementById('propertyDetailModal');
            if (propertyModal && propertyModal.style.display === 'flex') {
                closePropertyDetailModal();
                return;
            }
            
            if (currentCategoryModal) {
                closeCategoryModal();
                return;
            }
            
            const consultModal = document.getElementById('consultModal');
            if (consultModal && consultModal.style.display === 'flex') {
                closeConsultModal();
                return;
            }
        }
    });

    // 모달 배경 클릭으로 닫기
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal) {
        categoryModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCategoryModal();
            }
        });
    }

    // 카테고리 카드 클릭 이벤트 등록
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const viewId = this.dataset.viewId;
            const category = this.dataset.category;
            console.log(`카테고리 클릭: ${category} (${viewId})`);
            
            loadCategoryProperty(viewId, category);
        });
    });
    
    console.log('카테고리 이벤트 리스너 등록 완료');
}

// ===== 초기화 함수 =====
function initializeCategorySystem() {
    console.log('카테고리 매물 시스템 초기화');
    
    // 스타일 주입 (CSS 파일이 로드되지 않은 경우 백업)
    injectCategoryStyles();
    
    // 이벤트 리스너 등록
    registerCategoryEventListeners();
    
    console.log('카테고리 시스템 초기화 완료');
}