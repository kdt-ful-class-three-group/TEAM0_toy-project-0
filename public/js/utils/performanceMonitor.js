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
      monitorFPS: true,            // FPS 모니터링 여부
      monitorMemory: true,         // 메모리 사용량 모니터링 여부
      monitorResources: true,      // 리소스 로딩 모니터링 여부
      monitorComponents: true,     // 컴포넌트 성능 모니터링 여부
      detectLayoutThrashing: true, // 레이아웃 스래싱 감지 여부
      logToConsole: true,          // 콘솔 출력 여부
      warningThresholds: {
        fps: 30,                   // FPS 경고 임계값
        memoryUsage: 0.8,          // 메모리 사용량 경고 임계값 (80%)
        renderTime: 16.67          // 렌더링 시간 경고 임계값 (16.67ms = 60fps)
      },
      ...options
    };
    
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
  
  /**
   * 모니터링 시작
   */
  start() {
    if (this.isMonitoring) return;
    
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
    
    console.info('성능 모니터링 시작됨');
  }
  
  /**
   * 모니터링 중지
   */
  stop() {
    if (!this.isMonitoring) return;
    
    // FPS 모니터링 중지
    if (this.fpsMonitor) {
      this.fpsMonitor.stop();
    }
    
    // 메모리 모니터링 중지
    if (this.memoryMonitor) {
      this.memoryMonitor.stop();
    }
    
    // 모니터링 상태 업데이트
    this.isMonitoring = false;
    
    // 최종 보고서 생성
    this._generateFinalReport();
    
    console.info('성능 모니터링 중지됨');
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
   * FPS 업데이트 처리
   * @param {number} fps - 현재 FPS
   * @private
   */
  _handleFPSUpdate(fps) {
    if (fps < this.options.warningThresholds.fps) {
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
}

// 싱글톤 인스턴스
const performanceMonitor = new PerformanceMonitor();

// 개발 모드에서 자동 시작
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('DOMContentLoaded', () => {
    performanceMonitor.start();
    
    // 개발자 콘솔에서 접근할 수 있도록 전역 객체에 추가
    window.__PERFORMANCE_MONITOR__ = performanceMonitor;
  });
}

export default performanceMonitor; 