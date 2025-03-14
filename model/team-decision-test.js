import shuffleArray from "./modules/shffleArray.js";
import demoMembers from "../data/demoMembers.js";

const temp = "";
const blueTeam = [];
const redTeam = [];



// demoMembers 배열 섞기
const shuffledMembers = shuffleArray([...demoMembers]);
console.log('섞인 멤버 순서:', shuffledMembers);

