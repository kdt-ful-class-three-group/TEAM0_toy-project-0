import { isOdd } from "./odd-or-even-decision.js";

/**
 * 배열을 무작위로 섞고, 배열 길이의 홀짝 여부를 반환하는 함수입니다.
 *
 * Fisher-Yates 알고리즘을 사용하여 주어진 배열을 무작위로 섞습니다.
 * 매우 자주 애용되는 알고리즘 중 하나 - 카드 덱을 섞는 것을 연상
 *
 * @example
 * const result = shuffleArray([1, 2, 3, 4, 5]);
 * console.log(result); // { isEven: true, shuffledArray: [3, 1, 5, 2, 4] }
 *
 * @param {Array} array - 섞을 배열
 * @returns {Object} { isEven: boolean, shuffledArray: Array }
 *
 * isEven : true -> 짝수
 * isEven : false -> 홀수
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return {
    isEven: isOdd(array.length),
    shuffledArray: array,
  };
}

export default shuffleArray;
