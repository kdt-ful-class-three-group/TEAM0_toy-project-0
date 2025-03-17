import store from '../store/index.js';

/**
 * 메인 컴포넌트
 * 애플리케이션의 루트 컴포넌트입니다.
 */
export class TeamDistributor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  connectedCallback() {
    // 외부 스타일시트를 document.head에 추가
    if (!document.querySelector('link[href="./css/styles.css"]')) {
      const linkElem = document.createElement('link');
      linkElem.setAttribute('rel', 'stylesheet');
      linkElem.setAttribute('href', './css/styles.css');
      document.head.appendChild(linkElem);
    }
    
    // 최초 렌더링
    this.render();
  }
  
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    console.time("TeamDistributor Render");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: var(--nav-width) var(--main-width) var(--sidebar-width);
          gap: 1px;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-dark-1);
          max-width: 100vw;
        }
      </style>
      <nav-component></nav-component>
      <main-panel></main-panel>
      <form-panel></form-panel>
    `;
    console.timeEnd("TeamDistributor Render");
  }
} 