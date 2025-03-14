import demoMembers from "../../data/demoMembers.js";
import TeamDistributor from "../core/team-distributor.js";
import TeamMember from "../models/TeamMember.js";
import TeamDecisionSaver from '../services/save-team-decision-json.js';

/**
 * @fileoverview 팀 분배 시스템 테스트
 * @author Kongukjae
 * @version 1.0.0
 */

/**
 * ===========================
 * 팀 분배 테스트 케이스
 * ===========================
 */
console.log('\n------------------------------ 팀 분배 시스템 테스트 ------------------------------');

// 1. TeamDistributor 인스턴스 생성 및 분배 테스트
console.log('\n[1. 팀 분배 기능 테스트]');
const distributor = new TeamDistributor();
const { teams, shuffledMembers } = distributor.distribute(demoMembers);

console.log('- 섞인 멤버 순서:', shuffledMembers);
console.log('\n------------------------------ 팀 분배 결과 ------------------------------');
console.log('- 팀 분배 결과:');
console.log(JSON.stringify(distributor.getTeamStatus(), null, 2));

/**
 * ===========================
 * 팀 분배 결과 저장 프로세스
 * ===========================
 */

// TeamDecisionSaver 인스턴스 생성
// - 생성자에서 저장 디렉토리 경로 설정 (data/teams/current)
// - 이 시점에서는 실제 디렉토리는 아직 생성되지 않음
const saver = new TeamDecisionSaver();

try {
  // saveTeamDecision 메서드 호출 (비동기 작업 시작)
  // 1. distributor.getTeamStatus()
  //    - 현재 팀 분배 상태를 객체로 반환
  //    - 팀 구성, 멤버 정보 등이 포함됨
  //
  // 2. 저장 프로세스 (순차적 실행)
  //    a. initializeDirectory() 호출
  //       - data/teams/current 디렉토리 생성 (없는 경우)
  //    b. 타임스탬프 생성 (현재 시간 기준)
  //    c. 파일명 생성: team-distribute-{timestamp}.json
  //    d. JSON 데이터 구성
  //       - timestamp: 저장 시점
  //       - teamData: 팀 분배 결과
  //    e. 파일 시스템에 JSON 파일 작성
  await saver.saveTeamDecision(distributor.getTeamStatus());

  // 저장 성공 시 메시지 출력
  console.log('\n팀 분배 결과가 성공적으로 저장되었습니다.');
} catch (error) {
  // 에러 발생 가능 케이스:
  // 1. 디렉토리 생성 실패
  // 2. 파일 쓰기 권한 부족
  // 3. 디스크 공간 부족
  // 4. 잘못된 파일 경로
  // 5. JSON 직렬화 실패
  console.error('팀 분배 결과 저장 중 오류가 발생했습니다:', error);
}

/**
 * 참고: 비동기 처리 흐름
 * 1. 이 코드는 async/await를 사용하므로 반드시 async 함수 내부에서 실행되어야 함
 * 2. await 키워드로 인해 저장이 완료될 때까지 다음 코드 실행이 일시 중지됨
 * 3. 저장 작업은 메인 스레드를 차단하지 않음 (비동기 I/O 작업)
 */

console.log('\n------------------------------ TeamMember 클래스 기능 테스트 ------------------------------');
// 2. TeamMember 클래스 기능 테스트
console.log('\n[2. TeamMember 기능 테스트]');

// 2.1 기본 생성 및 정보 수정
const member = new TeamMember("피카츄", "odd", 0);
console.log('- 멤버 생성:', member.getInfo());

member.memberName = "라이츄";
member.team = "even";
console.log('- 정보 수정 후:', member.getInfo());

console.log('\n------------------------------ PM 관련 기능 테스트 ------------------------------');
// 2.2 PM 관련 기능
member.assignPM();
console.log('- PM 지정 후:', member.getInfo());

member.unassignPM();
console.log('- PM 해제 후:', member.getInfo());

/**
 * @todo 추가 필요한 테스트 케이스
 * 1. 팀 분배 관련
 * - 홀수 인원일 때의 처리
 * - 최소/최대 인원 제한 처리
 * - 중복 멤버 처리
 * 
 * 2. 팀원 관리 관련
 * - 팀 간 멤버 이동
 * - 팀별 PM 자동 지정
 * - PM 중복 지정 방지
 * - 팀별 인원 밸런스 조정
 * 
 * 3. 예외 처리
 * - 잘못된 입력값 처리
 * - 빈 배열 처리
 * - 최대 인원 초과 처리
 * 
 * 4. 기타 기능
 * - 팀 이름 커스터마이징
 * - 팀 통계 정보
 * - 멤버 검색 기능
 */ 