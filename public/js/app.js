import { registerComponents } from './components/index.js';
import { themeManager } from './utils/themeManager.js';
import { measurePerformance } from './utils/performance.js';

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
  
  console.log('앱 초기화 완료');
}, 'app-initialization');

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  init();
}); 