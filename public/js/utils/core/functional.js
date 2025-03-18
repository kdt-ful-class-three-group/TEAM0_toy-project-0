/**
 * @file functional.js
 * @description 함수형 프로그래밍 패턴을 적용한 유틸리티 함수 모음
 */

/**
 * 합성 함수 생성
 * 여러 함수를 결합하여 하나의 함수로 만듭니다. 오른쪽에서 왼쪽으로 실행됩니다.
 * 
 * @example
 * // 다음 두 코드는 동일합니다:
 * // compose(f, g, h)(x) === f(g(h(x)))
 * 
 * const double = x => x * 2;
 * const addOne = x => x + 1;
 * const square = x => x * x;
 * 
 * const calculate = compose(square, addOne, double);
 * calculate(3); // 49: square(addOne(double(3))) = square(addOne(6)) = square(7) = 49
 * 
 * @param {...Function} fns - 합성할 함수들 (오른쪽에서 왼쪽 순서로 실행됨)
 * @returns {Function} 합성된 함수
 */
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

/**
 * 파이프 함수 생성
 * 여러 함수를 왼쪽에서 오른쪽으로 실행합니다.
 * 
 * @example
 * // 다음 두 코드는 동일합니다:
 * // pipe(f, g, h)(x) === h(g(f(x)))
 * 
 * const double = x => x * 2;
 * const addOne = x => x + 1;
 * const square = x => x * x;
 * 
 * const calculate = pipe(double, addOne, square);
 * calculate(3); // 49: square(addOne(double(3))) = square(addOne(6)) = square(7) = 49
 * 
 * @param {...Function} fns - 파이프에 연결할 함수들 (왼쪽에서 오른쪽 순서로 실행됨)
 * @returns {Function} 파이프된 함수
 */
export const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

/**
 * 커리 함수
 * 다중 인수 함수를 단일 인수 함수들의 체인으로 변환합니다.
 * 
 * @example
 * const add = (x, y, z) => x + y + z;
 * const curriedAdd = curry(add);
 * 
 * curriedAdd(1)(2)(3); // 6
 * curriedAdd(1, 2)(3); // 6
 * curriedAdd(1)(2, 3); // 6
 * curriedAdd(1, 2, 3); // 6
 * 
 * @param {Function} fn - 커리 적용할 함수
 * @returns {Function} 커리된 함수
 */
export const curry = (fn) => {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    
    return (...args2) => curried(...args, ...args2);
  };
};

/**
 * 부분 적용 함수
 * 함수의 일부 인수를 미리 적용합니다.
 * 
 * @example
 * const add = (x, y, z) => x + y + z;
 * const add5And10 = partial(add, 5, 10);
 * add5And10(3); // 18: add(5, 10, 3)
 * 
 * @param {Function} fn - 부분 적용할 함수
 * @param {...*} args - 미리 적용할 인수들
 * @returns {Function} 부분 적용된 함수
 */
export const partial = (fn, ...args) => (...moreArgs) => fn(...args, ...moreArgs);

/**
 * 메모이제이션 함수
 * 함수의 결과를 캐싱하여 동일한 입력에 대해 재계산을 방지합니다.
 * 
 * @example
 * const factorial = memoize(n => {
 *   if (n <= 1) return 1;
 *   return n * factorial(n - 1);
 * });
 * 
 * factorial(5); // 연산 수행
 * factorial(5); // 캐시된 결과 반환
 * 
 * @param {Function} fn - 메모이제이션할 함수
 * @returns {Function} 메모이제이션된 함수
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * 파이프 연산자 (함수를 인자로 받아 결과를 다음 함수에 전달)
 * 
 * @example
 * const result = 5 
 *   |> add(10) 
 *   |> multiply(2);
 * // 여기서 add와 multiply는 다른 유틸리티 함수
 * 
 * @param {*} value - 파이프에 전달할 초기값
 * @param {Function} fn - 값을 처리할 함수
 * @returns {*} 함수 실행 결과
 */
export const pipeWith = (value, fn) => fn(value);

/**
 * 함수 실행 결과 로깅
 * 함수의 결과를 로깅하고 동일한 결과를 반환합니다.
 * 
 * @example
 * const double = x => x * 2;
 * const loggedDouble = tap(double, x => console.log(`결과: ${x}`));
 * 
 * loggedDouble(4); // 콘솔에 "결과: 8" 출력 후 8 반환
 * 
 * @param {Function} fn - 로깅할 함수
 * @param {Function} logger - 로깅 함수
 * @returns {Function} 로깅이 추가된 함수
 */
export const tap = (fn, logger = console.log) => (...args) => {
  const result = fn(...args);
  logger(result);
  return result;
};

/**
 * 함수 반복 실행
 * 함수를 지정된 횟수만큼 반복 실행합니다.
 * 
 * @example
 * const double = x => x * 2;
 * const quadruple = repeat(double, 2);
 * 
 * quadruple(3); // 12: double(double(3))
 * 
 * @param {Function} fn - 반복 실행할 함수
 * @param {number} times - 반복 횟수
 * @returns {Function} 반복 실행되는 함수
 */
export const repeat = (fn, times) => (x) => {
  let result = x;
  for (let i = 0; i < times; i++) {
    result = fn(result);
  }
  return result;
}; 