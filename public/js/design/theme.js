/**
 * @file theme.js
 * @description 애플리케이션의 테마 시스템 및 디자인 변수를 정의합니다.
 */

/**
 * 테마 변수
 * 애플리케이션 전반에서 사용되는 디자인 시스템 변수들
 */
export const themeVariables = {
  // 색상 시스템
  colors: {
    // 기본 색상
    background: {
      primary: '#121212',
      secondary: '#1a1a1a',
      tertiary: '#252525',
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      inactive: 'rgba(255, 255, 255, 0.3)'
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      focus: 'rgba(255, 255, 255, 0.2)'
    },
    accent: {
      primary: '#4a6e5a',
      secondary: '#3c5c4a',
      tertiary: 'rgba(74, 110, 90, 0.2)'
    },
    feedback: {
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#38bdf8'
    }
  },
  
  // 간격 및 크기
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  // 타이포그래피
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8
    }
  },
  
  // 레이아웃
  layout: {
    sidebarWidth: '320px',
    versionBarWidth: '150px',
    headerHeight: '60px',
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      round: '50%'
    }
  },
  
  // 그림자
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
  },
  
  // 애니메이션
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear'
    }
  },
  
  // z-index 레이어
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popup: 1400,
    tooltip: 1500
  }
};

/**
 * CSS 변수 생성
 * 테마 변수를 CSS 변수로 변환
 * @param {Object} variables - 변환할 변수 객체
 * @param {string} prefix - CSS 변수 접두사
 * @returns {string} CSS 변수 문자열
 */
const createCSSVariables = (variables, prefix = '') => {
  let cssVars = '';
  
  Object.entries(variables).forEach(([key, value]) => {
    const varName = prefix ? `${prefix}-${key}` : `--${key}`;
    
    if (typeof value === 'object') {
      cssVars += createCSSVariables(value, varName);
    } else {
      cssVars += `${varName}: ${value};\n`;
    }
  });
  
  return cssVars;
};

/**
 * 공통 스타일 정의
 * 애플리케이션 전체에서 사용되는 공통 스타일
 */
export const commonStyles = `
  /* 기본 스타일 */
  :host {
    font-family: var(--typography-fontFamily);
    color: var(--colors-text-primary);
    background-color: var(--colors-background-primary);
    box-sizing: border-box;
  }
  
  /* 버튼 스타일 */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--layout-borderRadius-md);
    font-size: var(--typography-fontSize-sm);
    font-weight: var(--typography-fontWeight-medium);
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: all var(--animation-duration-normal) var(--animation-timing-easeOut);
  }
  
  .btn--primary {
    background-color: var(--colors-accent-primary);
    color: var(--colors-text-primary);
  }
  
  .btn--primary:hover {
    background-color: var(--colors-accent-secondary);
  }
  
  .btn--secondary {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--colors-text-primary);
  }
  
  .btn--secondary:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  .btn--danger {
    background-color: rgba(239, 68, 68, 0.2);
    color: var(--colors-text-primary);
  }
  
  .btn--danger:hover {
    background-color: rgba(239, 68, 68, 0.3);
  }
  
  .btn--small {
    font-size: var(--typography-fontSize-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 입력 필드 스타일 */
  .input {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--colors-border-primary);
    border-radius: var(--layout-borderRadius-md);
    color: var(--colors-text-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--typography-fontSize-sm);
    transition: all var(--animation-duration-normal) var(--animation-timing-easeOut);
  }
  
  .input:focus {
    outline: none;
    border-color: var(--colors-accent-primary);
    box-shadow: 0 0 0 2px var(--colors-accent-tertiary);
  }
  
  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 카드 스타일 */
  .card {
    background-color: var(--colors-background-secondary);
    border-radius: var(--layout-borderRadius-md);
    overflow: hidden;
  }
  
  /* 애니메이션 */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
  
  .fade-in {
    animation: fadeIn var(--animation-duration-normal) var(--animation-timing-easeOut);
  }
  
  .fade-out {
    animation: fadeOut var(--animation-duration-normal) var(--animation-timing-easeOut);
  }
  
  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
`;

/**
 * 테마 CSS 변수 생성
 * 테마 변수를 CSS 변수로 변환하여 CSS 스타일 문자열 생성
 * @returns {string} CSS 스타일 문자열
 */
export const createThemeStyles = () => {
  const cssVariables = createCSSVariables(themeVariables);
  
  return `
    :host {
      ${cssVariables}
    }
    
    ${commonStyles}
  `;
};

/**
 * 테마 스타일을 문서에 적용
 * @param {string} [targetSelector=':root'] - 스타일을 적용할 대상 선택자
 */
export const applyThemeToDocument = (targetSelector = ':root') => {
  const cssVariables = createCSSVariables(themeVariables);
  
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-variables';
  styleElement.textContent = `
    ${targetSelector} {
      ${cssVariables}
    }
  `;
  
  // 이미 있는 경우 교체, 없으면 추가
  const existingStyle = document.getElementById('theme-variables');
  if (existingStyle) {
    existingStyle.replaceWith(styleElement);
  } else {
    document.head.appendChild(styleElement);
  }
};

// 테마 시스템 초기화 함수
export const initializeTheme = () => {
  applyThemeToDocument();
  console.log('테마 시스템이 초기화되었습니다.');
}; 