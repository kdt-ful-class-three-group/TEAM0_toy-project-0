/**
 * @file MemberInput.js
 * @description 멤버 추가를 담당하는 컴포넌트
 */

import store, { actionCreators } from '../../store/index.js';
import utils from '../../utils/index.js';
import { showInvalidInput, updateStatusMessage } from '../../handlers/uiHandlers.js';
import { addMember } from '../../handlers/memberHandlers.js';
import { showUIError } from '../../handlers/uiHandlers.js';
import { ACTION_TYPES, editMember, deleteMember } from '../../store/actions.js';
import { debounce, throttle } from '../../utils/performance.js';

/**
 * 멤버 입력 컴포넌트
 */
export class MemberInput extends HTMLElement {
  constructor() {
    super();
    
    // Shadow DOM 중복 생성 방지
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    this._state = {
      members: [],
      totalMembers: 0,
      isTotalConfirmed: false,
      isTeamCountConfirmed: false,
      editingIndex: -1
    };

    this._prevState = { ...this._state };
    this._renderPending = false;
    this._hasStateChanged = false;

    // 성능 최적화를 위한 디바운스 및 스로틀 함수
    this.debouncedUpdateView = debounce(this.updateView.bind(this), 100);
    this.throttledMemberListUpdate = throttle(this.updateMemberList.bind(this), 200);

    this.initializeComponent();
    
    // 스토어 구독 설정
    this.unsubscribe = store.subscribe((state) => {
      const prevMembers = [...this._state.members];
      
      // 상태 업데이트
      this._state.members = [...state.members];
      this._state.totalMembers = state.totalMembers;
      this._state.isTotalConfirmed = state.isTotalConfirmed;
      this._state.isTeamCountConfirmed = state.isTeamCountConfirmed;
      
      // 중요한 변경사항이 있는 경우에만 UI 업데이트
      const membersChanged = 
        prevMembers.length !== this._state.members.length || 
        JSON.stringify(prevMembers) !== JSON.stringify(this._state.members);
        
      const configChanged = 
        this._prevState.totalMembers !== this._state.totalMembers ||
        this._prevState.isTotalConfirmed !== this._state.isTotalConfirmed ||
        this._prevState.isTeamCountConfirmed !== this._state.isTeamCountConfirmed;
      
      this._prevState = { ...this._state };
      
      if (configChanged) {
        this.debouncedUpdateView();
      }
      
      if (membersChanged) {
        this.throttledMemberListUpdate();
      }
    });
    
    // 초기 상태 설정
    const initialState = store.getState();
    this._state.members = [...initialState.members];
    this._state.totalMembers = initialState.totalMembers;
    this._state.isTotalConfirmed = initialState.isTotalConfirmed;
    this._state.isTeamCountConfirmed = initialState.isTeamCountConfirmed;
  }

