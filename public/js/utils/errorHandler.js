/**
 * @file utils/errorHandler.js
 * @description 애플리케이션 전반의 오류를 처리하는 중앙화된 오류 처리 모듈입니다.
 */

// 오류 타입 정의
export const ErrorType = {
  VALIDATION: 'validation',
  DATA: 'data',
  UI: 'ui',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

// 오류 심각도 정의
export const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * 사용자 정의 오류 클래스
 */
export class AppError extends Error {
  /**
   * AppError 생성자
   * @param {string} message - 오류 메시지
   * @param {string} type - 오류 유형 (ErrorType에서 정의된 값)
   * @param {string} severity - 오류 심각도 (Severity에서 정의된 값)
   * @param {Object} details - 추가 세부 정보
   */
  constructor(message, type = ErrorType.UNKNOWN, severity = Severity.ERROR, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * 유효성 검사 오류 클래스
 */
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, ErrorType.VALIDATION, Severity.WARNING, details);
    this.name = 'ValidationError';
  }
}

/**
 * 데이터 처리 오류 클래스
 */
export class DataError extends AppError {
  constructor(message, details = {}) {
    super(message, ErrorType.DATA, Severity.ERROR, details);
    this.name = 'DataError';
  }
}

/**
 * UI 오류 클래스
 */
export class UIError extends AppError {
  constructor(message, details = {}) {
    super(message, ErrorType.UI, Severity.WARNING, details);
    this.name = 'UIError';
  }
}

/**
 * 통합 오류 핸들러
 * @param {Error} error - 발생한 오류
 * @param {Function} uiCallback - UI 업데이트를 위한 콜백 함수
 */
export const handleError = (error, uiCallback = null) => {
  const appError = error instanceof AppError 
    ? error 
    : new AppError(error.message || '알 수 없는 오류가 발생했습니다.');
  
  // 콘솔에 오류 기록
  logError(appError);
  
  // UI 콜백이 있으면 실행
  if (uiCallback && typeof uiCallback === 'function') {
    uiCallback(appError);
  } else {
    // 기본 UI 피드백 (심각도에 따라 다른 처리)
    if (appError.severity === Severity.CRITICAL) {
      alert(`심각한 오류: ${appError.message}`);
    } else if (appError.severity === Severity.ERROR && appError.type !== ErrorType.VALIDATION) {
      console.error(`오류: ${appError.message}`);
    }
  }
  
  return appError;
};

/**
 * 오류 로깅 함수
 * @param {AppError} error - 기록할 오류
 */
const logError = (error) => {
  switch (error.severity) {
    case Severity.INFO:
      console.info(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
      break;
    case Severity.WARNING:
      console.warn(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
      break;
    case Severity.ERROR:
    case Severity.CRITICAL:
      console.error(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
      break;
    default:
      console.log(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
  }
};

/**
 * UI 요소에 메시지를 표시합니다.
 * @param {Element} element - 메시지를 표시할 요소
 * @param {string} message - 표시할 메시지
 * @param {string} className - 추가할 CSS 클래스 ('error', 'success', 'info', 'warning')
 */
export const showUIError = (element, message, className = 'error') => {
  if (!element) return;
  
  // 이전 메시지 관련 클래스 제거
  element.classList.remove('error', 'success', 'info', 'warning');
  
  // 새 클래스 추가
  element.classList.add(className);
  
  // 메시지 표시
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    // 폼 요소인 경우
    if (className === 'error') {
      element.setAttribute('aria-invalid', 'true');
    } else {
      element.removeAttribute('aria-invalid');
    }
    
    element.setAttribute('title', message);
    
    // 인접한 메시지 요소 찾거나 생성
    let messageElement = element.nextElementSibling;
    if (!messageElement || !messageElement.classList.contains('message-container')) {
      messageElement = document.createElement('div');
      messageElement.className = 'message-container';
      element.parentNode.insertBefore(messageElement, element.nextSibling);
    }
    
    // 기존 클래스 제거
    messageElement.classList.remove('error-message', 'success-message', 'info-message', 'warning-message');
    // 새 클래스 추가
    messageElement.classList.add(`${className}-message`);
    
    messageElement.textContent = message;
    
    if (className === 'error' || className === 'warning') {
      messageElement.setAttribute('role', 'alert');
    } else {
      messageElement.setAttribute('role', 'status');
    }
    
    // 2초 후 성공/정보 메시지 사라지게 처리
    if (className === 'success' || className === 'info') {
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.textContent = '';
          messageElement.removeAttribute('role');
          messageElement.classList.remove(`${className}-message`);
        }
      }, 2000);
    }
  } else {
    // 일반 요소인 경우
    if (className === 'error' || className === 'warning') {
      element.setAttribute('role', 'alert');
    } else {
      element.setAttribute('role', 'status');
    }
    
    element.textContent = message;
    
    // 2초 후 성공/정보 메시지 사라지게 처리
    if (className === 'success' || className === 'info') {
      setTimeout(() => {
        if (element.textContent === message) {
          element.textContent = '';
          element.removeAttribute('role');
          element.classList.remove(className);
        }
      }, 2000);
    }
  }
};

/**
 * 특정 모듈에 특화된 로거를 생성합니다.
 * @param {string} moduleName - 모듈 이름
 * @returns {Object} 로거 객체
 */
export const createErrorLogger = (moduleName) => {
  return {
    info: (message, details = {}) => {
      console.info(`[${moduleName}] ${message}`, details);
    },
    warn: (message, details = {}) => {
      console.warn(`[${moduleName}] ${message}`, details);
    },
    error: (message, details = {}) => {
      console.error(`[${moduleName}] ${message}`, details);
      return new AppError(message, ErrorType.UNKNOWN, Severity.ERROR, details);
    }
  };
}; 