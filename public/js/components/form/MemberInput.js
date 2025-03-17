/**
 * @file MemberInput.js
 * @description 멤버 추가를 담당하는 컴포넌트
 */

import store from '../../store/index.js';
import utils from '../../utils/index.js';
import { showInvalidInput, updateStatusMessage } from '../../handlers/uiHandlers.js';
import { addMember } from '../../handlers/memberHandlers.js';

/**
 * 멤버 입력 컴포넌트
 */
export class MemberInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
    this.initialized = false;
    this.eventsRegistered = false;
  }

  connectedCallback() {
    if (!this.initialized) {
      // 스타일시트 로드
      const styleSheet = document.createElement('link');
      styleSheet.setAttribute('rel', 'stylesheet');
      styleSheet.setAttribute('href', './css/styles.css');
      this.shadowRoot.appendChild(styleSheet);
      
      // 초기 렌더링
      this.render();
      this.initialized = true;
    }
    
    // 상태 구독 설정
    this.unsubscribe = store.subscribe((state) => {
      this.updateFromState(state);
    });
    
    // 이벤트 리스너 등록 (한 번만)
    if (!this.eventsRegistered) {
      this.addEventListeners();
      this.eventsRegistered = true;
    }
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const state = store.getState();
    const canAdd = utils.canAddMore(state);
    
    const container = document.createElement('div');
    container.className = 'member-input-container';
    container.innerHTML = `
      <div class="card">
        <div class="card__content">
          <h3 class="card__title">멤버 추가</h3>
          <div class="input-wrapper">
            <input type="text" class="input member-input" placeholder="멤버 이름을 입력하세요"
              ${!canAdd ? "disabled" : ""} />
          </div>
          <button class="btn add-member" ${!canAdd ? "disabled" : ""}>
            추가
          </button>
          <div class="status-message member-status-message">
            ${this.getStatusMessage(state)}
          </div>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(container);
  }

  updateFromState(state) {
    const root = this.shadowRoot;
    const canAdd = utils.canAddMore(state);
    
    // 멤버 입력 관련 업데이트
    const memberInput = root.querySelector('.member-input');
    const addMemberBtn = root.querySelector('.add-member');
    
    if (memberInput && addMemberBtn) {
      memberInput.disabled = !canAdd;
      addMemberBtn.disabled = !canAdd;
    }
    
    // 상태 메시지 업데이트
    const statusMessage = root.querySelector('.member-status-message');
    if (statusMessage) {
      statusMessage.textContent = this.getStatusMessage(state);
    }
  }

  getStatusMessage(state) {
    if (!state.isTotalConfirmed) {
      return "총원을 먼저 설정해주세요.";
    }
    
    const remaining = state.totalMembers - state.members.length;
    if (remaining <= 0) {
      return "모든 멤버가 등록되었습니다.";
    }
    
    return `${remaining}명의 멤버를 더 등록해주세요.`;
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    
    // 멤버 추가 관련 요소
    const memberInput = shadow.querySelector(".member-input");
    const addMemberBtn = shadow.querySelector(".add-member");

    // 멤버 추가 이벤트
    if (memberInput) {
      // 한글 조합 상태 추적을 위한 변수
      let isComposing = false;

      // 한글 조합 시작 감지
      memberInput.addEventListener("compositionstart", () => {
        isComposing = true;
      });

      // 한글 조합 종료 감지
      memberInput.addEventListener("compositionend", () => {
        isComposing = false;
      });

      // 키 입력 이벤트
      memberInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !isComposing) {
          e.preventDefault();
          // 약간의 지연을 두어 IME 처리 시간 제공
          setTimeout(() => {
            addMember(memberInput, showInvalidInput);
          }, 10);
        }
      });
    }

    if (addMemberBtn) {
      addMemberBtn.addEventListener("click", () => {
        const input = shadow.querySelector(".member-input");
        if (input) {
          addMember(input, showInvalidInput);
        }
      });
    }
  }
} 