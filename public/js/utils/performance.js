/**
 * 성능 최적화를 위한 유틸리티 함수 모음
 * @module performance
 */

/**
 * 깊은 동등성 비교 함수
 * 객체, 배열, 원시값의 내용을 비교합니다.
 * 
 * @param {*} a - 비교할 첫 번째 값
 * @param {*} b - 비교할 두 번째 값
 * @returns {boolean} 두 값이 동일한지 여부
 */
export const deepEqual = (a, b) => {
  // 원시값 또는 null/undefined 처리
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' && typeof b !== 'object') return a === b;
  
  // 객체 타입 체크
  if (a.constructor !== b.constructor) return false;
  
  // 배열 처리
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // 일반 객체 처리
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * 메모이제이션(캐싱) 기능을 제공하는 고차 함수
 * 같은 입력에 대해 함수를 반복 호출할 때 계산 결과를 캐싱하여 성능을 향상시킵니다.
 * 
 * @param {Function} fn - 메모이제이션할 함수
 * @param {Object} options - 메모이제이션 옵션
 * @param {number} options.maxSize - 캐시 최대 크기 (기본값: 100)
 * @param {boolean} options.debug - 디버그 로그 출력 여부 (기본값: false)
 * @returns {Function} 메모이제이션된 함수
 */
export const memoize = (fn, options = {}) => {
  const { 
    maxSize = 100, 
    debug = false 
  } = options;
  
  const cache = new Map();
  const keys = [];
  
  return function (...args) {
    // 이전 호출 찾기 (깊은 비교)
    let foundKey = null;
    let foundValue = null;
    
    try {
      // 배열이나 객체를 포함한 인자는 깊은 비교 필요
      const needsDeepComparison = args.some(arg => 
        arg !== null && typeof arg === 'object'
      );
      
      if (needsDeepComparison) {
        for (const key of keys) {
          try {
            const cachedArgs = JSON.parse(key);
            if (deepEqual(cachedArgs, args)) {
              foundKey = key;
              foundValue = cache.get(key);
              break;
            }
          } catch (e) {
            // JSON 파싱 에러는 무시하고 계속 진행
            continue;
          }
        }
      } else {
        // 원시 타입만 있는 경우 - 단순 문자열 비교
        const argsKey = JSON.stringify(args);
        if (cache.has(argsKey)) {
          foundKey = argsKey;
          foundValue = cache.get(argsKey);
        }
      }
    } catch (e) {
      console.error('메모이제이션 키 검색 중 오류:', e);
      
      // 에러가 발생한 경우 캐싱하지 않고 원본 함수 실행
      return fn.apply(this, args);
    }
    
    // 캐시에서 찾은 경우
    if (foundKey) {
      if (debug) console.log('메모이즈 캐시 히트!', args);
      
      // 캐시 순서 최적화 (최근 사용 항목을 앞으로 이동)
      const keyIndex = keys.indexOf(foundKey);
      if (keyIndex > 0) {
        keys.splice(keyIndex, 1);
        keys.unshift(foundKey);
      }
      
      return foundValue;
    }
    
    // 캐시에서 찾지 못한 경우, 새로 계산
    if (debug) console.log('메모이즈 캐시 미스!', args);
    
    const result = fn.apply(this, args);
    let newKey;
    
    try {
      newKey = JSON.stringify(args);
    } catch (e) {
      console.error('인자 직렬화 중 오류:', e);
      // 직렬화할 수 없는 경우 캐싱하지 않고 결과만 반환
      return result;
    }
    
    // 캐시 저장
    cache.set(newKey, result);
    keys.unshift(newKey);
    
    // 캐시 크기 제한 (LRU 방식)
    if (keys.length > maxSize) {
      const oldestKey = keys.pop();
      cache.delete(oldestKey);
    }
    
    return result;
  };
};

/**
 * 디바운스 함수
 * 연속적인 함수 호출을 지연시켜 마지막 호출만 실행되도록 합니다.
 * 
 * @param {Function} fn - 디바운스할 함수
 * @param {number} delay - 지연 시간(ms)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 쓰로틀 함수
 * 일정 시간 간격으로 함수 호출을 제한합니다.
 * 
 * @param {Function} fn - 쓰로틀할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function} 쓰로틀된 함수
 */
export const throttle = (fn, limit) => {
  let inThrottle = false;
  
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 성능 측정 유틸리티
 * 함수 실행 시간을 측정합니다.
 * 
 * @param {Function} fn - 측정할 함수
 * @param {string} [label] - 콘솔에 표시할 레이블
 * @returns {Function} 성능 측정 래퍼 함수
 */
export const measurePerformance = (fn, label = 'Performance') => {
  return function (...args) {
    console.time(label);
    const result = fn.apply(this, args);
    console.timeEnd(label);
    return result;
  };
};

/**
 * 프레임 레이트 측정 클래스
 * 애플리케이션의 FPS(초당 프레임 수)를 측정합니다.
 */
export class FPSMeter {
  constructor(options = {}) {
    this.options = {
      updateInterval: 1000, // 업데이트 간격 (ms)
      onUpdate: null,       // 업데이트 콜백
      logToConsole: true,   // 콘솔에 로깅 여부
      ...options
    };
    
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.isRunning = false;
    this.timerId = null;
  }
  
  /**
   * FPS 측정 시작
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    const updateFPS = () => {
      const now = performance.now();
      const elapsed = now - this.lastTime;
      
      // FPS 계산
      if (elapsed >= this.options.updateInterval) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        
        // 콜백 호출
        if (this.options.onUpdate) {
          this.options.onUpdate(this.fps);
        }
        
        // 콘솔에 로깅
        if (this.options.logToConsole) {
          console.log(`현재 FPS: ${this.fps}`);
        }
        
        // 리셋
        this.lastTime = now;
        this.frameCount = 0;
      }
      
      this.frameCount++;
      
      if (this.isRunning) {
        requestAnimationFrame(updateFPS);
      }
    };
    
    requestAnimationFrame(updateFPS);
  }
  
  /**
   * FPS 측정 중지
   */
  stop() {
    this.isRunning = false;
  }
  
  /**
   * 현재 FPS 값 반환
   */
  getFPS() {
    return this.fps;
  }
}

/**
 * 이미지 최적화 도구
 * 이미지 미리 로딩 및 지연 로딩
 */
export class ImageOptimizer {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }
  
  /**
   * 이미지를 메모리에 미리 로드합니다.
   * @param {string} src - 이미지 URL
   * @returns {Promise} 로딩 완료 시 해결되는 Promise
   */
  preload(src) {
    // 이미 캐시에 있는 경우
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src));
    }
    
    // 이미 로딩 중인 경우
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }
    
    // 새로 로딩
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.loadingPromises.delete(src);
        reject(error);
      };
      
      img.src = src;
    });
    
    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }
  
  /**
   * 여러 이미지를 병렬로 미리 로드합니다.
   * @param {Array<string>} sources - 이미지 URL 배열
   * @returns {Promise} 모든 이미지 로딩이 완료되면 해결되는 Promise
   */
  preloadMany(sources) {
    return Promise.all(sources.map(src => this.preload(src)));
  }
  
  /**
   * 캐시에서 이미지를 가져옵니다.
   * @param {string} src - 이미지 URL
   * @returns {Image|null} 이미지 객체 또는 null
   */
  getFromCache(src) {
    return this.cache.get(src) || null;
  }
  
  /**
   * 캐시를 비웁니다.
   */
  clearCache() {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const imageOptimizer = new ImageOptimizer();

/**
 * 메모리 사용량 모니터링 도구
 * (브라우저에서 사용 가능한 메모리 API를 활용)
 */
export class MemoryMonitor {
  constructor(options = {}) {
    this.options = {
      updateInterval: 5000, // 업데이트 간격 (ms)
      onUpdate: null,       // 업데이트 콜백
      logToConsole: true,   // 콘솔에 로깅 여부
      warnThreshold: 0.8,   // 경고 임계값 (사용 가능한 메모리의 %)
      ...options
    };
    
    this.isRunning = false;
    this.timerId = null;
    this.lastMemoryUsage = null;
    
    // 성능 모니터링 API 지원 확인
    this.hasMemoryAPI = 'memory' in performance;
  }
  
  /**
   * 현재 메모리 사용량 가져오기
   * @returns {Object|null} 메모리 사용량 정보 또는 null (API 지원하지 않는 경우)
   */
  getMemoryUsage() {
    if (!this.hasMemoryAPI) {
      if (this.options.logToConsole) {
        console.warn('이 브라우저는 메모리 사용량 API를 지원하지 않습니다.');
      }
      return null;
    }
    
    const memoryInfo = performance.memory;
    
    return {
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      usedJSHeapSize: memoryInfo.usedJSHeapSize,
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      usagePercentage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit,
      timestamp: Date.now()
    };
  }
  
  /**
   * 메모리 모니터링 시작
   * @returns {boolean} 시작 성공 여부
   */
  start() {
    if (this.isRunning || !this.hasMemoryAPI) return false;
    
    this.isRunning = true;
    this.lastMemoryUsage = this.getMemoryUsage();
    
    this.timerId = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      
      if (memoryUsage) {
        // 메모리 누수 감지 (지속적인 증가)
        const isLeaking = this.lastMemoryUsage && 
          memoryUsage.usedJSHeapSize > this.lastMemoryUsage.usedJSHeapSize * 1.1 &&
          memoryUsage.usedJSHeapSize - this.lastMemoryUsage.usedJSHeapSize > 5 * 1024 * 1024; // 5MB 이상 증가
        
        // 높은 메모리 사용량 감지
        const isHighUsage = memoryUsage.usagePercentage > this.options.warnThreshold;
        
        // 콜백 호출
        if (this.options.onUpdate) {
          this.options.onUpdate(memoryUsage, { isLeaking, isHighUsage });
        }
        
        // 콘솔에 로깅
        if (this.options.logToConsole) {
          console.log('메모리 사용량:', {
            used: `${(memoryUsage.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB`,
            total: `${(memoryUsage.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB`,
            percentage: `${(memoryUsage.usagePercentage * 100).toFixed(2)}%`
          });
          
          if (isLeaking) {
            console.warn('가능한 메모리 누수 감지됨! 메모리 사용량이 급증했습니다.');
          }
          
          if (isHighUsage) {
            console.warn(`높은 메모리 사용량: ${(memoryUsage.usagePercentage * 100).toFixed(2)}%`);
          }
        }
        
        this.lastMemoryUsage = memoryUsage;
      }
    }, this.options.updateInterval);
    
    return true;
  }
  
  /**
   * 메모리 모니터링 중지
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.timerId);
    this.isRunning = false;
    this.timerId = null;
  }
}

/**
 * 코드 실행 시간 프로파일링
 * 비용이 많이 드는 작업을 식별하는 데 도움이 됩니다.
 * @param {Function} fn - 프로파일링할 함수
 * @param {string} [label] - 프로파일 레이블
 * @param {number} [iterations=1] - 반복 횟수
 * @returns {Object} 실행 시간 통계
 */
