# 프로젝트 아키텍처 정보

## 프로젝트 개요
이 프로젝트는 정적 파일 서버와 팀 분배 시스템을 구현한 웹 애플리케이션입니다. 서버는 정적 파일을 효율적으로 제공하고, 클라이언트는 모던한 UI/UX를 제공합니다.

## 문서 인덱스
- [1. Server 영역](#1-server-영역-src)
- [2. Front-end 영역](#2-front-end-영역-public)
- [3. 데이터 영역](#3-데이터-영역-data)
- [4. 컴포넌트 영역](#4-컴포넌트-영역-components)
- [5. 스타일 영역](#5-스타일-영역-styles)
- [6. 프로젝트 관리](#6-프로젝트-관리-project-management)

## 관련 문서
- [ARCHITECTURE.md](ARCHITECTURE.md): 상세 아키텍처 설계
- [MODULARIZATION.md](MODULARIZATION.md): 모듈화 가이드라인
- [Optimization.md](Optimization.md): 성능 최적화 전략

## 디렉토리 구조

### 1. Server 영역 (`/src`)
서버 측 로직을 담당하는 디렉토리입니다.

#### 1.1 설정 (`/src/config`)
- `server.js` [ID: `config/server`]
  - `SERVER_CONFIG` [ID: `config/server/SERVER_CONFIG`]
    - `PORT`: 서버 포트 번호 (3030)
    - `PUBLIC_DIR`: 정적 파일 디렉토리 경로
    - `CACHE_DURATION`: 캐시 유효 기간 (86400초)
    - `DEFAULT_CHARSET`: 기본 문자 인코딩 ('utf-8')
    - `CORS`: CORS 설정 정보
      - `ALLOW_ORIGIN`: 허용된 출처 ('*')
      - `ALLOW_HEADERS`: 허용된 헤더
      - `ALLOW_METHODS`: 허용된 HTTP 메서드

- `mime.js` [ID: `config/mime`]
  - `MIME_CONFIG` [ID: `config/mime/MIME_CONFIG`]
    - `TYPES`: 파일 확장자별 MIME 타입 매핑
    - `CACHEABLE_EXTENSIONS`: 캐시 가능한 파일 확장자 목록
    - `DEFAULT_INDEX`: 기본 인덱스 파일명

#### 1.2 컨트롤러 (`/src/controllers`)
- `StaticFileController.js` [ID: `controllers/StaticFileController`]
  - `StaticFileController` 클래스 [ID: `controllers/StaticFileController/class`]
    - 생성자: `constructor(publicDir)` [ID: `controllers/StaticFileController/constructor`]
    - `handleRequest(req, res)` [ID: `controllers/StaticFileController/handleRequest`]

#### 1.3 서비스 (`/src/services`)
- `StaticFileService.js` [ID: `services/StaticFileService`]
  - `StaticFileService` 클래스 [ID: `services/StaticFileService/class`]
    - 생성자: `constructor(publicDir)` [ID: `services/StaticFileService/constructor`]
    - `serveFile(url, res)` [ID: `services/StaticFileService/serveFile`]

#### 1.4 모델 (`/src/models`)
- `StaticFileModel.js` [ID: `models/StaticFileModel`]
  - `StaticFileModel` 클래스 [ID: `models/StaticFileModel/class`]
    - 생성자: `constructor(publicDir)` [ID: `models/StaticFileModel/constructor`]
    - `getFile(filePath)` [ID: `models/StaticFileModel/getFile`]
    - `fileExists(filePath)` [ID: `models/StaticFileModel/fileExists`]
    - `getFilePath(url)` [ID: `models/StaticFileModel/getFilePath`]

#### 1.5 유틸리티 (`/src/utils`)
- `mimeTypes.js` [ID: `utils/mimeTypes`]
  - `getContentType(filePath)` [ID: `utils/mimeTypes/getContentType`]

### 2. Front-end 영역 (`/public`)
클라이언트 측 리소스를 담당하는 디렉토리입니다.

#### 2.1 정적 리소스
- `/public/js` [ID: `public/js`]
  - `main.js` [ID: `public/js/main`]
  - `api.js` [ID: `public/js/api`]
  - `utils.js` [ID: `public/js/utils`]
  - `components/` [ID: `public/js/components`]
    - `Header.js` [ID: `public/js/components/Header`]
    - `Footer.js` [ID: `public/js/components/Footer`]
    - `TeamList.js` [ID: `public/js/components/TeamList`]
    - `TeamCard.js` [ID: `public/js/components/TeamCard`]
  - `styles/` [ID: `public/js/styles`]
    - `theme.js` [ID: `public/js/styles/theme`]
    - `animations.js` [ID: `public/js/styles/animations`]
    - `componentStyles.js` [ID: `public/js/styles/componentStyles`]
      - `memberListStyles` [ID: `public/js/styles/componentStyles/memberListStyles`]
      - `teamResultStyles` [ID: `public/js/styles/componentStyles/teamResultStyles`]
      - `formPanelStyles` [ID: `public/js/styles/componentStyles/formPanelStyles`]
      - `teamDistributorStyles` [ID: `public/js/styles/componentStyles/teamDistributorStyles`]
      - `mainPanelStyles` [ID: `public/js/styles/componentStyles/mainPanelStyles`]

### 3. 데이터 영역 (`/data`)
데이터 저장소를 담당하는 디렉토리입니다.

#### 3.1 데이터 파일
- `/data/teams` [ID: `data/teams`]
  - `teamStructure.js` [ID: `data/teams/teamStructure`]
  - `teamMembers.js` [ID: `data/teams/teamMembers`]
  - `teamProjects.js` [ID: `data/teams/teamProjects`]
  - `teamSettings.js` [ID: `data/teams/teamSettings`]
  - `teamAnalytics.js` [ID: `data/teams/teamAnalytics`]

### 4. 컴포넌트 영역 (`/components`)
웹 컴포넌트 기반의 UI 요소들을 담당하는 디렉토리입니다.

#### 4.1 기본 컴포넌트
- `BaseComponent.js`: 모든 컴포넌트의 기본 클래스
- `TeamDistributor.js`: 메인 컴포넌트
- `MemberList.js`: 멤버 관리 컴포넌트

#### 4.2 폼 컴포넌트
- `form/`
  - `FormPanel.js`: 폼 패널 컴포넌트
  - `MainPanel.js`: 메인 패널 컴포넌트
  - `MemberInput.js`: 멤버 입력 컴포넌트
  - `TeamConfig.js`: 팀 설정 컴포넌트
  - `TeamInput.js`: 팀 입력 컴포넌트
  - `TeamResult.js`: 팀 결과 컴포넌트
  - `TotalMembersConfig.js`: 총 멤버 수 설정 컴포넌트

### 5. 스타일 영역 (`/styles`)
애플리케이션의 스타일 관련 파일을 담당하는 디렉토리입니다.

#### 5.1 스타일 컴포넌트
- `theme.js`: 전역 테마 설정
- `animations.js`: 애니메이션 정의
- `componentStyles.js`: 컴포넌트별 스타일

### 6. 프로젝트 관리 (`/project-management`)
프로젝트 관리 및 문서화 관련 파일을 담당하는 디렉토리입니다.

## 주요 기능 흐름

1. 클라이언트 요청 처리 [ID: `flow/clientRequest`]
   - `StaticFileController.handleRequest()` [ID: `flow/clientRequest/handleRequest`]
   - `StaticFileService.serveFile()` [ID: `flow/clientRequest/serveFile`]
   - `StaticFileModel.getFile()` [ID: `flow/clientRequest/getFile`]

2. 정적 파일 제공 [ID: `flow/staticFile`]
   - 파일 경로 결정 [ID: `flow/staticFile/pathResolution`]
   - MIME 타입 확인 [ID: `flow/staticFile/mimeType`]
   - 캐시 설정 적용 [ID: `flow/staticFile/cache`]
   - 파일 전송 [ID: `flow/staticFile/transfer`]

3. 에러 처리 [ID: `flow/error`]
   - 404: 파일 없음 [ID: `flow/error/404`]
   - 500: 서버 에러 [ID: `flow/error/500`]
   - 기본 페이지 제공 [ID: `flow/error/fallback`]

## 설정 관리 [ID: `config`]
- 서버 설정 (`server.js`) [ID: `config/server`]
- MIME 타입 (`mime.js`) [ID: `config/mime`]
- 환경별 설정 분리 [ID: `config/environment`]

## 보안 고려사항 [ID: `security`]
- CORS 정책 [ID: `security/cors`]
- 파일 접근 제한 [ID: `security/access`]
- 캐시 보안 [ID: `security/cache`]
- 에러 메시지 노출 제한 [ID: `security/error`]

## 성능 최적화 [ID: `performance`]
자세한 내용은 [Optimization.md](Optimization.md) 문서를 참조하세요.

## 개발 가이드라인 [ID: `guidelines`]
1. 코드 스타일 [ID: `guidelines/style`]
2. 컴포넌트 개발 [ID: `guidelines/component`]
3. 성능 최적화 [ID: `guidelines/performance`]
4. 테스트 [ID: `guidelines/test`]

## 배포 프로세스 [ID: `deploy`]
1. 빌드 [ID: `deploy/build`]
2. 테스트 [ID: `deploy/test`]
3. 배포 [ID: `deploy/release`]

## 유지보수 [ID: `maintenance`]
1. 로깅 [ID: `maintenance/logging`]
2. 백업 [ID: `maintenance/backup`]
3. 업데이트 [ID: `maintenance/update`]

## 문제 해결 가이드 [ID: `troubleshooting`]
1. 일반적인 문제 [ID: `troubleshooting/common`]
2. 성능 문제 [ID: `troubleshooting/performance`]
3. 보안 문제 [ID: `troubleshooting/security`]

## 참고 자료 [ID: `references`]
- Node.js 문서 [ID: `references/nodejs`]
- Express.js 가이드 [ID: `references/express`]
- 웹 보안 가이드 [ID: `references/security`]
- 성능 최적화 가이드 [ID: `references/performance`]
