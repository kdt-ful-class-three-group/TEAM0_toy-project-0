/**
 * HTTP 서버 생성 및 시작을 담당하는 파일
 */
import http from 'http';
import path from 'path';
import { StaticFileController } from './controllers/StaticFileController.js';
import { Router } from './routes.js';
import { Middleware } from './middlewares.js';
import { SERVER_CONFIG } from './config/server.js';

export class Server {
  constructor() {
    this.port = SERVER_CONFIG.PORT;
    this.publicDir = path.join(process.cwd(), SERVER_CONFIG.PUBLIC_DIR);
    
    this.staticController = new StaticFileController(this.publicDir);
    this.router = new Router();
    
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * 모든 HTTP 요청을 처리하는 핸들러
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   */
  async handleRequest(req, res) {
    // 미들웨어 적용
    if (Middleware.applyAll(req, res)) {
      return;
    }
    
    // API 라우팅 처리
    if (req.url.startsWith('/api/')) {
      await this.router.handleRequest(req, res);
    } else {
      // 정적 파일 제공
      this.staticController.handleRequest(req, res);
    }
  }

  /**
   * 서버 시작
   */
  start() {
    this.server.listen(3030, '0.0.0.0', () => {
      console.log(`서버가 http://0.0.0.0:${this.port}/ 에서 실행 중입니다.`);
      console.log(`정적 파일 제공 경로: ${this.publicDir}`);
      console.log(`캐시 활성화 모드로 실행 중 (${SERVER_CONFIG.CACHE_DURATION}초 기간)`);
    });
  }
}

// 서버 인스턴스를 생성하고 시작하는 함수
export const startServer = () => {
  const server = new Server();
  server.start();
  return server;
}; 