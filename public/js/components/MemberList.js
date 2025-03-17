import { renderMemberList } from '../renderers/index.js';
import store from '../store/index.js';
import { memoize } from '../utils/performance.js';

/**
 * 멤버 목록 컴포넌트
 * 가운데 영역의 멤버 목록을 표시합니다.
 * @class MemberList
 * @extends HTMLElement
 */
export class MemberList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
    this.initialized = false;
    this._container = null;
    this._lastMembersJSON = '';
    
    // 메모이제이션 적용 - 디버깅 활성화
    this.memoizedRenderMemberList = memoize(renderMemberList, {
      maxSize: 20,
      debug: true
    });
    
    // 멤버 업데이트 함수를 바인딩하여 this 컨텍스트 유지
    this.handleMembersUpdate = this.handleMembersUpdate.bind(this);
  }

  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   */
  connectedCallback() {
    if (!this.initialized) {
      console.time('memberlist-init');
      this.initializeStyles();
      this.initialRender();
      this.initialized = true;
      console.timeEnd('memberlist-init');
    }
    
    // 구독 시작 - 디버깅 로그 추가
    console.log('MemberList: 상태 구독 시작');
    
    // 구독 방법 변경 - 전체 상태를 구독하되 내부에서 members만 추출하여 처리
    this.unsubscribe = store.subscribe((state) => {
      console.log('MemberList: 상태 업데이트 감지', state.members);
      this.handleMembersUpdate(state.members);
    });
  }

  /**
   * 컴포넌트가 DOM에서 제거될 때 호출됩니다.
   */
  disconnectedCallback() {
    console.log('MemberList: 구독 해제');
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * 스타일을 초기화합니다.
   * @private
   */
  initializeStyles() {
    const styleSheet = document.createElement('link');
    styleSheet.setAttribute('rel', 'stylesheet');
    styleSheet.setAttribute('href', './css/styles.css');
    this.shadowRoot.appendChild(styleSheet);
  }

  /**
   * 초기 렌더링을 수행합니다.
   * @private
   */
  initialRender() {
    const members = store.getState().members;
    this._lastMembersJSON = JSON.stringify(members);
    
    // 컨텐츠 컨테이너 생성
    this._container = document.createElement('div');
    this._container.className = 'member-list-container';
    this._container.innerHTML = this.memoizedRenderMemberList(members);
    this.shadowRoot.appendChild(this._container);
    
    // 이벤트 리스너 등록
    this.addEventListeners();
  }

  /**
   * 멤버 목록 상태 업데이트 시 호출되는 핸들러
   * @param {Array} members - 업데이트된 멤버 배열
   */
  handleMembersUpdate(members) {
    console.time('members-update');
    console.log('MemberList: 멤버 업데이트 처리', members);
    
    // 이전 상태와 비교하기 위한 JSON 문자열
    const newMembersJSON = JSON.stringify(members);
    
    // 상태가 실제로 변경되었는지 확인
    if (this._lastMembersJSON !== newMembersJSON) {
      console.log('MemberList: 멤버 변경 감지, DOM 업데이트 진행');
      this._lastMembersJSON = newMembersJSON;
      this.updateMembersList(members);
    } else {
      console.log('MemberList: 멤버 변경 없음, 업데이트 건너뜀');
    }
    
    console.timeEnd('members-update');
  }

  /**
   * 멤버 목록을 업데이트합니다.
   * @param {Array} members - 업데이트할 멤버 배열
   */
  updateMembersList(members) {
    if (!this._container) return;
    
    // 멤버 목록 렌더링 (메모이제이션 사용)
    try {
      const newContent = this.memoizedRenderMemberList(members);
      
      // DOM 업데이트 적용
      this._container.innerHTML = newContent;
      this.addEventListeners();
    } catch (error) {
      console.error('멤버 목록 렌더링 중 오류:', error);
    }
  }

  /**
   * 이벤트 리스너를 등록합니다.
   * @private
   */
  addEventListeners() {
    const list = this.shadowRoot.querySelector(".member-list");
    if (!list) return;

    // 이벤트 위임 패턴 적용
    list.addEventListener("click", this.handleListClick.bind(this));
  }

  /**
   * 리스트 클릭 이벤트 핸들러
   * @param {Event} event - 클릭 이벤트
   * @private
   */
  handleListClick(event) {
    const target = event.target;
    const index = target.dataset.index;
    
    if (!index) return;
    
    const parsedIndex = parseInt(index);
    
    if (target.classList.contains("member-item__delete")) {
      this.handleMemberDelete(parsedIndex);
    } else if (target.classList.contains("member-item__edit")) {
      this.startSuffixEdit(target, parsedIndex);
    }
  }

  /**
   * 멤버 삭제 핸들러
   * @param {number} index - 삭제할 멤버의 인덱스
   * @private
   */
  handleMemberDelete(index) {
    console.warn("멤버 삭제 클릭:", index);
    
    const currentState = store.getState();
    const newMembers = [...currentState.members];
    newMembers.splice(index, 1);
    store.setState({ members: newMembers });
  }

  startSuffixEdit(button, index) {
    const currentState = store.getState();
    const name = currentState.members[index];
    
    // 이름과 접미사 분리 (접미사가 있을 경우)
    let baseName = name;
    let currentSuffix = "";
    
    if (name.includes("-")) {
      const parts = name.split("-");
      baseName = parts[0];
      currentSuffix = parts[1] || "";
    }

    const nameSpan = button.closest(".member-item__name");
    const editMode = document.createElement("span");
    editMode.className = "edit-mode";
    
    editMode.innerHTML = `
      <span>${baseName}-</span>
      <input type="text" class="input suffix-input" value="${currentSuffix}" placeholder="특징 또는 숫자">
      <button class="btn btn--small confirm-suffix">확정</button>
      <div class="suffix-help">숫자 또는 텍스트(예: 안경쓴, 키큰)를 입력하세요</div>
    `;

    const originalContent = nameSpan.innerHTML;
    nameSpan.innerHTML = "";
    nameSpan.appendChild(editMode);

    const input = editMode.querySelector(".suffix-input");
    const confirmBtn = editMode.querySelector(".confirm-suffix");

    // 멤버 이름 업데이트 함수
    const updateMemberName = (newSuffix, newMembers = null) => {
      // 새 멤버 목록이 제공되지 않은 경우 현재 상태에서 복사
      newMembers = newMembers || [...currentState.members];
      
      // 이름 설정 (접미사 있는 경우와 없는 경우)
      if (newSuffix) {
        newMembers[index] = `${baseName}-${newSuffix}`;
      } else {
        newMembers[index] = baseName;
      }
      
      // 상태 업데이트 (비동기로 처리하여 DOM 업데이트 보장)
      setTimeout(() => {
        store.setState({ members: newMembers });
      }, 0);
    };

    const handleConfirm = () => {
      const newSuffix = input.value.trim();
      
      // 현재 멤버 목록 가져오기
      const members = [...currentState.members];
      
      // 접미사가 비어있는 경우 - 기본 이름으로 돌아가려는 시도
      if (!newSuffix) {
        // 동일한 기본 이름을 가진 다른 멤버가 있는지 확인
        const sameBaseNames = members.filter((member, idx) => {
          if (idx === index) return false; // 현재 멤버는 제외
          
          // 다른 멤버의 기본 이름 추출
          let otherBaseName = member;
          if (member.includes('-')) {
            otherBaseName = member.split('-')[0];
          }
          
          return otherBaseName === baseName;
        });
        
        // 동일한 기본 이름을 가진 멤버가 없으면 접미사 제거 가능
        if (sameBaseNames.length === 0) {
          updateMemberName("", members);
          return;
        } else {
          // 동일한 기본 이름이 있으면 접미사 제거 불가
          console.error("동일한 이름이 이미 존재하여 접미사를 제거할 수 없습니다.");
          nameSpan.innerHTML = originalContent;
          return;
        }
      }

      // 문자열 접미사 유효성 검사 (특수문자 제한)
      if (/^[\u0000-\u001F\u007F-\u009F]/.test(newSuffix)) {
        console.error("접미사에 특수문자는 사용할 수 없습니다.");
        nameSpan.innerHTML = originalContent;
        return;
      }

      // 접미사가 있는 경우 - 새 이름 생성
      const newName = `${baseName}-${newSuffix}`;
      
      // 중복 체크
      const isDuplicate = members.some((m, i) => {
        return i !== index && m === newName;
      });

      if (isDuplicate) {
        console.error("이미 사용 중인 접미사입니다.");
        nameSpan.innerHTML = originalContent;
        return;
      }

      // 새 멤버 목록 생성
      const newMembers = [...members];
      
      // 같은 기본 이름을 가진 다른 멤버 확인 (숫자 접미사의 경우만 처리)
      if (!isNaN(newSuffix) && newSuffix === "1") {
        const sameBaseMembers = newMembers.filter((member, idx) => {
          if (idx === index) return false; // 현재 멤버는 제외
          
          // 기본 이름이 같은 멤버 찾기
          let otherBaseName = member;
          if (member.includes('-')) {
            otherBaseName = member.split('-')[0];
          }
          
          return otherBaseName === baseName;
        });
        
        // 현재 수정하는 멤버가 -1을 사용하고 다른 멤버가 없다면 접미사 제거
        if (sameBaseMembers.length === 0) {
          updateMemberName("", newMembers);
          return;
        }
      }
      
      // 일반적인 업데이트
      updateMemberName(newSuffix, newMembers);
    };

    // 확정 버튼 클릭 이벤트
    confirmBtn.addEventListener("click", () => {
      handleConfirm();
    });

    // 키 이벤트 처리 개선
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // 기본 동작 방지
        handleConfirm();
      }
      
      // ESC 키로 취소
      if (e.key === "Escape") {
        nameSpan.innerHTML = originalContent;
      }
    });

    // 포커스 벗어날 때 처리
    input.addEventListener("blur", (e) => {
      // 확정 버튼 클릭이 아닌 경우만 취소 처리
      if (e.relatedTarget !== confirmBtn) {
        setTimeout(() => {
          if (!nameSpan.contains(document.activeElement)) {
            nameSpan.innerHTML = originalContent;
          }
        }, 100);
      }
    });

    // 입력 필드에 포커스
    input.focus();
  }
} 