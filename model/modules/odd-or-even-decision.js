// Start of Selection
/**
 * 주어진 값이 홀수인지 여부를 판단하는 함수입니다.
 *
 * @param {number} value - 홀수 여부를 판단할 숫자
 * @returns {boolean} 홀수일 경우 true, 짝수일 경우 false
 *
 * @example
 * const result = isOdd(3);
 * console.log(result); // true
 */
const isOdd = (value) => {
  return value % 2 !== 0;
};

export { isOdd };
