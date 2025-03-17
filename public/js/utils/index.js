/**
 * @file utils/index.js
 * @description 여러 컴포넌트에서 사용하는 유틸리티 함수들을 모듈화합니다.
 */

/**
 * @function createUtils
 * @description 유틸리티 함수를 모아둔 객체를 생성합니다.
 */
const createUtils = () => {
  console.log("유틸 생성");

  /**
   * 입력값이 숫자인지 확인합니다.
   * @param {string|number} value - 확인할 값
   * @returns {boolean} 숫자 여부
   */
  const validateNumber = (value) => {
    if (value === "" || value === undefined) return false;
    return !isNaN(value) && parseInt(value) >= 0;
  };

  /**
   * 팀 수가 유효한지 확인합니다.
   * @param {number} teamCount - 팀 수
   * @returns {boolean} 유효 여부
   */
  const validateTeamCount = (teamCount) => {
    return validateNumber(teamCount) && teamCount > 0;
  };

  /**
   * 총원 수가 유효한지 확인합니다.
   * @param {number} totalMembers - 총원 수
   * @returns {boolean} 유효 여부
   */
  const validateTotalMembers = (totalMembers) => {
    return validateNumber(totalMembers) && totalMembers > 0;
  };

  /**
   * 더 많은 멤버를 추가할 수 있는지 확인합니다.
   * @param {object} state - 애플리케이션 상태
   * @returns {boolean} 추가 가능 여부
   */
  const canAddMore = (state) => {
    if (!state) return false;
    return (
      state.isTotalConfirmed &&
      state.totalMembers > 0 &&
      state.members.length < state.totalMembers
    );
  };

  /**
   * 중복되지 않는 멤버 이름을 생성합니다.
   * @param {string} name - 기본 이름
   * @param {Array<string>} existingNames - 기존 이름 배열
   * @returns {string} 중복되지 않는 이름
   */
  const generateMemberName = (name, existingNames) => {
    if (!existingNames.includes(name)) return name;

    let counter = 1;
    let newName = `${name} ${counter}`;
    
    while (existingNames.includes(newName)) {
      counter++;
      newName = `${name} ${counter}`;
    }
    
    return newName;
  };

  /**
   * 팀을 공평하게 배분합니다.
   * @param {Array<string>} members - 멤버 배열
   * @param {number} teamCount - 팀 수
   * @returns {Array<Array<string>>} 팀 배열
   */
  const distributeTeams = (members, teamCount) => {
    if (!members || !members.length || !teamCount) {
      return [];
    }

    // 멤버 복사본 무작위 섞기
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    
    // 팀 배열 초기화
    const teams = Array.from({ length: teamCount }, () => []);
    
    // 멤버 공평하게 분배
    shuffled.forEach((member, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].push(member);
    });
    
    return teams;
  };

  return {
    validateNumber,
    validateTeamCount,
    validateTotalMembers,
    canAddMore,
    generateMemberName,
    distributeTeams
  };
};

// 유틸리티 인스턴스 생성
const utils = createUtils();

export default utils; 