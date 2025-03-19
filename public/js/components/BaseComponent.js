/**
 * @file BaseComponent.js
 * @description 모든 웹 컴포넌트의 기본 클래스
 * 공통 기능을 제공하고 생명주기 메소드를 표준화합니다.
 */
import { createStyles } from '../utils/styleManager.js';
import { debounce, throttle } from '../utils/performance.js';
import { batchUpdater } from '../utils/domOptimizer.js';

/**
 * 모든 컴포넌트의 기본 클래스
 * @class BaseComponent
 * @extends HTMLElement
 */
export class BaseComponent extends HTMLElement {
  /**
   * 컴포넌트 생성자
   * @param {Object} options - 컴포넌트 옵션
   * @param {boolean} options.useShadow - Shadow DOM 사용 여부 (기본값: true)
   * @param {string} options.styleSheet - 스타일시트 경로 (기본값: null)
   * @param {string} options.styles - 인라인 CSS 문자열
   * @param {boolean} options.useCommonStyles - 공통 스타일 사용 여부 (기본값: true)
   * @param {boolean} options.useUtilityStyles - 유틸리티 클래스 사용 여부 (기본값: true)
   * @param {boolean} options.useAnimationStyles - 애니메이션 스타일 사용 여부 (기본값: false)
   * @param {boolean} options.deferRender - 첫 렌더링을 다음 프레임으로 미룰지 여부 (기본값: false)
   * @param {boolean} options.optimizeUpdates - 렌더링 최적화 사용 여부 (기본값: true)
   * @param {number} options.renderThrottle - 렌더링 쓰로틀 지연 시간(ms) (기본값: 0, 비활성화)
   */
  constructor(options = {}) {
    super();
    
    // 기본 옵션 설정
    this.options = {
      useShadow: true,
      styleSheet: null,
      styles: '',
      useCommonStyles: true,
      useUtilityStyles: true,
      useAnimationStyles: false,
      deferRender: false,
      optimizeUpdates: true,
      renderThrottle: 0,
      ...options
    };
    
    // 기본 테마 변수 설정
    this._setupBaseThemeVariables();
    
    // Shadow DOM 설정
    if (this.options.useShadow) {
      this.attachShadow({ mode: 'open' });
    }
    
    // 내부 상태 초기화
    this._initialized = false;
    this._container = null;
    this._unsubscribers = [];
    this._prevProps = null;
    this._renderPending = false;
    this._updateQueued = false;
    
    // 컴포넌트 이름 추출
    this._componentName = this.constructor.name;
    
    // 성능 최적화: 렌더링 함수 최적화
    if (this.options.renderThrottle > 0) {
      this._optimizedRender = throttle(this._render.bind(this), this.options.renderThrottle);
    } else {
      this._optimizedRender = this._render.bind(this);
    }
    
    // 성능 측정 초기화
    this._renderCount = 0;
    this._lastRenderTime = 0;
    this._totalRenderTime = 0;
  }
  
