import store, { actionCreators } from '../../store/index.js';
import { ACTION_TYPES } from '../../store/actions.js';

class TeamInput extends HTMLElement {
  constructor() {
    super();
    
    // Shadow DOM 중복 생성 방지
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    this._state = {
      teamCount: 0,
      totalMembers: 0,
      isTeamCountConfirmed: false,
      isTotalConfirmed: false,
      members: []
    };

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
        :host {
          display: block;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .team-input-container {
          padding: 0;
          margin-bottom: 16px;
        }
        
        .card {
          background-color: #121212;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
          will-change: opacity, transform;
        }
        
        .card__content {
          padding: 16px;
        }
        
        .card__title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
        }
        
        .input-wrapper {
          margin-bottom: 12px;
        }
        
        .input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          background-color: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          font-size: 14px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .input:focus {
          outline: none;
          border-color: #4a6e5a;
          box-shadow: 0 0 0 2px rgba(74, 110, 90, 0.25);
        }
        
        .input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-group {
          display: flex;
          gap: 8px;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 16px;
          background-color: #4a6e5a;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }
        
        .btn:hover {
          background-color: #3c5c4a;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.4);
        }
        
        .btn--secondary {
          background-color: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn--secondary:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .status-message {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          padding: 8px 0;
          margin-top: 8px;
          min-height: 20px;
        }
        
        .error {
          color: #ef4444;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
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

    // 팀 개수 입력 엔터키 이벤트
    teamCountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmTeamCount.click();
      }
    });

    // 총원 입력 엔터키 이벤트
    totalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmTotal.click();
      }
    });

    // 팀 개수 확인 버튼
    confirmTeamCount.addEventListener('click', () => {
      const teamCount = parseInt(teamCountInput.value);
      if (!this.validateTeamCount(teamCount)) {
        return;
      }

      teamCountInput.disabled = true;
      confirmTeamCount.style.display = 'none';
      editTeamCount.style.display = 'block';

      store.dispatch(actionCreators.setTeamCount(teamCount, true));
    });

    // 총원 확인 버튼
    confirmTotal.addEventListener('click', () => {
      const totalMembers = parseInt(totalInput.value);
      if (!this.validateTotalMembers(totalMembers)) {
        return;
      }

      totalInput.disabled = true;
      confirmTotal.style.display = 'none';
      editTotal.style.display = 'block';

      store.dispatch(actionCreators.setTotalMembers(totalMembers, true));
    });

    // 팀 개수 수정 버튼
    editTeamCount.addEventListener('click', () => {
      teamCountInput.disabled = false;
      confirmTeamCount.style.display = 'block';
      editTeamCount.style.display = 'none';
      teamCountInput.focus();
      
      store.dispatch(actionCreators.setTeamCount(this._state.teamCount, false));
    });

    // 총원 수정 버튼
    editTotal.addEventListener('click', () => {
      totalInput.disabled = false;
      confirmTotal.style.display = 'block';
      editTotal.style.display = 'none';
      totalInput.focus();
      
      store.dispatch(actionCreators.setTotalMembers(this._state.totalMembers, false));
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
    if (!messageElement) return;
    
    messageElement.textContent = text;
    messageElement.classList.add('error');
  }

  clearError(messageClass) {
    const messageElement = this.shadowRoot.querySelector(`.${messageClass}`);
    if (!messageElement) return;
    
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

    if (!teamCountInput || !totalInput) return;

    // 팀 개수 입력 상태 업데이트
    teamCountInput.value = this._state.teamCount || '';
    teamCountInput.disabled = this._state.isTeamCountConfirmed;
    confirmTeamCount.style.display = this._state.isTeamCountConfirmed ? 'none' : 'block';
    editTeamCount.style.display = this._state.isTeamCountConfirmed ? 'block' : 'none';

    // 총원 입력 상태 업데이트
    totalInput.value = this._state.totalMembers || '';
    totalInput.disabled = this._state.isTotalConfirmed;
    confirmTotal.style.display = this._state.isTotalConfirmed ? 'none' : 'block';
    editTotal.style.display = this._state.isTotalConfirmed ? 'block' : 'none';
  }
}

customElements.define('team-input', TeamInput); 