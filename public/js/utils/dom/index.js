/**
 * @file utils/dom/index.js
 * @description DOM 유틸리티 모듈 내보내기
 */

// DOM 선택기 유틸리티
export * from './query.js';

// DOM 조작 유틸리티
export * from './manipulation.js';

// 이벤트 처리 유틸리티
export * from './events.js';

// DOM 최적화 유틸리티 (기존 파일)
export * from '../domOptimizer.js';

// DOM 관련 상수들
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;
export const DOCUMENT_NODE = 9;

/**
 * 요소가 화면에 보이는지 확인합니다.
 * 
 * @param {HTMLElement} element - 확인할 요소
 * @returns {boolean} 요소가 화면에 보이는지 여부
 */
export const isVisible = (element) => {
  if (!element) return false;
  
  // 요소의 CSS 스타일 확인
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  
  // 요소의 크기가 0인지 확인
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  return true;
};

/**
 * 요소가 현재 뷰포트에 있는지 확인합니다.
 * 
 * @param {HTMLElement} element - 확인할 요소
 * @param {number} [threshold=0] - 화면에 표시되어야 하는 요소의 비율 (0-1)
 * @returns {boolean} 요소가 뷰포트에 있는지 여부
 */
export const isInViewport = (element, threshold = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  // 뷰포트와의 교차 영역 계산
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  
  // 요소의 총 면적
  const elementArea = rect.width * rect.height;
  
  // 교차 영역이 0보다 크고, 임계값 비율보다 큰지 확인
  return (
    visibleHeight > 0 && 
    visibleWidth > 0 && 
    (visibleHeight * visibleWidth) / elementArea >= threshold
  );
}; 