/**
 * @file MemberListView.js
 * @description 멤버 목록 UI를 담당하는 뷰 클래스
 */

import { renderMemberList } from '../../renderers/index.js';
import { memoize } from '../../utils/performance.js';
import renderingMonitor from '../../utils/renderingMonitor.js';

/**
 * 멤버 목록 렌더링을 담당하는 뷰 클래스
 */
export class MemberListView {
  /**
   * 생성자
   * @param {HTMLElement} container - 뷰 컨테이너 요소
   */
  constructor(container) {
    this.container = container;
    this.elements = {};
    this.componentId = `MemberListView-${Date.now()}`;
    
    // 메모이제이션 적용 - 성능 최적화
    this.memoizedRenderMemberList = memoize(renderMemberList, {
      maxSize: 20,
      debug: true
    });
    
    renderingMonitor.startRendering(this.componentId, 'init');
  }
  
  /**
   * 컨테이너에 초기 마크업 렌더링
   */
  render(state) {
    try {
      renderingMonitor.startRendering(this.componentId, 'render');
      console.time('memberlistview-render');
      
      const {
        members = [],
        editingIndex = -1,
        totalMembers = 0,
        isTotalConfirmed = false,
        isTeamCountConfirmed = false
      } = state;
      
      // 상태 저장 - 상태 메시지 업데이트에 사용
      this.container.__state = { ...state };
      
      // 활성화 조건: 총원 설정 및 팀 구성이 모두 완료되었을 때
      const isInputActive = isTotalConfirmed && isTeamCountConfirmed;
      // 총원 초과 조건
      const isMaxReached = totalMembers > 0 && members.length >= totalMembers;
      
      // 멤버 목록 마크업 생성
      let memberListHtml;
      if (!members || members.length === 0) {
        memberListHtml = this._renderEmptyState(isInputActive);
      } else {
        try {
          memberListHtml = this.memoizedRenderMemberList(members, editingIndex);
        } catch (error) {
          console.error('MemberListView: 멤버 렌더링 실패', error);
          memberListHtml = `<div class="error-message">멤버 목록을 표시하는 중 오류가 발생했습니다.</div>`;
          renderingMonitor.renderingError(this.componentId, error, { membersCount: members.length });
        }
      }
      
      const html = `
        <style>
          /* 멤버 목록 컨테이너 스타일 */
          .member-list-container {
            background-color: #121212;
            border-radius: 8px;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          /* 헤더 스타일 */
          .member-list-header {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .member-list-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin: 0;
          }
          
          .member-count {
            background-color: #4f46e5;
            color: white;
            padding: 4px 10px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
          }
          
          /* 콘텐츠 영역 */
          .member-list-content {
            padding: 16px;
            overflow-y: auto;
            flex-grow: 1;
          }
          
          /* 빈 상태 스타일 */
          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: rgba(255, 255, 255, 0.6);
          }
          
          .empty-state__icon {
            font-size: 32px;
            margin-bottom: 16px;
            opacity: 0.6;
          }
          
          .empty-state__title {
            font-size: 16px;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
          }
          
          .empty-state__description {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
          }
          
          /* 멤버 입력 영역 */
          .member-input-container {
            padding: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(0, 0, 0, 0.3);
          }
          
          .member-input-wrapper {
            display: flex;
            gap: 8px;
          }
          
          .member-input {
            flex-grow: 1;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            font-size: 14px;
          }
          
          .member-input:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
          }
          
          .add-member-button {
            padding: 10px 16px;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .add-member-button:hover {
            background-color: #4338ca;
          }
          
          .add-member-button:disabled,
          .member-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          /* 상태 메시지 */
          .member-status-message {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 8px;
            min-height: 18px;
          }
          
          /* 멤버 목록 스타일 */
          .member-list-wrapper {
            border-radius: 8px;
            overflow: hidden;
            background-color: rgba(255, 255, 255, 0.03);
            transition: all 0.2s ease;
          }
          
          .member-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .member-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: background-color 0.2s ease;
          }
          
          .member-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          
          .member-item:last-child {
            border-bottom: none;
          }
          
          .member-item__name {
            font-size: 15px;
            font-weight: 500;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .member-name {
            font-weight: 500;
          }
          
          .member-suffix-numeric {
            color: #4f46e5;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .member-suffix-text {
            color: rgba(255, 255, 255, 0.6);
            font-weight: 400;
            background-color: rgba(255, 255, 255, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
          }
          
          .member-item__actions {
            display: flex;
            gap: 8px;
          }
          
          /* 버튼 스타일 */
          .btn {
            border: none;
            border-radius: 4px;
            font-size: 13px;
            padding: 8px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
          }
          
          .btn--small {
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 4px;
          }
          
          .btn--danger {
            background-color: rgba(239, 68, 68, 0.2);
            color: #fff;
          }
          
          .btn--danger:hover {
            background-color: rgba(239, 68, 68, 0.3);
          }
          
          .btn--secondary {
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
          }
          
          .btn--secondary:hover {
            background-color: rgba(255, 255, 255, 0.15);
          }
          
          /* 편집 모드 */
          .member-item.editing {
            background-color: rgba(79, 70, 229, 0.1);
            padding: 18px 16px;
          }
          
          .edit-container {
            width: 100%;
          }
          
          .suffix-input {
            margin: 0 8px;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            background-color: rgba(255, 255, 255, 0.06);
            color: #ffffff;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          
          .suffix-input:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
          }
          
          .edit-actions {
            display: flex;
            gap: 10px;
            margin-top: 12px;
          }
          
          .confirm-button {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          }
          
          .confirm-button:hover {
            background-color: #4338ca;
          }
          
          .cancel-button {
            background-color: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          }
          
          .cancel-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .suffix-help {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 8px;
          }
          
          /* 애니메이션 */
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
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .member-item {
            animation: fadeIn 0.2s ease;
          }
          
          /* 버튼 스타일 */
          .edit-button {
            color: rgba(255, 255, 255, 0.7);
            background-color: rgba(255, 255, 255, 0.06);
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .edit-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .delete-button {
            color: #fff;
            background-color: rgba(239, 68, 68, 0.2);
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .delete-button:hover {
            background-color: rgba(239, 68, 68, 0.3);
          }
          
          /* 메시지 타입 */
          .info {
            color: #38bdf8;
          }
          
          .error {
            color: #f87171;
          }
          
          .success {
            color: #4ade80;
          }
          
          .warning {
            color: #fbbf24;
          }
          
          /* 오류 메시지 */
          .error-message {
            color: #ff5555;
            padding: 12px;
            background-color: rgba(255, 85, 85, 0.1);
            border-radius: 4px;
            border-left: 3px solid #ff5555;
            margin: 12px 0;
            font-size: 14px;
          }
        </style>
        <div class="member-list-container">
          <div class="member-list-header">
            <h2 class="member-list-title">멤버 목록</h2>
            <span class="member-count">${members.length}${totalMembers > 0 ? `/${totalMembers}` : ''}명</span>
          </div>
          
          <div class="member-list-content">
            ${memberListHtml}
          </div>
          
          <div class="member-input-container">
            <div class="member-input-wrapper">
              <input 
                type="text" 
                class="member-input" 
                placeholder="멤버 이름을 입력하세요" 
                ${!isInputActive || isMaxReached ? 'disabled' : ''}
              />
              <button 
                class="add-member-button" 
                ${!isInputActive || isMaxReached ? 'disabled' : ''}
              >
                추가
              </button>
            </div>
            <div class="member-status-message">
              ${!isTotalConfirmed ? '총원 설정을 먼저 완료해주세요.' : 
                !isTeamCountConfirmed ? '팀 구성을 먼저 완료해주세요.' :
                isMaxReached ? '모든 멤버가 등록되었습니다.' : 
                `${totalMembers - members.length}명의 멤버를 더 추가해주세요.`}
            </div>
          </div>
        </div>
      `;
      
      // 컨테이너에 HTML 삽입
      this.container.innerHTML = html;
      
      // DOM 요소 참조 저장
      this._cacheDOMReferences();
      
      console.timeEnd('memberlistview-render');
      renderingMonitor.endRendering(this.componentId, true, {
        membersCount: members.length,
        totalMembers,
        isInputActive,
        isMaxReached
      });
      
      return this;
    } catch (error) {
      console.error('MemberListView: 전체 렌더링 실패', error);
      renderingMonitor.renderingError(this.componentId, error);
      throw error;
    }
  }
  
