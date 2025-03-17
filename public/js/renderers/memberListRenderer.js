/**
 * @function renderMemberList
 * @description 멤버 목록(가운데 영역)의 innerHTML 템플릿을 반환합니다.
 * @param {Array<string>} members
 * @returns {string} HTML
 */
export const renderMemberList = (members = []) => {
  if (!members.length) {
    return `
      <div class="card">
        <div class="card__content">
          <h3 class="card__title">멤버 목록</h3>
          <div class="status-message">
            등록된 멤버가 없습니다. 오른쪽 패널에서 멤버를 추가해주세요.
          </div>
        </div>
      </div>
    `;
  }

  let listItems = "";
  members.forEach((name, index) => {
    // 이름과 접미사 분리 (접미사가 있는 경우)
    let displayName = name;
    if (name.includes("-")) {
      const parts = name.split("-");
      const baseName = parts[0];
      const suffix = parts[1] || "";
      
      // 접미사가 숫자인지 문자열인지 확인
      const isSuffixNumeric = !isNaN(suffix);
      
      // 시각적 구분을 위해 접미사 표시 방식 변경
      // 숫자 접미사와 문자열 접미사의 스타일을 다르게 적용
      const suffixClass = isSuffixNumeric ? "member-suffix-numeric" : "member-suffix-text";
      displayName = `<span class="member-name">${baseName}</span><span class="${suffixClass}">-${suffix}</span>`;
    }
    
    listItems += `
      <li class="member-item" data-name="${name}">
        <span class="member-item__name" data-index="${index}">
          ${displayName}
          <button class="btn btn--small member-item__edit" data-index="${index}">수정</button>
        </span>
        <div class="member-item__actions">
          <button class="btn btn--secondary member-item__delete" data-index="${index}">삭제</button>
        </div>
      </li>
    `;
  });

  return `
    <div class="card">
      <div class="card__content">
        <h3 class="card__title">멤버 목록 (${members.length}명)</h3>
        <ul class="member-list">
          ${listItems}
        </ul>
      </div>
    </div>
  `;
}; 