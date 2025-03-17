/**
 * @function renderNavigator
 * @description 네비게이터(왼쪽 영역)의 innerHTML 템플릿을 반환합니다.
 * @returns {string} HTML
 */
export const renderNavigator = () => {
  // 현재 테마 확인 (기본값: 라이트)
  const isDarkTheme = document.documentElement.classList.contains('theme-dark');
  
  // 테마 버튼 텍스트와 아이콘
  const themeButtonText = isDarkTheme
    ? '☀️ 라이트 모드'
    : '🌙 다크 모드';
  
  // 접근성 레이블
  const ariaLabel = isDarkTheme
    ? '라이트 모드로 전환'
    : '다크 모드로 전환';
  
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
      <div class="nav__section nav__section--bottom">
        <button class="btn theme-toggle" aria-label="${ariaLabel}">
          <span>${themeButtonText}</span>
        </button>
        <div class="nav__version">
          <small>버전 1.0.1</small>
        </div>
      </div>
    </div>
  `;
}; 