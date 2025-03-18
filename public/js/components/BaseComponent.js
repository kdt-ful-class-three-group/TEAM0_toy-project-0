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
    // 성능 최적화: 속성 변경이 없는 경우 리렌더링 건너뛰기
    if (this.options.optimizeUpdates && this._prevProps && this.props) {
      if (this._shallowEqual(this._prevProps, this.props)) {
        return; // 속성이 변경되지 않은 경우 렌더링 스킵
      }
    }
    
    // 성능 측정 시작
    const startTime = performance.now();
    
    try {
      // 사용자 정의 렌더 함수 호출
      this.render();
      
      // 현재 props 저장 (최적화용)
      if (this.props) {
        this._prevProps = { ...this.props };
      }
    } catch (error) {
      console.error(`${this._componentName} 렌더링 중 오류:`, error);
    }
    
    // 성능 측정 종료
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // 성능 통계 업데이트
    this._renderCount++;
    this._lastRenderTime = renderTime;
    this._totalRenderTime += renderTime;
    
    // 렌더링 시간이 너무 긴 경우 경고
    if (renderTime > 16.67) { // 60fps = 16.67ms/프레임
      console.warn(`${this._componentName} 렌더링 지연 감지: ${renderTime.toFixed(2)}ms`);
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
   * 비동기적으로 상태를 업데이트하고 렌더링합니다.
   * 여러 업데이트를 배치 처리합니다.
   * @param {Function|Object} updater - 업데이트 함수 또는 객체
   * @protected
   */
  updateState(updater) {
    // 업데이트 함수가 없으면 무시
    if (!updater) return;
    
    // 업데이트가 이미 큐에 있으면 중복 실행 방지
    if (this._updateQueued) return;
    this._updateQueued = true;
    
    // 배치 업데이트 큐에 등록
    batchUpdater.enqueue(() => {
      // 상태 업데이트
      if (typeof updater === 'function') {
        this.state = updater(this.state || {});
      } else {
        this.state = { ...(this.state || {}), ...updater };
      }
      
      // 플래그 초기화
      this._updateQueued = false;
      
      // 렌더링
      this._optimizedRender();
    });
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