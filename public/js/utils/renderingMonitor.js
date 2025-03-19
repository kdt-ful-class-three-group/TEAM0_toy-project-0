/**
 * @file renderingMonitor.js
 * @description UI 컴포넌트 렌더링 상태를 모니터링하고 검사하는 유틸리티
 */

/**
 * 렌더링 모니터 설정
 */
const config = {
  isDebugMode: false,
  logLevel: 'info', // 'error', 'warn', 'info', 'debug'
  maxRenderTime: 100, // ms
  trackMountTime: true,
  trackUnmountTime: true,
  trackUpdateTime: true,
  enableStackTrace: true
};

/**
 * 렌더링 로그 저장소
 */
const renderingLogs = [];

/**
 * 렌더링 중인 컴포넌트 트래커
 */
const renderingTracker = new Map();

/**
 * 렌더링 성능 측정 히스토리
 */
const renderingPerformance = new Map();

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
  switch (config.logLevel.toLowerCase()) {
    case 'error': return LOG_LEVELS.ERROR;
    case 'warn': return LOG_LEVELS.WARN;
    case 'info': return LOG_LEVELS.INFO;
    case 'debug': return LOG_LEVELS.DEBUG;
    default: return LOG_LEVELS.INFO;
  }
};

/**
 * 로그 출력 함수
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 */
const log = (level, message, data = {}) => {
  const logLevel = level.toLowerCase();
  const currentLevel = getCurrentLogLevel();
  const timestamp = new Date().toISOString();
  
  // 현재 설정된 로그 레벨에 맞는 경우만 출력
  if ((logLevel === 'error' && currentLevel >= LOG_LEVELS.ERROR) ||
      (logLevel === 'warn' && currentLevel >= LOG_LEVELS.WARN) ||
      (logLevel === 'info' && currentLevel >= LOG_LEVELS.INFO) ||
      (logLevel === 'debug' && currentLevel >= LOG_LEVELS.DEBUG)) {
    
    const logEntry = {
      level: logLevel,
      timestamp,
      message,
      data,
      stack: config.enableStackTrace ? new Error().stack : undefined
    };
    
    renderingLogs.push(logEntry);
    
    // 디버그 모드에서만 콘솔에 출력
    if (config.isDebugMode) {
      switch (logLevel) {
        case 'error':
          console.error(`[${timestamp}] [RENDER ERROR] ${message}`, data);
          break;
        case 'warn':
          console.warn(`[${timestamp}] [RENDER WARN] ${message}`, data);
          break;
        case 'info':
          console.info(`[${timestamp}] [RENDER INFO] ${message}`, data);
          break;
        case 'debug':
          console.debug(`[${timestamp}] [RENDER DEBUG] ${message}`, data);
          break;
      }
    }
  }
};

/**
 * 렌더링 시작 기록
 * @param {string} componentId - 컴포넌트 ID
 * @param {string} [action='render'] - 렌더링 액션 유형
 */
export const startRendering = (componentId, action = 'render') => {
  if (!componentId) {
    log('warn', '컴포넌트 ID가 없이 렌더링 시작 호출됨');
    return;
  }
  
  const startTime = performance.now();
  renderingTracker.set(componentId, {
    action,
    startTime,
    status: 'in-progress'
  });
  
  log('debug', `${componentId} ${action} 시작`, { startTime });
};

/**
 * 렌더링 완료 기록
 * @param {string} componentId - 컴포넌트 ID
 * @param {boolean} [success=true] - 렌더링 성공 여부
 * @param {Object} [data={}] - 추가 데이터
 */
export const endRendering = (componentId, success = true, data = {}) => {
  if (!componentId) {
    log('warn', '컴포넌트 ID가 없이 렌더링 종료 호출됨');
    return;
  }
  
  const endTime = performance.now();
  const renderInfo = renderingTracker.get(componentId);
  
  if (!renderInfo) {
    log('warn', `${componentId} 렌더링 종료 호출됐지만 시작 정보가 없음`);
    return;
  }
  
  const { startTime, action } = renderInfo;
  const duration = endTime - startTime;
  
  // 성능 기록 저장
  if (!renderingPerformance.has(componentId)) {
    renderingPerformance.set(componentId, {
      renders: 0,
      totalDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      lastDuration: 0,
      failures: 0
    });
  }
  
  const perfStats = renderingPerformance.get(componentId);
  
  if (success) {
    perfStats.renders++;
    perfStats.totalDuration += duration;
    perfStats.lastDuration = duration;
    perfStats.maxDuration = Math.max(perfStats.maxDuration, duration);
    perfStats.minDuration = Math.min(perfStats.minDuration, duration);
  } else {
    perfStats.failures++;
  }
  
  renderingPerformance.set(componentId, perfStats);
  
  // 렌더링 상태 업데이트
  renderingTracker.set(componentId, {
    ...renderInfo,
    endTime,
    duration,
    status: success ? 'completed' : 'failed',
    data
  });
  
  // 로그 출력
  if (success) {
    const logLevel = duration > config.maxRenderTime ? 'warn' : 'info';
    log(logLevel, `${componentId} ${action} 완료`, {
      duration: `${duration.toFixed(2)}ms`,
      ...data
    });
  } else {
    log('error', `${componentId} ${action} 실패`, {
      duration: `${duration.toFixed(2)}ms`,
      error: data.error || '알 수 없는 오류',
      ...data
    });
  }
};

