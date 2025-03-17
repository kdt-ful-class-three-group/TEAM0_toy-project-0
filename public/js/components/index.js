import { NavComponent } from './NavComponent.js';
import { MemberList } from './MemberList.js';
import { TeamDistributor } from './TeamDistributor.js';

// 폼 컴포넌트 임포트
import { TeamConfig } from './form/TeamConfig.js';
import { TotalMembersConfig } from './form/TotalMembersConfig.js';
import { MemberInput } from './form/MemberInput.js';
import { TeamResult } from './form/TeamResult.js';
import { FormPanel } from './form/FormPanel.js';
import { MainPanel } from './form/MainPanel.js';

/**
 * @function registerComponents
 * @description 모든 Web Component를 등록합니다.
 */
export function registerComponents() {
  console.trace("checkpoint - Web Component 등록 시작");

  // 기존 컴포넌트 등록
  customElements.define("nav-component", NavComponent);
  customElements.define("member-list", MemberList);
  customElements.define("team-distributor", TeamDistributor);
  
  // 새 폼 컴포넌트 등록
  customElements.define("team-config", TeamConfig);
  customElements.define("total-members-config", TotalMembersConfig);
  customElements.define("member-input", MemberInput);
  customElements.define("team-result", TeamResult);
  customElements.define("form-panel", FormPanel);
  customElements.define("main-panel", MainPanel);

  console.info("모든 웹 컴포넌트 등록 완료");
} 