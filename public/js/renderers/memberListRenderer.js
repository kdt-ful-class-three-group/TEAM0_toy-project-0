/**
 * @module memberListRenderer
 * @description 멤버 목록 렌더링을 담당하는 모듈
 */

/**
 * 멤버 이름 파싱 및 표시
 * @param {Object|string} member - 멤버 객체 또는 문자열
 * @returns {string} HTML 마크업
 */
const renderMemberName = (member) => {
  // 객체 형태로 변환된 구조 지원
  if (typeof member === 'object' && member !== null) {
    const baseName = member.name || "";
    const suffix = member.suffix || "";
    
    if (!suffix) {
      return `<span class="member-name">${baseName}</span>`;
    }
    
    // 접미사가 숫자인지 문자열인지 확인
    const isSuffixNumeric = !isNaN(suffix);
    const suffixClass = isSuffixNumeric ? "member-suffix-numeric" : "member-suffix-text";
    
    return `<span class="member-name">${baseName}</span><span class="${suffixClass}">-${suffix}</span>`;
  }
  
  // 기존 문자열 형태 지원 (하위 호환성)
  const name = String(member || "");
  
  // 이름과 접미사 분리 (접미사가 있는 경우)
  if (!name.includes("-")) {
    return `<span class="member-name">${name}</span>`;
  }
  
  const parts = name.split("-");
  const baseName = parts[0];
  const suffix = parts[1] || "";
  
  // 접미사가 숫자인지 문자열인지 확인
  const isSuffixNumeric = !isNaN(suffix);
  
  // 시각적 구분을 위해 접미사 표시 방식 변경
  const suffixClass = isSuffixNumeric ? "member-suffix-numeric" : "member-suffix-text";
  
  return `<span class="member-name">${baseName}</span><span class="${suffixClass}">-${suffix}</span>`;
};

/**
 * 멤버 항목 렌더링
 * @param {Object|string} member - 멤버 객체 또는 문자열
 * @param {number} index - 멤버 인덱스
 * @param {number} editingIndex - 현재 편집 중인 멤버 인덱스
 * @returns {string} HTML 마크업
 */
const renderMemberItem = (member, index, editingIndex) => {
  if (member === null || member === undefined) {
    console.error('유효하지 않은 멤버 데이터:', member, 'index:', index);
    return '';
  }

  // 멤버 데이터 추출
  const isObject = typeof member === 'object' && member !== null;
  const memberName = isObject ? member.name : member;
  const memberSuffix = isObject ? member.suffix || "" : "";
  
  // 편집 중인 상태인지 확인
  const isEditing = index === editingIndex;
  
  // 편집 모드일 때 다른 UI 표시
  if (isEditing) {
    return `
      <li class="member-item editing" data-index="${index}">
        <div class="edit-container">
          <span class="member-name">${memberName}-</span>
          <input type="text" class="input suffix-input" value="${memberSuffix}" placeholder="특징 또는 숫자">
          <div class="edit-actions">
            <button class="btn btn--small confirm-button">확인</button>
            <button class="btn btn--small cancel-button">취소</button>
          </div>
          <div class="suffix-help">숫자 또는 텍스트(예: 안경쓴, 키큰)를 입력하세요</div>
        </div>
      </li>
    `;
  }
  
  // 일반 모드
  const displayName = isObject 
    ? `${memberName}${memberSuffix ? `-${memberSuffix}` : ""}` 
    : memberName;
  
  return `
    <li class="member-item" data-index="${index}">
      <span class="member-item__name">
        ${renderMemberName(member)}
        <button class="btn btn--small edit-button" data-index="${index}">수정</button>
      </span>
      <div class="member-item__actions">
        <button class="btn btn--secondary delete-button" data-index="${index}">삭제</button>
      </div>
    </li>
  `;
};

/**
 * 빈 멤버 목록 렌더링
 * @returns {string} HTML 마크업
 */
const renderEmptyMemberList = () => {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">👥</div>
      <h3 class="empty-state__title">등록된 멤버가 없습니다</h3>
      <p class="empty-state__description">
        오른쪽 패널에서 멤버를 추가해주세요.
      </p>
    </div>
  `;
};

/**
 * @function renderMemberList
 * @description 멤버 목록(가운데 영역)의 innerHTML 템플릿을 반환합니다.
 * @param {Array} members - 멤버 배열 (객체 또는 문자열 형태)
 * @param {number} editingIndex - 현재 편집 중인 멤버 인덱스 (-1이면 편집 중이 아님)
 * @returns {string} HTML
 */
export const renderMemberList = (members = [], editingIndex = -1) => {
  // 멤버 배열 확인
  if (!Array.isArray(members)) {
    console.error("renderMemberList: members가 배열이 아닙니다.", members);
    return `<div class="error-message">멤버 데이터 형식 오류</div>`;
  }
  
  // 빈 배열 처리
  if (!members.length) {
    return renderEmptyMemberList();
  }

  // 멤버 목록 항목 생성 - 유효하지 않은 항목 필터링
  const listItems = members
    .map((member, index) => 
      renderMemberItem(member, index, editingIndex)
    )
    .filter(item => item) // 빈 문자열 필터링
    .join("");

  return `
    <div class="member-list-wrapper">
      <ul class="member-list">
        ${listItems}
      </ul>
    </div>
  `;
}; 