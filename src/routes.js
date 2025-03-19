/**
 * API 라우팅을 담당하는 파일
 */
import { TeamDataController } from './controllers/TeamDataController.js';
import { validateTeamData } from './utils/validators.js';

export class Router {
  constructor() {
    this.teamDataController = new TeamDataController();
    this.routes = {
      '/api/teams': this.handleTeamsRoute.bind(this)
    };
  }

  /**
   * 요청된 경로에 맞는 핸들러를 찾아 실행합니다.
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   * @returns {boolean} 라우팅 처리 여부 (true: 처리됨, false: 처리되지 않음)
   */
  async handleRequest(req, res) {
    const handler = this.routes[req.url];
    
    if (handler) {
      await handler(req, res);
      return true;
    }
    
    // API 요청이지만 핸들러가 없는 경우
    if (req.url.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'API 엔드포인트를 찾을 수 없습니다.' }));
      return true;
    }
    
    return false;
  }

  /**
   * /api/teams 경로에 대한 요청 처리
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   */
  async handleTeamsRoute(req, res) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        let data = {};
        if (req.method === 'POST') {
          data = JSON.parse(body);
          
          // 디버깅용: 실제 받은 데이터 구조 로깅
          console.log('클라이언트에서 받은 데이터:', JSON.stringify(data, null, 2));
          
          // 수정된 유효성 검사 로직
          const validation = validateTeamData(data);
          if (!validation.valid) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
              success: false, 
              message: '유효하지 않은 데이터 형식입니다.',
              errors: validation.errors
            }));
            return;
          }
        }
        
        if (req.method === 'POST') {
          const result = await this.teamDataController.saveTeamData(data);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } else if (req.method === 'GET') {
          const result = await this.teamDataController.getCurrentTeamData();
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '지원하지 않는 HTTP 메서드입니다.' }));
        }
      } catch (error) {
        console.error('API 요청 처리 중 오류 발생:', error);
        
        // JSON 파싱 오류 처리
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '유효하지 않은 JSON 형식입니다.' }));
          return;
        }
        
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }));
      }
    });
  }
} 