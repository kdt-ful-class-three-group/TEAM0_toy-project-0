/**
 * @file app.js
 * @description 애플리케이션의 진입점으로, 초기화 로직을 담당합니다.
 * @version 1.1.0
 * @author Team0
 */
import { registerComponents } from './components/index.js';
import { themeManager } from './utils/themeManager.js';
import { measurePerformance } from './utils/performance.js';
import performanceMonitor from './utils/performanceMonitor.js';
import eventBus from './utils/EventBus.js';
import store from './store/index.js';

/**
 * @function initializeEventBus
 * @description 이벤트 버스를 초기화하고 기본 리스너를 설정합니다.
 * @private
 */
const initializeEventBus = () => {
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
const initializePerformanceMonitoring = () => {
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
    
    // 전역 객체에 성능 모니터 추가 (개발자 도구에서 접근 가능)
    window.__PERFORMANCE_MONITOR__ = performanceMonitor;
  }
};

/**
 * @function init
 * @description 애플리케이션을 초기화합니다.
 */
const init = measurePerformance(function() {
  console.log('앱 초기화 시작');
  
  // 이벤트 버스 초기화
  initializeEventBus();
  
  // 웹 컴포넌트 등록
  registerComponents();
  
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

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  init();
  
  // 상태 저장을 위한 윈도우 닫힘 이벤트
  window.addEventListener('beforeunload', () => {
    // 필요한 상태 저장 작업 수행
    eventBus.emit('app:beforeUnload', { state: store.getState() });
  });
}); 