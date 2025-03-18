/**
 * @file StoreDemo.js
 * @description 스토어 connect API 사용법을 보여주는 데모 컴포넌트
 */

import { BaseComponent } from '../BaseComponent.js';
import { connect } from '../../store/connect.js';
import { actionCreators } from '../../store/index.js';

/**
 * 스토어 데모 컴포넌트
 * 상태관리 시스템의 기능을 시연합니다.
 */
class StoreDemo extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      styles: `
        :host {
          display: block;
          padding: 1rem;
          background-color: var(--color-dark-3, #2d2d2d);
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .demo-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .demo-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary, #ffffff);
        }
        
        .demo-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat-item {
          background-color: var(--color-dark-2, #1e1e1e);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          color: var(--color-text-primary, #ffffff);
        }
        
        .demo-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        button {
          background-color: var(--color-primary, #4f46e5);
          color: white;
          border: none;
          border-radius: 0.25rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #4338ca;
        }
        
        button:disabled {
          background-color: #6b7280;
          cursor: not-allowed;
        }
        
        .demo-history {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #b3b3b3);
        }
      `
    });
  }
  
  initialize() {
    // DOM 요소 생성
    this._container = document.createElement('div');
    this._container.className = 'demo-container';
    this.shadowRoot.appendChild(this._container);
  }
  
  render() {
    // props에서 상태 및 액션 가져오기
    const { 
      members = [], 
      totalMembers, 
      teamCount,
      isTotalConfirmed,
      isTeamCountConfirmed,
      addMember,
      setTotalMembers,
      setTeamCount,
      confirmTotalMembers,
      confirmTeamCount,
      resetState
    } = this.props || {};
    
    this._container.innerHTML = `
      <div class="demo-title">상태관리 데모</div>
      
      <div class="demo-stats">
        <div class="stat-item">
          <strong>총원:</strong> ${totalMembers} ${isTotalConfirmed ? '(확정)' : ''}
        </div>
        <div class="stat-item">
          <strong>팀 수:</strong> ${teamCount} ${isTeamCountConfirmed ? '(확정)' : ''}
        </div>
        <div class="stat-item">
          <strong>멤버 수:</strong> ${members.length}
        </div>
      </div>
      
      <div class="demo-actions">
        <button id="addMember">멤버 추가</button>
        <button id="setTotal">총원 설정 (10명)</button>
        <button id="confirmTotal" ${isTotalConfirmed ? 'disabled' : ''}>총원 확정</button>
        <button id="setTeam">팀 수 설정 (3팀)</button>
        <button id="confirmTeam" ${isTeamCountConfirmed ? 'disabled' : ''}>팀 수 확정</button>
        <button id="reset">초기화</button>
      </div>
      
      <div class="demo-history">
        <p>이 데모 컴포넌트는 connect API를 사용하여 스토어와 연결됩니다.</p>
        <p>상태 변경 시 자동으로 리렌더링되며, 미들웨어를 통해 상태 변경 이력 추적 및 디버깅이 가능합니다.</p>
      </div>
    `;
    
    // 이벤트 리스너 추가
    this._setupEventListeners();
  }
  
  _setupEventListeners() {
    // 기존 이벤트 리스너 제거
    this._removeEventListeners();
    
    // 버튼 요소 가져오기
    const addMemberBtn = this.shadowRoot.getElementById('addMember');
    const setTotalBtn = this.shadowRoot.getElementById('setTotal');
    const confirmTotalBtn = this.shadowRoot.getElementById('confirmTotal');
    const setTeamBtn = this.shadowRoot.getElementById('setTeam');
    const confirmTeamBtn = this.shadowRoot.getElementById('confirmTeam');
    const resetBtn = this.shadowRoot.getElementById('reset');
    
    // 이벤트 핸들러 등록
    if (addMemberBtn) {
      this._addMemberListener = () => this.props.addMember(`멤버 ${Date.now() % 1000}`);
      addMemberBtn.addEventListener('click', this._addMemberListener);
    }
    
    if (setTotalBtn) {
      this._setTotalListener = () => this.props.setTotalMembers(10);
      setTotalBtn.addEventListener('click', this._setTotalListener);
    }
    
    if (confirmTotalBtn) {
      this._confirmTotalListener = () => this.props.confirmTotalMembers();
      confirmTotalBtn.addEventListener('click', this._confirmTotalListener);
    }
    
    if (setTeamBtn) {
      this._setTeamListener = () => this.props.setTeamCount(3);
      setTeamBtn.addEventListener('click', this._setTeamListener);
    }
    
    if (confirmTeamBtn) {
      this._confirmTeamListener = () => this.props.confirmTeamCount();
      confirmTeamBtn.addEventListener('click', this._confirmTeamListener);
    }
    
    if (resetBtn) {
      this._resetListener = () => this.props.resetState();
      resetBtn.addEventListener('click', this._resetListener);
    }
  }
  
  _removeEventListeners() {
    // 이전 이벤트 리스너 제거
    const addMemberBtn = this.shadowRoot.getElementById('addMember');
    if (addMemberBtn && this._addMemberListener) {
      addMemberBtn.removeEventListener('click', this._addMemberListener);
    }
    
    const setTotalBtn = this.shadowRoot.getElementById('setTotal');
    if (setTotalBtn && this._setTotalListener) {
      setTotalBtn.removeEventListener('click', this._setTotalListener);
    }
    
    const confirmTotalBtn = this.shadowRoot.getElementById('confirmTotal');
    if (confirmTotalBtn && this._confirmTotalListener) {
      confirmTotalBtn.removeEventListener('click', this._confirmTotalListener);
    }
    
    const setTeamBtn = this.shadowRoot.getElementById('setTeam');
    if (setTeamBtn && this._setTeamListener) {
      setTeamBtn.removeEventListener('click', this._setTeamListener);
    }
    
    const confirmTeamBtn = this.shadowRoot.getElementById('confirmTeam');
    if (confirmTeamBtn && this._confirmTeamListener) {
      confirmTeamBtn.removeEventListener('click', this._confirmTeamListener);
    }
    
    const resetBtn = this.shadowRoot.getElementById('reset');
    if (resetBtn && this._resetListener) {
      resetBtn.removeEventListener('click', this._resetListener);
    }
  }
  
  cleanup() {
    this._removeEventListeners();
  }
}

// 상태와 액션을 컴포넌트 props에 매핑
const mapStateToProps = state => ({
  members: state.members,
  totalMembers: state.totalMembers,
  teamCount: state.teamCount,
  isTotalConfirmed: state.isTotalConfirmed,
  isTeamCountConfirmed: state.isTeamCountConfirmed
});

// 액션 생성자를 컴포넌트 props에 매핑
const mapDispatchToProps = {
  addMember: actionCreators.addMember,
  setTotalMembers: actionCreators.setTotalMembers,
  confirmTotalMembers: actionCreators.confirmTotalMembers,
  setTeamCount: actionCreators.setTeamCount,
  confirmTeamCount: actionCreators.confirmTeamCount,
  resetState: actionCreators.resetState
};

// 스토어에 연결된 컴포넌트 내보내기
export default connect({
  mapStateToProps,
  mapDispatchToProps
})(StoreDemo); 