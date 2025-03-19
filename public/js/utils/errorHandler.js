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
 * UI에 오류 메시지를 표시
 * @param {HTMLElement|string} elementOrMessage - 오류를 표시할 요소 또는 메시지 문자열
 * @param {string} [message] - 오류 메시지 (첫 번째 인자가 요소인 경우)
 * @param {string} [className='error'] - 추가할 CSS 클래스
 */
export const showUIError = (elementOrMessage, message, className = 'error') => {
  try {
    // 첫 번째 매개변수가 문자열인 경우, 토스트 알림으로 표시
    if (typeof elementOrMessage === 'string') {
      // 전역 알림 표시
      showToastMessage(elementOrMessage, message || className);
      return;
    }
    
    // 요소가 아닌 경우 반환
    const element = elementOrMessage;
    if (!element || !element.classList) {
      console.warn('showUIError: 유효하지 않은 요소', element);
      // 전역 알림으로 대체
      showToastMessage(message, className);
      return;
    }
    
    // 기존 오류 메시지 요소가 있는지 확인
    let errorElement = element.parentNode.querySelector('.error-message');
    
    // 없으면 새로 생성
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = `error-message ${className}`;
      element.parentNode.insertBefore(errorElement, element.nextSibling);
    }
    
    // 메시지 설정
    errorElement.textContent = message;
    errorElement.classList.add(className);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      if (errorElement && errorElement.parentNode) {
        errorElement.classList.add('fade-out');
        
        // 페이드 아웃 애니메이션 후 제거
        setTimeout(() => {
          if (errorElement && errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
          }
        }, 300);
      }
    }, 3000);
    
  } catch (error) {
    console.error('오류 메시지 표시 중 오류 발생:', error);
  }
};

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} [type='error'] - 메시지 유형 (error, info, success)
 */
export const showToastMessage = (message, type = 'error') => {
  // 기존 토스트 컨테이너 확인
  let toastContainer = document.getElementById('toast-container');
  
  // 없으면 새로 생성
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(toastContainer);
    
    // 전역 스타일 추가
    if (!document.getElementById('toast-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'toast-styles';
      styleEl.textContent = `
        .toast {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 8px;
          min-width: 250px;
          max-width: 400px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateX(0);
          opacity: 1;
          transition: transform 0.3s, opacity 0.3s;
        }
        .toast.fade-out {
          transform: translateX(100%);
          opacity: 0;
        }
        .toast.error {
          background-color: #ef4444;
        }
        .toast.success {
          background-color: #10b981;
        }
        .toast.info {
          background-color: #3b82f6;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }
  
  // 토스트 요소 생성
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // 컨테이너에 추가
  toastContainer.appendChild(toast);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // 컨테이너가 비어있으면 제거
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
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