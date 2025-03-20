/**
 * @file TeamResult.js
 * @description 팀 배분 결과를 표시하는 컴포넌트
 */

import store from '../../store/index.js';
import { distributeTeams } from '../../handlers/teamConfigHandlers.js';
import { BaseComponent } from '../BaseComponent.js';
import { saveTeamData } from '../../utils/api.js';
import { showUIError } from '../../handlers/uiHandlers.js';
import { debounce } from '../../utils/performance.js';

/**
 * 팀 배분 결과 컴포넌트
 */
export class TeamResult extends BaseComponent {
  constructor() {
    super();
    
    // Shadow DOM이 이미 존재하는지 확인
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    this._isFirstRender = true;
    this._state = {
      teamCount: 0,
      totalMembers: 0,
      members: [],
      teams: [],
      isTeamCountConfirmed: false,
      isTotalConfirmed: false,
      isDistributed: false
    };

    // 디바운스된 업데이트 함수 생성
    this.debouncedUpdateView = debounce(this.updateView.bind(this), 100);

    // 스토어 구독 설정
    this.unsubscribe = store.subscribe((state) => {
      const prevState = {...this._state};
      this.updateFromStore(state);
      
      // 실질적인 변경이 있는 경우에만 뷰 업데이트
      if (this.hasSignificantChanges(prevState, this._state)) {
        this.debouncedUpdateView();
      }
    });
  }

  /**
   * 두 상태 간에 중요한 변경이 있는지 확인
   */
  hasSignificantChanges(prevState, currentState) {
    // 중요 속성의 변경 확인
    return (
      prevState.teamCount !== currentState.teamCount ||
      prevState.isTeamCountConfirmed !== currentState.isTeamCountConfirmed ||
      prevState.isTotalConfirmed !== currentState.isTotalConfirmed ||
      prevState.isDistributed !== currentState.isDistributed ||
      JSON.stringify(prevState.teams) !== JSON.stringify(currentState.teams) ||
      prevState.members.length !== currentState.members.length
    );
  }

  connectedCallback() {
    this.initializeComponent();
    // 초기 상태로 UI 업데이트
    this.updateFromStore(store.getState());
    this.updateView();
  }
  
  disconnectedCallback() {
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
        
        .team-result-container {
          padding: 0;
          margin-bottom: 16px;
        }
        
        .card {
          background-color: #121212;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .card.animate {
          animation: fadeIn 0.3s ease;
        }
        
        .card.inactive {
          opacity: 0.5;
          pointer-events: none;
        }
        
        .card__content {
          padding: 16px;
        }
        
        .card__title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .team-info {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: normal;
        }
        
        .status-message {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          padding: 16px 0;
          margin-bottom: 16px;
        }
        
        .status-message.success {
          color: #10b981;
        }
        
        .team-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 24px;
          margin-top: 16px;
        }
        
        .placeholder-item {
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          text-align: center;
        }
        
