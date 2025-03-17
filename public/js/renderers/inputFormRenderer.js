import utils from '../utils/index.js';

/**
 * @function renderInputForm
 * @description 입력 폼의 innerHTML 템플릿을 반환합니다.
 * @param {Object} state 스토어 상태
 * @returns {string} HTML
 */
export const renderInputForm = (state = {}) => {
  return `
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

    <div class="card">
      <div class="card__content">
        <h3 class="card__title">멤버 추가</h3>
        <div class="input-wrapper">
          <input type="text" class="input member-input" placeholder="멤버 이름을 입력하세요"
            ${!utils.canAddMore(state) ? "disabled" : ""} />
        </div>
        <button class="btn add-member" ${!utils.canAddMore(state) ? "disabled" : ""}>
          추가
        </button>
      </div>
    </div>
  `;
}; 