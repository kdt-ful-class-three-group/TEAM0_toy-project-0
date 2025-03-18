/**
 * @file connect.js
 * @description 웹 컴포넌트와 스토어를 연결하는 유틸리티
 */

import store from './index.js';

/**
 * 컴포넌트와 스토어를 연결하는 고차 함수
 * @param {Object} options - 연결 옵션
 * @param {Function|Object} options.mapStateToProps - 상태를 컴포넌트 속성에 매핑하는 함수 또는 매핑 객체
 * @param {Function|Object} [options.mapDispatchToProps] - 액션 디스패치 함수를 컴포넌트 메서드에 매핑하는 함수 또는 매핑 객체
 * @param {Function} [options.mergeProps] - 상태 props와 디스패치 props를 병합하는 함수
 * @returns {Function} 웹 컴포넌트를 확장하는 함수
 */
export const connect = (options = {}) => {
  const { 
    mapStateToProps, 
    mapDispatchToProps = null, 
    mergeProps = defaultMergeProps 
  } = options;
  
  // 웹 컴포넌트 클래스를 받아 확장하는 함수
  return function connectComponent(ComponentClass) {
    const originalInitialize = ComponentClass.prototype.initialize;
    const originalDisconnectedCallback = ComponentClass.prototype.disconnectedCallback;
    const originalRender = ComponentClass.prototype.render;
    
    // initialize 메서드 오버라이드
    ComponentClass.prototype.initialize = function() {
      // 원본 메서드 호출
      if (originalInitialize) {
        originalInitialize.call(this);
      }
      
      // stateToProps 매핑 함수 설정
      this._mapStateToProps = typeof mapStateToProps === 'function'
        ? mapStateToProps
        : createMapFromObject(mapStateToProps || {});
      
      // dispatchToProps 매핑 함수 설정
      this._mapDispatchToProps = typeof mapDispatchToProps === 'function'
        ? mapDispatchToProps
        : createDispatchMapFromObject(mapDispatchToProps || {});
      
      // 최근 상태와 props 저장
      this._storeState = {};
      this._storeProps = {};
      
      // 초기 상태 설정
      this._updateStateProps();
      
      // 스토어 구독
      this._unsubscribeStore = store.subscribe(
        this._handleStateChange.bind(this),
        this._createSelector()
      );
    };
    
    // disconnectedCallback 메서드 오버라이드
    ComponentClass.prototype.disconnectedCallback = function() {
      // 스토어 구독 해제
      if (this._unsubscribeStore) {
        this._unsubscribeStore();
        this._unsubscribeStore = null;
      }
      
      // 원본 메서드 호출
      if (originalDisconnectedCallback) {
        originalDisconnectedCallback.call(this);
      }
    };
    
    // 스토어 상태 변경 핸들러
    ComponentClass.prototype._handleStateChange = function(newState) {
      // 새 상태 속성 계산
      const nextStateProps = this._mapStateToProps(newState, this.props || {});
      
      // 새 디스패치 속성 계산
      const nextDispatchProps = this._mapDispatchToProps(store.dispatch, this.props || {});
      
      // 속성 병합
      const nextProps = mergeProps(
        nextStateProps, 
        nextDispatchProps, 
        this.props || {}
      );
      
      // 속성이 변경된 경우에만 리렌더링
      if (!shallowEqual(this._storeProps, nextProps)) {
        this._storeState = newState;
        this._storeProps = nextProps;
        
        // 속성 업데이트
        this._updateProps(nextProps);
        
        // 컴포넌트가 이미 초기화된 경우에만 리렌더링
        if (this._initialized) {
          this.render();
        }
      }
    };
    
    // 상태 속성 업데이트
    ComponentClass.prototype._updateStateProps = function() {
      const state = store.getState();
      const stateProps = this._mapStateToProps(state, this.props || {});
      const dispatchProps = this._mapDispatchToProps(store.dispatch, this.props || {});
      
      this._storeState = state;
      this._storeProps = mergeProps(stateProps, dispatchProps, this.props || {});
      
      this._updateProps(this._storeProps);
    };
    
    // 컴포넌트 속성 업데이트
    ComponentClass.prototype._updateProps = function(props) {
      // props 객체가 없는 경우 생성
      if (!this.props) {
        this.props = {};
      }
      
      // 새 props로 업데이트
      Object.keys(props).forEach(key => {
        this.props[key] = props[key];
      });
    };
    
    // 선택자 생성
    ComponentClass.prototype._createSelector = function() {
      return state => {
        // 상태의 일부만 선택하여 불필요한 리렌더링 방지
        const mappedProps = this._mapStateToProps(state, this.props || {});
        return mappedProps;
      };
    };
    
    // render 메서드 오버라이드
    ComponentClass.prototype.render = function() {
      // 렌더링 전에 상태 속성 다시 계산 (필요한 경우)
      if (Object.keys(this._storeProps).length === 0) {
        this._updateStateProps();
      }
      
      // 원본 render 메서드 호출
      if (originalRender) {
        originalRender.call(this);
      }
    };
    
    // 수정된 클래스 반환
    return ComponentClass;
  };
};

/**
 * 객체 매핑에서 mapStateToProps 함수 생성
 * @private
 */
function createMapFromObject(mapping) {
  return function mapStateToProps(state) {
    const result = {};
    
    Object.keys(mapping).forEach(key => {
      const selector = mapping[key];
      if (typeof selector === 'function') {
        result[key] = selector(state);
      } else if (typeof selector === 'string') {
        // 문자열인 경우 상태에서 해당 경로의 값 추출
        result[key] = getByPath(state, selector);
      } else {
        result[key] = selector;
      }
    });
    
    return result;
  };
}

/**
 * 객체 매핑에서 mapDispatchToProps 함수 생성
 * @private
 */
function createDispatchMapFromObject(actionCreators) {
  return function mapDispatchToProps(dispatch) {
    const result = {};
    
    Object.keys(actionCreators).forEach(key => {
      const actionCreator = actionCreators[key];
      
      if (typeof actionCreator === 'function') {
        // 액션 생성자를 디스패치와 바인딩
        result[key] = (...args) => dispatch(actionCreator(...args));
      }
    });
    
    return result;
  };
}

/**
 * 기본 속성 병합 함수
 * @private
 */
function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps
  };
}

/**
 * 얕은 비교 함수
 * @private
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    
    if (!objB.hasOwnProperty(key) || objA[key] !== objB[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * 경로로 객체의 중첩된 값 가져오기
 * @private
 */
function getByPath(obj, path) {
  if (!path) return obj;
  
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}

/**
 * 컴포넌트에서 선택적으로 상태를 사용하기 위한 유틸리티
 * @param {Function|string} selector - 상태 선택자 함수 또는 이름
 * @param {...any} args - 선택자에 전달할 인수
 * @returns {any} 선택된 상태
 */
export const useSelector = (selector, ...args) => {
  return store.select(selector, ...args);
};

/**
 * 컴포넌트에서 액션을 디스패치하기 위한 유틸리티
 * @returns {Function} 디스패치 함수
 */
export const useDispatch = () => {
  return store.dispatch;
};

/**
 * 현재 전체 상태를 가져오는 유틸리티
 * @returns {Object} 스토어의 현재 상태
 */
export const useStore = () => {
  return {
    getState: store.getState,
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    select: store.select
  };
}; 