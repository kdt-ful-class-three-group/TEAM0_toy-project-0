import shuffleArray from "./modules/shffleArray.js";
import demoMembers from "../data/demoMembers.js";
import { isOdd } from "./modules/odd-or-even-decision.js";  



let temp = "";
const oddTeam = [];
const evenTeam = [];



// demoMembers 배열 섞기
const shuffledResult = shuffleArray([...demoMembers]);
const shuffledMembers = shuffledResult.shuffledArray;




console.log('섞인 멤버 순서:', shuffledMembers);

// 배열을 순회하면서 팀 나누기
shuffledMembers.forEach((member, index) => {
    temp = member;
    
    if (isOdd(index)) {
        oddTeam.push(temp);
    } else {
        evenTeam.push(temp);
    }
});


  console.log('홀수 팀:', oddTeam);
  console.log('짝수 팀:', evenTeam);
  