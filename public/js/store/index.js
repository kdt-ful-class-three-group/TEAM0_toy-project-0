/**
 * @file store/index.js
 * @description 애플리케이션의 상태 관리를 위한 스토어
 */

import { actionCreators, ACTION_TYPES } from './actions.js';

const initialState = {
  teamCount: 0,
  totalMembers: 0,
  members: [],
  teams: [],
  isTeamCountConfirmed: false,
  isTotalConfirmed: false,
  isDistributed: false
};

const store = {
  state: { ...initialState },
  listeners: [],

  getState() {
    return this.state;
  },

  dispatch(action) {
    console.log('액션 디스패치:', action);
    
    switch (action.type) {
      case ACTION_TYPES.SET_TEAM_COUNT:
        this.state = {
          ...this.state,
          teamCount: action.payload.count || action.payload.teamCount,
          isTeamCountConfirmed: action.payload.isConfirmed || false
        };
        break;
        
      case ACTION_TYPES.CONFIRM_TEAM_COUNT:
        this.state = {
          ...this.state,
          isTeamCountConfirmed: true
        };
        break;
        
      case ACTION_TYPES.RESET_TEAM_COUNT:
        this.state = {
          ...this.state,
          teamCount: 0,
          isTeamCountConfirmed: false
        };
        break;
        
      case ACTION_TYPES.SET_TOTAL_MEMBERS:
        this.state = {
          ...this.state,
          totalMembers: action.payload.count || action.payload.totalMembers,
          isTotalConfirmed: action.payload.isConfirmed || false
        };
        break;
        
      case ACTION_TYPES.CONFIRM_TOTAL_MEMBERS:
        this.state = {
          ...this.state,
          isTotalConfirmed: true
        };
        break;
        
      case ACTION_TYPES.RESET_TOTAL_MEMBERS:
        this.state = {
          ...this.state,
          totalMembers: 0,
          isTotalConfirmed: false
        };
        break;
        
      case ACTION_TYPES.ADD_MEMBER:
        // 멤버 이름 가져오기
        const memberName = action.payload.memberName;
        
        // 이름이 공백이거나 없는 경우 처리하지 않음
        if (!memberName || memberName.trim() === '') {
          console.warn('빈 멤버 이름 추가 시도');
          break;
        }
        
        const trimmedName = memberName.trim();
        const members = [...this.state.members];
        
        console.log('------------ 멤버 추가 로직 시작 ------------');
        console.log('추가할 이름:', trimmedName);
        console.log('현재 멤버 목록:', members);
        
        // 완전히 동일한 이름이 있는지 확인
        const exactDuplicate = members.some(name => name === trimmedName);
        
        // 같은 기본 이름을 가진 항목들 찾기 (접미사 유무 모두 고려)
        const sameBaseNames = members.filter(name => {
          if (name === trimmedName) return true;
          if (name.includes('-')) {
            const baseName = name.split('-')[0];
            return baseName === trimmedName;
          }
          return false;
        });
        
        const hasSameBaseName = sameBaseNames.length > 0;
        
        if (exactDuplicate || hasSameBaseName) {
          // 중복 이름 처리 로직 (접미사 부여)
          console.log('동일한 이름 존재, 접미사 처리 시작:', trimmedName);
          
          // 새 배열 생성 - 수정된 멤버 목록
          let newMembers = [...members];
          
          // 접미사가 없는 원본 이름이 있는 경우 -1 접미사를 추가
          const originalNameIndex = newMembers.findIndex(name => name === trimmedName);
          if (originalNameIndex !== -1) {
            // 기존 이름에 -1 접미사 추가
            newMembers[originalNameIndex] = `${trimmedName}-1`;
            console.log('원본 이름에 접미사 추가:', newMembers[originalNameIndex]);
          }
          
          // 접미사가 있는 기존 멤버들 중 가장 큰 번호 찾기
          let maxSuffix = 1; // 기본값 (원본 이름이 있어서 -1로 변경된 경우)
          sameBaseNames.forEach(name => {
            if (name.includes('-')) {
              const parts = name.split('-');
              const suffix = parseInt(parts[1], 10);
              if (!isNaN(suffix)) {
                maxSuffix = Math.max(maxSuffix, suffix);
              }
            }
          });
          
          // 새 멤버에 다음 번호 부여하기 (최대값 + 1)
          const newMemberName = `${trimmedName}-${maxSuffix + 1}`;
          console.log('새 멤버에 부여된 이름:', newMemberName);
          
          this.state = {
            ...this.state,
            members: [...newMembers, newMemberName]
          };
          
          console.log('멤버 추가 후 상태:', this.state.members);
          console.log('------------ 멤버 추가 로직 완료 ------------');
        } else {
          // 중복이 없는 이름은 그대로 추가
          this.state = {
            ...this.state,
            members: [...this.state.members, trimmedName]
          };
          console.log('멤버 추가 후 목록:', this.state.members);
        }
        break;
        
      case ACTION_TYPES.DELETE_MEMBER:
        const indexToDelete = action.payload.index;
        
        if (indexToDelete < 0 || indexToDelete >= this.state.members.length) {
          console.warn('존재하지 않는 인덱스의 멤버 삭제 시도:', indexToDelete);
          break;
        }
        
        const currentMembers = [...this.state.members];
        
        // 삭제할 멤버 정보 저장
        const memberToDelete = currentMembers[indexToDelete];
        console.log('삭제할 멤버:', memberToDelete);
        
        // 멤버 삭제
        currentMembers.splice(indexToDelete, 1);
        
        // 동일한 기본 이름을 가진 멤버 접미사 처리
        let memberBaseName = memberToDelete;
        
        // 삭제된 멤버의 기본 이름 추출
        if (memberToDelete.includes('-')) {
          memberBaseName = memberToDelete.split('-')[0];
        }
        
        // 같은 기본 이름을 가진 멤버 찾기 (정확히 일치하거나 접미사가 있는 경우 모두 포함)
        const sameBaseMembers = currentMembers.filter(member => {
          return member === memberBaseName || (member.includes('-') && member.split('-')[0] === memberBaseName);
        });
        
        // 접미사가 있는 멤버들 찾기
        const membersWithSuffix = sameBaseMembers.filter(member => member.includes('-'));
        
        // 접미사가 -1인 멤버만 남았고 다른 중복된 멤버가 없다면
        if (membersWithSuffix.length === 1 && sameBaseMembers.length === 1) {
          const remainingMemberIndex = currentMembers.findIndex(member => 
            member.includes('-') && member.split('-')[0] === memberBaseName
          );
          
          if (remainingMemberIndex !== -1) {
            const remainingMember = currentMembers[remainingMemberIndex];
            const suffix = remainingMember.split('-')[1];
            
            // 접미사가 1인 경우, 접미사 제거
            if (suffix === '1') {
              currentMembers[remainingMemberIndex] = memberBaseName;
              console.log('접미사 제거 (마지막 하나 남음):', remainingMember, '->', memberBaseName);
            }
          }
        }
        
        this.state = {
          ...this.state,
          members: currentMembers
        };
        console.log('멤버 삭제 후 목록:', this.state.members);
        break;
        
      case ACTION_TYPES.EDIT_MEMBER:
        const { index, newName } = action.payload;
        
        console.log('멤버 수정 요청:', index, newName);
        console.log('수정 전 멤버 목록:', this.state.members);
        
        if (index < 0 || index >= this.state.members.length || !newName || newName.trim() === '') {
          console.warn('유효하지 않은 수정 요청:', index, newName);
          break;
        }
        
        const trimmedNewName = newName.trim();
        const oldName = this.state.members[index];
        
        console.log('멤버 이름 수정:', oldName, '→', trimmedNewName);
        
        // 변경 사항이 없는 경우 무시
        if (oldName === trimmedNewName) {
          console.warn('변경 사항 없음:', oldName, '===', trimmedNewName);
          break;
        }
        
        // 문자열 접미사(-xxx)가 있는지 확인
        const hasCustomSuffix = trimmedNewName.includes('-');
        
        // 기본 이름 추출 (접미사가 있다면 제외)
        let editBaseName = trimmedNewName;
        let suffix = '';
        
        if (hasCustomSuffix) {
          const parts = trimmedNewName.split('-');
          editBaseName = parts[0];
          suffix = parts.slice(1).join('-'); // 하이픈이 여러 개일 경우 모두 포함
        }
        
        // 중복 검사 (자기 자신 제외)
        const isDuplicate = this.state.members.some((m, i) => {
          // 자기 자신은 제외
          if (i === index) return false;
          
          // 정확히 일치하는 경우
          if (m === trimmedNewName) return true;
          
          // 접미사가 있고 기본 이름이 같은 경우도 검사
          if (hasCustomSuffix && m.includes('-')) {
            const mParts = m.split('-');
            const mBaseName = mParts[0];
            const mSuffix = mParts[1];
            
            return mBaseName === editBaseName && mSuffix === suffix;
          }
          
          return false;
        });

        if (isDuplicate) {
          console.warn("이미 사용 중인 이름입니다:", trimmedNewName);
          break;
        }

        const newMembers = [...this.state.members];
        newMembers[index] = trimmedNewName;
        
        console.log('멤버 이름 수정 완료:', oldName, '→', trimmedNewName);
        console.log('수정 후 멤버 목록:', newMembers);
        
        this.state = {
          ...this.state,
          members: newMembers
        };
        break;
        
      case ACTION_TYPES.DISTRIBUTE_TEAMS:
      case ACTION_TYPES.SET_TEAMS:
        this.state = {
          ...this.state,
          teams: action.payload.teams || [],
          isDistributed: action.payload.isDistributed || true
        };
        break;
        
      case ACTION_TYPES.RESET_STATE:
        this.state = { ...initialState };
        break;
        
      default:
        console.warn('알 수 없는 액션 타입:', action.type);
        break;
    }
    
    console.log('상태 업데이트 후:', this.state);
    this.notifyListeners();
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
};

// 선택자 등록
store.registerSelector = (name, selector) => {
  store[name] = () => selector(store.getState());
};

// 기본 선택자 등록
store.registerSelector('getTeamCount', state => state.teamCount);
store.registerSelector('getTotalMembers', state => state.totalMembers);
store.registerSelector('getMembers', state => state.members);
store.registerSelector('getTeams', state => state.teams);

export { actionCreators };
export default store; 