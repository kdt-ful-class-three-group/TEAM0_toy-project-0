/**
 * @file teamConfigHandlers.js
 * @description 팀 구성과 관련된 이벤트 핸들링 로직을 담당하는 모듈
 */

import store from '../store/index.js';
import { validateNumber } from '../utils/validation.js';
import { showUIError } from '../utils/errorHandler.js';
import { shuffleArray } from '../utils/shuffleArray.js';
import { debounce } from '../utils/performance.js';
import { setTeamCount, confirmTeamCount as confirmTeamCountAction, resetTeamCount } from '../store/actions.js';

/**
 * 팀 카운트 입력을 처리하는 핸들러
 * @param {Event} e - 입력 이벤트
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 */
export const handleTeamCountInput = debounce((e, showInvalidInput) => {
  if (!e || !e.target) return;
  
  const value = e.target.value;
  if (value === undefined || value === null || !validateNumber(value)) {
    if (value !== undefined && value !== null) {
      e.target.value = value.replace(/[^\d]/g, "");
    }
    showUIError(e.target, '숫자만 입력할 수 있습니다.');
    return;
  }

  const numValue = parseInt(e.target.value);
  if (numValue < 1) {
    e.target.value = "";
    showUIError(e.target, '1 이상의 숫자를 입력하세요.');
    store.dispatch(setTeamCount(0));
    return;
  }

  // 총원보다 많은 팀 개수를 입력할 수 없음
  const state = store.getState();
  if (state.isTotalConfirmed && numValue > state.totalMembers) {
    showUIError(e.target, `총원(${state.totalMembers}명)보다 많은 팀을 구성할 수 없습니다.`);
    return;
  }

  e.target.classList.remove("invalid");
  store.dispatch(setTeamCount(numValue));
}, 100);

/**
 * 팀 카운트 확정을 처리하는 핸들러
 * @param {Function} showInvalidInput - 유효하지 않은 입력을 표시하는 함수
 * @param {Element} inputEl - 입력 요소
 */
export const confirmTeamCount = (showInvalidInput, inputEl) => {
  if (!showInvalidInput || typeof showInvalidInput !== 'function') {
    console.error('유효하지 않은 showInvalidInput 함수입니다.');
    return;
  }
  
  const state = store.getState();
  const value = state.teamCount;

  if (!validateTeamCount(value, state)) {
    if (inputEl) {
      showUIError(inputEl, '유효한 팀 개수를 입력하세요.');
    }
    return;
  }

  store.dispatch(confirmTeamCountAction());
};

/**
 * 팀 카운트 유효성 검증
 * @param {number} teamCount - 팀 개수
 * @param {Object} state - 현재 상태
 * @returns {boolean} 유효한지 여부
 */
function validateTeamCount(teamCount, state) {
  if (!Number.isInteger(teamCount) || teamCount < 1) {
    return false;
  }

  // 현재 등록된 멤버 수보다 많은 팀을 생성할 수 없음
  if (state.isTotalConfirmed && teamCount > state.totalMembers) {
    return false;
  }

  return true;
}

/**
 * 팀 카운트 수정을 처리하는 핸들러
 */
export const editTeamCount = () => {
  store.dispatch(resetTeamCount());
};

/**
 * 팀 구성하기 - 멤버 배분 알고리즘
 * @returns {Array<Array<string>>} 팀별 멤버 배열
 */
export const distributeTeams = () => {
  const state = store.getState();
  const { members, teamCount } = state;
  
  console.log('팀 분배 시작:', { members, teamCount });
  
  if (!members.length || teamCount <= 0) {
    console.warn('팀 분배 불가: 멤버가 없거나 팀 개수가 0 이하');
    return [];
  }
  
  try {
    // 멤버 목록 복사 및 섞기
    const shuffledMembers = shuffleArray([...members]);
    console.log('섞인 멤버 목록:', shuffledMembers);
    
    // 팀 구성 (균등 분배)
    const teams = Array.from({ length: teamCount }, () => []);
    const membersPerTeam = Math.floor(members.length / teamCount);
    const remainingMembers = members.length % teamCount;
    
    console.log('팀 분배 정보:', { 
      총멤버수: members.length, 
      팀개수: teamCount, 
      팀당멤버수: membersPerTeam, 
      나머지멤버: remainingMembers 
    });
    
    let memberIndex = 0;
    
    // 기본 배분 (균등하게)
    for (let i = 0; i < teamCount; i++) {
      for (let j = 0; j < membersPerTeam; j++) {
        if (memberIndex < shuffledMembers.length) {
          teams[i].push(shuffledMembers[memberIndex++]);
        }
      }
    }
    
    // 남은 멤버들 분배 (앞쪽 팀부터 한 명씩)
    for (let i = 0; i < remainingMembers; i++) {
      if (memberIndex < shuffledMembers.length) {
        teams[i].push(shuffledMembers[memberIndex++]);
      }
    }
    
    console.log('팀 구성 결과:', teams);
    return teams;
  } catch (error) {
    console.error('팀 분배 중 오류 발생:', error);
    // 오류 발생 시 안전한 대체 로직
    const shuffled = shuffleArray([...members]);
    const teams = [];
    
    // 간단한 분배 로직 (오류 복구용)
    for (let i = 0; i < teamCount; i++) {
      teams.push([]);
    }
    
    shuffled.forEach((member, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].push(member);
    });
    
    console.log('오류 복구 팀 구성 결과:', teams);
    return teams;
  }
}; 