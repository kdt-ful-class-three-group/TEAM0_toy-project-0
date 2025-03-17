/**
 * @file teamConfigHandlers.js
 * @description 팀 구성과 관련된 이벤트 핸들링 로직을 담당하는 모듈
 */

import store, { actionCreators } from '../store/index.js';
import { validateNumber, validateTeamCount, validateTeamRatio } from '../utils/validation.js';
import { distributeTeamsWithStrategy } from '../utils/teamUtils.js';
import { ValidationError, handleError, showUIError, createErrorLogger } from '../utils/errorHandler.js';

const logger = createErrorLogger('teamConfigHandlers');

/**
 * 팀 수 입력을 처리하는 핸들러
 * @param {Event} e - 입력 이벤트
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 */
export const handleTeamCountInput = (e, showInvalidInput) => {
  const value = e.target.value;
  if (!validateNumber(value)) {
    e.target.value = value.replace(/[^\d]/g, "");
    showUIError(e.target, '숫자만 입력할 수 있습니다.');
    return;
  }

  const numValue = parseInt(value);
  if (numValue < 1) {
    e.target.value = "";
    showUIError(e.target, '1 이상의 숫자를 입력하세요.');
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

  if (!validateTeamCount(value)) {
    if (inputEl) {
      const error = new ValidationError('유효한 팀 수를 입력하세요.', { value });
      handleError(error, () => showUIError(inputEl, '유효한 팀 수를 입력하세요.'));
    }
    return;
  }
  
  // 팀 수와 총원 비율 확인
  if (!validateTeamRatio(value, state.totalMembers)) {
    if (inputEl) {
      const error = new ValidationError('팀 수는 총원 수보다 클 수 없습니다.', { 
        teamCount: value, 
        totalMembers: state.totalMembers 
      });
      handleError(error, () => 
        showUIError(inputEl, '팀 수는 총원 수보다 클 수 없습니다.')
      );
    }
    return;
  }

  store.dispatch(actionCreators.confirmTeamCount());
  logger.info('팀 수 확정됨', { teamCount: value });
};

/**
 * 팀 수 수정을 처리하는 핸들러
 */
export const editTeamCount = () => {
  try {
    store.dispatch(actionCreators.setTeamCount(0));
    store.dispatch(actionCreators.confirmTeamCount());
    logger.info('팀 수 초기화됨');
  } catch (error) {
    handleError(error);
  }
};

/**
 * 팀 배분을 실행하는 핸들러
 * @param {string} strategy - 배분 전략 ('random', 'balanced', 'sequential')
 * @returns {Array<Array<string>>|null} 팀 배열 또는 실패 시 null
 */
export const distributeTeams = (strategy = 'random') => {
  const state = store.getState();
  
  // 팀 수와 멤버가 모두 준비되었는지 확인
  if (!state.isTeamCountConfirmed || state.teamCount <= 0 || 
      !state.isTotalConfirmed || state.members.length === 0) {
    logger.warn('팀 배분 조건이 충족되지 않음', { 
      isTeamCountConfirmed: state.isTeamCountConfirmed,
      teamCount: state.teamCount,
      isTotalConfirmed: state.isTotalConfirmed,
      membersCount: state.members.length
    });
    return null;
  }
  
  try {
    // 팀 배분 실행
    const teams = distributeTeamsWithStrategy(state.members, state.teamCount, strategy);
    logger.info('팀 배분 완료', { 
      strategy, 
      teamCount: teams.length, 
      teams: teams.map(team => team.length) 
    });
    return teams;
  } catch (error) {
    handleError(error);
    return null;
  }
}; 