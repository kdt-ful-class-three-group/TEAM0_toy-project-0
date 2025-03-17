/**
 * @file utils/validation.js
 * @description 입력값 유효성 검사를 담당하는 모듈입니다.
 */

/**
 * 입력값이 숫자인지 확인합니다.
 * @param {string|number} value - 확인할 값
 * @returns {boolean} 숫자 여부
 */
export const validateNumber = (value) => {
  if (value === "" || value === undefined) return false;
  return !isNaN(value) && parseInt(value) >= 0;
};

/**
 * 팀 수가 유효한지 확인합니다.
 * @param {number} teamCount - 팀 수
 * @returns {boolean} 유효 여부
 */
export const validateTeamCount = (teamCount) => {
  return validateNumber(teamCount) && teamCount > 0;
};

/**
 * 총원 수가 유효한지 확인합니다.
 * @param {number} totalMembers - 총원 수
 * @returns {boolean} 유효 여부
 */
export const validateTotalMembers = (totalMembers) => {
  return validateNumber(totalMembers) && totalMembers > 0;
};

/**
 * 팀 수와 총원이 유효한 비율인지 확인합니다.
 * @param {number} teamCount - 팀 수
 * @param {number} totalMembers - 총원 수
 * @returns {boolean} 유효 여부
 */
export const validateTeamRatio = (teamCount, totalMembers) => {
  if (!validateTeamCount(teamCount) || !validateTotalMembers(totalMembers)) {
    return false;
  }
  
  // 최소 각 팀당 1명 이상이 배정되어야 함
  return teamCount <= totalMembers;
};

/**
 * 멤버 이름이 유효한지 확인합니다.
 * @param {string} name - 멤버 이름
 * @returns {boolean} 유효 여부
 */
export const validateMemberName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // 이름은 공백이 아닌 문자를 1개 이상 포함해야 함
  return name.trim().length > 0;
}; 