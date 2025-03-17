/**
 * @file memberHandlers.js
 * @description 멤버 관리와 관련된 이벤트 핸들링 로직을 담당하는 모듈
 */

import store from '../store/index.js';
import utils from '../utils/index.js';

/**
 * 총원 수 입력을 처리하는 핸들러
 * @param {Event} e - 입력 이벤트
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 */
export const handleTotalInput = (e, showInvalidInput) => {
  const value = e.target.value;
  if (!utils.validateNumber(value)) {
    e.target.value = value.replace(/[^\d]/g, "");
    showInvalidInput(e.target);
    return;
  }

  const numValue = parseInt(e.target.value);
  if (numValue < 1) {
    e.target.value = "";
    showInvalidInput(e.target);
    store.setState({ totalMembers: 0 });
    return;
  }

  e.target.classList.remove("invalid");
  store.setState({ totalMembers: numValue });
};

/**
 * 총원 수 확정을 처리하는 핸들러
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @param {Element} inputEl - 입력 요소
 */
export const confirmTotalMembers = (showInvalidInput, inputEl) => {
  const state = store.getState();
  const value = state.totalMembers;

  if (!utils.validateTotalMembers(value)) {
    if (inputEl) {
      showInvalidInput(inputEl);
    }
    return;
  }

  store.setState({ isTotalConfirmed: true });
};

/**
 * 총원 수 수정을 처리하는 핸들러
 * @returns {boolean} 수정이 성공했는지 여부
 */
export const editTotalMembers = () => {
  const state = store.getState();
  if (state.members.length > 0) {
    if (!confirm("총원을 수정하면 입력된 멤버 목록이 초기화됩니다. 계속하시겠습니까?")) {
      return false;
    }
  }
  
  store.setState({
    members: [],
    isTotalConfirmed: false,
    totalMembers: 0,
  });
  
  return true;
};

/**
 * 새 멤버 추가를 처리하는 핸들러
 * @param {HTMLInputElement} memberInput - 멤버 이름 입력 요소
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @returns {boolean} 추가 성공 여부
 */
export const addMember = (memberInput, showInvalidInput) => {
  if (!memberInput) return false;

  const state = store.getState();
  const name = memberInput.value.trim();

  if (!name) {
    showInvalidInput(memberInput);
    return false;
  }

  // 총원 초과 체크
  if (state.members.length >= state.totalMembers) {
    showInvalidInput(memberInput);
    memberInput.blur();
    return false;
  }

  memberInput.classList.remove("invalid");
  const newName = utils.generateMemberName(name, state.members);
  
  // 상태 업데이트
  const newMembers = [...state.members, newName];
  store.setState({ members: newMembers });
  memberInput.value = "";

  // 포커스 관리
  if (newMembers.length < state.totalMembers) {
    // 즉시 다시 포커스 설정
    memberInput.focus();
  } else {
    // 총원이 모두 채워졌을 때 포커스 제거
    memberInput.blur();
  }
  
  return true;
};

/**
 * 멤버 삭제를 처리하는 핸들러
 * @param {number} index - 삭제할 멤버의 인덱스
 */
export const deleteMember = (index) => {
  const currentState = store.getState();
  const newMembers = [...currentState.members];
  newMembers.splice(index, 1);
  store.setState({ members: newMembers });
};

/**
 * 멤버 이름 수정을 처리하는 핸들러
 * @param {number} index - 수정할 멤버의 인덱스
 * @param {string} newName - 새 이름
 * @returns {boolean} 수정 성공 여부
 */
export const editMemberName = (index, newName) => {
  const currentState = store.getState();
  
  if (!newName.trim()) {
    return false;
  }
  
  // 중복 검사
  const isDuplicate = currentState.members.some((m, i) => {
    return i !== index && m === newName;
  });

  if (isDuplicate) {
    console.error("이미 사용 중인 이름입니다.");
    return false;
  }

  const newMembers = [...currentState.members];
  newMembers[index] = newName;
  store.setState({ members: newMembers });
  
  return true;
}; 