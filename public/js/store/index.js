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
  const subscribersMap = new Map();

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
    const prevState = {...state};
    state = reducer(state, action);
    console.group("액션 디스패치");
    console.log("액션:", action);
    console.table(state);
    console.groupEnd();
    
    notify(prevState);
    return action;
  };

  /**
   * @function setState
   * @description 상태를 직접 설정합니다 (디버깅/테스트용).
   * @param {Object} newState - 새 상태 객체
   */
  const setState = (newState) => {
    const prevState = {...state};
    // 상태 깊은 복사 및 병합
    state = {...state, ...newState};
    console.group("상태 직접 변경");
    console.table(state);
    console.groupEnd();
    
    notify(prevState);
    return state;
  };

  /**
   * @function subscribe
   * @description 상태 변경을 구독합니다. 선택적으로 특정 상태 부분만 구독 가능합니다.
   * @param {Function} listener - 상태 변경 시 호출될 리스너
   * @param {Function} [selector] - 특정 상태 부분을 선택하는 함수 (옵션)
   * @returns {Function} 구독 해제 함수
   */
  const subscribe = (listener, selector) => {
    if (typeof selector === 'function') {
      // 선택자 함수가 제공된 경우 (최적화된 구독)
      const wrappedListener = (newState, prevState) => {
        // 선택된 상태 부분 추출
        const selectedNewState = selector(newState);
        const selectedPrevState = selector(prevState);
        
        // 선택된 상태가 변경된 경우에만 리스너 호출
        if (JSON.stringify(selectedNewState) !== JSON.stringify(selectedPrevState)) {
          listener(selectedNewState);
        }
      };
      
      subscribersMap.set(listener, wrappedListener);
      listeners.add(wrappedListener);
    } else {
      // 기존 방식 구독 (전체 상태 구독)
      listeners.add(listener);
    }
    
    return () => {
      if (subscribersMap.has(listener)) {
        const wrappedListener = subscribersMap.get(listener);
        listeners.delete(wrappedListener);
        subscribersMap.delete(listener);
      } else {
        listeners.delete(listener);
      }
    };
  };

  /**
   * @function notify
   * @description 모든 구독자에게 상태 변경을 알립니다.
   * @param {Object} prevState - 변경 전 상태
   */
  const notify = (prevState) => {
    listeners.forEach((listener) => {
      listener(getState(), prevState);
    });
  };

  return { getState, dispatch, setState, subscribe };
};

// 스토어 인스턴스 생성
const store = createStore(rootReducer, initialState);

// 액션 크리에이터 익스포트
export const actionCreators = actions;

// 스토어 익스포트
export default store; 