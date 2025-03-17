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
      // 팀 배분 조건 확인
      if (this.shouldDistributeTeams(state)) {
        this.teams = distributeTeams() || [];
      } else {
        this.teams = [];
      }
      // 항상 뷰를 업데이트
      this.updateView();
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
    }
    
    // 항상 뷰 업데이트 실행
    this.updateView();
  }

  updateView() {
    const container = this.shadowRoot.querySelector('.team-result-container');
    if (!container) return;
    
    const state = store.getState();
    
    // 팀 배분 결과가 없는 경우 안내 메시지 표시
    if (!this.teams.length) {
      let message = "팀 구성 결과가 여기에 표시됩니다.";
      let statusClass = "info";
      
      // 더 구체적인 안내 메시지 생성
      if (!state.isTeamCountConfirmed) {
        message = "팀 개수를 설정해주세요.";
      } else if (!state.isTotalConfirmed) {
        message = "총원을 설정해주세요.";
      } else if (state.members.length < state.totalMembers) {
        message = `아직 ${state.totalMembers - state.members.length}명의 멤버가 더 필요합니다.`;
      }
      
      container.innerHTML = `
        <div class="card">
          <div class="card__content">
            <h3 class="card__title">팀 구성 결과</h3>
            <div class="status-message ${statusClass}">
              ${message}
            </div>
            <div class="team-placeholder">
              <div class="placeholder-item">팀이 구성되면 여기에 표시됩니다.</div>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    // 팀별 인원 수 계산
    const teamSizes = this.teams.map(team => team.length);
    const totalMembers = teamSizes.reduce((sum, size) => sum + size, 0);
    
    // 팀 구성 결과 표시
    const teamsHtml = this.teams.map((team, index) => `
      <div class="team-item">
        <h3 class="team-item__title">Team ${index + 1} <span class="team-size">(${team.length}명)</span></h3>
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
          <h3 class="card__title">팀 구성 결과 <span class="team-info">(${state.teamCount}팀, 총 ${totalMembers}명)</span></h3>
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