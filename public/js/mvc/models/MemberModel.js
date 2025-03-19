/**
 * @file MemberModel.js
 * @description 멤버 데이터와 관련된 상태 및 비즈니스 로직을 관리하는 모델
 */

import store from '../../store/index.js';
import { ACTION_TYPES } from '../../store/actions.js';
import { EventEmitter } from '../../utils/EventEmitter.js';

/**
 * 멤버 데이터를 관리하는 모델 클래스
 * 옵저버 패턴을 사용하여 상태 변경 시 구독자에게 알림
 */
export class MemberModel extends EventEmitter {
  constructor() {
    super();
    this._members = [];
    this._totalMembers = 0;
    this._isTotalConfirmed = false;
    this._isTeamCountConfirmed = false;
    this._editingIndex = -1;
    
    // 초기 상태 설정 (구독 전에 먼저 설정)
    this._syncWithStore();
    
    // 스토어 구독
    this._unsubscribe = store.subscribe(this._handleStoreChange.bind(this));
    
    // 초기 이벤트 발행 (컴포넌트에 즉시 알림)
    setTimeout(() => {
      this.emit('change', { 
        model: this, 
        changes: {
          members: true,
          totalMembers: true,
          isTotalConfirmed: true,
          isTeamCountConfirmed: true
        },
        state: this.getState()
      });
    }, 0);
  }
  
  /**
   * 스토어 변경 핸들러
   * @param {Object} state - 새로운 스토어 상태
   * @private
   */
  _handleStoreChange(state) {
    const prevState = {
      members: this._members,
      totalMembers: this._totalMembers,
      isTotalConfirmed: this._isTotalConfirmed,
      isTeamCountConfirmed: this._isTeamCountConfirmed
    };
    
    // 상태 업데이트
    this._members = [...state.members];
    this._totalMembers = state.totalMembers;
    this._isTotalConfirmed = state.isTotalConfirmed;
    this._isTeamCountConfirmed = state.isTeamCountConfirmed;
    
    // 변경된 속성들 추적
    const changes = {
      members: prevState.members !== this._members,
      totalMembers: prevState.totalMembers !== this._totalMembers,
      isTotalConfirmed: prevState.isTotalConfirmed !== this._isTotalConfirmed,
      isTeamCountConfirmed: prevState.isTeamCountConfirmed !== this._isTeamCountConfirmed
    };

    // 변경 사항이 있는 경우 이벤트 발행
    if (Object.values(changes).some(changed => changed)) {
      this.emit('change', { 
        model: this, 
        changes,
        state: this.getState()
      });
    }
  }
  
  /**
   * 스토어와 상태 동기화
   * @private
   */
  _syncWithStore() {
    const state = store.getState();
    this._members = [...state.members];
    this._totalMembers = state.totalMembers;
    this._isTotalConfirmed = state.isTotalConfirmed;
    this._isTeamCountConfirmed = state.isTeamCountConfirmed;
  }
  
  /**
   * 모델 정리 (메모리 누수 방지)
   */
  dispose() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    
    this.removeAllListeners();
  }
  
  /**
   * 현재 모델 상태 반환
   * @returns {Object} 모델 상태
   */
  getState() {
    return {
      members: [...this._members],
      totalMembers: this._totalMembers,
      isTotalConfirmed: this._isTotalConfirmed,
      isTeamCountConfirmed: this._isTeamCountConfirmed,
      editingIndex: this._editingIndex
    };
  }
  
  /**
   * 멤버 목록 반환
   * @returns {Array} 멤버 목록
   */
  getMembers() {
    return [...this._members];
  }
  
  /**
   * 총원수 반환
   * @returns {number} 총원수
   */
  getTotalMembers() {
    return this._totalMembers;
  }
  
  /**
   * 총원 설정 확정 여부 반환
   * @returns {boolean} 총원 설정 확정 여부
   */
  isTotalConfirmed() {
    return this._isTotalConfirmed;
  }
  
  /**
   * 팀 구성 확정 여부 반환
   * @returns {boolean} 팀 구성 확정 여부
   */
  isTeamCountConfirmed() {
    return this._isTeamCountConfirmed;
  }
  
  /**
   * 편집 중인 멤버 인덱스 반환
   * @returns {number} 편집 중인 멤버 인덱스 (-1은 편집 중이 아님)
   */
  getEditingIndex() {
    return this._editingIndex;
  }
  
  /**
   * 편집 모드 설정
   * @param {number} index - 편집할 멤버 인덱스
   */
  setEditingIndex(index) {
    if (this._editingIndex !== index) {
      this._editingIndex = index;
      this.emit('editingChange', { index });
    }
  }
  
  /**
   * 총원 설정
   * @param {number} count - 설정할 총원수
   * @returns {boolean} 성공 여부
   */
  setTotalMembers(count) {
    if (!Number.isInteger(count) || count <= 0) {
      return false;
    }
    
    store.dispatch({
      type: ACTION_TYPES.SET_TOTAL_MEMBERS,
      payload: { count }
    });
    
    return true;
  }
  
  /**
   * 총원 설정 확정
   * @returns {boolean} 성공 여부
   */
  confirmTotalMembers() {
    if (this._totalMembers <= 0) {
      return false;
    }
    
    store.dispatch({
      type: ACTION_TYPES.CONFIRM_TOTAL_MEMBERS
    });
    
    return true;
  }
  
  /**
   * 멤버 추가
   * @param {string} name - 추가할 멤버 이름
   * @returns {boolean} 성공 여부
   */
  addMember(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return false;
    }
    
    // 총원 및 팀 구성 확정 여부 확인
    if (!this._isTotalConfirmed || !this._isTeamCountConfirmed) {
      return false;
    }
    
    // 총원 초과 검사
    if (this._members.length >= this._totalMembers) {
      return false;
    }
    
    store.dispatch({
      type: ACTION_TYPES.ADD_MEMBER,
      payload: { memberName: name.trim() }
    });
    
    // 상태 변경 확인
    return store.getState().members.length > this._members.length;
  }
  
  /**
   * 멤버 삭제
   * @param {number} index - 삭제할 멤버 인덱스
   * @returns {boolean} 성공 여부
   */
  deleteMember(index) {
    if (index < 0 || index >= this._members.length) {
      return false;
    }
    
    const prevLength = this._members.length;
    
    store.dispatch({
      type: ACTION_TYPES.DELETE_MEMBER,
      payload: { index }
    });
    
    // 상태 변경 확인
    return store.getState().members.length < prevLength;
  }
  
  /**
   * 멤버 이름 업데이트
   * @param {number} index - 수정할 멤버 인덱스
   * @param {string} newSuffix - 새 접미사
   * @returns {boolean} 성공 여부
   */
  updateMemberName(index, newSuffix) {
    if (index < 0 || index >= this._members.length) {
      return false;
    }
    
    const member = this._members[index];
    let baseName = member;
    
    // 기존에 접미사가 있는지 확인
    if (typeof member === 'string' && member.includes('-')) {
      baseName = member.split('-')[0];
    }
    
    // 새 이름 생성
    let newName = baseName;
    if (newSuffix && newSuffix.trim() !== '') {
      newName = `${baseName}-${newSuffix.trim()}`;
    }
    
    store.dispatch({
      type: ACTION_TYPES.EDIT_MEMBER,
      payload: { index, newName }
    });
    
    // 편집 모드 종료
    this.setEditingIndex(-1);
    
    return true;
  }
} 