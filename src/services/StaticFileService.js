import path from 'path';
import { StaticFileModel } from '../models/StaticFileModel.js';
import { getContentType } from '../utils/mimeTypes.js';
import { SERVER_CONFIG } from '../config/server.js';
import { MIME_CONFIG } from '../config/mime.js';

export class StaticFileService {
  constructor(publicDir) {
    this.model = new StaticFileModel(publicDir);
  }

  async serveFile(url, res) {
    try {
      const filePath = this.model.getFilePath(url);
      const content = await this.model.getFile(filePath);
      const contentType = getContentType(filePath);
      
      // CSS와 JS 파일에 대한 캐시 설정
      if (MIME_CONFIG.CACHEABLE_EXTENSIONS.includes(path.extname(filePath))) {
        res.setHeader('Cache-Control', `public, max-age=${SERVER_CONFIG.CACHE_DURATION}`);
      }

      res.writeHead(200, { 
        'Content-Type': `${contentType}; charset=${SERVER_CONFIG.DEFAULT_CHARSET}` 
      });
      res.end(content);
    } catch (error) {
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