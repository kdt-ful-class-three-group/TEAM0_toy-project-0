/**
 * @file themeManager.js
 * @description 테마 전환 기능을 관리하는 유틸리티
 */

/**
 * 테마 관리자 클래스
 * 다크/라이트 모드 전환 및 사용자 설정 저장을 처리합니다.
 */
export class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'app_theme_preference';
    this.THEME_DARK = 'theme-dark';
    this.THEME_LIGHT = 'theme-light';
  }
  
  /**
   * 테마 관리 시스템을 초기화합니다.
   */
  initialize() {
    // 저장된 사용자 설정이 있는지 확인
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme) {
      // 저장된 설정이 있으면 적용
      this.setTheme(savedTheme);
    } else {
      // 없으면 시스템 설정 확인
      this.setThemeBasedOnSystemPreference();
    }
    
    // 시스템 테마 변경 이벤트 리스너 등록
    this.listenToSystemThemeChanges();
  }
  
  /**
   * 특정 테마를 적용합니다.
   * @param {string} theme - 적용할 테마 ('theme-dark' 또는 'theme-light')
   */
  setTheme(theme) {
    document.documentElement.classList.remove(this.THEME_DARK, this.THEME_LIGHT);
    document.documentElement.classList.add(theme);
    
    // 로컬스토리지에 사용자 설정 저장
    localStorage.setItem(this.STORAGE_KEY, theme);
    
    // 테마 변경 이벤트 발생
    this.dispatchThemeChangeEvent(theme);
  }
  
  /**
   * 현재 시스템 설정(다크/라이트 모드)에 따라 테마를 설정합니다.
   */
  setThemeBasedOnSystemPreference() {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDarkMode ? this.THEME_DARK : this.THEME_LIGHT;
    this.setTheme(theme);
  }
  
  /**
   * 시스템 다크/라이트 모드 변경을 감지하는 이벤트 리스너를 등록합니다.
   */
  listenToSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 변경 이벤트 리스너 등록
    mediaQuery.addEventListener('change', (e) => {
      // 사용자가 명시적으로 테마를 설정하지 않은 경우에만 시스템 설정 따름
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        const theme = e.matches ? this.THEME_DARK : this.THEME_LIGHT;
        this.setTheme(theme);
      }
    });
  }
  
  /**
   * 현재 테마를 반대 테마로 전환합니다.
   */
  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains(this.THEME_DARK) 
      ? this.THEME_DARK 
      : this.THEME_LIGHT;
    const newTheme = currentTheme === this.THEME_DARK ? this.THEME_LIGHT : this.THEME_DARK;
    
    this.setTheme(newTheme);
  }
  
  /**
   * 저장된 테마 설정을 초기화하고 시스템 설정으로 되돌립니다.
   */
  resetToSystemPreference() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.setThemeBasedOnSystemPreference();
  }
  
  /**
   * 테마 변경 이벤트를 발생시킵니다.
   * @param {string} theme - 변경된 테마
   */
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', { 
      detail: { 
        theme, 
        isDark: theme === this.THEME_DARK 
      } 
    });
    document.dispatchEvent(event);
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const themeManager = new ThemeManager(); 