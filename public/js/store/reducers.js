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
    case ACTION_TYPES.RESET_TEAM_COUNT:
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
      
      console.log('멤버 추가 요청:', memberName);
      
      if (!memberName || memberName.trim() === '') {
        console.warn('빈 멤버 이름 추가 시도');
        return state;
      }
      
      // 총원 초과 체크
      if (state.isTotalConfirmed && state.members.length >= state.totalMembers) {
        console.warn('총원 초과 멤버 추가 시도:', state.members.length, '>=', state.totalMembers);
        return state;
      }
      
      const trimmedName = memberName.trim();
      const members = [...state.members];
      
      console.log('------------ 멤버 추가 로직 시작 ------------');
      console.log('추가할 이름:', trimmedName);
      console.log('현재 멤버 목록:', members);
      
      // 완전히 동일한 이름이 있는지 확인
      const exactDuplicate = members.some(name => name === trimmedName);
      
      if (exactDuplicate) {
        console.log('동일한 이름 존재, 접미사 처리 시작:', trimmedName);
        
        // 동일한 기본 이름을 가진 멤버들 찾기
        const exactMatches = members.filter(name => {
          return name === trimmedName || 
                 (name.includes('-') && name.split('-')[0] === trimmedName);
        });
        
        console.log('동일 이름 또는 접미사 포함 멤버:', exactMatches);
        
        let newMembers = [...members];
        
        // 접미사가 없는 원본 이름이 있는 경우
        const originalNameIndex = newMembers.findIndex(name => name === trimmedName);
        if (originalNameIndex !== -1) {
          // 기존 이름에 -1 접미사 추가
          newMembers[originalNameIndex] = `${trimmedName}-1`;
          console.log('원본 이름에 접미사 추가:', newMembers[originalNameIndex]);
        }
        
        // 새 멤버에 접미사 부여 (가장 큰 숫자 + 1)
        let maxSuffix = 1; // 기본값
        exactMatches.forEach(name => {
          if (name.includes('-')) {
            const parts = name.split('-');
            const suffix = parts[1];
            if (!isNaN(parseInt(suffix))) {
              maxSuffix = Math.max(maxSuffix, parseInt(suffix));
            }
          }
        });
        
        // 새 멤버 이름
        const newMemberName = `${trimmedName}-${maxSuffix + 1}`;
        console.log('새 멤버에 부여된 이름:', newMemberName);
        
        const result = {
          ...state,
          members: [...newMembers, newMemberName]
        };
        
        console.log('멤버 추가 후 상태:', result.members);
        console.log('------------ 멤버 추가 로직 완료 ------------');
        
        return result;
      } 
      // 중복이 없는 완전히 새로운 이름
      else {
        console.log('새 멤버 추가 (중복 없음):', trimmedName);
        const result = {
          ...state,
          members: [...members, trimmedName]
        };
        
        console.log('멤버 추가 후 상태:', result.members);
        console.log('------------ 멤버 추가 로직 완료 ------------');
        
        return result;
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
      
      console.log('멤버 수정 요청:', index, newName);
      console.log('수정 전 멤버 목록:', state.members);
      
      if (index < 0 || index >= state.members.length || !newName || newName.trim() === '') {
        console.warn('유효하지 않은 수정 요청:', index, newName);
        return state;
      }
      
      const trimmedNewName = newName.trim();
      const oldName = state.members[index];
      
      console.log('멤버 이름 수정:', oldName, '→', trimmedNewName);
      
      // 변경 사항이 없는 경우 무시
      if (oldName === trimmedNewName) {
        console.warn('변경 사항 없음:', oldName, '===', trimmedNewName);
        return state;
      }
      
      // 문자열 접미사(-xxx)가 있는지 확인
      const hasCustomSuffix = trimmedNewName.includes('-');
      
      // 기본 이름 추출 (접미사가 있다면 제외)
      let baseName = trimmedNewName;
      let suffix = '';
      
      if (hasCustomSuffix) {
        const parts = trimmedNewName.split('-');
        baseName = parts[0];
        suffix = parts.slice(1).join('-'); // 하이픈이 여러 개일 경우 모두 포함
      }
      
      // 중복 검사
      const isDuplicate = state.members.some((m, i) => {
        // 자기 자신은 제외
        if (i === index) return false;
        
        // 정확히 일치하는 경우
        return m === trimmedNewName;
      });

      if (isDuplicate) {
        console.warn("이미 사용 중인 이름입니다:", trimmedNewName);
        return state;
      }

      const newMembers = [...state.members];
      newMembers[index] = trimmedNewName;
      
      console.log('멤버 이름 수정 완료:', oldName, '→', trimmedNewName);
      console.log('수정 후 멤버 목록:', newMembers);
      
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
    
    case ACTION_TYPES.RESET_TEAM_COUNT: {
      return {
        ...state,
        teamCount: 0,
        isTeamCountConfirmed: false
      };
    }
    
    default:
      return state;
  }
}; 