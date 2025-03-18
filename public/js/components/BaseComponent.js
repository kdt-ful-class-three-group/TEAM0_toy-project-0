/**
 * @file BaseComponent.js
 * @description 모든 웹 컴포넌트의 기본 클래스
 * 공통 기능을 제공하고 생명주기 메소드를 표준화합니다.
 */
import { createStyles } from '../utils/styleManager.js';

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
    
    // 컴포넌트 이름 추출
    this._componentName = this.constructor.name;
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
      
      // 렌더링
      this.render();
      
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
      this.render();
    }
  }
} 