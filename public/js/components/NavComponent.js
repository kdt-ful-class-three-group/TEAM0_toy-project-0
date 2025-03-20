import { BaseComponent } from './BaseComponent.js';
import { renderNavigator } from '../renderers/index.js';
import { navStyles } from '../design/componentStyles.js';

/**
 * 네비게이터 컴포넌트
 * 왼쪽 네비게이션 영역을 표시합니다.
 * @class NavComponent
 * @extends BaseComponent
 */
export class NavComponent extends BaseComponent {
  /**
   * 컴포넌트 생성자
   */
  constructor() {
    super({
      useShadow: true,
      // 스타일 모듈 사용
      styles: navStyles,
      useCommonStyles: true,
      useUtilityStyles: true
    });
    this._container = null;
  }
  
  /**
   * 컴포넌트를 초기화합니다.
   * @protected
   */
  initialize() {
    // 컨텐츠 컨테이너 생성
    this._container = document.createElement('div');
    this._container.className = 'nav-container';
    
    // 그림자 DOM에 추가
    this.shadowRoot.appendChild(this._container);
  }
  
  /**
   * 컴포넌트 콘텐츠를 렌더링합니다.
   * @protected
   */
  render() {
    this._container.innerHTML = `
      <div class="nav">
        <div class="nav__section nav__section--bottom">
          <div class="nav__version">
            <small>버전 1.0.1</small>
          </div>
        </div>
      </div>
    `;
  }
} 