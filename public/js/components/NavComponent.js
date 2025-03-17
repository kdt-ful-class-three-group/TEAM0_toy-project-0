import { renderNavigator } from '../renderers/index.js';
import { themeManager } from '../utils/themeManager.js';
import { debounce } from '../utils/performance.js';

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
    
    // 이벤트 핸들러 바인딩
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
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
    this.removeEventListeners();
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
    
    // 내용 렌더링 (성능 최적화를 위해 requestAnimationFrame 사용)
    window.requestAnimationFrame(() => {
      this.render();
      this.addEventListeners();
      
      // 테마 관리자 초기화
      themeManager.initialize();
      
      // 테마 변경 시 UI 업데이트 (디바운스 적용)
      document.addEventListener('themechange', debounce(() => {
        this.updateThemeButton();
      }, 100));
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
    this._container.innerHTML = renderNavigator();
  }
  
  /**
   * 이벤트 리스너를 등록합니다.
   * @private
   */
  addEventListeners() {
    const themeButton = this.shadowRoot.querySelector('.theme-toggle');
    if (themeButton) {
      themeButton.addEventListener('click', this.handleThemeToggle);
    }
  }
  
  /**
   * 등록된 이벤트 리스너를 제거합니다.
   * @private
   */
  removeEventListeners() {
    const themeButton = this.shadowRoot.querySelector('.theme-toggle');
    if (themeButton) {
      themeButton.removeEventListener('click', this.handleThemeToggle);
    }
  }
  
  /**
   * 테마 토글 버튼 클릭 이벤트 핸들러
   * @private
   */
  handleThemeToggle() {
    themeManager.toggleTheme();
    this.updateThemeButton();
  }
  
  /**
   * 테마 버튼 UI를 현재 테마에 맞게 업데이트합니다.
   * @private
   */
  updateThemeButton() {
    const themeButton = this.shadowRoot.querySelector('.theme-toggle');
    if (!themeButton) return;
    
    const isDarkTheme = document.documentElement.classList.contains('theme-dark');
    
    // 아이콘 및 텍스트 업데이트
    themeButton.innerHTML = isDarkTheme
      ? '<span>☀️ 라이트 모드</span>'
      : '<span>🌙 다크 모드</span>';
      
    // 접근성을 위한 설명 업데이트
    themeButton.setAttribute('aria-label', isDarkTheme ? '라이트 모드로 전환' : '다크 모드로 전환');
  }
} 