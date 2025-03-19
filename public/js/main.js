/**
 * @file main.js
 * @description 애플리케이션 진입점, 테마 시스템과 렌더링 모니터링 초기화
 */

import { registerComponents } from './components/index.js';
import { initializeTheme } from './design/theme.js';
import renderingMonitor from './utils/renderingMonitor.js';
import store from './store/index.js';

// 성능 모니터링 모듈 기본값 설정
let performanceMonitor = {
  start: () => console.log('성능 모니터링 비활성화됨'),
  stop: () => {},
  getComponentStats: () => ({}),
  getPerformanceIssues: () => []
};

/**
 * 성능 모니터링 모듈 로드 시도
 */
const loadPerformanceMonitor = async () => {
  try {
    const { PerformanceMonitor } = await import('./utils/performanceMonitor.js');
    performanceMonitor = new PerformanceMonitor();
    console.log('성능 모니터링 모듈이 성공적으로 로드되었습니다.');
    return true;
  } catch (error) {
    console.warn('성능 모니터링 모듈을 로드하는 중 오류가 발생했습니다:', error);
    return false;
  }
};

/**
 * 애플리케이션 초기화
 */
const initializeApp = async () => {
  console.time('app-initialization');
  
  try {
    // 개발 모드 감지
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    // 렌더링 모니터링 초기화
    renderingMonitor.configure({
      isDebugMode: isDevelopment,
      logLevel: isDevelopment ? 'debug' : 'warn',
      trackMountTime: true,
      trackUpdateTime: true
    });
    
    // 테마 시스템 초기화
    initializeTheme();
    
    // 웹 컴포넌트 등록
    registerComponents();

    // 전역 스토어 초기화 상태 확인
    console.log('스토어 초기 상태:', store.getState());
    
    // 스토어 변경 로깅 (개발 모드에서만)
    if (isDevelopment) {
      store.subscribe((state) => {
        console.log('스토어 상태 변경:', state);
      });
    }
    
    // 성능 모니터링 모듈 로드 시도 (개발 모드에서만)
    if (isDevelopment) {
      await loadPerformanceMonitor();
      
      try {
        // 성능 모니터 활성화
        performanceMonitor.start();
        
        // 렌더링 상태 주기적 확인
        setInterval(() => {
          const activeRenderings = renderingMonitor.getActiveRenderings();
          if (activeRenderings.length > 0) {
            console.warn('미완료된 렌더링 작업 감지:', activeRenderings);
          }
        }, 5000);
        
        // 렌더링 성능 문제 이벤트 리스너
        document.addEventListener('rendering:slow-component', (e) => {
          console.warn('느린 렌더링 감지:', e.detail);
        });
        
        // 전역 객체에 모니터링 도구 추가 (개발자 콘솔에서 접근 가능)
        window.__RENDERING_MONITOR__ = renderingMonitor;
        window.__PERFORMANCE_MONITOR__ = performanceMonitor;
        
        console.info('개발 모드: 렌더링 및 성능 모니터링 활성화');
      } catch (e) {
        console.warn('성능 모니터링을 시작하는 중 오류가 발생했습니다:', e);
      }
    }
    
    console.log('Team Distributor 애플리케이션이 초기화되었습니다.');
  } catch (error) {
    console.error('애플리케이션 초기화 중 오류가 발생했습니다:', error);
  } finally {
    console.timeEnd('app-initialization');
  }
};

// DOM 로드 완료 시 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', initializeApp);

// 접근성 위험/오류 로깅 (개발 환경에서만)
if (window.location.hostname === 'localhost') {
  const logAccessibilityIssue = (issue) => {
    console.warn(`접근성 문제 발견: ${issue.type}`, issue);
  };
  
  // axe 또는 다른 접근성 도구가 로드된 경우 이벤트 구독
  document.addEventListener('accessibility-issue', (e) => {
    logAccessibilityIssue(e.detail);
  });
} 