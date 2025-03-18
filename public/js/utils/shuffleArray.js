/**
 * 배열 요소를 무작위로 섞는 함수 (Fisher-Yates 알고리즘)
 * @param {Array} array - 섞을 배열
 * @returns {Array} 섞인 새 배열 (원본 배열은 변경하지 않음)
 */
export function shuffleArray(array) {
  const shuffled = [...array]; // 원본 배열을 복사
  
  // Fisher-Yates 셔플 알고리즘
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 요소 위치 스왑
  }
  
  return shuffled;
} 