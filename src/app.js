// Start Generation Here
import express from 'express';
import path from 'path';
import demoMembers from "../data/demoMembers.js";
import TeamDistributor from "./core/team-distributor.js";

const app = express();
const PORT = 3030;

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  // process.cwd()는 현재 실행 중인 프로세스의 디렉토리를 반환
  // path.join()은 경로를 결합하는 함수입니다.
  // 'public' 디렉토리에서 'index.html' 파일 찾는다.
});

const distributor = new TeamDistributor();
const { teams, shuffledMembers } = distributor.distribute(demoMembers);

// 결과 출력
console.log('\n=== 팀 배정 결과 ===');
console.log('\n[섞인 멤버 순서]');
console.log(shuffledMembers);

// 팀 현황 출력
const teamStatus = {
    odd: teams.odd.map(member => member.getInfo()),
    even: teams.even.map(member => member.getInfo())
};

console.log('\n[팀 구성]');
console.log('\n홀수 팀:');
console.log(JSON.stringify(teamStatus.odd, null, 2));
console.log('\n짝수 팀:');
console.log(JSON.stringify(teamStatus.even, null, 2));

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}/` + `에서 실행 중`);
  console.log(`http://localhost:${PORT}/`);
  console.log("현재 디렉토리 : ", process.cwd());
});
