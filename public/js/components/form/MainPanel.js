/**
 * @file MainPanel.js
 * @description 메인 패널 영역을 담당하는 컴포넌트
 */

import { BaseComponent } from '../BaseComponent.js';
import store from '../../store/index.js';

/**
 * 메인 패널 컴포넌트
 * 멤버 목록과 팀 결과를 표시하는 중앙 영역
 * @extends BaseComponent
 */
export class MainPanel extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      useCommonStyles: true,
      useUtilityStyles: true,
      deferRender: false // 초기 렌더링을 지연하지 않음
    });
    this.unsubscribe = null;
    this._componentsInitialized = false;
  }

  initialize() {
    console.log('MainPanel: 초기화 시작');
    
    // Shadow DOM에 초기 컨테이너 추가
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block !important;
          padding: var(--section-padding, 16px);
          color: var(--color-light, #ffffff);
          overflow-y: auto;
          height: 100vh;
          width: 100%;
          box-sizing: border-box;
        }
        
        .main-panel {
          display: grid;
          grid-template-columns: 1fr 1fr; /* 좌우 균등 분할 */
          gap: var(--space-5, 20px);
          height: calc(100vh - var(--section-padding, 16px) * 2);
          width: 100%;
        }
        
        .left-panel, .right-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-4, 16px);
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 16px;
          overflow-y: auto;
          min-height: 300px;
        }
        
        .completion-message {
          background-color: var(--color-primary, #4a6e5a);
          color: var(--color-white, #ffffff);
          padding: var(--space-4, 16px);
          border-radius: var(--radius-md, 6px);
          text-align: center;
          font-weight: 500;
          margin-top: var(--space-3, 12px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: none;
          grid-column: span 2; /* 메시지는 전체 너비 사용 */
        }
        
        .completion-message.show {
          display: block;
        }
      </style>
      
      <div class="main-panel" id="main-panel-container">
        <div class="left-panel" id="left-panel-container">
          <!-- team-result 컴포넌트가 여기에 프로그래매틱하게 추가됩니다 -->
        </div>
        <div class="right-panel" id="right-panel-container">
          <!-- member-list 컴포넌트가 여기에 프로그래매틱하게 추가됩니다 -->
        </div>
        <div class="completion-message">
          작성 완료! 모든 멤버가 등록되었습니다.
        </div>
      </div>
    `;
    
    // 상태 변경 구독
    this.unsubscribe = store.subscribe((state) => {
      this.updateCompletionMessage(state);
    });
    
    // 초기 상태로 메시지 업데이트
    setTimeout(() => {
      this.updateCompletionMessage(store.getState());
    }, 100);
    
    // 이벤트 구독 해제 함수 등록
    this.addUnsubscriber(this.unsubscribe);
    
    // 자식 컴포넌트 생성 확인
    this.ensureChildComponents();
    
    console.log('MainPanel: 초기화 완료');
  }
  
  /**
   * 자식 컴포넌트들이 생성되었는지 확인하고 필요시 생성
   */
  ensureChildComponents() {
    // 중복 호출 방지
    if (this._componentsInitialized) {
      return;
    }
    
    const leftPanel = this.shadowRoot.getElementById('left-panel-container');
    const rightPanel = this.shadowRoot.getElementById('right-panel-container');
    
    if (leftPanel && rightPanel) {
      // team-result 컴포넌트 생성 및 추가
      const teamResult = document.createElement('team-result');
      leftPanel.appendChild(teamResult);
      console.log('MainPanel: team-result 컴포넌트 생성됨');
      
      // member-list 컴포넌트 생성 및 추가
      const memberList = document.createElement('member-list');
      rightPanel.appendChild(memberList);
      console.log('MainPanel: member-list 컴포넌트 생성됨');
      
      this._componentsInitialized = true;
    } else {
      console.warn('MainPanel: 패널 컨테이너를 찾을 수 없습니다');
    }
  }
  
  render() {
    // 이미 초기화 과정에서 내용을 추가했으므로 빈 렌더링 수행
    // 새로운 렌더링 필요 시 여기서 수행
    return this.shadowRoot.innerHTML;
  }
  
  updateCompletionMessage(state) {
    const msgEl = this.shadowRoot.querySelector(".completion-message");
    if (!msgEl) return;
    
    const isComplete = 
      state.isTotalConfirmed && 
      state.totalMembers > 0 && 
      state.members.length === state.totalMembers;
    
    if (isComplete) {
      msgEl.classList.add("show");
    } else {
      msgEl.classList.remove("show");
    }
  }
} 