import { renderNavigator } from '../renderers/index.js';

/**
 * 네비게이터 컴포넌트
 * 왼쪽 네비게이션 영역을 표시합니다.
 * @class NavComponent
 * @extends HTMLElement
 */
export class NavComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._container = null;
    this._initialized = false;
  }

  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   */
  connectedCallback() {
    if (!this._initialized) {
      console.time('nav-init');
      this.initialize();
      this._initialized = true;
      console.timeEnd('nav-init');
    }
  }
  
  /**
   * 컴포넌트가 DOM에서 제거될 때 호출됩니다.
   */
  disconnectedCallback() {
    // 이벤트 리스너 제거가 필요한 경우 여기에 추가
  }
  
  /**
   * 컴포넌트를 초기화합니다.
   * @private
   */
  initialize() {
    // 스타일시트 로드
    this.loadStyles();
    
    // 컨텐츠 컨테이너 생성
    this._container = document.createElement('div');
    this._container.className = 'nav-container';
    
    // 그림자 DOM에 추가
    this.shadowRoot.appendChild(this._container);
    
    // 내용 렌더링
    window.requestAnimationFrame(() => {
      this.render();
    });
  }
  
  /**
   * 스타일을 로드합니다.
   * @private
   */
  loadStyles() {
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', './css/styles.css');
    this.shadowRoot.appendChild(styleSheet);
  }
  
  /**
   * 컴포넌트 콘텐츠를 렌더링합니다.
   * @private
   */
  render() {
    this._container.innerHTML = `
      <div class="nav">
        <div class="nav__section nav__section--bottom">
          <div class="nav__version">
            <small>버전 1.0.1</small>
          </div>
        </div>
      </div>
    `;
  }
} 