  connectedCallback() {
    // DOM 렌더링 후 이벤트 리스너 등록
    requestAnimationFrame(() => {
      this.addEventListeners();
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // 이벤트 리스너 정리
    this.cleanupEventListeners();
  }
  
  initializeComponent() {
    const styles = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .member-input-container {
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
        
        .card.inactive {
          opacity: 0.5;
          pointer-events: none;
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
          margin-bottom: 12px;
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
        
        .btn--icon {
          width: auto;
          padding: 4px 8px;
          font-size: 12px;
          margin: 0 2px;
          background-color: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
        }
        
        .btn--icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .status-message {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          padding: 4px 0;
          margin-bottom: 12px;
        }
        
        .member-list-container {
          margin-top: 16px;
        }
        
        .member-list-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px 0;
        }
        
        .member-list {
          list-style-type: none;
          padding: 0;
          margin: 12px 0 0 0;
          max-height: 300px;
          overflow-y: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 12px;
          contain: content;
        }
        
        .member-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 8px;
          transition: background-color 0.2s ease;
          contain: layout style;
        }
        
        .member-item:hover {
          background-color: rgba(255, 255, 255, 0.06);
        }
        
        .member-item--empty {
          justify-content: center;
          background-color: transparent;
          padding: 24px 0;
        }
        
        .member-item--empty:hover {
          background-color: transparent;
        }
        
        .empty-message {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          font-size: 14px;
        }
        
        .member-name {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .suffix {
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .member-actions {
          display: flex;
          gap: 4px;
        }
        
        .member-count {
          font-size: 14px;
          font-weight: normal;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .edit-suffix-form {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        
        .edit-input {
          width: 100px;
          padding: 8px 10px;
          font-size: 13px;
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .edit-buttons {
          display: flex;
          gap: 4px;
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
    
    const isActive = this._state.isTotalConfirmed && this._state.isTeamCountConfirmed;
    const cardClass = isActive ? 
      `card animate` : 
      `card animate inactive`;
    
    this.shadowRoot.innerHTML = `
      ${styles}
      <div class="member-input-container">
        <div class="${cardClass}">
          <div class="card__content">
            <h3 class="card__title">멤버 목록 <span class="member-count">(0)</span></h3>
            <div class="input-wrapper">
              <input type="text" class="input member-input" placeholder="멤버 이름을 입력하세요" ${!isActive ? 'disabled' : ''} />
            </div>
            <div class="button-group">
              <button class="btn add-member" ${!isActive ? 'disabled' : ''}>추가</button>
            </div>
            <div class="status-message member-status-message"></div>
            <ul class="member-list"></ul>
          </div>
        </div>
      </div>
    `;
    
    this.updateView();
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    
    // 기존 이벤트 리스너 제거
    this.cleanupEventListeners();
    
    const memberInput = shadow.querySelector('.member-input');
    const addButton = shadow.querySelector('.add-member');
    const memberList = shadow.querySelector('.member-list');
    
    if (memberInput && addButton && memberList) {
      // 이벤트 핸들러를 클래스 속성으로 저장하여 나중에 제거 가능하게 함
      this._handleAddMember = () => {
        if (memberInput.disabled) return;
        
        const name = memberInput.value.trim();
        if (!name) {
          showUIError('멤버 이름을 입력해주세요.');
          this.shakeElement(memberInput);
          return;
        }
        
        // 총원 초과 검사
        const { totalMembers, members } = this._state;
        if (members.length >= totalMembers) {
          showUIError(`최대 ${totalMembers}명까지만 추가할 수 있습니다.`);
          this.shakeElement(memberInput);
          return;
        }
        
        // 이름 중복 확인 - 기본 이름이 중복되는지 먼저 확인
        const duplicateBaseNames = this.findDuplicateBaseNames(name);
        
        if (duplicateBaseNames.length > 0) {
          // 이미 같은 기본 이름이 있는 경우, 모든 기존 이름을 접미사 버전으로 업데이트하고 새 이름도 접미사 추가
          
          // 접미사 없는 원본 이름이 있는지 확인
          const exactMatches = duplicateBaseNames.filter(item => item.exactMatch);
          
          // 이미 접미사가 있는 이름 중 가장 큰 번호 찾기
          let maxSuffix = 0;
          duplicateBaseNames.forEach(item => {
            if (item.suffix && !isNaN(item.suffix)) {
              maxSuffix = Math.max(maxSuffix, item.suffix);
            }
          });
          
          // 1. 이름이 정확히 일치하는 항목이 있으면 접미사 -1 추가
          if (exactMatches.length > 0) {
            exactMatches.forEach(match => {
              const { member, index } = match;
              const newName = `${member}-1`;
              
              console.log(`기존 정확히 일치하는 이름 업데이트: "${member}" -> "${newName}"`);
              
              // 기존 이름 업데이트
              store.dispatch({
                type: ACTION_TYPES.EDIT_MEMBER,
                payload: { index, newName }
              });
            });
            
            // 접미사 1이 사용되었으므로 최소값은 1
            if (maxSuffix < 1) maxSuffix = 1;
          }
          
          // 2. 새 이름에 다음 접미사 번호 부여 (최대값 + 1)
          const newName = `${name}-${maxSuffix + 1}`;
          
          // 3. 새 이름 추가 (즉시 추가)
          console.log(`새 이름 추가: "${newName}"`);
          store.dispatch({
            type: ACTION_TYPES.ADD_MEMBER,
            payload: { memberName: newName }
          });
          
          // 사용자에게 알림
          showUIError(`중복된 이름이 있어 자동으로 처리되었습니다. '${newName}'로 추가됩니다.`, 'info');
        } else {
          // 완전히 동일한 이름이 있는지 확인
          if (members.includes(name)) {
            // 이미 완전히 동일한 이름이 있는 경우 (이전에 접미사로 추가된 경우)
            // 접미사를 추가하지 말고 오류 메시지 표시
            showUIError(`이미 존재하는 멤버 이름입니다: ${name}`, 'error');
            this.shakeElement(memberInput);
            return;
          }
          
          // 중복이 없으면 그대로 추가
          store.dispatch({
            type: ACTION_TYPES.ADD_MEMBER,
            payload: { memberName: name }
          });
        }
        
        // 입력창 초기화 및 포커스
        memberInput.value = '';
        memberInput.focus();
      };
      
      // 버튼 클릭 이벤트
      addButton.addEventListener('click', this._handleAddMember);
      this._addButtonClickListener = this._handleAddMember;
      
      // 한글 입력 상태 추적을 위한 변수
      this._isComposing = false;

      // 한글 입력 시작
      this._handleCompositionStart = () => {
        this._isComposing = true;
      };
      memberInput.addEventListener('compositionstart', this._handleCompositionStart);

      // 한글 입력 종료
      this._handleCompositionEnd = () => {
        this._isComposing = false;
      };
      memberInput.addEventListener('compositionend', this._handleCompositionEnd);
      
      // 엔터키 이벤트
      this._handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // 이벤트 전파 차단
          if (!this._isComposing) { // 한글 입력이 완료된 상태에서만 처리
            this._handleAddMember();
          }
        }
      };
      memberInput.addEventListener('keydown', this._handleKeyDown);
      
      // 멤버 목록 이벤트 핸들러 설정
      this.setupMemberListEventHandlers(memberList);
    }
  }
  
  // 이벤트 리스너 정리
  cleanupEventListeners() {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    
    const memberInput = shadow.querySelector('.member-input');
    const addButton = shadow.querySelector('.add-member');
    
    if (memberInput) {
      memberInput.removeEventListener('compositionstart', this._handleCompositionStart);
      memberInput.removeEventListener('compositionend', this._handleCompositionEnd);
      memberInput.removeEventListener('keydown', this._handleKeyDown);
    }
    
    if (addButton) {
      addButton.removeEventListener('click', this._addButtonClickListener);
    }
    
    // 멤버 리스트 이벤트 핸들러 제거
    const memberList = shadow.querySelector('.member-list');
    if (memberList && this._memberListClickHandler) {
      memberList.removeEventListener('click', this._memberListClickHandler);
    }
  }
  
  updateView() {
    const isActive = this._state.isTotalConfirmed && this._state.isTeamCountConfirmed;
    const memberInput = this.shadowRoot.querySelector('.member-input');
    const addButton = this.shadowRoot.querySelector('.add-member');
    const card = this.shadowRoot.querySelector('.card');
    
    if (memberInput && addButton) {
      const membersRemaining = this._state.totalMembers - this._state.members.length;
      const isMaxReached = membersRemaining <= 0;
      
      memberInput.disabled = !isActive || isMaxReached;
      addButton.disabled = !isActive || isMaxReached;
      
      // 총원 설정 및 팀 구성이 완료되었을 때만 활성화
      if (card) {
        if (isActive) {
          card.classList.remove('inactive');
        } else {
          card.classList.add('inactive');
        }
      }
    }
    
    // 상태 메시지 업데이트
    this.updateStatusMessage();
    
    // 멤버 목록 업데이트 - 렌더링 최적화를 위해 throttle 사용
    this.throttledMemberListUpdate();
  }
  
  updateStatusMessage() {
    const messageElement = this.shadowRoot.querySelector('.member-status-message');
    if (!messageElement) return;
    
    const { isTotalConfirmed, isTeamCountConfirmed, totalMembers, members } = this._state;
    
    if (!isTotalConfirmed) {
      updateStatusMessage(messageElement, '총원 설정을 먼저 완료해주세요.', 'info');
    } else if (!isTeamCountConfirmed) {
      updateStatusMessage(messageElement, '팀 구성을 먼저 완료해주세요.', 'info');
    } else {
      const remaining = totalMembers - members.length;
      if (remaining > 0) {
        updateStatusMessage(messageElement, `${remaining}명의 멤버를 더 추가해주세요.`, 'info');
      } else if (remaining === 0) {
        updateStatusMessage(messageElement, '모든 멤버가 작성되었습니다!', 'success');
      } else {
        updateStatusMessage(messageElement, `설정된 총원(${totalMembers}명)을 초과했습니다!`, 'error');
      }
    }
    
    // 멤버 카운트 업데이트 
    const memberCount = this.shadowRoot.querySelector('.member-count');
    if (memberCount) {
      memberCount.textContent = this._state.isTotalConfirmed ? 
        `(${this._state.members.length}/${this._state.totalMembers})` :
        `(${this._state.members.length})`;
    }
  }
  
  updateMemberList() {
    const memberList = this.shadowRoot.querySelector('.member-list');
    if (!memberList) return;
    
    // 렌더링 최적화: 변경이 있을 때만 DOM 업데이트 
    const currentHTML = memberList.innerHTML;
    
    // 멤버가 없을 때 표시할 메시지
    if (this._state.members.length === 0) {
      const emptyListHTML = `
        <li class="member-item member-item--empty">
          <span class="empty-message">아직 등록된 멤버가 없습니다.</span>
        </li>
      `;
      
      if (currentHTML !== emptyListHTML) {
        memberList.innerHTML = emptyListHTML;
      }
      return;
    }
    
    // 멤버 목록 HTML 생성
    const htmlContent = this._state.members.map((member, index) => {
      // 동명이인 검출 (이름에 '-' 포함된 경우)
      const hasSuffix = member.includes('-');
      const baseName = hasSuffix ? member.split('-')[0] : member;
      const suffix = hasSuffix ? member.split('-')[1] : '';
      
      return `
        <li class="member-item" data-index="${index}">
          <span class="member-name">${baseName}${hasSuffix ? '-' : ''}<span class="suffix">${suffix}</span></span>
          <div class="member-actions">
            ${hasSuffix ? 
              `<button class="btn btn--icon edit-suffix" data-index="${index}" data-name="${baseName}" data-suffix="${suffix}">
                수정
              </button>` : ''}
            <button class="btn btn--icon delete-member" data-index="${index}">
              삭제
            </button>
          </div>
        </li>
      `;
    }).join('');
    
    // 변경이 있을 때만 DOM 업데이트
    if (memberList.innerHTML !== htmlContent) {
      memberList.innerHTML = htmlContent;
      
      // 이벤트 위임을 이용해 클릭 핸들러 등록
      this.setupMemberListEventHandlers(memberList);
    }
  }
  
  setupMemberListEventHandlers(memberList) {
    // 기존 이벤트 핸들러가 있다면 제거
    if (this._memberListClickHandler) {
      memberList.removeEventListener('click', this._memberListClickHandler);
    }
    
    // 이벤트 위임을 통한 효율적인 이벤트 처리
    this._memberListClickHandler = (e) => {
      // 삭제 버튼 클릭
      if (e.target.classList.contains('delete-member')) {
        const index = parseInt(e.target.dataset.index, 10);
        if (!isNaN(index)) {
          store.dispatch(deleteMember(index));
        }
        return;
      }
      
      // 수정 버튼 클릭
      if (e.target.classList.contains('edit-suffix')) {
        const index = parseInt(e.target.dataset.index, 10);
        const name = e.target.dataset.name;
        const suffix = e.target.dataset.suffix;
        
        if (!isNaN(index) && name) {
          this.showSuffixEditForm(index, name, suffix);
        }
      }
    };
    
    memberList.addEventListener('click', this._memberListClickHandler);
  }

  shakeElement(element) {
    if (!element) return;
    
    element.classList.remove('shake');
    void element.offsetWidth; // 리플로우 트리거
    element.classList.add('shake');
  }
  
  showSuffixEditForm(index, name, currentSuffix) {
    // 현재 편집 중인 폼이 있으면 제거
    const existingForm = this.shadowRoot.querySelector('.edit-suffix-form');
    if (existingForm) {
      existingForm.remove();
    }
    
    // 해당 멤버 아이템 찾기
    const memberItem = this.shadowRoot.querySelector(`.member-list .member-item[data-index="${index}"]`);
    if (!memberItem) return;
    
    // 기존 멤버 이름과 액션 숨기기
    const memberName = memberItem.querySelector('.member-name');
    const memberActions = memberItem.querySelector('.member-actions');
    
    if (memberName && memberActions) {
      memberName.style.display = 'none';
      memberActions.style.display = 'none';
      
      // 수정 폼 생성
      const editForm = document.createElement('div');
      editForm.className = 'edit-suffix-form';
      editForm.innerHTML = `
        <span>${name}-</span>
        <input type="text" class="input edit-input" value="${currentSuffix || ''}" placeholder="접미사">
        <div class="edit-buttons">
          <button class="btn btn--icon confirm-edit">확인</button>
          <button class="btn btn--icon cancel-edit">취소</button>
        </div>
      `;
      
      // 폼 추가
      memberItem.appendChild(editForm);
      
      // 입력 필드에 포커스
      const input = editForm.querySelector('.edit-input');
      if (input) {
        input.focus();
        input.select();
      }
      
      // 한글 입력 상태 추적
      let isComposing = false;
      input.addEventListener('compositionstart', () => { isComposing = true; });
      input.addEventListener('compositionend', () => { isComposing = false; });
      
      // 확인 버튼 이벤트
      const confirmBtn = editForm.querySelector('.confirm-edit');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (!isComposing) {
            const newSuffix = input.value.trim();
            this.updateMemberSuffix(index, name, newSuffix);
          }
        });
      }
      
      // 취소 버튼 이벤트
      const cancelBtn = editForm.querySelector('.cancel-edit');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.cancelSuffixEdit(memberName, memberActions, editForm);
        });
      }
      
      // 엔터키 이벤트
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isComposing) {
          e.preventDefault();
          const newSuffix = input.value.trim();
          this.updateMemberSuffix(index, name, newSuffix);
        } else if (e.key === 'Escape') {
          this.cancelSuffixEdit(memberName, memberActions, editForm);
        }
      });
    }
  }
  
  updateMemberSuffix(index, name, newSuffix) {
    // 멤버 이름 업데이트
    let updatedName = name;
    
    // 접미사가 있는 경우에만 하이픈 추가
    if (newSuffix && newSuffix.trim() !== '') {
      updatedName = `${name}-${newSuffix.trim()}`;
    }
    
    // 스토어 업데이트
    store.dispatch(editMember(index, updatedName));
    
    // 기존 폼 제거 및 원래 요소 표시
    const editForm = this.shadowRoot.querySelector('.edit-suffix-form');
    const memberItem = this.shadowRoot.querySelector(`.member-list .member-item[data-index="${index}"]`);
    
    if (memberItem) {
      const memberName = memberItem.querySelector('.member-name');
      const memberActions = memberItem.querySelector('.member-actions');
      
      if (memberName && memberActions && editForm) {
        memberName.style.display = '';
        memberActions.style.display = '';
        editForm.remove();
      }
    }
  }
  
  cancelSuffixEdit(memberName, memberActions, editForm) {
    if (memberName && memberActions && editForm) {
      memberName.style.display = '';
      memberActions.style.display = '';
      editForm.remove();
    }
  }

  /**
   * 기본 이름(접미사 제외)이 중복되는 모든 멤버를 찾습니다.
   * @param {string} name - 확인할 이름
   * @returns {Array<{member: string, index: number}>} 중복된 멤버 정보
   */
  findDuplicateBaseNames(name) {
    console.log('중복 멤버 찾기 시작:', name);
    console.log('현재 멤버 목록:', this._state.members);
    
    const duplicates = [];
    
    this._state.members.forEach((member, index) => {
      // 정확히 일치하는 경우
      if (member === name) {
        console.log(`정확한 중복 발견: ${member} (인덱스: ${index})`);
        duplicates.push({ member, index, baseName: member, exactMatch: true });
        return;
      }
      
      // 하이픈이 있는 경우 기본 이름만 비교
      if (member.includes('-')) {
        const parts = member.split('-');
        const baseName = parts[0];
        
        if (baseName === name) {
          console.log(`기본 이름 중복 발견: ${member} (기본 이름: ${baseName}, 인덱스: ${index})`);
          
          // 접미사 추출 시도
          let suffix = null;
          if (parts.length > 1) {
            const suffixNum = parseInt(parts[1], 10);
            if (!isNaN(suffixNum)) {
              suffix = suffixNum;
            }
          }
          
          duplicates.push({ 
            member, 
            index, 
            baseName,
            exactMatch: false,
            suffix 
          });
        }
      }
    });
    
    console.log('중복 멤버 결과:', duplicates);
    return duplicates;
  }
  
  /**
   * 기본 이름이 중복되는지 확인 (접미사 제외)
   * @param {string} name - 확인할 이름
   * @returns {boolean} 중복 여부
   */
  isDuplicateBaseName(name) {
    return this.findDuplicateBaseNames(name).length > 0;
  }
}

customElements.define('member-input', MemberInput); 