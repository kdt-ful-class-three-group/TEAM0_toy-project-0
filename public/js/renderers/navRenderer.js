/**
 * @function renderNavigator
 * @description 네비게이터(왼쪽 영역)의 innerHTML 템플릿을 반환합니다.
 * @returns {string} HTML
 */
export const renderNavigator = () => {
  return `
    <div class="nav">
      <div class="nav__section">
        <h2 class="nav__title">기능</h2>
        <div class="nav__item">팀 생성</div>
        <div class="nav__item">팀 관리</div>
        <div class="nav__item">설정</div>
      </div>
      <div class="nav__section">
        <h2 class="nav__title">최근 기록</h2>
        <div class="nav__item">저장된 팀 목록</div>
        <div class="nav__item">히스토리</div>
      </div>
    </div>
  `;
}; 