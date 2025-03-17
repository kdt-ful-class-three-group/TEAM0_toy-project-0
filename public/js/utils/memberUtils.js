/**
 * @file utils/memberUtils.js
 * @description 멤버 관련 유틸리티 함수를 제공하는 모듈입니다.
 */

import * as stringUtils from './stringUtils.js';

/**
 * 더 많은 멤버를 추가할 수 있는지 확인합니다.
 * @param {object} state - 애플리케이션 상태
 * @returns {boolean} 추가 가능 여부
 */
export const canAddMore = (state) => {
  if (!state) return false;
  return (
    state.isTotalConfirmed &&
    state.totalMembers > 0 &&
    state.members.length < state.totalMembers
  );
};

/**
 * 중복되지 않는 멤버 이름을 생성합니다.
 * @param {string} name - 기본 이름
 * @param {Array<string>} existingNames - 기존 이름 배열
 * @returns {string} 중복되지 않는 이름
 */
export const generateMemberName = (name, existingNames) => {
  return stringUtils.generateUniqueNameWithSuffix(name, existingNames);
};

/**
 * 총원에서 몇 명이 더 필요한지 계산합니다.
 * @param {object} state - 애플리케이션 상태
 * @returns {number} 필요한 추가 멤버 수
 */
export const getRemainingMembersCount = (state) => {
  if (!state || !state.isTotalConfirmed || state.totalMembers <= 0) {
    return 0;
  }
  
  return Math.max(0, state.totalMembers - state.members.length);
};

/**
 * 특정 인덱스의 멤버를 제외한 모든 멤버 배열을 반환합니다.
 * @param {Array<string>} members - 전체 멤버 배열
 * @param {number} excludeIndex - 제외할 멤버 인덱스
 * @returns {Array<string>} 필터링된 멤버 배열
 */
export const getMembersExcept = (members, excludeIndex) => {
  if (!members || !Array.isArray(members)) return [];
  
  return members.filter((_, index) => index !== excludeIndex);
};

/**
 * 멤버 이름을 기준으로 정렬합니다.
 * @param {Array<string>} members - 멤버 배열
 * @param {boolean} ascending - 오름차순 정렬 여부 (기본값: true)
 * @returns {Array<string>} 정렬된 멤버 배열
 */
export const sortMembersByName = (members, ascending = true) => {
  if (!members || !Array.isArray(members)) return [];
  
  return [...members].sort((a, b) => {
    const comparison = a.localeCompare(b, 'ko');
    return ascending ? comparison : -comparison;
  });
}; 