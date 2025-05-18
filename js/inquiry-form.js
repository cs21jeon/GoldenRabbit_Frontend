// 상담 문의 폼 제출 처리 스크립트 (디버깅 로그 추가)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM이 로드되었습니다. 상담 폼 초기화를 시작합니다.');
    
    // 필수 DOM 요소 참조
    const consultForm = document.getElementById('consultForm');
    const formStatus = document.getElementById('formStatus');
    const submitButton = document.getElementById('submitConsult');
    
    // DOM 요소 존재 확인
    console.log('consultForm 존재 여부:', !!consultForm);
    console.log('formStatus 존재 여부:', !!formStatus);
    console.log('submitButton 존재 여부:', !!submitButton);
    
    if (!consultForm || !formStatus || !submitButton) {
        console.error('필요한 HTML 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 모달 준비
    prepareModals();
    
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
    
    // 폼 유효성 검사 함수
    function validateForm() {
        const propertyType = consultForm.querySelector('[name="propertyType"]')?.value;
        const phone = consultForm.querySelector('[name="phone"]')?.value;
        const message = consultForm.querySelector('[name="message"]')?.value;
        
        console.log('폼 유효성 검사 결과:', {
            propertyType: !!propertyType,
            phone: !!phone,
            message: !!message
        });
        
        if (!propertyType || !phone || !message) {
            formStatus.style.display = 'block';
            formStatus.textContent = '필수 입력 항목을 모두 입력해 주세요.';
            formStatus.style.color = 'red';
            return false;
        }
        
        return true;
    }
    
    // 모달 준비 함수
    function prepareModals() {
        console.log('모달을 준비합니다.');
        
        // 이미 모달이 있는지 확인
        if (document.getElementById('privacyModal')) {
            console.log('이미 모달이 존재합니다. 새로 생성하지 않습니다.');
            setupExistingModals();
            return;
        }
        
        // 개인정보 동의 모달 요소 생성 및 추가
        const modalHTML = `
        <div id="privacyModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); overflow: auto;">
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
        
        <div id="completionModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); overflow: auto;">
            <div class="modal-content" style="background-color: white; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <h3 style="margin-top: 0; color: green;">상담접수가 완료되었습니다</h3>
                <p>빠른시일 내에 회신드리겠습니다.</p>
                <button id="closeBtn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 15px;">닫기</button>
            </div>
        </div>`;
        
        // 모달 HTML을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('모달 HTML이 추가되었습니다.');
        
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
            // 상태 메시지 숨기기
            formStatus.style.display = 'none';
        });
        
        // 완료 모달의 닫기 버튼 클릭 시 모달 닫기 및 성공 메시지 표시
        closeBtn.addEventListener('click', function() {
            console.log('완료 모달의 닫기 버튼이 클릭되었습니다.');
            completionModal.style.display = 'none';
            // 성공 메시지 표시
            formStatus.style.display = 'block';
            formStatus.textContent = '상담신청이 정상적으로 처리되었습니다.';
            formStatus.style.color = 'green';
        });
        
        // 동의하기 버튼 클릭 시 실제 폼 제출 처리
        agreeBtn.addEventListener('click', async function() {
            console.log('동의하기 버튼이 클릭되었습니다.');
            privacyModal.style.display = 'none'; // 동의 모달 닫기
            
            // 로딩 표시
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '접수 중...';
            
            // 상태 메시지 표시
            formStatus.style.display = 'block';
            formStatus.textContent = '상담 문의를 접수 중입니다...';
            formStatus.style.color = '#666';
            
            // 폼 데이터 수집
            const propertyType = consultForm.querySelector('[name="propertyType"]')?.value || '';
            const phone = consultForm.querySelector('[name="phone"]')?.value || '';
            const email = consultForm.querySelector('[name="email"]')?.value || '';
            const message = consultForm.querySelector('[name="message"]')?.value || '';
            
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
                consultForm.reset();
                console.log('폼이 초기화되었습니다.');
                
                // 상태 메시지 숨기기 (팝업으로 대체)
                formStatus.style.display = 'none';
                
                // 완료 모달 표시
                completionModal.style.display = 'block';
                console.log('완료 모달이 표시되었습니다.');
                
            } catch (error) {
                console.error('상담 접수 실패:', error);
                // 오류 메시지
                formStatus.textContent = `상담 접수 중 오류가 발생했습니다: ${error.message}`;
                formStatus.style.color = 'red';
            } finally {
                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                console.log('버튼 상태가 복원되었습니다.');
            }
        });
    }
    
    // 외부에서 상담 모달을 열 수 있도록 전역 함수 추가
    window.openConsultModal = function(address) {
        console.log('openConsultModal 호출됨:', address);
        if (consultForm) {
            const messageField = consultForm.querySelector('[name="message"]');
            if (messageField && address) {
                messageField.value = `${address} 매물에 관심있습니다.`;
            }
            
            // 페이지에 consultModal이 있다면 표시
            const consultModal = document.getElementById('consultModal');
            if (consultModal) {
                consultModal.style.display = 'block';
                console.log('consultModal이 표시되었습니다.');
            } else {
                console.log('consultModal을 찾을 수 없습니다. 지도 모달일 가능성이 있습니다.');
            }
        }
    };
    
    // 외부에서 상담 모달을 닫을 수 있도록 전역 함수 추가
    window.closeConsultModal = function() {
        console.log('closeConsultModal 호출됨');
        const consultModal = document.getElementById('consultModal');
        if (consultModal) {
            consultModal.style.display = 'none';
            console.log('consultModal이 닫혔습니다.');
        } else {
            console.log('consultModal을 찾을 수 없습니다.');
        }
    };
    
    console.log('상담 폼 초기화가 완료되었습니다.');
});