export function profileExecution(fn, label = 'Execution time', iterations = 1) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // 통계 계산
  const total = times.reduce((sum, time) => sum + time, 0);
  const average = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  const stats = {
    label,
    iterations,
    total,
    average,
    min,
    max,
    times
  };
  
  console.table({
    [label]: {
      '총 실행 시간(ms)': total.toFixed(2),
      '평균 시간(ms)': average.toFixed(2),
      '최소 시간(ms)': min.toFixed(2),
      '최대 시간(ms)': max.toFixed(2),
      '반복 횟수': iterations
    }
  });
  
  return stats;
}

/**
 * 자원 로딩 성능 모니터링
 * 페이지 리소스 로딩 시간을 측정합니다.
 * @param {Function} [callback] - 결과를 받을 콜백 함수
 */
export function monitorResourceLoading(callback) {
  if (!window.performance || !window.performance.getEntriesByType) {
    console.warn('Resource Timing API가 지원되지 않습니다.');
    return;
  }
  
  // 현재까지 로드된 리소스 가져오기
  const resources = window.performance.getEntriesByType('resource');
  
  // 리소스별 로딩 시간 계산
  const resourceStats = resources.map(resource => {
    return {
      name: resource.name.split('/').pop() || resource.name,
      type: getResourceType(resource.name),
      startTime: resource.startTime,
      duration: resource.duration,
      size: resource.transferSize || 0,
      protocol: resource.nextHopProtocol
    };
  });
  
  // 리소스 유형별 통계
  const typeStats = {};
  resourceStats.forEach(stat => {
    if (!typeStats[stat.type]) {
      typeStats[stat.type] = {
        count: 0,
        totalDuration: 0,
        totalSize: 0,
        slowest: null,
        largest: null
      };
    }
    
    typeStats[stat.type].count++;
    typeStats[stat.type].totalDuration += stat.duration;
    typeStats[stat.type].totalSize += stat.size;
    
    // 가장 느린 리소스 업데이트
    if (!typeStats[stat.type].slowest || stat.duration > typeStats[stat.type].slowest.duration) {
      typeStats[stat.type].slowest = stat;
    }
    
    // 가장 큰 리소스 업데이트
    if (!typeStats[stat.type].largest || stat.size > typeStats[stat.type].largest.size) {
      typeStats[stat.type].largest = stat;
    }
  });
  
  // 콘솔에 통계 출력
  console.group('리소스 로딩 성능');
  console.log(`총 ${resourceStats.length}개의 리소스 로드됨`);
  
  for (const [type, stats] of Object.entries(typeStats)) {
    console.group(`${type} (${stats.count}개)`);
    console.log(`총 로딩 시간: ${stats.totalDuration.toFixed(2)}ms`);
    console.log(`평균 로딩 시간: ${(stats.totalDuration / stats.count).toFixed(2)}ms`);
    console.log(`총 크기: ${(stats.totalSize / 1024).toFixed(2)}KB`);
    
    if (stats.slowest) {
      console.log(`가장 느린 ${type}: ${stats.slowest.name} (${stats.slowest.duration.toFixed(2)}ms)`);
    }
    
    if (stats.largest) {
      console.log(`가장 큰 ${type}: ${stats.largest.name} (${(stats.largest.size / 1024).toFixed(2)}KB)`);
    }
    
    console.groupEnd();
  }
  
  console.groupEnd();
  
  // 콜백이 제공된 경우 결과 전달
  if (typeof callback === 'function') {
    callback({
      resourceStats,
      typeStats,
      totalCount: resourceStats.length,
      totalDuration: resourceStats.reduce((sum, stat) => sum + stat.duration, 0),
      totalSize: resourceStats.reduce((sum, stat) => sum + stat.size, 0)
    });
  }
}

