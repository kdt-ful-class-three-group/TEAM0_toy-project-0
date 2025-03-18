/**
 * @file query.js
 * @description DOM 요소 선택과 관련된 유틸리티 함수
 */

/**
 * document.querySelector의 편리한 별칭
 * 
 * @example
 * const header = $('header');
 * const submitButton = $('#submit-button');
 * 
 * @param {string} selector - CSS 선택자
 * @param {Element} [parent=document] - 검색 범위로 사용할 상위 요소 (기본값: document)
 * @returns {Element|null} 찾은 요소 또는 null
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * document.querySelectorAll의 편리한 별칭
 * querySelectorAll과 달리 배열을 반환합니다.
 * 
 * @example
 * const paragraphs = $$('p');
 * paragraphs.forEach(p => p.classList.add('text'));
 * 
 * @param {string} selector - CSS 선택자
 * @param {Element} [parent=document] - 검색 범위로 사용할 상위 요소 (기본값: document)
 * @returns {Element[]} 찾은 요소의 배열
 */
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

/**
 * ID로 요소를 가져옵니다.
 * 
 * @example
 * const loginForm = getById('login-form');
 * 
 * @param {string} id - 요소 ID
 * @returns {Element|null} 찾은 요소 또는 null
 */
export const getById = (id) => document.getElementById(id);

/**
 * 클래스 이름으로 요소를 가져옵니다.
 * getElementsByClassName과 달리 배열을 반환합니다.
 * 
 * @example
 * const buttons = getByClass('btn');
 * 
 * @param {string} className - 클래스 이름
 * @param {Element} [parent=document] - 검색 범위로 사용할 상위 요소 (기본값: document)
 * @returns {Element[]} 찾은 요소의 배열
 */
export const getByClass = (className, parent = document) => Array.from(parent.getElementsByClassName(className));

/**
 * 태그 이름으로 요소를 가져옵니다.
 * getElementsByTagName과 달리 배열을 반환합니다.
 * 
 * @example
 * const images = getByTag('img');
 * 
 * @param {string} tagName - 태그 이름
 * @param {Element} [parent=document] - 검색 범위로 사용할 상위 요소 (기본값: document)
 * @returns {Element[]} 찾은 요소의 배열
 */
export const getByTag = (tagName, parent = document) => Array.from(parent.getElementsByTagName(tagName));

/**
 * 데이터 속성으로 요소를 가져옵니다.
 * 
 * @example
 * const userCards = getByData('user-id');
 * const activeItems = getByData('status', 'active');
 * 
 * @param {string} key - 데이터 속성 키 (data- 제외)
 * @param {string} [value] - 데이터 속성 값 (선택 사항)
 * @param {Element} [parent=document] - 검색 범위로 사용할 상위 요소 (기본값: document)
 * @returns {Element[]} 찾은 요소의 배열
 */
export const getByData = (key, value, parent = document) => {
  const selector = value === undefined 
    ? `[data-${key}]` 
    : `[data-${key}="${value}"]`;
  
  return $$(selector, parent);
};

/**
 * Shadow DOM 내부에서 요소를 선택합니다.
 * 
 * @example
 * const shadowButton = shadowQuery(customElement, 'button.primary');
 * 
 * @param {Element} host - Shadow DOM을 가진 호스트 요소
 * @param {string} selector - CSS 선택자
 * @returns {Element|null} 찾은 요소 또는 null
 */
export const shadowQuery = (host, selector) => {
  if (!host.shadowRoot) return null;
  return host.shadowRoot.querySelector(selector);
};

/**
 * Shadow DOM 내부에서 모든 요소를 선택합니다.
 * 
 * @example
 * const shadowLinks = shadowQueryAll(customElement, 'a.link');
 * 
 * @param {Element} host - Shadow DOM을 가진 호스트 요소
 * @param {string} selector - CSS 선택자
 * @returns {Element[]} 찾은 요소의 배열
 */
export const shadowQueryAll = (host, selector) => {
  if (!host.shadowRoot) return [];
  return Array.from(host.shadowRoot.querySelectorAll(selector));
};

/**
 * 가장 가까운, 주어진 선택자와 일치하는 상위 요소를 찾습니다.
 * 
 * @example
 * const card = closest(element, '.card');
 * 
 * @param {Element} element - 시작 요소
 * @param {string} selector - CSS 선택자
 * @returns {Element|null} 찾은 상위 요소 또는 null
 */
export const closest = (element, selector) => {
  return element.closest(selector);
};

/**
 * 요소가 선택자와 일치하는지 확인합니다.
 * 
 * @example
 * if (matches(element, '.active')) {
 *   // 요소가 .active 클래스를 가지고 있음
 * }
 * 
 * @param {Element} element - 검사할 요소
 * @param {string} selector - CSS 선택자
 * @returns {boolean} 요소가 선택자와 일치하는지 여부
 */
export const matches = (element, selector) => {
  return element.matches(selector);
};

/**
 * 요소가 다른 요소를 포함하는지 확인합니다.
 * 
 * @example
 * if (contains(parentElement, childElement)) {
 *   // parentElement가 childElement를 포함함
 * }
 * 
 * @param {Element} parent - 상위 요소
 * @param {Element} child - 하위 요소
 * @returns {boolean} 상위 요소가 하위 요소를 포함하는지 여부
 */
export const contains = (parent, child) => {
  return parent.contains(child);
}; 