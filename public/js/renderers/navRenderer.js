/**
 * @function renderNavigator
 * @description 네비게이터(왼쪽 영역)의 innerHTML 템플릿을 반환합니다.
 * @returns {string} HTML
 */
export const renderNavigator = () => {
  return `
    <style>
      :host {
        display: block;
        background-color: var(--color-dark-2);
        color: var(--color-white);
        padding: var(--section-padding);
        border-right: var(--border-dark);
        height: 100vh;
        overflow-y: auto;
        min-width: 0;
      }
      .nav-section {
        margin-bottom: var(--space-4);
        padding: var(--space-4);
      }
      .nav-item {
        padding: var(--space-3);
        border-radius: var(--radius-sm);
        cursor: pointer;
        margin: var(--space-1) 0;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .nav-item:hover {
        background-color: var(--color-dark-4);
      }
    </style>
    <div class="nav-section">
      <h2 class="text-gray text-sm mb-4">기능</h2>
      <div class="nav-item">팀 생성</div>
      <div class="nav-item">팀 관리</div>
      <div class="nav-item">설정</div>
    </div>
    <div class="nav-section">
      <h2 class="text-gray text-sm mb-4">최근 기록</h2>
      <div class="nav-item">저장된 팀 목록</div>
      <div class="nav-item">히스토리</div>
    </div>
  `;
}; 