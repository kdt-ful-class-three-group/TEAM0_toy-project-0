# 유틸리티 라이브러리

팀 분배기 애플리케이션에서 사용하는 유틸리티 함수 모음입니다. 각 기능별로 모듈화하여 관리합니다.

## 구조

유틸리티 라이브러리는 다음과 같은 모듈로 구성되어 있습니다:

```
utils/
├── index.js        # 모든 유틸리티 함수를 통합 내보내는 진입점
├── validation.js   # 입력값 유효성 검사 함수
├── memberUtils.js  # 멤버 관리 관련 함수
├── teamUtils.js    # 팀 배분 관련 함수
├── stringUtils.js  # 문자열 처리 관련 함수
├── errorHandler.js # 에러 처리 관련 함수
└── README.md       # 문서
```

## 사용 방법

### 1. 전체 유틸리티 가져오기 (기존 코드 호환성)

```javascript
import utils from '../utils/index.js';

// 사용 예시
if (utils.validateNumber(inputValue)) {
  // ...
}
```

### 2. 특정 모듈만 가져오기 (권장)

```javascript
import * as validation from '../utils/validation.js';

// 사용 예시
if (validation.validateNumber(inputValue)) {
  // ...
}
```

### 3. 특정 함수만 가져오기 (가장 권장)

```javascript
import { validateNumber, validateTotalMembers } from '../utils/validation.js';

// 사용 예시
if (validateNumber(inputValue)) {
  // ...
}
```

## 모듈별 기능

### 1. validation.js

입력값 유효성 검사 기능을 제공합니다.

- `validateNumber(value)`: 숫자 입력값 검증
- `validateTeamCount(teamCount)`: 팀 수 유효성 검증
- `validateTotalMembers(totalMembers)`: 총원 수 유효성 검증
- `validateTeamRatio(teamCount, totalMembers)`: 팀 수와 총원 비율 검증
- `validateMemberName(name)`: 멤버 이름 유효성 검증

### 2. memberUtils.js

멤버 관리 관련 유틸리티 함수를 제공합니다.

- `canAddMore(state)`: 추가 멤버 입력 가능 여부 확인
- `generateMemberName(name, existingNames)`: 중복되지 않는 멤버 이름 생성
- `getRemainingMembersCount(state)`: 필요한 추가 멤버 수 계산
- `getMembersExcept(members, excludeIndex)`: 특정 멤버를 제외한 목록 반환
- `sortMembersByName(members, ascending)`: 멤버 이름 기준 정렬

### 3. teamUtils.js

팀 배분 관련 유틸리티 함수를 제공합니다.

- `distributeTeams(members, teamCount)`: 랜덤 팀 배분
- `distributeTeamsWithStrategy(members, teamCount, strategy)`: 전략별 팀 배분
- `distributeTeamsSequential(members, teamCount)`: 순차적 팀 배분
- `distributeTeamsBalanced(members, teamCount)`: 균형 잡힌 팀 배분
- `findOptimalTeamDistribution(members, teamCount)`: 최적의 팀 배분 탐색

### 4. stringUtils.js

문자열 처리 관련 유틸리티 함수를 제공합니다.

- `matchesNamePattern(name, baseName)`: 이름 패턴 일치 여부 확인
- `escapeRegExp(string)`: 정규식 특수문자 이스케이프
- `extractSuffixNumber(name, baseName)`: 이름에서 접미사 번호 추출
- `generateUniqueNameWithSuffix(baseName, existingNames)`: 접미사를 이용한 고유 이름 생성
- `truncateWithEllipsis(text, maxLength)`: 문자열 자르기와 말줄임표 추가
- `generateTeamName(index, prefix)`: 팀 이름 생성

### 5. errorHandler.js

오류 처리 관련 유틸리티 함수를 제공합니다.

- `ErrorType`: 오류 타입 상수 정의
- `Severity`: 오류 심각도 상수 정의
- `AppError`: 기본 애플리케이션 오류 클래스
- `ValidationError`: 유효성 검사 오류 클래스
- `DataError`: 데이터 처리 오류 클래스
- `UIError`: UI 관련 오류 클래스
- `handleError(error, uiCallback)`: 통합 오류 처리 함수
- `showUIError(element, message, className)`: UI 요소에 오류 표시
- `createErrorLogger(moduleName)`: 모듈별 로거 생성

## 에러 처리 가이드

### 1. 유효성 검사 오류

```javascript
import { ValidationError, handleError } from '../utils/errorHandler.js';
import { validateNumber } from '../utils/validation.js';

function processInput(input) {
  if (!validateNumber(input)) {
    const error = new ValidationError('유효한 숫자를 입력하세요.', { input });
    return handleError(error, (err) => {
      // UI에 오류 표시 로직
      showUIError(inputElement, err.message);
    });
  }
  
  // 정상 처리 로직
}
```

### 2. 모듈별 로거 사용

```javascript
import { createErrorLogger } from '../utils/errorHandler.js';

const logger = createErrorLogger('MyComponent');

function someFunction() {
  try {
    // 어떤 작업
  } catch (error) {
    logger.error('작업 실패', { error });
  }
}
``` 