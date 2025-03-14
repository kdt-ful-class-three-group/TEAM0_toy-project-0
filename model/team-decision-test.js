import shuffleArray from "./modules/shffleArray.js";


const demoMembers = [ "피카츄", "라이츄", "파이리", "꼬부기", "버터풀", "야도란", "피존투", "또가스", "단데기", "딱충이" ];

const temp = "";
const blueTeam = [];
const redTeam = [];



// demoMembers 배열 섞기
const shuffledMembers = shuffleArray([...demoMembers]);
console.log('섞인 멤버 순서:', shuffledMembers);

