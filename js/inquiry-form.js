// 상담 문의 폼 제출 처리 스크립트 - 모든 문제 수정 버전 (통합 ID 지원)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM이 로드되었습니다. 상담 폼 초기화를 시작합니다.');
    
    // z-index 문제 해결을 위한 스타일 추가
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        #privacyModal {
            z-index: 10100 !important; /* 최상위 z-index */
        }
        #completionModal {
            z-index: 10100 !important; /* 최상위 z-index */
        }
        #consultModal {
            z-index: 300000 !important; /* 추천매물 모달보다 높고, 개인정보/완료 모달보다 낮은 z-index */
        }
        #modalBackground, #categoryModal {
            z-index: 9900 !important; /* 추천매물 모달 */
        }
    `;
    document.head.appendChild(styleElement);
    console.log('모달 z-index 스타일이 추가되었습니다.');
    
    // 필수 DOM 요소 참조
    const consultForm = document.getElementById('consultForm');
    const submitButton = document.getElementById('submitConsult');
    
    // DOM 요소 존재 확인
    console.log('consultForm 존재 여부:', !!consultForm);
    console.log('submitButton 존재 여부:', !!submitButton);
    
    if (!consultForm || !submitButton) {
        console.error('필요한 HTML 요소를 찾을 수 없습니다.');
        console.log('현재 페이지에는 상담 폼이 없습니다.');
        
        // 전역 함수는 여전히 등록 (다른 페이지에서 호출될 수 있음)
        registerGlobalFunctions();
        return;
    }
    
    // 모달 준비
    prepareModals();
    
    // 메인 폼에 submit 이벤트 리스너 직접 추가 (중요: 기본 동작 방지)
    consultForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 폼 제출 기본 동작 중지
        console.log('폼 제출 기본 동작 중지됨');
            
        // 폼이 제출되었을 때 submitButton 클릭과 동일한 효과
        if (submitButton) {
            submitButton.click();
        }
    });
    
    // 상담 신청 버튼 클릭 이벤트 핸들러
    console.log('상담 신청 버튼에 이벤트 리스너를 등록합니다.');
    submitButton.addEventListener('click', function(e) {
        console.log('상담 신청 버튼이 클릭되었습니다.');
        e.preventDefault(); // 추가적인 안전장치
        
        // 폼 유효성 검사
        const isValid = validateForm();
        if (!isValid) {
            return; // 유효성 검사 실패 시 중단
        }
        
        // 개인정보 동의 모달 표시
        const privacyModal = document.getElementById('privacyModal');
        if (privacyModal) {
            privacyModal.style.display = 'block';
            console.log('개인정보 동의 모달을 표시합니다.');
        } else {
            console.error('privacyModal을 찾을 수 없습니다.');
        }
    });
    
    // 폼 유효성 검사 함수 - 수정됨 (통합 ID 지원)
    function validateForm() {
        console.log('폼 유효성 검사 시작');
        
        // 현재 활성화된 상담 폼이 메인인지 모달인지 확인
        const consultModal = document.getElementById('consultModal');
        const isMainForm = (!consultModal || getComputedStyle(consultModal).display === 'none');
        
        let propertyType, phone, message;
        let targetFormStatus;
        
        if (isMainForm) {
            // 메인 폼 검사 - 통합 ID 사용
            propertyType = getElementValue('propertyType');
            phone = getElementValue('phone');
            message = getElementValue('message');
            targetFormStatus = document.getElementById('formStatus');
            console.log('메인 폼 유효성 검사 중...');
        } else {
            // 모달 폼 검사 - 기존 modal 접두사 ID와 통합 ID 모두 지원
            propertyType = getElementValue('modalpropertyType') || getElementValue('propertyType');
            phone = getElementValue('modalphone') || getElementValue('phone');
            message = getElementValue('modalmessage') || getElementValue('message');
            
            // 모달 내 formStatus 찾기
            targetFormStatus = consultModal?.querySelector('#formStatus') || document.getElementById('formStatus');
            console.log('모달 폼 유효성 검사 중...');
        }
        
        console.log('폼 유효성 검사 결과:', {
            isMainForm: isMainForm,
            propertyType: propertyType,
            phone: phone,
            message: message
        });
        
        if (!propertyType || !phone || !message) {
            if (targetFormStatus) {
                targetFormStatus.style.display = 'block';
                targetFormStatus.textContent = '필수 입력 항목을 모두 입력해 주세요.';
                targetFormStatus.style.color = 'red';
            } else {
                alert('필수 입력 항목을 모두 입력해 주세요.');
            }
            return false;
        }
        
        return true;
    }
    
    // 요소 값 가져오기 헬퍼 함수
    function getElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }
    
    // 모달 준비 함수
    function prepareModals() {
        console.log('모달을 준비합니다.');
        
        // 이미 모달이 있는지 확인
        if (document.getElementById('privacyModal')) {
            console.log('이미 모달이 존재합니다. 새로 생성하지 않습니다.');
            
            // 기존 모달의 z-index 수정
            const privacyModal = document.getElementById('privacyModal');
            const completionModal = document.getElementById('completionModal');
            
            if (privacyModal) {
                privacyModal.style.zIndex = "10100";
                console.log('privacyModal z-index 수정: 10100');
            }
            
            if (completionModal) {
                completionModal.style.zIndex = "10100";
                console.log('completionModal z-index 수정: 10100');
            }
            
            // 상담 모달의 z-index도 수정
            const consultModal = document.getElementById('consultModal');
            if (consultModal) {
                consultModal.style.zIndex = "300000";
                console.log('consultModal z-index 수정: 300000');
            }
            
            setupExistingModals();
            return;
        }
        
        // 개인정보 동의 모달 요소 생성 및 추가 (z-index 수정)
        const modalHTML = `
        <div id="privacyModal" class="modal" style="display: none; position: fixed; z-index: 10100; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); overflow: auto;">
            <div class="modal-content" style="background-color: white; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0;">개인정보 수집 및 이용 동의</h3>
                <div style="margin-bottom: 20px; height: 150px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
                    <p>1. 수집항목: 연락처, 이메일, 문의내용</p>
                    <p>2. 수집목적: 부동산 상담 및 답변 제공</p>
                    <p>3. 보유기간: 상담 완료 후 6개월</p>
                    <p>귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 동의 거부 시 상담 서비스 이용이 제한됩니다.</p>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <input type="checkbox" id="privacyCheck" style="margin-right: 8px;">
                    <label for="privacyCheck">개인정보 수집 및 이용에 동의합니다.</label>
                </div>
                <div style="text-align: center;">
                    <button id="agreeBtn" disabled style="padding: 8px 16px; background-color: #ccc; color: white; border: none; border-radius: 4px; cursor: not-allowed; margin-right: 10px;">동의하기</button>
                    <button id="cancelBtn" style="padding: 8px 16px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">취소</button>
                </div>
            </div>
        </div>
        
        <div id="completionModal" class="modal" style="display: none; position: fixed; z-index: 10100; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); overflow: auto;">
            <div class="modal-content" style="background-color: white; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <h3 style="margin-top: 0; color: green;">상담접수가 완료되었습니다</h3>
                <p>빠른시일 내에 회신드리겠습니다.</p>
                <button id="closeBtn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 15px;">닫기</button>
            </div>
        </div>`;
        
        // 모달 HTML을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('모달 HTML이 추가되었습니다. z-index 설정: 10100');
        
        setupExistingModals();
    }
    
    // 이미 존재하는 모달에 이벤트 리스너 설정
    function setupExistingModals() {
        // 모달 및 관련 요소
        const privacyModal = document.getElementById('privacyModal');
        const completionModal = document.getElementById('completionModal');
        const privacyCheck = document.getElementById('privacyCheck');
        const agreeBtn = document.getElementById('agreeBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const closeBtn = document.getElementById('closeBtn');
        
        if (!privacyModal || !completionModal || !privacyCheck || !agreeBtn || !cancelBtn || !closeBtn) {
            console.error('모달 관련 요소를 찾을 수 없습니다.');
            console.log({
                privacyModal: !!privacyModal,
                completionModal: !!completionModal,
                privacyCheck: !!privacyCheck,
                agreeBtn: !!agreeBtn,
                cancelBtn: !!cancelBtn,
                closeBtn: !!closeBtn
            });
            return;
        }
        
        console.log('모달 요소들을 찾았습니다. 이벤트 리스너를 등록합니다.');
        
        // 체크박스 상태에 따라 동의하기 버튼 활성화/비활성화
        privacyCheck.addEventListener('change', function() {
            console.log('개인정보 동의 체크박스 상태 변경:', this.checked);
            if (this.checked) {
                agreeBtn.disabled = false;
                agreeBtn.style.backgroundColor = '#4CAF50';
                agreeBtn.style.cursor = 'pointer';
            } else {
                agreeBtn.disabled = true;
                agreeBtn.style.backgroundColor = '#ccc';
                agreeBtn.style.cursor = 'not-allowed';
            }
        });
        
        // 취소 버튼 클릭 시 모달 닫기 및 상태 메시지 초기화
        cancelBtn.addEventListener('click', function() {
            console.log('취소 버튼이 클릭되었습니다.');
            privacyModal.style.display = 'none';
            
            // 모든 상태 메시지 숨기기
            hideAllFormStatus();
        });
        
        // 완료 모달의 닫기 버튼 클릭 시 모달 닫기 및 성공 메시지 표시 - 수정됨
        closeBtn.addEventListener('click', function() {
            console.log('완료 모달의 닫기 버튼이 클릭되었습니다.');
            
            // 1. 완료 모달 닫기
            completionModal.style.display = 'none';
            
            // 2. 개인정보 동의 모달도 확실히 닫기
            privacyModal.style.display = 'none';
            
            // 3. 상담 모달 닫기 (추천매물 모달은 유지)
            const consultModal = document.getElementById('consultModal');
            if (consultModal && consultModal.style.display !== 'none') {
                consultModal.style.display = 'none';
                
                // 추천매물 모달이 열려있는 경우 body의 overflow는 hidden 유지
                const modalBackground = document.getElementById('modalBackground');
                const categoryModal = document.getElementById('categoryModal');
                if ((!modalBackground || modalBackground.style.display === 'none') && 
                    (!categoryModal || categoryModal.style.display === 'none')) {
                    document.body.style.overflow = 'auto'; // 다른 모달이 없을 때만 스크롤 복원
                }
            }
            
            // 4. 메인 폼의 성공 메시지 표시 (문제 1 해결 - 위치 이동 방지)
            const isOnContactSection = window.location.pathname.includes('inquiry.html') || 
                                     window.location.hash === '#contact' || 
                                     document.querySelector('#contact')?.getBoundingClientRect().top < window.innerHeight;
            
            if (isOnContactSection) {
                const formStatus = document.getElementById('formStatus');
                if (formStatus) {
                    formStatus.style.display = 'block';
                    formStatus.textContent = '상담신청이 정상적으로 처리되었습니다.';
                    formStatus.style.color = 'green';
                }
            }
            
            // 5. 모든 폼 초기화
            resetAllForms();
            
            console.log('모든 모달이 정리되고 폼이 초기화되었습니다.');
        });
        
        // 동의하기 버튼 클릭 시 실제 폼 제출 처리 - 수정됨 (통합 ID 지원)
        agreeBtn.addEventListener('click', async function() {
            console.log('동의하기 버튼이 클릭되었습니다.');
            privacyModal.style.display = 'none'; // 동의 모달 닫기
            
            // 로딩 표시
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '접수 중...';
            
            // 상태 메시지 표시
            const formStatus = getActiveFormStatus();
            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.textContent = '상담 문의를 접수 중입니다...';
                formStatus.style.color = '#666';
            }
            
            // 현재 활성화된 폼 확인 (메인 폼인지 모달 폼인지)
            const consultModal = document.getElementById('consultModal');
            const isMainForm = (!consultModal || getComputedStyle(consultModal).display === 'none');
            
            // 폼 데이터 수집 - 통합 ID 지원
            let propertyType, phone, email, message;
            
            if (isMainForm) {
                // 메인 폼에서 데이터 수집 - 통합 ID 사용
                propertyType = getElementValue('propertyType');
                phone = getElementValue('phone');
                email = getElementValue('email');
                message = getElementValue('message');
            } else {
                // 모달 폼에서 데이터 수집 - 기존 modal 접두사 ID와 통합 ID 모두 지원
                propertyType = getElementValue('modalpropertyType') || getElementValue('propertyType');
                phone = getElementValue('modalphone') || getElementValue('phone');
                email = getElementValue('modalemail') || getElementValue('email');
                message = getElementValue('modalmessage') || getElementValue('message');
            }
            
            // 서버에 보낼 데이터
            const data = {
                propertyType: propertyType,
                phone: phone,
                email: email,
                message: message
            };
            
            console.log('전송할 데이터:', data); // 디버깅용
            
            try {
                // 서버리스 함수 호출
                console.log('서버에 데이터 전송 중...');
                const response = await fetch('/api/submit-inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                // 응답 로깅 (디버깅용)
                console.log('서버 응답 상태:', response.status);
                const responseData = await response.json();
                console.log('서버 응답 데이터:', responseData);
                
                if (!response.ok) {
                    const errorMsg = responseData.error || responseData.details || '알 수 없는 오류가 발생했습니다.';
                    throw new Error(`서버 요청 실패: ${errorMsg}`);
                }
                
                // 폼 초기화
                resetAllForms();
                
                console.log('폼이 초기화되었습니다.');
                
                // 상태 메시지 숨기기 (팝업으로 대체)
                hideAllFormStatus();
                
                // 완료 모달 표시
                completionModal.style.display = 'block';
                console.log('완료 모달이 표시되었습니다.');
                
            } catch (error) {
                console.error('상담 접수 실패:', error);
                // 오류 메시지
                if (formStatus) {
                    formStatus.textContent = `상담 접수 중 오류가 발생했습니다: ${error.message}`;
                    formStatus.style.color = 'red';
                }
            } finally {
                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                console.log('버튼 상태가 복원되었습니다.');
            }
        });
    }
    
    // 활성화된 폼의 상태 메시지 요소 가져오기
    function getActiveFormStatus() {
        const consultModal = document.getElementById('consultModal');
        const isMainForm = (!consultModal || getComputedStyle(consultModal).display === 'none');
        
        if (isMainForm) {
            return document.getElementById('formStatus');
        } else {
            return consultModal?.querySelector('#formStatus') || document.getElementById('formStatus');
        }
    }
    
    // 모든 상태 메시지 숨기기
    function hideAllFormStatus() {
        const allFormStatus = document.querySelectorAll('#formStatus');
        allFormStatus.forEach(status => {
            if (status) status.style.display = 'none';
        });
    }
    
    // 모든 폼 초기화 함수 - 통합 ID 지원
    function resetAllForms() {
        // 메인 폼 초기화
        if (consultForm) {
            consultForm.reset();
        }
        
        // 모든 가능한 ID의 요소들 초기화
        const idsToReset = [
            'propertyType', 'modalpropertyType',
            'phone', 'modalphone', 
            'email', 'modalemail',
            'message', 'modalmessage'
        ];
        
        idsToReset.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        // 개인정보 동의 체크박스 초기화
        const privacyCheck = document.getElementById('privacyCheck');
        if (privacyCheck) {
            privacyCheck.checked = false;
            // 동의하기 버튼 비활성화
            const agreeBtn = document.getElementById('agreeBtn');
            if (agreeBtn) {
                agreeBtn.disabled = true;
                agreeBtn.style.backgroundColor = '#ccc';
                agreeBtn.style.cursor = 'not-allowed';
            }
        }
    }
    
    // 추천매물 모달에서 상담신청 버튼 클릭 시 이벤트 처리를 위한 MutationObserver
    const observePropertyModal = function() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.id === 'modalBackground' || node.id === 'categoryModal' ||
                            (node.nodeType === 1 && (node.querySelector('#modalBackground') || node.querySelector('#categoryModal')))) {
                            console.log('추천매물 모달이 추가되었습니다.');
                            
                            // 모달이 추가된 후 약간의 지연시간을 두고 처리
                            setTimeout(function() {
                                // 새로 추가된 모달에서 상담신청 버튼 찾기
                                const btns = document.querySelectorAll('#modalBackground .btn-contact, #categoryModal .btn-contact');
                                console.log('찾은 상담신청 버튼 수:', btns.length);
                                
                                btns.forEach(function(btn) {
                                    // 기존 클릭 이벤트 리스너 제거
                                    const clone = btn.cloneNode(true);
                                    btn.parentNode.replaceChild(clone, btn);
                                    
                                    // 새 이벤트 리스너 추가
                                    clone.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        console.log('추천매물 모달에서 상담신청 버튼 클릭됨');
                                        
                                        // 주소 추출
                                        let address = '';
                                        try {
                                            // 모달 제목에서 주소 추출
                                            const modalContent = clone.closest('.modal-content');
                                            if (modalContent) {
                                                const titleElement = modalContent.querySelector('.modal-title');
                                                if (titleElement) {
                                                    address = titleElement.textContent.trim();
                                                    console.log('추출된 주소:', address);
                                                }
                                            }
                                        } catch(err) {
                                            console.error('주소 추출 오류:', err);
                                        }
                                        
                                        // 상담 모달 열기
                                        window.openConsultModal(address);
                                        
                                        return false;
                                    });
                                });
                            }, 300);
                        }
                    }
                }
                
                // 추천매물 모달 속성 변경 감지 (display 변경)
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' && 
                    (mutation.target.id === 'modalBackground' || mutation.target.id === 'categoryModal')) {
                    
                    const style = window.getComputedStyle(mutation.target);
                    if (style.display === 'flex' || style.display === 'block') {
                        console.log('추천매물 모달이 표시되었습니다.');
                        
                        // 모달 z-index 확인 및 조정
                        const zIndex = parseInt(style.zIndex);
                        if (zIndex > 10000 || isNaN(zIndex)) {
                            mutation.target.style.zIndex = "9900";
                            console.log('추천매물 모달 z-index 조정: 9900');
                        }
                    }
                }
            });
        });
        
        // body의 변경 감시
        observer.observe(document.body, { 
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('추천매물 모달 변경 감시가 시작되었습니다.');
    };
    
    // 추천매물 모달 감시 시작
    observePropertyModal();
    
    // 전역 함수 등록
    registerGlobalFunctions();
    
    console.log('상담 폼 초기화가 완료되었습니다.');
    
    // 전역 함수 등록 함수
    function registerGlobalFunctions() {
        // 외부에서 상담 모달을 열 수 있도록 전역 함수 수정
        window.openConsultModal = function(address) {
            console.log('openConsultModal 호출됨:', address);
            
            // 콘설트 모달 열기
            const consultModal = document.getElementById('consultModal');
            if (consultModal) {
                // z-index 설정 확인 및 조정 
                const currentZIndex = parseInt(window.getComputedStyle(consultModal).zIndex);
                if (currentZIndex < 300000 || isNaN(currentZIndex)) {
                    consultModal.style.zIndex = "300000";
                    console.log('consultModal z-index 설정: 300000');
                }
                
                // 메시지 필드에 매물 주소 설정 - 통합 ID 지원
                if (address) {
                    const messageText = `${address} 매물에 관심있습니다.`;
                    
                    // 모달용 메시지 필드 (기존 ID)
                    const modalMessage = document.getElementById('modalmessage');
                    if (modalMessage) {
                        modalMessage.value = messageText;
                    }
                    
                    // 통합 ID 메시지 필드
                    const unifiedMessage = document.getElementById('message');
                    if (unifiedMessage && !modalMessage) {
                        unifiedMessage.value = messageText;
                    }
                }
                
                // 모달 표시
                consultModal.style.display = 'flex';
                
                // 추천매물 모달이 이미 열려있으면 body의 overflow는 그대로 유지
                // 그렇지 않으면 overflow를 hidden으로 설정
                const modalBackground = document.getElementById('modalBackground');
                const categoryModal = document.getElementById('categoryModal');
                if ((!modalBackground || modalBackground.style.display === 'none') && 
                    (!categoryModal || categoryModal.style.display === 'none')) {
                    document.body.style.overflow = 'hidden'; // 스크롤 방지
                }
                
                console.log('consultModal이 표시되었습니다.');
                
                // 상태 메시지 초기화
                hideAllFormStatus();
                
            } else {
                console.error('consultModal을 찾을 수 없습니다.');
            }
            
            // 기본 이벤트 방지 (페이지 상단으로 스크롤 방지)
            return false;
        };
        
        // 외부에서 상담 모달을 닫을 수 있도록 전역 함수 추가
        window.closeConsultModal = function() {
            console.log('closeConsultModal 호출됨');
            const consultModal = document.getElementById('consultModal');
            if (consultModal) {
                consultModal.style.display = 'none';
                
                // 추천매물 모달이 열려있는 경우 body의 overflow는 hidden 유지
                const modalBackground = document.getElementById('modalBackground');
                const categoryModal = document.getElementById('categoryModal');
                if ((!modalBackground || modalBackground.style.display === 'none') && 
                    (!categoryModal || categoryModal.style.display === 'none')) {
                    document.body.style.overflow = 'auto'; // 다른 모달이 없을 때만 스크롤 복원
                }
                
                console.log('consultModal이 닫혔습니다.');
            } else {
                console.log('consultModal을 찾을 수 없습니다.');
            }
        };
        
        console.log('전역 함수들이 등록되었습니다.');
    }
});