/**
 * @file EventEmitter.js
 * @description 옵저버 패턴을 구현한 이벤트 에미터 클래스
 */

/**
 * 이벤트 발행/구독 패턴을 구현한 클래스
 * 모든 모델과 컨트롤러의 기본 클래스로 사용
 */
export class EventEmitter {
  constructor() {
    this._events = new Map();
    this._maxListeners = 10;
  }
  
  /**
   * 이벤트 리스너 등록
   * @param {string} eventName - 이벤트 이름
   * @param {Function} listener - 이벤트 리스너 함수
   * @returns {EventEmitter} this (메소드 체이닝 지원)
   */
  on(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    let listeners = this._events.get(eventName);
    if (!listeners) {
      listeners = [];
      this._events.set(eventName, listeners);
    }
    
    // 최대 리스너 경고
    if (listeners.length >= this._maxListeners) {
      console.warn(`EventEmitter: Possible memory leak detected. ${listeners.length} ${eventName} listeners.`);
    }
    
    listeners.push(listener);
    return this;
  }
  
  /**
   * 한 번만 실행되는 이벤트 리스너 등록
   * @param {string} eventName - 이벤트 이름
   * @param {Function} listener - 이벤트 리스너 함수
   * @returns {EventEmitter} this (메소드 체이닝 지원)
   */
  once(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      listener.apply(this, args);
    };
    
    onceWrapper._originalListener = listener;
    return this.on(eventName, onceWrapper);
  }
  
  /**
   * 이벤트 리스너 제거
   * @param {string} eventName - 이벤트 이름
   * @param {Function} listener - 제거할 이벤트 리스너 함수
   * @returns {EventEmitter} this (메소드 체이닝 지원)
   */
  off(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    const listeners = this._events.get(eventName);
    if (!listeners) return this;
    
    const index = listeners.findIndex(l => 
      l === listener || 
      (l._originalListener && l._originalListener === listener)
    );
    
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this._events.delete(eventName);
      }
    }
    
    return this;
  }
  
  /**
   * 이벤트 발행
   * @param {string} eventName - 이벤트 이름
   * @param {...any} args - 이벤트 리스너에 전달할 인자들
   * @returns {boolean} 이벤트 리스너가 호출되었는지 여부
   */
  emit(eventName, ...args) {
    const listeners = this._events.get(eventName);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    // 원본 리스너 배열의 복사본으로 실행 (콜백 중 리스너 제거 시 안전하게 처리)
    const listenersToCall = [...listeners];
    for (const listener of listenersToCall) {
      try {
        listener.apply(this, args);
      } catch (err) {
        console.error(`Error in ${eventName} event listener:`, err);
      }
    }
    
    return true;
  }
  
  /**
   * 특정 이벤트의 모든 리스너 제거
   * @param {string} [eventName] - 이벤트 이름 (생략 시 모든 이벤트의 리스너 제거)
   * @returns {EventEmitter} this (메소드 체이닝 지원)
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this._events.delete(eventName);
    } else {
      this._events.clear();
    }
    
    return this;
  }
  
  /**
   * 최대 리스너 수 설정
   * @param {number} n - 최대 리스너 수
   * @returns {EventEmitter} this (메소드 체이닝 지원)
   */
  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new TypeError('n must be a non-negative number');
    }
    
    this._maxListeners = n;
    return this;
  }
  
  /**
   * 등록된 리스너 목록 조회
   * @param {string} eventName - 이벤트 이름
   * @returns {Function[]} 리스너 배열
   */
  listeners(eventName) {
    const listeners = this._events.get(eventName) || [];
    return [...listeners];
  }
} 