/**
 * 리소스 URL에서 유형 추출
 * @param {string} url - 리소스 URL
 * @returns {string} 리소스 유형
 */
function getResourceType(url) {
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  
  if (/jpe?g|png|gif|svg|webp|ico/.test(ext)) return 'image';
  if (/js/.test(ext)) return 'script';
  if (/css/.test(ext)) return 'style';
  if (/woff2?|ttf|otf|eot/.test(ext)) return 'font';
  if (/json/.test(ext)) return 'json';
  
  return 'other';
}

/**
 * 레이아웃 스래싱 감지 및 방지
 * 짧은 시간 내에 여러 번의 레이아웃 강제 작업을 감지하고 최적화합니다.
 */
export class LayoutThrashingMonitor {
  constructor() {
    this.readOperations = [];
    this.writeOperations = [];
    this.isOptimizing = false;
    this.lastReadTime = 0;
    this.lastWriteTime = 0;
    this.originalMethods = this.captureDOMAPIs();
    this.thrashingEvents = [];
  }
  
  /**
   * DOM API 캡처 및 래핑
   * @returns {Object} 원본 DOM API 메소드
   */
  captureDOMAPIs() {
    // 읽기 작업 (레이아웃 계산 강제)
    const readAPIs = [
      'getBoundingClientRect',
      'getClientRects',
      'getComputedStyle',
      'innerHeight',
      'innerWidth',
      'offsetHeight',
      'offsetLeft',
      'offsetParent',
      'offsetTop',
      'offsetWidth',
      'scrollHeight',
      'scrollLeft',
      'scrollTop',
      'scrollWidth'
    ];
    
    // 쓰기 작업 (레이아웃 무효화)
    const writeAPIs = [
      'appendChild',
      'insertBefore',
      'removeChild',
      'replaceChild',
      'innerHTML',
      'innerText',
      'textContent',
      'width',
      'height',
      'style'
    ];
    
    return {
      readAPIs,
      writeAPIs
    };
  }
  
