import demoMembers from "../data/demoMembers.js";
import distributeTeams from "./modules/distributeTeams.js";
import TeamMember from "./modules/TeamMember.js";

/**
 * @fileoverview 팀 멤버 배정 및 관리 시스템
 * @author Kongukjae
 * @version 1.0.0
 *
 * @description
 * 이 모듈은 주어진 멤버 목록을 무작위로 섞어 홀수/짝수 팀으로 나누는 기능을 테스트합니다.
 *
 * @process 동작 순서
 * 1. teamState 객체 초기화
 *    - temp: 임시 저장소
 *    - teams: odd(홀수)/even(짝수) 팀 배열 보유
 *
 * 2. 멤버 배정 프로세스
 *    a. demoMembers 배열을 shuffleArray 함수로 무작위 섞기
 *    b. 섞인 배열을 순회하며 각 멤버를 TeamMember 인스턴스로 생성
 *    c. 인덱스의 홀짝 여부에 따라 해당 팀에 배정
 *        - 홀수 인덱스: odd 팀
 *        - 짝수 인덱스: even 팀
 *
 * @features 주요 기능
 * - 멤버 무작위 배정
 * - 팀별 멤버 관리
 * - 각 멤버의 메타데이터 관리 (팀, ID, PM 여부 등)
 *
 * @outputs 출력 정보
 * - 섞인 멤버 순서 출력
 * - 최종 팀 구성 현황 출력 (odd/even 팀별 멤버 정보)
 *
 * @dependencies
 * - shuffleArray: 배열 무작위 섞기
 * - demoMembers: 샘플 멤버 데이터
 * - isOdd: 홀수 판별
 * - TeamMember: 멤버 객체 생성자
 */

// 팀 분배 실행
const { teams, shuffledMembers } = distributeTeams(demoMembers);

// 결과 출력
console.log('섞인 멤버 순서:', shuffledMembers);

// getInfo() 메서드를 사용하여 팀 현황 출력
const teamStatus = {
    odd: teams.odd.map(member => member.getInfo()),
    even: teams.even.map(member => member.getInfo())
};

console.log('팀 현황:', JSON.stringify(teamStatus, null, 2));

// 테스트 코드
const testMember = new TeamMember("피카츄", "odd", 0);
console.log('테스트 멤버 생성:', testMember.getInfo());

testMember.memberName = "라이츄";
testMember.team = "even";
console.log('테스트 멤버 정보 수정:', testMember.getInfo());

testMember.assignPM();
console.log('PM 지정 후:', testMember.getInfo());

testMember.unassignPM();
console.log('PM 해제 후:', testMember.getInfo());
