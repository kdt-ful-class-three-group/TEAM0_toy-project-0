/**
 * @function createUtils
 * @description 유틸리티 함수를 모아둔 객체를 생성합니다.
 */
const createUtils = () => {
  console.log("유틸 생성");

  /**
   * @function validateNumber
   * @param {string} value
   * @returns {boolean}
   */
  const validateNumber = (value) => {
    return /^\d*$/.test(value);
  };

  /**
   * @function validateTotalMembers
   * @param {number} value
   * @returns {boolean}
   */
  const validateTotalMembers = (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      return false;
    } else {
      return true;
    }
  };

  /**
   * @function generateMemberName
   * @param {string} name
   * @param {Array<string>} existingMembers
   * @returns {string}
   */
  const generateMemberName = (name, existingMembers) => {
    console.time("generateMemberName");

    const sameNames = existingMembers.filter((member) => {
      return (
        member === name ||
        member.startsWith(name + "-") ||
        member.replace(/-\d+$/, "") === name
      );
    });

    if (sameNames.length === 0) {
      console.timeEnd("generateMemberName");
      return name;
    }

    const baseNameIndex = existingMembers.findIndex((member) => {
      return member === name;
    });
    if (baseNameIndex !== -1) {
      existingMembers[baseNameIndex] = `${name}-1`;
    }
    console.timeEnd("generateMemberName");
    return `${name}-${sameNames.length + 1}`;
  };

  /**
   * @function validateTeamCount
   * @param {number} value
   * @returns {boolean}
   */
  const validateTeamCount = (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
  };

  /**
   * @function canAddMore
   * @description 멤버를 더 추가할 수 있는지 여부를 판단합니다.
   * @param {State} state
   * @returns {boolean}
   */
  const canAddMore = (state) => {
    if (state.isTotalConfirmed === true && state.totalMembers > 0 && state.members.length < state.totalMembers) {
      return true;
    } else {
      return false;
    }
  };

  return {
    validateNumber,
    validateTotalMembers,
    generateMemberName,
    validateTeamCount,
    canAddMore
  };
};

// 유틸리티 인스턴스 생성
const utils = createUtils();

export default utils; 