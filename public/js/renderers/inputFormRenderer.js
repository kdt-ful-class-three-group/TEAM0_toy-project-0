import utils from '../utils/index.js';

/**
 * @function renderInputForm
 * @description 입력 폼(오른쪽 영역)의 innerHTML 템플릿을 반환합니다.
 * @param {Object} state
 * @returns {string} HTML
 */
export const renderInputForm = (state) => {
  return `
    <style>
      :host {
        display: block;
        background-color: var(--color-dark-2);
        padding: var(--section-padding);
        border-left: var(--border-dark);
        height: 100vh;
        overflow-y: auto;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
      .input-card {
        background-color: var(--color-dark-3);
        border-radius: var(--radius-md);
        padding: var(--space-5);
        margin-bottom: var(--space-4);
        box-shadow: var(--card-shadow);
        box-sizing: border-box;
        width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }
      .input-card h3 {
        color: var(--color-white);
        font-size: var(--text-lg);
        white-space: nowrap;
        margin: 0;
      }
      .input-wrapper {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .input {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        height: 2.5rem;
        background-color: var(--color-dark-4);
        color: var(--color-white);
        border: 1px solid var(--color-dark-4);
        border-radius: var(--radius-sm);
        padding: 0 var(--space-3);
        font-size: var(--text-base);
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .input:focus {
        outline: none;
        border-color: var(--color-primary);
        background-color: var(--color-dark-3);
      }
      .input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .button-group {
        display: flex;
        gap: var(--space-2);
        width: 100%;
      }
      .button-group .btn {
        flex: 1;
        min-width: 60px;
        height: 2.5rem;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
        font-size: var(--text-base);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn {
        background-color: var(--color-primary);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-sm);
        padding: 0 var(--space-4);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        height: 2.5rem;
        font-size: var(--text-base);
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }
      .btn:hover:not(:disabled) {
        background-color: var(--color-primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-secondary {
        background-color: var(--color-dark-4);
      }
      .btn-secondary:hover:not(:disabled) {
        background-color: var(--color-dark-3);
      }
      .status-message {
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-sm);
        background-color: var(--color-dark-2);
        color: var(--color-light);
        font-size: var(--text-sm);
        line-height: 1.5;
        border: var(--border-dark);
        word-break: keep-all;
        overflow-wrap: break-word;
        margin-top: var(--space-3);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      .hidden {
        display: none;
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      .shake {
        animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      .invalid {
        background-color: var(--color-error);
        border-color: var(--color-error-border);
      }
    </style>

    <div class="input-card">
      <h3>팀 구성</h3>
      <div class="input-wrapper">
        <input type="number" class="team-count-input input" min="1" placeholder="팀 개수"
          value="${state.teamCount}" ${state.isTeamCountConfirmed ? "disabled" : ""} />
      </div>
      <div class="button-group">
        <button class="btn btn-primary confirm-team-count" ${state.isTeamCountConfirmed ? "style='display: none;'" : ""}>완료</button>
        <button class="btn btn-secondary edit-team-count" ${!state.isTeamCountConfirmed ? "style='display: none;'" : ""}>수정</button>
      </div>
      <div class="team-status-message status-message"></div>
    </div>

    <div class="input-card">
      <h3>총원 설정</h3>
      <div class="input-wrapper">
        <input type="number" class="number-input input" min="1" placeholder="총 인원"
          value="${state.totalMembers}" ${state.isTotalConfirmed ? "disabled" : ""} />
      </div>
      <div class="button-group">
        <button class="btn btn-primary confirm-total" ${state.isTotalConfirmed ? "style='display: none;'" : ""}>완료</button>
        <button class="btn btn-secondary edit-total" ${!state.isTotalConfirmed ? "style='display: none;'" : ""}>수정</button>
      </div>
      <div class="total-status-message status-message"></div>
    </div>

    <div class="input-card">
      <h3>멤버 추가</h3>
      <div class="input-wrapper">
        <input type="text" class="member-input input" placeholder="멤버 이름을 입력하세요"
          ${!utils.canAddMore(state) ? "disabled" : ""} />
      </div>
      <button class="btn btn-secondary add-member" ${!utils.canAddMore(state) ? "disabled" : ""}>
        추가
      </button>
    </div>
  `;
}; 