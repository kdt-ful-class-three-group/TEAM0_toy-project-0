/**
 * 서버 설정
 * 환경 변수를 통해 설정 가능하며, 환경 변수가 없는 경우 기본값을 사용합니다.
 */
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3030,
  PUBLIC_DIR: process.env.PUBLIC_DIR || 'public',
  CACHE_DURATION: process.env.CACHE_DURATION || 86400, // 1일 (초 단위)
  DEFAULT_CHARSET: process.env.DEFAULT_CHARSET || 'utf-8',
  CORS: {
    ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN || '*',
    ALLOW_HEADERS: process.env.CORS_ALLOW_HEADERS || 'Origin, X-Requested-With, Content-Type, Accept',
    ALLOW_METHODS: process.env.CORS_ALLOW_METHODS || 'GET, POST, PUT, DELETE, OPTIONS'
  },
  DATA: {
    ROOT_DIR: process.env.DATA_ROOT_DIR || 'data',
    CURRENT_DIR: process.env.DATA_CURRENT_DIR || 'current',
    ARCHIVING_DIR: process.env.DATA_ARCHIVING_DIR || 'archiving',
    HISTORY_DIR: process.env.DATA_HISTORY_DIR || 'history',
    TEAMS_DIR: process.env.DATA_TEAMS_DIR || 'teams'
  }
}; 