  /**
   * 레이아웃 스래싱 모니터링 시작
   */
  startMonitoring() {
    // 실제 환경에서는 DOM API를 패치하여 모니터링
    // 이 예제에서는 직접 API를 호출하여 사용
    console.log('Layout thrashing monitoring started');
    
    // 모니터링 시작 상태로 설정
    this.isMonitoring = true;
    
    // 매 5초마다 통계 기록
    this.monitoringInterval = setInterval(() => {
      if (this.thrashingEvents.length > 0) {
        console.warn(`${this.thrashingEvents.length}개의 레이아웃 스래싱 이벤트가 감지되었습니다.`);
      }
    }, 5000);
    
    return this;
  }
  
  /**
   * 읽기 작업 등록
   * @param {string} operation - 작업 내용
   */
  registerRead(operation) {
    const now = performance.now();
    
    if (this.writeOperations.length > 0 && now - this.lastWriteTime < 10) {
      this.logThrashing('읽기', operation);
    }
    
    this.readOperations.push({ operation, time: now });
    this.lastReadTime = now;
  }
  
  /**
   * 쓰기 작업 등록
   * @param {string} operation - 작업 내용
   */
  registerWrite(operation) {
    const now = performance.now();
    
    if (this.readOperations.length > 0 && now - this.lastReadTime < 10) {
      this.logThrashing('쓰기', operation);
    }
    
    this.writeOperations.push({ operation, time: now });
    this.lastWriteTime = now;
  }
  
