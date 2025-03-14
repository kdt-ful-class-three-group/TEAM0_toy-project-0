import fs from 'fs/promises';
import path from 'path';

/**
 * 팀 분배 결과를 JSON 파일로 저장하는 서비스 클래스
 * @class
 * @description
 * 이 클래스는 팀 분배 결과를 JSON 파일로 저장하는 기능을 제공합니다.
 * 파일은 'data/teams/current' 디렉토리에 저장되며, 
 * 파일명은 'team-distribute-{timestamp}.json' 형식을 따릅니다.
 * 
 * @example
 * // 클래스 인스턴스 생성
 * const saver = new TeamDecisionSaver();
 * 
 * // 팀 데이터 저장 (비동기 처리)
 * try {
 *   const teamData = {
 *     teams: [
 *       { name: 'Team A', members: ['member1', 'member2'] },
 *       { name: 'Team B', members: ['member3', 'member4'] }
 *     ]
 *   };
 *   const filePath = await saver.saveTeamDecision(teamData);
 *   console.log('저장된 파일 경로:', filePath);
 * } catch (error) {
 *   console.error('저장 중 오류 발생:', error);
 * }
 * 
 * @property {string} saveDir - 팀 데이터가 저장될 디렉토리 경로
 */
class TeamDecisionSaver {
  /**
   * TeamDecisionSaver 클래스의 새 인스턴스를 생성합니다.
   * @constructor
   * 
   * @description
   * 생성자는 다음과 같은 작업을 수행합니다:
   * 1. process.cwd()를 사용하여 현재 작업 디렉토리를 가져옵니다.
   * 2. path.join()을 사용하여 저장 디렉토리 경로를 생성합니다.
   * 
   * @note
   * - 실제 디렉토리는 initializeDirectory() 메서드 호출 시 생성됩니다.
   * - 디렉토리 경로: {프로젝트_루트}/data/teams/current
   */
  constructor() {
    // 저장될 디렉토리 경로 설정
    this.saveDir = path.join(process.cwd(), 'data', 'teams', 'current');
  }

  /**
   * 저장 디렉토리를 초기화합니다.
   * @async
   * @private
   * 
   * @description
   * 작동 순서:
   * 1. fs.mkdir을 사용하여 디렉토리를 생성합니다.
   * 2. recursive: true 옵션으로 중첩 디렉토리도 자동 생성됩니다.
   * 
   * @throws {Error} 디렉토리 생성 중 오류가 발생한 경우
   * @returns {Promise<void>}
   */
  async initializeDirectory() {
    try {
      await fs.mkdir(this.saveDir, { recursive: true });
    } catch (error) {
      console.error('디렉토리 생성 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 팀 분배 결과를 JSON 파일로 저장합니다.
   * @async
   * @param {Object} teamData - 저장할 팀 데이터 객체
   * @param {Array} teamData.teams - 팀 정보 배열
   * @param {Object} [teamData.metadata] - 추가 메타데이터 (선택사항)
   * 
   * @description
   * 작동 순서:
   * 1. initializeDirectory()를 호출하여 저장 디렉토리 생성
   * 2. 현재 시간을 기반으로 타임스탬프 생성
   * 3. 파일명 생성 (team-distribute-{timestamp}.json)
   * 4. 저장할 데이터 객체 생성 (타임스탬프 포함)
   * 5. JSON 파일로 저장
   * 
   * @returns {Promise<string>} 저장된 파일의 전체 경로
   * @throws {Error} 파일 저장 중 오류가 발생한 경우
   * 
   * @example
   * const teamData = {
   *   teams: [
   *     {
   *       name: "Team A",
   *       members: [
   *         { name: "Member 1", role: "PM" },
   *         { name: "Member 2", role: "Member" }
   *       ]
   *     }
   *   ],
   *   metadata: {
   *     createdAt: "2024-03-14",
   *     version: "1.0.0"
   *   }
   * };
   * 
   * const filePath = await saver.saveTeamDecision(teamData);
   */
  async saveTeamDecision(teamData) {
    try {
      await this.initializeDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `team-distribute-${timestamp}.json`;
      const filePath = path.join(this.saveDir, filename);

      const dataToSave = {
        timestamp: new Date().toISOString(),
        teamData: teamData,
      };

      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
      console.log(`팀 분배 결과가 저장되었습니다: ${filename}`);
      
      return filePath;
    } catch (error) {
      console.error('팀 데이터 저장 중 오류 발생:', error);
      throw error;
    }
  }
}

export default TeamDecisionSaver;
