import { renderNavigator } from '../renderers/index.js';

/**
 * 네비게이터 컴포넌트
 * 왼쪽 네비게이션 영역을 표시합니다.
 */
export class NavComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // 스타일시트 로드
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', './css/styles.css');
    
    // 콘텐츠 로드
    const content = document.createElement('div');
    content.className = 'nav-container';
    
    // 그림자 DOM에 추가
    this.shadowRoot.appendChild(styleSheet);
    this.shadowRoot.appendChild(content);
    
    // 내용 렌더링 (비동기적으로 처리하여 초기 DOM 삽입 후 진행)
    setTimeout(() => {
      content.innerHTML = renderNavigator();
    }, 0);
  }
} 