/**
 * @file components/index.js
 * @description 모든 웹 컴포넌트를 등록하는 중앙 모듈입니다.
 * @version 1.1.0
 * @author Team0
 */

import { BaseComponent } from './BaseComponent.js';
import { NavComponent } from './NavComponent.js';
import { MemberList } from './MemberList.js';
import { TeamDistributor } from './TeamDistributor.js';
import eventBus from '../utils/EventBus.js';

// 폼 컴포넌트 임포트
import { TeamConfig } from './form/TeamConfig.js';
import { TotalMembersConfig } from './form/TotalMembersConfig.js';
import { MemberInput } from './form/MemberInput.js';
import { TeamResult } from './form/TeamResult.js';
import { FormPanel } from './form/FormPanel.js';
import { MainPanel } from './form/MainPanel.js';

// 데모 컴포넌트 임포트
import StoreDemo from './demo/StoreDemo.js';

/**
 * 컴포넌트 정의 목록입니다.
 * { name: 커스텀 요소 이름, constructor: 컴포넌트 클래스 } 형태로 정의합니다.
 * @type {Array<{name: string, constructor: CustomElementConstructor}>}
 */
const COMPONENTS = [
  { name: "nav-component", constructor: NavComponent },
  { name: "member-list", constructor: MemberList },
  { name: "team-distributor", constructor: TeamDistributor },
  { name: "team-config", constructor: TeamConfig },
  { name: "total-members-config", constructor: TotalMembersConfig },
  { name: "member-input", constructor: MemberInput },
  { name: "team-result", constructor: TeamResult },
  { name: "form-panel", constructor: FormPanel },
  { name: "main-panel", constructor: MainPanel },
  { name: "store-demo", constructor: StoreDemo }
];

/**
 * @function registerComponents
 * @description 모든 Web Component를 등록합니다.
 * @returns {Object} 등록 결과 (성공 및 실패 목록)
 */
export function registerComponents() {
  console.time('registerComponents');
  
  const registeredComponents = [];
  const failedComponents = [];
  
  // 컴포넌트 등록
  COMPONENTS.forEach(({ name, constructor }) => {
    try {
      if (!customElements.get(name)) {
        customElements.define(name, constructor);
        registeredComponents.push(name);
        console.debug(`컴포넌트 등록: ${name}`);
      } else {
        console.warn(`컴포넌트가 이미 등록되어 있습니다: ${name}`);
      }
    } catch (error) {
      console.error(`컴포넌트 등록 실패: ${name}`, error);
      failedComponents.push({ name, error: error.message });
    }
  });
  
  console.timeEnd('registerComponents');
  console.info("모든 웹 컴포넌트 등록 완료");
  
  // 컴포넌트 등록 결과 이벤트 발행
  eventBus.emit('components:registered', { 
    registered: registeredComponents,
    failed: failedComponents,
    timestamp: Date.now()
  });
  
  return {
    registered: registeredComponents,
    failed: failedComponents
  };
}

/**
 * 특정 컴포넌트만 등록합니다.
 * @function registerComponent
 * @param {string} name - 등록할 컴포넌트 이름
 * @returns {boolean} 등록 성공 여부
 */
export function registerComponent(name) {
  const componentDef = COMPONENTS.find(comp => comp.name === name);
  
  if (!componentDef) {
    console.error(`등록되지 않은 컴포넌트: ${name}`);
    return false;
  }
  
  if (customElements.get(name)) {
    console.warn(`컴포넌트가 이미 등록되어 있습니다: ${name}`);
    return true;
  }
  
  try {
    customElements.define(name, componentDef.constructor);
    eventBus.emit('component:registered', { name, timestamp: Date.now() });
    return true;
  } catch (error) {
    console.error(`컴포넌트 등록 실패: ${name}`, error);
    return false;
  }
}

/**
 * 등록된 모든 컴포넌트 목록을 반환합니다.
 * @function getRegisteredComponents
 * @returns {Array<string>} 등록된 컴포넌트 이름 목록
 */
export function getRegisteredComponents() {
  return COMPONENTS
    .map(comp => comp.name)
    .filter(name => customElements.get(name));
}

// BaseComponent 클래스 내보내기
export { BaseComponent }; 