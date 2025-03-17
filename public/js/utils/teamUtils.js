/**
 * @file utils/teamUtils.js
 * @description 팀 배분과 관련된 유틸리티 함수들을 제공하는 모듈입니다.
 */

import { createErrorLogger } from './errorHandler.js';

const logger = createErrorLogger('teamUtils');

/**
 * 팀을 공평하게 배분합니다.
 * @param {Array<string>} members - 멤버 배열
 * @param {number} teamCount - 팀 수
 * @returns {Array<Array<string>>} 팀 배열
 */
export const distributeTeams = (members, teamCount) => {
  if (!members || !Array.isArray(members) || members.length === 0 || !teamCount || teamCount < 1) {
    logger.warn("팀 배분에 필요한 데이터가 부족합니다.", { members: members?.length, teamCount });
    return [];
  }

  try {
    // 멤버 복사본 무작위 섞기
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    
    // 총 멤버 수
    const totalMembers = shuffled.length;
    
    // 기본 팀당 인원 수 (올림 아닌 내림으로 처리)
    const baseSize = Math.floor(totalMembers / teamCount);
    
    // 나머지 인원 (추가 인원이 필요한 팀 수)
    const remainder = totalMembers % teamCount;
    
    logger.info(`팀 배분 정보: 총원=${totalMembers}, 팀 수=${teamCount}, 기본 팀 크기=${baseSize}, 나머지=${remainder}`);
    
    // 팀 배열 초기화
    const teams = Array.from({ length: teamCount }, () => []);
    
    // 균등 배분 로직 구현
    let index = 0;
    
    // 각 팀에 기본 인원 + 필요시 추가 인원 배정
    for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
      // 이 팀에 배정할 멤버 수 (처음 remainder팀에는 추가 인원 1명 배정)
      const teamSize = baseSize + (teamIndex < remainder ? 1 : 0);
      
      // 팀에 멤버 추가
      for (let i = 0; i < teamSize && index < totalMembers; i++) {
        teams[teamIndex].push(shuffled[index++]);
      }
    }
    
    logger.info("팀 배분 완료");
    return teams;
  } catch (error) {
    logger.error("팀 배분 중 오류 발생", { error });
    return [];
  }
};

/**
 * 지정된 전략에 따라 팀을 배분합니다.
 * @param {Array<string>} members - 멤버 배열
 * @param {number} teamCount - 팀 수
 * @param {string} strategy - 배분 전략 ('random', 'balanced', 'sequential')
 * @returns {Array<Array<string>>} 팀 배열
 */
export const distributeTeamsWithStrategy = (members, teamCount, strategy = 'random') => {
  if (!members || !teamCount) return [];
  
  switch(strategy) {
    case 'balanced':
      return distributeTeamsBalanced(members, teamCount);
    case 'sequential':
      return distributeTeamsSequential(members, teamCount);
    case 'random':
    default:
      return distributeTeams(members, teamCount);
  }
};

/**
 * 멤버를 순차적으로 팀에 배분합니다 (섞지 않음).
 * @param {Array<string>} members - 멤버 배열
 * @param {number} teamCount - 팀 수
 * @returns {Array<Array<string>>} 팀 배열
 */
export const distributeTeamsSequential = (members, teamCount) => {
  if (!members || !teamCount) return [];
  
  const teams = Array.from({ length: teamCount }, () => []);
  
  members.forEach((member, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].push(member);
  });
  
  return teams;
};

/**
 * 팀원 수를 최대한 균등하게 맞추는 방식으로 배분합니다.
 * @param {Array<string>} members - 멤버 배열
 * @param {number} teamCount - 팀 수
 * @returns {Array<Array<string>>} 팀 배열
 */
export const distributeTeamsBalanced = (members, teamCount) => {
  // 랜덤 배분과 동일하지만, 멤버를 섞은 후 균등하게 배분
  return distributeTeams([...members], teamCount);
};

/**
 * 모든 가능한 팀 조합 중 가장 균형 잡힌 팀 구성을 찾습니다.
 * (참고: 계산 복잡도가 높아 소규모 그룹에만 적합합니다)
 * 
 * @param {Array<string>} members - 멤버 배열
 * @param {number} teamCount - 팀 수
 * @returns {Array<Array<string>>} 팀 배열
 */
export const findOptimalTeamDistribution = (members, teamCount) => {
  if (members.length > 15) {
    logger.warn("멤버 수가 많아 최적 팀 구성 대신 일반 배분 방식을 사용합니다.");
    return distributeTeamsBalanced(members, teamCount);
  }
  
  // 간단한 구현: 랜덤 배분을 여러 번 시도하여 편차가 가장 적은 결과 선택
  let bestDistribution = null;
  let minDeviation = Infinity;
  
  for (let i = 0; i < 100; i++) {
    const distribution = distributeTeams(members, teamCount);
    const teamSizes = distribution.map(team => team.length);
    const deviation = Math.max(...teamSizes) - Math.min(...teamSizes);
    
    if (deviation < minDeviation) {
      minDeviation = deviation;
      bestDistribution = distribution;
      
      // 완벽하게 균등하면 바로 반환
      if (deviation === 0 || deviation === 1) break;
    }
  }
  
  return bestDistribution;
}; 