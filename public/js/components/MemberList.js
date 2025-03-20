import { BaseComponent } from './BaseComponent.js';
import { renderMemberList } from '../renderers/index.js';
import store, { actionCreators } from '../store/index.js';
import { memoize } from '../utils/performance.js';
import { ACTION_TYPES } from '../store/actions.js';
import { showUIError } from '../handlers/uiHandlers.js';
import { initMemberListMVC } from '../mvc/index.js';

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
    
    // MVC 객체 참조 초기화
    this._mvc = null;
    
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
   * 컴포넌트 초기화
   * @override
   */
  initialize() {
    console.time('memberlist-init');
    console.log('MemberList: 초기화 시작');
    
    // 초기 렌더링 - 스타일 추가 및 로딩 컨테이너 생성
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          color: #ffffff;
        }
        
        .member-list-container-wrapper {
          background-color: #121212;
          border-radius: 8px;
          overflow: hidden;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          position: relative;
          padding-left: 30px;
          flex-grow: 1;
        }
        
        .loading-indicator::before {
          content: '';
          position: absolute;
          left: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #4a6e5a;
          animation: spinner 0.8s linear infinite;
        }
        
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          color: #ff5555;
          padding: 12px;
          background-color: rgba(255, 85, 85, 0.1);
          border-radius: 4px;
          border-left: 3px solid #ff5555;
          margin: 12px;
          font-size: 14px;
        }
      </style>
      
      <div id="member-list-container" class="member-list-container-wrapper">
        <div class="loading-indicator">
          멤버 목록을 불러오는 중...
        </div>
      </div>
    `;
    
    // 스토어 구독 설정 - 초기화 단계에서 설정
    const storeUnsubscribe = store.subscribe((state) => {
      if (!this._mvc) {
        // MVC가 초기화되기 전에도 상태 업데이트
        this.updateState({
          members: [...state.members],
          totalMembers: state.totalMembers,
          isTotalConfirmed: state.isTotalConfirmed,
          isTeamCountConfirmed: state.isTeamCountConfirmed
        });
      }
    });
    
    // 구독 해제 등록
    this.addUnsubscriber(storeUnsubscribe);
    
    // 초기 스토어 상태 가져오기
    const storeState = store.getState();
    this.state = {
      members: [...storeState.members],
      totalMembers: storeState.totalMembers,
      isTotalConfirmed: storeState.isTotalConfirmed,
      isTeamCountConfirmed: storeState.isTeamCountConfirmed,
      editingIndex: -1,
      isComposing: false
    };
    
    // DOM이 완전히 로드된 후 MVC 초기화 (약간 지연)
    setTimeout(() => {
      this._initMVC();
    }, 100);
    
    console.timeEnd('memberlist-init');
  }
  
  /**
   * MVC 패턴 초기화
   * @private
   */
  _initMVC() {
    try {
      console.log('MemberList: MVC 초기화 시작');
      const container = this.shadowRoot.getElementById('member-list-container');
      
      if (!container) {
        console.error('MemberList: 컨테이너 요소를 찾을 수 없습니다');
        this.shadowRoot.innerHTML = `
          <div class="error-message">
            멤버 목록 컨테이너를 찾을 수 없습니다.
          </div>
        `;
        return;
      }
      
      // 로딩 인디케이터 표시
      container.innerHTML = `
        <div class="loading-indicator">
          멤버 목록을 초기화하는 중...
        </div>
      `;
      
      // MVC 패턴으로 초기화 - 약간 지연
      setTimeout(() => {
        try {
          this._mvc = initMemberListMVC(container);
          console.log('MemberList: MVC 초기화 완료');
        } catch (error) {
          console.error('MemberList: MVC 객체 생성 중 오류 발생', error);
          container.innerHTML = `
            <div class="error-message">
              멤버 목록을 초기화하는 중 오류가 발생했습니다.<br>
              ${error.message || '알 수 없는 오류'}
            </div>
          `;
        }
      }, 100);
    } catch (error) {
      console.error('MemberList: MVC 초기화 중 오류 발생', error);
      this.shadowRoot.innerHTML = `
        <div class="error-message">
          멤버 목록을 로드하는 중 오류가 발생했습니다.<br>
          ${error.message || '알 수 없는 오류'}
        </div>
      `;
    }
  }
  
  /**
   * 컴포넌트 정리 - 메모리 누수 방지
   * @override
   */
  cleanup() {
    if (this._mvc && typeof this._mvc.dispose === 'function') {
      this._mvc.dispose();
      this._mvc = null;
    }
  }
  
  /**
   * 컴포넌트 렌더링 - MVC 패턴에서는 사용하지 않음
   * @override
   */
  render() {
    // 초기 렌더링만 수행하고, 그 이후는 MVC가 처리
    if (!this._mvc) {
      return `
        <div id="member-list-container" class="member-list-container-wrapper">
          <div class="loading-indicator">
            멤버 목록을 불러오는 중...
          </div>
        </div>
      `;
    }
    
    // 이미 MVC가 초기화된 경우 현재 DOM 유지
    return this.shadowRoot.innerHTML;
  }

  /**
   * 강제 업데이트 메서드 (Shadow DOM 갱신)
   */
  forceUpdate() {
    console.log('MemberList: 강제 업데이트 실행');
    if (this.shadowRoot) {
      const html = this.render();
      const container = this.shadowRoot.querySelector('.member-list-container');
      if (container) {
        // 기존 컨테이너 내용을 새 HTML로 업데이트
        container.innerHTML = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newContainer = tempDiv.querySelector('.member-list-container');
        if (newContainer) {
          while (newContainer.firstChild) {
            container.appendChild(newContainer.firstChild);
          }
        } else {
          // 전체 shadow DOM 업데이트
          this.shadowRoot.innerHTML = html;
        }
        // 이벤트 리스너 재설정
        this.addEventListeners();
        console.log('MemberList: 강제 업데이트 완료');
      } else {
        // 전체 shadow DOM 업데이트
        this.shadowRoot.innerHTML = html;
        console.log('MemberList: 전체 Shadow DOM 업데이트 완료');
      }
      
      // afterRender 호출
      if (typeof this.afterRender === 'function') {
        this.afterRender();
      }
    }
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
            (e) => {
              e.preventDefault(); // 폼 제출 방지
              console.log('추가 버튼 클릭됨, 조합 상태:', isComposing);
              if (!isComposing && memberInput.value.trim()) {
                this.handleAddMember(memberInput);
              }
            }
          );
          
          console.log('MemberList: 멤버 추가 이벤트 리스너 등록 완료');
        } else {
          console.warn('MemberList: 멤버 추가 버튼 또는 입력 필드를 찾을 수 없습니다');
          console.log('버튼 찾기 결과:', addButton);
          console.log('입력 필드 찾기 결과:', memberInput);
          console.log('DOM 구조:', this.shadowRoot.innerHTML);
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
    // 스토어 액션 디스패치 - 멤버 삭제
    store.dispatch({
      type: ACTION_TYPES.DELETE_MEMBER,
      payload: { index }
    });
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
   * 렌더링 후 호출되는 콜백
   */
  afterRender() {
    console.log('MemberList: afterRender 실행');
    
    // 멤버 입력 필드와 버튼 확인
    const addButton = this.shadowRoot.querySelector('.add-member-button');
    const memberInput = this.shadowRoot.querySelector('.member-input');
    
    if (addButton && memberInput) {
      console.log('MemberList: 멤버 추가 UI 요소 확인됨');
    }
    
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
    // 공백 제거 및 유효성 검사
    const trimmedSuffix = newSuffix.trim();
    
    if (!trimmedSuffix) {
      showUIError('멤버 이름을 입력해주세요.');
      return false;
    }
    
    const memberName = `멤버 ${trimmedSuffix}`;
    
    // 기존 멤버 확인
    const existingMemberIndex = this.state.members.findIndex((name, i) => 
      i !== index && name === memberName
    );
    
    if (existingMemberIndex !== -1) {
      showUIError(`이미 같은 이름의 멤버가 있습니다: ${memberName}`);
      return false;
    }
    
    // 스토어 액션 디스패치 - 멤버 이름 변경
    store.dispatch({
      type: ACTION_TYPES.EDIT_MEMBER,
      payload: {
        index,
        newName: memberName
      }
    });
    
    // 편집 모드 종료
    this.cancelEdit();
    return true;
  }

  /**
   * 멤버 추가 처리
   */
  handleAddMember(inputElement) {
    // 입력값 가져오기
    const memberName = inputElement.value.trim();
    
    // 유효성 검사
    if (!memberName) {
      inputElement.focus();
      this.shakeElement(inputElement);
      showUIError('멤버 이름을 입력해주세요.');
      return;
    }
    
    // 멤버 이름 일관성 확인 - "멤버" 접두사 확인
    const formattedName = memberName.startsWith('멤버 ') ? memberName : `멤버 ${memberName}`;
    
    // 중복 체크
    if (this.state.members.includes(formattedName)) {
      inputElement.focus();
      this.shakeElement(inputElement);
      showUIError(`이미 존재하는 멤버 이름입니다: ${formattedName}`);
      return;
    }
    
    // 총원 제한 체크
    if (this.state.isTotalConfirmed && this.state.members.length >= this.state.totalMembers) {
      inputElement.focus();
      this.shakeElement(inputElement);
      showUIError(`최대 ${this.state.totalMembers}명까지만 추가할 수 있습니다.`);
      return;
    }
    
    // 스토어 액션 디스패치 - 멤버 추가
    store.dispatch({
      type: ACTION_TYPES.ADD_MEMBER,
      payload: {
        memberName: formattedName
      }
    });
    
    // 입력 필드 초기화
    inputElement.value = '';
    inputElement.focus();
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
} 