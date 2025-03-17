/**
 * @file uiHandlers.js
 * @description UI 요소 관련 공통 핸들러 함수들을 제공하는 모듈
 */

/**
 * 유효하지 않은 입력을 시각적으로 표시
 * @param {HTMLElement} element - 표시할 요소
 */
export const showInvalidInput = (element) => {
  element.classList.add("invalid");
  element.classList.remove("shake");
  void element.offsetWidth; // reflow 트리거
  element.classList.add("shake");
};

/**
 * 상태 메시지 업데이트 처리
 * @param {HTMLElement} element - 메시지를 표시할 요소
 * @param {string} message - 표시할 메시지
 * @param {'success' | 'error' | 'info'} [type='info'] - 메시지 유형
 */
export const updateStatusMessage = (element, message, type = 'info') => {
  if (!element) return;
  
  element.textContent = message;
  
  // 이전 상태 클래스 제거
  element.classList.remove('status-message--success', 'status-message--error', 'status-message--info');
  
  // 새로운 상태 클래스 추가
  element.classList.add(`status-message--${type}`);
};

/**
 * 요소 보이기/숨기기 전환
 * @param {HTMLElement} element - 전환할 요소
 * @param {boolean} visible - 보이기 여부
 */
export const toggleVisibility = (element, visible) => {
  if (!element) return;
  
  if (visible) {
    element.style.display = '';
  } else {
    element.style.display = 'none';
  }
};

/**
 * 애니메이션 완료 후 콜백 실행
 * @param {HTMLElement} element - 애니메이션 요소
 * @param {Function} callback - 완료 후 실행할 콜백 함수
 */
export const onAnimationEnd = (element, callback) => {
  if (!element) return;
  
  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    callback();
  };
  
  element.addEventListener('animationend', handleAnimationEnd);
}; 