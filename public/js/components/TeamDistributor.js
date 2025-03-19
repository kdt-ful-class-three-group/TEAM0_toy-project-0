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
    
    // Shadow DOM 안에 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'team-distributor-container';
    this.shadowRoot.appendChild(container);
    
    // 레이아웃 템플릿 (3등분 세로 레이아웃으로 변경)
    container.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
        
        .team-distributor-layout {
          display: grid;
          grid-template-areas: 
            "version main config";
          grid-template-columns: 150px 1fr 320px;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: #121212;
        }
        
        .version-area {
          grid-area: version;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: rgba(0, 0, 0, 0.2);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
        }
        
        .version-info {
          font-size: 12px;
          opacity: 0.6;
        }
        
        .main-area {
          grid-area: main;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .config-area {
          grid-area: config;
          overflow-y: auto;
          background-color: rgba(0, 0, 0, 0.15);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        ::slotted([slot="main"]) {
          flex: 1;
          height: 100%;
          overflow-y: auto;
        }
        
        ::slotted([slot="form"]) {
          height: auto;
          overflow-y: visible;
        }
      </style>
      <div class="team-distributor-layout">
        <div class="version-area">
          <div class="app-name">Team Distributor</div>
          <div class="version-info">버전 1.0.1</div>
        </div>
        <div class="main-area">
          <slot name="main"></slot>
        </div>
        <div class="config-area">
          <slot name="form"></slot>
        </div>
      </div>
    `;
    
    // 스토어 구독 설정
    const unsubscribe = store.subscribe(state => {
      this.updateFromStore(state);
    });
    
    // 이벤트 구독 해제 자동화
    this.addUnsubscriber(unsubscribe);
    
    // 자식 컴포넌트 즉시 생성 - 초기화 시점에 생성
    console.log('TeamDistributor: 자식 컴포넌트 생성 시작');
    this.createChildComponents();
    
    this.state.isInitialized = true;
    console.timeEnd("TeamDistributor Init");
    
    // 명시적으로 자식 컴포넌트 확인 실행 (지연 적용)
    setTimeout(() => {
      console.log('TeamDistributor: 지연된 자식 컴포넌트 확인 실행');
      this.ensureChildComponents();
    }, 300);
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
    
    // 이미 초기화에서 생성했으므로 여기서는 간단히 자식 컴포넌트 확인만 수행
    this.ensureChildComponents();
    
    console.timeEnd("TeamDistributor Render");
    
    // 현재 Shadow DOM 내용 반환
    return this.shadowRoot.innerHTML;
  }
  
  // 자식 컴포넌트 생성 메서드
  createChildComponents() {
    // 컴포넌트 생성을 함수로 분리하여 가독성 향상
    const createAndAppend = (tagName, slotName) => {
      // 이미 존재하는지 확인
      if (this.querySelector(`[slot="${slotName}"]`)) {
        console.log(`TeamDistributor: ${tagName} 컴포넌트가 이미 존재함`);
        return;
      }
      
      const element = document.createElement(tagName);
      element.setAttribute('slot', slotName);
      this.appendChild(element);
      console.log(`TeamDistributor: ${tagName} 컴포넌트 생성됨`);
      return element;
    };
    
    // 네비게이션 컴포넌트 제거 (새 레이아웃에서는 사용하지 않음)
    // createAndAppend('nav-component', 'nav');
    
    // 메인 패널과 폼 패널 생성
    createAndAppend('main-panel', 'main');
    createAndAppend('form-panel', 'form');
  }

  // 자식 컴포넌트 존재 확인 및 생성
  ensureChildComponents() {
    // 각 슬롯별로 컴포넌트 확인하여 누락된 것만 생성
    const navComponent = this.querySelector('[slot="nav"]');
    const mainPanel = this.querySelector('[slot="main"]');
    const formPanel = this.querySelector('[slot="form"]');
    
    console.log('TeamDistributor: 자식 컴포넌트 확인', {
      navComponent: !!navComponent,
      mainPanel: !!mainPanel,
      formPanel: !!formPanel
    });
    
    if (!navComponent || !mainPanel || !formPanel) {
      console.log('TeamDistributor: 누락된 자식 컴포넌트 생성');
      this.createChildComponents();
    }
  }
} 