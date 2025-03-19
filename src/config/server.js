export const SERVER_CONFIG = {
  PORT: 3030,
  PUBLIC_DIR: 'public',
  CACHE_DURATION: 86400, // 1일 (초 단위)
  DEFAULT_CHARSET: 'utf-8',
  CORS: {
    ALLOW_ORIGIN: '*',
    ALLOW_HEADERS: 'Origin, X-Requested-With, Content-Type, Accept',
    ALLOW_METHODS: 'GET, POST, PUT, DELETE, OPTIONS'
  }
}; 