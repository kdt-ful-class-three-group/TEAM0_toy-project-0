/**
 * @file EventBus.js
 * @description 중앙화된 이벤트 버스 시스템을 제공하는 모듈입니다.
 * 컴포넌트 간 통신을 위한 발행/구독 패턴을 구현합니다.
 */

import { EventEmitter } from './EventEmitter.js';

/**
 * @class EventBus
 * @description 애플리케이션 전체에서 사용할 수 있는 중앙화된 이벤트 버스입니다.
 * 컴포넌트 간 직접적인 의존성 없이 이벤트 기반 통신을 가능하게 합니다.
 * @extends EventEmitter
 */
class EventBus extends EventEmitter {
  /**
   * EventBus 인스턴스를 생성합니다.
   * 싱글톤 패턴을 사용하여 애플리케이션 전체에서 하나의 인스턴스만 생성됩니다.
   */
  constructor() {
    super();
    
    // 이벤트 디버깅 지원
    this._debug = false;
    this._eventHistory = [];
    this._maxHistoryLength = 100;
    
    // 예약된 이벤트 이름 목록
    this._reservedEvents = [
      'component:mounted',      // 컴포넌트 마운트 완료
      'component:updated',      // 컴포넌트 업데이트 완료
      'component:destroyed',    // 컴포넌트 제거 완료
      'state:changed',          // 상태 변경
      'app:initialized',        // 앱 초기화 완료
      'app:error',              // 앱 에러 발생
      'teams:distributed',      // 팀 분배 완료
      'teams:saved',            // 팀 저장 완료
      'form:validated',         // 폼 유효성 검증 완료
      'form:submitted',         // 폼 제출 완료
      'member:added',           // 멤버 추가됨
      'member:removed',         // 멤버 제거됨
      'member:updated'          // 멤버 업데이트됨
    ];
  }

  /**
   * 디버그 모드를 설정합니다.
   * @param {boolean} enabled - 디버그 모드 활성화 여부
   */
  setDebug(enabled) {
    this._debug = !!enabled;
    return this;
  }

  /**
   * 이벤트를 발행합니다.
   * @override
   * @param {string} eventName - 이벤트 이름
   * @param {...any} args - 이벤트 데이터
   * @returns {boolean} 이벤트 핸들러가 호출되었는지 여부
   */
  emit(eventName, ...args) {
    // 디버그 모드에서 이벤트 기록
    if (this._debug) {
      this._logEvent('emit', eventName, args);
      this._addToHistory('emit', eventName, args);
    }
    
    return super.emit(eventName, ...args);
  }

  /**
   * 이벤트 리스너를 등록합니다.
   * @override
   * @param {string} eventName - 이벤트 이름
   * @param {Function} listener - 이벤트 리스너
   * @param {Object} context - 리스너 실행 컨텍스트 (this 값)
   * @returns {Function} 구독 해제 함수
   */
  on(eventName, listener, context) {
    // 디버그 모드에서 구독 기록
    if (this._debug) {
      this._logEvent('subscribe', eventName);
    }
    
    // 컨텍스트가 제공된 경우 리스너 바인딩
    const boundListener = context ? listener.bind(context) : listener;
    super.on(eventName, boundListener);
    
    // 구독 해제 함수 반환
    return () => {
      this.off(eventName, boundListener);
      if (this._debug) {
        this._logEvent('unsubscribe', eventName);
      }
    };
  }

  /**
   * 예약된 이벤트인지 확인합니다.
   * @param {string} eventName - 확인할 이벤트 이름
   * @returns {boolean} 예약된 이벤트 여부
   */
  isReservedEvent(eventName) {
    return this._reservedEvents.includes(eventName);
  }

  /**
   * 이벤트 로깅
   * @private
   * @param {string} action - 수행된 작업 (emit, subscribe, unsubscribe)
   * @param {string} eventName - 이벤트 이름
   * @param {Array} [args] - 이벤트 데이터
   */
  _logEvent(action, eventName, args) {
    const timestamp = new Date().toISOString();
    
    switch (action) {
      case 'emit':
        console.log(`[${timestamp}] 🔔 EventBus: ${eventName}`, args || '');
        break;
      case 'subscribe':
        console.log(`[${timestamp}] ✅ EventBus: 구독 추가 "${eventName}"`);
        break;
      case 'unsubscribe':
        console.log(`[${timestamp}] ❌ EventBus: 구독 제거 "${eventName}"`);
        break;
    }
  }

  /**
   * 이벤트 기록에 추가
   * @private
   * @param {string} action - 수행된 작업
   * @param {string} eventName - 이벤트 이름
   * @param {Array} [args] - 이벤트 데이터
   */
  _addToHistory(action, eventName, args) {
    const timestamp = Date.now();
    
    this._eventHistory.push({
      timestamp,
      action,
      eventName,
      data: args || null
    });
    
    // 히스토리 크기 제한
    if (this._eventHistory.length > this._maxHistoryLength) {
      this._eventHistory.shift();
    }
  }

  /**
   * 이벤트 기록을 반환합니다.
   * @returns {Array} 이벤트 기록 배열
   */
  getEventHistory() {
    return [...this._eventHistory];
  }

  /**
   * 이벤트 기록을 지웁니다.
   */
  clearEventHistory() {
    this._eventHistory = [];
  }
}

// 싱글톤 인스턴스 생성
const eventBus = new EventBus();

export default eventBus;