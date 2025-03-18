/**
 * @file domOptimizer.js
 * @description DOM 조작 최적화를 위한 유틸리티 모듈
 * 가벼운 가상 DOM 구현, 불필요한 리렌더링 방지, 일괄 DOM 업데이트 기능을 제공합니다.
 */

/**
 * 가상 DOM 노드 생성
 * @param {string} tag - 태그 이름
 * @param {Object} props - 속성 객체
 * @param {Array} children - 자식 노드 배열
 * @returns {Object} 가상 DOM 노드 객체
 */
export const createVNode = (tag, props = {}, children = []) => {
  return {
    tag,
    props: props || {},
    children: children.map(child => 
      typeof child === 'string' || typeof child === 'number'
        ? { tag: 'TEXT_ELEMENT', props: { nodeValue: child.toString() }, children: [] }
        : child
    ),
    key: props?.key,
    dom: null
  };
};

/**
 * 실제 DOM 요소 생성
 * @param {Object} vnode - 가상 DOM 노드
 * @returns {Node} 실제 DOM 노드
 */
export const createDOMElement = (vnode) => {
  let dom;
  
  if (vnode.tag === 'TEXT_ELEMENT') {
    dom = document.createTextNode(vnode.props.nodeValue);
  } else {
    dom = document.createElement(vnode.tag);
    
    // 속성 설정
    updateProps(dom, {}, vnode.props);
    
    // 이벤트 리스너 설정
    Object.keys(vnode.props || {})
      .filter(isEventProp)
      .forEach(name => {
        const eventName = name.toLowerCase().substring(2);
        dom.addEventListener(eventName, vnode.props[name]);
      });
    
    // 자식 요소 렌더링
    vnode.children.forEach(child => {
      const childElement = createDOMElement(child);
      dom.appendChild(childElement);
    });
  }
  
  vnode.dom = dom;
  return dom;
};

/**
 * 이벤트 속성인지 확인
 * @param {string} name - 속성 이름
 * @returns {boolean} 이벤트 속성 여부
 */
const isEventProp = (name) => /^on[A-Z]/.test(name);

/**
 * DOM 속성 업데이트
 * @param {HTMLElement} dom - 실제 DOM 요소
 * @param {Object} prevProps - 이전 속성
 * @param {Object} nextProps - 새 속성
 */
const updateProps = (dom, prevProps = {}, nextProps = {}) => {
  // 이전 속성 제거
  Object.keys(prevProps)
    .filter(key => !isEventProp(key) && key !== 'children')
    .forEach(name => {
      if (!(name in nextProps)) {
        dom.removeAttribute(propToAttr(name));
      }
    });
  
  // 새 속성 설정
  Object.keys(nextProps)
    .filter(key => !isEventProp(key) && key !== 'children')
    .forEach(name => {
      if (prevProps[name] !== nextProps[name]) {
        if (name === 'style' && typeof nextProps[name] === 'object') {
          // 스타일 객체 처리
          Object.keys(nextProps[name]).forEach(styleName => {
            dom.style[styleName] = nextProps[name][styleName];
          });
        } else if (name === 'className') {
          // 클래스 이름 처리
          dom.setAttribute('class', nextProps[name]);
        } else {
          // 일반 속성 처리
          dom.setAttribute(propToAttr(name), nextProps[name]);
        }
      }
    });
};

/**
 * camelCase 속성을 kebab-case 속성으로 변환
 * @param {string} prop - 속성 이름
 * @returns {string} 변환된 속성 이름
 */
const propToAttr = (prop) => {
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * 가상 DOM 노드 비교 및 DOM 업데이트
 * @param {HTMLElement} parentDom - 부모 DOM 요소
 * @param {Object} oldVNode - 이전 가상 DOM 노드
 * @param {Object} newVNode - 새 가상 DOM 노드
 * @param {number} index - 자식 인덱스
 */
export const updateElement = (parentDom, oldVNode, newVNode, index = 0) => {
  // 이전 노드가 없고 새 노드가 있는 경우 (추가)
  if (!oldVNode && newVNode) {
    parentDom.appendChild(createDOMElement(newVNode));
    return;
  }
  
  // 새 노드가 없고 이전 노드가 있는 경우 (삭제)
  if (!newVNode && oldVNode) {
    removeVNode(parentDom, oldVNode, index);
    return;
  }
  
  // 노드 유형이 변경된 경우 (대체)
  if (oldVNode && newVNode && isNodeChanged(oldVNode, newVNode)) {
    parentDom.replaceChild(
      createDOMElement(newVNode),
      parentDom.childNodes[index]
    );
    return;
  }
  
  // 같은 유형의 노드인 경우 (속성 업데이트)
  if (oldVNode && newVNode && oldVNode.tag === newVNode.tag) {
    // 텍스트 요소인 경우
    if (oldVNode.tag === 'TEXT_ELEMENT') {
      if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
        parentDom.childNodes[index].nodeValue = newVNode.props.nodeValue;
      }
      newVNode.dom = parentDom.childNodes[index];
      return;
    }
    
    // 일반 요소인 경우 속성 업데이트
    newVNode.dom = oldVNode.dom || parentDom.childNodes[index];
    updateProps(newVNode.dom, oldVNode.props, newVNode.props);
    
    // 이벤트 리스너 업데이트
    // 이전 이벤트 리스너 제거
    Object.keys(oldVNode.props || {})
      .filter(isEventProp)
      .forEach(name => {
        const eventName = name.toLowerCase().substring(2);
        if (!(name in newVNode.props)) {
          newVNode.dom.removeEventListener(eventName, oldVNode.props[name]);
        }
      });
    
    // 새 이벤트 리스너 추가
    Object.keys(newVNode.props || {})
      .filter(isEventProp)
      .forEach(name => {
        const eventName = name.toLowerCase().substring(2);
        if (oldVNode.props[name] !== newVNode.props[name]) {
          if (oldVNode.props[name]) {
            newVNode.dom.removeEventListener(eventName, oldVNode.props[name]);
          }
          newVNode.dom.addEventListener(eventName, newVNode.props[name]);
        }
      });
    
    // 자식 요소 재귀적 업데이트
    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    const maxChildCount = Math.max(oldChildren.length, newChildren.length);
    
    for (let i = 0; i < maxChildCount; i++) {
      updateElement(newVNode.dom, oldChildren[i], newChildren[i], i);
    }
  }
};

