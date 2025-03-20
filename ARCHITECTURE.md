# 팀 분배 애플리케이션 아키텍처 문서

## 개요

이 문서는 팀 분배 애플리케이션의 아키텍처와 코드 구조를 설명합니다. 주요 개념, 패턴 및 구성 요소 간의 관계를 이해하기 위한 가이드입니다.

## 기술 스택

- **프론트엔드**: Vanilla JavaScript, Web Components
- **백엔드**: Node.js (프레임워크 없이 순수 Node.js 사용)
- **데이터 저장**: 파일 시스템 (JSON)
- **통신**: RESTful API

## 아키텍처 개요

애플리케이션은 다음과 같은 주요 부분으로 구성됩니다:

1. **프론트엔드**
   - 웹 컴포넌트 기반 UI
   - 이벤트 기반 통신 (EventBus)
   - 중앙 집중식 상태 관리 (Store)

2. **백엔드**
   - HTTP 서버
   - 라우터 및 컨트롤러
   - 파일 시스템 기반 데이터 저장

## 프론트엔드 아키텍처

### 핵심 모듈

1. **BaseComponent**: 모든 컴포넌트의 기본 클래스
2. **EventBus**: 컴포넌트 간 통신을 위한 이벤트 시스템
3. **Store**: 애플리케이션 상태 관리
4. **Utils**: 유틸리티 함수 모음

### 컴포넌트 구조

```
components/
├── BaseComponent.js          # 모든 컴포넌트의 기본 클래스
├── TeamDistributor.js        # 메인 컴포넌트
├── MemberList.js             # 멤버 목록 컴포넌트
├── NavComponent.js           # 네비게이션 컴포넌트
├── form/                     # 폼 관련 컴포넌트
│   ├── FormPanel.js          # 폼 패널 컴포넌트
│   ├── MainPanel.js          # 메인 패널 컴포넌트
│   ├── MemberInput.js        # 멤버 입력 컴포넌트
│   ├── TeamConfig.js         # 팀 설정 컴포넌트
│   ├── TeamInput.js          # 팀 입력 컴포넌트
│   ├── TeamResult.js         # 팀 결과 컴포넌트
│   └── TotalMembersConfig.js # 총 멤버 수 설정 컴포넌트
└── index.js                  # 컴포넌트 등록 모듈
```

### 상태 관리

상태 관리는 `store/index.js`에서 구현된 Redux와 유사한 패턴을 사용합니다:

- **Actions**: 상태 변경을 위한 액션 정의
- **Reducers**: 액션에 따른 상태 업데이트 로직
- **Store**: 중앙 저장소 및 구독 메커니즘

### 이벤트 시스템

`EventBus`는 컴포넌트 간 통신을 위한 중앙 집중식 이벤트 시스템을 제공합니다:

- **이벤트 발행/구독**: 컴포넌트 간 느슨한 결합을 위한 패턴
- **라이프사이클 이벤트**: 컴포넌트 라이프사이클 추적
- **디버깅 지원**: 이벤트 로깅 및 기록

## 백엔드 아키텍처

### 핵심 모듈

1. **Server**: HTTP 서버 구현
2. **Router**: 요청 라우팅
3. **Controllers**: 비즈니스 로직 처리
4. **Services**: 데이터 액세스 및 외부 서비스 통합

### 폴더 구조

```
src/
├── app.js                           # 애플리케이션 진입점
├── server.js                        # HTTP 서버 구현
├── routes.js                        # 라우터 구현
├── middlewares.js                   # 미들웨어 구현
├── config/                          # 설정 파일
│   ├── mime.js                      # MIME 타입 설정
│   └── server.js                    # 서버 설정
├── controllers/                     # 컨트롤러
│   ├── StaticFileController.js      # 정적 파일 제공 컨트롤러
│   └── TeamDataController.js        # 팀 데이터 처리 컨트롤러
├── core/                            # 핵심 비즈니스 로직
│   └── team-distributor.js          # 팀 분배 알고리즘
├── models/                          # 데이터 모델
│   ├── StaticFileModel.js           # 정적 파일 모델
│   └── TeamMember.js                # 팀 멤버 모델
├── services/                        # 서비스
│   ├── StaticFileService.js         # 정적 파일 서비스
│   └── save-team-decision-json.js   # 팀 결정 저장 서비스
└── utils/                           # 유틸리티
    ├── mimeTypes.js                 # MIME 타입 유틸리티
    ├── odd-or-even-decision.js      # 홀수/짝수 결정 유틸리티
    ├── shuffleArray.js              # 배열 섞기 유틸리티
    └── validators.js                # 데이터 유효성 검사 유틸리티
```

## 데이터 흐름

1. **UI 이벤트**: 사용자가 UI와 상호작용
2. **상태 업데이트**: 스토어 액션 디스패치 및 상태 업데이트
3. **UI 렌더링**: 컴포넌트가 새 상태에 따라 리렌더링
4. **API 요청**: 필요한 경우 서버에 데이터 저장/로드
5. **서버 처리**: 요청 처리 및 응답 반환

## 컴포넌트 라이프사이클

Web Components의 기본 라이프사이클을 확장하여 다음과 같은 단계를 제공합니다:

1. **beforeMount**: DOM에 연결되기 전
2. **mounted**: DOM에 연결된 후
3. **beforeUpdate**: 상태 업데이트 전
4. **updated**: 상태 업데이트 후
5. **beforeDestroy**: DOM에서 제거되기 전
6. **destroyed**: DOM에서 제거된 후

## 성능 최적화

애플리케이션은 다음과 같은 성능 최적화 기법을 사용합니다:

1. **렌더링 최적화**: 필요한 경우에만 리렌더링
2. **지연 로딩**: 필요할 때만 컴포넌트 생성
3. **DOM 조작 일괄 처리**: 여러 DOM 변경 사항을 일괄 처리
4. **이벤트 위임**: 이벤트 핸들러 수 최소화
5. **디바운스/스로틀링**: 빈번한 이벤트 처리 최적화