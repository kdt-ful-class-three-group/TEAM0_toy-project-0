/**
 * @file styling.js
 * @description DOM 요소의 스타일링을 처리하는 통합 유틸리티 함수
 */

import { createStyles } from '../style/styleManager.js';
import { createElement, setStyles, addClass, removeClass } from './manipulation.js';

/**
 * 스타일과 DOM 조작을 동시에 처리하는 요소 생성 함수
 * 
 * @example
 * const card = createStyledElement('div', {
 *   className: 'card',
 *   style: {
 *     backgroundColor: 'white',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
 *   },
 *   children: [
 *     createStyledElement('h2', { textContent: 'Card Title' }),
 *     createStyledElement('p', { textContent: 'Card content...' })
 *   ]
 * });
 * 
 * @param {string} tag - 태그 이름
 * @param {Object} options - 요소 옵션
 * @param {string} [options.className] - 클래스 이름
 * @param {Object} [options.style] - 인라인 스타일 객체
 * @param {string} [options.textContent] - 텍스트 내용
 * @param {Object} [options.dataset] - 데이터 속성 객체
 * @param {Array} [options.children] - 자식 요소 배열
 * @param {Object} [options.attrs] - 기타 속성 객체
 * @param {Object} [options.events] - 이벤트 핸들러 객체
 * @returns {HTMLElement} 생성된 요소
 */
export const createStyledElement = (tag, options = {}) => {
  const {
    className,
    style,
    textContent,
    dataset,
    children,
    attrs = {},
    events = {}
  } = options;
  
  // 기본 속성 설정
  const elementAttrs = { ...attrs };
  
  // 클래스 설정
  if (className) {
    elementAttrs.className = className;
  }
  
  // 이벤트 핸들러 설정
  Object.entries(events).forEach(([eventName, handler]) => {
    const eventKey = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
    elementAttrs[eventKey] = handler;
  });
  
  // 요소 생성
  const element = createElement(tag, elementAttrs, 
    children ? (Array.isArray(children) ? children : [children]) : []
  );
  
  // 텍스트 내용 설정
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  
  // 스타일 설정
  if (style) {
    setStyles(element, style);
  }
  
  // 데이터 속성 설정
  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }
  
  return element;
};

/**
 * Shadow DOM에 스타일을 주입합니다.
 * 
 * @example
 * // 컴포넌트 클래스 내부에서
 * constructor() {
 *   super();
 *   this.attachShadow({ mode: 'open' });
 *   injectShadowStyles(this, `
 *     :host { display: block; }
 *     .container { padding: 1rem; }
 *   `);
 * }
 * 
 * @param {HTMLElement} host - Shadow DOM을 가진 호스트 요소
 * @param {string} styles - CSS 문자열
 * @param {Object} [options] - 옵션
 * @param {boolean} [options.prepend=false] - 스타일을 앞에 추가할지 여부
 * @returns {HTMLStyleElement} 생성된 스타일 요소
 */
export const injectShadowStyles = (host, styles, options = {}) => {
  if (!host.shadowRoot) {
    console.warn('호스트 요소에 shadowRoot가 없습니다.');
    return null;
  }
  
  const { prepend = false } = options;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  
  if (prepend && host.shadowRoot.firstChild) {
    host.shadowRoot.insertBefore(styleEl, host.shadowRoot.firstChild);
  } else {
    host.shadowRoot.appendChild(styleEl);
  }
  
  return styleEl;
};

/**
 * styleManager의 createStyles를 사용하여 Shadow DOM에 스타일을 주입합니다.
 * 
 * @example
 * // 컴포넌트 클래스 내부에서
 * constructor() {
 *   super();
 *   this.attachShadow({ mode: 'open' });
 *   
 *   injectComponentStyles(this, {
 *     name: 'MyComponent',
 *     styles: `
 *       .container { padding: 1rem; }
 *       .title { font-size: 1.5rem; }
 *     `,
 *     useCommon: true,
 *     useUtility: true
 *   });
 * }
 * 
 * @param {HTMLElement} host - Shadow DOM을 가진 호스트 요소
 * @param {Object} options - 스타일 옵션 (createStyles 옵션과 동일)
 * @returns {HTMLStyleElement} 생성된 스타일 요소
 */
