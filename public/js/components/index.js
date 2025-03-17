import { NavComponent } from './NavComponent.js';
import { MemberList } from './MemberList.js';
import { InputForm } from './InputForm.js';
import { TeamDistributor } from './TeamDistributor.js';

/**
 * @function registerComponents
 * @description 모든 Web Component를 등록합니다.
 */
export function registerComponents() {
  console.trace("checkpoint - Web Component 등록 시작");

  customElements.define("nav-component", NavComponent);
  customElements.define("member-list", MemberList);
  customElements.define("input-form", InputForm);
  customElements.define("team-distributor", TeamDistributor);

  console.info("모든 웹 컴포넌트 등록 완료");
} 