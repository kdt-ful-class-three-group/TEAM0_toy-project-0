/**
 * @file TotalMembersConfig.js
 * @description 총원 설정을 담당하는 컴포넌트
 */

import store from '../../store/index.js';
import { showInvalidInput, updateStatusMessage, toggleVisibility } from '../../handlers/uiHandlers.js';
import { handleTotalInput, confirmTotalMembers, editTotalMembers } from '../../handlers/memberHandlers.js';

/**
 * 총원 설정 컴포넌트
 */
export class TotalMembersConfig extends HTMLElement {
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
    
    const container = document.createElement('div');
    container.className = 'total-members-container';
    container.innerHTML = `
      <div class="card">
        <div class="card__content">
          <h3 class="card__title">총원 설정</h3>
          <div class="input-wrapper">
            <input type="number" class="input number-input" min="1" placeholder="총 인원"
              value="${state.totalMembers || ''}" ${state.isTotalConfirmed ? "disabled" : ""} />
          </div>
          <div class="button-group">
            <button class="btn confirm-total" ${state.isTotalConfirmed ? "style='display: none;'" : ""}>완료</button>
            <button class="btn btn--secondary edit-total" ${!state.isTotalConfirmed ? "style='display: none;'" : ""}>수정</button>
          </div>
          <div class="status-message total-status-message"></div>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(container);
    this.updateStatusMessage(state);
  }

  updateFromState(state) {
    const root = this.shadowRoot;
    
    // 총원 설정 관련 업데이트
    const totalInput = root.querySelector('.number-input');
    if (totalInput) {
      totalInput.value = state.totalMembers || '';
      totalInput.disabled = state.isTotalConfirmed;
    }
    
    const confirmTotalBtn = root.querySelector('.confirm-total');
    const editTotalBtn = root.querySelector('.edit-total');
    if (confirmTotalBtn && editTotalBtn) {
      toggleVisibility(confirmTotalBtn, !state.isTotalConfirmed);
      toggleVisibility(editTotalBtn, state.isTotalConfirmed);
    }
    
    this.updateStatusMessage(state);
  }

  updateStatusMessage(state) {
    const totalStatusMessage = this.shadowRoot.querySelector(".total-status-message");
    
    if (totalStatusMessage) {
      if (!state.isTotalConfirmed) {
        updateStatusMessage(
          totalStatusMessage, 
          "총원을 입력하고 완료 버튼을 클릭하거나 엔터를 눌러주세요.", 
          "info"
        );
        return;
      }

      if (state.totalMembers === 0) {
        updateStatusMessage(
          totalStatusMessage, 
          "총원을 입력해주세요.", 
          "info"
        );
        return;
      }

      const remaining = state.totalMembers - state.members.length;
      if (remaining > 0) {
        updateStatusMessage(
          totalStatusMessage, 
          `${state.totalMembers}명 중 ${state.members.length}명 작성됨 (${remaining}명 남음)`, 
          "info"
        );
      } else if (remaining === 0) {
        updateStatusMessage(
          totalStatusMessage, 
          `${state.totalMembers}명 모두 작성 완료!`, 
          "success"
        );
      } else {
        updateStatusMessage(
          totalStatusMessage, 
          `설정된 총원(${state.totalMembers}명)을 초과했습니다!`, 
          "error"
        );
      }
    }
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    
    // 총원 설정 관련 요소
    const totalInput = shadow.querySelector(".number-input");
    const confirmTotalBtn = shadow.querySelector(".confirm-total");
    const editTotalBtn = shadow.querySelector(".edit-total");

    // 총원 설정 이벤트
    if (totalInput) {
      // 한글 조합 상태 추적을 위한 변수
      let isComposing = false;

      // 한글 조합 시작/종료 감지
      totalInput.addEventListener("compositionstart", () => {
        isComposing = true;
      });
      
      totalInput.addEventListener("compositionend", () => {
        isComposing = false;
      });
      
      totalInput.addEventListener("input", (e) => handleTotalInput(e, showInvalidInput));
      totalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !isComposing) {
          // 약간의 지연을 두어 IME 처리 시간 제공
          setTimeout(() => {
            confirmTotalMembers(showInvalidInput, totalInput);
          }, 10);
        }
      });
    }

    if (confirmTotalBtn) {
      confirmTotalBtn.addEventListener("click", () => {
        confirmTotalMembers(showInvalidInput, totalInput);
      });
    }

    if (editTotalBtn) {
      editTotalBtn.addEventListener("click", editTotalMembers);
    }
  }
} 