  /**
   * 필요한 DOM 요소 참조 캐싱
   * @private
   */
  _cacheDOMReferences() {
    // 컨테이너 요소
    this.elements.container = this.container.querySelector('.member-list-container');
    
    // 헤더 요소
    this.elements.header = this.container.querySelector('.member-list-header');
    this.elements.title = this.container.querySelector('.member-list-title');
    this.elements.count = this.container.querySelector('.member-count');
    
    // 콘텐츠 영역
    this.elements.content = this.container.querySelector('.member-list-content');
    
    // 입력 영역
    this.elements.inputContainer = this.container.querySelector('.member-input-container');
    this.elements.inputWrapper = this.container.querySelector('.member-input-wrapper');
    this.elements.input = this.container.querySelector('.member-input');
    this.elements.addButton = this.container.querySelector('.add-member-button');
    this.elements.statusMessage = this.container.querySelector('.member-status-message');
    
    // 목록 아이템들
    this.elements.memberItems = Array.from(this.container.querySelectorAll('.member-item'));
    this.elements.deleteButtons = Array.from(this.container.querySelectorAll('.delete-button'));
    this.elements.editButtons = Array.from(this.container.querySelectorAll('.edit-button'));
    
    // 편집 모드 요소
    if (this.container.querySelector('.edit-container')) {
      this.elements.editContainer = this.container.querySelector('.edit-container');
      this.elements.suffixInput = this.container.querySelector('.suffix-input');
      this.elements.confirmButton = this.container.querySelector('.confirm-button');
      this.elements.cancelButton = this.container.querySelector('.cancel-button');
    }
  }
  
