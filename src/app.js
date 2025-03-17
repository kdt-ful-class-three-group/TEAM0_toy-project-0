// Start Generation Here
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3030;

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    // CSS 파일에 대한 헤더 설정
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      // 개발 환경에서는 캐시를 비활성화
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // JavaScript 파일에 대한 헤더 설정
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  },
  extensions: ['html', 'css', 'js'], // 확장자 없는 요청에 대한 처리
  index: false // index.html 자동 제공 비활성화
}));

// CORS 설정 (개발 환경을 위한 설정)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// CSS 파일 요청 처리
app.get('/**/*.css', (req, res, next) => {
  const cssPath = path.join(process.cwd(), 'public', req.path);
  res.type('text/css');
  res.sendFile(cssPath, (err) => {
    if (err) {
      console.error(`CSS 파일 로드 실패: ${req.path}`, err);
      next();
    }
  });
});

// JavaScript 파일 요청 처리
app.get('/**/*.js', (req, res, next) => {
  const jsPath = path.join(process.cwd(), 'public', req.path);
  res.type('application/javascript');
  res.sendFile(jsPath, (err) => {
    if (err) {
      console.error(`JavaScript 파일 로드 실패: ${req.path}`, err);
      next();
    }
  });
});

// 메인 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 404 에러 처리
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js)$/)) {
    console.error(`파일을 찾을 수 없음: ${req.path}`);
    res.status(404).send(`파일을 찾을 수 없습니다: ${req.path}`);
  } else {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  }
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).send('서버 에러가 발생했습니다.');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}/ 에서 실행 중입니다.`);
  console.log(`정적 파일 제공 경로: ${path.join(process.cwd(), 'public')}`);
  console.log('캐시 비활성화 모드로 실행 중');
});
