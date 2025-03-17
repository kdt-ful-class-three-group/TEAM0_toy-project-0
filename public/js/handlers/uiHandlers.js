/**
 * @file uiHandlers.js
 * @description UI 요소 관련 공통 핸들러 함수들을 제공하는 모듈
 */

import { createErrorLogger, showUIError as showError, UIError } from '../utils/errorHandler.js';

const logger = createErrorLogger('uiHandlers');

/**
 * 유효하지 않은 입력을 시각적으로 표시
 * @param {HTMLElement} element - 표시할 요소
 * @param {string} [message] - 표시할 오류 메시지
 */
export const showInvalidInput = (element, message) => {
  if (!element) {
    logger.warn('유효하지 않은 요소에 오류 표시 시도');
    return;
  }
  
  element.classList.add("invalid");
  element.classList.remove("shake");
  void element.offsetWidth; // reflow 트리거
  element.classList.add("shake");
  
  // 메시지가 있으면 오류 표시
  if (message) {
    showError(element, message, 'invalid');
  }
};

/**
 * UI 요소에 오류 메시지를 표시합니다.
 * 기존 코드와의 호환성을 위해 errorHandler의 showUIError 함수를 래핑합니다.
 * 
 * @param {HTMLElement} element - 오류를 표시할 요소
 * @param {string} message - 오류 메시지
 * @param {string} [className='error'] - 추가할 CSS 클래스
 */
export const showUIError = (element, message, className = 'error') => {
  showError(element, message, className);
};

/**
 * 상태 메시지 업데이트 처리
 * @param {HTMLElement} element - 메시지를 표시할 요소
 * @param {string} message - 표시할 메시지
 * @param {'success' | 'error' | 'info'} [type='info'] - 메시지 유형
 */
export const updateStatusMessage = (element, message, type = 'info') => {
  if (!element) {
    logger.warn('유효하지 않은 요소에 상태 메시지 업데이트 시도', { message, type });
    return;
  }
  
  try {
    element.textContent = message;
    
    // 이전 상태 클래스 제거
    element.classList.remove('status-message--success', 'status-message--error', 'status-message--info');
    
    // 새로운 상태 클래스 추가
    element.classList.add(`status-message--${type}`);
    
    // 접근성을 위한 속성 추가
    if (type === 'error') {
      element.setAttribute('role', 'alert');
    } else {
      element.setAttribute('role', 'status');
    }
    
    logger.info('상태 메시지 업데이트됨', { type, message: message.substring(0, 30) });
  } catch (error) {
    logger.error('상태 메시지 업데이트 중 오류 발생', { error });
  }
};

/**
 * 요소 보이기/숨기기 전환
 * @param {HTMLElement} element - 전환할 요소
 * @param {boolean} visible - 보이기 여부
 */
export const toggleVisibility = (element, visible) => {
  if (!element) {
    logger.warn('유효하지 않은 요소의 가시성 전환 시도', { visible });
    return;
  }
  
  try {
    if (visible) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  } catch (error) {
    logger.error('요소 가시성 전환 중 오류 발생', { error });
  }
};

/**
 * 애니메이션 완료 후 콜백 실행
 * @param {HTMLElement} element - 애니메이션 요소
 * @param {Function} callback - 완료 후 실행할 콜백 함수
 */
export const onAnimationEnd = (element, callback) => {
  if (!element) {
    logger.warn('유효하지 않은 요소에 애니메이션 이벤트 리스너 추가 시도');
    return;
  }
  
  if (typeof callback !== 'function') {
    logger.warn('애니메이션 완료 콜백이 함수가 아님');
    return;
  }
  
  try {
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      callback();
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  } catch (error) {
    logger.error('애니메이션 이벤트 리스너 추가 중 오류 발생', { error });
  }
}; 