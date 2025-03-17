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
    // 이름에 접미사가 있는지 확인
    const hasSuffix = name.includes("-");
    
    listItems += `
      <li class="member-item">
        <span class="member-item__name" data-index="${index}">
          ${name}
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