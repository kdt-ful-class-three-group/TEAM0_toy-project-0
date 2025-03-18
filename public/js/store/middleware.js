/**
 * @file middleware.js
 * @description 스토어 미들웨어 시스템 및 기본 미들웨어 구현
 */

/**
 * 로깅 미들웨어
 * 모든 액션과 상태 변경을 콘솔에 출력합니다.
 */
export const loggerMiddleware = store => next => action => {
  console.group(`액션: ${action.type}`);
  console.log('이전 상태:', store.getState());
  console.log('액션:', action);
  
  const result = next(action);
  
  console.log('다음 상태:', store.getState());
  console.groupEnd();
  
  return result;
};

/**
 * 이력 추적 미들웨어
 * 상태 변경 이력을 저장하고 시간 여행 디버깅을 지원합니다.
 */
export const historyMiddleware = (maxHistoryLength = 50) => {
  let history = [];
  let currentIndex = -1;
  
  return store => next => action => {
    // 시간 여행 액션인 경우 별도로 처리
    if (action.type === '@@HISTORY/TIME_TRAVEL') {
      const { index } = action.payload;
      
      if (index >= 0 && index < history.length) {
        currentIndex = index;
        return store.setState(history[index].state);
      }
      
      return;
    }
    
    // 일반 액션 처리
    const prevState = store.getState();
    const result = next(action);
    const newState = store.getState();
    
    // 실제 상태 변경이 있는 경우에만 이력 추가
    if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
      // 시간 여행 중인 경우 현재 지점 이후의 이력은 삭제
      if (currentIndex !== history.length - 1) {
        history = history.slice(0, currentIndex + 1);
      }
      
      // 새 이력 항목 생성
      history.push({
        action,
        state: { ...newState },
        timestamp: Date.now()
      });
      
      // 최대 이력 길이 유지
      if (history.length > maxHistoryLength) {
        history = history.slice(history.length - maxHistoryLength);
      }
      
      currentIndex = history.length - 1;
    }
    
    return result;
  };
};

/**
 * 지정된 인덱스로 시간 여행하는 액션 생성자
 * @param {number} index - 이동할 이력 인덱스
 * @returns {Object} 시간 여행 액션
 */
export const timeTravel = (index) => ({
  type: '@@HISTORY/TIME_TRAVEL',
  payload: { index }
});

/**
 * 에러 핸들링 미들웨어
 * 액션 처리 중 발생하는 오류를 잡아서 처리합니다.
 */
export const errorMiddleware = store => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('액션 처리 중 오류 발생:', error);
    console.error('문제가 발생한 액션:', action);
    
    // 오류 보고 액션 디스패치
    store.dispatch({
      type: '@@ERROR',
      payload: { 
        error: error.toString(),
        originalAction: action,
        timestamp: Date.now()
      }
    });
    
    // 중요: 오류가 발생해도 애플리케이션이 계속 작동하도록 함
    return action;
  }
};

/**
 * 상태 유효성 검증 미들웨어
 * 리듀서에서 반환한 상태가 유효한지 검사합니다.
 */
export const validationMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState();
  
  // 기본 상태 형식 검증
  const requiredKeys = ['members', 'totalMembers', 'isTotalConfirmed', 'teamCount', 'isTeamCountConfirmed'];
  const missingKeys = requiredKeys.filter(key => !(key in state));
  
  if (missingKeys.length > 0) {
    console.error('상태에 필수 키가 누락됨:', missingKeys);
  }
  
  // 타입 검증
  if (!Array.isArray(state.members)) {
    console.error('상태 오류: members는 배열이어야 합니다.');
  }
  
  if (typeof state.totalMembers !== 'number') {
    console.error('상태 오류: totalMembers는 숫자여야 합니다.');
  }
  
  if (typeof state.isTotalConfirmed !== 'boolean') {
    console.error('상태 오류: isTotalConfirmed는 불리언이어야 합니다.');
  }
  
  // 값 검증
  if (state.totalMembers < 0) {
    console.error('상태 오류: totalMembers는 음수가 될 수 없습니다.');
  }
  
  return result;
};

/**
 * 메모이제이션 미들웨어
 * 선택자 함수 호출 결과를 캐싱하여 불필요한 재계산을 방지합니다.
 */
export const memoMiddleware = () => {
  const cache = new Map();
  
  return store => next => action => {
    // 기존 선택자 함수를 저장
    const originalGetState = store.getState;
    
    // 메모이제이션된 선택자 함수로 교체
    store.getState = function() {
      return originalGetState();
    };
    
    // 메모이제이션된 select 메서드 추가
    store.select = function(selector, ...args) {
      const state = originalGetState();
      const cacheKey = JSON.stringify({ 
        selector: selector.toString(), 
        args,
        stateChecksum: JSON.stringify(state)
      });
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      
      const result = selector(state, ...args);
      cache.set(cacheKey, result);
      
      // 캐시 크기 제한 (100개 항목으로 제한)
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    };
    
    const result = next(action);
    
    // 액션 처리 후 캐시 초기화
    cache.clear();
    
    return result;
  };
}; 