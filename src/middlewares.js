/**
 * 공통 미들웨어 기능을 담당하는 파일
 */
import { SERVER_CONFIG } from './config/server.js';

export class Middleware {
  /**
   * CORS 헤더를 설정하는 미들웨어
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   */
  static setCorsHeaders(req, res) {
    res.setHeader('Access-Control-Allow-Origin', SERVER_CONFIG.CORS.ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', SERVER_CONFIG.CORS.ALLOW_HEADERS);
    res.setHeader('Access-Control-Allow-Methods', SERVER_CONFIG.CORS.ALLOW_METHODS);
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return true;
    }
    
    return false;
  }

  /**
   * 요청 로깅 미들웨어
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   */
  static logRequest(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    return false;
  }

  /**
   * 모든 미들웨어를 실행하는 메서드
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   * @returns {boolean} - 미들웨어가 요청을 처리했는지 여부
   */
  static applyAll(req, res) {
    // 요청 로깅
    Middleware.logRequest(req, res);
    
    // CORS 헤더 설정
    return Middleware.setCorsHeaders(req, res);
  }
} 