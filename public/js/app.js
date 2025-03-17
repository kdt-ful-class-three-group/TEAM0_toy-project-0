import { registerComponents } from './components/index.js';

/**
 * @function init
 * @description 애플리케이션을 초기화합니다.
 */
function init() {
  registerComponents();
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  init();
}); 