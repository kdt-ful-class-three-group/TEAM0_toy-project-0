/**
 * @file store/index.js
 * @description Action/Reducer 패턴을 사용한 상태 관리 시스템
 */

import { rootReducer, initialState } from './reducers.js';
import * as actions from './actions.js';
import { 
  loggerMiddleware, 
  historyMiddleware, 
  errorMiddleware, 
  validationMiddleware,
  memoMiddleware,
  timeTravel
} from './middleware.js';

/**
 * @typedef {Object} State
 * @property {Array<string>} members - 멤버 이름 배열
 * @property {number} totalMembers - 총원
 * @property {boolean} isTotalConfirmed - 총원 확정 여부
 * @property {number} teamCount - 팀 개수
 * @property {boolean} isTeamCountConfirmed - 팀 개수 확정 여부
 */

/**
 * 미들웨어 적용 함수
 * @param {Function} storeApi - 스토어 API 객체 (getState, dispatch 등)
 * @param {Array<Function>} middlewares - 적용할 미들웨어 배열
 * @returns {Function} 미들웨어가 적용된 dispatch 함수
 */
const applyMiddleware = (storeApi, middlewares) => {
  // 미들웨어 함수 체인 구성
  let dispatch = action => action;
  
  // 미들웨어 체인 구성 (뒤에서부터 실행)
  const chain = middlewares.map(middleware => middleware(storeApi));
  
  // 원본 dispatch 함수 (최종 실행)
  const originalDispatch = action => {
    const prevState = {...storeApi.getState()};
    storeApi.state = storeApi.reducer(storeApi.state, action);
    storeApi.notify(prevState);
    return action;
  };
  
  // 미들웨어 체인 구성
  dispatch = chain.reduceRight(
    (next, middleware) => middleware(next),
    originalDispatch
  );
  
  return dispatch;
};

/**
 * @function createStore
 * @description Action/Reducer 패턴을 사용한 상태 관리 스토어를 생성합니다.
 * @param {Function} reducer - 리듀서 함수
 * @param {Object} initialState - 초기 상태
 * @param {Array<Function>} [middlewares=[]] - 적용할 미들웨어 배열
 * @returns {{ getState: Function, dispatch: Function, subscribe: Function, select: Function }}
 */
