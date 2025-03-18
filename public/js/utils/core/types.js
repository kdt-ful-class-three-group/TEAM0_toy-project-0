/**
 * @file types.js
 * @description 타입 검증과 변환을 위한 유틸리티 함수 모음
 */

/**
 * 값의 타입을 반환합니다.
 * 자바스크립트 내장 typeof 연산자보다 더 정확한 타입 정보를 제공합니다.
 * 
 * @example
 * getType(null); // 'null'
 * getType([]); // 'array'
 * getType(new Date()); // 'date'
 * getType(/a-z/); // 'regexp'
 * getType(new Map()); // 'map'
 * 
 * @param {*} value - 타입을 확인할 값
 * @returns {string} 값의 타입을 나타내는 문자열
 */
export const getType = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  return type;
};

/**
 * 값이 특정 타입인지 확인합니다.
 * 
 * @example
 * isType([1, 2, 3], 'array'); // true
 * isType('hello', 'string'); // true
 * isType(new Date(), 'date'); // true
 * isType(123, 'number'); // true
 * 
 * @param {*} value - 검사할 값
 * @param {string} type - 확인할 타입 문자열
 * @returns {boolean} 값이 해당 타입인지 여부
 */
export const isType = (value, type) => {
  return getType(value) === type.toLowerCase();
};

/**
 * 값이 객체인지 확인합니다.
 * null은 객체로 간주하지 않습니다.
 * 
 * @example
 * isObject({}); // true
 * isObject([]); // false
 * isObject(null); // false
 * isObject(new Date()); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 객체인지 여부
 */
export const isObject = (value) => {
  return getType(value) === 'object';
};

/**
 * 값이 배열인지 확인합니다.
 * 
 * @example
 * isArray([]); // true
 * isArray({}); // false
 * isArray('string'); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 배열인지 여부
 */
export const isArray = (value) => {
  return Array.isArray(value);
};

/**
 * 값이 문자열인지 확인합니다.
 * 
 * @example
 * isString('hello'); // true
 * isString(123); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 문자열인지 여부
 */
export const isString = (value) => {
  return typeof value === 'string';
};

/**
 * 값이 숫자인지 확인합니다.
 * NaN은 숫자로 간주하지 않습니다.
 * 
 * @example
 * isNumber(123); // true
 * isNumber('123'); // false
 * isNumber(NaN); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 숫자인지 여부
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * 값이 불리언인지 확인합니다.
 * 
 * @example
 * isBoolean(true); // true
 * isBoolean(false); // true
 * isBoolean(1); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 불리언인지 여부
 */
export const isBoolean = (value) => {
  return typeof value === 'boolean';
};

/**
 * 값이 함수인지 확인합니다.
 * 
 * @example
 * isFunction(() => {}); // true
 * isFunction(function() {}); // true
 * isFunction({}); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 함수인지 여부
 */
export const isFunction = (value) => {
  return typeof value === 'function';
};

/**
 * 값이 비어있는지 확인합니다.
 * - 문자열: 빈 문자열이면 비어있음
 * - 배열: 길이가 0이면 비어있음
 * - 객체: 속성이 없으면 비어있음
 * - null/undefined: 비어있음
 * - 숫자/불리언: 비어있지 않음
 * 
 * @example
 * isEmpty(''); // true
 * isEmpty([]); // true
 * isEmpty({}); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(0); // false
 * isEmpty(false); // false
 * 
 * @param {*} value - 검사할 값
 * @returns {boolean} 값이 비어있는지 여부
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (isString(value) || isArray(value)) {
    return value.length === 0;
  }
  
  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }
  
  return false;
};

/**
 * 숫자로 변환합니다.
 * 변환할 수 없는 경우 기본값을 반환합니다.
 * 
 * @example
 * toNumber('123'); // 123
 * toNumber('abc', 0); // 0
 * toNumber('123.45'); // 123.45
 * 
 * @param {*} value - 변환할 값
 * @param {number} [defaultValue=0] - 변환할 수 없을 때 반환할 기본값
 * @returns {number} 변환된 숫자 또는 기본값
 */
export const toNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * 문자열로 변환합니다.
 * 
 * @example
 * toString(123); // '123'
 * toString(null); // ''
 * toString(undefined); // ''
 * toString({ a: 1 }); // '[object Object]'
 * 
 * @param {*} value - 변환할 값
 * @param {string} [defaultValue=''] - null 또는 undefined일 때 반환할 기본값
 * @returns {string} 변환된 문자열
 */
export const toString = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
};

/**
 * 불리언으로 변환합니다.
 * 
 * @example
 * toBoolean(1); // true
 * toBoolean(0); // false
 * toBoolean('true'); // true
 * toBoolean('false'); // false
 * toBoolean(''); // false
 * 
 * @param {*} value - 변환할 값
 * @returns {boolean} 변환된 불리언 값
 */
export const toBoolean = (value) => {
  if (isString(value)) {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

/**
 * 배열로 변환합니다.
 * 
 * @example
 * toArray('abc'); // ['a', 'b', 'c']
 * toArray(123); // [123]
 * toArray(null); // []
 * 
 * @param {*} value - 변환할 값
 * @returns {Array} 변환된 배열
 */
export const toArray = (value) => {
  if (value === null || value === undefined) {
    return [];
  }
  
  if (isArray(value)) {
    return value;
  }
  
  if (isString(value)) {
    return value.split('');
  }
  
  return [value];
}; 