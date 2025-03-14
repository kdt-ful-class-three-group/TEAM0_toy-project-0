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

console.log('섞인 멤버 순서:', shuffledMembers);

// 배열을 순회하면서 팀 나누기
shuffledMembers.forEach((member, index) => {
    teamState.temp = member;
    
    if (isOdd(index)) {
        teamState.teams.odd.push(teamState.temp);
    } else {
        teamState.teams.even.push(teamState.temp);
    }
});

// 결과 확인을 위한 콘솔 로그
console.log('팀 현황:', teamState.teams);
