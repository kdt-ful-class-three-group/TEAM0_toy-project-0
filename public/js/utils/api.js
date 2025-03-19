/**
 * @file api.js
 * @description API 통신을 위한 유틸리티 함수
 */

/**
 * API 요청을 보내는 함수
 * @param {string} url - API 엔드포인트 URL
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답
 */
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 팀 데이터를 서버에 저장
 * @param {Object} teamData - 팀 구성 정보
 * @returns {Promise} 저장 결과
 */
export async function saveTeamData(teamData) {
  return apiRequest('/api/teams', {
    method: 'POST',
    body: JSON.stringify(teamData)
  });
}

/**
 * 현재 저장된 팀 데이터 조회
 * @returns {Promise} 팀 구성 정보
 */
export async function getCurrentTeamData() {
  return apiRequest('/api/teams', {
    method: 'GET'
  });
} 