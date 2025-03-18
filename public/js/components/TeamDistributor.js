import { BaseComponent } from './BaseComponent.js';
import store from '../store/index.js';
import { teamDistributorStyles } from '../styles/componentStyles.js';

/**
 * 메인 컴포넌트
 * 애플리케이션의 루트 컴포넌트입니다.
 * @extends BaseComponent
 */
export class TeamDistributor extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      styleSheet: null,
      styles: teamDistributorStyles,
      useCommonStyles: false,
      useUtilityStyles: false
    });
    this.unsubscribe = null;
  }

  initialize() {
    // 스토어 구독 설정이 필요한 경우 여기에 추가
    
    // Shadow DOM 안에 슬롯 생성을 위한 준비
    const container = document.createElement('div');
    container.className = 'team-distributor-container';
    this.shadowRoot.appendChild(container);
  }
  
  cleanup() {
    // BaseComponent의 disconnectedCallback에서 자동으로 호출됨
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    console.time("TeamDistributor Render");
    
    // Shadow DOM 내부에서 슬롯을 사용하여 내부 컴포넌트를 Light DOM으로 표시
    const container = this.shadowRoot.querySelector('.team-distributor-container');
    if (container) {
      container.innerHTML = `
        <div class="team-distributor-layout">
          <slot name="nav"></slot>
          <slot name="main"></slot>
          <slot name="form"></slot>
        </div>
      `;
      
      // 외부 DOM에 실제 컴포넌트 생성 (Light DOM)
      if (!this.querySelector('[slot="nav"]')) {
        const nav = document.createElement('nav-component');
        nav.setAttribute('slot', 'nav');
        this.appendChild(nav);
        
        const main = document.createElement('main-panel');
        main.setAttribute('slot', 'main');
        this.appendChild(main);
        
        const form = document.createElement('form-panel');
        form.setAttribute('slot', 'form');
        this.appendChild(form);
      }
    }
    
    console.timeEnd("TeamDistributor Render");
  }
} 