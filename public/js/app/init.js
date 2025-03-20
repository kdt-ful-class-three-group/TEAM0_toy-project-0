/**
 * @file app/init.js
 * @description 애플리케이션 초기화 관련 함수 모음
 */

import eventBus from '../utils/EventBus.js';
import { themeManager } from '../utils/themeManager.js';
import store from '../store/index.js';
import { measurePerformance } from '../utils/performance.js';

/**
 * @function initializeEventBus
 * @description 이벤트 버스를 초기화하고 기본 리스너를 설정합니다.
 * @private
 */
export const initializeEventBus = () => {
  // 개발 모드에서 이벤트 버스 디버깅 활성화
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    eventBus.setDebug(true);
    
    // 글로벌 접근을 위한 디버깅 도구 추가
    window.__EVENT_BUS__ = eventBus;
  }
  
  // 기본 이벤트 리스너 등록
  eventBus.on('app:error', (error) => {
    console.error('애플리케이션 오류:', error);
  });
  
  // 컴포넌트 라이프사이클 이벤트 모니터링
  eventBus.on('component:mounted', (data) => {
    console.log(`컴포넌트 마운트됨: ${data.componentName}`);
  });
  
  return eventBus;
};

/**
 * @function initializePerformanceMonitoring
 * @description 성능 모니터링 시스템을 초기화합니다.
 * @private
 */
export const initializePerformanceMonitoring = () => {
  // 개발 모드에서만 성능 모니터링 활성화
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('성능 모니터링 활성화');
    
    // 이벤트 버스를 통한 모니터링
    eventBus.on('performance:slow-components-detected', (data) => {
      console.warn('느린 컴포넌트 감지됨:', data.components.length);
    });
    
    eventBus.on('performance:fps-update', (data) => {
      if (data.fps < 30) {
        console.warn('낮은 FPS:', data.fps);
      }
    });
    
    // 성능 모니터 로드 시도
    return import('../utils/performanceMonitor.js').then(module => {
      const performanceMonitor = module.default;
      
      // 전역 객체에 성능 모니터 추가 (개발자 도구에서 접근 가능)
      window.__PERFORMANCE_MONITOR__ = performanceMonitor;
      
      return performanceMonitor;
    }).catch(err => {
      console.warn('성능 모니터링 모듈을 로드하는 중 오류가 발생했습니다:', err);
      return null;
    });
  }
  
  return Promise.resolve(null);
};

/**
 * @function init
 * @description 애플리케이션을 초기화합니다.
 */
export const init = measurePerformance(function() {
  console.log('앱 초기화 시작');
  
  // 이벤트 버스 초기화
  initializeEventBus();
  
  // 테마 관리자 초기화
  themeManager.initialize();
  
  // 성능 모니터링 초기화
  initializePerformanceMonitoring();
  
  // 앱 초기화 완료 이벤트 발행
  eventBus.emit('app:initialized', {
    timestamp: Date.now(),
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
  });
  
  console.log('앱 초기화 완료');
}, 'app-initialization');

/**
 * DOM 로드 완료 시 실행할 핸들러
 */
export const domLoadHandler = () => {
  init();
  
  // 상태 저장을 위한 윈도우 닫힘 이벤트
  window.addEventListener('beforeunload', () => {
    // 필요한 상태 저장 작업 수행
    eventBus.emit('app:beforeUnload', { state: store.getState() });
  });
};