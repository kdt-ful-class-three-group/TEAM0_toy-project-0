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

// 팀 분배 결과 저장
const saver = new TeamDecisionSaver();
try {
  await saver.saveTeamDecision(distributor.getTeamStatus());
  console.log('\n팀 분배 결과가 성공적으로 저장되었습니다.');
} catch (error) {
  console.error('팀 분배 결과 저장 중 오류가 발생했습니다:', error);
}

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