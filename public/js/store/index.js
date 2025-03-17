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
 * @description 전역 상태를 관리하는 Store를 생성합니다.
 * @returns {{ getState: Function, setState: Function, subscribe: Function }}
 */
const createStore = (initialState) => {
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
   * @function setState
   * @param {Partial<State>} newState
   * @returns {void}
   */
  const setState = (newState) => {
    state = { ...state, ...newState };
    console.table(state);
    notify();
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

  return { getState, setState, subscribe };
};

// 스토어 인스턴스 생성
const store = createStore({
  members: [],
  totalMembers: 0,
  isTotalConfirmed: false,
  teamCount: 0,
  isTeamCountConfirmed: false
});

export default store; 