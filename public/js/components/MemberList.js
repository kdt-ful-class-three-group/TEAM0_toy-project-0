import { BaseComponent } from './BaseComponent.js';
import { renderMemberList } from '../renderers/index.js';
import store from '../store/index.js';
import { memoize } from '../utils/performance.js';

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
      editingIndex: -1
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
      // 멤버 목록이 변경된 경우에만 상태 업데이트
      if (!this.state.members || !Array.isArray(this.state.members) || 
          !Array.isArray(state.members) || 
          this.state.members.length !== state.members.length || 
          JSON.stringify(this.state.members) !== JSON.stringify(state.members)) {
        console.log('MemberList: 멤버 목록 변경 감지, 상태 업데이트');
        this.updateState({ members: [...state.members] });
      }
    });
    
    // 자동 구독 해제를 위해 구독 해제 함수 등록
    this.addUnsubscriber(unsubscribe);
    
    // 초기 상태 설정
    this.updateState({ members: [...store.getState().members] });
    
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
    const members = [...store.getState().members];
    members.splice(index, 1);
    store.dispatch({ type: 'SET_MEMBERS', payload: members });
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
    const members = [...store.getState().members];
    const member = members[index];
    
    if (member) {
      // 멤버 이름 업데이트
      members[index] = {
        ...member,
        suffix: newSuffix
      };
      
      // 스토어 업데이트 및 편집 모드 종료
      store.dispatch({ type: 'SET_MEMBERS', payload: members });
      this.updateState({ editingIndex: -1 });
    }
  }

  /**
   * 컴포넌트 렌더링
   * @returns {string} 렌더링할 HTML
   */
  render() {
    console.time('memberlist-render');
    
    const { members, editingIndex } = this.state;
    
    // 멤버 목록이 유효한지 확인
    if (!members || !Array.isArray(members)) {
      console.error('MemberList: 멤버 목록이 유효하지 않음', this.state);
      return `<div class="error-message">멤버 목록 데이터가 유효하지 않습니다.</div>`;
    }
    
    // 메모이제이션된 렌더링 함수 사용
    let memberListHtml;
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
    
    const html = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: var(--color-background, #2d2d2d);
          border-radius: var(--radius-lg, 8px);
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
          overflow: hidden;
        }
        
        .member-list-container {
          padding: var(--space-4, 1rem);
        }
        
        .member-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4, 1rem);
          border-bottom: 1px solid var(--color-border, #333);
          padding-bottom: var(--space-3, 0.75rem);
        }
        
        .member-list-title {
          font-size: var(--text-xl, 1.25rem);
          font-weight: 600;
          color: var(--color-text, #fff);
        }
        
        .member-count {
          color: var(--color-text-secondary, #b3b3b3);
          font-size: var(--text-sm, 0.875rem);
        }
        
        .member-list-content {
          min-height: 200px;
        }
        
        .error-message {
          color: #ff5555;
          padding: 1rem;
          background-color: rgba(255, 85, 85, 0.1);
          border-radius: 4px;
          border-left: 3px solid #ff5555;
          margin: 1rem 0;
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
          background-color: var(--color-background, #2d2d2d);
        }
        
        .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border, #333);
          transition: background-color 0.2s ease;
        }
        
        .member-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .member-item:last-child {
          border-bottom: none;
        }
        
        .member-item__name {
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text, #fff);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .member-name {
          font-weight: 500;
        }
        
        .member-suffix-numeric {
          color: var(--color-accent, #4f46e5);
          font-weight: 400;
        }
        
        .member-suffix-text {
          color: var(--color-text-secondary, #a1a1aa);
          font-style: italic;
          font-weight: 400;
        }
        
        .member-item__actions {
          display: flex;
          gap: 8px;
        }
        
        /* 편집 모드 */
        .member-item.editing {
          background-color: rgba(79, 70, 229, 0.1);
          padding: 16px;
        }
        
        .edit-container {
          width: 100%;
        }
        
        .suffix-input {
          margin: 0 8px;
          padding: 4px 8px;
          border: 1px solid var(--color-border, #333);
          border-radius: 4px;
          background-color: var(--color-background-light, #3a3a3a);
          color: var(--color-text, #fff);
          font-size: 0.9rem;
        }
        
        .suffix-input:focus {
          outline: none;
          border-color: var(--color-accent, #4f46e5);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
        }
        
        .edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        
        .confirm-button {
          background-color: var(--color-accent, #4f46e5);
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .cancel-button {
          background-color: transparent;
          color: var(--color-text-secondary, #a1a1aa);
          border: 1px solid var(--color-border, #333);
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .suffix-help {
          font-size: 0.8rem;
          color: var(--color-text-tertiary, #717171);
          margin-top: 4px;
        }
        
        /* 빈 상태 */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--color-text-secondary, #a1a1aa);
        }
        
        .empty-state__icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .empty-state__title {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--color-text, #fff);
        }
        
        .empty-state__description {
          color: var(--color-text-tertiary, #717171);
        }
        
        /* 버튼 스타일 */
        .btn {
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          padding: 6px 12px;
          cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
        }
        
        .btn--small {
          font-size: 0.8rem;
          padding: 3px 8px;
        }
        
        .edit-button, .delete-button {
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .edit-button {
          color: var(--color-text-secondary, #a1a1aa);
          background-color: transparent;
          border: 1px solid var(--color-border, #333);
        }
        
        .edit-button:hover {
          opacity: 0.8;
        }
        
        .delete-button {
          color: #fff;
          background-color: #ef4444;
          border: none;
        }
        
        .delete-button:hover {
          opacity: 0.9;
        }
      </style>
      
      <div class="member-list-container">
        <div class="member-list-header">
          <h2 class="member-list-title">멤버 목록</h2>
          <span class="member-count">${members.length}명</span>
        </div>
        
        <div class="member-list-content">
          ${memberListHtml}
        </div>
      </div>
    `;
    
    console.timeEnd('memberlist-render');
    return html;
  }
} 