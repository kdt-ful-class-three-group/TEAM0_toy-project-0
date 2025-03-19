/**
 * @file logger.js
 * @description 애플리케이션의 로깅 시스템 구현
 */

/**
 * 개발자 도구가 열려있는지 확인하는 함수 (근사치)
 * @returns {boolean} 개발자 도구 열림 여부
 */
function isDevToolsOpen() {
  // 디버깅 힌트를 감지하는 간단한 방법
  const heightThreshold = window.outerHeight - window.innerHeight > 200;
  const widthThreshold = window.outerWidth - window.innerWidth > 200;
  return heightThreshold || widthThreshold;
}

/**
 * @type {Object} 환경 설정
 */
const env = {
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  logLevel: 'info',
  suppressExtensionErrors: true,  // 확장 프로그램 관련 오류 억제
  consoleEnabled: true,
  // 개발자 도구가 열려 있는지 확인 (근사치)
  devToolsOpen: isDevToolsOpen()
};

/**
 * 로그 레벨 상수
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * 현재 로그 레벨 가져오기
 * @returns {number} 로그 레벨 값
 */
const getCurrentLogLevel = () => {
  switch (env.logLevel.toLowerCase()) {
    case 'error': return LOG_LEVELS.ERROR;
    case 'warn': return LOG_LEVELS.WARN;
    case 'info': return LOG_LEVELS.INFO;
    case 'debug': return LOG_LEVELS.DEBUG;
    default: return LOG_LEVELS.INFO;
  }
};

/**
 * 로그 히스토리 저장소
 */
const logHistory = [];

/**
 * 확장 프로그램 오류 메시지 필터
 * @param {string} message - 오류 메시지
 * @returns {boolean} 필터링 여부
 */
const isExtensionError = (message) => {
  if (!message) return false;
  
  const extensionErrorPatterns = [
    'message channel closed',
    'asynchronous response',
    'runtime.lastError',
    'injected.js',
    'content.js',
    'contentScript',
    'tronWeb',
    'TronLink',
    'tabReply',
    'Provider initialised'
  ];
  
  return extensionErrorPatterns.some(pattern => 
    String(message).includes(pattern)
  );
};

/**
 * 로그 출력 함수
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 * @returns {Object} 로그 항목
 */
const createLogEntry = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const stack = env.isDevelopment ? new Error().stack : undefined;
  
  return {
    level,
    timestamp,
    message,
    data,
    stack
  };
};

/**
 * 확장 프로그램 관련 오류를 필터링하고 로그 출력
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 */
const logWithFilter = (level, message, data = {}) => {
  // 확장 프로그램 오류 필터링
  if (env.suppressExtensionErrors && isExtensionError(message)) {
    // 디버그 레벨에서만 확장 프로그램 오류 로깅
    if (getCurrentLogLevel() >= LOG_LEVELS.DEBUG) {
      console.debug(`[확장 프로그램 오류 필터링됨] ${message}`);
    }
    return;
  }
  
  const logEntry = createLogEntry(level, message, data);
  logHistory.push(logEntry);
  
  // 콘솔 출력이 비활성화된 경우 중단
  if (!env.consoleEnabled) {
    return;
  }
  
  const currentLevel = getCurrentLogLevel();
  const msgLevel = LOG_LEVELS[level.toUpperCase()];
  
  // 현재 설정된 로그 레벨보다 낮은 로그는 출력하지 않음
  if (msgLevel > currentLevel) {
    return;
  }
  
  // 콘솔에 출력
  const prefix = `[${level.toUpperCase()}]`;
  
  switch (level) {
    case 'error':
      console.error(prefix, message, data);
      break;
    case 'warn':
      console.warn(prefix, message, data);
      break;
    case 'info':
      console.info(prefix, message, data);
      break;
    case 'debug':
      console.debug(prefix, message, data);
      break;
    default:
      console.log(prefix, message, data);
  }
};

/**
 * 로거 인스턴스 생성
 * @param {string} [namespace='app'] - 로거 네임스페이스
 * @returns {Object} 로거 인스턴스
 */
export const createLogger = (namespace = 'app') => {
  return {
    error: (message, data = {}) => logWithFilter('error', `[${namespace}] ${message}`, data),
    warn: (message, data = {}) => logWithFilter('warn', `[${namespace}] ${message}`, data),
    info: (message, data = {}) => logWithFilter('info', `[${namespace}] ${message}`, data),
    debug: (message, data = {}) => logWithFilter('debug', `[${namespace}] ${message}`, data),
    
    /**
     * 로그 레벨 설정
     * @param {string} level - 새 로그 레벨
     */
    setLevel(level) {
      if (['error', 'warn', 'info', 'debug'].includes(level.toLowerCase())) {
        env.logLevel = level.toLowerCase();
        this.info(`로그 레벨 변경: ${level}`);
      } else {
        this.warn(`유효하지 않은 로그 레벨: ${level}`);
      }
    },
    
    /**
     * 확장 프로그램 오류 필터링 설정
     * @param {boolean} suppress - 필터링 여부
     */
    suppressExtensionErrors(suppress) {
      env.suppressExtensionErrors = !!suppress;
      this.info(`확장 프로그램 오류 필터링: ${suppress ? '활성화' : '비활성화'}`);
    },
    
    /**
     * 콘솔 출력 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    enableConsole(enabled) {
      env.consoleEnabled = !!enabled;
      this.info(`콘솔 출력: ${enabled ? '활성화' : '비활성화'}`);
    },
    
    /**
     * 로그 히스토리 가져오기
     * @param {number} [limit=100] - 가져올 최대 항목 수
     * @param {string} [filterLevel] - 필터링할 로그 레벨
     * @returns {Array} 로그 항목 배열
     */
    getHistory(limit = 100, filterLevel) {
      let logs = [...logHistory];
      
      if (filterLevel) {
        logs = logs.filter(log => log.level === filterLevel.toLowerCase());
      }
      
      // 최신 로그부터 가져오기
      return logs.reverse().slice(0, limit);
    },
    
    /**
     * 로그 히스토리 지우기
     */
    clearHistory() {
      logHistory.length = 0;
      this.info('로그 히스토리 초기화됨');
    }
  };
};

// 기본 로거 인스턴스
const logger = createLogger();

// 브라우저 확장 프로그램 관련 오류 처리
if (typeof window !== 'undefined') {
  // Chrome 확장 프로그램 런타임 오류 관련 처리기 등록
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.message) || isExtensionError(event.filename)) {
      event.preventDefault();
      if (getCurrentLogLevel() >= LOG_LEVELS.DEBUG) {
        logger.debug('확장 프로그램 오류 차단됨', { 
          message: event.message,
          source: event.filename
        });
      }
      return true;
    }
  }, true);
  
  // 처리되지 않은 Promise 거부 처리
  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.preventDefault();
      if (getCurrentLogLevel() >= LOG_LEVELS.DEBUG) {
        logger.debug('확장 프로그램 관련 Promise 거부 차단됨', { 
          reason: String(event.reason).substring(0, 100) 
        });
      }
    }
  });
}

// 개발자 도구에서 접근할 수 있도록 등록
if (env.isDevelopment) {
  window.__LOGGER__ = logger;
}

export default logger; 