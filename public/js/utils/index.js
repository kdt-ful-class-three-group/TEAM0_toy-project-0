/**
 * @file utils/index.js
 * @description 모든 유틸리티 모듈을 통합하여 내보내는 진입점입니다.
 */

// 각 모듈 가져오기
export * from './validation.js';
export * from './memberUtils.js';
export * from './teamUtils.js';
export * from './stringUtils.js';
export * from './errorHandler.js';
export * from './performance.js';
export * from './styleManager.js';

// 기본 유틸리티 객체 (기존 코드와의 호환성 유지)
import * as validation from './validation.js';
import * as memberUtils from './memberUtils.js';
import * as teamUtils from './teamUtils.js';
import * as stringUtils from './stringUtils.js';
import * as performance from './performance.js';
import * as styleManager from './styleManager.js';

/**
 * 기존 utils 객체와 호환되는 인터페이스를 제공합니다.
 * 새 코드에서는 개별 모듈에서 직접 함수를 가져와 사용하는 것을 권장합니다.
 * 
 * 예시:
 * import { validateNumber } from '../utils/validation.js';
 * 또는
 * import * as validation from '../utils/validation.js';
 */
const utils = {
  // validation 모듈
  validateNumber: validation.validateNumber,
  validateTeamCount: validation.validateTeamCount,
  validateTotalMembers: validation.validateTotalMembers,
  
  // memberUtils 모듈
  canAddMore: memberUtils.canAddMore,
  generateMemberName: memberUtils.generateMemberName,
  
  // teamUtils 모듈
  distributeTeams: teamUtils.distributeTeams,
  
  // performance 모듈
  memoize: performance.memoize,
  debounce: performance.debounce,
  throttle: performance.throttle,
  
  // styleManager 모듈
  createStyles: styleManager.createStyles,
  StyleManager: styleManager.StyleManager,
  
  // 기타 함수들
  // ...
};

export default utils; 