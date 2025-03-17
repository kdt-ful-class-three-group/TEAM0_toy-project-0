/**
 * @file TeamConfig.js
 * @description 팀 개수 설정을 담당하는 컴포넌트
 */

import store from '../../store/index.js';
import { showInvalidInput, updateStatusMessage, toggleVisibility } from '../../handlers/uiHandlers.js';
import { handleTeamCountInput, confirmTeamCount, editTeamCount } from '../../handlers/teamConfigHandlers.js';

/**
 * 팀 구성 설정 컴포넌트
 */
export class TeamConfig extends HTMLElement {
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
    container.className = 'team-config-container';
    container.innerHTML = `
      <div class="card">
        <div class="card__content">
          <h3 class="card__title">팀 구성</h3>
          <div class="input-wrapper">
            <input type="number" class="input team-count-input" min="1" placeholder="팀 개수"
              value="${state.teamCount || ''}" ${state.isTeamCountConfirmed ? "disabled" : ""} />
          </div>
          <div class="button-group">
            <button class="btn confirm-team-count" ${state.isTeamCountConfirmed ? "style='display: none;'" : ""}>완료</button>
            <button class="btn btn--secondary edit-team-count" ${!state.isTeamCountConfirmed ? "style='display: none;'" : ""}>수정</button>
          </div>
          <div class="status-message team-status-message"></div>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(container);
    this.updateStatusMessage(state);
  }

  updateFromState(state) {
    const root = this.shadowRoot;
    
    // 팀 카운트 관련 업데이트
    const teamCountInput = root.querySelector('.team-count-input');
    if (teamCountInput) {
      teamCountInput.value = state.teamCount || '';
      teamCountInput.disabled = state.isTeamCountConfirmed;
    }
    
    const confirmTeamBtn = root.querySelector('.confirm-team-count');
    const editTeamBtn = root.querySelector('.edit-team-count');
    if (confirmTeamBtn && editTeamBtn) {
      toggleVisibility(confirmTeamBtn, !state.isTeamCountConfirmed);
      toggleVisibility(editTeamBtn, state.isTeamCountConfirmed);
    }
    
    this.updateStatusMessage(state);
  }

  updateStatusMessage(state) {
    const teamStatusMessage = this.shadowRoot.querySelector(".team-status-message");
    
    if (teamStatusMessage) {
      if (!state.isTeamCountConfirmed) {
        updateStatusMessage(
          teamStatusMessage, 
          "팀 개수를 입력하고 완료 버튼을 클릭하거나 엔터를 눌러주세요.", 
          "info"
        );
      } else {
        updateStatusMessage(
          teamStatusMessage, 
          `${state.teamCount}개의 팀으로 구성됩니다.`, 
          "success"
        );
      }
    }
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    
    // 팀 구성 관련 요소
    const teamCountInput = shadow.querySelector(".team-count-input");
    const confirmTeamCountBtn = shadow.querySelector(".confirm-team-count");
    const editTeamCountBtn = shadow.querySelector(".edit-team-count");

    // 팀 구성 이벤트
    if (teamCountInput) {
      // 한글 조합 상태 추적을 위한 변수
      let isComposing = false;

      // 한글 조합 시작/종료 감지
      teamCountInput.addEventListener("compositionstart", () => {
        isComposing = true;
      });
      
      teamCountInput.addEventListener("compositionend", () => {
        isComposing = false;
      });

      teamCountInput.addEventListener("input", (e) => handleTeamCountInput(e, showInvalidInput));
      teamCountInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !isComposing) {
          // 약간의 지연을 두어 IME 처리 시간 제공
          setTimeout(() => {
            confirmTeamCount(showInvalidInput, teamCountInput);
          }, 10);
        }
      });
    }

    if (confirmTeamCountBtn) {
      confirmTeamCountBtn.addEventListener("click", () => {
        confirmTeamCount(showInvalidInput, teamCountInput);
      });
    }

    if (editTeamCountBtn) {
      editTeamCountBtn.addEventListener("click", editTeamCount);
    }
  }
} 