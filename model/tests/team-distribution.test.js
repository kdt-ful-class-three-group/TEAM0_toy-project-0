import demoMembers from "../../data/demoMembers.js";
import distributeTeams from "../services/team-distribution.js";
import TeamMember from "../models/TeamMember.js";

/**
 * @fileoverview 팀 멤버 배정 및 관리 시스템 테스트
 * @author Kongukjae
 * @version 1.0.0
 */

/**
 * ===========================
 * 임시 테스트 실행 코드
 * TODO: 추후 Jest 테스트로 마이그레이션 예정
 * ===========================
 */

// 1. 팀 분배 기능 테스트
console.log('\n[팀 분배 테스트]');
const { teams, shuffledMembers } = distributeTeams(demoMembers);
console.log('섞인 멤버 순서:', shuffledMembers);

// 2. 팀 현황 출력 테스트
console.log('\n[팀 현황 출력 테스트]');
const teamStatus = {
    odd: teams.odd.map(member => member.getInfo()),
    even: teams.even.map(member => member.getInfo())
};
console.log('팀 현황:', JSON.stringify(teamStatus, null, 2));

/**
 * TeamMember 클래스 기능 테스트
 * @deprecated 추후 Jest 테스트로 대체 예정
 */
console.log('\n[TeamMember 클래스 테스트]');
const testMember = new TeamMember("피카츄", "odd", 0);
console.log('1. 멤버 생성:', testMember.getInfo());

testMember.memberName = "라이츄";
testMember.team = "even";
console.log('2. 정보 수정:', testMember.getInfo());

testMember.assignPM();
console.log('3. PM 지정:', testMember.getInfo());

testMember.unassignPM();
console.log('4. PM 해제:', testMember.getInfo());

/**
 * @todo
 * - Jest 테스트 프레임워크 도입
 * - 테스트 케이스 체계화
 * - CI/CD 파이프라인 구축
 */ 