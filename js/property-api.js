async function fetchPropertiesFromAirtable() {
  try {
    const viewId = 'viweFlrK1v4aXqYH8'; // 안전하게 뷰 ID 직접 사용
    const response = await fetch(`/api/property-list?view=${viewId}`);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('에어테이블 응답 데이터:', data);

    if (data && data.records && Array.isArray(data.records)) {
      return data.records;
    } else {
      console.error('에어테이블 응답 형식이 예상과 다릅니다:', data);
      return [];
    }
  } catch (error) {
    console.error('에어테이블 데이터 가져오기 실패:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `데이터 불러오기 실패: ${error.message}`;
    const propertiesGrid = document.querySelector('.properties-grid');
    if (propertiesGrid) {
      propertiesGrid.innerHTML = '';
      propertiesGrid.appendChild(errorDiv);
    }
    return [];
  }
}

function renderProperties(properties) {
  const propertiesGrid = document.querySelector('.properties-grid');
  propertiesGrid.innerHTML = '';

  if (!Array.isArray(properties) || properties.length === 0) {
    propertiesGrid.innerHTML = '<div class="no-properties">현재 등록된 매물이 없습니다.</div>';
    return;
  }

  properties.forEach((property, index) => {
    const fields = property.fields;
    const recordId = property.id;
    const address = fields['지번 주소'] || '주소 정보 없음';
    const priceInWon = fields['매가(만원)'] || 0;
    const priceInBillion = (priceInWon / 10000).toFixed(1).replace('.0', '');
    const landArea = fields['토지면적(㎡)'] || 0;
    const buildingArea = fields['연면적(㎡)'] || 0;
    const buildYear = fields['사용승인일'] ? fields['사용승인일'].substring(0, 4) : '';

    let photoUrl = '/api/placeholder/400/300';
    if (Array.isArray(fields['대표사진']) && fields['대표사진'][0]?.url) {
      photoUrl = `/images/recomm_building/recomm_${index + 1}.jpg`;
    } else if (typeof fields['대표사진'] === 'string') {
      try {
        const parsed = JSON.parse(fields['대표사진']);
        if (parsed[0]?.url) {
          photoUrl = parsed[0].url;
        }
      } catch (e) {
        console.warn('대표사진 JSON 파싱 실패:', e);
      }
    } else if (fields['사진링크']) {
      const photoLinks = fields['사진링크'].split(',');
      if (photoLinks[0]) {
        photoUrl = photoLinks[0].trim();
      }
    }

    const propertyCard = document.createElement('div');
    propertyCard.className = 'property-card';
    propertyCard.dataset.recordId = recordId;
    propertyCard.innerHTML = `
      <div class="property-image" style="background-image: url('${photoUrl}');"></div>
      <div class="property-info">
        <div class="property-title">${address}</div>
        <div class="property-price">${priceInBillion}억원</div>
        <div class="property-features">
          <div class="feature">대지면적: ${landArea}㎡</div>
          <div class="feature">연면적: ${buildingArea}㎡</div>
          <div class="feature">연식: ${buildYear}년</div>
        </div>
      </div>
    `;
    propertyCard.addEventListener('click', () => showPropertyDetails(fields, recordId, index));
    propertiesGrid.appendChild(propertyCard);
  });
}

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
  if (Array.isArray(property['대표사진']) && property['대표사진'][0]?.url) {
    photoUrl = `/images/recomm_building/recomm_${index + 1}.jpg`;
  } else if (typeof property['대표사진'] === 'string') {
    try {
      const parsed = JSON.parse(property['대표사진']);
      if (parsed[0]?.url) {
        photoUrl = parsed[0].url;
      }
    } catch (e) {
      console.warn('대표사진 JSON 파싱 실패:', e);
    }
  } else if (property['사진링크']) {
    const photoLinks = property['사진링크'].split(',');
    if (photoLinks[0]) {
      photoUrl = photoLinks[0].trim();
    }
  }

  const address = property['지번 주소'] || '주소 정보 없음';
  const airtableViewLink = `https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS?recordId=${recordId}`;
  const airtableRecordLink = `https://airtable.com/shrMoyiS143vdYbYS?recordId=${recordId}`;

  modalBackground.innerHTML = `
    <div id="modalBackground" class="modal-background" style="overflow-y: auto;">
      <div class="modal-content">
        <div class="modal-close" onclick="closeModal()">&times;</div>
        <div class="modal-header">
          <div class="modal-image clickable" style="background-image: url('${photoUrl}');" data-record-url="https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS/tblnR438TK52Gr0HB/viweFlrK1v4aXqYH8/${recordId}">
            <div class="image-overlay"><span>사진 클릭 시 상세보기</span></div>
          </div>
        </div>
        <div class="modal-body">
          <h2 class="modal-title">${address}</h2>
          <div class="modal-price">${priceInBillion ? priceInBillion + '억원' : ''}</div>
          <div class="modal-description">${property['비고'] || ''} ${address} 위치의 매물입니다.</div>
          <div class="modal-details">
            <div class="detail-item"><div class="detail-label">대지면적</div><div class="detail-value">${property['토지면적(㎡)'] || 0}㎡</div></div>
            <div class="detail-item"><div class="detail-label">연면적</div><div class="detail-value">${property['연면적(㎡)'] || 0}㎡</div></div>
            <div class="detail-item"><div class="detail-label">준공년도</div><div class="detail-value">${buildYear}년</div></div>
          </div>
          <div class="modal-buttons">
            <a href="#contact" class="btn btn-contact" onclick="closeModal()">문의하기</a>
            <a href="https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS/tblnR438TK52Gr0HB/viweFlrK1v4aXqYH8/${recordId}" class="btn btn-detail" target="_blank">상세내용 보기</a>
            <a href="https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS/tblnR438TK52Gr0HB" class="btn btn-recomm" target="_blank">추천매물 6선 모아보기</a>
          </div>
        </div>
      </div>
    </div>
  `;

  modalBackground.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  history.pushState({ modalOpen: true }, null, '');
}

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

