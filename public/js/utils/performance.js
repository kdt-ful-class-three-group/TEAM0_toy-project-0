/**
 * 성능 최적화를 위한 유틸리티 함수 모음
 * @module performance
 */

/**
 * 깊은 동등성 비교 함수
 * 객체, 배열, 원시값의 내용을 비교합니다.
 * 
 * @param {*} a - 비교할 첫 번째 값
 * @param {*} b - 비교할 두 번째 값
 * @returns {boolean} 두 값이 동일한지 여부
 */
export const deepEqual = (a, b) => {
  // 원시값 또는 null/undefined 처리
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' && typeof b !== 'object') return a === b;
  
  // 객체 타입 체크
  if (a.constructor !== b.constructor) return false;
  
  // 배열 처리
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // 일반 객체 처리
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * 메모이제이션(캐싱) 기능을 제공하는 고차 함수
 * 같은 입력에 대해 함수를 반복 호출할 때 계산 결과를 캐싱하여 성능을 향상시킵니다.
 * 
 * @param {Function} fn - 메모이제이션할 함수
 * @param {Object} options - 메모이제이션 옵션
 * @param {number} options.maxSize - 캐시 최대 크기 (기본값: 100)
 * @param {boolean} options.debug - 디버그 로그 출력 여부 (기본값: false)
 * @returns {Function} 메모이제이션된 함수
 */
export const memoize = (fn, options = {}) => {
  const { 
    maxSize = 100, 
    debug = false 
  } = options;
  
  const cache = new Map();
  const keys = [];
  
  return function (...args) {
    // 이전 호출 찾기 (깊은 비교)
    let foundKey = null;
    let foundValue = null;
    
    for (const key of keys) {
      const cachedArgs = JSON.parse(key);
      if (deepEqual(cachedArgs, args)) {
        foundKey = key;
        foundValue = cache.get(key);
        break;
      }
    }
    
    // 캐시에서 찾은 경우
    if (foundKey) {
      if (debug) console.log('메모이즈 캐시 히트!', args);
      
      // 캐시 순서 최적화 (최근 사용 항목을 앞으로 이동)
      const keyIndex = keys.indexOf(foundKey);
      if (keyIndex > 0) {
        keys.splice(keyIndex, 1);
        keys.unshift(foundKey);
      }
      
      return foundValue;
    }
    
    // 캐시에서 찾지 못한 경우, 새로 계산
    if (debug) console.log('메모이즈 캐시 미스!', args);
    
    const result = fn.apply(this, args);
    const newKey = JSON.stringify(args);
    
    // 캐시 저장
    cache.set(newKey, result);
    keys.unshift(newKey);
    
    // 캐시 크기 제한 (LRU 방식)
    if (keys.length > maxSize) {
      const oldestKey = keys.pop();
      cache.delete(oldestKey);
    }
    
    return result;
  };
};

/**
 * 디바운스 함수
 * 연속적인 함수 호출을 지연시켜 마지막 호출만 실행되도록 합니다.
 * 
 * @param {Function} fn - 디바운스할 함수
 * @param {number} delay - 지연 시간(ms)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 쓰로틀 함수
 * 일정 시간 간격으로 함수 호출을 제한합니다.
 * 
 * @param {Function} fn - 쓰로틀할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function} 쓰로틀된 함수
 */
export const throttle = (fn, limit) => {
  let inThrottle = false;
  
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 성능 측정 유틸리티
 * 함수 실행 시간을 측정합니다.
 * 
 * @param {Function} fn - 측정할 함수
 * @param {string} [label] - 콘솔에 표시할 레이블
 * @returns {Function} 성능 측정 래퍼 함수
 */
export const measurePerformance = (fn, label = 'Performance') => {
  return function (...args) {
    console.time(label);
    const result = fn.apply(this, args);
    console.timeEnd(label);
    return result;
  };
}; 