export const injectComponentStyles = (host, options) => {
  if (!host.shadowRoot) {
    console.warn('호스트 요소에 shadowRoot가 없습니다.');
    return null;
  }
  
  const styleText = createStyles(options);
  return injectShadowStyles(host, styleText);
};

/**
 * 테마 변수를 적용한 스타일을 생성합니다.
 * 
 * @example
 * const styles = createThemedStyles(`
 *   .container {
 *     background-color: var(--bg-color);
 *     color: var(--text-color);
 *   }
 * `, {
 *   '--bg-color': isDarkMode ? '#333' : '#fff',
 *   '--text-color': isDarkMode ? '#fff' : '#333'
 * });
 * 
 * @param {string} cssText - CSS 문자열
 * @param {Object} variables - CSS 변수와 값
 * @returns {string} 변수가 적용된 CSS 문자열
 */
export const createThemedStyles = (cssText, variables) => {
  let result = cssText;
  
  // 변수를 인라인으로 적용
  Object.entries(variables).forEach(([name, value]) => {
    const regex = new RegExp(`var\\(${name}(,[^)]+)?\\)`, 'g');
    result = result.replace(regex, value);
  });
  
  // 변수 선언 추가
  const varDeclarations = Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n  ');
  
  if (varDeclarations) {
    result = `:host {\n  ${varDeclarations}\n}\n\n${result}`;
  }
  
  return result;
};

/**
 * 요소에 조건부로 클래스를 적용합니다.
 * 
 * @example
 * // 클래스 객체
 * applyClasses(element, {
 *   'active': isActive,
 *   'disabled': isDisabled,
 *   'large': size === 'large'
 * });
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {Object} classMap - 클래스 이름과 조건의 맵
 * @returns {HTMLElement} 업데이트된 요소
 */
export const applyClasses = (element, classMap) => {
  Object.entries(classMap).forEach(([className, condition]) => {
    if (condition) {
      addClass(element, className);
    } else {
      removeClass(element, className);
    }
  });
  
  return element;
};

/**
 * CSS 애니메이션을 요소에 적용합니다.
 * 
 * @example
 * // 기본 애니메이션 적용
 * animate(element, 'fadeIn', 300);
 * 
 * // 커스텀 애니메이션 적용
 * animate(element, {
 *   keyframes: [
 *     { opacity: 0, transform: 'translateY(20px)' },
 *     { opacity: 1, transform: 'translateY(0)' }
 *   ],
 *   options: {
 *     duration: 500,
 *     easing: 'ease-out',
 *     fill: 'forwards'
 *   }
 * });
 * 
 * @param {HTMLElement} element - 애니메이션을 적용할 요소
 * @param {string|Object} animation - 애니메이션 이름 또는 구성 객체
 * @param {number} [duration] - 애니메이션 지속 시간(ms)
 * @param {Function} [callback] - 애니메이션 완료 후 호출할 콜백
 * @returns {Animation|null} 애니메이션 객체 또는 null
 */
export const animate = (element, animation, duration = 300, callback) => {
  // Web Animations API 지원 확인
  if (!element.animate) {
    if (callback) callback();
    return null;
  }
  
  let anim;
  
  if (typeof animation === 'string') {
    // 미리 정의된 애니메이션 사용
    const animations = {
      fadeIn: [
        { opacity: 0 },
        { opacity: 1 }
      ],
      fadeOut: [
        { opacity: 1 },
        { opacity: 0 }
      ],
      slideIn: [
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      slideOut: [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(20px)', opacity: 0 }
      ]
    };
    
    const keyframes = animations[animation];
    if (!keyframes) {
      console.warn(`정의되지 않은 애니메이션: ${animation}`);
      if (callback) callback();
      return null;
    }
    
    anim = element.animate(keyframes, {
      duration,
      easing: 'ease',
      fill: 'forwards'
    });
  } else if (typeof animation === 'object') {
    // 커스텀 애니메이션 구성 사용
    const { keyframes, options = {} } = animation;
    anim = element.animate(keyframes, options);
  }
  
  // 콜백 설정
  if (anim && callback) {
    anim.onfinish = callback;
  }
  
  return anim;
}; 