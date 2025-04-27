// AI 매물 검색 기능
document.addEventListener('DOMContentLoaded', function() {
    const aiSearchForm = document.getElementById('aiSearchForm');
    const aiSearchResults = document.getElementById('aiSearchResults');
    const aiLoading = document.getElementById('aiLoading');
    const aiRecommendations = document.getElementById('aiRecommendations');
    
    if (aiSearchForm) {
        aiSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 사용자 입력 가져오기
            const ai_location = document.getElementById('ai_location').value;
            const priceRange = document.getElementById('priceRange').value;
            const investment = document.getElementById('investment').value;
            const expectedYield = document.getElementById('expectedYield').value;
            
            // 결과 영역 표시 및 로딩 표시
            aiSearchResults.style.display = 'block';
            aiLoading.style.display = 'block';
            aiRecommendations.innerHTML = '';
            
            // API 호출
            fetch('/api/property-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ai_location: ai_location,
                    price_range: priceRange,
                    investment: investment,
                    expected_yield: expectedYield
                })
            })
            .then(response => response.json())
            .then(data => {
                // 로딩 숨기기
                aiLoading.style.display = 'none';
                
                // 결과 표시
                const recommendations = data.recommendations;
                aiRecommendations.innerHTML = formatRecommendations(recommendations);
                
                // 결과 영역으로 스크롤
                aiSearchResults.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                aiLoading.style.display = 'none';
                aiRecommendations.innerHTML = `
                    <div class="error-message">
                        <p>죄송합니다. 매물 검색 중 오류가 발생했습니다.</p>
                        <p>다시 시도해 주세요.</p>
                    </div>
                `;
                console.error('Error:', error);
            });
        });
    }
    
    // Claude API 응답 포맷팅 함수
    function formatRecommendations(text) {
        // Claude의 응답을 HTML로 변환
        // 이 부분은 Claude의 응답 형식에 따라 조정이 필요할 수 있습니다
        
        // 일단 간단한 형식으로 처리
        const lines = text.split('\n');
        let html = '';
        let currentItem = null;
        
        for (const line of lines) {
            if (line.startsWith('매물') || line.startsWith('추천 매물') || line.match(/^\d+\./)) {
                // 새 매물 시작
                if (currentItem) {
                    html += `</div>`;
                }
                html += `<div class="recommendation-item">`;
                html += `<div class="recommendation-title">${line}</div>`;
                currentItem = line;
            } else if (line.includes('가격') || line.includes('매매가')) {
                html += `<div class="recommendation-price">${line}</div>`;
            } else if (line.trim() !== '') {
                html += `<div class="recommendation-reason">${line}</div>`;
            }
        }
        
        if (currentItem) {
            html += `</div>`;
        }
        
        if (html === '') {
            html = `<p>조건에 맞는 매물을 찾지 못했습니다. 다른 조건으로 시도해보세요.</p>`;
        }
        
        return html;
    }
});