  /**
   * 빈 상태 렌더링
   * @private
   */
  _renderEmptyState(isInputActive) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">👥</div>
        <div class="empty-state__title">등록된 멤버가 없습니다</div>
        <div class="empty-state__description">
          ${isInputActive ? 
            '아래 입력란에서 멤버를 추가해주세요.' : 
            '총원 설정과 팀 구성을 완료한 후 멤버를 추가할 수 있습니다.'}
        </div>
      </div>
    `;
  }
  
  /**
   * 요소 흔들기 효과
   * @param {HTMLElement} element - 효과를 적용할 요소
   */
  shakeElement(element) {
    if (!element) return;
    
    element.classList.remove('shake');
    void element.offsetWidth; // reflow 트리거
    element.classList.add('shake');
  }
  
  /**
   * 상태 메시지 업데이트
   * @param {string} message - 표시할 메시지
   * @param {string} [type='info'] - 메시지 타입 ('info', 'error', 'success', 'warning')
   */
  updateStatusMessage(message, type = 'info') {
    if (this.elements.statusMessage) {
      // 기존 클래스 제거
      this.elements.statusMessage.classList.remove('info', 'error', 'success', 'warning');
      
      // 새 클래스 추가
      this.elements.statusMessage.classList.add(type);
      
      // 애니메이션 효과
      this.elements.statusMessage.style.animation = 'none';
      void this.elements.statusMessage.offsetWidth; // 리플로우 트리거
      this.elements.statusMessage.style.animation = 'fadeIn 0.3s ease';
      
      // 메시지 설정
      this.elements.statusMessage.textContent = message;
      
      // 일정 시간 후 메시지 제거 (성공/정보 메시지)
      if (type === 'success' || type === 'info') {
        setTimeout(() => {
          if (this.elements.statusMessage) {
            // 페이드 아웃 애니메이션
            this.elements.statusMessage.style.animation = 'fadeOut 0.3s ease';
            
            // 애니메이션 후 원래 상태로 되돌리기
            setTimeout(() => {
              if (this.elements.statusMessage) {
                this.elements.statusMessage.classList.remove(type);
                this.elements.statusMessage.textContent = this._getDefaultStatusMessage();
                this.elements.statusMessage.style.animation = '';
              }
            }, 300);
          }
        }, 3000);
      }
    }
  }
  
  /**
   * 기본 상태 메시지 생성
   * @private
   * @returns {string} 기본 상태 메시지
   */
  _getDefaultStatusMessage() {
    const state = this.container.__state || {};
    const { totalMembers = 0, members = [], isTotalConfirmed = false, isTeamCountConfirmed = false } = state;
    
    // 상태에 따른 기본 메시지 결정
    if (!isTotalConfirmed) {
      return '총원 설정을 먼저 완료해주세요.';
    }
    
    if (!isTeamCountConfirmed) {
      return '팀 구성을 먼저 완료해주세요.';
    }
    
    if (totalMembers > 0 && members.length >= totalMembers) {
      return '모든 멤버가 등록되었습니다.';
    }
    
    return `${totalMembers - members.length}명의 멤버를 더 추가해주세요.`;
  }
  
  /**
   * 멤버 입력 필드 값 가져오기
   * @returns {string} 입력 필드 값
   */
  getInputValue() {
    return this.elements.input ? this.elements.input.value.trim() : '';
  }
  
  /**
   * 멤버 입력 필드 초기화
   */
  clearInput() {
    if (this.elements.input) {
      this.elements.input.value = '';
      this.elements.input.focus();
    }
  }
  
  /**
   * 멤버 입력 필드 비활성화 설정
   * @param {boolean} disabled - 비활성화 여부
   */
  setInputDisabled(disabled) {
    if (this.elements.input) {
      this.elements.input.disabled = disabled;
    }
    
    if (this.elements.addButton) {
      this.elements.addButton.disabled = disabled;
    }
  }
  
  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름
   * @param {string} selector - CSS 선택자
   * @param {Function} handler - 이벤트 핸들러
   */
  on(event, selector, handler) {
    if (!this.container) return;
    
    this.container.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler(e, target);
      }
    });
  }
  
  /**
   * 입력 관련 이벤트 리스너 등록
   * @param {Object} handlers - 이벤트 핸들러 객체
   * @param {Function} handlers.onAdd - 추가 버튼 클릭 핸들러
   * @param {Function} handlers.onEnter - 엔터키 입력 핸들러
   * @param {Function} handlers.onCompositionStart - IME 입력 시작 핸들러
   * @param {Function} handlers.onCompositionEnd - IME 입력 종료 핸들러
   */
  bindInputEvents(handlers) {
    const { onAdd, onEnter, onCompositionStart, onCompositionEnd } = handlers;
    
    if (this.elements.input) {
      // 엔터키 이벤트
      this.elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          onEnter(e);
        }
      });
      
      // IME 입력 이벤트 (한글 등)
      if (onCompositionStart) {
        this.elements.input.addEventListener('compositionstart', onCompositionStart);
      }
      
      if (onCompositionEnd) {
        this.elements.input.addEventListener('compositionend', onCompositionEnd);
      }
    }
    
    if (this.elements.addButton && onAdd) {
      this.elements.addButton.addEventListener('click', (e) => {
        e.preventDefault();
        onAdd(e);
      });
    }
  }
  
  /**
   * 멤버 항목 이벤트 리스너 등록
   * @param {Object} handlers - 이벤트 핸들러 객체
   * @param {Function} handlers.onDelete - 삭제 버튼 클릭 핸들러
   * @param {Function} handlers.onEdit - 편집 버튼 클릭 핸들러
   */
  bindMemberEvents(handlers) {
    const { onDelete, onEdit } = handlers;
    
    // 이벤트 위임 패턴 사용
    if (onDelete) {
      this.on('click', '.delete-button', (e, target) => {
        const index = parseInt(target.dataset.index, 10);
        if (!isNaN(index)) {
          onDelete(index, e);
        }
      });
    }
    
    if (onEdit) {
      this.on('click', '.edit-button', (e, target) => {
        const index = parseInt(target.dataset.index, 10);
        if (!isNaN(index)) {
          onEdit(index, e);
        }
      });
    }
  }
  
  /**
   * 편집 모드 이벤트 리스너 등록
   * @param {Object} handlers - 이벤트 핸들러 객체
   * @param {Function} handlers.onConfirm - 확인 버튼 클릭 핸들러
   * @param {Function} handlers.onCancel - 취소 버튼 클릭 핸들러
   */
  bindEditModeEvents(handlers) {
    const { onConfirm, onCancel } = handlers;
    
    if (this.elements.confirmButton && onConfirm) {
      this.on('click', '.confirm-button', (e) => {
        e.preventDefault();
        onConfirm(this.elements.suffixInput ? this.elements.suffixInput.value : '');
      });
    }
    
    if (this.elements.cancelButton && onCancel) {
      this.on('click', '.cancel-button', (e) => {
        e.preventDefault();
        onCancel();
      });
    }
    
    // 편집 모드에서 키보드 이벤트
    if (this.elements.suffixInput) {
      this.elements.suffixInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && onConfirm) {
          e.preventDefault();
          onConfirm(this.elements.suffixInput.value);
        } else if (e.key === 'Escape' && onCancel) {
          e.preventDefault();
          onCancel();
        }
      });
      
      // 자동 포커스
      this.elements.suffixInput.focus();
    }
  }
  
  /**
   * 뷰가 제대로 렌더링되었는지 확인
   * @returns {boolean} 렌더링 성공 여부
   */
  checkRendering() {
    // DOM 요소들이 제대로 생성되었는지 확인
    const hasContainer = !!this.elements.container;
    const hasContent = !!this.elements.content;
    const hasInputContainer = !!this.elements.inputContainer;
    
    // 필수 요소가 모두 존재하는지 확인
    const isRendered = hasContainer && hasContent && hasInputContainer;
    
    if (!isRendered) {
      console.warn('MemberListView: 렌더링 검사 실패', {
        hasContainer,
        hasContent,
        hasInputContainer
      });
    }
    
    return isRendered;
  }
} 