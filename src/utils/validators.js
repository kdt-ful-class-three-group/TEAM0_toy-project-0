/**
 * API 입력 데이터 검증을 위한 유틸리티 함수
 */

/**
 * 팀 데이터 유효성 검사
 * @param {Object} data - 검증할 팀 데이터
 * @returns {Object} 검증 결과 (valid: 유효 여부, errors: 오류 메시지 배열)
 */
export const validateTeamData = (data) => {
  const errors = [];

  // 객체 타입 검사
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['데이터가 유효한 객체 형식이 아닙니다.']
    };
  }

  // teams 배열 검사
  if (!Array.isArray(data.teams)) {
    errors.push('teams 필드는 배열이어야 합니다.');
  } else {
    // 각 팀 검사 (배열 형태)
    data.teams.forEach((team, index) => {
      if (!Array.isArray(team)) {
        errors.push(`teams[${index}]는 배열이어야 합니다.`);
      } else {
        // 각 멤버 검사 (문자열 형태)
        team.forEach((member, memberIndex) => {
          if (typeof member !== 'string' || !member.trim()) {
            errors.push(`teams[${index}][${memberIndex}]는 유효한 문자열이어야 합니다.`);
          }
        });
      }
    });
  }

  // 메타데이터 검사 (선택 사항)
  if (data.metadata && typeof data.metadata !== 'object') {
    errors.push('metadata는 객체여야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * URL 경로 보안 검증
 * @param {string} url - 검증할 URL 경로
 * @returns {boolean} 안전한 경로인지 여부
 */
export const isSafePath = (url) => {
  // 상위 디렉토리 참조 방지 (path traversal 공격 방어)
  if (url.includes('..')) {
    return false;
  }
  
  // 절대 경로 시작 제한
  if (url.startsWith('/') && url.length > 1 && url[1] === '/') {
    return false;
  }
  
  // 윈도우 드라이브 문자 방지
  if (/^[A-Za-z]:/.test(url)) {
    return false;
  }
  
  // 특수 문자 제한
  if (/[<>:"|?*]/.test(url)) {
    return false;
  }
  
  return true;
}; 