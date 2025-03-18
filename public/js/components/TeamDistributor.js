import { BaseComponent } from './BaseComponent.js';
import store from '../store/index.js';

/**
 * 메인 컴포넌트
 * 애플리케이션의 루트 컴포넌트입니다.
 * @extends BaseComponent
 */
export class TeamDistributor extends BaseComponent {
  constructor() {
    super({
      useShadow: true
    });
    this.unsubscribe = null;
  }

  initialize() {
    // 스토어 구독 설정이 필요한 경우 여기에 추가
  }
  
  cleanup() {
    // BaseComponent의 disconnectedCallback에서 자동으로 호출됨
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    console.time("TeamDistributor Render");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: var(--nav-width) var(--main-width) var(--sidebar-width);
          gap: 1px;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-dark-1);
          max-width: 100vw;
        }
      </style>
      <nav-component></nav-component>
      <main-panel></main-panel>
      <form-panel></form-panel>
    `;
    console.timeEnd("TeamDistributor Render");
  }
} 