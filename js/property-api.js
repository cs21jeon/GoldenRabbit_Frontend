// 매물 상세 정보를 모달로 표시하는 함수
function showPropertyDetails(property, recordId, index) {
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
    document.querySelectorAll('.price-bubble').forEach(el => el.style.display = 'none');
  }

  let modalBackground = document.getElementById('modalBackground');
  if (!modalBackground) {
    modalBackground = document.createElement('div');
    modalBackground.id = 'modalBackground';
    modalBackground.className = 'modal-background';
    document.body.appendChild(modalBackground);

    modalBackground.addEventListener('click', (e) => {
      if (e.target === modalBackground) closeModal();
    });
  }

  const priceInWon = property['매가(만원)'] || 0;
  const priceInBillion = priceInWon ? (priceInWon / 10000).toFixed(1).replace('.0', '') : '';
  const buildYear = property['사용승인일'] ? property['사용승인일'].substring(0, 4) : '';

  let photoUrl = '/api/placeholder/800/400';
  if (property['대표사진'] && Array.isArray(property['대표사진']) && property['대표사진'][0]?.url) {
    photoUrl = `/images/recomm_building/recomm_${index + 1}.jpg`;
  } else if (typeof property['대표사진'] === 'string') {
    try {
      const parsed = JSON.parse(property['대표사진']);
      if (Array.isArray(parsed) && parsed[0]?.url) {
        photoUrl = parsed[0].url;
      }
    } catch (e) {
      console.warn('대표사진 JSON 파싱 실패:', e);
    }
  } else if (property['사진링크']) {
    const photoLinks = property['사진링크'].split(',');
    if (photoLinks.length > 0 && photoLinks[0].trim()) {
      photoUrl = photoLinks[0].trim();
    }
  }

  const address = property['지번 주소'] || '주소 정보 없음';
  const airtableViewLink = `https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS?recordId=${recordId}`;
  const airtableRecordLink = `https://airtable.com/appGSg5QfDNKgFf73/tblXf8gXLSByNZOTB/${recordId}`;

  modalBackground.innerHTML = `
    <div class="modal-content">
      <div class="modal-close" onclick="closeModal()">×</div>
      <div class="modal-header">
        <div class="modal-image clickable" style="background-image: url('${photoUrl}');" data-record-url="${airtableRecordLink}">
          <div class="image-overlay"><span>사진 클릭 시 상세보기</span></div>
        </div>
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${address}</h2>
        <div class="modal-price">${priceInBillion ? priceInBillion + '억원' : ''}</div>
        <div class="modal-description">${property['비고'] || ''} ${address} 위치의 매물입니다. 자세한 정보는 문의 바랍니다.</div>
        <div class="modal-details">
          <div class="detail-item">
            <div class="detail-label">대지면적</div>
            <div class="detail-value">${property['토지면적(㎡)'] || 0}㎡</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">연면적</div>
            <div class="detail-value">${property['연면적(㎡)'] || 0}㎡</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">준공년도</div>
            <div class="detail-value">${buildYear}년</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
          <a href="#contact" class="btn" onclick="closeModal()" style="margin-bottom: 15px; display: block;">문의하기</a>
          <a href="${airtableRecordLink}" class="btn" style="background-color: #2962FF; margin-bottom: 15px; display: block;" target="_blank">상세내용 보기</a>
          <a href="${airtableViewLink}" class="btn" style="background-color: #4CAF50; display: block;" target="_blank">추천매물 6선 모아보기</a>
        </div>
      </div>
    </div>
  `;

  modalBackground.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  history.pushState({ modalOpen: true }, null, '');
}

// 에어테이블 레코드 상세 페이지 열기 함수
function openRecordDetail(url) {
  window.open(url, '_blank');
}

// CSS 및 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('property-custom-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'property-custom-styles';
    styleElement.textContent = `
      .modal-image.clickable {
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .modal-image .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .modal-image.clickable:hover .image-overlay {
        opacity: 1;
      }
      @media (hover: none) and (pointer: coarse) {
        .modal-image .image-overlay {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }

  // 이미지 클릭 or 터치 시 상세 페이지 이동
  ['click', 'touchstart'].forEach(evt => {
    document.body.addEventListener(evt, function(e) {
      const el = e.target.closest('.modal-image.clickable');
      if (el && el.dataset.recordUrl) {
        openRecordDetail(el.dataset.recordUrl);
      }
    });
  });
});

// 전역 함수 등록
window.closeModal = function() {
  const modal = document.getElementById('modalBackground');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};
window.openRecordDetail = openRecordDetail;

window.addEventListener('popstate', function(event) {
  if (event.state && event.state.modalOpen) {
    closeModal();
  }
});
