/**
 * @file store/index.js
 * @description Action/Reducer 패턴을 사용한 상태 관리 시스템
 */

import { rootReducer, initialState } from './reducers.js';
import * as actions from './actions.js';

/**
 * @typedef {Object} State
 * @property {Array<string>} members - 멤버 이름 배열
 * @property {number} totalMembers - 총원
 * @property {boolean} isTotalConfirmed - 총원 확정 여부
 * @property {number} teamCount - 팀 개수
 * @property {boolean} isTeamCountConfirmed - 팀 개수 확정 여부
 */

/**
 * @function createStore
 * @description Action/Reducer 패턴을 사용한 상태 관리 스토어를 생성합니다.
 * @returns {{ getState: Function, dispatch: Function, subscribe: Function }}
 */
const createStore = (reducer, initialState) => {
  console.info("스토어 생성 - 초기 상태:", initialState);

  let state = { ...initialState };
  const listeners = new Set();

  /**
   * @function getState
   * @returns {State}
   */
  const getState = () => {
    return { ...state };
  };

  /**
   * @function dispatch
   * @param {Object} action - 디스패치할 액션 객체
   * @returns {Object} 디스패치된 액션
   */
  const dispatch = (action) => {
    state = reducer(state, action);
    console.table(state);
    notify();
    return action;
  };

  /**
   * @function subscribe
   * @param {Function} listener
   * @returns {Function} unsubscribe
   */
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  /**
   * @function notify
   * @description 모든 구독자에게 상태 변경을 알립니다.
   */
  const notify = () => {
    listeners.forEach((listener) => {
      listener(getState());
    });
  };

  return { getState, dispatch, subscribe };
};

// 스토어 인스턴스 생성
const store = createStore(rootReducer, initialState);

// 액션 크리에이터 익스포트
export const actionCreators = actions;

// 스토어 익스포트
export default store; 