/**
 * 렌더링 도중 오류 발생 처리
 * @param {string} componentId - 컴포넌트 ID
 * @param {Error} error - 발생한 오류
 * @param {Object} [context={}] - 오류 발생 컨텍스트
 */
export const renderingError = (componentId, error, context = {}) => {
  if (!componentId) {
    log('error', '컴포넌트 ID가 없이 렌더링 오류 호출됨', { error });
    return;
  }
  
  log('error', `${componentId} 렌더링 중 오류 발생`, {
    error: error.message,
    stack: error.stack,
    ...context
  });
  
  endRendering(componentId, false, { error: error.message, ...context });
};

/**
 * 렌더링 상태 확인
 * @param {string} componentId - 컴포넌트 ID
 * @returns {Object|null} 렌더링 상태 정보
 */
export const checkRenderingStatus = (componentId) => {
  if (!componentId) return null;
  return renderingTracker.get(componentId) || null;
};

/**
 * 활성 렌더링 목록 가져오기
 * @returns {Array} 활성 렌더링 컴포넌트 목록
 */
export const getActiveRenderings = () => {
  const active = [];
  
  renderingTracker.forEach((info, componentId) => {
    if (info.status === 'in-progress') {
      active.push({
        componentId,
        startTime: info.startTime,
        action: info.action,
        elapsedTime: performance.now() - info.startTime
      });
    }
  });
  
  return active;
};

/**
 * 렌더링 성능 통계 가져오기
 * @param {string} [componentId] - 특정 컴포넌트 ID (생략 시 모든 컴포넌트)
 * @returns {Object} 렌더링 성능 통계
 */
export const getRenderingStats = (componentId) => {
  if (componentId) {
    return renderingPerformance.get(componentId) || null;
  }
  
  const stats = {};
  renderingPerformance.forEach((perfInfo, id) => {
    stats[id] = perfInfo;
  });
  
  return stats;
};

/**
 * 렌더링 로그 가져오기
 * @param {number} [limit=50] - 가져올 최대 로그 수
 * @param {string} [level] - 필터링할 로그 레벨 (생략 시 모든 레벨)
 * @returns {Array} 렌더링 로그 배열
 */
export const getRenderingLogs = (limit = 50, level) => {
  let filteredLogs = [...renderingLogs];
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level.toLowerCase());
  }
  
  // 최신 로그부터 반환
  return filteredLogs.reverse().slice(0, limit);
};

/**
 * 구성 변경
 * @param {Object} newConfig - 새 구성 설정
 */
export const configure = (newConfig = {}) => {
  Object.assign(config, newConfig);
  log('info', '렌더링 모니터 구성 변경됨', { ...config });
};

/**
 * 디버그 모드 설정
 * @param {boolean} enabled - 활성화 여부
 */
export const setDebugMode = (enabled) => {
  config.isDebugMode = !!enabled;
  log('info', `디버그 모드 ${enabled ? '활성화' : '비활성화'}`);
};

/**
 * 로그 레벨 설정
 * @param {string} level - 로그 레벨 ('error', 'warn', 'info', 'debug')
 */
export const setLogLevel = (level) => {
  if (['error', 'warn', 'info', 'debug'].includes(level.toLowerCase())) {
    config.logLevel = level.toLowerCase();
    log('info', `로그 레벨 변경: ${level}`);
  } else {
    log('warn', `유효하지 않은 로그 레벨: ${level}`);
  }
};

/**
 * 모든 로그 및 성능 데이터 초기화
 */
export const clearAll = () => {
  renderingLogs.length = 0;
  renderingTracker.clear();
  renderingPerformance.clear();
  log('info', '모든 렌더링 로그 및 성능 데이터 초기화됨');
};

// 기본 설정으로 모듈 초기화
log('info', '렌더링 모니터 초기화됨', config);

// 외부에서 사용할 API 내보내기
export default {
  startRendering,
  endRendering,
  renderingError,
  checkRenderingStatus,
  getActiveRenderings,
  getRenderingStats,
  getRenderingLogs,
  configure,
  setDebugMode,
  setLogLevel,
  clearAll
}; 