/**
 * @file app/index.js
 * @description 애플리케이션 진입점 및 초기화를 담당합니다.
 * @version 1.1.0
 * @author Team0
 */

import { registerComponents } from '../components/index.js';
import { domLoadHandler } from './init.js';

// 컴포넌트 등록 내보내기
export { registerComponents };

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', domLoadHandler);

// 접근성 위험/오류 로깅 (개발 환경에서만)
if (window.location.hostname === 'localhost') {
  const logAccessibilityIssue = (issue) => {
    console.warn(`접근성 문제 발견: ${issue.type}`, issue);
  };
  
  // 접근성 이벤트 구독
  document.addEventListener('accessibility-issue', (e) => {
    logAccessibilityIssue(e.detail);
  });
}

export default {
  registerComponents
};