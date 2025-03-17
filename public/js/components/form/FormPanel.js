/**
 * @file FormPanel.js
 * @description 모든 폼 컴포넌트를 통합하는 패널 컴포넌트
 */

/**
 * 폼 요소들을 한 패널에 통합하는 컴포넌트
 */
export class FormPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // 스타일시트 로드
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', './css/styles.css');
    this.shadowRoot.appendChild(styleSheet);
    
    // 렌더링
    this.render();
  }

  render() {
    // FormPanel은 단순히 다른 컴포넌트들을 포함하는 컨테이너 역할
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: var(--color-dark-2);
          padding: var(--section-padding);
          border-left: var(--border-dark);
          height: 100vh;
          overflow-y: auto;
          min-width: 0;
          box-sizing: border-box;
        }
        
        .form-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
      </style>
      
      <div class="form-panel">
        <team-config></team-config>
        <total-members-config></total-members-config>
        <member-input></member-input>
      </div>
    `;
  }
} 