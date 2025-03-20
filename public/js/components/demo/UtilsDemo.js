/**
 * @file UtilsDemo.js
 * @description 유틸리티 함수 사용 예시를 보여주는 데모 컴포넌트
 */

import { BaseComponent } from '../BaseComponent.js';
import { 
  $, 
  $$, 
  createElement, 
  on, 
  delegate,
  pipe, 
  compose,
  deepClone,
  arrayPush,
  createStyledElement,
  animate
} from '../../utils/index.js';

/**
 * 유틸리티 데모 컴포넌트
 * 다양한 유틸리티 함수 사용법을 보여줍니다.
 */
export class UtilsDemo extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      styles: `
        :host {
          display: block;
          padding: 1rem;
          margin: 1rem;
          border: 1px solid var(--color-border, #333);
          border-radius: 0.5rem;
          background-color: var(--color-dark-3, #2d2d2d);
        }
        
        .demo-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: var(--color-text-primary, #fff);
        }
        
        .demo-section {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 0.25rem;
          background-color: var(--color-dark-2, #1e1e1e);
        }
        
        .demo-section-title {
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary, #fff);
        }
        
        .demo-items {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .demo-item {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: var(--color-dark-1, #121212);
          color: var(--color-text-secondary, #b3b3b3);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .demo-item:hover {
          background-color: var(--color-primary, #4a6e5a);
          color: white;
        }
        
        .demo-item.active {
          background-color: var(--color-primary, #4a6e5a);
          color: white;
        }
        
        .demo-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          background-color: var(--color-primary, #4a6e5a);
          color: white;
          cursor: pointer;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .demo-button:hover {
          opacity: 0.9;
        }
        
        .demo-result {
          margin-top: 1rem;
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: var(--color-dark-1, #121212);
          color: var(--color-text-secondary, #b3b3b3);
        }
      `
    });
    
    this.state = {
      items: ['항목 1', '항목 2', '항목 3'],
      activeIndex: -1,
      demoResult: ''
    };
  }
  
  initialize() {
    // 컨테이너 생성
    this.container = createElement('div', { className: 'utils-demo-container' });
    this.shadowRoot.appendChild(this.container);
  }
  
  render() {
    // DOM 생성 예시
    this.container.innerHTML = `
      <div class="demo-title">유틸리티 함수 데모</div>
      
      <div class="demo-section">
        <div class="demo-section-title">DOM 조작 유틸리티</div>
        <div class="demo-button-container">
          <button id="create-element-btn" class="demo-button">요소 생성</button>
          <button id="animate-btn" class="demo-button">애니메이션</button>
        </div>
        <div id="dom-result" class="demo-result"></div>
      </div>
      
      <div class="demo-section">
        <div class="demo-section-title">함수형 프로그래밍 유틸리티</div>
        <div class="demo-button-container">
          <button id="compose-btn" class="demo-button">Compose</button>
          <button id="pipe-btn" class="demo-button">Pipe</button>
        </div>
        <div id="fp-result" class="demo-result"></div>
      </div>
      
      <div class="demo-section">
        <div class="demo-section-title">불변성 유틸리티</div>
        <div class="demo-items" id="items-container">
          ${this.state.items.map((item, index) => `
            <div class="demo-item ${index === this.state.activeIndex ? 'active' : ''}" data-index="${index}">
              ${item}
            </div>
          `).join('')}
        </div>
        <div class="demo-button-container">
          <button id="add-item-btn" class="demo-button">항목 추가</button>
          <button id="clone-items-btn" class="demo-button">항목 복제</button>
        </div>
      </div>
      
      <div class="demo-section">
        <div class="demo-section-title">이벤트 유틸리티</div>
        <div class="demo-button-container">
          <button id="event-demo-btn" class="demo-button">이벤트 테스트</button>
        </div>
        <div id="event-result" class="demo-result"></div>
      </div>
    `;
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // DOM 조작 섹션 이벤트
    const createElementBtn = shadowQuery(this, '#create-element-btn');
    const animateBtn = shadowQuery(this, '#animate-btn');
    const domResult = shadowQuery(this, '#dom-result');
    
    if (createElementBtn) {
      on(createElementBtn, 'click', () => {
        // createStyledElement 유틸리티 사용 예시
        domResult.innerHTML = '';
        
        const card = createStyledElement('div', {
          className: 'demo-item',
          style: {
            padding: '10px',
            margin: '10px 0',
            backgroundColor: 'var(--color-primary, #4a6e5a)',
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          },
          textContent: '동적으로 생성된 요소',
          events: {
            click: () => {
              domResult.textContent = '카드가 클릭되었습니다!';
            }
          }
        });
        
        domResult.appendChild(card);
      });
    }
    
    if (animateBtn) {
      on(animateBtn, 'click', () => {
        const result = domResult.textContent;
        domResult.textContent = '';
        
        // animate 유틸리티 사용 예시
        const element = createStyledElement('div', {
          className: 'demo-item',
          textContent: '애니메이션 효과',
          style: {
            padding: '10px',
            backgroundColor: 'var(--color-primary, #4a6e5a)',
            color: 'white',
            borderRadius: '4px',
            opacity: '0'
          }
        });
        
        domResult.appendChild(element);
        
        animate(element, 'fadeIn', 500, () => {
          setTimeout(() => {
            animate(element, 'fadeOut', 500, () => {
              domResult.textContent = result;
            });
          }, 1000);
        });
      });
    }
    
    // 함수형 프로그래밍 섹션 이벤트
    const composeBtn = shadowQuery(this, '#compose-btn');
    const pipeBtn = shadowQuery(this, '#pipe-btn');
    const fpResult = shadowQuery(this, '#fp-result');
    
    if (composeBtn) {
      on(composeBtn, 'click', () => {
        // compose 유틸리티 사용 예시
        const double = x => x * 2;
        const addOne = x => x + 1;
        const square = x => x * x;
        
        const calculationByCompose = compose(square, addOne, double);
        const result = calculationByCompose(3); // square(addOne(double(3))) = 49
        
        fpResult.textContent = `Compose 결과: ${result} (3을 두 배로 만들고, 1을 더한 다음, 제곱)`;
      });
    }
    
    if (pipeBtn) {
      on(pipeBtn, 'click', () => {
        // pipe 유틸리티 사용 예시
        const double = x => x * 2;
        const addOne = x => x + 1;
        const square = x => x * x;
        
        const calculationByPipe = pipe(double, addOne, square);
        const result = calculationByPipe(3); // square(addOne(double(3))) = 49
        
        fpResult.textContent = `Pipe 결과: ${result} (3을 두 배로 만들고, 1을 더한 다음, 제곱)`;
      });
    }
    
    // 불변성 섹션 이벤트
    const itemsContainer = shadowQuery(this, '#items-container');
    const addItemBtn = shadowQuery(this, '#add-item-btn');
    const cloneItemsBtn = shadowQuery(this, '#clone-items-btn');
    
    if (itemsContainer) {
      // 이벤트 위임 사용 예시
      delegate(itemsContainer, 'click', '.demo-item', (e) => {
        const index = parseInt(e.delegateTarget.dataset.index, 10);
        this.updateState({ activeIndex: index });
      });
    }
    
    if (addItemBtn) {
      on(addItemBtn, 'click', () => {
        // arrayPush 불변 유틸리티 사용 예시
        const newItems = arrayPush(this.state.items, `항목 ${this.state.items.length + 1}`);
        this.updateState({ items: newItems });
      });
    }
    
    if (cloneItemsBtn) {
      on(cloneItemsBtn, 'click', () => {
        // deepClone 유틸리티 사용 예시
        const clonedItems = deepClone(this.state.items);
        clonedItems.reverse(); // 복제된 배열을 조작해도 원본에 영향 없음
        this.updateState({ items: clonedItems });
      });
    }
    
    // 이벤트 유틸리티 섹션
    const eventDemoBtn = shadowQuery(this, '#event-demo-btn');
    const eventResult = shadowQuery(this, '#event-result');
    
    if (eventDemoBtn && eventResult) {
      // once 유틸리티 사용 예시
      once(eventDemoBtn, 'click', () => {
        eventResult.textContent = '이 메시지는 한 번만 표시됩니다. 버튼을 다시 눌러도 반응하지 않습니다.';
      });
      
      // 일반 이벤트 리스너 (비교용)
      on(eventDemoBtn, 'mouseover', () => {
        if (!eventResult.textContent) {
          eventResult.textContent = '버튼 위에 마우스를 올렸습니다. 클릭해보세요.';
        }
      });
    }
  }
  
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  cleanup() {
    // 정리 로직
  }
}

// Web Component 정의
customElements.define('utils-demo', UtilsDemo); 