/**
 * @file BaseComponent.js
 * @description 모든 웹 컴포넌트의 기본 클래스
 * 공통 기능을 제공하고 생명주기 메소드를 표준화합니다.
 */

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
   * @param {string} options.styleSheet - 스타일시트 경로 (기본값: './css/styles.css')
   */
  constructor(options = {}) {
    super();
    
    // 기본 옵션 설정
    this.options = {
      useShadow: true,
      styleSheet: './css/styles.css',
      ...options
    };
    
    // Shadow DOM 설정
    if (this.options.useShadow) {
      this.attachShadow({ mode: 'open' });
    }
    
    // 내부 상태 초기화
    this._initialized = false;
    this._container = null;
    this._unsubscribers = [];
  }
  
  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   * 이 메소드는 자식 클래스에서 오버라이드하지 않는 것이 좋습니다.
   * 대신 initialize() 메소드를 구현하세요.
   */
  connectedCallback() {
    if (!this._initialized) {
      console.time(`${this.constructor.name}-init`);
      
      // 스타일시트 로드
      this.loadStyles();
      
      // 컴포넌트 초기화
      this.initialize();
      
      // 렌더링
      this.render();
      
      this._initialized = true;
      console.timeEnd(`${this.constructor.name}-init`);
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
  }
  
  /**
   * 스타일시트를 로드합니다.
   * @protected
   */
  loadStyles() {
    if (!this.options.useShadow || !this.options.styleSheet) return;
    
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', this.options.styleSheet);
    this.shadowRoot.appendChild(styleSheet);
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
} 