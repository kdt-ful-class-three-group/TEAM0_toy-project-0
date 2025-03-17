/**
 * @function renderMemberList
 * @description 멤버 목록(가운데 영역)의 innerHTML 템플릿을 반환합니다.
 * @param {Array<string>} members
 * @returns {string} HTML
 */
export const renderMemberList = (members) => {
  let listItems = "";
  members.forEach((name, index) => {
    listItems += `
      <li class="member-item">
        <span class="member-name" data-index="${index}">
          ${name}
          ${
            name.includes("-")
              ? `<button class="btn btn-secondary edit-suffix" data-index="${index}">수정</button>`
              : ""
          }
        </span>
        <div class="member-actions">
          <button class="btn btn-secondary delete-member" data-index="${index}">삭제</button>
        </div>
      </li>
    `;
  });

  return `
    <style>
      .member-list {
        list-style: none;
        padding: 0;
        max-height: calc(100vh - var(--header-height) - var(--space-4) * 2);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin: 0;
        width: 100%;
      }
      .member-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        background-color: var(--color-dark-3);
        border-radius: var(--radius-sm);
        border: var(--border-dark);
        width: 100%;
        box-sizing: border-box;
      }
      .member-name {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--color-light);
        font-size: var(--text-base);
        flex: 1;
        min-width: 0;
      }
      .member-actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-shrink: 0;
      }
      .delete-member, .edit-suffix {
        padding: var(--space-1) var(--space-2);
        font-size: var(--text-sm);
        min-width: auto;
        height: auto;
        background-color: var(--color-dark-4);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .delete-member:hover, .edit-suffix:hover {
        background-color: var(--color-dark-3);
      }
      .suffix-input {
        width: 60px;
        padding: var(--space-1) var(--space-2);
        background-color: var(--color-dark-4);
        color: var(--color-white);
        border: 1px solid var(--color-dark-4);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
      }
      .edit-mode {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
    </style>
    <div class="bg-dark-3 rounded-md p-4 shadow-sm mb-4">
      <h2 class="text-lg text-white mb-4">멤버 목록</h2>
      <ul class="member-list">${listItems}</ul>
    </div>
  `;
}; 