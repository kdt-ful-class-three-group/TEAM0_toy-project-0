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
    
    // 컨테이너 내용 업데이트
    container.innerHTML = renderMemberList(members);
    
    // 이벤트 다시 연결
    this.addEventListeners();
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
      <input type="text" class="input suffix-input" value="${currentSuffix}" placeholder="접미사 입력">
      <button class="btn btn--small confirm-suffix">확정</button>
    `;

    const originalContent = nameSpan.innerHTML;
    nameSpan.innerHTML = "";
    nameSpan.appendChild(editMode);

    const input = editMode.querySelector(".suffix-input");
    const confirmBtn = editMode.querySelector(".confirm-suffix");

    const handleConfirm = () => {
      const newSuffix = input.value.trim();
      
      // 중복 체크를 위해 현재 멤버 목록 가져오기
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
          const newMembers = [...members];
          newMembers[index] = baseName; // 접미사 제거
          store.setState({ members: newMembers });
          return;
        } else {
          // 동일한 기본 이름이 있으면 접미사 제거 불가
          console.error("동일한 이름이 이미 존재하여 접미사를 제거할 수 없습니다.");
          nameSpan.innerHTML = originalContent;
          return;
        }
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

      // 새 이름으로 업데이트
      const newMembers = [...members];
      newMembers[index] = newName;
      
      // 같은 기본 이름을 가진 멤버가 하나만 남았다면 접미사 제거
      if (newSuffix === "1") {
        const sameBaseWithSuffix = newMembers.filter((member, idx) => {
          if (idx === index) return false; // 현재 멤버는 제외
          return member.startsWith(`${baseName}-`);
        });
        
        if (sameBaseWithSuffix.length === 0) {
          // 혼자만 접미사를 가지고 있다면 제거 가능
          newMembers[index] = baseName;
        }
      }
      
      store.setState({ members: newMembers });
    };

    confirmBtn.addEventListener("click", () => {
      return handleConfirm();
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        return handleConfirm();
      }
    });

    input.addEventListener("blur", (e) => {
      if (e.relatedTarget !== confirmBtn) {
        nameSpan.innerHTML = originalContent;
      }
    });

    input.focus();
  }
} 