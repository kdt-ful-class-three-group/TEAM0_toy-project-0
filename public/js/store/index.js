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
      case ACTION_TYPES.ADD_MEMBER:
        this.state = {
          ...this.state,
          members: [...this.state.members, action.payload.memberName]
        };
        break;
      case ACTION_TYPES.DELETE_MEMBER:
        this.state = {
          ...this.state,
          members: this.state.members.filter((_, i) => i !== action.payload.index)
        };
        break;
      case ACTION_TYPES.EDIT_MEMBER:
        this.state = {
          ...this.state,
          members: this.state.members.map((member, i) => 
            i === action.payload.index ? action.payload.newName : member
          )
        };
        break;
      case ACTION_TYPES.DISTRIBUTE_TEAMS:
      case 'SET_TEAMS':  // 이전 코드와의 호환성을 위해 유지
        this.state = {
          ...this.state,
          teams: action.payload.teams || [],
          isDistributed: action.payload.isDistributed || true
        };
        break;
      case ACTION_TYPES.RESET_STATE:
      case 'RESET_STATE':  // 이전 코드와의 호환성을 위해 유지
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