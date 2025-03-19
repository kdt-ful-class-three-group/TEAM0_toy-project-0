/**
 * @file extensionInterface.js
 * @description Chrome 확장 프로그램과의 안전한 통신을 위한 인터페이스
 */

import logger from './logger.js';

// 로거 인스턴스 생성
const extensionLogger = logger.createLogger ? logger.createLogger('extension') : logger;

/**
 * Chrome 확장 프로그램 API가 있는지 확인
 * @returns {boolean} 확장 프로그램 API 사용 가능 여부
 */
const isChromeExtensionAvailable = () => {
  return typeof chrome !== 'undefined' && 
         !!chrome.runtime && 
         !!chrome.runtime.sendMessage;
};

/**
 * 확장 프로그램에 메시지 전송 (비동기 처리 오류 방지)
 * @param {any} message - 전송할 메시지
 * @param {Object} [options] - 추가 옵션
 * @param {number} [options.timeout=2000] - 응답 제한 시간(ms)
 * @returns {Promise<any>} 응답 Promise
 */
export const sendMessageToExtension = (message, options = {}) => {
  const { timeout = 2000 } = options;
  
  return new Promise((resolve, reject) => {
    if (!isChromeExtensionAvailable()) {
      extensionLogger.warn('Chrome 확장 프로그램 API를 사용할 수 없습니다');
      return reject(new Error('확장 프로그램 API를 사용할 수 없습니다'));
    }

    // 타임아웃 ID
    let timeoutId = null;
    
    try {
      // 타임아웃 설정
      timeoutId = setTimeout(() => {
        extensionLogger.debug('확장 프로그램 응답 제한시간 초과', { message });
        resolve({ success: false, error: 'timeout' });
      }, timeout);
      
      // 메시지 전송
      chrome.runtime.sendMessage(message, (response) => {
        // 타임아웃 취소
        clearTimeout(timeoutId);
        
        // chrome.runtime.lastError 확인
        if (chrome.runtime.lastError) {
          extensionLogger.debug('확장 프로그램 응답 오류', { 
            error: chrome.runtime.lastError.message,
            message
          });
          return resolve({ success: false, error: chrome.runtime.lastError.message });
        }
        
        resolve(response || { success: true });
      });
    } catch (error) {
      clearTimeout(timeoutId);
      extensionLogger.error('확장 프로그램 메시지 전송 오류', { error, message });
      reject(error);
    }
  });
};

/**
 * 확장 프로그램 메시지 수신 (비동기 처리 오류 방지)
 * @param {Function} callback - 메시지 수신 시 호출할 콜백 함수
 * @returns {Function} 리스너 제거를 위한 함수
 */
export const listenForExtensionMessages = (callback) => {
  if (!isChromeExtensionAvailable()) {
    extensionLogger.warn('Chrome 확장 프로그램 API를 사용할 수 없습니다');
    return () => {};
  }
  
  const wrappedCallback = (message, sender, sendResponse) => {
    try {
      // 비동기 응답이 필요할 경우 Promise를 사용
      const result = callback(message, sender, sendResponse);
      
      // Promise 반환 시 처리
      if (result instanceof Promise) {
        result
          .then(response => {
            try {
              sendResponse(response);
            } catch (sendError) {
              extensionLogger.debug('비동기 응답 전송 중 오류', { sendError });
            }
          })
          .catch(error => {
            try {
              sendResponse({ success: false, error: error.message });
            } catch (sendError) {
              extensionLogger.debug('오류 응답 전송 중 오류', { sendError });
            }
          });
        
        return true; // 비동기 응답 처리
      }
      
      // 메시지 처리가 동기적이거나 응답이 필요 없는 경우
      if (result !== undefined) {
        sendResponse(result);
      }
      
      // result가 true면 비동기 응답을 보낼 것임을 의미
      return result === true;
    } catch (error) {
      extensionLogger.error('확장 프로그램 메시지 처리 중 오류', { error });
      try {
        sendResponse({ success: false, error: error.message });
      } catch (sendError) {
        extensionLogger.debug('확장 프로그램 오류 응답 전송 중 오류', { sendError });
      }
      return false;
    }
  };
  
  // 리스너 등록
  chrome.runtime.onMessage.addListener(wrappedCallback);
  
  // 리스너 제거 함수 반환
  return () => {
    chrome.runtime.onMessage.removeListener(wrappedCallback);
  };
};

/**
 * 확장 프로그램 API 사용 가능 여부 확인
 * @returns {boolean} 확장 프로그램 사용 가능 여부
 */
export const isExtensionAvailable = isChromeExtensionAvailable;

export default {
  sendMessageToExtension,
  listenForExtensionMessages,
  isExtensionAvailable
}; 