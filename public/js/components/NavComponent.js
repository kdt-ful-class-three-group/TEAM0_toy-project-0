import { renderNavigator } from '../renderers/index.js';

/**
 * 네비게이터 컴포넌트
 * 왼쪽 영역의 네비게이션 메뉴를 표시합니다.
 */
export class NavComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = renderNavigator();
  }
} 