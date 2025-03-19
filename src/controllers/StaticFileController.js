import path from 'path';
import { StaticFileService } from '../services/StaticFileService.js';
import { SERVER_CONFIG } from '../config/server.js';
import { MIME_CONFIG } from '../config/mime.js';

export class StaticFileController {
  constructor(publicDir) {
    this.service = new StaticFileService(publicDir);
  }

  handleRequest(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', SERVER_CONFIG.CORS.ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', SERVER_CONFIG.CORS.ALLOW_HEADERS);
    res.setHeader('Access-Control-Allow-Methods', SERVER_CONFIG.CORS.ALLOW_METHODS);
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // URL 정규화
    let url = req.url;
    if (url.endsWith('/')) {
      url += MIME_CONFIG.DEFAULT_INDEX;
    }
    
    // 정적 파일 제공
    this.service.serveFile(url, res);
  }
} 