function injectStyles() {
  if (!document.getElementById('property-custom-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'property-custom-styles';
    styleElement.textContent = `
      .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        overflow-y: auto;
        padding: 20px;
      }

      .modal-content {
        position: relative;
        width: 100%;
        max-width: 500px;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        padding-bottom: 20px;
        box-sizing: border-box;
      }

      .modal-close {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 24px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        z-index: 10000;
      }

      .modal-header {
        position: relative;
        height: 250px;
        overflow: hidden;
      }

      .modal-image.clickable {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        cursor: pointer;
        position: relative;
      }

      .modal-image .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        text-align: center;
        padding: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .modal-image.clickable:hover .image-overlay {
        opacity: 1;
      }

      .modal-body {
        padding: 20px;
      }

      .modal-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 30px;
      }

      .btn {
        display: block;
        width: 100%;
        padding: 12px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        border-radius: 8px;
        text-decoration: none;
        color: white;
      }

      .btn-contact { background-color: #009688; }
      .btn-detail { background-color: #2962FF; }
      .btn-recomm { background-color: #4CAF50; }

      @media (hover: none) and (pointer: coarse) {
        .modal-image .image-overlay {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
}

function registerImageClickListeners() {
  ['click', 'touchstart'].forEach(evt => {
    document.body.addEventListener(evt, function(e) {
      const el = e.target.closest('.modal-image.clickable');
      if (el?.dataset.recordUrl) {
        window.open(el.dataset.recordUrl, '_blank');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const section = document.getElementById('properties');
  if (!section) return;

  let propertiesGrid = section.querySelector('.properties-grid');
  if (!propertiesGrid) {
    propertiesGrid = document.createElement('div');
    propertiesGrid.className = 'properties-grid';
    const container = section.querySelector('.container');
    container?.appendChild(propertiesGrid);
  }

  propertiesGrid.innerHTML = '<div class="loading-message">매물 정보를 불러오는 중입니다...</div>';

  const properties = await fetchPropertiesFromAirtable();
  renderProperties(properties);
  injectStyles();
  registerImageClickListeners();
});

window.closeModal = closeModal;
window.openRecordDetail = (url) => window.open(url, '_blank');

window.addEventListener('popstate', function(event) {
  if (event.state?.modalOpen) {
    closeModal();
  }
});
