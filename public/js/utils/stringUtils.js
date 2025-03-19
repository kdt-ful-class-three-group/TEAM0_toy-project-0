/**
 * @file utils/stringUtils.js
 * @description 문자열 처리를 위한 유틸리티 함수들을 제공하는 모듈입니다.
 */

import { createErrorLogger } from './errorHandler.js';

const logger = createErrorLogger('stringUtils');

/**
 * 접미사가 있는 이름 패턴과 일치하는지 확인합니다.
 * @param {string} name - 확인할 이름
 * @param {string} baseName - 기본 이름
 * @returns {boolean} 패턴 일치 여부
 */
export const matchesNamePattern = (name, baseName) => {
  if (!name || !baseName) return false;
  
  const pattern = new RegExp(`^${escapeRegExp(baseName)}(?:-([0-9]+))?$`);
  return pattern.test(name);
};

/**
 * 정규식에서 특수 문자를 이스케이프합니다.
 * @param {string} string - 이스케이프할 문자열 
 * @returns {string} 이스케이프된 문자열
 */
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 이름으로부터 접미사 번호를 추출합니다.
 * @param {string} name - 접미사가 있는 이름 (예: "홍길동-1")
 * @param {string} baseName - 기본 이름 (예: "홍길동")
 * @returns {number} 접미사 번호, 없으면 0 반환
 */
export const extractSuffixNumber = (name, baseName) => {
  if (!name || !baseName) return 0;
  if (name === baseName) return 0;
  
  const pattern = new RegExp(`^${escapeRegExp(baseName)}-([0-9]+)$`);
  const match = name.match(pattern);
  
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * 배열 내에서 중복되지 않는 고유한 이름을 생성합니다.
 * 이름이 중복되면 접미사(-1, -2 등)를 추가합니다.
 * 
 * @param {string} baseName - 기본 이름
 * @param {Array<string>} existingNames - 기존 이름 배열
 * @returns {string} 중복되지 않는 이름
 */
export const generateUniqueNameWithSuffix = (baseName, existingNames) => {
  if (!existingNames || !Array.isArray(existingNames) || existingNames.length === 0) {
    return baseName;
  }
  
  try {
    // 이름이 정확히 일치하는지 확인
    const exactMatch = existingNames.some(name => name === baseName);
    
    // 같은 기본 이름으로 시작하는 모든 항목 찾기
    const sameBaseNames = existingNames.filter(existingName => 
      existingName === baseName || (existingName.includes('-') && existingName.split('-')[0] === baseName)
    );
    
    // 중복된 이름이 없으면 기본 이름 반환
    if (!exactMatch && sameBaseNames.length === 0) {
      return baseName;
    }
    
    // 접미사가 없는 원본 이름이 있는지 확인
    const hasOriginalWithoutSuffix = exactMatch;
    
    // 결과 배열 - 수정이 필요한 경우 여기에 저장 (실제 수정은 호출자가 수행)
    let result = {
      namesToUpdate: [], // {originalName, newName} 형태로 업데이트가 필요한 이름들
      newName: '' // 새로 추가할 이름
    };
    
    // 접미사가 있는 이름 중 가장 큰 접미사 번호 찾기
    let maxSuffix = 0;
    sameBaseNames.forEach(name => {
      if (name.includes('-')) {
        const parts = name.split('-');
        const suffix = parseInt(parts[1], 10);
        if (!isNaN(suffix) && suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      }
    });
    
    // 원본 이름(접미사 없음)이 있는 경우, 이를 -1 접미사로 바꿔야 함
    if (hasOriginalWithoutSuffix) {
      result.namesToUpdate.push({
        originalName: baseName,
        newName: `${baseName}-1`
      });
      
      if (maxSuffix < 1) maxSuffix = 1;
    }
    
    // 새 이름에는 다음 번호 부여 (최대값 + 1)
    result.newName = `${baseName}-${maxSuffix + 1}`;
    
    // 결과 객체 반환 - 호출자가 이를 사용하여 적절한 업데이트 수행
    return result.newName;
  } catch (error) {
    logger.error('이름 생성 중 오류 발생', { baseName, error });
    return `${baseName}-${Date.now().toString().slice(-4)}`;
  }
};

/**
 * 문자열을 특정 길이로 자르고 말줄임표를 추가합니다.
 * @param {string} text - 원본 문자열
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 문자열
 */
export const truncateWithEllipsis = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * 팀 이름을 생성합니다.
 * @param {number} index - 팀 인덱스 (0부터 시작)
 * @param {string} prefix - 팀 이름 접두사 (예: "팀")
 * @returns {string} 생성된 팀 이름 (예: "팀 1", "팀 2")
 */
export const generateTeamName = (index, prefix = '팀') => {
  return `${prefix} ${index + 1}`;
}; 