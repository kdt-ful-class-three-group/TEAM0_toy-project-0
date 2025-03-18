import { BaseComponent } from './BaseComponent.js';
import { renderMemberList } from '../renderers/index.js';
import store from '../store/index.js';
import { memoize } from '../utils/performance.js';
import { ACTION_TYPES } from '../store/actions.js';
import { showUIError } from '../handlers/uiHandlers.js';

/**
 * 멤버 목록 컴포넌트
 * 가운데 영역의 멤버 목록을 표시합니다.
 * @class MemberList
 * @extends BaseComponent
 */
export class MemberList extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      useCommonStyles: true,
      useUtilityStyles: true,
      renderThrottle: 16, // 60fps에 맞춘 렌더링 최적화
      optimizeUpdates: true // DOM 업데이트 최적화 활성화
    });
    
    // 상태 초기화
    this.state = {
      members: [],
      editingIndex: -1,
      totalMembers: 0,
      isTotalConfirmed: false,
      isTeamCountConfirmed: false,
      isComposing: false
    };
    
    // 메모이제이션 적용 - 디버깅 활성화
    this.memoizedRenderMemberList = memoize(renderMemberList, {
      maxSize: 20,
      debug: true
    });

    // 메서드 바인딩
    this.handleListClick = this.handleListClick.bind(this);
  }

  /**
   * 컴포넌트 초기화 - BaseComponent 라이프사이클 메소드
   */
  initialize() {
    console.time('memberlist-init');
    
    // 스토어 구독 설정
    const unsubscribe = store.subscribe((state) => {
      console.log('MemberList: 상태 변경 감지', { 
        members: state.members.length, 
        totalMembers: state.totalMembers,
        isTotalConfirmed: state.isTotalConfirmed,
        isTeamCountConfirmed: state.isTeamCountConfirmed 
      });

      // 상태 변경 감지 로직 개선
      const stateChanged = 
        !this.state.members || 
        !Array.isArray(this.state.members) || 
        !Array.isArray(state.members) || 
        this.state.members.length !== state.members.length || 
        JSON.stringify(this.state.members) !== JSON.stringify(state.members) ||
        this.state.totalMembers !== state.totalMembers ||
        this.state.isTotalConfirmed !== state.isTotalConfirmed ||
        this.state.isTeamCountConfirmed !== state.isTeamCountConfirmed;
      
      if (stateChanged) {
        console.log('MemberList: 상태 업데이트 필요', { 
          oldState: { 
            members: this.state.members?.length, 
            totalMembers: this.state.totalMembers,
            isTotalConfirmed: this.state.isTotalConfirmed,
            isTeamCountConfirmed: this.state.isTeamCountConfirmed
          }, 
          newState: { 
            members: state.members.length, 
            totalMembers: state.totalMembers,
            isTotalConfirmed: state.isTotalConfirmed,
            isTeamCountConfirmed: state.isTeamCountConfirmed
          } 
        });
        
        this.updateState({ 
          members: [...state.members],
          totalMembers: state.totalMembers,
          isTotalConfirmed: state.isTotalConfirmed,
          isTeamCountConfirmed: state.isTeamCountConfirmed
        });
      }
    });
    
    // 자동 구독 해제를 위해 구독 해제 함수 등록
    this.addUnsubscriber(unsubscribe);
    
    // 초기 상태 설정
    const state = store.getState();
    this.updateState({ 
      members: [...state.members],
      totalMembers: state.totalMembers,
      isTotalConfirmed: state.isTotalConfirmed,
      isTeamCountConfirmed: state.isTeamCountConfirmed,
      isComposing: false // 한글 입력 상태 추적
    });
    
    // 이벤트 리스너 설정 (명시적 호출)
    this.addEventListeners();
    
    console.timeEnd('memberlist-init');
  }

  /**
   * DOM 이벤트 처리를 추가
   */
  addEventListeners() {
    // 이벤트 위임을 사용하여 목록 클릭 처리
    if (this.shadowRoot) {
      this.addEventListenerWithCleanup(
        this.shadowRoot, 
        'click', 
        this.handleListClick
      );
      
      console.log('MemberList: 이벤트 리스너 등록 완료');
      
      // 멤버 추가 이벤트 처리 - 타이머로 감싸서 DOM이 완전히 로드된 후 처리
      setTimeout(() => {
        const addButton = this.shadowRoot.querySelector('.add-member-button');
        const memberInput = this.shadowRoot.querySelector('.member-input');
        
        if (addButton && memberInput) {
          // 한글 입력 처리를 위한 이벤트 핸들러
          let isComposing = false;
          let isFinalEnter = false;
          
          // 한글 입력 시작 감지
          this.addEventListenerWithCleanup(
            memberInput,
            'compositionstart',
            () => {
              console.log('한글 입력 시작');
              isComposing = true;
            }
          );
          
          // 한글 입력 종료 감지
          this.addEventListenerWithCleanup(
            memberInput,
            'compositionend',
            () => {
              console.log('한글 입력 완료');
              isComposing = false;
              
              // 입력 완료 후 엔터키 처리가 필요한 경우
              if (isFinalEnter) {
                console.log('입력 완료 후 엔터키 처리');
                isFinalEnter = false;
                this.handleAddMember(memberInput);
              }
            }
          );
          
          // 엔터키 처리
          this.addEventListenerWithCleanup(
            memberInput,
            'keydown',
            (e) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                console.log('엔터키 감지, 조합 상태:', isComposing);
                
                if (isComposing) {
                  // 한글 입력 중에는 플래그만 설정
                  isFinalEnter = true;
                } else {
                  // 일반 텍스트는 즉시 처리
                  if (memberInput.value.trim()) {
                    this.handleAddMember(memberInput);
                  }
                }
              } else {
                // 다른 키가 눌리면 엔터 플래그 초기화
                isFinalEnter = false;
              }
            }
          );
          
          // 추가 버튼 클릭 이벤트
          this.addEventListenerWithCleanup(
            addButton,
            'click',
            () => {
              console.log('추가 버튼 클릭됨, 조합 상태:', isComposing);
              if (!isComposing && memberInput.value.trim()) {
                this.handleAddMember(memberInput);
              }
            }
          );
          
          console.log('MemberList: 멤버 추가 이벤트 리스너 등록 완료');
        } else {
          console.warn('MemberList: 멤버 추가 버튼 또는 입력 필드를 찾을 수 없습니다');
        }
      }, 200); // DOM이 완전히 로드될 때까지 충분한 시간 제공
    } else {
      console.warn('MemberList: shadowRoot가 없어 이벤트 리스너를 등록할 수 없습니다');
    }
  }

  /**
   * 리스트 클릭 이벤트 핸들러 (이벤트 위임 패턴)
   */
  handleListClick(event) {
    console.log('MemberList: 클릭 이벤트 발생', event.target);
    const target = event.target;
    
    // 삭제 버튼 처리
    if (target.classList.contains('delete-button')) {
      const index = parseInt(target.dataset.index, 10);
      if (!isNaN(index)) {
        this.handleMemberDelete(index);
      }
    }
    
    // 멤버 이름 수정 버튼 처리
    if (target.classList.contains('edit-button')) {
      const index = parseInt(target.dataset.index, 10);
      if (!isNaN(index)) {
        this.startSuffixEdit(target, index);
      }
    }
  }

  /**
   * 멤버 삭제 처리
   */
  handleMemberDelete(index) {
    console.log(`MemberList: 멤버 삭제 (인덱스: ${index})`);
    
    try {
      // 액션 디스패치
      store.dispatch({
        type: ACTION_TYPES.DELETE_MEMBER,
        payload: { index }
      });
      
      console.log('멤버 삭제 후 목록:', store.getState().members);
    } catch (error) {
      console.error('멤버 삭제 중 오류 발생:', error);
    }
  }

  /**
   * 멤버 이름 수정 시작
   */
  startSuffixEdit(button, index) {
    console.log(`MemberList: 멤버 편집 시작 (인덱스: ${index})`);
    // 현재 편집 중인 항목이 있으면 편집 취소
    if (this.state.editingIndex !== -1) {
      this.cancelEdit();
    }
    
    // 편집 상태로 설정
    this.updateState({ editingIndex: index });
  }

  /**
   * 렌더링 후 호출되는 콜백 - 편집 모드 설정
   */
  afterRender() {
    // 편집 모드가 활성화된 경우에만 처리
    if (this.state.editingIndex !== -1) {
      const editContainer = this.shadowRoot.querySelector('.edit-container');
      if (editContainer) {
        console.log('MemberList: 편집 컨테이너 요소 찾음', editContainer);
        const input = editContainer.querySelector('input');
        const confirmButton = editContainer.querySelector('.confirm-button');
        const cancelButton = editContainer.querySelector('.cancel-button');
        
        // 입력 필드에 포커스
        if (input) {
          input.focus();
          console.log('MemberList: 편집 입력 필드에 포커스 설정');
        }
        
        // 이벤트 핸들러 등록
        const handleConfirm = () => {
          if (!input) return;
          const newSuffix = input.value.trim();
          this.updateMemberName(newSuffix, this.state.editingIndex);
        };
        
        const handleCancel = () => {
          this.cancelEdit();
        };
        
        // 키보드 이벤트 처리
        const handleKeyDown = (e) => {
          if (e.key === 'Enter') {
            handleConfirm();
          } else if (e.key === 'Escape') {
            handleCancel();
          }
        };
        
        // 이벤트 리스너 등록 (클린업 자동화)
        if (confirmButton) {
          this.addEventListenerWithCleanup(confirmButton, 'click', handleConfirm);
        }
        
        if (cancelButton) {
          this.addEventListenerWithCleanup(cancelButton, 'click', handleCancel);
        }
        
        if (input) {
          this.addEventListenerWithCleanup(input, 'keydown', handleKeyDown);
        }
      } else {
        console.warn('MemberList: 편집 컨테이너를 찾을 수 없음');
      }
    }
  }

  /**
   * 편집 취소
   */
  cancelEdit() {
    console.log('MemberList: 편집 취소');
    this.updateState({ editingIndex: -1 });
  }

  /**
   * 멤버 이름 업데이트
   */
  updateMemberName(newSuffix, index) {
    console.log(`MemberList: 멤버 이름 업데이트 (인덱스: ${index}, 새 접미사: ${newSuffix})`);
    
    try {
      const members = [...store.getState().members];
      const member = members[index];
      
      if (!member) {
        console.error(`멤버를 찾을 수 없음: 인덱스 ${index}`);
        return;
      }
      
      // 멤버 이름 형태 확인 (문자열 또는 객체)
      const isStringMember = typeof member === 'string';
      
      if (isStringMember) {
        // 문자열 형태의 멤버
        let baseName = member;
        
        // 기존에 '-' 있는지 확인 (접미사가 있는지)
        if (member.includes('-')) {
          baseName = member.split('-')[0];
        }
        
        // 새 이름 생성
        let updatedName = baseName;
        if (newSuffix && newSuffix.trim() !== '') {
          updatedName = `${baseName}-${newSuffix.trim()}`;
        }
        
        console.log(`멤버 이름 변경: "${member}" -> "${updatedName}"`);
        members[index] = updatedName;
      } else {
        // 객체 형태의 멤버
        // 객체 형태는 멤버 목록 로직에 명시된 대로 처리
        console.log('객체 형태의 멤버 업데이트는 아직 구현되지 않았습니다.');
      }
      
      // 스토어 업데이트
      store.dispatch({
        type: ACTION_TYPES.EDIT_MEMBER,
        payload: { index, newName: members[index] }
      });
      
      // 편집 모드 종료
      this.updateState({ editingIndex: -1 });
    } catch (error) {
      console.error('멤버 이름 업데이트 중 오류 발생:', error);
    }
  }

  /**
   * 멤버 추가 처리
   */
  handleAddMember(inputElement) {
    if (!inputElement) {
      console.error('MemberList: 입력 요소가 없습니다');
      return;
    }
    
    const name = inputElement.value.trim();
    if (!name) {
      this.shakeElement(inputElement);
      showUIError(inputElement, '멤버 이름을 입력해주세요');
      return;
    }
    
    // 설정 완료 여부 확인
    const { totalMembers, members, isTotalConfirmed, isTeamCountConfirmed } = this.state;
    if (!isTotalConfirmed || !isTeamCountConfirmed) {
      this.shakeElement(inputElement);
      showUIError(inputElement, '총원 설정과 팀 구성을 먼저 완료해주세요');
      return;
    }
    
    // 총원 초과 검사
    if (members.length >= totalMembers) {
      this.shakeElement(inputElement);
      showUIError(inputElement, '더 이상 멤버를 추가할 수 없습니다');
      return;
    }
    
    console.log(`멤버 추가 실행: "${name}"`);
    
    // 멤버 추가 액션 디스패치
    store.dispatch({
      type: ACTION_TYPES.ADD_MEMBER,
      payload: { memberName: name }
    });
    
    // 추가 결과 확인
    const afterState = store.getState();
    const wasAdded = afterState.members.length > members.length;
    
    if (wasAdded) {
      console.log('멤버가 성공적으로 추가되었습니다:', afterState.members);
    } else {
      console.warn('멤버 추가가 처리되지 않았습니다');
    }
    
    // 입력창 초기화 및 포커스
    inputElement.value = '';
    
    // 약간의 지연 후 포커스 (모바일 키보드 문제 방지)
    setTimeout(() => {
      inputElement.focus();
    }, 50);
  }

  /**
   * 요소 흔들기 효과
   */
  shakeElement(element) {
    if (!element) return;
    
    element.classList.remove('shake');
    void element.offsetWidth; // 리플로우 트리거
    element.classList.add('shake');
  }

  /**
   * 컴포넌트 렌더링
   * @returns {string} 렌더링할 HTML
   */
  render() {
    console.time('memberlist-render');
    
    const { members, editingIndex, totalMembers, isTotalConfirmed, isTeamCountConfirmed } = this.state;
    
    // 멤버 목록이 유효한지 확인
    if (!members || !Array.isArray(members)) {
      console.error('MemberList: 멤버 목록이 유효하지 않음', this.state);
      return `<div class="error-message">멤버 목록 데이터가 유효하지 않습니다.</div>`;
    }
    
    // 활성화 조건: 총원 설정 및 팀 구성이 모두 완료되었을 때
    const isInputActive = isTotalConfirmed && isTeamCountConfirmed;
    // 총원 초과 조건
    const isMaxReached = totalMembers > 0 && members.length >= totalMembers;
    
    console.log('MemberList: 입력 필드 상태', { 
      isInputActive, 
      isMaxReached, 
      isTotalConfirmed, 
      isTeamCountConfirmed,
      totalMembers,
      membersCount: members.length
    });

    // 빈 멤버 목록 처리
    let memberListHtml;
    if (members.length === 0) {
      memberListHtml = `
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
    } else {
      // 메모이제이션된 렌더링 함수 사용
      try {
        memberListHtml = this.memoizedRenderMemberList(
          members, 
          editingIndex
        );
        console.log('MemberList: 멤버 렌더링 성공', { memberCount: members.length, editingIndex });
      } catch (error) {
        console.error('MemberList: 멤버 렌더링 실패', error);
        memberListHtml = `<div class="error-message">멤버 목록을 표시하는 중 오류가 발생했습니다.</div>`;
      }
    }
    
    const html = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .member-list-container {
          background-color: var(--color-background-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .member-list-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-background-dark);
          border-bottom: 1px solid var(--color-border);
        }
        
        .member-list-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-light);
          margin: 0;
        }
        
        .member-count {
          background-color: var(--color-primary);
          color: white;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .member-list-content {
          padding: 16px;
          overflow-y: auto;
          flex-grow: 1;
        }
        
        /* 추가: 멤버 입력 부분 스타일 */
        .member-input-container {
          padding: 16px;
          border-top: 1px solid var(--color-border);
          background-color: var(--color-background-dark);
        }
        
        .member-input-wrapper {
          display: flex;
          gap: 8px;
        }
        
        .member-input {
          flex-grow: 1;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-background-light);
          color: var(--color-light);
        }
        
        .member-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
        
        .add-member-button {
          padding: 10px 16px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .add-member-button:hover {
          background-color: var(--color-primary-dark);
        }
        
        .add-member-button:disabled,
        .member-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .member-status-message {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 8px;
          min-height: 18px;
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
        
        /* 기존 스타일 계속 유지 */
        :host {
          display: block;
          width: 100%;
          background-color: #121212;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .member-list-container {
          padding: 16px;
        }
        
        .member-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 12px;
        }
        
        .member-list-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }
        
        .member-count {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          background-color: rgba(255, 255, 255, 0.08);
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .member-list-content {
          min-height: 200px;
        }
        
        .error-message {
          color: #ff5555;
          padding: 12px;
          background-color: rgba(255, 85, 85, 0.1);
          border-radius: 4px;
          border-left: 3px solid #ff5555;
          margin: 12px 0;
          font-size: 14px;
        }

        /* 멤버 목록 스타일 */
        .member-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .member-list-wrapper {
          border-radius: 8px;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
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
          transition: all 0.2s ease;
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
          transition: all 0.2s ease;
        }
        
        .cancel-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .suffix-help {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 8px;
        }
        
        /* 빈 상태 */
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
        
        .edit-button, .delete-button {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
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
        
        /* 애니메이션 효과 */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .member-list-wrapper {
          animation: fadeIn 0.3s ease;
        }
        
        .member-item {
          animation: fadeIn 0.2s ease;
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
    
    console.timeEnd('memberlist-render');
    return html;
  }
} 