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
  
  // 중복 이름 처리 및 새 멤버 이름 생성
  const newName = utils.generateMemberName(name, state.members);
  
  // generateMemberName에서 첫 번째 중복 멤버의 이름 패턴이 이미 변경되었을 수 있으므로 
  // 최신 상태 가져오기
  const updatedState = store.getState();
  
  // 상태 업데이트
  const newMembers = [...updatedState.members, newName];
  
  // 상태 업데이트 (비동기로 처리하여 DOM 업데이트 보장)
  setTimeout(() => {
    store.setState({ members: newMembers });
  }, 10);
  
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
  const members = [...currentState.members];
  
  // 삭제할 멤버 정보 저장
  const memberToDelete = members[index];
  
  // 멤버 삭제
  members.splice(index, 1);
  
  // 동일한 기본 이름을 가진 멤버 접미사 처리
  if (memberToDelete.includes('-')) {
    const baseName = memberToDelete.split('-')[0];
    
    // 같은 기본 이름을 가진 멤버 찾기
    const sameBaseMembers = members.filter(member => {
      if (member.includes('-')) {
        return member.split('-')[0] === baseName;
      }
      return false;
    });
    
    // 접미사가 -1인 멤버만 남았고 다른 중복된 멤버가 없다면
    if (sameBaseMembers.length === 1) {
      const remainingMemberIndex = members.findIndex(member => 
        member.includes('-') && member.split('-')[0] === baseName
      );
      
      if (remainingMemberIndex !== -1) {
        const remainingMember = members[remainingMemberIndex];
        const suffix = remainingMember.split('-')[1];
        
        // 접미사가 1인 경우, 접미사 제거
        if (suffix === '1') {
          members[remainingMemberIndex] = baseName;
        }
      }
    }
  }
  
  // 상태 업데이트 (비동기로 처리하여 DOM 업데이트 보장)
  setTimeout(() => {
    store.setState({ members });
  }, 0);
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