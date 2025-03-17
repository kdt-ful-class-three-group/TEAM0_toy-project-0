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
      if (!newSuffix) {
        nameSpan.innerHTML = originalContent;
        return;
      }

      const newName = `${baseName}-${newSuffix}`;
      const isDuplicate = currentState.members.some((m, i) => {
        return i !== index && m === newName;
      });

      if (isDuplicate) {
        console.error("이미 사용 중인 접미사입니다.");
        nameSpan.innerHTML = originalContent;
        return;
      }

      const newMembers = [...currentState.members];
      newMembers[index] = newName;
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