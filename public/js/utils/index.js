/**
 * @file utils/index.js
 * @description 여러 컴포넌트에서 사용하는 유틸리티 함수들을 모듈화합니다.
 */
import store from '../store/index.js';

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
    // 접미사가 없는 이름으로 시작하는 모든 멤버 찾기
    const exactMatch = existingNames.includes(name);
    const sameBaseNames = existingNames.filter(existingName => 
      existingName === name || existingName.startsWith(`${name}-`)
    );
    
    // 중복된 이름이 있는 경우
    if (exactMatch || sameBaseNames.length > 0) {
      // 첫 번째 중복이 발생한 경우 (접미사 없는 이름이 이미 존재)
      if (exactMatch) {
        // 기존 멤버 이름에 접미사 부여를 위해 store에서 members 업데이트
        const state = store.getState();
        const newMembers = [...state.members];
        
        // 접미사가 없는 기존 멤버 찾기
        const indexOfExistingName = newMembers.findIndex(m => m === name);
        
        // 접미사가 없는 기존 멤버에게 -1 접미사 부여
        if (indexOfExistingName !== -1) {
          // 중요: 기존 이름을 -1로 변경
          newMembers[indexOfExistingName] = `${name}-1`;
          
          // 즉시 상태 업데이트 (비동기 처리 제거)
          store.setState({ members: newMembers });
          
          // 새 멤버는 -2를 사용하여 반환
          return `${name}-2`;
        }
      }
      
      // 사용된 접미사 번호 추출
      const usedSuffixes = sameBaseNames
        .map(n => {
          if (n === name) return 0;
          const match = n.match(new RegExp(`^${name}-([0-9]+)$`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter(n => n !== 0);
      
      // 다음 접미사 번호 결정 (최대값 + 1 또는 1)
      const nextSuffix = usedSuffixes.length > 0 ? Math.max(...usedSuffixes) + 1 : 1;
      
      return `${name}-${nextSuffix}`;
    }
    
    // 중복이 없으면 원래 이름 사용
    return name;
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