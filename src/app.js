// Start Generation Here
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { StaticFileController } from './controllers/StaticFileController.js';
import { TeamDataController } from './controllers/TeamDataController.js';
import { SERVER_CONFIG } from './config/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(process.cwd(), SERVER_CONFIG.PUBLIC_DIR);

// MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  'default': 'application/octet-stream'
};

// 정적 파일 제공 함수
const serveStaticFile = (filePath, res) => {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || MIME_TYPES['default'];
  
  // CSS와 JS 파일에 대한 캐시 설정
  if (extname === '.css' || extname === '.js') {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1일 캐시
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 파일을 찾을 수 없는 경우
        if (extname === '.css' || extname === '.js') {
          console.error(`파일을 찾을 수 없음: ${filePath}`);
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`파일을 찾을 수 없습니다: ${filePath}`);
        } else {
          // HTML 파일이 아닌 경우 index.html로 대체
          fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
              res.end('서버 에러가 발생했습니다.');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
          });
        }
      } else {
        // 서버 에러
        console.error('서버 에러:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('서버 에러가 발생했습니다.');
      }
      return;
    }
    
    // 파일 존재하는 경우 성공적으로 제공
    res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
    res.end(content);
  });
};

// API 요청 처리
const handleApiRequest = async (req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      let data = {};
      if (req.method === 'POST') {
        data = JSON.parse(body);
      }
      
      switch (req.url) {
        case '/api/teams':
          if (req.method === 'POST') {
            const result = await teamDataController.saveTeamData(data);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
          } else if (req.method === 'GET') {
            const result = await teamDataController.getCurrentTeamData();
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '지원하지 않는 HTTP 메서드입니다.' }));
          }
          break;
        default:
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'API 엔드포인트를 찾을 수 없습니다.' }));
      }
    } catch (error) {
      console.error('API 요청 처리 중 오류 발생:', error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }));
    }
  });
};

// 컨트롤러 초기화
const staticController = new StaticFileController(PUBLIC_DIR);
const teamDataController = new TeamDataController();

// 서버 생성
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
  } else {
    staticController.handleRequest(req, res);
  }
});

// 서버 시작
server.listen(SERVER_CONFIG.PORT, () => {
  console.log(`서버가 http://localhost:${SERVER_CONFIG.PORT}/ 에서 실행 중입니다.`);
  console.log(`정적 파일 제공 경로: ${PUBLIC_DIR}`);
  console.log(`캐시 활성화 모드로 실행 중 (${SERVER_CONFIG.CACHE_DURATION}초 기간)`);
});
