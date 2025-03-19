/**
 * @file performanceMonitor.js
 * @description 애플리케이션 전체의 성능을 모니터링하는 유틸리티
 */

import { FPSMeter, MemoryMonitor, monitorResourceLoading, LayoutThrashingMonitor } from './performance.js';
// import { layoutMonitor } from './performance.js';

// layoutMonitor 인스턴스 생성
const layoutMonitor = new LayoutThrashingMonitor();

/**
 * 애플리케이션 성능 모니터링 도구
 * @class PerformanceMonitor
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      fpsCheckInterval: 5000, // 5초마다 FPS 체크 (기본값보다 더 긴 간격)
      fpsWarningThreshold: 30, // 30 FPS 이하일 때 경고
      logLevel: 'warn',       // 경고 수준만 로그
      monitorFPS: true,            // FPS 모니터링 여부
      monitorMemory: true,         // 메모리 사용량 모니터링 여부
      monitorResources: true,      // 리소스 로딩 모니터링 여부
      monitorComponents: true,     // 컴포넌트 성능 모니터링 여부
      detectLayoutThrashing: true, // 레이아웃 스래싱 감지 여부
      logToConsole: true,          // 콘솔 출력 여부
      ignoreInactiveTab: true,     // 비활성 탭에서 FPS 경고 무시
      warningThresholds: {
        fps: 30,                   // FPS 경고 임계값
        memoryUsage: 0.8,          // 메모리 사용량 경고 임계값 (80%)
        renderTime: 16.67          // 렌더링 시간 경고 임계값 (16.67ms = 60fps)
      },
      ...options
    };
    
    this.isActive = false;
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fpsCheckTimer = null;
    this.rafId = null;
    this.isTabActive = true; // 탭 활성화 상태 추적
    
    // 비동기 리스너 관련 에러 방지
    this._setupErrorHandling();
    
    // 탭 가시성 변경 감지
    this._setupVisibilityChangeListener();
    
    // 서브 모니터 초기화
    this.fpsMonitor = this.options.monitorFPS ? new FPSMeter({
      logToConsole: false,
      onUpdate: this._handleFPSUpdate.bind(this)
    }) : null;
    
    this.memoryMonitor = this.options.monitorMemory ? new MemoryMonitor({
      logToConsole: false,
      warnThreshold: this.options.warningThresholds.memoryUsage,
      onUpdate: this._handleMemoryUpdate.bind(this)
    }) : null;
    
    // 컴포넌트 성능 데이터
    this.componentStats = new Map();
    this.slowComponents = [];
    
    // 성능 이슈 로그
    this.performanceIssues = [];
    
    // 시작 시간
    this.startTime = null;
    
    // 상태
    this.isMonitoring = false;
    
    // Long Task 감지
    this._setupLongTaskObserver();
  }
  
  _setupErrorHandling() {
    // 비동기 응답 관련 에러 무시 - 브라우저 확장 프로그램 관련 문제 
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message.includes('message channel closed') || 
          message.includes('asynchronous response') ||
          source.includes('injected.js') ||
          source.includes('content.js')) {
        return true; // 이벤트 처리됨으로 표시하여 에러 전파 중단
      }
      
      // 기존 에러 처리기 호출
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    // 처리되지 않은 거부 처리
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && (
          String(event.reason).includes('message channel closed') ||
          String(event.reason).includes('asynchronous response') ||
          String(event.reason).includes('listener'))) {
        event.preventDefault();
      }
    });
    
    // Chrome 확장 프로그램 메시지 처리 - runtime.lastError 에러 억제
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const originalSendMessage = chrome.runtime.sendMessage;
      
      // 메시지 전송 래핑 - 에러 제어를 위해
      chrome.runtime.sendMessage = function(...args) {
        try {
          const lastArg = args[args.length - 1];
          const hasCallback = typeof lastArg === 'function';
          
          // 콜백이 있는 경우 래핑하여 lastError를 항상 처리
          if (hasCallback) {
            const originalCallback = args.pop();
            const wrappedCallback = function(...callbackArgs) {
              try {
                // lastError가 있는지 확인하여 자동으로 소비
                if (chrome.runtime.lastError) {
                  console.debug('Chrome runtime.lastError detected and handled:', chrome.runtime.lastError.message);
                }
                return originalCallback.apply(this, callbackArgs);
              } catch (err) {
                console.debug('Error in message callback:', err);
                return undefined;
              }
            };
            args.push(wrappedCallback);
          }
          
          // 원래 sendMessage 호출
          return originalSendMessage.apply(chrome.runtime, args);
        } catch (err) {
          console.debug('Error wrapping chrome.runtime.sendMessage:', err);
          return undefined;
        }
      };
    }
  }
  
  /**
   * 모니터링 시작
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // 낮은 우선순위로 요청하여 성능 영향 최소화
    this._scheduleFpsCheck();
    this._startFrameCounter();
    
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.performanceIssues = [];
    
    // FPS 모니터링 시작
    if (this.fpsMonitor) {
      this.fpsMonitor.start();
    }
    
    // 메모리 모니터링 시작
    if (this.memoryMonitor) {
      this.memoryMonitor.start();
    }
    
    // 리소스 로딩 모니터링
    if (this.options.monitorResources) {
      this._scheduleResourceMonitoring();
    }
    
    // 컴포넌트 성능 모니터링
    if (this.options.monitorComponents) {
      this._scheduleComponentMonitoring();
    }
    
    // 레이아웃 스래싱 감지
    if (this.options.detectLayoutThrashing) {
      layoutMonitor.startMonitoring();
    }
    
    console.log('성능 모니터링 시작됨');
    return this;
  }
  
  /**
   * 모니터링 중지
   */
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    clearTimeout(this.fpsCheckTimer);
    cancelAnimationFrame(this.rafId);
    
    this.isMonitoring = false;
    
    // FPS 모니터링 중지
    if (this.fpsMonitor) {
      this.fpsMonitor.stop();
    }
    
    // 메모리 모니터링 중지
    if (this.memoryMonitor) {
      this.memoryMonitor.stop();
    }
    
    // 리소스 로딩 모니터링 중지
    if (this.options.monitorResources) {
      this._stopResourceMonitoring();
    }
    
    // 컴포넌트 성능 모니터링 중지
    if (this.options.monitorComponents) {
      this._stopComponentMonitoring();
    }
    
    // 레이아웃 스래싱 감지 중지
    if (this.options.detectLayoutThrashing) {
      layoutMonitor.stopMonitoring();
    }
    
    // 최종 보고서 생성
    this._generateFinalReport();
    
    console.log('성능 모니터링 중지됨');
    return this;
  }
  
  /**
   * 리소스 로딩 모니터링 스케줄링
   * @private
   */
  _scheduleResourceMonitoring() {
    // 페이지 로드 완료 후 리소스 모니터링
    window.addEventListener('load', () => {
      // 조금 지연 후 실행 (모든 리소스가 로드되도록)
      setTimeout(() => {
        monitorResourceLoading(resourceStats => {
          this._processResourceStats(resourceStats);
        });
      }, 2000);
    });
  }
  
  /**
   * 컴포넌트 성능 모니터링 스케줄링
   * @private
   */
  _scheduleComponentMonitoring() {
    // 주기적으로 컴포넌트 성능 수집
    this.componentMonitoringInterval = setInterval(() => {
      this._collectComponentPerformanceStats();
    }, 5000);
  }
  
  /**
   * Long Task 감지 설정
   * @private
   */
  _setupLongTaskObserver() {
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            // Long Task 발생 시 로깅
            const issue = {
              type: 'long-task',
              duration: entry.duration,
              startTime: entry.startTime,
              timestamp: Date.now(),
              detail: entry
            };
            
            this.performanceIssues.push(issue);
            
            if (this.options.logToConsole) {
              console.warn(`긴 작업 감지됨: ${entry.duration.toFixed(2)}ms`, entry);
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        this.longTaskObserver = observer;
      }
    } catch (error) {
      console.warn('Long Task 감지를 지원하지 않습니다.', error);
    }
  }
  
  /**
   * 탭 가시성 변경 감지 리스너 설정
   * @private
   */
  _setupVisibilityChangeListener() {
    document.addEventListener('visibilitychange', () => {
      this.isTabActive = document.visibilityState === 'visible';
      
      if (this.isTabActive) {
        console.log('탭이 활성화되었습니다. 성능 모니터링 재개.');
        // 탭이 다시 활성화되었을 때 카운터 재설정
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
      } else {
        console.log('탭이 비활성화되었습니다. 성능 모니터링 일시 중지.');
      }
    });
  }
  
  /**
   * FPS 업데이트 처리
   * @param {number} fps - 현재 FPS
   * @private
   */
  _handleFPSUpdate(fps) {
    // 탭이 비활성화 상태이고 옵션에서 비활성 탭 무시가 활성화된 경우 경고 표시하지 않음
    if (!this.isTabActive && this.options.ignoreInactiveTab) {
      return;
    }
    
    // 0 FPS는 탭이 백그라운드에 있을 가능성이 높음 - 경고로 처리하지 않음
    if (fps === 0) {
      return;
    }
    
    if (fps < this.options.fpsWarningThreshold) {
      const issue = {
        type: 'low-fps',
        fps,
        timestamp: Date.now()
      };
      
      this.performanceIssues.push(issue);
      
      if (this.options.logToConsole) {
        console.warn(`낮은 FPS 감지됨: ${fps} FPS`);
      }
    }
    
    // 사용자 정의 이벤트 발생
    this._dispatchPerformanceEvent('fps-update', { fps });
  }
  
  /**
   * 메모리 업데이트 처리
   * @param {Object} memoryUsage - 메모리 사용량 정보
   * @param {Object} flags - 경고 플래그
   * @private
   */
  _handleMemoryUpdate(memoryUsage, { isLeaking, isHighUsage }) {
    if (isLeaking || isHighUsage) {
      const issue = {
        type: isLeaking ? 'memory-leak' : 'high-memory-usage',
        memoryUsage,
        timestamp: Date.now()
      };
      
      this.performanceIssues.push(issue);
      
      if (this.options.logToConsole) {
        if (isLeaking) {
          console.warn('메모리 누수 감지됨');
        }
        
        if (isHighUsage) {
          console.warn(`높은 메모리 사용량: ${(memoryUsage.usagePercentage * 100).toFixed(2)}%`);
        }
      }
    }
    
    // 사용자 정의 이벤트 발생
    this._dispatchPerformanceEvent('memory-update', { memoryUsage });
  }
  
  /**
   * 리소스 통계 처리
   * @param {Object} resourceStats - 리소스 로딩 통계
   * @private
   */
  _processResourceStats(resourceStats) {
    // 큰 리소스 검사
    const largeResources = resourceStats.resourceStats.filter(
      stat => stat.size > 500 * 1024 // 500KB 이상
    );
    
    if (largeResources.length > 0) {
      const issue = {
        type: 'large-resources',
        resources: largeResources,
        timestamp: Date.now()
      };
      
      this.performanceIssues.push(issue);
      
      if (this.options.logToConsole) {
        console.warn(`큰 리소스 감지됨: ${largeResources.length}개의 리소스가 500KB 이상입니다.`);
        console.table(largeResources.map(r => ({
          이름: r.name,
          크기: `${(r.size / 1024).toFixed(2)}KB`,
          유형: r.type
        })));
      }
    }
    
    // 느린 리소스 검사
    const slowResources = resourceStats.resourceStats.filter(
      stat => stat.duration > 1000 // 1초 이상
    );
    
    if (slowResources.length > 0) {
      const issue = {
        type: 'slow-resources',
        resources: slowResources,
        timestamp: Date.now()
      };
      
      this.performanceIssues.push(issue);
      
      if (this.options.logToConsole) {
        console.warn(`느린 리소스 로딩 감지됨: ${slowResources.length}개의 리소스가 1초 이상 걸렸습니다.`);
        console.table(slowResources.map(r => ({
          이름: r.name,
          로딩시간: `${r.duration.toFixed(2)}ms`,
          유형: r.type
        })));
      }
    }
    
    // 사용자 정의 이벤트 발생
    this._dispatchPerformanceEvent('resources-loaded', { resourceStats });
  }
  
  /**
   * 컴포넌트 성능 통계 수집
   * @private
   */
  _collectComponentPerformanceStats() {
    // DOM에서 모든 커스텀 요소 찾기
    const customElements = document.querySelectorAll('*');
    let newSlowComponents = [];
    
    for (const element of customElements) {
      // BaseComponent 인스턴스를 찾음
      if (element.getPerformanceStats) {
        try {
          const stats = element.getPerformanceStats();
          
          // 성능 통계 저장
          this.componentStats.set(element, stats);
          
          // 느린 컴포넌트 감지
          if (stats.averageRenderTime > this.options.warningThresholds.renderTime) {
            newSlowComponents.push({
              element,
              stats
            });
          }
        } catch (error) {
          console.error('컴포넌트 성능 통계 수집 중 오류:', error);
        }
      }
    }
    
    // 새로운 느린 컴포넌트가 있는 경우
    if (newSlowComponents.length > 0) {
      this.slowComponents = [...newSlowComponents];
      
      const issue = {
        type: 'slow-components',
        components: newSlowComponents.map(item => ({
          componentName: item.stats.componentName,
          averageRenderTime: item.stats.averageRenderTime,
          renderCount: item.stats.renderCount
        })),
        timestamp: Date.now()
      };
      
      this.performanceIssues.push(issue);
      
      if (this.options.logToConsole) {
        console.warn(`느린 컴포넌트 감지됨: ${newSlowComponents.length}개`);
        console.table(newSlowComponents.map(item => ({
          컴포넌트: item.stats.componentName,
          평균렌더링시간: `${item.stats.averageRenderTime.toFixed(2)}ms`,
          렌더링횟수: item.stats.renderCount
        })));
      }
      
      // 사용자 정의 이벤트 발생
      this._dispatchPerformanceEvent('slow-components-detected', { 
        components: newSlowComponents 
      });
    }
  }
  
  /**
   * 최종 성능 보고서 생성
   * @private
   */
  _generateFinalReport() {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;
    
    // 성능 이슈 요약
    const issues = {
      lowFPS: this.performanceIssues.filter(issue => issue.type === 'low-fps').length,
      memoryIssues: this.performanceIssues.filter(issue => 
        issue.type === 'memory-leak' || issue.type === 'high-memory-usage'
      ).length,
      longTasks: this.performanceIssues.filter(issue => issue.type === 'long-task').length,
      slowComponents: this.slowComponents.length,
      resourceIssues: this.performanceIssues.filter(issue => 
        issue.type === 'large-resources' || issue.type === 'slow-resources'
      ).length
    };
    
    // 최종 보고서
    const report = {
      duration: totalDuration,
      issues,
      components: Array.from(this.componentStats.values()),
      slowComponents: this.slowComponents.map(item => item.stats),
      allIssues: this.performanceIssues
    };
    
    // 콘솔에 출력
    if (this.options.logToConsole) {
      console.group('성능 모니터링 보고서');
      console.log(`모니터링 기간: ${(totalDuration / 1000).toFixed(2)}초`);
      
      console.group('성능 이슈 요약');
      console.log(`낮은 FPS 발생: ${issues.lowFPS}회`);
      console.log(`메모리 관련 이슈: ${issues.memoryIssues}회`);
      console.log(`긴 작업 감지: ${issues.longTasks}회`);
      console.log(`느린 컴포넌트: ${issues.slowComponents}개`);
      console.log(`리소스 이슈: ${issues.resourceIssues}개`);
      console.groupEnd();
      
      if (this.slowComponents.length > 0) {
        console.group('느린 컴포넌트 목록');
        console.table(this.slowComponents.map(item => ({
          컴포넌트: item.stats.componentName,
          평균렌더링시간: `${item.stats.averageRenderTime.toFixed(2)}ms`,
          렌더링횟수: item.stats.renderCount
        })));
        console.groupEnd();
      }
      
      console.groupEnd();
    }
    
    // 사용자 정의 이벤트 발생
    this._dispatchPerformanceEvent('report-generated', { report });
    
    return report;
  }
  
  /**
   * 성능 이벤트 발생
   * @param {string} eventName - 이벤트 이름
   * @param {Object} data - 이벤트 데이터
   * @private
   */
  _dispatchPerformanceEvent(eventName, data) {
    const event = new CustomEvent(`performance:${eventName}`, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * 컴포넌트별 성능 통계 가져오기
   * @returns {Array} 컴포넌트 성능 통계 배열
   */
  getComponentStats() {
    return Array.from(this.componentStats.values());
  }
  
  /**
   * 성능 이슈 목록 가져오기
   * @returns {Array} 성능 이슈 배열
   */
  getPerformanceIssues() {
    return [...this.performanceIssues];
  }
  
  /**
   * 느린 컴포넌트 목록 가져오기
   * @returns {Array} 느린 컴포넌트 배열
   */
  getSlowComponents() {
    return [...this.slowComponents];
  }
  
  _startFrameCounter() {
    const countFrame = () => {
      if (!this.isActive) return;
      
      this.frameCount++;
      this.rafId = requestAnimationFrame(countFrame);
    };
    
    this.rafId = requestAnimationFrame(countFrame);
  }
  
  _scheduleFpsCheck() {
    this.fpsCheckTimer = setTimeout(() => {
      if (!this.isActive) return;
      
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;
      
      if (elapsed > 0) {
        const currentFps = Math.round(this.frameCount * 1000 / elapsed);
        
        // 탭이 비활성화 상태이거나 FPS가 0인 경우는 무시
        const shouldIgnore = 
          (!this.isTabActive && this.options.ignoreInactiveTab) || 
          currentFps === 0;
        
        // 낮은 FPS만 기록
        if (currentFps < this.options.fpsWarningThreshold && !shouldIgnore) {
          this.fpsHistory.push({ 
            timestamp: now, 
            fps: currentFps 
          });
          
          // 낮은 FPS 경고
          console.warn(`낮은 FPS 감지됨: ${currentFps} FPS`);
          
          // 사용자 정의 이벤트 발생 (디버깅용)
          const fpsDrop = new CustomEvent('fps-drop', { 
            detail: { fps: currentFps, timestamp: now }
          });
          document.dispatchEvent(fpsDrop);
        }
      }
      
      // 카운터 재설정
      this.frameCount = 0;
      this.lastFrameTime = now;
      
      // 다음 체크 스케줄링 (낮은 우선순위로)
      this._scheduleFpsCheck();
    }, this.options.fpsCheckInterval);
  }
  
  getFpsData() {
    return {
      current: this.getCurrentFps(),
      history: [...this.fpsHistory],
      average: this.getAverageFps()
    };
  }
  
  getCurrentFps() {
    if (!this.isActive || this.fpsHistory.length === 0) return 60;
    return this.fpsHistory[this.fpsHistory.length - 1].fps;
  }
  
  getAverageFps() {
    if (!this.isActive || this.fpsHistory.length === 0) return 60;
    
    const total = this.fpsHistory.reduce((sum, entry) => sum + entry.fps, 0);
    return Math.round(total / this.fpsHistory.length);
  }
  
  // 높은 CPU/메모리 사용 컴포넌트 감지 (축소된 버전)
  detectPerformanceIssues() {
    // 성능 영향 때문에 필요할 때만 사용하도록 축소된 구현
    console.warn('현재 detectPerformanceIssues 호출은 비활성화된 상태입니다.');
    return [];
  }
}

// 싱글톤 인스턴스
const performanceMonitor = new PerformanceMonitor();

// 이미 생성된 인스턴스가 있는지 확인하여 중복 인스턴스 방지
if (!window.__PERFORMANCE_MONITOR_INITIALIZED__) {
  // 개발 모드에서 자동 시작
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('DOMContentLoaded', () => {
      // 성능 모니터 시작 전 초기화 여부 확인
      if (!window.__PERFORMANCE_MONITOR_INITIALIZED__) {
        performanceMonitor.start();
        window.__PERFORMANCE_MONITOR_INITIALIZED__ = true;
        
        // 개발자 콘솔에서 접근할 수 있도록 전역 객체에 추가
        window.__PERFORMANCE_MONITOR__ = performanceMonitor;
        
        console.log('성능 모니터링 시작됨 (싱글톤 인스턴스)');
      }
    });
  }
}

export { PerformanceMonitor };
export default performanceMonitor; 