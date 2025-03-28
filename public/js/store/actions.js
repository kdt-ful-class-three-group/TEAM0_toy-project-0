/**
 * @file actions.js
 * @description 애플리케이션의 액션 타입과 액션 생성자 함수를 정의합니다.
 */

// 액션 타입 상수
export const ACTION_TYPES = {
  // 멤버 관련 액션
  ADD_MEMBER: 'ADD_MEMBER',
  DELETE_MEMBER: 'DELETE_MEMBER',
  EDIT_MEMBER: 'EDIT_MEMBER',
  
  // 총원 설정 관련 액션
  SET_TOTAL_MEMBERS: 'SET_TOTAL_MEMBERS',
  CONFIRM_TOTAL_MEMBERS: 'CONFIRM_TOTAL_MEMBERS',
  RESET_TOTAL_MEMBERS: 'RESET_TOTAL_MEMBERS',
  
  // 팀 설정 관련 액션
  SET_TEAM_COUNT: 'SET_TEAM_COUNT',
  CONFIRM_TEAM_COUNT: 'CONFIRM_TEAM_COUNT',
  RESET_TEAM_COUNT: 'RESET_TEAM_COUNT',
  
  // 기타 액션
  RESET_STATE: 'RESET_STATE',
  SET_MEMBERS: 'SET_MEMBERS',
  DISTRIBUTE_TEAMS: 'DISTRIBUTE_TEAMS',
  RESET: 'RESET',
  SET_TEAMS: 'SET_TEAMS'
};

// 액션 생성자 함수

/**
 * 멤버 추가 액션 생성자
 * @param {string} memberName - 추가할 멤버 이름
 * @returns {Object} 액션 객체
 */
export const addMember = (memberName) => ({
  type: ACTION_TYPES.ADD_MEMBER,
  payload: { 
    memberName
  }
});

/**
 * 멤버 삭제 액션 생성자
 * @param {number} index - 삭제할 멤버의 인덱스
 * @returns {Object} 액션 객체
 */
export const deleteMember = (index) => ({
  type: ACTION_TYPES.DELETE_MEMBER,
  payload: { index }
});

/**
 * 멤버 이름 수정 액션 생성자
 * @param {number} index - 수정할 멤버의 인덱스
 * @param {string} newName - 새로운 멤버 이름
 * @returns {Object} 액션 객체
 */
export const editMember = (index, newName) => ({
  type: ACTION_TYPES.EDIT_MEMBER,
  payload: { index, newName }
});

/**
 * 총원 설정 액션 생성자
 * @param {number} count - 설정할 총원 수
 * @returns {Object} 액션 객체
 */
export const setTotalMembers = (count) => ({
  type: ACTION_TYPES.SET_TOTAL_MEMBERS,
  payload: { count }
});

/**
 * 총원 확정 액션 생성자
 * @returns {Object} 액션 객체
 */
export const confirmTotalMembers = () => ({
  type: ACTION_TYPES.CONFIRM_TOTAL_MEMBERS
});

/**
 * 총원 리셋 액션 생성자
 * @returns {Object} 액션 객체
 */
export const resetTotalMembers = () => ({
  type: ACTION_TYPES.RESET_TOTAL_MEMBERS
});

/**
 * 팀 개수 설정 액션 생성자
 * @param {number} count - 설정할 팀 개수
 * @returns {Object} 액션 객체
 */
export const setTeamCount = (count) => ({
  type: ACTION_TYPES.SET_TEAM_COUNT,
  payload: { count }
});

/**
 * 팀 개수 확정 액션 생성자
 * @returns {Object} 액션 객체
 */
export const confirmTeamCount = () => ({
  type: ACTION_TYPES.CONFIRM_TEAM_COUNT
});

/**
 * 팀 개수 리셋 액션 생성자
 * @returns {Object} 액션 객체
 */
export const resetTeamCount = () => ({
  type: ACTION_TYPES.RESET_TEAM_COUNT
});

/**
 * 전체 상태 리셋 액션 생성자
 * @returns {Object} 액션 객체
 */
export const resetState = () => ({
  type: ACTION_TYPES.RESET_STATE
});

/**
 * 팀 분배 액션
 */
export const distributeTeams = () => ({
  type: ACTION_TYPES.DISTRIBUTE_TEAMS
});

/**
 * 초기화
 */
export const reset = () => ({
  type: ACTION_TYPES.RESET
});

/**
 * 팀 설정 액션 생성
 * @param {Array} teams - 팀 배열
 * @param {boolean} isDistributed - 분배 완료 여부
 */
export const setTeams = (teams, isDistributed = true) => ({
  type: ACTION_TYPES.SET_TEAMS,
  payload: { teams, isDistributed }
});

// 액션 생성자 객체
export const actionCreators = {
  setTeamCount,
  confirmTeamCount,
  setTotalMembers,
  confirmTotalMembers,
  addMember,
  deleteMember,
  editMember,
  resetTotalMembers,
  resetTeamCount,
  resetState,
  distributeTeams,
  reset,
  setTeams
}; 