  /**
   * 기본 테마 변수를 문서에 설정합니다.
   * @private
   */
  _setupBaseThemeVariables() {
    // 문서 레벨에서 필요한 CSS 변수가 없으면 기본값 설정
    const style = document.getElementById('base-theme-variables');
    if (!style) {
      const css = `
        :root {
          /* 색상 변수 */
          --color-dark-1: #121212;
          --color-dark-2: #1e1e1e;
          --color-dark-3: #2d2d2d;
          --color-text-primary: #ffffff;
          --color-text-secondary: #b3b3b3;
          --color-text-tertiary: #888888;
          --color-primary: #4f46e5;
          --color-border: #333333;
          --color-border-light: #444444;
          
          /* 간격 변수 */
          --space-1: 0.25rem;
          --space-2: 0.5rem;
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-6: 1.5rem;
          
          /* 레이아웃 변수 */
          --nav-width: 240px;
          --main-width: 1fr;
          --sidebar-width: 320px;
          --nav-padding: 1rem;
          --section-padding: 1.5rem;
          
          /* 입력 필드 변수 */
          --input-bg: #333333;
          --input-text: #ffffff;
          --input-border: #444444;
          
          /* 경계 변수 */
          --border-dark: 1px solid #333333;
          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          
          /* 글꼴 크기 변수 */
          --text-xs: 0.75rem;
          --text-sm: 0.875rem;
          --text-base: 1rem;
          --text-md: 1.125rem;
          --text-lg: 1.25rem;
          --text-xl: 1.5rem;
          
          /* 그림자 변수 */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.id = 'base-theme-variables';
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }
  }
  
  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   * 이 메소드는 자식 클래스에서 오버라이드하지 않는 것이 좋습니다.
   * 대신 initialize() 메소드를 구현하세요.
   */
  connectedCallback() {
    if (!this._initialized) {
      console.time(`${this._componentName}-init`);
      
      // 스타일시트 로드
      this.loadStyles();
      
      // 컴포넌트 초기화
      this.initialize();
      
      // 렌더링 (필요한 경우 지연)
      if (this.options.deferRender) {
        this._deferredRender();
      } else {
        this._optimizedRender();
      }
      
      this._initialized = true;
      console.timeEnd(`${this._componentName}-init`);
    }
  }
  
  /**
   * 컴포넌트가 DOM에서 제거될 때 호출됩니다.
   * 이벤트 리스너 정리 등의 작업을 수행합니다.
   */
  disconnectedCallback() {
    // 구독 해제
    this._unsubscribers.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    // 자식 클래스의 cleanup 메소드 호출
    this.cleanup();
    
    // 성능 로그 출력 (개발 모드만)
    if (this._renderCount > 0) {
      const avgRenderTime = this._totalRenderTime / this._renderCount;
      console.debug(`${this._componentName} 성능:`, {
        총_렌더링_횟수: this._renderCount,
        평균_렌더링_시간: `${avgRenderTime.toFixed(2)}ms`,
        총_렌더링_시간: `${this._totalRenderTime.toFixed(2)}ms`
      });
    }
  }
  
  /**
   * 지연 렌더링 수행
   * @private
   */
  _deferredRender() {
    if (!this._renderPending) {
      this._renderPending = true;
      
      // 다음 프레임에서 렌더링
      requestAnimationFrame(() => {
        this._renderPending = false;
        this._optimizedRender();
      });
    }
  }
  
  /**
   * 실제 렌더링 수행 (내부용)
   * @private
   */
  _render() {
    // 렌더링 통계 측정 시작
    const startTime = performance.now();
    
    try {
      // this.render()가 있는지 확인
      if (typeof this.render !== 'function') {
        console.warn(`${this.constructor.name}: render 메소드가 구현되지 않았습니다.`);
        return;
      }
      
      // 현재 innerHTML 저장 (변경 감지용)
      const oldInnerHTML = this.shadowRoot ? this.shadowRoot.innerHTML : '';
      
      // 사용자 정의 렌더 함수 호출하여 렌더링할 HTML 가져오기
      const html = this.render();

      // 렌더 결과가 문자열인 경우에만 DOM 업데이트
      if (typeof html === 'string') {
        // 최적화: 내용이 변경된 경우에만 DOM 업데이트
        if (this.options.optimizeUpdates) {
          // 가상 DOM 스타일 차이 감지
          if (this.shadowRoot) {
            console.log(`${this._componentName}: 렌더링 수행 중`);
            
            // 효율적인 업데이트를 위해 HTML 파싱
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 루트 컨테이너 확인
            const newContainer = tempDiv.firstElementChild;
            const currentContainer = this.shadowRoot.firstElementChild;
            
            // 컨테이너가 있고 클래스가 같은 경우 부분 업데이트 수행
            if (currentContainer && newContainer && 
                currentContainer.className === newContainer.className) {
              console.log(`${this._componentName}: 부분 DOM 업데이트 수행`);
              // 기존 컨테이너 요소 내용을 교체 (이벤트 리스너 보존)
              this._updateContainer(currentContainer, newContainer);
            } else {
              // 완전히 다른 경우 전체 교체
              console.log(`${this._componentName}: 전체 DOM 교체`);
              this.shadowRoot.innerHTML = html;
            }
          } else {
            this.innerHTML = html;
          }
        } else {
          // 최적화 없이 항상 전체 DOM 업데이트
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = html;
          } else {
            this.innerHTML = html;
          }
        }
      }
      
      // 렌더링 후 처리 호출
      this._callAfterRender();
      
      // 렌더링 통계 업데이트
      this._renderCount++;
      const renderTime = performance.now() - startTime;
      this._lastRenderTime = renderTime;
      this._totalRenderTime += renderTime;
      
      if (renderTime > 50) {
        console.warn(`${this._componentName}: 느린 렌더링 감지 (${renderTime.toFixed(2)}ms)`);
      }
    } catch (error) {
      console.error(`${this._componentName}: 렌더링 오류`, error);
    }
  }
  
  /**
   * 컨테이너 내용을 효율적으로 업데이트
   * @private
   */
  _updateContainer(currentContainer, newContainer) {
    try {
      // 자식 노드 비교 및 업데이트
      const currentChildren = Array.from(currentContainer.children);
      const newChildren = Array.from(newContainer.children);
      
      // 1. 새로운 자식들에게 없는 기존 자식들 제거
      for (let i = currentChildren.length - 1; i >= 0; i--) {
        const child = currentChildren[i];
        const id = child.id || child.className;
        const exists = newChildren.some(newChild => 
          (newChild.id && newChild.id === child.id) || 
          (newChild.className && newChild.className === child.className)
        );
        if (!exists) {
          child.remove();
        }
      }
      
      // 2. 새로운 자식들 추가 또는 업데이트
      for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        const id = newChild.id || newChild.className;
        
        // 기존에 있는지 확인
        const existingChild = currentContainer.querySelector(`#${newChild.id}`) || 
                             Array.from(currentContainer.children)
                               .find(c => c.className && c.className === newChild.className);
        
        if (existingChild) {
          // 내용이 다른 경우 업데이트
          if (existingChild.innerHTML !== newChild.innerHTML) {
            existingChild.innerHTML = newChild.innerHTML;
          }
        } else {
          // 없으면 새로 추가
          currentContainer.appendChild(newChild.cloneNode(true));
        }
      }
      
      return true;
    } catch (error) {
      console.error(`${this._componentName}: 컨테이너 업데이트 오류`, error);
      // 오류 발생 시 전체 내용 교체
      currentContainer.innerHTML = newContainer.innerHTML;
      return false;
    }
  }
  
  /**
   * 렌더링 이후 콜백 호출
   * 두 가지 방식 모두 지원: this._afterRender 함수와 this.afterRender 메소드
   * @private
   */
  _callAfterRender() {
    // 1. 이전 방식: _afterRender 함수가 있는 경우 호출
    if (typeof this._afterRender === 'function') {
      try {
        this._afterRender();
      } catch (error) {
        console.error(`${this.constructor.name} _afterRender 콜백 실행 중 오류:`, error);
      }
    }
    
    // 2. 새 방식: afterRender 메소드가 있는 경우 호출
    if (typeof this.afterRender === 'function') {
      try {
        this.afterRender();
      } catch (error) {
        console.error(`${this.constructor.name} afterRender 메소드 실행 중 오류:`, error);
      }
    }
  }
  
  /**
   * 객체 얕은 비교
   * @param {Object} objA - 첫 번째 객체
   * @param {Object} objB - 두 번째 객체
   * @returns {boolean} 동등성 여부
   * @private
   */
  _shallowEqual(objA, objB) {
    if (objA === objB) return true;
    if (!objA || !objB) return false;
    
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (objA[key] !== objB[key]) return false;
    }
    
    return true;
  }
  
  /**
   * 스타일을 로드합니다.
   * @protected
   */
  loadStyles() {
    if (!this.options.useShadow) return;
    
    try {
      // 외부 스타일시트 로드
      if (this.options.styleSheet) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', this.options.styleSheet);
        this.shadowRoot.appendChild(link);
      }
      
      // 인라인 스타일 적용 (CSS-in-JS)
      if (this.options.styles || this.options.useCommonStyles || this.options.useUtilityStyles) {
        const style = document.createElement('style');
        style.textContent = createStyles({
          name: this._componentName,
          styles: this.options.styles,
          useCommon: this.options.useCommonStyles,
          useUtility: this.options.useUtilityStyles,
          useAnimation: this.options.useAnimationStyles
        });
        
        // shadowRoot가 존재하면 스타일 추가
        if (this.shadowRoot) {
          this.shadowRoot.appendChild(style);
        } else {
          // 아니면 document.head에 추가
          const styleId = `style-${this._componentName}-${Date.now()}`;
          style.id = styleId;
          document.head.appendChild(style);
          this.addUnsubscriber(() => {
            const styleElement = document.getElementById(styleId);
            if (styleElement) {
              styleElement.remove();
            }
          });
        }
      }
    } catch (error) {
      console.error(`스타일 로딩 오류 (${this._componentName}):`, error);
    }
  }
  
  /**
   * 컴포넌트를 초기화합니다.
   * 자식 클래스에서 오버라이드해야 합니다.
   * @protected
   */
  initialize() {
    // 자식 클래스에서 구현
  }
  
  /**
   * 컴포넌트 내용을 렌더링합니다.
   * 자식 클래스에서 오버라이드해야 합니다.
   * @protected
   */
  render() {
    // 자식 클래스에서 구현
  }
  
  /**
   * 상태 업데이트 및 재렌더링
   * @param {Object|Function} updater - 상태 업데이트 객체 또는 함수
   */
  updateState(updater) {
    // 이전 상태 저장
    const prevState = { ...this.state };
    
    // 업데이터가 함수인 경우, 함수를 실행하여 새 상태 가져오기
    if (typeof updater === 'function') {
      const newState = updater(prevState);
      this.state = { ...this.state, ...newState };
    } else if (typeof updater === 'object') {
      // 업데이터가 객체인 경우, 직접 상태 병합
      this.state = { ...this.state, ...updater };
    } else {
      console.error('updateState에는 객체 또는 함수가 필요합니다.');
      return;
    }
    
    // 바뀐 상태가 있는지 확인
    const stateChanged = !this._shallowEqual(prevState, this.state);
    
    // 상태가 변경된 경우에만 렌더링
    if (stateChanged) {
      // 상태 변경 이벤트 발생
      const stateChangeEvent = new CustomEvent('state-change', {
        detail: { 
          previousState: prevState,
          currentState: this.state,
          changedKeys: Object.keys(this.state).filter(key => prevState[key] !== this.state[key])
        },
        bubbles: false
      });
      this.dispatchEvent(stateChangeEvent);
      
      // 상태 변경에 따른 렌더링 요청
      // requestAnimationFrame을 사용하여 여러 상태 변경을 일괄 처리
      if (!this._scheduledRender) {
        this._scheduledRender = true;
        requestAnimationFrame(() => {
          this._render();
          this._scheduledRender = false;
        });
      }
    }
    
    return stateChanged;
  }
  
  /**
   * 디바운스된 업데이트 함수
   * 짧은 시간 내에 여러 업데이트가 발생할 때 유용합니다.
   * @param {Function|Object} updater - 업데이트 함수 또는 객체
   * @param {number} delay - 지연 시간(ms)
   * @protected
   */
  debouncedUpdate(updater, delay = 100) {
    if (!this._debouncedUpdateFn) {
      this._debouncedUpdateFn = debounce(this.updateState.bind(this), delay);
    }
    
    this._debouncedUpdateFn(updater);
  }
  
  /**
   * 컴포넌트가 제거될 때 정리 작업을 수행합니다.
   * 필요한 경우 자식 클래스에서 오버라이드합니다.
   * @protected
   */
  cleanup() {
    // 자식 클래스에서 구현
  }
  
  /**
   * 스토어 구독을 추가합니다.
   * @param {Function} unsubscriber - 구독 해제 함수
   * @protected
   */
  addUnsubscriber(unsubscriber) {
    if (typeof unsubscriber === 'function') {
      this._unsubscribers.push(unsubscriber);
    }
  }
  
  /**
   * 간단한 이벤트 리스너를 등록합니다.
   * @param {HTMLElement} element - 이벤트를 등록할 요소
   * @param {string} eventName - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @param {Object} options - 이벤트 옵션
   * @protected
   */
  addEventListenerWithCleanup(element, eventName, handler, options = {}) {
    element.addEventListener(eventName, handler, options);
    this.addUnsubscriber(() => {
      element.removeEventListener(eventName, handler, options);
    });
  }
  
  /**
   * 성능 통계를 반환합니다.
   * @returns {Object} 성능 통계 정보
   */
  getPerformanceStats() {
    return {
      componentName: this._componentName,
      renderCount: this._renderCount,
      lastRenderTime: this._lastRenderTime,
      totalRenderTime: this._totalRenderTime,
      averageRenderTime: this._renderCount > 0 ? this._totalRenderTime / this._renderCount : 0
    };
  }
  
  /**
   * 속성 변경을 감지하는 메소드입니다.
   * @param {string} name - 속성 이름
   * @param {string} oldValue - 이전 값
   * @param {string} newValue - 새 값
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    // 자식 클래스에서 정의한 attributeChanged 메소드 호출
    if (typeof this.attributeChanged === 'function') {
      this.attributeChanged(name, oldValue, newValue);
    }
    
    // 이미 초기화된 경우 변경된 속성에 따라 다시 렌더링
    if (this._initialized) {
      this._optimizedRender();
    }
  }
} 