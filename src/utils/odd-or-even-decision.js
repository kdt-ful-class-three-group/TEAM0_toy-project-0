/**
 * @function isOdd
 * @param {number} number - 판별할 숫자
 * @returns {boolean} 홀수면 true, 짝수면 false
 * @description 주어진 숫자가 홀수인지 판별합니다.
 */
export const isOdd = (number) => number % 2 !== 0;

/**
 * @function isEven
 * @param {number} number - 판별할 숫자
 * @returns {boolean} 짝수면 true, 홀수면 false
 * @description 주어진 숫자가 짝수인지 판별합니다.
 */
export const isEven = (number) => number % 2 === 0; 