/**
 * 노드가 변경되었는지 확인
 * @param {Object} oldVNode - 이전 가상 DOM 노드
 * @param {Object} newVNode - 새 가상 DOM 노드
 * @returns {boolean} 노드 변경 여부
 */
const isNodeChanged = (oldVNode, newVNode) => {
  return (
    oldVNode.tag !== newVNode.tag ||
    (oldVNode.props?.key !== undefined && 
     newVNode.props?.key !== undefined && 
     oldVNode.props.key !== newVNode.props.key)
  );
};

/**
 * 가상 DOM 노드 제거
 * @param {HTMLElement} parentDom - 부모 DOM 요소
 * @param {Object} vnode - 제거할 가상 DOM 노드
 * @param {number} index - 자식 인덱스
 */
const removeVNode = (parentDom, vnode, index) => {
  if (parentDom && index >= 0 && index < parentDom.childNodes.length) {
    parentDom.removeChild(parentDom.childNodes[index]);
  }
};

/**
 * 일괄 DOM 업데이트를 위한 큐
 * 여러 업데이트를 모아서 한 번에 처리합니다.
 */
export class BatchDOMUpdater {
  constructor() {
    this.updateQueue = [];
    this.isUpdateScheduled = false;
  }
  
  /**
   * 업데이트 작업 등록
   * @param {Function} updateFn - 업데이트 함수
   */
  enqueue(updateFn) {
    this.updateQueue.push(updateFn);
    
    if (!this.isUpdateScheduled) {
      this.isUpdateScheduled = true;
      this.scheduleUpdate();
    }
  }
  
  /**
   * 업데이트 스케줄링
   */
  scheduleUpdate() {
    requestAnimationFrame(() => {
      this.processQueue();
    });
  }
  
  /**
   * 큐 처리
   */
  processQueue() {
    const queue = this.updateQueue;
    this.updateQueue = [];
    this.isUpdateScheduled = false;
    
    // 모든 작업 실행
    queue.forEach(updateFn => {
      try {
        updateFn();
      } catch (error) {
        console.error('DOM 업데이트 중 오류 발생:', error);
      }
    });
  }
}

// 싱글톤 인스턴스
export const batchUpdater = new BatchDOMUpdater();

/**
 * 인터섹션 옵저버를 사용한 지연 로딩
 * @param {HTMLElement} element - 관찰할 요소
 * @param {Function} callback - 요소가 보일 때 실행할 콜백
 * @param {Object} options - 옵저버 옵션
 */
export const lazyLoad = (element, callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { ...defaultOptions, ...options });
  
  observer.observe(element);
  
  return {
    destroy: () => observer.unobserve(element)
  };
};

/**
 * 컴포넌트 렌더링 최적화 데코레이터
 * BaseComponent 클래스의 render 메소드를 최적화합니다.
 * @param {Class} ComponentClass - 최적화할 컴포넌트 클래스
 * @returns {Class} 최적화된 컴포넌트 클래스
 */
export function optimizeRendering(ComponentClass) {
  const originalRender = ComponentClass.prototype.render;
  
  ComponentClass.prototype.render = function() {
    // 이전 상태 저장
    if (!this._prevProps) {
      this._prevProps = {};
    }
    
    // 속성이 변경되지 않은 경우 렌더링 스킵
    if (this.props && this._prevProps && shallowEqual(this.props, this._prevProps)) {
      return;
    }
    
    // 원본 렌더 함수 호출
    originalRender.call(this);
    
    // 현재 상태 저장
    this._prevProps = { ...this.props };
  };
  
  return ComponentClass;
}

/**
 * 얕은 동등성 비교
 * @param {Object} objA - 첫 번째 객체
 * @param {Object} objB - 두 번째 객체
 * @returns {boolean} 동등성 여부
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  
  if (!objA || !objB) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (const key of keysA) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * DOM 요소 생성 및 속성 설정을 최적화하는 유틸리티
 * @param {string} tag - 태그 이름
 * @param {Object} props - 요소 속성
 * @param {Array} children - 자식 요소 배열
 * @returns {HTMLElement} 생성된 DOM 요소
 */
export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  
  // 속성 설정
  Object.entries(props || {}).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'className') {
      element.className = value;
    } else if (isEventProp(key)) {
      const eventName = key.toLowerCase().substring(2);
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(propToAttr(key), value);
    }
  });
  
  // 자식 요소 추가
  children.flat().forEach(child => {
    if (child === null || child === undefined) return;
    
    const node = typeof child === 'string' 
      ? document.createTextNode(child)
      : child;
      
    element.appendChild(node);
  });
  
  return element;
} 