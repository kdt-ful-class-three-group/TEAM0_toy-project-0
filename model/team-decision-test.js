import shuffleArray from "./modules/shffleArray.js";
import demoMembers from "../data/demoMembers.js";
import { isOdd } from "./modules/odd-or-even-decision.js";  

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

// 멤버 객체를 생성하는 함수
const createMemberObject = (member, team, index) => {
    return {
        team: team,
        id: `${team}-${index + 1}`,
        member: member,
        isPM: false
    };
};

// 배열을 순회하면서 팀 나누기
shuffledMembers.forEach((member, index) => {
    teamState.temp = member;
    
    if (isOdd(index)) {
        const memberObj = createMemberObject(teamState.temp, 'odd', teamState.teams.odd.length);
        teamState.teams.odd.push(memberObj);
    } else {
        const memberObj = createMemberObject(teamState.temp, 'even', teamState.teams.even.length);
        teamState.teams.even.push(memberObj);
    }
});

console.log('섞인 멤버 순서:', shuffledMembers);
console.log('팀 현황:', JSON.stringify(teamState.teams, null, 2));
