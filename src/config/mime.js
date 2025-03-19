/**
 * MIME 타입 및 파일 캐싱 관련 설정
 */
export const MIME_CONFIG = {
  // MIME 타입 정의
  TYPES: {
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
  },
  
  // 캐싱 설정
  CACHE: {
    // 장기간 캐싱 (1주일)
    LONG_TERM: {
      EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf'],
      DURATION: 604800 // 1주일 (초 단위)
    },
    // 중기간 캐싱 (1일)
    MEDIUM_TERM: {
      EXTENSIONS: ['.css', '.js'],
      DURATION: 86400 // 1일 (초 단위)
    },
    // 단기간 캐싱 (1시간)
    SHORT_TERM: {
      EXTENSIONS: ['.json'],
      DURATION: 3600 // 1시간 (초 단위)
    },
    // 캐싱하지 않는 확장자
    NO_CACHE: {
      EXTENSIONS: ['.html', '.txt']
    }
  },
  
  // 이전 버전과의 호환성 유지
  CACHEABLE_EXTENSIONS: ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'],
  
  // 기본 인덱스 파일
  DEFAULT_INDEX: 'index.html'
}; 