        .team-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .team-item {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .team-item__title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .team-size {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: normal;
        }
        
        .team-item__members {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .team-item__member {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          padding: 6px 8px;
          background-color: rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .team-item__member:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
        
        .button-group {
          display: flex;
          gap: 8px;
          margin-top: 16px;
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
          width: 100%;
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
        
        .mt-4 {
          margin-top: 16px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <div class="team-result-container"></div>
    `;
    
    this.addEventListeners();
  }

  addEventListeners() {
    // 이벤트 리스너 최적화: 이벤트 위임 사용
    this.shadowRoot.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.classList.contains('shuffle-teams')) {
        this.shuffleTeams();
      } else if (target.classList.contains('decide-teams')) {
        this.decideTeams();
      } else if (target.classList.contains('save-teams')) {
        this.handleSaveTeams();
      }
    });
  }
  
  updateFromStore(state) {
    // 얕은 복사로 성능 최적화
    this._state.totalMembers = state.totalMembers;
    this._state.isTotalConfirmed = state.isTotalConfirmed;
    this._state.teamCount = state.teamCount;
    this._state.isTeamCountConfirmed = state.isTeamCountConfirmed;
    this._state.teams = state.teams || [];
    this._state.isDistributed = state.isDistributed;
    this._state.members = state.members || [];
  }

  shuffleTeams() {
    if (!this._state.members.length) {
      return;
    }
    
    try {
      const distributedTeams = distributeTeams();
      
      if (distributedTeams && distributedTeams.length > 0) {
        // store 상태 업데이트
        store.dispatch({
          type: 'SET_TEAMS',
          payload: {
            teams: distributedTeams,
            isDistributed: true
          }
        });
      } else {
        // 대체 로직 - 멤버를 랜덤하게 팀에 분배
        const shuffled = [...this._state.members].sort(() => Math.random() - 0.5);
        const teamSize = Math.ceil(shuffled.length / this._state.teamCount);
        const teams = Array.from({ length: this._state.teamCount }, (_, i) => 
          shuffled.slice(i * teamSize, (i + 1) * teamSize)
        );

        store.dispatch({
          type: 'SET_TEAMS',
          payload: {
            teams,
            isDistributed: true
          }
        });
      }
    } catch (error) {
      console.error('팀 섞기 중 오류 발생:', error);
    }
  }

  decideTeams() {
    if (!this._state.members.length) {
      return;
    }
    
    if (this._state.members.length !== this._state.totalMembers) {
      return;
    }
    
    this.shuffleTeams();
  }

  updateView() {
    // 메모화와 가상 DOM 비교로 최적화
    const container = this.shadowRoot.querySelector('.team-result-container');
    if (!container) return;
    
    // 기존 상태 스냅샷 저장
    const oldHTML = container.innerHTML;
    
    // 팀 배분 결과가 없는 경우
    if (!this._state.teams.length) {
      let message = "팀 구성 결과가 여기에 표시됩니다.";
      let statusClass = "info";
      let showDecideButton = false;
      let buttonDisabled = true;
      
      // 더 구체적인 안내 메시지 생성
      if (!this._state.isTotalConfirmed) {
        message = "총원을 설정해주세요.";
      } else if (!this._state.isTeamCountConfirmed) {
        message = "팀 개수를 설정해주세요.";
      } else if (this._state.members.length < this._state.totalMembers) {
        message = `아직 ${this._state.totalMembers - this._state.members.length}명의 멤버가 더 필요합니다.`;
      } else if (this._state.members.length === this._state.totalMembers) {
        message = "작성 완료! 모든 멤버가 등록되었습니다.";
        statusClass = "success";
        showDecideButton = true;
        buttonDisabled = false; // 버튼 활성화
      }
      
      // 카드 활성화 상태는 팀 구성이 가능한지 여부에 따라 결정
      const isTeamReady = this._state.isTotalConfirmed && 
                          this._state.isTeamCountConfirmed && 
                          this._state.members.length === this._state.totalMembers;
                          
      const cardClass = isTeamReady ? 
        `card ${this._isFirstRender ? 'animate' : ''}` : 
        `card ${this._isFirstRender ? 'animate' : ''} inactive`;
      
      const newHTML = `
        <div class="${cardClass}">
          <div class="card__content">
            <h3 class="card__title">팀 구성 결과</h3>
            <div class="status-message ${statusClass}">
              ${message}
            </div>
            ${showDecideButton ? 
              `<div class="button-group mt-4">
                <button class="btn btn--primary decide-teams">팀 결정하기!</button>
              </div>` : ''}
            <div class="team-placeholder">
              <div class="placeholder-item">팀이 구성되면 여기에 표시됩니다.</div>
            </div>
          </div>
        </div>
      `;
      
      // 내용이 변경된 경우에만 DOM 업데이트
      if (oldHTML !== newHTML) {
        container.innerHTML = newHTML;
      }
      
      return;
    }
    
    // 팀별 인원 수 계산
    const teamSizes = this._state.teams.map(team => team.length);
    const totalMembers = teamSizes.reduce((sum, size) => sum + size, 0);
    
    // 팀 구성 결과 표시
    const teamsHtml = this._state.teams.map((team, index) => `
      <div class="team-item">
        <h3 class="team-item__title">Team ${index + 1} <span class="team-size">(${team.length}명)</span></h3>
        <div class="team-item__members">
          ${team.map(member => `
            <span class="team-item__member">${member}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    const newHTML = `
      <div class="card ${this._isFirstRender ? 'animate' : ''}">
        <div class="card__content">
          <h3 class="card__title">팀 구성 결과 <span class="team-info">(${this._state.teamCount}팀, 총 ${totalMembers}명)</span></h3>
          <div class="team-list">
            ${teamsHtml}
          </div>
          <div class="button-group mt-4">
            <button class="btn btn--secondary shuffle-teams">팀 재구성</button>
            <button class="btn save-teams">저장하기</button>
          </div>
        </div>
      </div>
    `;
    
    // 내용이 변경된 경우에만 DOM 업데이트
    if (oldHTML !== newHTML) {
      container.innerHTML = newHTML;
    }
    
    this._isFirstRender = false;
  }

  // 팀 데이터 저장 처리
  async handleSaveTeams() {
    try {
      const result = await saveTeamData({ teams: this._state.teams });
      if (result.success) {
        alert('팀 구성 정보가 성공적으로 저장되었습니다.');
      } else {
        showUIError('팀 구성 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('팀 저장 중 오류 발생:', error);
      showUIError('팀 구성 정보 저장 중 오류가 발생했습니다.');
    }
  }
}

customElements.define('team-result', TeamResult); 