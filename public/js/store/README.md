# 상태 관리 개선 문서

## 기존 구조의 문제점

기존 상태 관리는 다음과 같은 문제점이 있었습니다:

1. 상태 변경 로직이 컴포넌트와 핸들러 함수에 직접 구현되어 있음
2. 상태 변경 패턴이 일관적이지 않고 여러 곳에 분산됨
3. 디버깅 및 추적이 어려움
4. 코드 중복이 발생하고 있음

## 개선된 구조: Action/Reducer 패턴

이번 리팩토링을 통해 다음과 같은 구조로 상태 관리를 개선했습니다:

### 주요 컴포넌트

- **actions.js**: 액션 타입 상수와 액션 생성자 함수를 정의
- **reducers.js**: 각 액션 타입에 따른 상태 변경 로직을 구현
- **index.js**: 스토어를 생성하고 상태 관리의 중앙 역할을 담당

### 작동 방식

1. **액션 생성**: 상태 변경이 필요한 경우 액션 생성자를 통해 액션 객체를 생성
2. **액션 디스패치**: `store.dispatch(action)` 메서드를 통해 액션을 디스패치
3. **상태 변경**: 리듀서 함수가 현재 상태와 액션을 받아 새로운 상태를 계산
4. **상태 구독**: 컴포넌트는 `store.subscribe(listener)` 메서드를 통해 상태 변경을 감지하고 UI를 업데이트

### 장점

1. **단방향 데이터 흐름**: 상태 변경이 예측 가능하고 추적이 용이함
2. **로직 분리**: 상태 변경 로직이 리듀서에 집중되어 있어 유지보수가 쉬움
3. **테스트 용이성**: 순수 함수 형태의 리듀서는 테스트가 쉬움
4. **개발자 도구 지원**: 액션 로그를 통해 디버깅이 용이함

## 사용 예시

```javascript
// 액션 디스패치 예시
import store, { actionCreators } from '../store/index.js';

// 멤버 추가
store.dispatch(actionCreators.addMember('홍길동'));

// 총원 설정
store.dispatch(actionCreators.setTotalMembers(10));
store.dispatch(actionCreators.confirmTotalMembers());

// 상태 구독
const unsubscribe = store.subscribe((state) => {
  console.log('상태가 변경되었습니다:', state);
  // UI 업데이트 로직
});
```

## 향후 개선 방향

1. 미들웨어 도입을 통한 비동기 액션 처리
2. 불변성 라이브러리 도입 (Immer 등)
3. 개발자 도구와의 통합 (Redux DevTools 등)
4. TypeScript 도입을 통한 타입 안정성 강화 