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
        
        // API 호출 - 기본 API 사용 (백업에서 자동으로 가져옴)
        const response = await fetch(`/api/category-property?view=${viewId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API 요청 실패: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API 응답:', data);
        
        // 응답 구조 확인 개선
        if (data && data.success !== false) {
            if (data.records && data.records.length > 0) {
                // 대표 매물 표시
                showCategoryModal(data.records[0], categoryName, viewId);
            } else if (data.error) {
                console.warn('API 오류:', data.error);
                alert(`오류: ${data.message || data.error}`);
            } else {
                console.warn('대표 매물을 찾을 수 없습니다.');
                alert('현재 해당 카테고리의 대표 매물이 없습니다.');
            }
        } else {
            throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
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
    
    // 이미지 설정 - 백업 이미지 우선 사용
    const imageElement = document.getElementById('modalPropertyImage');
    
    if (imageElement) {
        // 먼저 기본 이미지로 설정
        imageElement.style.backgroundImage = `url('/images/default-thumb.jpg')`;
        
        // 백업 이미지 확인 후 업데이트
        loadBackupImage(recordId).then(imageUrl => {
            console.log(`백업 이미지 로드 결과: ${imageUrl}`);
            imageElement.style.backgroundImage = `url('${imageUrl}')`;
        }).catch(error => {
            console.error('백업 이미지 로드 실패:', error);
            // 에어테이블 이미지 시도 (폴백)
            tryAirtableImage(fields, imageElement);
        });

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
        
        // 상세내용보기 버튼 설정
        const detailBtn = document.getElementById('modalDetailBtn');
        if (detailBtn) {
            detailBtn.href = "javascript:void(0);";
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

    // 카테고리 전체 매물 보기 버튼 설정
    const categoryViewBtn = document.getElementById('modalCategoryViewBtn');
    if (categoryViewBtn) {
        const categoryViewUrl = `/category-view.html?view=${viewId}&category=${encodeURIComponent(categoryName)}`;
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

// ===== 백업 이미지 로딩 함수 =====
async function loadBackupImage(recordId) {
    try {
        console.log(`백업 이미지 확인 중: ${recordId}`);
        
        // 백업 이미지 API 호출
        const response = await fetch(`/api/check-image?record_id=${recordId}`);
        
        if (!response.ok) {
            throw new Error(`이미지 확인 API 실패: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('이미지 확인 응답:', data);
        
        if (data.hasImage && data.filename) {
            const backupImageUrl = `/airtable_backup/images/${recordId}/${data.filename}`;
            console.log(`백업 이미지 URL: ${backupImageUrl}`);
            
            // 이미지가 실제로 로드 가능한지 확인
            return await testImageLoad(backupImageUrl);
        } else {
            throw new Error('백업 이미지 없음');
        }
        
    } catch (error) {
        console.error('백업 이미지 로드 실패:', error);
        throw error;
    }
}

// ===== 이미지 로드 테스트 함수 =====
function testImageLoad(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            console.log(`이미지 로드 성공: ${imageUrl}`);
            resolve(imageUrl);
        };
        
        img.onerror = function() {
            console.error(`이미지 로드 실패: ${imageUrl}`);
            reject(new Error(`이미지 로드 실패: ${imageUrl}`));
        };
        
        // 타임아웃 설정 (5초)
        setTimeout(() => {
            reject(new Error(`이미지 로드 타임아웃: ${imageUrl}`));
        }, 5000);
        
        img.src = imageUrl;
    });
}

// ===== 에어테이블 이미지 시도 함수 (폴백) =====
function tryAirtableImage(fields, imageElement) {
    console.log('에어테이블 이미지 시도 중...');
    
    let photoUrl = null;
    
    // 대표사진 필드 확인
    if (Array.isArray(fields['대표사진']) && fields['대표사진'][0]?.url) {
        photoUrl = fields['대표사진'][0].url;
    } 
    // 사진링크 필드 확인
    else if (fields['사진링크']) {
        const photoLinks = fields['사진링크'].split(',');
        if (photoLinks[0]) {
            photoUrl = photoLinks[0].trim();
        }
    }
    
    if (photoUrl) {
        console.log(`에어테이블 이미지 URL 시도: ${photoUrl}`);
        
        testImageLoad(photoUrl).then(validUrl => {
            console.log('에어테이블 이미지 로드 성공');
            imageElement.style.backgroundImage = `url('${validUrl}')`;
        }).catch(error => {
            console.warn('에어테이블 이미지도 실패, 기본 이미지 유지:', error);
            // 이미 기본 이미지로 설정되어 있으므로 추가 작업 불필요
        });
    } else {
        console.log('에어테이블 이미지 URL 없음, 기본 이미지 유지');
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

            /* 모바일 대응 */
            @media (max-width: 768px) {
                .category-modal {
                    margin: 10px;
                    max-height: 85vh;
                }
                
                .modal-image {
                    height: 200px;
                }
                
                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .detail-label {
                    flex: none;
                }
                
                .detail-value {
                    text-align: left;
                }

                .modal-image .image-overlay {
                    opacity: 1;
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
        if (e.key === 'Escape' && currentCategoryModal) {
            closeCategoryModal();
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

// ===== DOM 로드 완료 시 실행 =====
document.addEventListener('DOMContentLoaded', function() {
    // 카테고리 시스템 초기화
    initializeCategorySystem();
});

// ===== 전역 함수로 내보내기 =====
window.loadCategoryProperty = loadCategoryProperty;
window.showCategoryModal = showCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.closeModal = closeModal; // 기존 매물 모달 지원

// 기존 매물 관련 함수들 (기존 기능 유지를 위해)
window.openRecordDetail = (url) => window.open(url, '_blank');

// ===== 전역 스코프에 함수 노출 =====
window.loadBackupImage = loadBackupImage;
window.testImageLoad = testImageLoad;

// ===== 디버깅용 함수 =====
window.debugImageFunctions = {
    loadBackupImage: loadBackupImage,
    testImageLoad: testImageLoad,
    checkImage: async (recordId) => {
        try {
            const response = await fetch(`/api/check-image?record_id=${recordId}`);
            const data = await response.json();
            console.log('이미지 확인 결과:', data);
            return data;
        } catch (error) {
            console.error('이미지 확인 오류:', error);
            return null;
        }
    }
};

// 브라우저 뒤로가기 처리
window.addEventListener('popstate', function(event) {
    if (currentCategoryModal && currentCategoryModal.style.display === 'flex') {
        closeCategoryModal();
    } else if (event.state?.modalOpen) {
        closeModal();
    }
});

console.log('이미지 로딩 시스템 v2.0 로드 완료');
console.log('Property API v2.0 (카테고리 시스템) 로드 완료');