const createStore = (reducer, initialState, middlewares = []) => {
  console.info("스토어 생성 - 초기 상태:", initialState);

  // 내부 상태
  const store = {
    state: { ...initialState },
    reducer,
    listeners: new Set(),
    subscribersMap: new Map(),
    selectors: new Map()
  };

  /**
   * @function getState
   * @returns {State} 현재 상태의 복사본
   */
  const getState = () => {
    return { ...store.state };
  };

  /**
   * @function setState
   * @description 상태를 직접 설정합니다 (디버깅/테스트용).
   * @param {Object} newState - 새 상태 객체
   */
  const setState = (newState) => {
    const prevState = {...store.state};
    // 상태 깊은 복사 및 병합
    store.state = {...store.state, ...newState};
    console.group("상태 직접 변경");
    console.table(store.state);
    console.groupEnd();
    
    notify(prevState);
    return store.state;
  };

  /**
   * @function subscribe
   * @description 상태 변경을 구독합니다. 선택적으로 특정 상태 부분만 구독 가능합니다.
   * @param {Function} listener - 상태 변경 시 호출될 리스너
   * @param {Function|Object} [options] - 옵션 객체 또는 선택자 함수
   * @returns {Function} 구독 해제 함수
   */
  const subscribe = (listener, options) => {
    if (typeof options === 'function') {
      // 기존 방식 호환성 유지 (선택자 함수)
      return subscribeWithSelector(listener, options);
    } else if (options && typeof options === 'object') {
      // 새로운 방식: 옵션 객체
      const { selector, equalityFn = defaultEqualityFn } = options;
      return subscribeWithSelector(listener, selector, equalityFn);
    } else {
      // 전체 상태 구독 (기존 방식)
      store.listeners.add(listener);
      
      return () => {
        store.listeners.delete(listener);
      };
    }
  };
  
  /**
   * 선택자 함수를 사용한 구독
   * @private
   */
  const subscribeWithSelector = (listener, selector, equalityFn = defaultEqualityFn) => {
    if (typeof selector !== 'function') {
      throw new Error('선택자는 함수여야 합니다.');
    }
    
    // 마지막으로 선택된 상태 값을 저장
    let lastSelectedState;
    
    try {
      // 초기 선택 상태 계산
      lastSelectedState = selector(store.state);
    } catch (error) {
      console.error('선택자 함수 초기 실행 오류:', error);
      lastSelectedState = undefined;
    }
    
    // 래핑된 리스너 생성
    const wrappedListener = (newState, prevState) => {
      let currentSelectedState;
      
      try {
        currentSelectedState = selector(newState);
      } catch (error) {
        console.error('선택자 함수 실행 오류:', error);
        return;
      }
      
      // 선택된 상태가 변경된 경우에만 리스너 호출
      const hasChanged = !equalityFn(currentSelectedState, lastSelectedState);
      
      if (hasChanged) {
        const previousSelectedState = lastSelectedState;
        lastSelectedState = currentSelectedState;
        listener(currentSelectedState, previousSelectedState);
      }
    };
    
    // 구독 등록
    store.subscribersMap.set(listener, wrappedListener);
    store.listeners.add(wrappedListener);
    
    // 구독 해제 함수 반환
    return () => {
      if (store.subscribersMap.has(listener)) {
        const wrappedListener = store.subscribersMap.get(listener);
        store.listeners.delete(wrappedListener);
        store.subscribersMap.delete(listener);
      }
    };
  };
  
  /**
   * 선택자를 등록하고 결과를 얻습니다.
   * @param {string} selectorName - 선택자 이름
   * @param {Function} selectorFn - 선택자 함수
   * @returns {Function} 등록된 선택자 함수
   */
  const registerSelector = (selectorName, selectorFn) => {
    if (typeof selectorFn !== 'function') {
      throw new Error('선택자는 함수여야 합니다.');
    }
    
    // 선택자 캐싱을 위한 래퍼 함수
    const memoizedSelector = (...args) => {
      const state = getState();
      
      // 캐시 키 생성
      const cacheKey = JSON.stringify({
        name: selectorName,
        args: args,
        stateVersion: state.__version || 0
      });
      
      // 캐시된 결과가 있으면 반환
      if (store.selectorCache && store.selectorCache.has(cacheKey)) {
        return store.selectorCache.get(cacheKey);
      }
      
      // 선택자 실행
      const result = selectorFn(state, ...args);
      
      // 결과 캐싱
      if (!store.selectorCache) {
        store.selectorCache = new Map();
      }
      
      store.selectorCache.set(cacheKey, result);
      
      // 캐시 크기 제한
      if (store.selectorCache.size > 100) {
        const oldestKey = store.selectorCache.keys().next().value;
        store.selectorCache.delete(oldestKey);
      }
      
      return result;
    };
    
    // 선택자 등록
    store.selectors.set(selectorName, memoizedSelector);
    
    return memoizedSelector;
  };
  
  /**
   * 등록된 선택자를 사용하여 상태의 일부를 선택합니다.
   * @param {string|Function} selectorNameOrFn - 선택자 이름 또는 선택자 함수
   * @param {...any} args - 선택자에 전달할 인수
   * @returns {any} 선택된 상태
   */
  const select = (selectorNameOrFn, ...args) => {
    if (typeof selectorNameOrFn === 'string') {
      // 이름으로 등록된 선택자 사용
      if (store.selectors.has(selectorNameOrFn)) {
        return store.selectors.get(selectorNameOrFn)(...args);
      } else {
        console.error(`등록되지 않은 선택자: ${selectorNameOrFn}`);
        return undefined;
      }
    } else if (typeof selectorNameOrFn === 'function') {
      // 인라인 선택자 함수 사용
      return selectorNameOrFn(getState(), ...args);
    } else {
      console.error('선택자는 문자열 또는 함수여야 합니다.');
      return undefined;
    }
  };

  /**
   * @function notify
   * @description 모든 구독자에게 상태 변경을 알립니다.
   * @param {Object} prevState - 변경 전 상태
   */
  const notify = (prevState) => {
    const currentState = getState();
    // 버전 카운터 증가 (선택자 캐싱용)
    currentState.__version = (prevState.__version || 0) + 1;
    
    store.listeners.forEach((listener) => {
      try {
        listener(currentState, prevState);
      } catch (error) {
        console.error('리스너 호출 중 오류 발생:', error);
      }
    });
    
    // 상태 변경 후 선택자 캐시 초기화
    if (store.selectorCache) {
      store.selectorCache.clear();
    }
  };
  
  // 스토어 API 객체 생성
  const storeApi = {
    getState,
    setState,
    notify,
    reducer,
    state: store.state
  };
  
  // 기본 동작 dispatch 함수 (미들웨어가 없을 때)
  let dispatch = (action) => {
    const prevState = {...store.state};
    store.state = reducer(store.state, action);
    notify(prevState);
    return action;
  };
  
  // 미들웨어 적용
  if (middlewares.length > 0) {
    dispatch = applyMiddleware(storeApi, middlewares)(dispatch);
  }
  
  // dispatch 메서드 추가
  storeApi.dispatch = dispatch;
  
  // timeTravel 기능 추가 (historyMiddleware가 있을 때만 유효)
  const timeTravelAction = timeTravel;

  return { 
    getState, 
    dispatch, 
    setState, 
    subscribe,
    select,
    registerSelector,
    timeTravel: timeTravelAction
  };
};

// 기본 비교 함수
const defaultEqualityFn = (a, b) => {
  if (a === b) return true;
  
  // 깊은 비교가 필요한 경우 JSON 문자열 비교 (성능 주의)
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (e) {
    return false;
  }
};

// 개발 모드 감지 (process.env.NODE_ENV를 사용하지 않음)
const isDevelopment = () => {
  // 개발 환경 감지 방법
  // 1. 브라우저 URL이 localhost를 포함하는지 확인
  // 2. 디버깅 도구가 열려 있는지 확인 (과도한 로깅 방지를 위한 추가 검사)
  return (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );
};

// 기본 미들웨어 구성
const defaultMiddlewares = [
  errorMiddleware,
  isDevelopment() ? loggerMiddleware : null,
  historyMiddleware(50),
  validationMiddleware,
  memoMiddleware()
].filter(Boolean); // null 항목 제거

// 스토어 인스턴스 생성
const store = createStore(rootReducer, initialState, defaultMiddlewares);

// 자주 사용되는 상태 선택자 등록
store.registerSelector('getMemberCount', state => state.members.length);
store.registerSelector('getMembers', state => state.members);
store.registerSelector('getTeamCount', state => state.teamCount);
store.registerSelector('getTotalMembers', state => state.totalMembers);
store.registerSelector('isTotalConfirmed', state => state.isTotalConfirmed);
store.registerSelector('isTeamCountConfirmed', state => state.isTeamCountConfirmed);

// 액션 크리에이터 익스포트
export const actionCreators = actions;

// 시간 여행 함수 익스포트
export const historyTimeTravel = store.timeTravel;

// 스토어 익스포트
export default store; 