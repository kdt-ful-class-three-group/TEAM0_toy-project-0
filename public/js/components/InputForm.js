import { renderInputForm } from '../renderers/index.js';
import store from '../store/index.js';
import utils from '../utils/index.js';

/**
 * 입력 폼 컴포넌트
 * 오른쪽 영역의 입력 폼을 표시합니다.
 */
export class InputForm extends HTMLElement {
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
    
    // 상태 구독 설정
    this.unsubscribe = store.subscribe((state) => {
      this.updateFromState(state);
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  initialRender() {
    const state = store.getState();
    
    // 컨텐츠 컨테이너 추가
    const container = document.createElement('div');
    container.className = 'input-form-container';
    container.innerHTML = renderInputForm(state);
    this.shadowRoot.appendChild(container);
    
    // 이벤트 리스너 등록 (최초 1회)
    this.addEventListeners();
    
    // 메시지 업데이트
    this.updateStatusMessage(state);
  }

  updateFromState(state) {
    // 특정 요소들만 업데이트하여 전체 DOM 리렌더링 방지
    const root = this.shadowRoot;
    
    // 팀 카운트 관련 업데이트
    const teamCountInput = root.querySelector('.team-count-input');
    if (teamCountInput) {
      teamCountInput.value = state.teamCount || '';
      teamCountInput.disabled = state.isTeamCountConfirmed;
    }
    
    const confirmTeamBtn = root.querySelector('.confirm-team-count');
    const editTeamBtn = root.querySelector('.edit-team-count');
    if (confirmTeamBtn && editTeamBtn) {
      confirmTeamBtn.style.display = state.isTeamCountConfirmed ? 'none' : '';
      editTeamBtn.style.display = !state.isTeamCountConfirmed ? 'none' : '';
    }
    
    // 총원 설정 관련 업데이트
    const totalInput = root.querySelector('.number-input');
    if (totalInput) {
      totalInput.value = state.totalMembers || '';
      totalInput.disabled = state.isTotalConfirmed;
    }
    
    const confirmTotalBtn = root.querySelector('.confirm-total');
    const editTotalBtn = root.querySelector('.edit-total');
    if (confirmTotalBtn && editTotalBtn) {
      confirmTotalBtn.style.display = state.isTotalConfirmed ? 'none' : '';
      editTotalBtn.style.display = !state.isTotalConfirmed ? 'none' : '';
    }
    
    // 멤버 입력 관련 업데이트
    const memberInput = root.querySelector('.member-input');
    const addMemberBtn = root.querySelector('.add-member');
    if (memberInput && addMemberBtn) {
      const canAdd = utils.canAddMore(state);
      memberInput.disabled = !canAdd;
      addMemberBtn.disabled = !canAdd;
    }
    
    // 상태 메시지 업데이트
    this.updateStatusMessage(state);
  }

  addEventListeners() {
    const shadow = this.shadowRoot;
    
    // 팀 구성 관련 요소
    const teamCountInput = shadow.querySelector(".team-count-input");
    const confirmTeamCountBtn = shadow.querySelector(".confirm-team-count");
    const editTeamCountBtn = shadow.querySelector(".edit-team-count");

    // 총원 설정 관련 요소
    const totalInput = shadow.querySelector(".number-input");
    const confirmTotalBtn = shadow.querySelector(".confirm-total");
    const editTotalBtn = shadow.querySelector(".edit-total");

    // 멤버 추가 관련 요소
    const memberInput = shadow.querySelector(".member-input");
    const addMemberBtn = shadow.querySelector(".add-member");

    // 팀 구성 이벤트
    if (teamCountInput) {
      teamCountInput.addEventListener("input", (e) => this.handleTeamCountInput(e));
      teamCountInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.confirmTeamCount();
        }
      });
    }

    if (confirmTeamCountBtn) {
      confirmTeamCountBtn.addEventListener("click", () => this.confirmTeamCount());
    }

    if (editTeamCountBtn) {
      editTeamCountBtn.addEventListener("click", () => this.editTeamCount());
    }

