import path from 'path';
import { StaticFileModel } from '../models/StaticFileModel.js';
import { getContentType } from '../utils/mimeTypes.js';
import { SERVER_CONFIG } from '../config/server.js';
import { MIME_CONFIG } from '../config/mime.js';

/**
 * 정적 파일 제공 서비스
 */
export class StaticFileService {
  /**
   * StaticFileService 클래스의 새 인스턴스를 생성합니다.
   * @param {string} publicDir - 정적 파일이 있는 디렉토리 경로
   */
  constructor(publicDir) {
    this.model = new StaticFileModel(publicDir);
  }

  /**
   * 파일 확장자에 따른 적절한 캐싱 헤더를 설정합니다.
   * @param {string} filePath - 파일 경로
   * @param {Object} res - HTTP 응답 객체
   */
  setCacheHeaders(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    
    // 장기간 캐싱
    if (MIME_CONFIG.CACHE.LONG_TERM.EXTENSIONS.includes(ext)) {
      res.setHeader('Cache-Control', `public, max-age=${MIME_CONFIG.CACHE.LONG_TERM.DURATION}`);
      return;
    }
    
    // 중기간 캐싱
    if (MIME_CONFIG.CACHE.MEDIUM_TERM.EXTENSIONS.includes(ext)) {
      res.setHeader('Cache-Control', `public, max-age=${MIME_CONFIG.CACHE.MEDIUM_TERM.DURATION}`);
      return;
    }
    
    // 단기간 캐싱
    if (MIME_CONFIG.CACHE.SHORT_TERM.EXTENSIONS.includes(ext)) {
      res.setHeader('Cache-Control', `public, max-age=${MIME_CONFIG.CACHE.SHORT_TERM.DURATION}`);
      return;
    }
    
    // 캐싱하지 않는 파일
    if (MIME_CONFIG.CACHE.NO_CACHE.EXTENSIONS.includes(ext)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return;
    }
    
    // 기본 캐싱 설정 (이전 버전 호환성)
    if (MIME_CONFIG.CACHEABLE_EXTENSIONS.includes(ext)) {
      res.setHeader('Cache-Control', `public, max-age=${SERVER_CONFIG.CACHE_DURATION}`);
    }
  }

  /**
   * 요청된 URL에 해당하는 정적 파일을 제공합니다.
   * @param {string} url - 요청 URL
   * @param {Object} res - HTTP 응답 객체
   */
  async serveFile(url, res) {
    let filePath;
    try {
      filePath = await this.model.getFilePath(url);
      const content = await this.model.getFile(filePath);
      const contentType = getContentType(filePath);
      
      // 캐싱 헤더 설정
      this.setCacheHeaders(filePath, res);

      res.writeHead(200, { 
        'Content-Type': `${contentType}; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
      });
      res.end(content);
    } catch (error) {
      // 경로 보안 오류 처리
      if (error.code === 'UNSAFE_PATH' || error.code === 'UNAUTHORIZED_PATH') {
        console.error('보안 위반 시도:', url);
        res.writeHead(403, { 
          'Content-Type': `text/plain; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
        });
        res.end('접근이 금지되었습니다.');
        return;
      }
      
      if (error.code === 'ENOENT') {
        // 파일을 찾을 수 없는 경우
        if (MIME_CONFIG.CACHEABLE_EXTENSIONS.includes(path.extname(filePath))) {
          console.error(`파일을 찾을 수 없음: ${filePath}`);
          res.writeHead(404, { 
            'Content-Type': `text/plain; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
          });
          res.end(`파일을 찾을 수 없습니다: ${filePath}`);
        } else {
          // HTML 파일이 아닌 경우 index.html로 대체
          try {
            const indexContent = await this.model.getFile(
              path.join(this.model.publicDir, MIME_CONFIG.DEFAULT_INDEX)
            );
            res.writeHead(200, { 
              'Content-Type': `text/html; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
            });
            res.end(indexContent);
          } catch (indexError) {
            res.writeHead(500, { 
              'Content-Type': `text/plain; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
            });
            res.end('서버 에러가 발생했습니다.');
          }
        }
      } else {
        // 서버 에러
        console.error('서버 에러:', error);
        res.writeHead(500, { 
          'Content-Type': `text/plain; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
        });
        res.end('서버 에러가 발생했습니다.');
      }
    }
  }
} 