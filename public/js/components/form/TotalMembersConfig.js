/**
 * @file TotalMembersConfig.js
 * @description 총원 설정을 담당하는 컴포넌트
 */

import store from '../../store/index.js';
import { showInvalidInput, updateStatusMessage, toggleVisibility } from '../../handlers/uiHandlers.js';
import { handleTotalInput, confirmTotalMembers, editTotalMembers } from '../../handlers/memberHandlers.js';
import { showUIError } from '../../handlers/uiHandlers.js';
import { setTotalMembers, confirmTotalMembers as confirmTotalMembersAction } from '../../store/actions.js';

/**
 * 총원 설정 컴포넌트
 */
export class TotalMembersConfig extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
    this.initialized = false;
    this.eventsRegistered = false;
    this._isFirstRender = true;
  }

  connectedCallback() {
    if (!this.initialized) {
      // 초기 렌더링
      this.render();
      this.initialized = true;
      
      // DOM 렌더링 후 이벤트 리스너 등록
      requestAnimationFrame(() => {
        this.addEventListeners();
        this.eventsRegistered = true;
      });
    }
    
    // 상태 구독 설정
    this.unsubscribe = store.subscribe((state) => {
      this.updateFromState(state);
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const state = store.getState();
    
    const styles = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .total-members-container {
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
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
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
          margin-bottom: 12px;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 16px;
          background-color: #4f46e5;
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
          background-color: #4338ca;
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
          padding: 4px 0;
        }

        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;
    
    // 컨테이너 생성 또는 참조
    let container = this.shadowRoot.querySelector('.total-members-container');
    
    if (!container) {
      // 처음 렌더링할 때만 새로 생성
      this.shadowRoot.innerHTML = styles;
      container = document.createElement('div');
      container.className = 'total-members-container';
      this.shadowRoot.appendChild(container);
    }
    
    // 카드 내용 생성
    container.innerHTML = `
      <div class="card ${this._isFirstRender ? 'animate' : ''}">
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
    `;
    
    this._isFirstRender = false;
    this.updateStatusMessage(state);
    
    // 렌더링 후 이벤트 리스너 다시 등록
    if (this.eventsRegistered) {
      this.addEventListeners();
    }
  }

  updateFromState(state) {
    const root = this.shadowRoot;
    if (!root) return;
    
    // 총원 설정 관련 업데이트
    const totalInput = root.querySelector('.number-input');
    if (totalInput && document.activeElement !== totalInput) {
      totalInput.value = state.totalMembers || '';
      totalInput.disabled = state.isTotalConfirmed;
    }
    
    const confirmTotalBtn = root.querySelector('.confirm-total');
    const editTotalBtn = root.querySelector('.edit-total');
    if (confirmTotalBtn && editTotalBtn) {
      toggleVisibility(confirmTotalBtn, !state.isTotalConfirmed);
      toggleVisibility(editTotalBtn, state.isTotalConfirmed);
    }
    
    this.updateStatusMessage(state);
  }

  updateStatusMessage(state) {
    const totalStatusMessage = this.shadowRoot.querySelector(".total-status-message");
    
    if (totalStatusMessage) {
      if (!state.isTotalConfirmed) {
        updateStatusMessage(
          totalStatusMessage, 
          "총원을 입력하고 완료 버튼을 클릭하거나 엔터를 눌러주세요.", 
          "info"
        );
        return;
      }

      if (state.totalMembers === 0) {
        updateStatusMessage(
          totalStatusMessage, 
          "총원을 입력해주세요.", 
          "info"
        );
        return;
      }

      const remaining = state.totalMembers - state.members.length;
      if (remaining > 0) {
        updateStatusMessage(
          totalStatusMessage, 
          `${state.totalMembers}명 중 ${state.members.length}명 작성됨 (${remaining}명 남음)`, 
          "info"
        );
      } else if (remaining === 0) {
        updateStatusMessage(
          totalStatusMessage, 
          `${state.totalMembers}명 모두 작성 완료!`, 
          "success"
        );
      } else {
        updateStatusMessage(
          totalStatusMessage, 
          `설정된 총원(${state.totalMembers}명)을 초과했습니다!`, 
          "error"
        );
      }
    }
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    
    // 기존 이벤트 핸들러 제거
    const oldConfirmBtn = shadow.querySelector('.confirm-total');
    const oldEditBtn = shadow.querySelector('.edit-total');
    const oldInput = shadow.querySelector('.number-input');
    
    if (oldConfirmBtn) {
      const newConfirmBtn = oldConfirmBtn.cloneNode(true);
      oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);
      
      // 새 버튼에 이벤트 핸들러 직접 등록
      newConfirmBtn.addEventListener('click', () => {
        const input = shadow.querySelector('.number-input');
        if (input) {
          try {
            console.log('총원 설정 완료 버튼 클릭');
            // 먼저 유효성을 확인
            const value = parseInt(input.value);
            
            if (isNaN(value) || value < 1) {
              showUIError(input, '유효한 총원 수를 입력하세요.');
              this.shakeElement(input);
              return;
            }
            
            // 유효성 검사를 통과했으면 액션 디스패치
            store.dispatch(setTotalMembers(value));
            store.dispatch(confirmTotalMembersAction());
            
            // UI 업데이트
            input.disabled = true;
            this.updateFromState(store.getState());
          } catch (err) {
            console.error('총원 설정 완료 처리 중 오류:', err);
          }
        }
      });
    }
    
    if (oldEditBtn) {
      const newEditBtn = oldEditBtn.cloneNode(true);
      oldEditBtn.parentNode.replaceChild(newEditBtn, oldEditBtn);
      
      // 새 버튼에 이벤트 핸들러 직접 등록
      newEditBtn.addEventListener('click', () => {
        try {
          console.log('총원 설정 수정 버튼 클릭');
          editTotalMembers();
          this.updateFromState(store.getState());
        } catch (err) {
          console.error('총원 설정 수정 처리 중 오류:', err);
        }
      });
    }
    
    if (oldInput) {
      const newInput = oldInput.cloneNode(true);
      oldInput.parentNode.replaceChild(newInput, oldInput);
      
      // 이벤트 핸들러 직접 등록
      newInput.addEventListener('input', (e) => {
        try {
          handleTotalInput(e, showInvalidInput || ((el, msg) => console.error(msg)));
        } catch (err) {
          console.error('총원 설정 입력 처리 중 오류:', err);
        }
      });
      
      newInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setTimeout(() => {
            try {
              console.log('총원 설정 엔터키 완료');
              const value = parseInt(newInput.value);
              
              if (isNaN(value) || value < 1) {
                showUIError(newInput, '유효한 총원 수를 입력하세요.');
                this.shakeElement(newInput);
                return;
              }
              
              store.dispatch(setTotalMembers(value));
              store.dispatch(confirmTotalMembersAction());
              
              newInput.disabled = true;
              this.updateFromState(store.getState());
            } catch (err) {
              console.error('총원 설정 엔터키 완료 처리 중 오류:', err);
            }
          }, 10);
        }
      });
    }
  }
  
  shakeElement(element) {
    if (!element) return;
    
    element.classList.remove('shake');
    void element.offsetWidth; // 리플로우 트리거
    element.classList.add('shake');
  }
} 