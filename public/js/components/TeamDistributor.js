import store from '../store/index.js';

/**
 * 메인 컴포넌트
 * 애플리케이션의 루트 컴포넌트입니다.
 */
export class TeamDistributor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
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
        main {
          padding: var(--section-padding);
          color: var(--color-light);
          overflow-y: auto;
          height: 100vh;
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
          display: none; /* hidden 클래스 대신 display: none으로 기본 상태 설정 */
        }
        .completion-message.show {
          display: block; /* show 클래스가 있을 때만 표시 */
        }
      </style>
      <nav-component></nav-component>
      <main>
        <member-list></member-list>
        <div class="completion-message">
          작성 완료! 모든 멤버가 등록되었습니다.
        </div>
      </main>
      <input-form></input-form>
    `;
    console.timeEnd("TeamDistributor Render");

    // 완료 메시지 표시 조건 수정
    const updateCompletionMessage = (state) => {
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
    };

    // 상태 변경 구독 설정
    const unsubscribe = store.subscribe((state) => {
      updateCompletionMessage(state);
    });
    
    // 초기 상태 확인
    updateCompletionMessage(store.getState());
  }
} 