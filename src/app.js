 // Start Generation Here
import express from 'express';
import path from 'path';

const app = express();
const PORT = 3030;

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  // process.cwd()는 현재 실행 중인 프로세스의 디렉토리를 반환
  // path.join()은 경로를 결합하는 함수입니다.
  // 'public' 디렉토리에서 'index.html' 파일 찾는다.
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}/` + `에서 실행 중`);
  console.log(`http://localhost:${PORT}/`);
  console.log("현재 디렉토리 : ", process.cwd());
});
