import shuffleArray from "./modules/shffleArray.js";
import demoMembers from "../data/demoMembers.js";
import { isOdd } from "./modules/odd-or-even-decision.js";  
import TeamMember from "./modules/TeamMember.js";

const teamState = {
    temp: "",
    teams: {
        odd: [],
        even: []
    }
};

// demoMembers 배열 섞기
const shuffledResult = shuffleArray([...demoMembers]);
const shuffledMembers = shuffledResult.shuffledArray;

// 배열을 순회하면서 팀 나누기
shuffledMembers.forEach((member, index) => {
    teamState.temp = member;
    
    if (isOdd(index)) {
        const memberObj = new TeamMember(teamState.temp, 'odd', teamState.teams.odd.length);
        teamState.teams.odd.push(memberObj);
    } else {
        const memberObj = new TeamMember(teamState.temp, 'even', teamState.teams.even.length);
        teamState.teams.even.push(memberObj);
    }
});

console.log('섞인 멤버 순서:', shuffledMembers);

// getInfo() 메서드를 사용하여 팀 현황 출력
const teamStatus = {
    odd: teamState.teams.odd.map(member => member.getInfo()),
    even: teamState.teams.even.map(member => member.getInfo())
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
