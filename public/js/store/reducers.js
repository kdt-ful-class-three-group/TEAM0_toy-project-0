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
      
      // 중복 이름 처리 및 새 멤버 이름 생성
      const newName = utils.generateMemberName(memberName.trim(), state.members);
      
      return {
        ...state,
        members: [...state.members, newName]
      };
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
      if (memberToDelete.includes('-')) {
        const baseName = memberToDelete.split('-')[0];
        
        // 같은 기본 이름을 가진 멤버 찾기
        const sameBaseMembers = members.filter(member => {
          if (member.includes('-')) {
            return member.split('-')[0] === baseName;
          }
          return false;
        });
        
        // 접미사가 -1인 멤버만 남았고 다른 중복된 멤버가 없다면
        if (sameBaseMembers.length === 1) {
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
      
      // 중복 검사
      const isDuplicate = state.members.some((m, i) => {
        return i !== index && m === newName;
      });

      if (isDuplicate) {
        console.error("이미 사용 중인 이름입니다.");
        return state;
      }

      const newMembers = [...state.members];
      newMembers[index] = newName;
      
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