  /**
   * 레이아웃 스래싱 이벤트 기록
   * @param {string} type - 작업 유형 (읽기/쓰기)
   * @param {string} operation - 작업 내용
   */
  logThrashing(type, operation) {
    const event = {
      type,
      operation,
      time: performance.now(),
      stack: new Error().stack
    };
    
    this.thrashingEvents.push(event);
    
    if (this.thrashingEvents.length <= 5) {
      console.warn(`레이아웃 스래싱 감지: ${type} 작업 "${operation}"이 이전 작업 직후에 실행됨`);
    } else if (this.thrashingEvents.length === 6) {
      console.warn('추가적인 레이아웃 스래싱 이벤트가 발생했습니다. 로그는 생략됩니다.');
    }
  }
  
  /**
   * 레이아웃 스래싱 이벤트 가져오기
   * @returns {Array} 스래싱 이벤트 배열
   */
  getThrashingEvents() {
    return [...this.thrashingEvents];
  }
  
  /**
   * 레이아웃 스래싱 방지를 위한 배치 작업
   * @param {Array} readFns - 읽기 작업 함수 배열
   * @param {Array} writeFns - 쓰기 작업 함수 배열
   * @returns {Object} 읽기 작업 결과와 쓰기 작업 결과
   */
  batchDOMOperations(readFns = [], writeFns = []) {
    // 1. 모든 읽기 작업 수행
    const readResults = readFns.map(fn => {
      this.registerRead(fn.name || '익명 읽기 함수');
      return fn();
    });
    
    // 2. 모든 쓰기 작업 수행
    const writeResults = writeFns.map(fn => {
      this.registerWrite(fn.name || '익명 쓰기 함수');
      return fn();
    });
    
    return {
      readResults,
      writeResults
    };
  }
}

// 싱글톤 인스턴스
export const layoutMonitor = new LayoutThrashingMonitor(); 