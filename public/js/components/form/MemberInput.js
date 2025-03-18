/**
 * @file MemberInput.js
 * @description 멤버 추가를 담당하는 컴포넌트
 */

import store from '../../store/index.js';
import utils from '../../utils/index.js';
import { showInvalidInput, updateStatusMessage } from '../../handlers/uiHandlers.js';
import { addMember } from '../../handlers/memberHandlers.js';
import { showUIError } from '../../handlers/uiHandlers.js';
import { ACTION_TYPES, editMember, deleteMember } from '../../store/actions.js';

/**
 * 멤버 입력 컴포넌트
 */
export class MemberInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.unsubscribe = null;
    this.initialized = false;
    this.eventsRegistered = false;
    this._isFirstRender = true;
    
    // 상태 초기화
    this._state = {
      members: [],
      totalMembers: 0,
      isTotalConfirmed: false,
      teamCount: 0,
      isTeamCountConfirmed: false
    };
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
    
    // 상태 구독 설정 - 직접 멤버 배열 상태를 구독
    this.unsubscribe = store.subscribe((state) => {
      console.log('스토어 상태 변경됨:', state.members);
      this.updateFromState(state);
    });
    
    // 초기 상태 설정
    this.updateFromState(store.getState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  updateFromState(state) {
    console.log('상태 업데이트 중...', state.members);
    
    // 상태 업데이트
    const membersChanged = JSON.stringify(this._state.members) !== JSON.stringify(state.members);
    
    // 중요한 상태 변화가 있을 때만 업데이트
    this._state.members = [...state.members];
    this._state.totalMembers = state.totalMembers;
    this._state.isTotalConfirmed = state.isTotalConfirmed;
    this._state.teamCount = state.teamCount;
    this._state.isTeamCountConfirmed = state.isTeamCountConfirmed;
    
    // UI 업데이트
    const isInputActive = state.isTotalConfirmed && state.isTeamCountConfirmed;
    const memberInput = this.shadowRoot.querySelector('.member-input');
    const addButton = this.shadowRoot.querySelector('.add-member');
    const card = this.shadowRoot.querySelector('.card');
    
    if (memberInput && addButton) {
      const membersRemaining = state.totalMembers - state.members.length;
      const isMaxReached = membersRemaining <= 0;
      
      memberInput.disabled = !isInputActive || isMaxReached;
      addButton.disabled = !isInputActive || isMaxReached;
      
      // 총원 설정 및 팀 구성이 완료되었을 때만 활성화
      if (card) {
        if (isInputActive) {
          card.classList.remove('inactive');
        } else {
          card.classList.add('inactive');
        }
      }
    }
    
    // 상태 메시지 업데이트
    this.updateStatusMessage();
    
    // 멤버 목록 업데이트
    if (membersChanged) {
      console.log('멤버 목록 변경됨, UI 업데이트');
      this.updateMemberList();
    }
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
  }
  
  updateMemberList() {
    const memberList = this.shadowRoot.querySelector('.member-list');
    const memberCount = this.shadowRoot.querySelector('.member-count');
    
    if (!memberList || !memberCount) {
      console.warn('멤버 목록 요소를 찾을 수 없음');
      return;
    }
    
    // 멤버 목록 데이터 로깅
    console.log('멤버 목록 업데이트:', this._state.members);
    
    // 멤버 카운트 업데이트
    memberCount.textContent = this._state.isTotalConfirmed ? 
      `(${this._state.members.length}/${this._state.totalMembers})` :
      `(${this._state.members.length})`;
    
    // 멤버가 없을 때 표시할 메시지
    if (this._state.members.length === 0) {
      memberList.innerHTML = `
        <li class="member-item member-item--empty">
          <span class="empty-message">아직 등록된 멤버가 없습니다.</span>
        </li>
      `;
      return;
    }
    
    // 임시 컨테이너를 사용하여 DOM 조작 최소화
    let htmlContent = '';
    
    // 멤버 목록 업데이트
    this._state.members.forEach((member, index) => {
      // 동명이인 검출 (이름에 '-' 포함된 경우)
      const hasSuffix = member.includes('-');
      const baseName = hasSuffix ? member.split('-')[0] : member;
      const suffix = hasSuffix ? member.split('-')[1] : '';
      
      htmlContent += `
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
    });
    
    // DOM 업데이트를 한 번에 처리
    memberList.innerHTML = htmlContent;
    
    console.log('멤버 목록 DOM 업데이트 완료', memberList.children.length);
    
    // 이벤트 위임을 이용해 모든 멤버 항목에 대한 이벤트 리스너 재설정
    this.setupMemberListEventHandlers(memberList);
  }
  
  setupMemberListEventHandlers(memberList) {
    // 기존 이벤트 핸들러가 있다면 제거 (cleanup)
    if (this._memberListClickHandler) {
      memberList.removeEventListener('click', this._memberListClickHandler);
      this._memberListClickHandler = null;
    }
    
    // 새 이벤트 핸들러 설정
    this._memberListClickHandler = (e) => {
      // 클릭된 요소 또는 그 부모에서 버튼 찾기
      const findClickedButton = (element, className) => {
        if (!element) return null;
        if (element.classList && element.classList.contains(className)) return element;
        
        // 최대 3단계 부모까지만 올라가기 (성능 및 정확성 위해)
        let parent = element.parentElement;
        let depth = 0;
        
        while (parent && depth < 3) {
          if (parent.classList && parent.classList.contains(className)) return parent;
          parent = parent.parentElement;
          depth++;
        }
        
        return null;
      };
      
      // 삭제 버튼 클릭
      const deleteButton = findClickedButton(e.target, 'delete-member');
      if (deleteButton) {
        const index = parseInt(deleteButton.dataset.index, 10);
        if (!isNaN(index)) {
          console.log('멤버 삭제 요청:', index);
          store.dispatch(deleteMember(index));
        }
        return;
      }
      
      // 접미사 수정 버튼 클릭
      const editButton = findClickedButton(e.target, 'edit-suffix');
      if (editButton) {
        const index = parseInt(editButton.dataset.index, 10);
        const name = editButton.dataset.name;
        const suffix = editButton.dataset.suffix;
        
        console.log('접미사 수정 버튼 클릭:', {index, name, suffix});
        
        if (!isNaN(index) && name) {
          this.showSuffixEditForm(index, name, suffix);
        }
      }
    };
    
    memberList.addEventListener('click', this._memberListClickHandler);
  }

  render() {
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
          margin-bottom: 12px;
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
      `card ${this._isFirstRender ? 'animate' : ''}` : 
      `card ${this._isFirstRender ? 'animate' : ''} inactive`;
    
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
    
    this._isFirstRender = false;
    this.updateFromState(store.getState());
    
    if (this.eventsRegistered) {
      this.addEventListeners();
    }
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    
    // 기존 이벤트 리스너 제거 및 재설정
    const memberInput = shadow.querySelector('.member-input');
    const addButton = shadow.querySelector('.add-member');
    const memberList = shadow.querySelector('.member-list');
    
    if (memberInput && addButton && memberList) {
      const handleAddMember = () => {
        if (memberInput.disabled) return;
        
        const name = memberInput.value.trim();
        if (!name) {
          showUIError(memberInput, '멤버 이름을 입력해주세요.');
          this.shakeElement(memberInput);
          return;
        }
        
        // 총원 초과 검사
        const { totalMembers, members } = this._state;
        if (members.length >= totalMembers) {
          showUIError(memberInput, '더 이상 멤버를 추가할 수 없습니다.');
          this.shakeElement(memberInput);
          return;
        }
        
        // 이름 중복 확인 (접미사 처리는 addMember 함수에서 처리됨)
        store.dispatch({
          type: ACTION_TYPES.ADD_MEMBER,
          payload: { memberName: name }
        });
        
        // 입력창 초기화 및 포커스
        memberInput.value = '';
        memberInput.focus();
      };
      
      // 버튼 클릭 이벤트
      addButton.addEventListener('click', handleAddMember);
      
      // 한글 입력 상태 추적을 위한 변수
      let isComposing = false;

      // 한글 입력 시작
      memberInput.addEventListener('compositionstart', () => {
        isComposing = true;
      });

      // 한글 입력 종료
      memberInput.addEventListener('compositionend', () => {
        isComposing = false;
      });
      
      // 엔터키 이벤트 - keydown에서만 처리하고 즉시 preventDefault 처리
      memberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // 이벤트 전파 차단
          if (!isComposing) { // 한글 입력이 완료된 상태에서만 처리
            handleAddMember();
          }
        }
      });
      
      // 멤버 목록 이벤트 핸들러 설정
      this.setupMemberListEventHandlers(memberList);
    }
  }
  
  shakeElement(element) {
    if (!element) return;
    
    element.classList.remove('shake');
    void element.offsetWidth; // 리플로우 트리거
    element.classList.add('shake');
  }
  
  showSuffixEditForm(index, name, currentSuffix) {
    console.log('접미사 수정 시작:', {index, name, currentSuffix});
    
    // 현재 편집 중인 폼이 있으면 제거
    const existingForm = this.shadowRoot.querySelector('.edit-suffix-form');
    if (existingForm) {
      existingForm.remove();
    }
    
    // 해당 멤버 아이템 찾기 - data-index 속성으로 찾기
    const memberItem = this.shadowRoot.querySelector(`.member-list .member-item[data-index="${index}"]`);
    if (!memberItem) {
      console.error('멤버 항목을 찾을 수 없음:', index);
      return;
    }
    
    console.log('접미사 수정 폼 표시:', {index, name, currentSuffix, memberItem});
    
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

      // 한글 입력 이벤트 처리
      input.addEventListener('compositionstart', () => {
        isComposing = true;
        console.log('한글 입력 시작');
      });

      input.addEventListener('compositionend', () => {
        isComposing = false;
        console.log('한글 입력 완료');
      });
      
      // 확인 버튼 이벤트
      const confirmBtn = editForm.querySelector('.confirm-edit');
      if (confirmBtn) {
        const handleConfirm = () => {
          if (isComposing) {
            console.log('한글 입력 중, 확인 버튼 처리 지연');
            setTimeout(handleConfirm, 10);
            return;
          }
          
          const newSuffix = input.value.trim();
          console.log('접미사 수정 확인 버튼 클릭:', {index, name, newSuffix});
          this.updateMemberSuffix(index, name, newSuffix);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
      }
      
      // 취소 버튼 이벤트
      const cancelBtn = editForm.querySelector('.cancel-edit');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          console.log('접미사 수정 취소');
          this.cancelSuffixEdit(memberName, memberActions, editForm);
        });
      }
      
      // 엔터키 이벤트
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          
          if (isComposing) {
            console.log('한글 입력 중, 엔터키 처리 연기');
            return;
          }
          
          const newSuffix = input.value.trim();
          console.log('접미사 수정 엔터키:', {index, name, newSuffix, isComposing});
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
    
    console.log('멤버 이름 업데이트 요청:', {index, name, newSuffix, updatedName});
    console.log('EDIT_MEMBER 액션 디스패치 전 멤버 목록:', store.getState().members);
    
    try {
      // 스토어 업데이트
      store.dispatch(editMember(index, updatedName));
      
      // 변경 후 멤버 목록 확인
      console.log('EDIT_MEMBER 액션 디스패치 후 멤버 목록:', store.getState().members);
    } catch (err) {
      console.error('멤버 이름 업데이트 중 오류:', err);
    }
    
    // 기존 폼 제거
    const editForm = this.shadowRoot.querySelector('.edit-suffix-form');
    if (editForm) {
      editForm.remove();
    }
    
    // 멤버 이름과 액션 다시 표시 - data-index 속성으로 요소 찾기
    const memberItem = this.shadowRoot.querySelector(`.member-list .member-item[data-index="${index}"]`);
    if (memberItem) {
      const memberName = memberItem.querySelector('.member-name');
      const memberActions = memberItem.querySelector('.member-actions');
      
      if (memberName && memberActions) {
        memberName.style.display = '';
        memberActions.style.display = '';
      }
    }
    
    // 변경 내용 확인용 - 상태가 업데이트 되었는지 확인
    console.log('최종 멤버 목록:', store.getState().members);
    
    // 약간의 지연 후 UI 업데이트 한번 더 실행 (비동기 상태 업데이트 문제 해결)
    setTimeout(() => {
      this.updateMemberList();
    }, 10);
  }
  
  cancelSuffixEdit(memberName, memberActions, editForm) {
    if (memberName && memberActions && editForm) {
      memberName.style.display = '';
      memberActions.style.display = '';
      editForm.remove();
    }
  }
}

customElements.define('member-input', MemberInput); 