/**
 * @file styleManager.js
 * @description 웹 컴포넌트 스타일 관리를 위한 유틸리티
 */

/**
 * @class StyleManager
 * @description 컴포넌트 스타일 관리 유틸리티 클래스
 */
export class StyleManager {
  /**
   * CSS 문자열에서 변수와 값을 추출합니다.
   * @param {string} cssString - CSS 문자열
   * @returns {Object} 변수와 값의 맵
   */
  static extractVariables(cssString) {
    if (!cssString) return {};

    const regex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g;
    const variables = {};
    let match;

    while ((match = regex.exec(cssString)) !== null) {
      const [, name, value] = match;
      variables[`--${name}`] = value.trim();
    }

    return variables;
  }

  /**
   * 테마 변수에 접근합니다.
   * @param {string} variableName - CSS 변수 이름
   * @param {HTMLElement} [element=document.documentElement] - 변수를 가져올 요소
   * @returns {string} CSS 변수 값
   */
  static getVariable(variableName, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(variableName).trim();
  }

  /**
   * 컴포넌트 스타일을 생성합니다.
   * @param {Object} options - 스타일 옵션
   * @param {string} options.name - 컴포넌트 이름
   * @param {string} options.styles - CSS 문자열
   * @param {boolean} [options.useVars=true] - CSS 변수 사용 여부
   * @returns {string} 완성된 스타일 문자열
   */
  static createComponentStyle({ name, styles, useVars = true }) {
    if (!styles) return '';

    // 기본 변수 추가
    let fullStyles = '';
    
    if (useVars) {
      fullStyles = `
        /* 컴포넌트 스타일: ${name} */
        :host {
          display: block;
          box-sizing: border-box;
        }
        ${styles}
      `;
    } else {
      fullStyles = styles;
    }

    return fullStyles;
  }

  /**
   * 공통 스타일을 가져옵니다.
   * @returns {string} 공통 스타일 문자열
   */
  static getCommonStyles() {
    return `
      /* 공통 변수 */
      :host {
        --component-padding: var(--space-4, 1rem);
        --component-margin: var(--space-4, 1rem);
        --component-border-radius: var(--radius-md, 0.375rem);
        --component-box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
      }
      
      /* 공통 스타일 */
      .component-container {
        padding: var(--component-padding);
        margin: var(--component-margin);
        border-radius: var(--component-border-radius);
        box-shadow: var(--component-box-shadow);
      }
      
      /* 접근성 유틸리티 */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      
      /* 포커스 유틸리티 */
      .focus-visible {
        outline: 2px solid var(--color-primary, #4a6e5a);
        outline-offset: 2px;
      }
    `;
  }

  /**
   * 유틸리티 클래스 스타일을 가져옵니다.
   * @returns {string} 유틸리티 클래스 스타일 문자열
   */
  static getUtilityStyles() {
    return `
      /* 레이아웃 유틸리티 */
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .gap-1 { gap: var(--space-1, 0.25rem); }
      .gap-2 { gap: var(--space-2, 0.5rem); }
      .gap-4 { gap: var(--space-4, 1rem); }
      
      /* 여백 유틸리티 */
      .mt-1 { margin-top: var(--space-1, 0.25rem); }
      .mt-2 { margin-top: var(--space-2, 0.5rem); }
      .mb-2 { margin-bottom: var(--space-2, 0.5rem); }
      .mb-4 { margin-bottom: var(--space-4, 1rem); }
      
      /* 패딩 유틸리티 */
      .p-2 { padding: var(--space-2, 0.5rem); }
      .p-4 { padding: var(--space-4, 1rem); }
      .px-2 { padding-left: var(--space-2, 0.5rem); padding-right: var(--space-2, 0.5rem); }
      .py-1 { padding-top: var(--space-1, 0.25rem); padding-bottom: var(--space-1, 0.25rem); }
      
      /* 텍스트 유틸리티 */
      .text-sm { font-size: var(--text-sm, 0.875rem); }
      .text-lg { font-size: var(--text-lg, 1.125rem); }
      .font-bold { font-weight: 700; }
      .text-center { text-align: center; }
      
      /* 색상 유틸리티 */
      .text-primary { color: var(--color-text-primary, #1a202c); }
      .text-secondary { color: var(--color-text-secondary, #4a5568); }
      .bg-primary { background-color: var(--color-bg-primary, #ffffff); }
      .bg-secondary { background-color: var(--color-bg-secondary, #f7fafc); }
      
      /* 경계선 유틸리티 */
      .border { border: 1px solid var(--color-border, #e2e8f0); }
      .rounded { border-radius: var(--radius-md, 0.375rem); }
      .rounded-sm { border-radius: var(--radius-sm, 0.25rem); }
    `;
  }
  
  /**
   * 애니메이션 스타일을 가져옵니다.
   * @returns {string} 애니메이션 스타일 문자열
   */
  static getAnimationStyles() {
    return `
      /* 트랜지션 */
      .transition { transition: all 0.3s ease; }
      .transition-fast { transition: all 0.15s ease; }
      
      /* 애니메이션 */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
      .animate-slide-in-up { animation: slideInUp 0.3s ease-out; }
    `;
  }
}

/**
 * 컴포넌트 스타일 캐시
 * @type {Map<string, string>}
 */
const styleCache = new Map();

/**
 * 컴포넌트 스타일을 생성하고 캐싱합니다.
 * @param {Object} options - 스타일 옵션
 * @param {string} options.name - 컴포넌트 이름
 * @param {string} options.styles - CSS 문자열
 * @param {boolean} [options.useCommon=true] - 공통 스타일 사용 여부
 * @param {boolean} [options.useUtility=true] - 유틸리티 클래스 사용 여부
 * @param {boolean} [options.useAnimation=false] - 애니메이션 스타일 사용 여부
 * @returns {string} 완성된 스타일 문자열
 */
export function createStyles(options) {
  const { 
    name, 
    styles = '', 
    useCommon = true, 
    useUtility = true, 
    useAnimation = false 
  } = options;
  
  // 캐시 키 생성
  const cacheKey = `${name}-${useCommon}-${useUtility}-${useAnimation}`;
  
  // 캐시된 스타일이 있으면 반환
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }
  
  // 컴포넌트 스타일 생성
  let fullStyles = StyleManager.createComponentStyle({ 
    name, 
    styles,
    useVars: true
  });
  
  // 공통 스타일 추가
  if (useCommon) {
    fullStyles = StyleManager.getCommonStyles() + fullStyles;
  }
  
  // 유틸리티 클래스 추가
  if (useUtility) {
    fullStyles += StyleManager.getUtilityStyles();
  }
  
  // 애니메이션 스타일 추가
  if (useAnimation) {
    fullStyles += StyleManager.getAnimationStyles();
  }
  
  // 캐시에 저장
  styleCache.set(cacheKey, fullStyles);
  
  return fullStyles;
} 