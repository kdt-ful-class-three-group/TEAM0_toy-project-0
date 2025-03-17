/**
 * @file MainPanel.js
 * @description 메인 패널 영역을 담당하는 컴포넌트
 */

import store from '../../store/index.js';

/**
 * 메인 패널 컴포넌트
 * 멤버 목록과 팀 결과를 표시하는 중앙 영역
 */
export class MainPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  connectedCallback() {
    // 스타일시트 로드
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', './css/styles.css');
    this.shadowRoot.appendChild(styleSheet);
    
    // 렌더링
    this.render();
    
    // 상태 변경 구독
    this.unsubscribe = store.subscribe((state) => {
      this.updateCompletionMessage(state);
    });
  }
  
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: var(--section-padding);
          color: var(--color-light);
          overflow-y: auto;
          height: 100vh;
        }
        
        .main-panel {
          display: grid;
          grid-template-columns: 1fr 1fr; /* 좌우 균등 분할 */
          gap: var(--space-5);
          height: calc(100vh - var(--section-padding) * 2);
        }
        
        .left-panel, .right-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow-y: auto;
        }
        
        .completion-message {
          background-color: var(--color-primary);
          color: var(--color-white);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 500;
          margin-top: var(--space-3);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: none;
          grid-column: span 2; /* 메시지는 전체 너비 사용 */
        }
        
        .completion-message.show {
          display: block;
        }
      </style>
      
      <div class="main-panel">
        <div class="left-panel">
          <team-result></team-result>
        </div>
        <div class="right-panel">
          <member-list></member-list>
        </div>
        <div class="completion-message">
          작성 완료! 모든 멤버가 등록되었습니다.
        </div>
      </div>
    `;
    
    // 초기 상태로 메시지 업데이트
    this.updateCompletionMessage(store.getState());
  }
  
  updateCompletionMessage(state) {
    const msgEl = this.shadowRoot.querySelector(".completion-message");
    if (!msgEl) return;
    
    const isComplete = 
      state.isTotalConfirmed && 
      state.totalMembers > 0 && 
      state.members.length === state.totalMembers;
    
    if (isComplete) {
      msgEl.classList.add("show");
    } else {
      msgEl.classList.remove("show");
    }
  }
} 