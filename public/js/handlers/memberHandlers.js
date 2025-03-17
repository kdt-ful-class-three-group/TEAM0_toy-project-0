/**
 * @file memberHandlers.js
 * @description 멤버 관리와 관련된 이벤트 핸들링 로직을 담당하는 모듈
 */

import store, { actionCreators } from '../store/index.js';
import { validateNumber, validateTotalMembers } from '../utils/validation.js';
import { canAddMore, generateMemberName } from '../utils/memberUtils.js';
import { ValidationError, handleError, showUIError } from '../utils/errorHandler.js';
import { createErrorLogger } from '../utils/errorHandler.js';

const logger = createErrorLogger('memberHandlers');

/**
 * 총원 수 입력을 처리하는 핸들러
 * @param {Event} e - 입력 이벤트
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 */
export const handleTotalInput = (e, showInvalidInput) => {
  const value = e.target.value;
  if (!validateNumber(value)) {
    e.target.value = value.replace(/[^\d]/g, "");
    showUIError(e.target, '숫자만 입력할 수 있습니다.');
    return;
  }

  const numValue = parseInt(e.target.value);
  if (numValue < 1) {
    e.target.value = "";
    showUIError(e.target, '1 이상의 숫자를 입력하세요.');
    store.dispatch(actionCreators.setTotalMembers(0));
    return;
  }

  e.target.classList.remove("invalid");
  store.dispatch(actionCreators.setTotalMembers(numValue));
};

/**
 * 총원 수 확정을 처리하는 핸들러
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @param {Element} inputEl - 입력 요소
 */
export const confirmTotalMembers = (showInvalidInput, inputEl) => {
  const state = store.getState();
  const value = state.totalMembers;

  if (!validateTotalMembers(value)) {
    if (inputEl) {
      const error = new ValidationError('유효한 총원 수를 입력하세요.', { value });
      handleError(error, () => showUIError(inputEl, '유효한 총원 수를 입력하세요.'));
    }
    return;
  }

  store.dispatch(actionCreators.confirmTotalMembers());
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
  
  store.dispatch(actionCreators.resetTotalMembers());
  
  return true;
};

/**
 * 새 멤버 추가를 처리하는 핸들러
 * @param {HTMLInputElement} memberInput - 멤버 이름 입력 요소
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @returns {boolean} 추가 성공 여부
 */
export const addMember = (memberInput, showInvalidInput) => {
  console.time('addMember');
  if (!memberInput) {
    console.timeEnd('addMember');
    return false;
  }

  const state = store.getState();
  const name = memberInput.value.trim();

  if (!name) {
    showUIError(memberInput, '멤버 이름을 입력하세요.');
    console.timeEnd('addMember');
    return false;
  }

  // 총원 초과 체크
  if (!canAddMore(state)) {
    showUIError(memberInput, '더 이상 멤버를 추가할 수 없습니다.');
    memberInput.blur();
    console.timeEnd('addMember');
    return false;
  }

  memberInput.classList.remove("invalid");
  
  // 멤버 추가 액션 디스패치
  try {
    console.log('멤버 추가 시작:', name);
    
    store.dispatch(actionCreators.addMember(name));
    console.log('멤버 추가됨:', name, '현재 멤버:', store.getState().members);
    logger.info('멤버 추가됨', { name });
    
    memberInput.value = "";

    // 포커스 관리
    if (state.members.length < state.totalMembers - 1) {
      // 즉시 다시 포커스 설정
      memberInput.focus();
    } else {
      // 총원이 모두 채워졌을 때 포커스 제거
      memberInput.blur();
    }
    
    console.timeEnd('addMember');
    return true;
  } catch (error) {
    handleError(error, () => {
      showUIError(memberInput, '멤버 추가 중 오류가 발생했습니다.');
    });
    console.timeEnd('addMember');
    return false;
  }
};

/**
 * 멤버 삭제를 처리하는 핸들러
 * @param {number} index - 삭제할 멤버의 인덱스
 */
export const deleteMember = (index) => {
  // 비동기로 처리하여 DOM 업데이트 보장
  setTimeout(() => {
    store.dispatch(actionCreators.deleteMember(index));
    logger.info('멤버 삭제됨', { index });
  }, 0);
};

/**
 * 멤버 이름 수정을 처리하는 핸들러
 * @param {number} index - 수정할 멤버의 인덱스
 * @param {string} newName - 새 이름
 * @returns {boolean} 수정 성공 여부
 */
export const editMemberName = (index, newName) => {
  if (!newName.trim()) {
    logger.warn('빈 멤버 이름으로 수정 시도', { index });
    return false;
  }
  
  // 액션 디스패치
  try {
    store.dispatch(actionCreators.editMember(index, newName.trim()));
    logger.info('멤버 이름 수정됨', { index, newName });
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}; 