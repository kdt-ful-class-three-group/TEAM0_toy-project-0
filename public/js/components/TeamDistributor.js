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
      styles: teamDistributorStyles,
      useCommonStyles: false,
      useUtilityStyles: false,
      deferRender: true, // 최초 렌더링을 지연시켜 초기화 성능 개선
      optimizeUpdates: true // DOM 업데이트 최적화 활성화
    });
    
    // 상태 구독 초기화
    this.state = {
      isInitialized: false
    };
  }

  initialize() {
    console.time("TeamDistributor Init");
    
    // 스토어 구독 설정
    const unsubscribe = store.subscribe(state => {
      this.updateFromStore(state);
    });
    
    // 이벤트 구독 해제 자동화
    this.addUnsubscriber(unsubscribe);
    
    // Shadow DOM 안에 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'team-distributor-container';
    this.shadowRoot.appendChild(container);
    
    this.state.isInitialized = true;
    console.timeEnd("TeamDistributor Init");
  }
  
  updateFromStore(state) {
    // 상태 변경 시 특정 조건에 따라 렌더링 최적화
    // 실제 필요한 경우에만 리렌더링 실행
    if (this.shouldRerender(state)) {
      this.requestRender();
    }
  }
  
  // 불필요한 리렌더링 방지를 위한 메서드
  shouldRerender(newState) {
    // 현재는 항상 true 반환하지만, 필요에 따라 조건부 리렌더링 구현 가능
    return true;
  }
  
  // 렌더링 요청 (스로틀링 적용)
  requestRender() {
    if (this.options.renderThrottle > 0) {
      clearTimeout(this._renderTimer);
      this._renderTimer = setTimeout(() => this.render(), this.options.renderThrottle);
    } else {
      this.render();
    }
  }

  render() {
    console.time("TeamDistributor Render");
    
    // Shadow DOM 내부에서 슬롯을 사용하여 내부 컴포넌트를 Light DOM으로 표시
    const container = this.shadowRoot.querySelector('.team-distributor-container');
    if (!container) return;
    
    // 레이아웃 템플릿 업데이트
    container.innerHTML = `
      <div class="team-distributor-layout">
        <slot name="nav"></slot>
        <slot name="main"></slot>
        <slot name="form"></slot>
      </div>
    `;
    
    // 자식 컴포넌트가 없는 경우에만 생성
    this.createChildComponentsIfNeeded();
    
    console.timeEnd("TeamDistributor Render");
  }
  
  // 자식 컴포넌트 생성 메서드 분리 (관심사 분리)
  createChildComponentsIfNeeded() {
    if (!this.querySelector('[slot="nav"]')) {
      // 컴포넌트 생성을 함수로 분리하여 가독성 향상
      const createAndAppend = (tagName, slotName) => {
        const element = document.createElement(tagName);
        element.setAttribute('slot', slotName);
        this.appendChild(element);
        return element;
      };
      
      createAndAppend('nav-component', 'nav');
      createAndAppend('main-panel', 'main');
      createAndAppend('form-panel', 'form');
    }
  }
} 