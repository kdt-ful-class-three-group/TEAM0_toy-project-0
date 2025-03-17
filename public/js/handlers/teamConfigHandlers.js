/**
 * @file teamConfigHandlers.js
 * @description 팀 구성과 관련된 이벤트 핸들링 로직을 담당하는 모듈
 */

import store, { actionCreators } from '../store/index.js';
import utils from '../utils/index.js';

/**
 * 팀 수 입력을 처리하는 핸들러
 * @param {Event} e - 입력 이벤트
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 */
export const handleTeamCountInput = (e, showInvalidInput) => {
  const value = e.target.value;
  if (!utils.validateNumber(value)) {
    e.target.value = value.replace(/[^\d]/g, "");
    showInvalidInput(e.target);
    return;
  }

  const numValue = parseInt(value);
  if (numValue < 1) {
    e.target.value = "";
    showInvalidInput(e.target);
    store.dispatch(actionCreators.setTeamCount(0));
    return;
  }

  e.target.classList.remove("invalid");
  store.dispatch(actionCreators.setTeamCount(numValue));
};

/**
 * 팀 수 확정을 처리하는 핸들러
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @param {Element} inputEl - 입력 요소
 */
export const confirmTeamCount = (showInvalidInput, inputEl) => {
  const state = store.getState();
  const value = state.teamCount;

  if (!utils.validateTeamCount(value)) {
    if (inputEl) {
      showInvalidInput(inputEl);
    }
    return;
  }

  store.dispatch(actionCreators.confirmTeamCount());
};

/**
 * 팀 수 수정을 처리하는 핸들러
 */
export const editTeamCount = () => {
  store.dispatch(actionCreators.setTeamCount(0));
  store.dispatch(actionCreators.confirmTeamCount());
};

/**
 * 팀 배분을 실행하는 핸들러
 */
export const distributeTeams = () => {
  const state = store.getState();
  
  // 팀 수와 멤버가 모두 준비되었는지 확인
  if (!state.isTeamCountConfirmed || state.teamCount <= 0 || 
      !state.isTotalConfirmed || state.members.length === 0) {
    return null;
  }
  
  // 팀 배분 실행
  return utils.distributeTeams(state.members, state.teamCount);
}; 