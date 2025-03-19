import store, { actionCreators } from '../../store/index.js';
import { ACTION_TYPES } from '../../store/actions.js';

class TeamInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = {
      teamCount: 0,
      totalMembers: 0,
      isTeamCountConfirmed: false,
      isTotalConfirmed: false,
      members: []
    };

    // 상태 변경 감지를 위한 프록시 설정
    this._state = new Proxy(this._state, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;
        if (oldValue !== value) {
          this.updateView();
        }
        return true;
      }
    });

    this.initializeComponent();
    
    // 스토어 구독
    this.unsubscribe = store.subscribe((state) => {
      this._state.teamCount = state.teamCount;
      this._state.totalMembers = state.totalMembers;
      this._state.isTeamCountConfirmed = state.isTeamCountConfirmed;
      this._state.isTotalConfirmed = state.isTotalConfirmed;
      this._state.members = state.members;
      this.updateView();
    });
    
    // 초기 상태 설정
    const initialState = store.getState();
    this._state.teamCount = initialState.teamCount;
    this._state.totalMembers = initialState.totalMembers;
    this._state.isTeamCountConfirmed = initialState.isTeamCountConfirmed;
    this._state.isTotalConfirmed = initialState.isTotalConfirmed;
    this._state.members = initialState.members;
  }
  
  connectedCallback() {
    this.updateView();
  }
  
  disconnectedCallback() {
    // 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  initializeComponent() {
    this.shadowRoot.innerHTML = `
      <style>
        /* ... existing styles ... */
      </style>
      <div class="team-input-container">
        <div class="card">
          <div class="card__content">
            <h3 class="card__title">팀 구성</h3>
            <div class="input-wrapper">
              <input type="number" class="input team-count-input" min="1" placeholder="팀 개수" />
            </div>
            <div class="button-group">
              <button class="btn confirm-team-count">완료</button>
              <button class="btn btn--secondary edit-team-count" style="display: none;">수정</button>
            </div>
            <div class="status-message team-status-message"></div>
          </div>
        </div>

        <div class="card">
          <div class="card__content">
            <h3 class="card__title">총원 설정</h3>
            <div class="input-wrapper">
              <input type="number" class="input total-members-input" min="1" placeholder="총 인원" />
            </div>
            <div class="button-group">
              <button class="btn confirm-total">완료</button>
              <button class="btn btn--secondary edit-total" style="display: none;">수정</button>
            </div>
            <div class="status-message total-status-message"></div>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    const teamCountInput = shadow.querySelector('.team-count-input');
    const totalInput = shadow.querySelector('.total-members-input');
    const confirmTeamCount = shadow.querySelector('.confirm-team-count');
    const confirmTotal = shadow.querySelector('.confirm-total');
    const editTeamCount = shadow.querySelector('.edit-team-count');
    const editTotal = shadow.querySelector('.edit-total');

    confirmTeamCount.addEventListener('click', () => {
      const teamCount = parseInt(teamCountInput.value);
      if (isNaN(teamCount) || teamCount < 1) {
        this.showError('team-status-message', '유효한 팀 개수를 입력해주세요.');
        return;
      }

      teamCountInput.disabled = true;
      confirmTeamCount.style.display = 'none';
      editTeamCount.style.display = 'block';

      store.dispatch({
        type: ACTION_TYPES.SET_TEAM_COUNT,
        payload: {
          count: teamCount,
          isConfirmed: true
        }
      });
    });

    confirmTotal.addEventListener('click', () => {
      const totalMembers = parseInt(totalInput.value);
      if (isNaN(totalMembers) || totalMembers < 1) {
        this.showError('total-status-message', '유효한 인원 수를 입력해주세요.');
        return;
      }

      totalInput.disabled = true;
      confirmTotal.style.display = 'none';
      editTotal.style.display = 'block';

      store.dispatch({
        type: ACTION_TYPES.SET_TOTAL_MEMBERS,
        payload: {
          count: totalMembers,
          isConfirmed: true
        }
      });
    });

    editTeamCount.addEventListener('click', () => {
      teamCountInput.disabled = false;
      confirmTeamCount.style.display = 'block';
      editTeamCount.style.display = 'none';

      store.dispatch({
        type: ACTION_TYPES.SET_TEAM_COUNT,
        payload: {
          count: parseInt(teamCountInput.value),
          isConfirmed: false
        }
      });
    });

    editTotal.addEventListener('click', () => {
      totalInput.disabled = false;
      confirmTotal.style.display = 'block';
      editTotal.style.display = 'none';

      store.dispatch({
        type: ACTION_TYPES.SET_TOTAL_MEMBERS,
        payload: {
          count: parseInt(totalInput.value),
          isConfirmed: false
        }
      });
    });
  }

  validateTeamCount(value) {
    if (!Number.isInteger(value) || value < 1) {
      this.showError('team-status-message', '유효한 팀 개수를 입력해주세요.');
      return false;
    }
    if (this._state.isTotalConfirmed && value > this._state.totalMembers) {
      this.showError('team-status-message', '팀 수가 총원보다 많을 수 없습니다.');
      return false;
    }
    this.clearError('team-status-message');
    return true;
  }

  validateTotalMembers(value) {
    if (!Number.isInteger(value) || value < 1) {
      this.showError('total-status-message', '유효한 인원 수를 입력해주세요.');
      return false;
    }
    if (this._state.isTeamCountConfirmed && value < this._state.teamCount) {
      this.showError('total-status-message', '총원이 팀 수보다 적을 수 없습니다.');
      return false;
    }
    this.clearError('total-status-message');
    return true;
  }

  showError(messageClass, text) {
    const messageElement = this.shadowRoot.querySelector(`.${messageClass}`);
    messageElement.textContent = text;
    messageElement.classList.add('error');
  }

  clearError(messageClass) {
    const messageElement = this.shadowRoot.querySelector(`.${messageClass}`);
    messageElement.textContent = '';
    messageElement.classList.remove('error');
  }

  updateView() {
    const teamCountInput = this.shadowRoot.querySelector('.team-count-input');
    const totalInput = this.shadowRoot.querySelector('.total-members-input');
    const confirmTeamCount = this.shadowRoot.querySelector('.confirm-team-count');
    const editTeamCount = this.shadowRoot.querySelector('.edit-team-count');
    const confirmTotal = this.shadowRoot.querySelector('.confirm-total');
    const editTotal = this.shadowRoot.querySelector('.edit-total');

    // 팀 개수 입력 상태 업데이트
    teamCountInput.value = this._state.teamCount || '';
    teamCountInput.disabled = this._state.isTeamCountConfirmed;
    confirmTeamCount.style.display = this._state.isTeamCountConfirmed ? 'none' : '';
    editTeamCount.style.display = this._state.isTeamCountConfirmed ? '' : 'none';

    // 총원 입력 상태 업데이트
    totalInput.value = this._state.totalMembers || '';
    totalInput.disabled = this._state.isTotalConfirmed;
    confirmTotal.style.display = this._state.isTotalConfirmed ? 'none' : '';
    editTotal.style.display = this._state.isTotalConfirmed ? '' : 'none';
  }
}

customElements.define('team-input', TeamInput); 