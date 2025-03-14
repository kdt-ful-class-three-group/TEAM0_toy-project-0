/**
 * 배열을 무작위로 섞는 함수입니다.
 *
 * 이 함수는 Fisher-Yates 알고리즘을 사용하여 주어진 배열의 요소를 무작위로 섞습니다.
 * 매우 자주 애용되는 알고리즘 중에 하나 - 카드 덱을 섞는 것을 연상
 *
 * @param {Array} array - 섞을 배열
 * @returns {Array} 섞인 배열
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default shuffleArray;