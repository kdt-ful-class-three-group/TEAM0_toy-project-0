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
    // 정확히 일치하는지 확인
    const exactMatch = existingNames.includes(baseName);
    
    // 같은 기본 이름으로 시작하는 모든 항목 찾기
    const sameBaseNames = existingNames.filter(existingName => 
      existingName === baseName || existingName.startsWith(`${baseName}-`)
    );
    
    // 중복된 이름이 없으면 기본 이름 반환
    if (!exactMatch && sameBaseNames.length === 0) {
      return baseName;
    }
    
    // 사용된 접미사 번호 추출
    const usedSuffixes = sameBaseNames
      .map(name => {
        if (name === baseName) return 0;
        return extractSuffixNumber(name, baseName);
      })
      .filter(n => n !== 0);
    
    // 다음 접미사 번호 결정 (최대값 + 1 또는 1)
    const nextSuffix = usedSuffixes.length > 0 ? Math.max(...usedSuffixes) + 1 : 1;
    
    return `${baseName}-${nextSuffix}`;
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