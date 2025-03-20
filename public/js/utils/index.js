/**
 * @file utils/index.js
 * @description 모든 유틸리티 모듈을 통합하여 내보내는 진입점
 */

// 코어 유틸리티 모듈
export * from './core/index.js';

// DOM 관련 유틸리티 모듈
export * from './dom/index.js';

// 기존 유틸리티 모듈과의 호환성 유지
export * from './validation.js';
export * from './memberUtils.js';
export * from './teamUtils.js';
export * from './stringUtils.js';
export * from './errorHandler.js';
export * from './performance.js';
export * from './style/index.js';

// 기존 모듈 가져오기 (하위 호환성 유지)
import * as validation from './validation.js';
import * as memberUtils from './memberUtils.js';
import * as teamUtils from './teamUtils.js';
import * as stringUtils from './stringUtils.js';
import * as performance from './performance.js';
import * as styleManager from './style/styleManager.js';

// 코어 유틸리티
import * as functionalUtils from './core/functional.js';
import * as typesUtils from './core/types.js';
import * as immutableUtils from './core/immutable.js';

// DOM 유틸리티
import * as domQuery from './dom/query.js';
import * as domManipulation from './dom/manipulation.js';
import * as domEvents from './dom/events.js';
import * as domStyling from './dom/styling.js';

/**
 * 모든 유틸리티 함수를 담은 객체
 * @type {Object}
 * @description
 * 기존 코드와의 호환성을 위해 utils 객체로 모든 유틸리티를 제공하지만,
 * 새 코드에서는 개별 모듈에서 직접 함수를 가져와 사용하는 것을 권장합니다.
 * 
 * 예시:
 * ```
 * // 권장되는 방식
 * import { compose, pipe } from '../utils/core/functional.js';
 * import { $ } from '../utils/dom/query.js';
 * 
 * // 또는
 * import { compose, pipe, $ } from '../utils/index.js';
 * ```
 */
const utils = {
  // 기존 유틸리티 함수
  validateNumber: validation.validateNumber,
  validateTeamCount: validation.validateTeamCount,
  validateTotalMembers: validation.validateTotalMembers,
  canAddMore: memberUtils.canAddMore,
  generateMemberName: memberUtils.generateMemberName,
  distributeTeams: teamUtils.distributeTeams,
  memoize: performance.memoize,
  debounce: performance.debounce,
  throttle: performance.throttle,
  createStyles: styleManager.createStyles,
  StyleManager: styleManager.StyleManager,
  
  // 함수형 유틸리티
  compose: functionalUtils.compose,
  pipe: functionalUtils.pipe,
  curry: functionalUtils.curry,
  partial: functionalUtils.partial,
  
  // 타입 유틸리티
  isType: typesUtils.isType,
  isObject: typesUtils.isObject,
  isArray: typesUtils.isArray,
  isString: typesUtils.isString,
  isNumber: typesUtils.isNumber,
  isBoolean: typesUtils.isBoolean,
  isEmpty: typesUtils.isEmpty,
  
  // 불변성 유틸리티
  deepClone: immutableUtils.deepClone,
  produce: immutableUtils.produce,
  updateAt: immutableUtils.updateAt,
  
  // DOM 쿼리 유틸리티
  $: domQuery.$,
  $$: domQuery.$$,
  getById: domQuery.getById,
  shadowQuery: domQuery.shadowQuery,
  
  // DOM 조작 유틸리티
  createElement: domManipulation.createElement,
  append: domManipulation.append,
  empty: domManipulation.empty,
  addClass: domManipulation.addClass,
  removeClass: domManipulation.removeClass,
  toggleClass: domManipulation.toggleClass,
  
  // 이벤트 유틸리티
  on: domEvents.on,
  once: domEvents.once,
  delegate: domEvents.delegate,
  
  // 스타일링 유틸리티
  createStyledElement: domStyling.createStyledElement,
  injectShadowStyles: domStyling.injectShadowStyles,
  applyClasses: domStyling.applyClasses
};

// 기존 코드와의 호환성을 위해 기본 내보내기
export default utils; 