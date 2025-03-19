import fs from 'fs/promises';
import path from 'path';
import { isSafePath } from '../utils/validators.js';

/**
 * 정적 파일 모델 클래스
 */
export class StaticFileModel {
  /**
   * StaticFileModel 클래스의 새 인스턴스를 생성합니다.
   * @param {string} publicDir - 정적 파일 디렉토리 경로
   */
  constructor(publicDir) {
    this.publicDir = publicDir;
    // 파일 경로 캐시
    this.pathCache = new Map();
    // 파일 존재 여부 캐시
    this.existsCache = new Map();
    // 캐시 만료 시간 (밀리초)
    this.cacheTTL = 60 * 1000; // 1분
  }

  /**
   * 파일 내용을 비동기적으로 읽습니다.
   * @param {string} filePath - 파일 경로
   * @returns {Promise<Buffer>} 파일 내용
   */
  async getFile(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return content;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 파일 존재 여부를 비동기적으로 확인합니다.
   * @param {string} filePath - 확인할 파일 경로
   * @returns {Promise<boolean>} 파일 존재 여부
   */
  async fileExists(filePath) {
    // 캐시에서 결과 확인
    if (this.existsCache.has(filePath)) {
      const { exists, timestamp } = this.existsCache.get(filePath);
      // 캐시가 유효한지 확인
      if (Date.now() - timestamp < this.cacheTTL) {
        return exists;
      }
      // 만료된 캐시 항목 제거
      this.existsCache.delete(filePath);
    }

    try {
      await fs.access(filePath);
      // 결과를 캐시에 저장
      this.existsCache.set(filePath, {
        exists: true,
        timestamp: Date.now()
      });
      return true;
    } catch {
      // 결과를 캐시에 저장
      this.existsCache.set(filePath, {
        exists: false,
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * URL에 해당하는 파일 경로를 반환합니다.
   * @param {string} url - 요청 URL
   * @returns {Promise<string>} 실제 파일 경로
   * @throws {Error} 안전하지 않은 경로일 경우 오류 발생
   */
  async getFilePath(url) {
    // 경로 보안 검증
    if (!isSafePath(url)) {
      const error = new Error('안전하지 않은 경로입니다.');
      error.code = 'UNSAFE_PATH';
      throw error;
    }
    
    // 캐시에서 결과 확인
    if (this.pathCache.has(url)) {
      const { path: cachedPath, timestamp } = this.pathCache.get(url);
      // 캐시가 유효한지 확인
      if (Date.now() - timestamp < this.cacheTTL) {
        return cachedPath;
      }
      // 만료된 캐시 항목 제거
      this.pathCache.delete(url);
    }

    // URL 경로 정규화
    url = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(this.publicDir, url);
    
    // 파일 경로가 publicDir 외부로 접근하는지 확인
    const relativePath = path.relative(this.publicDir, filePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      const error = new Error('허용되지 않은 디렉토리 접근입니다.');
      error.code = 'UNAUTHORIZED_PATH';
      throw error;
    }
    
    if (!path.extname(filePath)) {
      const extensions = ['html', 'css', 'js'];
      for (const ext of extensions) {
        const testPath = `${filePath}.${ext}`;
        if (await this.fileExists(testPath)) {
          // 결과를 캐시에 저장
          this.pathCache.set(url, {
            path: testPath,
            timestamp: Date.now()
          });
          return testPath;
        }
      }
      
      if (url !== '/index.html') {
        const indexPath = path.join(this.publicDir, 'index.html');
        // 결과를 캐시에 저장
        this.pathCache.set(url, {
          path: indexPath,
          timestamp: Date.now()
        });
        return indexPath;
      }
    }
    
    // 결과를 캐시에 저장
    this.pathCache.set(url, {
      path: filePath,
      timestamp: Date.now()
    });
    return filePath;
  }

  /**
   * 캐시를 정리합니다. 서버 메모리 관리를 위해 주기적으로 호출할 수 있습니다.
   */
  clearCache() {
    const now = Date.now();
    
    // 만료된 경로 캐시 항목 제거
    for (const [key, { timestamp }] of this.pathCache.entries()) {
      if (now - timestamp >= this.cacheTTL) {
        this.pathCache.delete(key);
      }
    }
    
    // 만료된 존재 여부 캐시 항목 제거
    for (const [key, { timestamp }] of this.existsCache.entries()) {
      if (now - timestamp >= this.cacheTTL) {
        this.existsCache.delete(key);
      }
    }
  }
} 