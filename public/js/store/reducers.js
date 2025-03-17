/**
 * @file reducers.js
 * @description 액션에 따른 상태 변경 로직을 담당하는 리듀서 함수들을 정의합니다.
 */

import { ACTION_TYPES } from './actions.js';
import utils from '../utils/index.js';

// 초기 상태
export const initialState = {
  members: [],
  totalMembers: 0,
  isTotalConfirmed: false,
  teamCount: 0,
  isTeamCountConfirmed: false
};

/**
 * 루트 리듀서 함수
 * @param {Object} state - 현재 상태
 * @param {Object} action - 디스패치된 액션
 * @returns {Object} 새로운 상태
 */
export const rootReducer = (state = initialState, action) => {
  console.info('액션 디스패치:', action.type, action.payload);
  
  switch (action.type) {
    case ACTION_TYPES.ADD_MEMBER:
      return memberReducer(state, action);
      
    case ACTION_TYPES.DELETE_MEMBER:
    case ACTION_TYPES.EDIT_MEMBER:
      return memberReducer(state, action);
      
    case ACTION_TYPES.SET_TOTAL_MEMBERS:
    case ACTION_TYPES.CONFIRM_TOTAL_MEMBERS:
    case ACTION_TYPES.RESET_TOTAL_MEMBERS:
      return totalMembersReducer(state, action);
      
    case ACTION_TYPES.SET_TEAM_COUNT:
    case ACTION_TYPES.CONFIRM_TEAM_COUNT:
      return teamCountReducer(state, action);
      
    case ACTION_TYPES.RESET_STATE:
      return { ...initialState };
      
    default:
      return state;
  }
};

/**
 * 멤버 관련 리듀서
 * @param {Object} state - 현재 상태
 * @param {Object} action - 디스패치된 액션
 * @returns {Object} 새로운 상태
 */
const memberReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_MEMBER: {
      const { memberName } = action.payload;
      
      if (!memberName || memberName.trim() === '') {
        return state;
      }
      
      // 총원 초과 체크
      if (state.members.length >= state.totalMembers) {
        return state;
      }
      
      const trimmedName = memberName.trim();
      const members = [...state.members];
      
      // 중복 이름이 있는지 확인
      const exactMatches = members.filter(name => {
        // 정확히 일치하거나, 접미사가 있는 경우 기본 이름이 일치하는지 확인
        return name === trimmedName || 
               (name.includes('-') && name.split('-')[0] === trimmedName);
      });
      
      let newMembers = [...members];
      
      // 동일한 이름이 있는 경우 (첫 번째 중복)
      if (exactMatches.length === 1 && exactMatches[0] === trimmedName) {
        // 기존 동일 이름의 인덱스 찾기
        const existingIndex = members.findIndex(name => name === trimmedName);
        
        // 기존 이름에 -1 접미사 추가
        if (existingIndex !== -1) {
          newMembers[existingIndex] = `${trimmedName}-1`;
        }
        
        // 새로운 이름에는 -2 접미사 추가
        return {
          ...state,
          members: [...newMembers, `${trimmedName}-2`]
        };
      } 
      // 이미 접미사가 있는 이름들이 존재하는 경우
      else if (exactMatches.length > 0) {
        // 새 이름 생성 (기존 방식 사용)
        const newName = utils.generateMemberName(trimmedName, members);
        return {
          ...state,
          members: [...members, newName]
        };
      }
      // 중복 없는 완전히 새로운 이름
      else {
        return {
          ...state,
          members: [...members, trimmedName]
        };
      }
    }
    
    case ACTION_TYPES.DELETE_MEMBER: {
      const { index } = action.payload;
      
      if (index < 0 || index >= state.members.length) {
        return state;
      }
      
      const members = [...state.members];
      
      // 삭제할 멤버 정보 저장
      const memberToDelete = members[index];
      
      // 멤버 삭제
      members.splice(index, 1);
      
      // 동일한 기본 이름을 가진 멤버 접미사 처리
      let baseName = memberToDelete;
      
      // 삭제된 멤버의 기본 이름 추출
      if (memberToDelete.includes('-')) {
        baseName = memberToDelete.split('-')[0];
      }
      
      // 같은 기본 이름을 가진 멤버 찾기 (정확히 일치하거나 접미사가 있는 경우 모두 포함)
      const sameBaseMembers = members.filter(member => {
        return member === baseName || (member.includes('-') && member.split('-')[0] === baseName);
      });
      
      // 접미사가 있는 멤버들 찾기
      const membersWithSuffix = sameBaseMembers.filter(member => member.includes('-'));
      
      // 접미사가 -1인 멤버만 남았고 다른 중복된 멤버가 없다면
      if (membersWithSuffix.length === 1 && sameBaseMembers.length === 1) {
        const remainingMemberIndex = members.findIndex(member => 
          member.includes('-') && member.split('-')[0] === baseName
        );
        
        if (remainingMemberIndex !== -1) {
          const remainingMember = members[remainingMemberIndex];
          const suffix = remainingMember.split('-')[1];
          
          // 접미사가 1인 경우, 접미사 제거
          if (suffix === '1') {
            members[remainingMemberIndex] = baseName;
          }
        }
      }
      
      return {
        ...state,
        members
      };
    }
    
    case ACTION_TYPES.EDIT_MEMBER: {
      const { index, newName } = action.payload;
      
      if (index < 0 || index >= state.members.length || !newName || newName.trim() === '') {
        return state;
      }
      
      const trimmedNewName = newName.trim();
      const oldName = state.members[index];
      
      // 변경 사항이 없는 경우 무시
      if (oldName === trimmedNewName) {
        return state;
      }
      
      // 문자열 접미사(-xxx)가 있는지 확인
      const hasCustomSuffix = trimmedNewName.includes('-') && 
                              isNaN(trimmedNewName.split('-')[1]);
      
      // 기본 이름 추출 (접미사가 있다면 제외)
      let baseName = trimmedNewName;
      if (trimmedNewName.includes('-')) {
        baseName = trimmedNewName.split('-')[0];
      }
      
      // 중복 검사 (사용자 정의 접미사는 중복 검사에서 예외)
      const isDuplicate = state.members.some((m, i) => {
        // 자기 자신은 제외
        if (i === index) return false;
        
        // 정확히 일치하는 경우
        if (m === trimmedNewName) return true;
        
        // 사용자 정의 접미사가 있는 경우는 정확히 일치하는 경우만 체크
        if (hasCustomSuffix) return m === trimmedNewName;
        
        // 숫자 접미사 또는 접미사 없는 이름의 경우 기본 이름이 같은지 확인
        return m === baseName || 
               (m.includes('-') && 
                !isNaN(m.split('-')[1]) && 
                m.split('-')[0] === baseName);
      });

      if (isDuplicate) {
        console.error("이미 사용 중인 이름입니다.");
        return state;
      }

      const newMembers = [...state.members];
      newMembers[index] = trimmedNewName;
      
      return {
        ...state,
        members: newMembers
      };
    }
    
    default:
      return state;
  }
};

/**
 * 총원 관련 리듀서
 * @param {Object} state - 현재 상태
 * @param {Object} action - 디스패치된 액션
 * @returns {Object} 새로운 상태
 */
const totalMembersReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_TOTAL_MEMBERS: {
      const { count } = action.payload;
      
      if (!utils.validateNumber(count) || count < 1) {
        return state;
      }
      
      return {
        ...state,
        totalMembers: count
      };
    }
    
    case ACTION_TYPES.CONFIRM_TOTAL_MEMBERS: {
      if (!utils.validateTotalMembers(state.totalMembers)) {
        return state;
      }
      
      return {
        ...state,
        isTotalConfirmed: true
      };
    }
    
    case ACTION_TYPES.RESET_TOTAL_MEMBERS: {
      return {
        ...state,
        members: [],
        isTotalConfirmed: false,
        totalMembers: 0,
        teamCount: 0,
        isTeamCountConfirmed: false
      };
    }
    
    default:
      return state;
  }
};

/**
 * 팀 개수 관련 리듀서
 * @param {Object} state - 현재 상태
 * @param {Object} action - 디스패치된 액션
 * @returns {Object} 새로운 상태
 */
const teamCountReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_TEAM_COUNT: {
      const { count } = action.payload;
      
      if (!utils.validateNumber(count) || count < 1) {
        return state;
      }
      
      return {
        ...state,
        teamCount: count
      };
    }
    
    case ACTION_TYPES.CONFIRM_TEAM_COUNT: {
      if (state.teamCount < 1 || state.teamCount > state.totalMembers) {
        return state;
      }
      
      return {
        ...state,
        isTeamCountConfirmed: true
      };
    }
    
    default:
      return state;
  }
}; 