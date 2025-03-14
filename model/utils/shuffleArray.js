/**
 * @function shuffleArray
 * @param {Array} array - 섞을 배열
 * @returns {Object} 섞인 배열과 관련 정보를 담은 객체
 * @description
 * Fisher-Yates 알고리즘을 사용하여 배열을 무작위로 섞습니다.
 * 원본 배열은 변경하지 않고 새로운 배열을 반환합니다.
 * 
 * @example
 * const array = [1, 2, 3, 4, 5];
 * const result = shuffleArray(array);
 * console.log(result.shuffledArray); // 섞인 배열
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return {
        shuffledArray: shuffled,
        isEven: shuffled.length % 2 === 0
    };
};

export default shuffleArray; 