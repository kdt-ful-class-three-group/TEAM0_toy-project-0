import { renderMemberList } from '../renderers/index.js';
import store from '../store/index.js';

/**
 * 멤버 목록 컴포넌트
 * 가운데 영역의 멤버 목록을 표시합니다.
 */
export class MemberList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
    this.initialized = false;
  }

  connectedCallback() {
    if (!this.initialized) {
      // 스타일시트 로드 (최초 1회만)
      const styleSheet = document.createElement('link');
      styleSheet.setAttribute('rel', 'stylesheet');
      styleSheet.setAttribute('href', './css/styles.css');
      this.shadowRoot.appendChild(styleSheet);
      
      // 초기 렌더링
      this.initialRender();
      this.initialized = true;
    }
    
    // store 구독
    this.unsubscribe = store.subscribe((state) => {
      this.updateMembersList(state.members);
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  initialRender() {
    const members = store.getState().members;
    
    // 컨텐츠 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'member-list-container';
    container.innerHTML = renderMemberList(members);
    this.shadowRoot.appendChild(container);
    
    // 이벤트 리스너 등록
    this.addEventListeners();
  }

  updateMembersList(members) {
    const container = this.shadowRoot.querySelector('.member-list-container');
    if (!container) return;
    
    // 기존 상태와 새 상태를 비교하여 변경이 있을 때만 렌더링
    const currentMembers = JSON.stringify(members);
    if (this._lastRenderedMembers === currentMembers) {
      return; // 변경이 없으면 재렌더링 하지 않음
    }
    
    // 컨테이너 내용 업데이트
    container.innerHTML = renderMemberList(members);
    
    // 이벤트 다시 연결
    this.addEventListeners();
    
    // 마지막 렌더링 상태 저장
    this._lastRenderedMembers = currentMembers;
  }

  addEventListeners() {
    const list = this.shadowRoot.querySelector(".member-list");
    if (!list) return;

    list.addEventListener("click", (event) => {
      const { index } = event.target.dataset;
      if (!index) {
        return;
      }
      const parsedIndex = parseInt(index);

      if (event.target.classList.contains("member-item__delete")) {
        console.warn("멤버 삭제 클릭:", parsedIndex);

        const currentState = store.getState();
        const newMembers = [...currentState.members];
        newMembers.splice(parsedIndex, 1);
        store.setState({ members: newMembers });
      }

      if (event.target.classList.contains("member-item__edit")) {
        this.startSuffixEdit(event.target, parsedIndex);
      }
    });
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