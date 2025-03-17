/**
 * @file TeamResult.js
 * @description 팀 배분 결과를 표시하는 컴포넌트
 */

import store from '../../store/index.js';
import { distributeTeams } from '../../handlers/teamConfigHandlers.js';

/**
 * 팀 배분 결과 컴포넌트
 */
export class TeamResult extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
    this.initialized = false;
    this.eventsRegistered = false;
    this.teams = [];
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
      // 조건이 충족되었을 때만 팀 배분
      if (this.shouldDistributeTeams(state)) {
        this.teams = distributeTeams() || [];
        this.updateView();
      }
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

  shouldDistributeTeams(state) {
    return state.isTeamCountConfirmed && 
           state.teamCount > 0 && 
           state.isTotalConfirmed && 
           state.members.length === state.totalMembers &&
           state.members.length > 0;
  }

  render() {
    const state = store.getState();
    
    const container = document.createElement('div');
    container.className = 'team-result-container';
    
    // 초기에는 빈 컨테이너만 추가
    this.shadowRoot.appendChild(container);
    
    // 초기 상태에서 조건이 충족되면 팀 배분
    if (this.shouldDistributeTeams(state)) {
      this.teams = distributeTeams() || [];
      this.updateView();
    }
  }

  updateView() {
    const container = this.shadowRoot.querySelector('.team-result-container');
    if (!container) return;
    
    if (!this.teams.length) {
      container.innerHTML = `
        <div class="card">
          <div class="card__content">
            <h3 class="card__title">팀 구성 결과</h3>
            <div class="status-message">
              팀 구성에 필요한 정보를 모두 입력해주세요.
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    const teamsHtml = this.teams.map((team, index) => `
      <div class="team-item">
        <h3 class="team-item__title">Team ${index + 1}</h3>
        <div class="team-item__members">
          ${team.map(member => `
            <span class="team-item__member">${member}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="card">
        <div class="card__content">
          <h3 class="card__title">팀 구성 결과</h3>
          <div class="team-list">
            ${teamsHtml}
          </div>
          <div class="button-group mt-4">
            <button class="btn btn--secondary shuffle-teams">팀 재구성</button>
          </div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    
    // 이벤트 위임을 사용하여 동적으로 생성되는 버튼에 이벤트 등록
    shadow.addEventListener('click', (e) => {
      if (e.target.classList.contains('shuffle-teams')) {
        this.handleShuffleTeams();
      }
    });
  }

  handleShuffleTeams() {
    // 팀 재구성
    this.teams = distributeTeams() || [];
    this.updateView();
  }
} 