/**
 * @file manipulation.js
 * @description DOM 요소 생성 및 조작 관련 유틸리티 함수
 */

/**
 * DOM 요소를 생성합니다.
 * 
 * @example
 * const div = createElement('div', {
 *   className: 'container',
 *   id: 'main',
 *   style: { color: 'red', fontSize: '16px' },
 *   dataset: { role: 'main', testId: 'container' },
 *   onClick: () => console.log('clicked')
 * }, [
 *   createElement('h1', {}, 'Hello World'),
 *   createElement('p', {}, 'This is a paragraph')
 * ]);
 * 
 * @param {string} tag - 태그 이름
 * @param {Object} [attrs={}] - 속성 객체
 * @param {string|Array} [children] - 자식 노드 (텍스트 또는 요소 배열)
 * @returns {HTMLElement} 생성된 요소
 */
export const createElement = (tag, attrs = {}, children = []) => {
  const element = document.createElement(tag);
  
  // 속성 설정
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // 자식 요소 추가
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child) {
        element.appendChild(
          typeof child === 'string' 
            ? document.createTextNode(child)
            : child
        );
      }
    });
  } else if (children) {
    element.appendChild(
      typeof children === 'string'
        ? document.createTextNode(children)
        : children
    );
  }
  
  return element;
};

/**
 * 텍스트 노드를 생성합니다.
 * 
 * @example
 * const text = createText('Hello World');
 * 
 * @param {string} content - 텍스트 내용
 * @returns {Text} 생성된 텍스트 노드
 */
export const createText = (content) => document.createTextNode(content);

/**
 * 요소에 자식 요소를 추가합니다.
 * 
 * @example
 * const ul = document.querySelector('ul');
 * append(ul, [
 *   createElement('li', {}, 'Item 1'),
 *   createElement('li', {}, 'Item 2')
 * ]);
 * 
 * @param {HTMLElement} parent - 부모 요소
 * @param {HTMLElement|HTMLElement[]|string} children - 추가할 자식 요소(들)
 * @returns {HTMLElement} 부모 요소
 */
export const append = (parent, children) => {
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child) {
        parent.appendChild(
          typeof child === 'string' 
            ? document.createTextNode(child) 
            : child
        );
      }
    });
  } else if (children) {
    parent.appendChild(
      typeof children === 'string'
        ? document.createTextNode(children)
        : children
    );
  }
  
  return parent;
};

/**
 * 요소의 모든 자식을 제거합니다.
 * 
 * @example
 * const container = document.querySelector('.container');
 * empty(container);
 * 
 * @param {HTMLElement} element - 비울 요소
 * @returns {HTMLElement} 비워진 요소
 */
export const empty = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
};

/**
 * 요소를 부모에서 제거합니다.
 * 
 * @example
 * const element = document.querySelector('.to-remove');
 * remove(element);
 * 
 * @param {HTMLElement} element - 제거할 요소
 * @returns {HTMLElement|null} 제거된 요소 또는 부모가 없는 경우 null
 */
export const remove = (element) => {
  if (element && element.parentNode) {
    return element.parentNode.removeChild(element);
  }
  return null;
};

/**
 * 요소의 HTML 내용을 설정합니다.
 * 
 * @example
 * const container = document.querySelector('.container');
 * setHTML(container, '<h1>Title</h1><p>Content</p>');
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {string} html - 설정할 HTML 문자열
 * @returns {HTMLElement} 업데이트된 요소
 */
export const setHTML = (element, html) => {
  element.innerHTML = html;
  return element;
};

/**
 * 요소의 텍스트 내용을 설정합니다.
 * 
 * @example
 * const title = document.querySelector('h1');
 * setText(title, 'New Title');
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {string} text - 설정할 텍스트
 * @returns {HTMLElement} 업데이트된 요소
 */
export const setText = (element, text) => {
  element.textContent = text;
  return element;
};

/**
 * 요소에 클래스를 추가합니다.
 * 
 * @example
 * const element = document.querySelector('div');
 * addClass(element, 'active');
 * addClass(element, ['primary', 'large']);
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {string|string[]} classes - 추가할 클래스 이름 또는 배열
 * @returns {HTMLElement} 업데이트된 요소
 */
export const addClass = (element, classes) => {
  if (Array.isArray(classes)) {
    element.classList.add(...classes);
  } else {
    element.classList.add(classes);
  }
  return element;
};

/**
 * 요소에서 클래스를 제거합니다.
 * 
 * @example
 * const element = document.querySelector('div');
 * removeClass(element, 'active');
 * removeClass(element, ['primary', 'large']);
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {string|string[]} classes - 제거할 클래스 이름 또는 배열
 * @returns {HTMLElement} 업데이트된 요소
 */
export const removeClass = (element, classes) => {
  if (Array.isArray(classes)) {
    element.classList.remove(...classes);
  } else {
    element.classList.remove(classes);
  }
  return element;
};

/**
 * 요소의 클래스 토글(추가/제거)
 * 
 * @example
 * const btn = document.querySelector('button');
 * toggleClass(btn, 'active');
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {string} className - 토글할 클래스 이름
 * @param {boolean} [force] - 지정된 경우, 클래스를 추가(true)하거나 제거(false)합니다.
 * @returns {HTMLElement} 업데이트된 요소
 */
export const toggleClass = (element, className, force) => {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
  return element;
};

/**
 * 요소가 특정 클래스를 가지고 있는지 확인합니다.
 * 
 * @example
 * const btn = document.querySelector('button');
 * if (hasClass(btn, 'active')) {
 *   // 버튼이 활성화됨
 * }
 * 
 * @param {HTMLElement} element - 검사할 요소
 * @param {string} className - 확인할 클래스 이름
 * @returns {boolean} 요소가 해당 클래스를 가지고 있는지 여부
 */
export const hasClass = (element, className) => {
  return element.classList.contains(className);
};

/**
 * 요소의 스타일을 설정합니다.
 * 
 * @example
 * const element = document.querySelector('div');
 * setStyles(element, {
 *   color: 'red',
 *   fontSize: '16px',
 *   marginTop: '10px'
 * });
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {Object} styles - 설정할 스타일 객체
 * @returns {HTMLElement} 업데이트된 요소
 */
export const setStyles = (element, styles) => {
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });
  return element;
};

/**
 * 요소의 속성을 설정합니다.
 * 
 * @example
 * const img = document.querySelector('img');
 * setAttrs(img, {
 *   src: 'image.jpg',
 *   alt: 'An image',
 *   width: '100'
 * });
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {Object} attrs - 설정할 속성 객체
 * @returns {HTMLElement} 업데이트된 요소
 */
export const setAttrs = (element, attrs) => {
  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  return element;
};

/**
 * 요소의 데이터 속성을 설정합니다.
 * 
 * @example
 * const element = document.querySelector('div');
 * setDataAttrs(element, {
 *   userId: '123',
 *   role: 'admin',
 *   active: 'true'
 * });
 * // <div data-user-id="123" data-role="admin" data-active="true"></div>
 * 
 * @param {HTMLElement} element - 대상 요소
 * @param {Object} dataAttrs - 설정할 데이터 속성 객체
 * @returns {HTMLElement} 업데이트된 요소
 */
export const setDataAttrs = (element, dataAttrs) => {
  Object.entries(dataAttrs).forEach(([key, value]) => {
    // camelCase를 kebab-case로 변환 (예: userId -> user-id)
    const dataKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    element.dataset[key] = value;
  });
  return element;
}; 