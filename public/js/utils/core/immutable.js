/**
 * @file immutable.js
 * @description 객체와 배열의 불변성을 보장하는 유틸리티 함수 모음
 */

/**
 * 객체 깊은 복사
 * 객체의 깊은 복사본을 만듭니다.
 * 
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * const copy = deepClone(obj);
 * copy.b.c = 3;
 * console.log(obj.b.c); // 2 (원본 객체 변경되지 않음)
 * 
 * @param {*} obj - 복사할 객체 또는 값
 * @returns {*} 깊은 복사된 객체 또는 값
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  );
};

/**
 * 불변 객체 생성
 * 주어진 객체와 속성으로 새로운 객체를 생성합니다.
 * 
 * @example
 * const obj = { a: 1, b: 2 };
 * const newObj = produce(obj, { b: 3, c: 4 });
 * console.log(newObj); // { a: 1, b: 3, c: 4 }
 * console.log(obj); // { a: 1, b: 2 } (원본 객체 변경되지 않음)
 * 
 * @param {Object} obj - 기존 객체
 * @param {Object} props - 추가 또는 업데이트할 속성
 * @returns {Object} 새로운 객체
 */
export const produce = (obj, props) => ({ ...obj, ...props });

/**
 * 객체 불변 업데이트
 * 객체의 특정 경로에 있는 값을 업데이트합니다.
 * 
 * @example
 * const obj = { a: { b: { c: 1 } } };
 * const newObj = updateAt(obj, 'a.b.c', 2);
 * console.log(newObj.a.b.c); // 2
 * console.log(obj.a.b.c); // 1 (원본 객체 변경되지 않음)
 * 
 * @param {Object} obj - 업데이트할 객체
 * @param {string|Array} path - 점(.) 표기법 경로 또는 경로 배열
 * @param {*} value - 새 값
 * @returns {Object} 업데이트된 새 객체
 */
export const updateAt = (obj, path, value) => {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const key = pathArray[0];
  
  if (pathArray.length === 1) {
    return { ...obj, [key]: value };
  }
  
  return {
    ...obj,
    [key]: updateAt(obj[key] || {}, pathArray.slice(1), value)
  };
};

/**
 * 배열 불변 추가
 * 배열에 항목을 불변적으로 추가합니다.
 * 
 * @example
 * const arr = [1, 2, 3];
 * const newArr = arrayPush(arr, 4);
 * console.log(newArr); // [1, 2, 3, 4]
 * console.log(arr); // [1, 2, 3] (원본 배열 변경되지 않음)
 * 
 * @param {Array} arr - 원본 배열
 * @param {*} item - 추가할 항목
 * @returns {Array} 새 항목이 추가된 새 배열
 */
export const arrayPush = (arr, item) => [...arr, item];

/**
 * 배열 불변 삭제
 * 배열에서 항목을 불변적으로 삭제합니다.
 * 
 * @example
 * const arr = [1, 2, 3, 4];
 * const newArr = arrayRemoveAt(arr, 1);
 * console.log(newArr); // [1, 3, 4]
 * console.log(arr); // [1, 2, 3, 4] (원본 배열 변경되지 않음)
 * 
 * @param {Array} arr - 원본 배열
 * @param {number} index - 삭제할 항목의 인덱스
 * @returns {Array} 항목이 삭제된 새 배열
 */
export const arrayRemoveAt = (arr, index) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1)
];

/**
 * 배열 불변 업데이트
 * 배열의 특정 인덱스의 항목을 업데이트합니다.
 * 
 * @example
 * const arr = [1, 2, 3];
 * const newArr = arrayUpdateAt(arr, 1, 5);
 * console.log(newArr); // [1, 5, 3]
 * console.log(arr); // [1, 2, 3] (원본 배열 변경되지 않음)
 * 
 * @param {Array} arr - 원본 배열
 * @param {number} index - 업데이트할 항목의 인덱스
 * @param {*} value - 새 값
 * @returns {Array} 항목이 업데이트된 새 배열
 */
export const arrayUpdateAt = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index + 1)
];

/**
 * 배열 불변 삽입
 * 배열의 특정 위치에 항목을 삽입합니다.
 * 
 * @example
 * const arr = [1, 2, 4];
 * const newArr = arrayInsertAt(arr, 2, 3);
 * console.log(newArr); // [1, 2, 3, 4]
 * console.log(arr); // [1, 2, 4] (원본 배열 변경되지 않음)
 * 
 * @param {Array} arr - 원본 배열
 * @param {number} index - 삽입할 위치
 * @param {*} value - 삽입할 값
 * @returns {Array} 항목이 삽입된 새 배열
 */
export const arrayInsertAt = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index)
];

/**
 * 객체에서 속성 제거
 * 객체에서 지정된 속성을 제거한 새 객체를 반환합니다.
 * 
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * const newObj = omit(obj, ['a', 'c']);
 * console.log(newObj); // { b: 2 }
 * console.log(obj); // { a: 1, b: 2, c: 3 } (원본 객체 변경되지 않음)
 * 
 * @param {Object} obj - 원본 객체
 * @param {Array} keys - 제거할 속성 키 배열
 * @returns {Object} 속성이 제거된 새 객체
 */
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

/**
 * 객체에서 지정된 속성만 선택
 * 객체에서 지정된 속성만 포함하는 새 객체를 반환합니다.
 * 
 * @example
 * const obj = { a: 1, b: 2, c: 3, d: 4 };
 * const newObj = pick(obj, ['b', 'd']);
 * console.log(newObj); // { b: 2, d: 4 }
 * console.log(obj); // { a: 1, b: 2, c: 3, d: 4 } (원본 객체 변경되지 않음)
 * 
 * @param {Object} obj - 원본 객체
 * @param {Array} keys - 선택할 속성 키 배열
 * @returns {Object} 선택된 속성만 포함하는 새 객체
 */
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}; 