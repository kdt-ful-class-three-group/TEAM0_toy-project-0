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
  }

  connectedCallback() {
    this.renderComponent();
    // store 구독
    this.unsubscribe = store.subscribe((state) => {
      this.renderComponent(state.members);
    });
    this.addEventListeners();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  renderComponent(members = store.getState().members) {
    this.shadowRoot.innerHTML = renderMemberList(members);
    this.addEventListeners(); // render 후에 이벤트 바인딩
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

      if (event.target.classList.contains("delete-member")) {
        // breakpoint #4 (멤버 삭제 시점)
        console.warn("멤버 삭제 클릭:", parsedIndex);

        const currentState = store.getState();
        const newMembers = [...currentState.members];
        newMembers.splice(parsedIndex, 1);
        store.setState({ members: newMembers });
      }

      if (event.target.classList.contains("edit-suffix")) {
        this.startSuffixEdit(event.target, parsedIndex);
      }
    });
  }

  startSuffixEdit(button, index) {
    const currentState = store.getState();
    const name = currentState.members[index];
    const [baseName, currentSuffix] = name.split("-");

    const nameSpan = button.closest(".member-name");
    const editMode = document.createElement("span");
    editMode.className = "edit-mode";
    editMode.innerHTML = `
      <input type="text" class="suffix-input" value="${currentSuffix || ""}" placeholder="접미사 입력">
      <button class="btn btn-primary confirm-suffix">확정</button>
    `;

    const originalContent = nameSpan.innerHTML;
    nameSpan.innerHTML = `${baseName}-`;
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
        alert("이미 사용 중인 접미사입니다.");
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