    // 총원 설정 이벤트
    if (totalInput) {
      totalInput.addEventListener("input", (e) => this.handleTotalInput(e));
      totalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.confirmTotalMembers();
        }
      });
    }

    if (confirmTotalBtn) {
      confirmTotalBtn.addEventListener("click", () => this.confirmTotalMembers());
    }

    if (editTotalBtn) {
      editTotalBtn.addEventListener("click", () => this.editTotalMembers());
    }

    // 멤버 추가 이벤트
    if (memberInput) {
      memberInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addMember(memberInput);
        }
      });
    }

    if (addMemberBtn) {
      addMemberBtn.addEventListener("click", () => {
        const input = shadow.querySelector(".member-input");
        if (input) {
          this.addMember(input);
        }
      });
    }
  }

  handleTeamCountInput(e) {
    const value = e.target.value;
    if (!utils.validateNumber(value)) {
      e.target.value = value.replace(/[^\d]/g, "");
      this.showInvalidInput(e.target);
      return;
    }

    const numValue = parseInt(value);
    if (numValue < 1) {
      e.target.value = "";
      this.showInvalidInput(e.target);
      store.setState({ teamCount: 0 });
      return;
    }

    e.target.classList.remove("invalid");
    store.setState({ teamCount: numValue });
  }

  confirmTeamCount() {
    const state = store.getState();
    const value = state.teamCount;

    if (!utils.validateTeamCount(value)) {
      const inputEl = this.shadowRoot.querySelector(".team-count-input");
      if (inputEl) {
        this.showInvalidInput(inputEl);
      }
      return;
    }

    store.setState({ isTeamCountConfirmed: true });
  }

  editTeamCount() {
    store.setState({
      teamCount: 0,
      isTeamCountConfirmed: false
    });
  }

  handleTotalInput(e) {
    const value = e.target.value;
    if (!utils.validateNumber(value)) {
      e.target.value = value.replace(/[^\d]/g, "");
      this.showInvalidInput(e.target);
      return;
    }

    const numValue = parseInt(e.target.value);
    if (numValue < 1) {
      e.target.value = "";
      this.showInvalidInput(e.target);
      store.setState({ totalMembers: 0 });
      return;
    }

    e.target.classList.remove("invalid");
    store.setState({ totalMembers: numValue });
  }

  confirmTotalMembers() {
    const state = store.getState();
    const value = state.totalMembers;

    if (!utils.validateTotalMembers(value)) {
      const inputEl = this.shadowRoot.querySelector(".number-input");
      if (inputEl) {
        this.showInvalidInput(inputEl);
      }
      return;
    }

    store.setState({ isTotalConfirmed: true });
  }

  editTotalMembers() {
    const state = store.getState();
    if (state.members.length > 0) {
      if (!confirm("총원을 수정하면 입력된 멤버 목록이 초기화됩니다. 계속하시겠습니까?")) {
        return;
      }
    }
    store.setState({
      members: [],
      isTotalConfirmed: false,
      totalMembers: 0,
    });
  }

  addMember(memberInput) {
    if (!memberInput) return;

    const state = store.getState();
    const name = memberInput.value.trim();

    if (!name) {
      this.showInvalidInput(memberInput);
      return;
    }

    // 총원 초과 체크
    if (state.members.length >= state.totalMembers) {
      this.showInvalidInput(memberInput);
      memberInput.blur();
      return;
    }

    memberInput.classList.remove("invalid");
    const newName = utils.generateMemberName(name, state.members);
    
    // 상태 업데이트
    const newMembers = [...state.members, newName];
    store.setState({ members: newMembers });
    memberInput.value = "";

    // 포커스 관리 개선 - 즉시 포커스 설정
    if (newMembers.length < state.totalMembers) {
      // 즉시 다시 포커스 설정
      memberInput.focus();
    } else {
      // 총원이 모두 채워졌을 때 포커스 제거
      memberInput.blur();
    }
  }

  showInvalidInput(element) {
    element.classList.add("invalid");
    element.classList.remove("shake");
    void element.offsetWidth; // reflow
    element.classList.add("shake");
  }

  updateStatusMessage(state) {
    const teamStatusMessage = this.shadowRoot.querySelector(".team-status-message");
    const totalStatusMessage = this.shadowRoot.querySelector(".total-status-message");

    if (teamStatusMessage) {
      if (!state.isTeamCountConfirmed) {
        teamStatusMessage.textContent = "팀 개수를 입력하고 완료 버튼을 클릭하거나 엔터를 눌러주세요.";
      } else {
        teamStatusMessage.textContent = `${state.teamCount}개의 팀으로 구성됩니다.`;
      }
    }

    if (totalStatusMessage) {
      if (!state.isTotalConfirmed) {
        totalStatusMessage.textContent = "총원을 입력하고 완료 버튼을 클릭하거나 엔터를 눌러주세요.";
        return;
      }

      if (state.totalMembers === 0) {
        totalStatusMessage.textContent = "총원을 입력해주세요.";
        return;
      }

      const remaining = state.totalMembers - state.members.length;
      if (remaining > 0) {
        totalStatusMessage.textContent = `${state.totalMembers}명 중 ${state.members.length}명 작성됨 (${remaining}명 남음)`;
      } else if (remaining === 0) {
        totalStatusMessage.textContent = `${state.totalMembers}명 모두 작성 완료!`;
      } else {
        totalStatusMessage.textContent = `설정된 총원(${state.totalMembers}명)을 초과했습니다!`;
      }
    }
  }
} 