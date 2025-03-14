import shuffleArray from "./modules/shffleArray.js";
import demoMembers from "../data/demoMembers.js";
import { isOdd } from "./modules/odd-or-even-decision.js";
import TeamMember from "./modules/TeamMember.js";

/**
 * @fileoverview 팀 멤버 배정 및 관리 시스템
 * @author Kongukjae
 * @version 1.0.0
 *
 * @description
 * 이 모듈은 주어진 멤버 목록을 무작위로 섞어 홀수/짝수 팀으로 나누는 기능을 제공합니다.
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

/**
 * @function distributeTeams
 * @param {Array<string>} members - 분배할 멤버들의 배열
 * @returns {Object} odd와 even 팀으로 분배된 TeamMember 인스턴스들
 * @description
 * 주어진 멤버 배열을 홀수/짝수 인덱스를 기준으로 팀을 분배합니다.
 * 1. 멤버 배열을 무작위로 섞습니다.
 * 2. 섞인 배열을 순회하며 인덱스의 홀짝 여부에 따라 팀을 배정합니다.
 * 3. 각 멤버를 TeamMember 인스턴스로 생성하여 해당 팀에 추가합니다.
 */
const distributeTeams = (members) => {
    const teams = {
        odd: [],
        even: []
    };

    // 멤버 배열 섞기
    const shuffledResult = shuffleArray([...members]);
    const shuffledMembers = shuffledResult.shuffledArray;

    // 팀 분배
    shuffledMembers.forEach((member, index) => {
        if (isOdd(index)) {
            const memberObj = new TeamMember(member, 'odd', teams.odd.length);
            teams.odd.push(memberObj);
        } else {
            const memberObj = new TeamMember(member, 'even', teams.even.length);
            teams.even.push(memberObj);
        }
    });

    return teams;
};

// 메인 로직
const teamState = distributeTeams(demoMembers);

// 결과 출력
console.log('섞인 멤버 순서:', shuffledMembers);

// getInfo() 메서드를 사용하여 팀 현황 출력
const teamStatus = {
    odd: teamState.odd.map(member => member.getInfo()),
    even: teamState.even.map(member => member.getInfo())
};

console.log('팀 현황:', JSON.stringify(teamStatus, null, 2));

// 멤버 생성
const member = new TeamMember("피카츄", "odd", 0);

// getter 사용
console.log(member.memberName); // "피카츄"
console.log(member.team); // "odd"

// setter 사용
member.memberName = "라이츄"; // 정상 작동
member.team = "even"; // ID도 자동으로 업데이트됨

// PM 지정/해제
member.assignPM();
console.log(member.isPM); // true
member.unassignPM();
console.log(member.isPM); // false

// 전체 정보 조회
console.log(member.getInfo());
