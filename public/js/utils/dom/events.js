/**
 * @file events.js
 * @description DOM 이벤트 처리 관련 유틸리티 함수
 */

/**
 * 이벤트 리스너를 등록합니다.
 * 
 * @example
 * const button = document.querySelector('button');
 * const handler = (e) => console.log('Clicked');
 * 
 * on(button, 'click', handler);
 * 
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 유형
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 옵션
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const on = (element, eventType, handler, options = {}) => {
  element.addEventListener(eventType, handler, options);
  
  return () => {
    element.removeEventListener(eventType, handler, options);
  };
};

/**
 * 한 번만 실행되는 이벤트 리스너를 등록합니다.
 * 
 * @example
 * const button = document.querySelector('button');
 * once(button, 'click', (e) => {
 *   console.log('This will only run once');
 * });
 * 
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 유형
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 옵션
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const once = (element, eventType, handler, options = {}) => {
  const onceHandler = (event) => {
    element.removeEventListener(eventType, onceHandler, options);
    handler.call(element, event);
  };
  
  element.addEventListener(eventType, onceHandler, options);
  
  return () => {
    element.removeEventListener(eventType, onceHandler, options);
  };
};

/**
 * 이벤트 위임 처리를 위한 함수
 * 상위 요소에 리스너를 등록하고 하위 요소에서 이벤트가 발생할 때 처리합니다.
 * 
 * @example
 * const list = document.querySelector('ul');
 * delegate(list, 'click', 'li', (e) => {
 *   console.log('Clicked list item:', e.delegateTarget.textContent);
 * });
 * 
 * @param {HTMLElement} element - 이벤트 위임을 위한 상위 요소
 * @param {string} eventType - 이벤트 유형
 * @param {string} selector - 타겟을 찾기 위한 CSS 선택자
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 옵션
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const delegate = (element, eventType, selector, handler, options = {}) => {
  const delegateHandler = (event) => {
    // 이벤트가 발생한 대상에서부터 상위로 올라가며 selector와 일치하는 요소 찾기
    const targetElement = event.target.closest(selector);
    
    // 일치하는 요소가 있고, element의 하위 요소인지 확인
    if (targetElement && element.contains(targetElement)) {
      // 위임된 타겟 정보를 이벤트 객체에 추가
      event.delegateTarget = targetElement;
      handler.call(targetElement, event);
    }
  };
  
  element.addEventListener(eventType, delegateHandler, options);
  
  return () => {
    element.removeEventListener(eventType, delegateHandler, options);
  };
};

/**
 * 여러 이벤트 유형에 동일한 핸들러를 등록합니다.
 * 
 * @example
 * const input = document.querySelector('input');
 * onMultiple(input, ['focus', 'blur', 'input'], (e) => {
 *   console.log('Event type:', e.type);
 * });
 * 
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string[]} eventTypes - 이벤트 유형 배열
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 옵션
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const onMultiple = (element, eventTypes, handler, options = {}) => {
  const cleanups = eventTypes.map(type => on(element, type, handler, options));
  
  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
};

/**
 * 이벤트를 트리거합니다.
 * 
 * @example
 * const button = document.querySelector('button');
 * trigger(button, 'click');
 * 
 * // 커스텀 이벤트 트리거
 * trigger(document, 'app:loaded', { detail: { version: '1.0' } });
 * 
 * @param {HTMLElement} element - 이벤트를 트리거할 요소
 * @param {string} eventType - 이벤트 유형
 * @param {Object} [options] - 이벤트 옵션
 * @returns {boolean} 이벤트가 취소되었는지 여부
 */
export const trigger = (element, eventType, options = {}) => {
  let event;
  
  if (typeof eventType === 'string' && eventType.includes(':')) {
    // 커스텀 이벤트
    event = new CustomEvent(eventType, { 
      bubbles: true, 
      cancelable: true, 
      ...options 
    });
  } else {
    // 기본 이벤트
    event = new Event(eventType, { 
      bubbles: true, 
      cancelable: true, 
      ...options 
    });
  }
  
  return element.dispatchEvent(event);
};

/**
 * 이벤트 전파를 중지합니다.
 * 
 * @example
 * on(element, 'click', (e) => {
 *   stopPropagation(e);
 *   // 이벤트가 상위 요소로 전파되지 않음
 * });
 * 
 * @param {Event} event - 이벤트 객체
 * @returns {Event} 원본 이벤트 객체
 */
export const stopPropagation = (event) => {
  event.stopPropagation();
  return event;
};

/**
 * 이벤트의 기본 동작을 취소합니다.
 * 
 * @example
 * on(form, 'submit', (e) => {
 *   preventDefault(e);
 *   // 폼 제출의 기본 동작이 취소됨
 * });
 * 
 * @param {Event} event - 이벤트 객체
 * @returns {Event} 원본 이벤트 객체
 */
export const preventDefault = (event) => {
  event.preventDefault();
  return event;
};

/**
 * 이벤트 전파를 중지하고 기본 동작을 취소합니다.
 * 
 * @example
 * on(link, 'click', (e) => {
 *   stopEvent(e);
 *   // 이벤트 전파와 기본 동작 모두 중지됨
 * });
 * 
 * @param {Event} event - 이벤트 객체
 * @returns {Event} 원본 이벤트 객체
 */
export const stopEvent = (event) => {
  event.stopPropagation();
  event.preventDefault();
  return event;
};

/**
 * 한 요소에서 다른 요소로 이벤트 전달
 * 
 * @example
 * const source = document.querySelector('.source');
 * const target = document.querySelector('.target');
 * relay(source, target, 'click');
 * 
 * @param {HTMLElement} source - 이벤트 소스 요소
 * @param {HTMLElement} target - 이벤트 대상 요소
 * @param {string|string[]} eventTypes - 전달할 이벤트 유형 또는 배열
 * @returns {Function} 이벤트 전달 중지 함수
 */
export const relay = (source, target, eventTypes) => {
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
  const relayHandlers = {};
  
  types.forEach(type => {
    relayHandlers[type] = (event) => {
      trigger(target, type, {
        detail: { 
          originalEvent: event,
          relayedFrom: source
        }
      });
    };
    
    source.addEventListener(type, relayHandlers[type]);
  });
  
  return () => {
    types.forEach(type => {
      source.removeEventListener(type, relayHandlers[type]);
    });
  };
}; 