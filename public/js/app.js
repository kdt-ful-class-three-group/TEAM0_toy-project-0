import { registerComponents } from './components/index.js';
import { themeManager } from './utils/themeManager.js';
import { measurePerformance } from './utils/performance.js';
import performanceMonitor from './utils/performanceMonitor.js';

/**
 * @function init
 * @description 애플리케이션을 초기화합니다.
 */
const init = measurePerformance(function() {
  console.log('앱 초기화 시작');
  
  // 웹 컴포넌트 등록
  registerComponents();
  
  // 테마 관리자 초기화
  themeManager.initialize();
  
  // 개발 모드에서만 성능 모니터링 활성화
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('성능 모니터링 활성화');
    
    // 성능 모니터링을 위한 이벤트 리스너 등록
    document.addEventListener('performance:slow-components-detected', (e) => {
      console.warn('느린 컴포넌트 감지됨:', e.detail.components.length);
    });
    
    document.addEventListener('performance:fps-update', (e) => {
      if (e.detail.fps < 30) {
        console.warn('낮은 FPS:', e.detail.fps);
      }
    });
    
    // 전역 객체에 성능 모니터 추가 (개발자 도구에서 접근 가능)
    window.__PERFORMANCE_MONITOR__ = performanceMonitor;
  }
  
  console.log('앱 초기화 완료');
}, 'app-initialization');

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  init();
}); 